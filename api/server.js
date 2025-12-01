import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Initialize OpenAI client (optional - for AI processing)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ESM compatibility: __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma with PostgreSQL adapter
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate Priority Score (0-100) based on video metadata
 * Algorithm matches Python script: calculate_priority.py
 * 
 * - Views (30% weight) - 1M views = 30 pts
 * - Likes (20% weight) - 50K likes = 20 pts  
 * - Recency (30% weight) - newer = higher
 * - Engagement (20% weight) - likes/views ratio
 */
function calculatePriorityScore(views = 0, likes = 0, publishDate = null) {
  // Views score (max 30 points)
  const viewsScore = Math.min(30, (views / 1000000) * 30);
  
  // Likes score (max 20 points)
  const likesScore = Math.min(20, (likes / 50000) * 20);
  
  // Recency score (max 30 points)
  let recencyScore = 30;
  if (publishDate) {
    const pubDate = new Date(publishDate);
    const daysSincePublish = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
    recencyScore = Math.max(0, 30 - (daysSincePublish / 365) * 30);
  }
  
  // Engagement score (max 20 points)
  let engagementScore = 0;
  if (views > 0) {
    const engagementRate = likes / views;
    engagementScore = Math.min(20, engagementRate * 2000); // 1% = 20 points
  }
  
  const totalScore = viewsScore + likesScore + recencyScore + engagementScore;
  return Math.round(totalScore * 100) / 100;
}

/**
 * Extract YouTube video ID from URL
 * Real YouTube IDs are exactly 11 characters, but we also support shorter test IDs
 */
function extractVideoId(url) {
  if (!url) return null;
  
  // Try to extract v= parameter (most common)
  const vParamMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (vParamMatch) return vParamMatch[1];
  
  // Try youtu.be/ID format
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Try embed/ID format
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

// =====================================================
// SEARCH QUEUE API
// =====================================================

// GET /api/search-queue - Get all search queue entries
app.get('/api/search-queue', async (req, res) => {
  try {
    const data = await prisma.searchQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform to match frontend expected format
    const transformed = data.map(item => ({
      search_id: item.searchId,
      employee: item.employee,
      department: item.department,
      topic: item.topic,
      search_query: item.searchQuery,
      status: item.status === 'In_Progress' ? 'In Progress' : item.status,
      videos_found: item.videosFound,
      date_assigned: item.dateAssigned?.toISOString().split('T')[0],
      date_completed: item.dateCompleted?.toISOString().split('T')[0] || null,
      notes: item.notes,
      perplexity_creativity: item.perplexityCreativity,
      perplexity_structure_mode: item.perplexityStructureMode,
      results_count: item.resultsCount,
      error_message: item.errorMessage,
      created_at: item.createdAt?.toISOString(),
      updated_at: item.updatedAt?.toISOString(),
    }));
    
    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching search queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/search-queue - Create new search queue entry
app.post('/api/search-queue', async (req, res) => {
  try {
    // Generate new search ID
    const lastSearch = await prisma.searchQueue.findFirst({
      orderBy: { searchId: 'desc' },
    });
    
    let nextNum = 1;
    if (lastSearch?.searchId) {
      const match = lastSearch.searchId.match(/SEARCH-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const searchId = `SEARCH-${String(nextNum).padStart(3, '0')}`;
    
    // Map status
    let status = req.body.status || 'Assigned';
    if (status === 'In Progress') status = 'In_Progress';
    
    const newEntry = await prisma.searchQueue.create({
      data: {
        searchId,
        employee: req.body.employee || null,
        department: req.body.department,
        topic: req.body.topic,
        searchQuery: req.body.search_query,
        status,
        videosFound: req.body.videos_found || 0,
        dateAssigned: new Date(),
        notes: req.body.notes || '',
        perplexityCreativity: req.body.perplexity_creativity || 0.5,
        perplexityStructureMode: req.body.perplexity_structure_mode ?? true,
        resultsCount: req.body.results_count || 0,
      },
    });
    
    res.json({ success: true, data: { search_id: newEntry.searchId, ...newEntry } });
  } catch (error) {
    console.error('Error creating search queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/search-queue/sync-csv - Sync from CSV file in Dropbox
// IMPORTANT: This route MUST be defined BEFORE routes with :id parameter
app.post('/api/search-queue/sync-csv', async (req, res) => {
  try {
    // Try multiple possible paths to find the CSV file
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'ENTITIES', 'TASK_MANAGERS', 'RESEARCHES', '00_SEARCH_QUEUE', 'Search_Queue_Master.csv'),
      // From apps/api/ directory
      // path.resolve(process.cwd(), '../../ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
      // // From workspace root
      // path.resolve(process.cwd(), 'ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
      // // From apps/ directory
      // path.resolve(process.cwd(), '../ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
    ];

    
    let csvPath = null;
    for (const p of possiblePaths) {
      console.log('Checking path:', p);
      if (fs.existsSync(p)) {
        csvPath = p;
        console.log('Found CSV at:', p);
        break;
      }
    }
    
    // Check if file exists
    if (!csvPath) {
      return res.status(404).json({ 
        success: false, 
        error: `CSV file not found. Checked paths: ${possiblePaths.join(', ')}`,
        cwd: process.cwd()
      });
    }
    
    // Read the CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return res.json({ success: true, data: { imported: 0, updated: 0, skipped: 0 } });
    }
    
    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    
    // Find column indices
    const cols = {
      searchId: header.findIndex(h => h === 'Search_ID'),
      employee: header.findIndex(h => h === 'Employee'),
      department: header.findIndex(h => h === 'Department'),
      topic: header.findIndex(h => h === 'Topic'),
      searchQuery: header.findIndex(h => h === 'Search_Query'),
      status: header.findIndex(h => h === 'Status'),
      videosFound: header.findIndex(h => h === 'Videos_Found'),
      dateAssigned: header.findIndex(h => h === 'Date_Assigned'),
      dateCompleted: header.findIndex(h => h === 'Date_Completed'),
      notes: header.findIndex(h => h === 'Notes'),
    };
    
    // Parse CSV rows (handle quoted fields)
    const parseCSVRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    
    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVRow(lines[i]);
      
      const searchId = fields[cols.searchId];
      if (!searchId) {
        skipped++;
        continue;
      }
      
      // Map status
      let status = fields[cols.status] || 'Assigned';
      if (status === 'In Progress') status = 'In_Progress';
      
      // Map department (validate against enum)
      let department = fields[cols.department]?.toUpperCase();
      const validDepts = ['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'];
      if (!validDepts.includes(department)) {
        department = 'DEV'; // Default
      }
      
      // Parse dates
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
      };
      
      const data = {
        employee: fields[cols.employee] || null,
        department,
        topic: fields[cols.topic] || 'Unknown Topic',
        searchQuery: fields[cols.searchQuery] || '',
        status,
        videosFound: parseInt(fields[cols.videosFound]) || 0,
        dateAssigned: parseDate(fields[cols.dateAssigned]) || new Date(),
        dateCompleted: parseDate(fields[cols.dateCompleted]),
        notes: fields[cols.notes] || '',
      };
      
      try {
        // Check if exists
        const existing = await prisma.searchQueue.findUnique({
          where: { searchId },
        });
        
        if (existing) {
          // Update existing
          await prisma.searchQueue.update({
            where: { searchId },
            data,
          });
          updated++;
        } else {
          // Create new
          await prisma.searchQueue.create({
            data: {
              searchId,
              ...data,
            },
          });
          imported++;
        }
      } catch (rowError) {
        errors.push({ searchId, error: rowError.message });
        skipped++;
      }
    }
    
    res.json({ 
      success: true, 
      data: { 
        imported, 
        updated, 
        skipped,
        total: lines.length - 1,
        errors: errors.length > 0 ? errors : undefined,
        csvPath,
      } 
    });
  } catch (error) {
    console.error('Error syncing from CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/search-queue/:id - Update search queue entry
app.put('/api/search-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Map status
    let status = req.body.status;
    if (status === 'In Progress') status = 'In_Progress';
    
    const updateData = {};
    if (req.body.employee !== undefined) updateData.employee = req.body.employee;
    if (req.body.department) updateData.department = req.body.department;
    if (req.body.topic) updateData.topic = req.body.topic;
    if (req.body.search_query) updateData.searchQuery = req.body.search_query;
    if (status) updateData.status = status;
    if (req.body.videos_found !== undefined) updateData.videosFound = req.body.videos_found;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.date_completed) updateData.dateCompleted = new Date(req.body.date_completed);
    if (req.body.error_message !== undefined) updateData.errorMessage = req.body.error_message;
    
    const updated = await prisma.searchQueue.update({
      where: { searchId: id },
      data: updateData,
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating search queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/search-queue/:id - Delete search queue entry
app.delete('/api/search-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await prisma.searchQueue.delete({
      where: { searchId: id },
    });
    
    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Error deleting search queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// VIDEO QUEUE API
// =====================================================

// GET /api/video-queue - Get all video queue entries
app.get('/api/video-queue', async (req, res) => {
  try {
    const data = await prisma.videoQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform to match frontend expected format
    const transformed = data.map(item => ({
      id: item.id,
      queue_id: item.queueId,
      video_id: item.videoId,
      video_url: item.videoUrl,
      video_title: item.videoTitle,
      channel_name: item.channelName,
      channel_url: item.channelUrl,
      duration_minutes: item.durationMinutes,
      duration: item.duration,
      views: item.views,
      likes: item.likes,
      comments: item.comments,
      publish_date: item.publishDate?.toISOString().split('T')[0],
      priority: item.priority,
      status: item.status,
      department: item.department,
      topic_category: item.topicCategory,
      research_source: item.researchSource,
      priority_score: item.priorityScore,
      assigned_to: item.assignedTo,
      added_by: item.addedBy,
      added_date: item.addedDate?.toISOString().split('T')[0],
      selected_by: item.selectedBy,
      selected_date: item.selectedDate?.toISOString().split('T')[0],
      parsed_date: item.parsedDate?.toISOString().split('T')[0],
      notes: item.notes,
      perplexity_search_id: item.perplexitySearchId,
      created_at: item.createdAt?.toISOString(),
      updated_at: item.updatedAt?.toISOString(),
    }));
    
    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching video queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/video-queue - Create new video queue entry
app.post('/api/video-queue', async (req, res) => {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(req.body.video_url);
    
    console.log('📹 Creating video entry:');
    console.log('   URL:', req.body.video_url);
    console.log('   Extracted Video ID:', videoId);
    console.log('   Views:', req.body.views, '| Likes:', req.body.likes);
    
    // ========== DUPLICATE DETECTION ==========
    if (videoId) {
      const existingVideo = await prisma.videoQueue.findFirst({
        where: { videoId: videoId }
      });
      
      if (existingVideo) {
        return res.status(409).json({
          success: false,
          error: 'Video already exists in queue',
          duplicate: true,
          existing: {
            queue_id: existingVideo.queueId,
            video_title: existingVideo.videoTitle,
            status: existingVideo.status,
            added_date: existingVideo.addedDate
          }
        });
      }
    }
    
    // Generate new queue ID
    const lastVideo = await prisma.videoQueue.findFirst({
      where: { queueId: { not: null } },
      orderBy: { queueId: 'desc' },
    });
    
    let nextNum = 1;
    if (lastVideo?.queueId) {
      const match = lastVideo.queueId.match(/VQ-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const queueId = `VQ-${String(nextNum).padStart(3, '0')}`;
    
    // ========== CALCULATE PRIORITY SCORE ==========
    const views = parseInt(req.body.views) || 0;
    const likes = parseInt(req.body.likes) || 0;
    const publishDate = req.body.publish_date || null;
    const priorityScore = calculatePriorityScore(views, likes, publishDate);
    
    // Determine priority level from score
    let priorityLevel = req.body.priority || 'medium';
    if (!req.body.priority && priorityScore > 0) {
      if (priorityScore >= 60) priorityLevel = 'high';
      else if (priorityScore >= 30) priorityLevel = 'medium';
      else priorityLevel = 'low';
    }
    
    const newEntry = await prisma.videoQueue.create({
      data: {
        queueId,
        videoId,
        videoUrl: req.body.video_url,
        videoTitle: req.body.video_title,
        channelName: req.body.channel_name || null,
        durationMinutes: req.body.duration_minutes || 0,
        duration: req.body.duration || null,
        views: views,
        likes: likes,
        comments: parseInt(req.body.comments) || 0,
        publishDate: publishDate ? new Date(publishDate) : null,
        priority: priorityLevel,
        priorityScore: priorityScore,
        status: req.body.status || 'pending',
        department: req.body.department,
        topicCategory: req.body.topic_category || null,
        researchSource: req.body.research_source || null,
        addedBy: req.body.added_by || 'System',
        addedDate: new Date(),
        notes: req.body.notes || null,
        perplexitySearchId: req.body.perplexity_search_id,
      },
    });
    
    console.log('✅ Video created successfully:');
    console.log('   Queue ID:', newEntry.queueId);
    console.log('   Video ID in DB:', newEntry.videoId);
    console.log('   Priority Score:', priorityScore);
    
    res.json({ 
      success: true, 
      data: { 
        queue_id: newEntry.queueId,
        video_id: newEntry.videoId,
        priority_score: priorityScore,
        ...newEntry 
      } 
    });
  } catch (error) {
    console.error('Error creating video queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/video-queue/sync-csv - Sync from CSV file in Dropbox
// IMPORTANT: This route MUST be defined BEFORE routes with :id parameter
app.post('/api/video-queue/sync-csv', async (req, res) => {
  try {
    // Try multiple possible paths to find the CSV file
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'ENTITIES', 'TASK_MANAGERS', 'RESEARCHES', '01_VIDEO_QUEUE', 'Video_Queue_Master.csv')
      // path.resolve(process.cwd(), '../../ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
      // path.resolve(process.cwd(), 'ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
      // path.resolve(process.cwd(), '../ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
    ];
    
    let csvPath = null;
    for (const p of possiblePaths) {
      console.log('Checking video CSV path:', p);
      if (fs.existsSync(p)) {
        csvPath = p;
        console.log('Found Video CSV at:', p);
        break;
      }
    }
    
    if (!csvPath) {
      return res.status(404).json({ 
        success: false, 
        error: `Video CSV file not found. Checked paths: ${possiblePaths.join(', ')}`,
        cwd: process.cwd()
      });
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return res.json({ success: true, data: { imported: 0, updated: 0, skipped: 0 } });
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    
    // Find column indices
    const cols = {
      queueId: header.findIndex(h => h === 'Queue_ID'),
      videoId: header.findIndex(h => h === 'Video_ID'),
      videoTitle: header.findIndex(h => h === 'Video_Title'),
      channelName: header.findIndex(h => h === 'Channel_Name'),
      channelUrl: header.findIndex(h => h === 'Channel_URL'),
      videoUrl: header.findIndex(h => h === 'Video_URL'),
      views: header.findIndex(h => h === 'Views'),
      likes: header.findIndex(h => h === 'Likes'),
      comments: header.findIndex(h => h === 'Comments'),
      publishDate: header.findIndex(h => h === 'Publish_Date'),
      duration: header.findIndex(h => h === 'Duration'),
      addedBy: header.findIndex(h => h === 'Added_By'),
      addedDate: header.findIndex(h => h === 'Added_Date'),
      status: header.findIndex(h => h === 'Status'),
      selectedBy: header.findIndex(h => h === 'Selected_By'),
      selectedDate: header.findIndex(h => h === 'Selected_Date'),
      parsedDate: header.findIndex(h => h === 'Parsed_Date'),
      topicCategory: header.findIndex(h => h === 'Topic_Category'),
      researchSource: header.findIndex(h => h === 'Research_Source'),
      priorityScore: header.findIndex(h => h === 'Priority_Score'),
      notes: header.findIndex(h => h === 'Notes'),
    };
    
    // Parse CSV rows
    const parseCSVRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    // Parse duration HH:MM:SS to minutes
    const parseDuration = (dur) => {
      if (!dur) return 0;
      const parts = dur.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
      if (parts.length === 2) return parts[0] + Math.round(parts[1] / 60);
      return parseInt(dur) || 0;
    };
    
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };
    
    // Map CSV status to DB status
    const mapStatus = (status) => {
      const statusMap = {
        'Pending': 'pending',
        'Selected': 'selected',
        'Parsing': 'transcribing',
        'Parsed': 'complete',
        'Rejected': 'rejected',
      };
      return statusMap[status] || 'pending';
    };
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVRow(lines[i]);
      
      const queueId = fields[cols.queueId];
      if (!queueId) {
        skipped++;
        continue;
      }
      
      // Map department - default to DEV if not valid
      let department = 'DEV';
      const topicCat = fields[cols.topicCategory]?.toLowerCase() || '';
      if (topicCat.includes('video') || topicCat.includes('editing')) department = 'VID';
      else if (topicCat.includes('social') || topicCat.includes('tiktok')) department = 'SMM';
      else if (topicCat.includes('design') || topicCat.includes('graphic')) department = 'DGN';
      else if (topicCat.includes('marketing')) department = 'MKT';
      else if (topicCat.includes('ai') || topicCat.includes('automation')) department = 'AID';
      
      const data = {
        videoId: fields[cols.videoId] || null,
        videoUrl: fields[cols.videoUrl] || '',
        videoTitle: fields[cols.videoTitle] || 'Untitled',
        channelName: fields[cols.channelName] || null,
        channelUrl: fields[cols.channelUrl] || null,
        views: parseInt(fields[cols.views]) || 0,
        likes: parseInt(fields[cols.likes]) || 0,
        comments: parseInt(fields[cols.comments]) || 0,
        publishDate: parseDate(fields[cols.publishDate]),
        duration: fields[cols.duration] || null,
        durationMinutes: parseDuration(fields[cols.duration]),
        addedBy: fields[cols.addedBy] || 'CSV Import',
        addedDate: parseDate(fields[cols.addedDate]) || new Date(),
        status: mapStatus(fields[cols.status]),
        selectedBy: fields[cols.selectedBy] || null,
        selectedDate: parseDate(fields[cols.selectedDate]),
        parsedDate: parseDate(fields[cols.parsedDate]),
        topicCategory: fields[cols.topicCategory] || null,
        researchSource: fields[cols.researchSource] || null,
        priorityScore: parseFloat(fields[cols.priorityScore]) || null,
        notes: fields[cols.notes] || null,
        department,
        priority: 'medium',
      };
      
      try {
        const existing = await prisma.videoQueue.findUnique({
          where: { queueId },
        });
        
        if (existing) {
          await prisma.videoQueue.update({
            where: { queueId },
            data,
          });
          updated++;
        } else {
          await prisma.videoQueue.create({
            data: { queueId, ...data },
          });
          imported++;
        }
      } catch (rowError) {
        errors.push({ queueId, error: rowError.message });
        skipped++;
      }
    }
    
    res.json({ 
      success: true, 
      data: { imported, updated, skipped, total: lines.length - 1, errors: errors.length > 0 ? errors : undefined, csvPath } 
    });
  } catch (error) {
    console.error('Error syncing video queue from CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/video-queue/export - Export video queue to CSV, JSON or Markdown
app.get('/api/video-queue/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const statusFilter = req.query.status; // Optional status filter
    
    let whereClause = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    
    const data = await prisma.videoQueue.findMany({
      where: whereClause,
      orderBy: { priorityScore: 'desc' },
    });
    
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    if (format === 'csv') {
      // CSV Export
      const headers = [
        'Queue_ID', 'Video_ID', 'Video_Title', 'Channel_Name', 'Video_URL',
        'Views', 'Likes', 'Comments', 'Publish_Date', 'Duration',
        'Added_By', 'Added_Date', 'Status', 'Selected_By', 'Selected_Date',
        'Parsed_Date', 'Topic_Category', 'Research_Source', 'Priority_Score',
        'Department', 'Priority', 'Notes'
      ];
      
      const rows = data.map(item => [
        item.queueId || '',
        item.videoId || '',
        `"${(item.videoTitle || '').replace(/"/g, '""')}"`,
        `"${(item.channelName || '').replace(/"/g, '""')}"`,
        item.videoUrl || '',
        item.views || 0,
        item.likes || 0,
        item.comments || 0,
        item.publishDate?.toISOString().split('T')[0] || '',
        item.duration || '',
        item.addedBy || '',
        item.addedDate?.toISOString().split('T')[0] || '',
        item.status || '',
        item.selectedBy || '',
        item.selectedDate?.toISOString().split('T')[0] || '',
        item.parsedDate?.toISOString().split('T')[0] || '',
        item.topicCategory || '',
        item.researchSource || '',
        item.priorityScore || '',
        item.department || '',
        item.priority || '',
        `"${(item.notes || '').replace(/"/g, '""')}"`,
      ].join(','));
      
      const csv = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="video_queue_export_${dateStr}.csv"`);
      res.send(csv);
      
    } else if (format === 'markdown' || format === 'md') {
      // Markdown Export
      let md = `# 📹 Video Queue Export\n\n`;
      md += `**Export Date:** ${dateStr} ${timeStr}\n\n`;
      md += `**Total Videos:** ${data.length}\n\n`;
      if (statusFilter) {
        md += `**Status Filter:** ${statusFilter}\n\n`;
      }
      md += `---\n\n`;
      
      // Summary Statistics
      md += `## 📊 Summary\n\n`;
      
      // Status breakdown
      const statusCounts = {};
      const topicCounts = {};
      const sourceCounts = {};
      const deptCounts = {};
      
      data.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        if (item.topicCategory) topicCounts[item.topicCategory] = (topicCounts[item.topicCategory] || 0) + 1;
        if (item.researchSource) sourceCounts[item.researchSource] = (sourceCounts[item.researchSource] || 0) + 1;
        if (item.department) deptCounts[item.department] = (deptCounts[item.department] || 0) + 1;
      });
      
      md += `### By Status\n\n`;
      Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
        const pct = ((count / data.length) * 100).toFixed(1);
        md += `- **${status}**: ${count} (${pct}%)\n`;
      });
      md += `\n`;
      
      if (Object.keys(topicCounts).length > 0) {
        md += `### Top Topics\n\n`;
        Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([topic, count]) => {
          md += `- **${topic}**: ${count}\n`;
        });
        md += `\n`;
      }
      
      if (Object.keys(sourceCounts).length > 0) {
        md += `### Research Sources\n\n`;
        Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
          md += `- **${source}**: ${count}\n`;
        });
        md += `\n`;
      }
      
      if (Object.keys(deptCounts).length > 0) {
        md += `### By Department\n\n`;
        Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
          md += `- **${dept}**: ${count}\n`;
        });
        md += `\n`;
      }
      
      md += `---\n\n`;
      
      // Videos Table
      md += `## 📋 Videos Table\n\n`;
      md += `| Queue ID | Title | Channel | Topic | Status | Priority | Department |\n`;
      md += `|----------|-------|---------|-------|--------|----------|------------|\n`;
      
      data.forEach(item => {
        const title = (item.videoTitle || 'Untitled').substring(0, 40) + (item.videoTitle?.length > 40 ? '...' : '');
        const channel = (item.channelName || '-').substring(0, 20);
        const topic = (item.topicCategory || '-').substring(0, 15);
        md += `| ${item.queueId || '-'} | ${title} | ${channel} | ${topic} | ${item.status || '-'} | ${item.priorityScore || '-'} | ${item.department || '-'} |\n`;
      });
      
      md += `\n---\n\n`;
      
      // Detailed Listing
      md += `## 📝 Detailed Listing\n\n`;
      
      data.forEach(item => {
        md += `### ${item.queueId}: ${item.videoTitle || 'Untitled'}\n\n`;
        md += `- **Channel:** ${item.channelName || 'Unknown'}\n`;
        md += `- **Video URL:** ${item.videoUrl || '-'}\n`;
        md += `- **Views:** ${item.views?.toLocaleString() || 0}\n`;
        md += `- **Likes:** ${item.likes?.toLocaleString() || 0}\n`;
        md += `- **Comments:** ${item.comments?.toLocaleString() || 0}\n`;
        md += `- **Publish Date:** ${item.publishDate?.toISOString().split('T')[0] || '-'}\n`;
        md += `- **Duration:** ${item.duration || item.durationMinutes + ' min' || '-'}\n`;
        md += `- **Topic:** ${item.topicCategory || '-'}\n`;
        md += `- **Research Source:** ${item.researchSource || '-'}\n`;
        md += `- **Priority Score:** ${item.priorityScore || '-'}/100\n`;
        md += `- **Status:** ${item.status || '-'}\n`;
        md += `- **Department:** ${item.department || '-'}\n`;
        md += `- **Added By:** ${item.addedBy || '-'} on ${item.addedDate?.toISOString().split('T')[0] || '-'}\n`;
        
        if (item.selectedBy) {
          md += `- **Selected By:** ${item.selectedBy} on ${item.selectedDate?.toISOString().split('T')[0] || '-'}\n`;
        }
        if (item.parsedDate) {
          md += `- **Parsed Date:** ${item.parsedDate.toISOString().split('T')[0]}\n`;
        }
        if (item.notes) {
          md += `- **Notes:** ${item.notes}\n`;
        }
        md += `\n`;
      });
      
      md += `---\n\n`;
      md += `*Generated by REMS Video Queue System*\n`;
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="video_queue_export_${dateStr}.md"`);
      res.send(md);
      
    } else {
      // JSON Export (default)
      const jsonData = data.map(item => ({
        queue_id: item.queueId,
        video_id: item.videoId,
        video_title: item.videoTitle,
        channel_name: item.channelName,
        video_url: item.videoUrl,
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        publish_date: item.publishDate?.toISOString().split('T')[0],
        duration: item.duration,
        duration_minutes: item.durationMinutes,
        added_by: item.addedBy,
        added_date: item.addedDate?.toISOString().split('T')[0],
        status: item.status,
        selected_by: item.selectedBy,
        selected_date: item.selectedDate?.toISOString().split('T')[0],
        parsed_date: item.parsedDate?.toISOString().split('T')[0],
        topic_category: item.topicCategory,
        research_source: item.researchSource,
        priority_score: item.priorityScore,
        department: item.department,
        priority: item.priority,
        notes: item.notes,
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="video_queue_export_${dateStr}.json"`);
      res.json(jsonData);
    }
  } catch (error) {
    console.error('Error exporting video queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/video-queue/:id - Update video queue entry
// Auto-sets dates based on status change (like Python script update_queue_status.py)
app.put('/api/video-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = {};
    if (req.body.video_title) updateData.videoTitle = req.body.video_title;
    if (req.body.video_url) updateData.videoUrl = req.body.video_url;
    if (req.body.channel_name !== undefined) updateData.channelName = req.body.channel_name;
    if (req.body.duration_minutes !== undefined) updateData.durationMinutes = req.body.duration_minutes;
    if (req.body.priority) updateData.priority = req.body.priority;
    if (req.body.department) updateData.department = req.body.department;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.assigned_to !== undefined) updateData.assignedTo = req.body.assigned_to;
    
    // ========== AUTO-DATE SETTING BASED ON STATUS ==========
    // Matches Python script: update_queue_status.py
    if (req.body.status) {
      updateData.status = req.body.status;
      
      // When status changes to 'selected' - set selected_date and selected_by
      if (req.body.status === 'selected') {
        updateData.selectedDate = new Date();
        if (req.body.selected_by) {
          updateData.selectedBy = req.body.selected_by;
        }
      }
      
      // When status changes to 'transcribed' or 'complete' - set parsed_date
      if (req.body.status === 'transcribed' || req.body.status === 'complete') {
        updateData.parsedDate = new Date();
      }
    }
    
    // Manual selected_by update
    if (req.body.selected_by && !updateData.selectedBy) {
      updateData.selectedBy = req.body.selected_by;
      updateData.selectedDate = new Date();
    }
    
    // Try to find by queueId first, then by id
    let updated;
    try {
      updated = await prisma.videoQueue.update({
        where: { queueId: id },
        data: updateData,
      });
    } catch {
      updated = await prisma.videoQueue.update({
        where: { id },
        data: updateData,
      });
    }
    
    console.log(`📝 Updated ${id}: status=${req.body.status || 'unchanged'}`);
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating video queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/video-queue/batch-update - Batch update multiple videos
// Matches Python script: update_queue_status.py -> update_multiple_status()
app.post('/api/video-queue/batch-update', async (req, res) => {
  try {
    const { queue_ids, status, selected_by } = req.body;
    
    if (!queue_ids || !Array.isArray(queue_ids) || queue_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'queue_ids array is required' 
      });
    }
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'status is required' 
      });
    }
    
    const results = {
      successful: [],
      failed: []
    };
    
    // Build update data based on status
    const updateData = { status };
    
    if (status === 'selected') {
      updateData.selectedDate = new Date();
      if (selected_by) updateData.selectedBy = selected_by;
    }
    
    if (status === 'transcribed' || status === 'complete') {
      updateData.parsedDate = new Date();
    }
    
    // Update each video
    for (const queueId of queue_ids) {
      try {
        await prisma.videoQueue.update({
          where: { queueId },
          data: updateData,
        });
        results.successful.push(queueId);
      } catch (error) {
        results.failed.push({ queueId, error: error.message });
      }
    }
    
    console.log(`📝 Batch update: ${results.successful.length} successful, ${results.failed.length} failed`);
    
    res.json({ 
      success: true, 
      data: {
        updated: results.successful.length,
        failed: results.failed.length,
        successful: results.successful,
        errors: results.failed.length > 0 ? results.failed : undefined
      }
    });
  } catch (error) {
    console.error('Error in batch update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/video-queue/:id - Delete video queue entry
app.delete('/api/video-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by queueId first, then by id
    let deleted;
    try {
      deleted = await prisma.videoQueue.delete({
        where: { queueId: id },
      });
    } catch {
      deleted = await prisma.videoQueue.delete({
        where: { id },
      });
    }
    
    res.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Error deleting video queue entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// DEPARTMENTS API
// =====================================================

// GET /api/departments - Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const data = await prisma.department.findMany();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// RESEARCHES API
// =====================================================

// GET /api/researches - Get all researches
app.get('/api/researches', async (req, res) => {
  try {
    const data = await prisma.research.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching researches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// OVERVIEW / STATISTICS API
// =====================================================

// GET /api/video-queue/summary - Get detailed queue summary
// Matches Python script: update_queue_status.py -> show_queue_summary()
app.get('/api/video-queue/summary', async (req, res) => {
  try {
    const data = await prisma.videoQueue.findMany();
    
    if (data.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          total: 0, 
          message: 'Queue is empty',
          by_status: {},
          by_topic: {},
          by_source: {},
          by_department: {}
        } 
      });
    }
    
    // Status breakdown
    const statusCounts = {};
    const topicCounts = {};
    const sourceCounts = {};
    const deptCounts = {};
    let totalViews = 0;
    let totalLikes = 0;
    
    data.forEach(item => {
      // Status
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      
      // Topic
      if (item.topicCategory) {
        topicCounts[item.topicCategory] = (topicCounts[item.topicCategory] || 0) + 1;
      }
      
      // Research Source
      if (item.researchSource) {
        sourceCounts[item.researchSource] = (sourceCounts[item.researchSource] || 0) + 1;
      }
      
      // Department
      if (item.department) {
        deptCounts[item.department] = (deptCounts[item.department] || 0) + 1;
      }
      
      // Totals
      totalViews += item.views || 0;
      totalLikes += item.likes || 0;
    });
    
    // Calculate percentages
    const total = data.length;
    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    
    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const sourceBreakdown = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
    
    const deptBreakdown = Object.entries(deptCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
    
    // Average priority score
    const avgPriority = data.reduce((sum, item) => sum + (item.priorityScore || 0), 0) / total;
    
    res.json({ 
      success: true, 
      data: {
        total,
        total_views: totalViews,
        total_likes: totalLikes,
        average_priority_score: avgPriority.toFixed(2),
        by_status: statusBreakdown,
        top_topics: topTopics,
        by_source: sourceBreakdown,
        by_department: deptBreakdown
      }
    });
  } catch (error) {
    console.error('Error getting queue summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/overview - Get dashboard statistics
app.get('/api/overview', async (req, res) => {
  try {
    const [
      searchQueueCount,
      videoQueueCount,
      completedSearches,
      completedVideos,
      departmentStats,
      videoStatusStats,
    ] = await Promise.all([
      prisma.searchQueue.count(),
      prisma.videoQueue.count(),
      prisma.searchQueue.count({ where: { status: 'Completed' } }),
      prisma.videoQueue.count({ where: { status: 'complete' } }),
      prisma.searchQueue.groupBy({
        by: ['department'],
        _count: { department: true },
      }),
      prisma.videoQueue.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const departmentDistribution = departmentStats.map(d => ({
      name: d.department,
      value: d._count.department,
    }));

    const videoStatusDistribution = videoStatusStats.map(s => ({
      name: s.status,
      value: s._count.status,
    }));

    res.json({
      success: true,
      data: {
        totalSearches: searchQueueCount,
        completedSearches,
        totalVideos: videoQueueCount,
        completedVideos,
        pendingSearchTasks: searchQueueCount - completedSearches,
        videosPendingProcessing: videoQueueCount - completedVideos,
        departmentDistribution,
        videoStatusDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =====================================================
// PROMPTS API
// =====================================================

// GET /api/prompts/:promptId - Get prompt content by ID (e.g., PMT-004, PMT-090)
app.get('/api/prompts/:promptId', async (req, res) => {
  try {
    const { promptId } = req.params;
    
    // Base path to ENTITIES/PROMPTS folder (relative to server.js location)
    const promptsBasePath = path.join(__dirname, '..', '..', 'ENTITIES', 'PROMPTS');
    
    // Map of prompt IDs to their file names
    const promptFiles = {
      'PMT-004': 'PMT-004_Video_Transcription_v4.1.md',
      'PMT-090': 'PMT-090_YouTube_Video_Processing.md',
      'PMT-005': 'PMT-005_Video_Naming_Alternatives.md',
      'PMT-006': 'PMT-006_Video_Analysis.md',
      'PMT-007': 'PMT-007_Objects_Library_Extraction.md',
      'PMT-008': 'PMT-008_Video_Analysis_Improvements.md',
      'PMT-009': 'PMT-009_Taxonomy_Integration.md',
      'PMT-010': 'PMT-010_Complete_Workflow_Full.md',
      'PMT-011': 'PMT-011_Complete_Workflow_Short.md',
      'PMT-012': 'PMT-012_Transcript_Processing_Workflow.md',
    };
    
    const fileName = promptFiles[promptId.toUpperCase()];
    
    if (!fileName) {
      return res.status(404).json({
        success: false,
        error: `Prompt "${promptId}" not found. Available prompts: ${Object.keys(promptFiles).join(', ')}`
      });
    }
    
    const filePath = path.join(promptsBasePath, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: `Prompt file not found: ${fileName}`
      });
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    res.json({
      success: true,
      data: {
        promptId: promptId.toUpperCase(),
        fileName,
        content,
        filePath: filePath.replace(/\\/g, '/'),
        lastModified: fs.statSync(filePath).mtime.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error reading prompt file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/prompts - List all available prompts
app.get('/api/prompts', async (req, res) => {
  try {
    const promptsBasePath = path.join(__dirname, '..', '..', 'ENTITIES', 'PROMPTS');
    
    // Read all .md files in the PROMPTS directory
    const files = fs.readdirSync(promptsBasePath)
      .filter(file => file.endsWith('.md') && file.startsWith('PMT-'))
      .map(fileName => {
        const match = fileName.match(/^(PMT-\d+)/);
        return {
          promptId: match ? match[1] : fileName,
          fileName,
          path: path.join(promptsBasePath, fileName).replace(/\\/g, '/')
        };
      });
    
    res.json({
      success: true,
      data: files
    });
    
  } catch (error) {
    console.error('Error listing prompts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// TRANSCRIPTION API (Native YouTube Innertube)
// =====================================================

/**
 * Format milliseconds to MM:SS or HH:MM:SS format
 */
function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Make HTTPS POST request
 */
function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const data = JSON.stringify(body);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ data: JSON.parse(body), status: res.statusCode });
        } catch (e) {
          resolve({ data: body, status: res.statusCode });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Make HTTPS GET request
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Fetch YouTube transcript using Innertube API
 */
async function fetchYouTubeTranscript(videoId) {
  // Step 1: Get video player info via Innertube API
  const playerResponse = await httpsPost(
    'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    {
      context: {
        client: {
          hl: 'en',
          gl: 'US',
          clientName: 'WEB',
          clientVersion: '2.20231219.04.00'
        }
      },
      videoId: videoId
    }
  );
  
  if (playerResponse.status !== 200) {
    throw new Error('Failed to get video info from YouTube');
  }
  
  const captions = playerResponse.data?.captions?.playerCaptionsTracklistRenderer;
  if (!captions?.captionTracks?.length) {
    throw new Error('No captions available for this video');
  }
  
  // Get the first caption track (usually auto-generated English)
  const track = captions.captionTracks[0];
  const captionUrl = track.baseUrl + '&fmt=json3';
  
  // Step 2: Fetch the actual captions
  const captionResponse = await httpsGet(captionUrl);
  
  if (!captionResponse || captionResponse.length === 0) {
    throw new Error('Failed to fetch caption data');
  }
  
  const captionData = JSON.parse(captionResponse);
  
  if (!captionData.events) {
    throw new Error('Invalid caption data format');
  }
  
  // Parse the transcript
  const segments = captionData.events
    .filter(e => e.segs && e.segs.length > 0)
    .map(e => ({
      startMs: e.tStartMs || 0,
      durationMs: e.dDurationMs || 0,
      text: e.segs.map(s => s.utf8 || '').join('').trim()
    }))
    .filter(s => s.text.length > 0);
  
  return {
    segments,
    language: track.languageCode || 'en',
    languageName: track.name?.simpleText || 'Unknown'
  };
}

// POST /api/transcription/youtube - Get YouTube video transcript
app.post('/api/transcription/youtube', async (req, res) => {
  try {
    const { videoUrl, videoId: providedVideoId } = req.body;
    
    // Extract video ID from URL or use provided ID
    const videoId = providedVideoId || extractYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL or video ID. Please provide a valid YouTube video URL.'
      });
    }
    
    console.log(`📝 Fetching transcript for video: ${videoId}`);
    
    const result = await fetchYouTubeTranscript(videoId);
    const { segments, language, languageName } = result;
    
    // Format transcript with timestamps
    const formattedLines = segments.map(item => ({
      timestamp: formatTimestamp(item.startMs),
      offsetMs: item.startMs,
      duration: item.durationMs,
      text: item.text
    }));
    
    // Create plain text version with timestamps
    const plainText = formattedLines
      .map(line => `[${line.timestamp}] ${line.text}`)
      .join('\n');
    
    // Create raw text (no timestamps)
    const rawText = segments.map(item => item.text).join(' ');
    
    // Calculate total duration
    const lastItem = segments[segments.length - 1];
    const totalDurationMs = lastItem.startMs + lastItem.durationMs;
    
    console.log(`✅ Transcript fetched successfully: ${segments.length} segments, language: ${languageName}`);
    
    res.json({
      success: true,
      data: {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        language,
        languageName,
        totalSegments: segments.length,
        totalDuration: formatTimestamp(totalDurationMs),
        totalDurationMs,
        transcript: formattedLines,
        plainText,
        rawText,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching YouTube transcript:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('No captions available') || 
        error.message.includes('Transcript is disabled')) {
      errorMessage = 'Субтитры недоступны для этого видео. Возможно, автор отключил субтитры или видео приватное.';
      statusCode = 404;
    } else if (error.message.includes('Failed to get video info')) {
      errorMessage = 'Не удалось получить информацию о видео. Проверьте URL.';
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// GET /api/transcription/youtube/:videoId - Get transcript by video ID (GET variant)
app.get('/api/transcription/youtube/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId || videoId.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'Invalid video ID. YouTube video IDs are 11 characters long.'
      });
    }
    
    console.log(`📝 Fetching transcript for video: ${videoId}`);
    
    const result = await fetchYouTubeTranscript(videoId);
    const { segments, language, languageName } = result;
    
    const formattedLines = segments.map(item => ({
      timestamp: formatTimestamp(item.startMs),
      offsetMs: item.startMs,
      duration: item.durationMs,
      text: item.text
    }));
    
    const plainText = formattedLines
      .map(line => `[${line.timestamp}] ${line.text}`)
      .join('\n');
    
    const rawText = segments.map(item => item.text).join(' ');
    
    const lastItem = segments[segments.length - 1];
    const totalDurationMs = lastItem.startMs + lastItem.durationMs;
    
    res.json({
      success: true,
      data: {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        language,
        languageName,
        totalSegments: segments.length,
        totalDuration: formatTimestamp(totalDurationMs),
        totalDurationMs,
        transcript: formattedLines,
        plainText,
        rawText,
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching YouTube transcript:', error.message);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('No captions available') || 
        error.message.includes('Transcript is disabled')) {
      errorMessage = 'Субтитры недоступны для этого видео.';
      statusCode = 404;
    } else if (error.message.includes('Failed to get video info')) {
      errorMessage = 'Не удалось получить информацию о видео.';
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// POST /api/transcription/process - Full pipeline: YouTube → AI Processing → Save
app.post('/api/transcription/process', async (req, res) => {
  try {
    const { videoUrl, videoId: providedVideoId, videoTitle, saveToFile = true } = req.body;
    
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API not configured. Please add OPENAI_API_KEY to .env file.'
      });
    }
    
    const videoId = providedVideoId || extractYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL or video ID.'
      });
    }
    
    console.log(`\n🚀 Starting full transcription pipeline for: ${videoId}`);
    console.log(`   Video title: ${videoTitle || 'Unknown'}`);
    
    // ========================================
    // STEP 1: Fetch YouTube Transcript
    // ========================================
    console.log(`\n📝 Step 1: Fetching YouTube transcript...`);
    const startStep1 = Date.now();
    
    let transcriptResult;
    try {
      transcriptResult = await fetchYouTubeTranscript(videoId);
    } catch (transcriptError) {
      return res.status(404).json({
        success: false,
        error: `Failed to fetch transcript: ${transcriptError.message}`,
        step: 'youtube_transcript'
      });
    }
    
    const { segments, languageName } = transcriptResult;
    const rawText = segments.map(s => s.text).join(' ');
    const step1Time = Date.now() - startStep1;
    
    console.log(`   ✅ Got ${segments.length} segments (${step1Time}ms)`);
    console.log(`   Language: ${languageName}`);
    console.log(`   Raw text length: ${rawText.length} characters`);
    
    // ========================================
    // STEP 2: Load PMT-004 Prompt Template
    // ========================================
    console.log(`\n📄 Step 2: Loading PMT-004 prompt template...`);
    
    const promptPath = path.join(__dirname, '..', '..', 'ENTITIES', 'PROMPTS', 'PMT-004_Video_Transcription_v4.1.md');
    
    if (!fs.existsSync(promptPath)) {
      return res.status(500).json({
        success: false,
        error: 'PMT-004 prompt template not found',
        step: 'load_prompt'
      });
    }
    
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    console.log(`   ✅ Loaded prompt template (${promptTemplate.length} characters)`);
    
    // ========================================
    // STEP 3: Process with OpenAI
    // ========================================
    console.log(`\n🤖 Step 3: Processing with OpenAI GPT-4...`);
    const startStep3 = Date.now();
    
    const systemPrompt = `You are a video transcription specialist. Follow the instructions in the provided template exactly.
Output ONLY the structured markdown document as specified. Do not include any preamble or explanation.`;
    
    const userPrompt = `## Video Information
- Video ID: ${videoId}
- Video Title: ${videoTitle || 'Unknown'}
- Video URL: https://www.youtube.com/watch?v=${videoId}
- Language: ${languageName}

## Raw Transcript
${rawText}

## Instructions Template
${promptTemplate}

---
Now process the raw transcript above following the instructions template. Output the complete structured markdown document.`;

    let aiResponse;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective model, ~$0.01-0.02 per video
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 16000,
        temperature: 0.3
      });
      
      aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI');
      }
    } catch (aiError) {
      console.error('   ❌ OpenAI error:', aiError.message);
      return res.status(500).json({
        success: false,
        error: `AI processing failed: ${aiError.message}`,
        step: 'ai_processing'
      });
    }
    
    const step3Time = Date.now() - startStep3;
    console.log(`   ✅ AI processing complete (${step3Time}ms)`);
    console.log(`   Output length: ${aiResponse.length} characters`);
    
    // ========================================
    // STEP 4: Save to File (optional)
    // ========================================
    let savedFilePath = null;
    
    if (saveToFile) {
      console.log(`\n💾 Step 4: Saving to file...`);
      
      // Generate filename
      const transcriptionsDir = path.join(__dirname, '..', '..', 'ENTITIES', 'TASK_MANAGERS', 'RESEARCHES', '02_TRANSCRIPTIONS');
      
      // Ensure directory exists
      if (!fs.existsSync(transcriptionsDir)) {
        fs.mkdirSync(transcriptionsDir, { recursive: true });
      }
      
      // Find next video number
      const existingFiles = fs.readdirSync(transcriptionsDir)
        .filter(f => f.match(/^Video_\d+\.md$/));
      
      const existingNumbers = existingFiles
        .map(f => parseInt(f.match(/Video_(\d+)/)?.[1] || '0'))
        .filter(n => !isNaN(n));
      
      const nextNumber = existingNumbers.length > 0 
        ? Math.max(...existingNumbers) + 1 
        : 1;
      
      const fileName = `Video_${String(nextNumber).padStart(3, '0')}.md`;
      savedFilePath = path.join(transcriptionsDir, fileName);
      
      // Add header with metadata
      const fileContent = `---
video_id: ${videoId}
video_title: "${(videoTitle || 'Unknown').replace(/"/g, '\\"')}"
video_url: https://www.youtube.com/watch?v=${videoId}
processed_at: ${new Date().toISOString()}
language: ${languageName}
---

${aiResponse}`;
      
      fs.writeFileSync(savedFilePath, fileContent, 'utf-8');
      console.log(`   ✅ Saved to: ${savedFilePath}`);
    }
    
    // ========================================
    // Complete
    // ========================================
    const totalTime = Date.now() - startStep1;
    console.log(`\n✅ Pipeline complete! Total time: ${totalTime}ms`);
    
    res.json({
      success: true,
      data: {
        videoId,
        videoTitle: videoTitle || 'Unknown',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        language: languageName,
        rawTranscriptLength: rawText.length,
        processedLength: aiResponse.length,
        savedFilePath: savedFilePath?.replace(/\\/g, '/'),
        timing: {
          transcriptFetch: step1Time,
          aiProcessing: step3Time,
          total: totalTime
        },
        processedContent: aiResponse
      }
    });
    
  } catch (error) {
    console.error('❌ Pipeline error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/transcription/status - Check if AI processing is available
app.get('/api/transcription/status', (req, res) => {
  res.json({
    success: true,
    data: {
      youtubeTranscript: true,
      aiProcessing: !!openai,
      openAIConfigured: !!process.env.OPENAI_API_KEY
    }
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (Prisma)`);
  console.log(`🤖 OpenAI: ${openai ? 'Configured ✅' : 'Not configured ❌'}`);
  console.log(`📁 Endpoints:`);
  console.log(`   GET  /api/search-queue`);
  console.log(`   POST /api/search-queue`);
  console.log(`   POST /api/search-queue/sync-csv`);
  console.log(`   PUT  /api/search-queue/:id`);
  console.log(`   DELETE /api/search-queue/:id`);
  console.log(`   GET  /api/video-queue`);
  console.log(`   POST /api/video-queue`);
  console.log(`   POST /api/video-queue/sync-csv`);
  console.log(`   POST /api/video-queue/batch-update`);
  console.log(`   GET  /api/video-queue/export`);
  console.log(`   GET  /api/video-queue/summary`);
  console.log(`   PUT  /api/video-queue/:id`);
  console.log(`   DELETE /api/video-queue/:id`);
  console.log(`   GET  /api/departments`);
  console.log(`   GET  /api/researches`);
  console.log(`   GET  /api/overview`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/prompts`);
  console.log(`   GET  /api/prompts/:promptId`);
  console.log(`   POST /api/transcription/youtube`);
  console.log(`   GET  /api/transcription/youtube/:videoId`);
  console.log(`   POST /api/transcription/process`);
  console.log(`   GET  /api/transcription/status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
