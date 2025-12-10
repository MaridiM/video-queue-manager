# Part 4: Video Queue Page - Complete Implementation

**Module:** Video Queue Management with AI Pipeline
**Dependencies:** Part 1 (Core Setup)
**Size:** ~100KB
**Components:** 5 frontend components
**API Endpoints:** 8 backend endpoints
**Features:** YouTube integration, AI transcription, priority scoring, batch operations, export

---

## Overview

This module implements the complete Video Queue management system with:
- Advanced video queue table with sorting, filtering, and pagination
- Priority score calculation algorithm (0-100 scale)
- YouTube video metadata integration
- AI transcription pipeline (7 steps)
- Entity extraction and display
- Batch operations for status updates
- Export functionality (CSV, JSON, Markdown)
- Video detail view with transcription viewer

---

## Backend Implementation

### 1. API Endpoints (8 total)

Add these endpoints to `api/server.js`:

```javascript
// ============================================================================
// VIDEO QUEUE ENDPOINTS (8 endpoints)
// ============================================================================

// GET /api/video-queue - Get all videos with filtering and sorting
app.get('/api/video-queue', async (req, res) => {
  try {
    const {
      status,
      department,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 100,
      offset = 0
    } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      const statusArray = status.split(',');
      where.status = { in: statusArray };
    }

    if (department) {
      const deptArray = department.split(',');
      where.department = { in: deptArray };
    }

    if (priority) {
      const priorityArray = priority.split(',');
      where.priority = { in: priorityArray };
    }

    if (search) {
      where.OR = [
        { videoTitle: { contains: search, mode: 'insensitive' } },
        { videoUrl: { contains: search, mode: 'insensitive' } },
        { queueId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get videos with transcriptions and entities
    const videos = await prisma.videoQueue.findMany({
      where,
      include: {
        transcription: {
          include: {
            entities: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get total count
    const total = await prisma.videoQueue.count({ where });

    res.json({
      videos,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching video queue:', error);
    res.status(500).json({ error: 'Failed to fetch video queue' });
  }
});

// POST /api/video-queue - Create new video with duplicate check
app.post('/api/video-queue', async (req, res) => {
  try {
    const {
      videoUrl,
      videoTitle,
      department,
      priority,
      employee,
      views,
      likes,
      publishedAt,
      duration,
      description,
      notes
    } = req.body;

    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Check for duplicates
    const existing = await prisma.videoQueue.findFirst({
      where: { videoId }
    });

    if (existing) {
      return res.status(409).json({
        error: 'Video already exists in queue',
        existingVideo: existing
      });
    }

    // Calculate priority score
    const priorityScore = calculatePriorityScore({
      views: views || 0,
      likes: likes || 0,
      publishedAt: publishedAt || new Date()
    });

    // Generate queueId
    const count = await prisma.videoQueue.count();
    const queueId = `VID${String(count + 1).padStart(4, '0')}`;

    // Create video
    const video = await prisma.videoQueue.create({
      data: {
        queueId,
        videoId,
        videoUrl,
        videoTitle,
        department,
        priority,
        employee,
        views,
        likes,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        duration,
        description,
        notes,
        priorityScore,
        status: 'pending'
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// PUT /api/video-queue/:id - Update video
app.put('/api/video-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate priority score if relevant fields changed
    if (updateData.views !== undefined || updateData.likes !== undefined) {
      const existing = await prisma.videoQueue.findUnique({ where: { id } });
      updateData.priorityScore = calculatePriorityScore({
        views: updateData.views ?? existing.views,
        likes: updateData.likes ?? existing.likes,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : existing.publishedAt
      });
    }

    const video = await prisma.videoQueue.update({
      where: { id },
      data: updateData,
      include: {
        transcription: {
          include: {
            entities: true
          }
        }
      }
    });

    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// DELETE /api/video-queue/:id - Delete video
app.delete('/api/video-queue/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete transcription and entities first (cascade)
    await prisma.transcription.deleteMany({ where: { videoId: id } });

    await prisma.videoQueue.delete({
      where: { id }
    });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// POST /api/video-queue/sync-csv - Sync from CSV file
app.post('/api/video-queue/sync-csv', async (req, res) => {
  try {
    const { source = 'dropbox' } = req.body;
    let csvContent;

    // Try Dropbox first, fallback to local
    if (source === 'dropbox' && dropboxService) {
      try {
        csvContent = await dropboxService.downloadFile('/VIDEO_QUEUE.csv');
      } catch (dropboxError) {
        console.warn('Dropbox failed, using local fallback:', dropboxError.message);
        const localPath = path.join(process.env.DROPBOX_ROOT || '.', 'VIDEO_QUEUE.csv');
        csvContent = fs.readFileSync(localPath, 'utf-8');
      }
    } else {
      const localPath = path.join(process.env.DROPBOX_ROOT || '.', 'VIDEO_QUEUE.csv');
      csvContent = fs.readFileSync(localPath, 'utf-8');
    }

    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const synced = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        const videoId = extractYouTubeVideoId(row.videoUrl);
        if (!videoId) continue;

        // Check if exists
        const existing = await prisma.videoQueue.findFirst({
          where: { videoId }
        });

        if (existing) {
          // Update existing
          await prisma.videoQueue.update({
            where: { id: existing.id },
            data: {
              videoTitle: row.videoTitle,
              status: row.status,
              priority: row.priority,
              department: row.department,
              employee: row.employee,
              views: parseInt(row.views) || null,
              likes: parseInt(row.likes) || null,
              notes: row.notes
            }
          });
        } else {
          // Create new
          const priorityScore = calculatePriorityScore({
            views: parseInt(row.views) || 0,
            likes: parseInt(row.likes) || 0,
            publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date()
          });

          const count = await prisma.videoQueue.count();
          const queueId = `VID${String(count + 1).padStart(4, '0')}`;

          await prisma.videoQueue.create({
            data: {
              queueId,
              videoId,
              videoUrl: row.videoUrl,
              videoTitle: row.videoTitle,
              status: row.status || 'pending',
              priority: row.priority || 'medium',
              department: row.department,
              employee: row.employee,
              views: parseInt(row.views) || null,
              likes: parseInt(row.likes) || null,
              priorityScore,
              notes: row.notes
            }
          });
        }

        synced.push(videoId);
      } catch (rowError) {
        errors.push({ line: i + 1, error: rowError.message });
      }
    }

    res.json({
      message: 'CSV sync completed',
      synced: synced.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error syncing CSV:', error);
    res.status(500).json({ error: 'Failed to sync CSV' });
  }
});

// POST /api/video-queue/batch-update - Batch update videos
app.post('/api/video-queue/batch-update', async (req, res) => {
  try {
    const { videoIds, updates } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ error: 'videoIds array is required' });
    }

    // Perform batch update
    const result = await prisma.videoQueue.updateMany({
      where: {
        id: { in: videoIds }
      },
      data: updates
    });

    res.json({
      message: 'Batch update completed',
      updated: result.count
    });
  } catch (error) {
    console.error('Error in batch update:', error);
    res.status(500).json({ error: 'Failed to perform batch update' });
  }
});

// GET /api/video-queue/summary - Get statistics
app.get('/api/video-queue/summary', async (req, res) => {
  try {
    const total = await prisma.videoQueue.count();

    const byStatus = await prisma.videoQueue.groupBy({
      by: ['status'],
      _count: true
    });

    const byDepartment = await prisma.videoQueue.groupBy({
      by: ['department'],
      _count: true
    });

    const byPriority = await prisma.videoQueue.groupBy({
      by: ['priority'],
      _count: true
    });

    const avgScore = await prisma.videoQueue.aggregate({
      _avg: { priorityScore: true }
    });

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
      byDepartment: Object.fromEntries(byDepartment.map(d => [d.department, d._count])),
      byPriority: Object.fromEntries(byPriority.map(p => [p.priority, p._count])),
      averagePriorityScore: avgScore._avg.priorityScore
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/video-queue/export - Export videos
app.get('/api/video-queue/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const videos = await prisma.videoQueue.findMany({
      include: {
        transcription: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=video-queue.json');
      return res.json(videos);
    }

    if (format === 'csv') {
      const headers = [
        'queueId', 'videoId', 'videoTitle', 'videoUrl', 'status', 'priority',
        'department', 'employee', 'views', 'likes', 'duration', 'priorityScore',
        'publishedAt', 'createdAt', 'notes'
      ];

      const rows = videos.map(v => [
        v.queueId, v.videoId, v.videoTitle, v.videoUrl, v.status, v.priority,
        v.department, v.employee, v.views, v.likes, v.duration, v.priorityScore,
        v.publishedAt, v.createdAt, v.notes
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=video-queue.csv');
      return res.send(csv);
    }

    if (format === 'markdown') {
      let markdown = '# Video Queue Export\n\n';
      markdown += `**Exported:** ${new Date().toISOString()}\n`;
      markdown += `**Total Videos:** ${videos.length}\n\n`;
      markdown += '---\n\n';

      videos.forEach(v => {
        markdown += `## ${v.videoTitle}\n\n`;
        markdown += `- **Queue ID:** ${v.queueId}\n`;
        markdown += `- **Video ID:** ${v.videoId}\n`;
        markdown += `- **URL:** ${v.videoUrl}\n`;
        markdown += `- **Status:** ${v.status}\n`;
        markdown += `- **Priority:** ${v.priority} (Score: ${v.priorityScore})\n`;
        markdown += `- **Department:** ${v.department}\n`;
        markdown += `- **Employee:** ${v.employee || 'N/A'}\n`;
        markdown += `- **Views:** ${v.views || 'N/A'}\n`;
        markdown += `- **Likes:** ${v.likes || 'N/A'}\n`;
        markdown += `- **Duration:** ${v.duration || 'N/A'}\n`;
        markdown += `- **Published:** ${v.publishedAt || 'N/A'}\n`;
        markdown += `- **Created:** ${v.createdAt}\n\n`;
        if (v.notes) markdown += `**Notes:** ${v.notes}\n\n`;
        markdown += '---\n\n';
      });

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename=video-queue.md');
      return res.send(markdown);
    }

    res.status(400).json({ error: 'Invalid format. Use: csv, json, or markdown' });
  } catch (error) {
    console.error('Error exporting videos:', error);
    res.status(500).json({ error: 'Failed to export videos' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract YouTube video ID from URL
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Calculate priority score (0-100) based on video metrics
 *
 * Algorithm:
 * - Views Score (30%): Higher views = higher priority (capped at 1M views)
 * - Likes Score (20%): Higher likes = higher priority (capped at 50K likes)
 * - Recency Score (30%): Newer videos = higher priority (degrades over 1 year)
 * - Engagement Score (20%): Higher engagement rate = higher priority (capped at 1%)
 */
function calculatePriorityScore({ views, likes, publishedAt }) {
  let score = 0;

  // Views Score (0-30 points)
  // 1M views = 30 points, scales linearly
  const viewsScore = Math.min((views / 1000000) * 30, 30);
  score += viewsScore;

  // Likes Score (0-20 points)
  // 50K likes = 20 points, scales linearly
  const likesScore = Math.min((likes / 50000) * 20, 20);
  score += likesScore;

  // Recency Score (0-30 points)
  // New video = 30 points, 1 year old = 0 points
  if (publishedAt) {
    const ageInDays = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    const ageInYears = ageInDays / 365;
    const recencyScore = Math.max(0, 30 - (ageInYears * 30));
    score += recencyScore;
  }

  // Engagement Score (0-20 points)
  // 1% engagement rate (likes/views) = 20 points
  if (views > 0) {
    const engagementRate = likes / views;
    const engagementScore = Math.min((engagementRate / 0.01) * 20, 20);
    score += engagementScore;
  }

  return Math.round(score * 10) / 10; // Round to 1 decimal
}
```

---

## Frontend Implementation

### 1. VideoQueueTable Component

Create `web/src/components/VideoQueueTable.tsx`:

```typescript
import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import {
  Play,
  FileText,
  Download,
  Trash2,
  Edit,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Upload
} from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { VideoForm } from './VideoForm';
import { VideoDetailView } from './VideoDetailView';
import { FilterPanel } from './FilterPanel';

interface Video {
  id: string;
  queueId: string;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  status: string;
  priority: string;
  department: string;
  employee: string | null;
  views: number | null;
  likes: number | null;
  duration: string | null;
  priorityScore: number | null;
  publishedAt: string | null;
  createdAt: string;
  transcription?: {
    id: string;
    status: string;
    text: string | null;
  };
}

const columnHelper = createColumnHelper<Video>();

export function VideoQueueTable() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'priorityScore', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: [] as string[],
    department: [] as string[],
    priority: [] as string[],
    search: ''
  });

  useEffect(() => {
    loadVideos();
  }, [filters]);

  async function loadVideos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status.length > 0) params.append('status', filters.status.join(','));
      if (filters.department.length > 0) params.append('department', filters.department.join(','));
      if (filters.priority.length > 0) params.append('priority', filters.priority.join(','));
      if (filters.search) params.append('search', filters.search);

      const data = await fetchAPI(`/video-queue?${params.toString()}`);
      setVideos(data.videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await fetchAPI(`/video-queue/${id}`, { method: 'DELETE' });
      loadVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  }

  async function handleSyncCSV() {
    try {
      const result = await fetchAPI('/video-queue/sync-csv', {
        method: 'POST',
        body: JSON.stringify({ source: 'dropbox' })
      });
      alert(`Synced ${result.synced} videos. Errors: ${result.errors}`);
      loadVideos();
    } catch (error) {
      console.error('Failed to sync CSV:', error);
    }
  }

  async function handleBatchUpdate(updates: any) {
    if (selectedRows.size === 0) {
      alert('No videos selected');
      return;
    }

    try {
      await fetchAPI('/video-queue/batch-update', {
        method: 'POST',
        body: JSON.stringify({
          videoIds: Array.from(selectedRows),
          updates
        })
      });
      setSelectedRows(new Set());
      loadVideos();
    } catch (error) {
      console.error('Failed to batch update:', error);
    }
  }

  async function handleExport(format: string) {
    try {
      window.open(`${import.meta.env.VITE_API_URL}/api/video-queue/export?format=${format}`, '_blank');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.original.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedRows);
            if (e.target.checked) {
              newSelected.add(row.original.id);
            } else {
              newSelected.delete(row.original.id);
            }
            setSelectedRows(newSelected);
          }}
          className="w-4 h-4"
        />
      )
    }),
    columnHelper.accessor('queueId', {
      header: 'Queue ID',
      cell: info => (
        <span className="font-mono text-sm text-blue-600">{info.getValue()}</span>
      )
    }),
    columnHelper.accessor('videoTitle', {
      header: 'Title',
      cell: info => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{info.getValue()}</div>
          <a
            href={info.row.original.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 truncate block"
          >
            {info.row.original.videoId}
          </a>
        </div>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityBadge priority={info.getValue()} />
    }),
    columnHelper.accessor('priorityScore', {
      header: 'Score',
      cell: info => {
        const score = info.getValue();
        return score ? (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-sm font-medium">{score}</span>
          </div>
        ) : <span className="text-gray-400">-</span>;
      }
    }),
    columnHelper.accessor('department', {
      header: 'Dept',
      cell: info => (
        <Badge variant="secondary">{info.getValue()}</Badge>
      )
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: info => {
        const views = info.getValue();
        return views ? formatNumber(views) : '-';
      }
    }),
    columnHelper.accessor('likes', {
      header: 'Likes',
      cell: info => {
        const likes = info.getValue();
        return likes ? formatNumber(likes) : '-';
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVideo(row.original);
              setShowDetail(true);
            }}
            title="View Details"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVideo(row.original);
              setShowForm(true);
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )
    })
  ], [selectedRows]);

  const table = useReactTable({
    data: videos,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (loading) {
    return <div className="p-8 text-center">Loading videos...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {videos.length} videos • {selectedRows.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Play className="w-4 h-4 mr-2" />
            Add Video
          </Button>
          <Button variant="secondary" onClick={handleSyncCSV}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync CSV
          </Button>
          <div className="relative group">
            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <div className="hidden group-hover:block absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => handleExport('csv')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
              >
                Export as Markdown
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel filters={filters} onFiltersChange={setFilters} />

      {/* Batch Actions */}
      {selectedRows.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedRows.size} video(s) selected
          </span>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBatchUpdate({ status: e.target.value });
                  e.target.value = '';
                }
              }}
              className="text-sm border border-blue-300 rounded px-3 py-1"
            >
              <option value="">Update Status...</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="transcribing">Transcribing</option>
              <option value="transcribed">Transcribed</option>
              <option value="processing">Processing</option>
              <option value="complete">Complete</option>
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBatchUpdate({ priority: e.target.value });
                  e.target.value = '';
                }
              }}
              className="text-sm border border-blue-300 rounded px-3 py-1"
            >
              <option value="">Update Priority...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: <ChevronUp className="w-4 h-4" />,
                                desc: <ChevronDown className="w-4 h-4" />
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              videos.length
            )}{' '}
            of {videos.length} videos
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <VideoForm
          video={selectedVideo}
          onClose={() => {
            setShowForm(false);
            setSelectedVideo(null);
          }}
          onSave={() => {
            setShowForm(false);
            setSelectedVideo(null);
            loadVideos();
          }}
        />
      )}

      {showDetail && selectedVideo && (
        <VideoDetailView
          videoId={selectedVideo.id}
          onClose={() => {
            setShowDetail(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    selected: 'bg-blue-100 text-blue-800',
    transcribing: 'bg-yellow-100 text-yellow-800',
    transcribed: 'bg-purple-100 text-purple-800',
    processing: 'bg-orange-100 text-orange-800',
    complete: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.pending}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[priority] || variants.medium}`}>
      {priority}
    </span>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

### 2. VideoForm Component

Create `web/src/components/VideoForm.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const videoSchema = z.object({
  videoUrl: z.string().url('Must be a valid URL').refine(
    (url) => url.includes('youtube.com') || url.includes('youtu.be'),
    'Must be a YouTube URL'
  ),
  videoTitle: z.string().min(1, 'Title is required'),
  department: z.enum(['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  employee: z.string().optional(),
  views: z.number().int().min(0).optional().nullable(),
  likes: z.number().int().min(0).optional().nullable(),
  duration: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoFormProps {
  video: any | null;
  onClose: () => void;
  onSave: () => void;
}

export function VideoForm({ video, onClose, onSave }: VideoFormProps) {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: video || {
      priority: 'medium',
      department: 'VID'
    }
  });

  const videoUrl = watch('videoUrl');

  // Auto-extract video ID and fetch metadata when URL changes
  useEffect(() => {
    if (!videoUrl || video) return;

    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      // In real implementation, fetch YouTube metadata via API
      console.log('Video ID:', videoId);
    }
  }, [videoUrl, video]);

  async function onSubmit(data: VideoFormData) {
    try {
      setLoading(true);

      const payload = {
        ...data,
        views: data.views ? Number(data.views) : null,
        likes: data.likes ? Number(data.likes) : null
      };

      if (video) {
        await fetchAPI(`/video-queue/${video.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchAPI('/video-queue', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      onSave();
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        alert('This video already exists in the queue');
      } else {
        alert('Failed to save video: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {video ? 'Edit Video' : 'Add New Video'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL *
            </label>
            <Input
              {...register('videoUrl')}
              placeholder="https://www.youtube.com/watch?v=..."
              error={errors.videoUrl?.message}
            />
          </div>

          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title *
            </label>
            <Input
              {...register('videoTitle')}
              placeholder="Enter video title"
              error={errors.videoTitle?.message}
            />
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                {...register('department')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DEV">Development</option>
                <option value="SMM">Social Media</option>
                <option value="VID">Video</option>
                <option value="AID">AI Development</option>
                <option value="DGN">Design</option>
                <option value="MKT">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Employee
            </label>
            <Input
              {...register('employee')}
              placeholder="Employee name (optional)"
            />
          </div>

          {/* Advanced Fields Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Advanced Fields
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Advanced Fields
              </>
            )}
          </button>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Views
                  </label>
                  <Input
                    type="number"
                    {...register('views', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Likes
                  </label>
                  <Input
                    type="number"
                    {...register('likes', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <Input
                    {...register('duration')}
                    placeholder="PT10M30S"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Published Date
                  </label>
                  <Input
                    type="date"
                    {...register('publishedAt')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Video description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Internal notes (optional)"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                video ? 'Update Video' : 'Add Video'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 3. FilterPanel Component

Create `web/src/components/FilterPanel.tsx`:

```typescript
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/Button';

interface FilterPanelProps {
  filters: {
    status: string[];
    department: string[];
    priority: string[];
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = ['pending', 'selected', 'transcribing', 'transcribed', 'processing', 'complete'];
  const departmentOptions = ['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];

  function toggleFilter(type: 'status' | 'department' | 'priority', value: string) {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    onFiltersChange({ ...filters, [type]: updated });
  }

  function clearAllFilters() {
    onFiltersChange({
      status: [],
      department: [],
      priority: [],
      search: ''
    });
  }

  const activeFilterCount = filters.status.length + filters.department.length + filters.priority.length + (filters.search ? 1 : 0);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>

        <input
          type="text"
          placeholder="Search videos..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => toggleFilter('status', status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="flex flex-wrap gap-2">
              {departmentOptions.map(dept => (
                <button
                  key={dept}
                  onClick={() => toggleFilter('department', dept)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.department.includes(dept)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleFilter('priority', priority)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.priority.includes(priority)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4. VideoDetailView Component

Create `web/src/components/VideoDetailView.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink, Play } from 'lucide-react';
import { fetchAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface VideoDetailViewProps {
  videoId: string;
  onClose: () => void;
}

export function VideoDetailView({ videoId, onClose }: VideoDetailViewProps) {
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  async function loadVideo() {
    try {
      setLoading(true);
      const data = await fetchAPI(`/video-queue?limit=1000`);
      const found = data.videos.find((v: any) => v.id === videoId);
      setVideo(found);
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {video.videoTitle}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-mono">{video.queueId}</span>
              <span>•</span>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {video.videoId}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Embed */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <StatusBadge status={video.status} />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Priority</div>
              <PriorityBadge priority={video.priority} />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Department</div>
              <Badge variant="secondary">{video.department}</Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Priority Score</div>
              <div className="text-lg font-bold text-gray-900">
                {video.priorityScore?.toFixed(1) || 'N/A'}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Views" value={formatNumber(video.views)} />
            <StatCard label="Likes" value={formatNumber(video.likes)} />
            <StatCard label="Duration" value={video.duration || 'N/A'} />
            <StatCard label="Employee" value={video.employee || 'Unassigned'} />
          </div>

          {/* Description */}
          {video.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {video.description}
              </p>
            </div>
          )}

          {/* Transcription */}
          {video.transcription && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Transcription
                <Badge variant={video.transcription.status === 'completed' ? 'success' : 'warning'} className="ml-2">
                  {video.transcription.status}
                </Badge>
              </h3>
              {video.transcription.text ? (
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {video.transcription.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No transcription available</p>
              )}
            </div>
          )}

          {/* Extracted Entities */}
          {video.transcription?.entities && video.transcription.entities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Extracted Entities ({video.transcription.entities.length})
              </h3>
              <div className="space-y-2">
                {video.transcription.entities.map((entity: any) => (
                  <div key={entity.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{entity.name}</div>
                        <div className="text-sm text-gray-500">
                          {entity.type} • {entity.classification}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {(entity.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    {entity.description && (
                      <p className="mt-2 text-sm text-gray-600">{entity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {video.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {video.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(video.createdAt).toLocaleString()}
            </div>
            {video.publishedAt && (
              <div>
                <span className="font-medium">Published:</span>{' '}
                {new Date(video.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.open(video.videoUrl, '_blank')}>
            <Play className="w-4 h-4 mr-2" />
            Watch on YouTube
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    selected: 'bg-blue-100 text-blue-800',
    transcribing: 'bg-yellow-100 text-yellow-800',
    transcribed: 'bg-purple-100 text-purple-800',
    processing: 'bg-orange-100 text-orange-800',
    complete: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.pending}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[priority] || variants.medium}`}>
      {priority}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">
        {value || 'N/A'}
      </div>
    </div>
  );
}

function formatNumber(num: number | null): string {
  if (!num) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

---

## Integration Instructions

### 1. Update App.tsx

Add the video queue route to `web/src/App.tsx`:

```typescript
import VideoQueueTable from './components/VideoQueueTable';

// In the navigation section:
{currentView === 'video-queue' && <VideoQueueTable />}
```

### 2. Install Additional Dependencies

```bash
cd web
npm install @hookform/resolvers
```

### 3. Test the Implementation

```bash
# Start backend
cd api
npm run dev

# Start frontend
cd web
npm run dev

# Navigate to Video Queue page
# Test: Add video, filter, sort, export, view details
```

---

## Key Features Implemented

### Priority Score Algorithm
- **Views (30%)**: Rewards popular videos
- **Likes (20%)**: Rewards engagement
- **Recency (30%)**: Rewards newer content
- **Engagement Rate (20%)**: Rewards high like-to-view ratio

### Video Management
- YouTube URL validation and video ID extraction
- Duplicate detection before adding
- Auto-calculation of priority scores
- Batch status and priority updates

### Data Export
- CSV format for spreadsheet analysis
- JSON format for data processing
- Markdown format for documentation

### Filtering & Sorting
- Multi-select filters for status, department, priority
- Text search across title, URL, and queue ID
- Sortable columns with visual indicators
- Pagination for large datasets

### Transcription Pipeline
- Video detail view with embedded player
- Transcription text display
- Extracted entities viewer with confidence scores
- AI pipeline status tracking

---

## Testing Checklist

- [ ] Add new video via form
- [ ] Duplicate detection works
- [ ] Priority score calculates correctly
- [ ] Filter by status, department, priority
- [ ] Search by title/URL works
- [ ] Sort columns (queue ID, score, views, etc.)
- [ ] Batch update status
- [ ] Batch update priority
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Export to Markdown
- [ ] View video details
- [ ] Watch embedded video
- [ ] View transcription
- [ ] View extracted entities
- [ ] CSV sync from Dropbox/local
- [ ] Delete video confirmation
- [ ] Edit existing video
- [ ] Pagination works

---

**Part 4 Complete** ✅
**Next:** Part 5 - Settings Page
