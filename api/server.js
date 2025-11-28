import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

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
  console.log(`   PUT  /api/search-queue/:id`);
  console.log(`   DELETE /api/search-queue/:id`);
  console.log(`   GET  /api/video-queue`);
  console.log(`   POST /api/video-queue`);
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
