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

// Search status (matches SQL ENUM)
export type SearchStatus = 'Assigned' | 'In Progress' | 'Completed';

// SearchQuery interface - matches SQL table search_queue
export interface SearchQuery {
  // Primary key
  search_id: string;                    // VARCHAR(20), e.g., SEARCH-001
  
  // Core fields
  employee: string | null;              // VARCHAR(255)
  department: Department;               // department_code ENUM
  topic: string;                        // VARCHAR(255)
  search_query: string;                 // TEXT
  status: SearchStatus;                 // search_status ENUM
  videos_found: number;                 // INTEGER
  date_assigned: string;                // DATE (YYYY-MM-DD)
  date_completed: string | null;        // DATE or NULL
  notes: string;                        // TEXT
  
  // Perplexity settings
  perplexity_creativity: number;        // DECIMAL(3,2), 0.0-1.0
  perplexity_structure_mode: boolean;   // BOOLEAN
  results_count: number;                // INTEGER
  error_message: string | null;         // TEXT or NULL
  
  // Timestamps
  created_at?: string;                  // TIMESTAMPTZ
  updated_at?: string;                  // TIMESTAMPTZ
}

// Form data for creating/editing search queries
export interface SearchFormData {
  employee: string;           // Required - Employee name or email
  department: Department;     // Required - Department code
  topic: string;              // Required - Search topic
  search_query: string;       // Required - Specific search query
  notes?: string;             // Optional - Additional notes
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
