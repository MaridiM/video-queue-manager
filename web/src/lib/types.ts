export type Priority = 'low' | 'medium' | 'high';

export type Status = 
  | 'pending' 
  | 'selected' 
  | 'transcribing' 
  | 'transcribed' 
  | 'processing' 
  | 'complete' 
  | 'rejected';

export type Department = 'DEV' | 'SMM' | 'VID' | 'AID' | 'DGN' | 'MKT';

export interface VideoQueueItem {
  id: string;
  created_at: string;
  video_url: string;
  video_title: string;
  channel_name?: string;
  duration_minutes: number;
  priority: Priority;
  status: Status;
  department: Department;
  assigned_to?: string | null;
  added_by: string;
  notes?: string | null;
  perplexity_search_id?: string;
}

export interface VideoFormData {
  video_url: string;
  video_title: string;
  channel_name: string;
  duration_minutes: number;
  priority: Priority;
  department: Department;
  status: Status;
  notes: string;
}

export interface VideoImportRow {
  video_url: string;
  video_title: string;
  channel_name?: string;
  duration_minutes?: number | string;
  priority?: string;
  department?: string;
  assigned_to?: string;
  notes?: string;
  status?: string;
}

export type EntityType = 'TOOL' | 'WORKFLOW' | 'ACTION' | 'OBJECT';
export type EntityClassification = 'NEW' | 'EXISTING' | 'UPDATE';

export interface ExtractedEntity {
  id: string;
  entity_type: EntityType;
  entity_name: string;
  entity_id: string;
  classification: EntityClassification;
  description: string;
  video_id: string;
  video_title: string;
  extracted_at: string;
  confidence_score?: number;
  metadata?: Record<string, unknown>;
  
  // Specific fields
  category?: string;
  steps_count?: number;
  estimated_time_minutes?: number;
  difficulty?: string;
  prerequisites?: string[];
  outputs?: string[];
}
