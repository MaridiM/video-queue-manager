// API Client for Backend Communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || 'Request failed' };
    }

    return json;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// =====================================================
// SEARCH QUEUE API
// =====================================================

export interface SearchQueueAPI {
  search_id: string;
  employee: string | null;
  department: string;
  topic: string;
  search_query: string;
  status: string;
  videos_found: number;
  date_assigned: string;
  date_completed: string | null;
  notes: string;
  perplexity_creativity: number;
  perplexity_structure_mode: boolean;
  results_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncCSVResult {
  imported: number;
  updated: number;
  skipped: number;
  total: number;
  errors?: { searchId: string; error: string }[];
  csvPath: string;
}

export const searchQueueAPI = {
  // Get all search queue entries
  getAll: () => fetchAPI<SearchQueueAPI[]>('/api/search-queue'),

  // Create new search queue entry
  create: (data: {
    employee: string;
    department: string;
    topic: string;
    search_query: string;
    notes?: string;
  }) => fetchAPI<SearchQueueAPI>('/api/search-queue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update search queue entry
  update: (id: string, data: Partial<{
    employee: string;
    department: string;
    topic: string;
    search_query: string;
    status: string;
    videos_found: number;
    notes: string;
    date_completed: string;
    error_message: string;
  }>) => fetchAPI<SearchQueueAPI>(`/api/search-queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete search queue entry
  delete: (id: string) => fetchAPI<SearchQueueAPI>(`/api/search-queue/${id}`, {
    method: 'DELETE',
  }),

  // Sync from CSV file in Dropbox
  syncFromCSV: () => fetchAPI<SyncCSVResult>('/api/search-queue/sync-csv', {
    method: 'POST',
  }),
};

// =====================================================
// VIDEO QUEUE API
// =====================================================

export interface VideoQueueAPI {
  id: string;
  queue_id: string;
  video_id: string;
  video_url: string;
  video_title: string;
  channel_name: string | null;
  channel_url: string | null;
  duration_minutes: number;
  duration: string | null;
  views: number;
  likes: number;
  comments: number;
  publish_date: string | null;
  priority: string;
  status: string;
  department: string;
  topic_category: string | null;
  research_source: string | null;
  priority_score: number | null;
  assigned_to: string | null;
  added_by: string;
  added_date: string | null;
  selected_by: string | null;
  selected_date: string | null;
  parsed_date: string | null;
  notes: string | null;
  perplexity_search_id: string | null;
  created_at: string;
  updated_at: string;
}

export const videoQueueAPI = {
  // Get all video queue entries
  getAll: () => fetchAPI<VideoQueueAPI[]>('/api/video-queue'),

  // Create new video queue entry
  create: (data: {
    video_url: string;
    video_title: string;
    channel_name?: string;
    duration_minutes?: number;
    views?: number;
    likes?: number;
    comments?: number;
    publish_date?: string;
    priority?: string;
    department: string;
    topic_category?: string;
    research_source?: string;
    added_by?: string;
    notes?: string;
    perplexity_search_id?: string;
  }) => fetchAPI<VideoQueueAPI>('/api/video-queue', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update video queue entry
  update: (id: string, data: Partial<{
    video_title: string;
    video_url: string;
    channel_name: string;
    duration_minutes: number;
    priority: string;
    status: string;
    department: string;
    notes: string;
    assigned_to: string;
    selected_by: string;
  }>) => fetchAPI<VideoQueueAPI>(`/api/video-queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete video queue entry
  delete: (id: string) => fetchAPI<VideoQueueAPI>(`/api/video-queue/${id}`, {
    method: 'DELETE',
  }),

  // Sync from CSV file in Dropbox
  syncFromCSV: () => fetchAPI<SyncCSVResult>('/api/video-queue/sync-csv', {
    method: 'POST',
  }),

  // Export to file (returns URL to download)
  // Supports: csv, json, md (markdown)
  getExportUrl: (format: 'csv' | 'json' | 'md', status?: string) => {
    let url = `${API_BASE_URL}/api/video-queue/export?format=${format}`;
    if (status) url += `&status=${status}`;
    return url;
  },

  // Batch update multiple videos at once
  // Matches Python script: update_queue_status.py -> update_multiple_status()
  batchUpdate: (data: {
    queue_ids: string[];
    status: string;
    selected_by?: string;
  }) => fetchAPI<{
    updated: number;
    failed: number;
    successful: string[];
    errors?: { queueId: string; error: string }[];
  }>('/api/video-queue/batch-update', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get queue summary statistics
  // Matches Python script: update_queue_status.py -> show_queue_summary()
  getSummary: () => fetchAPI<{
    total: number;
    total_views: number;
    total_likes: number;
    average_priority_score: string;
    by_status: { status: string; count: number; percentage: string }[];
    top_topics: { topic: string; count: number }[];
    by_source: { source: string; count: number }[];
    by_department: { department: string; count: number }[];
  }>('/api/video-queue/summary'),
};

// =====================================================
// OTHER APIs
// =====================================================

export interface DepartmentAPI {
  code: string;
  name: string;
  description: string | null;
}

export interface OverviewAPI {
  totalSearches: number;
  completedSearches: number;
  totalVideos: number;
  completedVideos: number;
  pendingSearchTasks: number;
  videosPendingProcessing: number;
  departmentDistribution: { name: string; value: number }[];
  videoStatusDistribution: { name: string; value: number }[];
}

export const departmentsAPI = {
  getAll: () => fetchAPI<DepartmentAPI[]>('/api/departments'),
};

export const overviewAPI = {
  get: () => fetchAPI<OverviewAPI>('/api/overview'),
};

export const healthAPI = {
  check: () => fetchAPI<{ status: string; database: string; timestamp: string }>('/api/health'),
};

// =====================================================
// PROMPTS API
// =====================================================

export interface PromptData {
  promptId: string;
  fileName: string;
  content: string;
  filePath: string;
  lastModified: string;
}

export interface PromptListItem {
  promptId: string;
  fileName: string;
  path: string;
}

export const promptsAPI = {
  // Get all available prompts
  getAll: () => fetchAPI<PromptListItem[]>('/api/prompts'),

  // Get specific prompt by ID (e.g., 'PMT-004', 'PMT-090')
  getById: (promptId: string) => fetchAPI<PromptData>(`/api/prompts/${promptId}`),
};

// =====================================================
// TRANSCRIPTION API
// =====================================================

export interface TranscriptSegment {
  timestamp: string;
  offsetMs: number;
  duration: number;
  text: string;
}

export interface TranscriptionData {
  videoId: string;
  videoUrl: string;
  totalSegments: number;
  totalDuration: string;
  totalDurationMs: number;
  transcript: TranscriptSegment[];
  plainText: string;
  rawText: string;
  fetchedAt: string;
}

export interface ProcessedTranscription {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  language: string;
  rawTranscriptLength: number;
  processedLength: number;
  savedFilePath: string | null;
  timing: {
    transcriptFetch: number;
    aiProcessing: number;
    total: number;
  };
  processedContent: string;
}

export interface TranscriptionStatus {
  youtubeTranscript: boolean;
  aiProcessing: boolean;
  openAIConfigured: boolean;
}

export const transcriptionAPI = {
  // Fetch YouTube video transcript
  fetchYouTube: (videoUrl: string) => fetchAPI<TranscriptionData>('/api/transcription/youtube', {
    method: 'POST',
    body: JSON.stringify({ videoUrl }),
  }),

  // Fetch by video ID directly
  fetchByVideoId: (videoId: string) => fetchAPI<TranscriptionData>(`/api/transcription/youtube/${videoId}`),

  // Full pipeline: YouTube → AI Processing → Save
  processWithAI: (data: { 
    videoUrl: string; 
    videoTitle?: string; 
    saveToFile?: boolean 
  }) => fetchAPI<ProcessedTranscription>('/api/transcription/process', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Check if AI processing is available
  getStatus: () => fetchAPI<TranscriptionStatus>('/api/transcription/status'),
};