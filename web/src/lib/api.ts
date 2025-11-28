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
    priority?: string;
    department: string;
    topic_category?: string;
    research_source?: string;
    added_by: string;
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
