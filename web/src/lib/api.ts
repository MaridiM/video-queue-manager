import type { VideoQueueItem, VideoFormData } from './types';

const API_BASE = 'http://localhost:3001/api';

export type Research = {
  RSR_ID: string;
  Name: string;
  Description: string;
  Department: string;
  Category: string;
  File_Path: string;
  Status: string;
  fileExists: boolean;
}

export type SearchTask = {
  Task_ID: string;
  Topic: string;
  Assignee: string;
  Status: string;
  Priority: string;
  Due_Date: string;
  Notes: string;
}

// Re-export Video type for backward compatibility
export type Video = VideoQueueItem;

export type OverviewData = {
  totalResearches: number;
  pendingSearchTasks: number;
  videosPendingProcessing: number;
  totalVideos: number;
  departmentDistribution: { name: string; value: number }[];
  videoStatusDistribution: { name: string; value: number }[];
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API Error');
  }
  
  return data.data;
}

export const api = {
  // Overview
  getOverview: () => fetchAPI<OverviewData>('/overview'),
  
  // Researches
  getResearches: () => fetchAPI<Research[]>('/researches'),
  
  // Search Queue
  getSearchQueue: () => fetchAPI<SearchTask[]>('/search-queue'),
  
  // Video Queue - CRUD Operations
  getVideoQueue: () => fetchAPI<VideoQueueItem[]>('/video-queue'),
  
  addVideo: (video: VideoFormData) => 
    fetchAPI<VideoQueueItem>('/video-queue', {
      method: 'POST',
      body: JSON.stringify(video),
    }),
  
  updateVideo: (id: string, video: Partial<VideoFormData>) =>
    fetchAPI<VideoQueueItem>(`/video-queue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(video),
    }),
  
  deleteVideo: (id: string) =>
    fetchAPI<VideoQueueItem>(`/video-queue/${id}`, {
      method: 'DELETE',
    }),
  
  // Health Check
  healthCheck: () => fetch(`${API_BASE}/health`).then(r => r.json()),
};
