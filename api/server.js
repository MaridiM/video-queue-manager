import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DROPBOX_ROOT = process.env.DROPBOX_ROOT || '.';

app.use(cors());
app.use(express.json());

// Helper: Read and parse CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(DROPBOX_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return resolve({ data: [], error: `File not found: ${fullPath}` });
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    
    resolve({ data: result.data, errors: result.errors });
  });
}

// Helper: Check if file exists
function checkFileExists(filePath) {
  const fullPath = path.join(DROPBOX_ROOT, filePath);
  return fs.existsSync(fullPath);
}

// API: Get Master Research List
app.get('/api/researches', async (req, res) => {
  try {
    const result = await readCSV('ENTITIES/TASK_MANAGERS/RESEARCHES/RESEARCHES_Master_List.csv');
    
    // Add file existence check for each research
    const dataWithFileCheck = result.data.map(item => ({
      ...item,
      fileExists: item.File_Path ? checkFileExists(item.File_Path) : false
    }));
    
    res.json({ success: true, data: dataWithFileCheck });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Queue CSV Path
const SEARCH_QUEUE_CSV = 'ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv';

// API: Get Search Queue
app.get('/api/search-queue', async (req, res) => {
  try {
    const result = await readCSV(SEARCH_QUEUE_CSV);
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Video Queue CSV Path
const VIDEO_QUEUE_CSV = 'ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv';

// Helper: Write CSV file
function writeCSV(filePath, data) {
  const fullPath = path.join(DROPBOX_ROOT, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const csv = Papa.unparse(data);
  fs.writeFileSync(fullPath, csv, 'utf8');
}

// API: Get Video Queue
app.get('/api/video-queue', async (req, res) => {
  try {
    const result = await readCSV(VIDEO_QUEUE_CSV);
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Add Video to Queue
app.post('/api/video-queue', async (req, res) => {
  try {
    const result = await readCSV(VIDEO_QUEUE_CSV);
    const data = result.data || [];
    
    // Generate new ID
    const maxId = data.reduce((max, item) => {
      const id = parseInt(item.Queue_ID?.replace('VQ-', '') || '0');
      return id > max ? id : max;
    }, 0);
    
    const newVideo = {
      Queue_ID: `VQ-${String(maxId + 1).padStart(3, '0')}`,
      Video_Title: req.body.video_title,
      Video_URL: req.body.video_url,
      Channel_Name: req.body.channel_name || '',
      Duration_Minutes: req.body.duration_minutes || 0,
      Topic_Category: req.body.department || 'DEV',
      Research_Source: req.body.research_source || '',
      Priority_Score: req.body.priority === 'high' ? 85 : req.body.priority === 'medium' ? 50 : 25,
      Status: req.body.status || 'Pending',
      Added_By: req.body.added_by || 'System',
      Added_Date: new Date().toISOString().split('T')[0],
      Notes: req.body.notes || '',
      Views: 0,
      Likes: 0,
      Publish_Date: '',
      Duration: `${req.body.duration_minutes || 0}m`,
    };
    
    data.unshift(newVideo);
    writeCSV(VIDEO_QUEUE_CSV, data);
    
    res.json({ success: true, data: newVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Update Video in Queue
app.put('/api/video-queue/:id', async (req, res) => {
  try {
    const result = await readCSV(VIDEO_QUEUE_CSV);
    const data = result.data || [];
    
    const idx = data.findIndex(item => item.Queue_ID === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    // Update fields
    data[idx] = {
      ...data[idx],
      Video_Title: req.body.video_title ?? data[idx].Video_Title,
      Video_URL: req.body.video_url ?? data[idx].Video_URL,
      Channel_Name: req.body.channel_name ?? data[idx].Channel_Name,
      Duration_Minutes: req.body.duration_minutes ?? data[idx].Duration_Minutes,
      Topic_Category: req.body.department ?? data[idx].Topic_Category,
      Priority_Score: req.body.priority === 'high' ? 85 : req.body.priority === 'medium' ? 50 : req.body.priority === 'low' ? 25 : data[idx].Priority_Score,
      Status: req.body.status ?? data[idx].Status,
      Notes: req.body.notes ?? data[idx].Notes,
      Duration: req.body.duration_minutes ? `${req.body.duration_minutes}m` : data[idx].Duration,
    };
    
    writeCSV(VIDEO_QUEUE_CSV, data);
    
    res.json({ success: true, data: data[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Delete Video from Queue
app.delete('/api/video-queue/:id', async (req, res) => {
  try {
    const result = await readCSV(VIDEO_QUEUE_CSV);
    const data = result.data || [];
    
    const idx = data.findIndex(item => item.Queue_ID === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    const deleted = data.splice(idx, 1)[0];
    writeCSV(VIDEO_QUEUE_CSV, data);
    
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get Overview Statistics
app.get('/api/overview', async (req, res) => {
  try {
    const [researches, searchQueue, videoQueue] = await Promise.all([
      readCSV('ENTITIES/TASK_MANAGERS/RESEARCHES/RESEARCHES_Master_List.csv'),
      readCSV(SEARCH_QUEUE_CSV),
      readCSV(VIDEO_QUEUE_CSV),
    ]);

    // Calculate department distribution
    const departmentCounts = {};
    researches.data.forEach(item => {
      const dept = item.Department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const departmentDistribution = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Calculate status distribution for videos
    const videoStatusCounts = {};
    videoQueue.data.forEach(item => {
      const status = item.Status || 'Unknown';
      videoStatusCounts[status] = (videoStatusCounts[status] || 0) + 1;
    });

    const videoStatusDistribution = Object.entries(videoStatusCounts).map(([name, value]) => ({
      name,
      value
    }));

    res.json({
      success: true,
      data: {
        totalResearches: researches.data.filter(r => r.Status === 'Active' || r.Status === 'active').length,
        pendingSearchTasks: searchQueue.data.length,
        videosPendingProcessing: videoQueue.data.filter(v => v.Status !== 'Parsed' && v.Status !== 'Rejected').length,
        totalVideos: videoQueue.data.length,
        departmentDistribution,
        videoStatusDistribution,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dropboxRoot: DROPBOX_ROOT,
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📁 DROPBOX_ROOT: ${DROPBOX_ROOT}`);
});

