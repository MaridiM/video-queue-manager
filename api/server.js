import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

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
      // From apps/api/ directory
      path.resolve(process.cwd(), '../../ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
      // From workspace root
      path.resolve(process.cwd(), 'ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
      // From apps/ directory
      path.resolve(process.cwd(), '../ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv'),
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
    
    // Extract video ID from URL
    let videoId = req.body.video_id;
    if (!videoId && req.body.video_url) {
      const match = req.body.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      if (match) videoId = match[1];
    }
    
    const newEntry = await prisma.videoQueue.create({
      data: {
        queueId,
        videoId,
        videoUrl: req.body.video_url,
        videoTitle: req.body.video_title,
        channelName: req.body.channel_name || null,
        durationMinutes: req.body.duration_minutes || 0,
        priority: req.body.priority || 'medium',
        status: req.body.status || 'pending',
        department: req.body.department,
        topicCategory: req.body.topic_category,
        researchSource: req.body.research_source,
        addedBy: req.body.added_by || 'System',
        addedDate: new Date(),
        notes: req.body.notes || null,
        perplexitySearchId: req.body.perplexity_search_id,
      },
    });
    
    res.json({ success: true, data: { queue_id: newEntry.queueId, ...newEntry } });
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
      path.resolve(process.cwd(), '../../ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
      path.resolve(process.cwd(), 'ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
      path.resolve(process.cwd(), '../ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'),
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

// GET /api/video-queue/export - Export video queue to CSV or JSON
app.get('/api/video-queue/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    
    const data = await prisma.videoQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
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
      res.setHeader('Content-Disposition', `attachment; filename="video_queue_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      // JSON Export
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
      res.setHeader('Content-Disposition', `attachment; filename="video_queue_export_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(jsonData);
    }
  } catch (error) {
    console.error('Error exporting video queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/video-queue/:id - Update video queue entry
app.put('/api/video-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = {};
    if (req.body.video_title) updateData.videoTitle = req.body.video_title;
    if (req.body.video_url) updateData.videoUrl = req.body.video_url;
    if (req.body.channel_name !== undefined) updateData.channelName = req.body.channel_name;
    if (req.body.duration_minutes !== undefined) updateData.durationMinutes = req.body.duration_minutes;
    if (req.body.priority) updateData.priority = req.body.priority;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.department) updateData.department = req.body.department;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.assigned_to !== undefined) updateData.assignedTo = req.body.assigned_to;
    if (req.body.selected_by) {
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
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating video queue entry:', error);
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
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (Prisma)`);
  console.log(`📁 Endpoints:`);
  console.log(`   GET  /api/search-queue`);
  console.log(`   POST /api/search-queue`);
  console.log(`   POST /api/search-queue/sync-csv`);
  console.log(`   PUT  /api/search-queue/:id`);
  console.log(`   DELETE /api/search-queue/:id`);
  console.log(`   GET  /api/video-queue`);
  console.log(`   POST /api/video-queue`);
  console.log(`   POST /api/video-queue/sync-csv`);
  console.log(`   GET  /api/video-queue/export`);
  console.log(`   PUT  /api/video-queue/:id`);
  console.log(`   DELETE /api/video-queue/:id`);
  console.log(`   GET  /api/departments`);
  console.log(`   GET  /api/researches`);
  console.log(`   GET  /api/overview`);
  console.log(`   GET  /api/health`);
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
