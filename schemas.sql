-- =====================================================
-- REMS Database Schema
-- PostgreSQL / Supabase
-- Created: 2025-11-28
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Department codes
CREATE TYPE department_code AS ENUM (
  'DEV',  -- Development
  'SMM',  -- Social Media Marketing
  'VID',  -- Video Production
  'AID',  -- AI & Automation
  'DGN',  -- Design
  'MKT'   -- Marketing
);

-- Video queue priority levels
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Video queue status
CREATE TYPE video_status AS ENUM (
  'pending',
  'selected',
  'transcribing',
  'transcribed',
  'processing',
  'complete',
  'rejected'
);

-- Search queue status (matches CSV exactly)
CREATE TYPE search_status AS ENUM (
  'Assigned',
  'In Progress',
  'Completed'
);

-- Entity types for extracted entities
CREATE TYPE entity_type AS ENUM (
  'TOOL',
  'WORKFLOW',
  'ACTION',
  'OBJECT'
);

-- Entity classification
CREATE TYPE entity_classification AS ENUM (
  'NEW',
  'EXISTING',
  'UPDATE'
);

-- =====================================================
-- LOOKUP TABLES
-- =====================================================

-- Departments reference table
CREATE TABLE departments (
  code department_code PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (code, name, description) VALUES
  ('DEV', 'Development', 'Software development and programming'),
  ('SMM', 'Social Media Marketing', 'Social media management and marketing'),
  ('VID', 'Video Production', 'Video editing and production'),
  ('AID', 'AI & Automation', 'AI tools and automation workflows'),
  ('DGN', 'Design', 'Graphic and UI/UX design'),
  ('MKT', 'Marketing', 'General marketing and advertising');

-- =====================================================
-- EMPLOYEES TABLE
-- =====================================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department department_code REFERENCES departments(code),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);

-- =====================================================
-- SEARCH QUEUE TABLE
-- Matches Search_Queue_Master.csv structure
-- =====================================================

CREATE TABLE search_queue (
  -- Primary key (CSV: Search_ID)
  search_id VARCHAR(20) PRIMARY KEY,  -- e.g., SEARCH-001
  
  -- CSV Fields
  employee VARCHAR(255),               -- Employee name or email
  department department_code NOT NULL REFERENCES departments(code),
  topic VARCHAR(255) NOT NULL,         -- Search topic category
  search_query TEXT NOT NULL,          -- Actual search query text
  status search_status NOT NULL DEFAULT 'Assigned',
  videos_found INTEGER DEFAULT 0,
  date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
  date_completed DATE,
  notes TEXT DEFAULT '',
  
  -- UI/Application fields (not in CSV)
  perplexity_creativity DECIMAL(3,2) DEFAULT 0.5,  -- 0.0 to 1.0
  perplexity_structure_mode BOOLEAN DEFAULT TRUE,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search_queue
CREATE INDEX idx_search_queue_status ON search_queue(status);
CREATE INDEX idx_search_queue_department ON search_queue(department);
CREATE INDEX idx_search_queue_employee ON search_queue(employee);
CREATE INDEX idx_search_queue_date_assigned ON search_queue(date_assigned);

-- Function to auto-generate Search_ID
CREATE OR REPLACE FUNCTION generate_search_id()
RETURNS TRIGGER AS $$
DECLARE
  max_num INTEGER;
  new_id VARCHAR(20);
BEGIN
  -- Get the maximum existing number
  SELECT COALESCE(MAX(CAST(SUBSTRING(search_id FROM 8) AS INTEGER)), 0)
  INTO max_num
  FROM search_queue
  WHERE search_id ~ '^SEARCH-[0-9]+$';
  
  -- Generate new ID
  new_id := 'SEARCH-' || LPAD((max_num + 1)::TEXT, 3, '0');
  NEW.search_id := new_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate Search_ID on insert (if not provided)
CREATE TRIGGER trigger_generate_search_id
  BEFORE INSERT ON search_queue
  FOR EACH ROW
  WHEN (NEW.search_id IS NULL OR NEW.search_id = '')
  EXECUTE FUNCTION generate_search_id();

-- =====================================================
-- VIDEO QUEUE TABLE
-- Matches Video_Queue_Master.csv structure
-- =====================================================

CREATE TABLE video_queue (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Video information
  video_url TEXT NOT NULL,
  video_title VARCHAR(500) NOT NULL,
  channel_name VARCHAR(255),
  duration_minutes INTEGER DEFAULT 0,
  
  -- Classification
  priority priority_level DEFAULT 'medium',
  status video_status DEFAULT 'pending',
  department department_code NOT NULL REFERENCES departments(code),
  
  -- Assignment
  assigned_to VARCHAR(255),            -- Employee name or email
  added_by VARCHAR(255) NOT NULL,      -- Who added this video
  
  -- Notes and references
  notes TEXT,
  perplexity_search_id VARCHAR(20) REFERENCES search_queue(search_id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for video_queue
CREATE INDEX idx_video_queue_status ON video_queue(status);
CREATE INDEX idx_video_queue_department ON video_queue(department);
CREATE INDEX idx_video_queue_priority ON video_queue(priority);
CREATE INDEX idx_video_queue_assigned_to ON video_queue(assigned_to);
CREATE INDEX idx_video_queue_search_id ON video_queue(perplexity_search_id);
CREATE INDEX idx_video_queue_created_at ON video_queue(created_at);

-- =====================================================
-- TRANSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_queue(id) ON DELETE CASCADE,
  
  -- Transcription content
  raw_text TEXT,
  formatted_text TEXT,
  language VARCHAR(10) DEFAULT 'en',
  
  -- Processing info
  transcription_source VARCHAR(50),    -- e.g., 'whisper', 'youtube_captions'
  processing_time_seconds INTEGER,
  word_count INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_transcriptions_video_id ON transcriptions(video_id);
CREATE INDEX idx_transcriptions_status ON transcriptions(status);

-- =====================================================
-- EXTRACTED ENTITIES TABLE
-- =====================================================

CREATE TABLE extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity identification
  entity_type entity_type NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  entity_id VARCHAR(100),              -- External or internal ID
  classification entity_classification DEFAULT 'NEW',
  
  -- Content
  description TEXT,
  category VARCHAR(100),
  
  -- Source reference
  video_id UUID REFERENCES video_queue(id) ON DELETE SET NULL,
  video_title VARCHAR(500),
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE SET NULL,
  
  -- Workflow specific fields
  steps_count INTEGER,
  estimated_time_minutes INTEGER,
  difficulty VARCHAR(50),              -- beginner, intermediate, advanced
  prerequisites TEXT[],                -- Array of prerequisite items
  outputs TEXT[],                      -- Array of output items
  
  -- Analysis metadata
  confidence_score DECIMAL(3,2),       -- 0.00 to 1.00
  metadata JSONB,                      -- Flexible additional data
  
  -- Timestamps
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for extracted_entities
CREATE INDEX idx_entities_type ON extracted_entities(entity_type);
CREATE INDEX idx_entities_classification ON extracted_entities(classification);
CREATE INDEX idx_entities_video_id ON extracted_entities(video_id);
CREATE INDEX idx_entities_name ON extracted_entities(entity_name);
CREATE INDEX idx_entities_category ON extracted_entities(category);

-- Full-text search on entity name and description
CREATE INDEX idx_entities_fts ON extracted_entities 
  USING GIN (to_tsvector('english', entity_name || ' ' || COALESCE(description, '')));

-- =====================================================
-- RESEARCH MASTER LIST TABLE
-- =====================================================

CREATE TABLE researches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., RES-001
  
  title VARCHAR(500) NOT NULL,
  description TEXT,
  department department_code REFERENCES departments(code),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'active',  -- active, completed, archived
  
  -- Counts
  total_searches INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_entities INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,          -- INSERT, UPDATE, DELETE
  
  -- Change details
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Who and when
  performed_by VARCHAR(255),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional context
  ip_address INET,
  user_agent TEXT
);

-- Index for audit queries
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_performed_at ON audit_log(performed_at);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_search_queue_updated_at
  BEFORE UPDATE ON search_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_queue_updated_at
  BEFORE UPDATE ON video_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON extracted_entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_researches_updated_at
  BEFORE UPDATE ON researches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Search queue with department names
CREATE VIEW v_search_queue AS
SELECT 
  sq.*,
  d.name as department_name
FROM search_queue sq
LEFT JOIN departments d ON sq.department = d.code;

-- View: Video queue with related info
CREATE VIEW v_video_queue AS
SELECT 
  vq.*,
  d.name as department_name,
  sq.topic as search_topic
FROM video_queue vq
LEFT JOIN departments d ON vq.department = d.code
LEFT JOIN search_queue sq ON vq.perplexity_search_id = sq.search_id;

-- View: Dashboard statistics
CREATE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM video_queue) as total_videos,
  (SELECT COUNT(*) FROM video_queue WHERE status = 'complete') as completed_videos,
  (SELECT COUNT(*) FROM video_queue WHERE status IN ('pending', 'selected', 'transcribing', 'processing')) as in_progress_videos,
  (SELECT COUNT(*) FROM search_queue) as total_searches,
  (SELECT COUNT(*) FROM search_queue WHERE status = 'Completed') as completed_searches,
  (SELECT COUNT(*) FROM extracted_entities) as total_entities;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional for Supabase
-- =====================================================

-- Enable RLS on tables (uncomment for Supabase)
-- ALTER TABLE search_queue ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE video_queue ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE extracted_entities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample search queue data
INSERT INTO search_queue (search_id, employee, department, topic, search_query, status, videos_found, date_assigned, date_completed, notes) VALUES
  ('SEARCH-001', 'Alex Johnson', 'DEV', 'AI Development Tools', 'Claude Desktop MCP setup tutorial 2024', 'Completed', 3, '2025-11-28', '2025-11-28', 'Focus on MCP integration'),
  ('SEARCH-002', 'Maria Garcia', 'DEV', 'Workflow Automation', 'n8n workflow automation examples for developers', 'In Progress', 0, '2025-11-28', NULL, ''),
  ('SEARCH-003', NULL, 'SMM', 'Social Media Tools', 'Social media caption AI tools comparison', 'Assigned', 0, '2025-11-28', NULL, 'Compare top 5 tools'),
  ('SEARCH-004', 'Jordan Smith', 'VID', 'Video Editing AI', 'Video editing AI tools 2024 premiere davinci', 'Completed', 5, '2025-11-27', '2025-11-27', 'Premiere and DaVinci plugins'),
  ('SEARCH-005', 'Sam Wilson', 'MKT', 'Marketing Automation', 'AI automation tools for marketing teams', 'Assigned', 0, '2025-11-27', NULL, 'Retry tomorrow'),
  ('SEARCH-006', 'Chris Taylor', 'DGN', 'AI Image Generation', 'Midjourney prompt engineering techniques advanced', 'Completed', 8, '2025-11-27', '2025-11-27', 'Advanced techniques only'),
  ('SEARCH-007', 'Alex Johnson', 'AID', 'ChatGPT Integration', 'ChatGPT API integration best practices 2024', 'In Progress', 0, '2025-11-28', NULL, ''),
  ('SEARCH-008', 'Maria Garcia', 'SMM', 'TikTok Strategy', 'TikTok content strategy for B2B companies', 'Completed', 4, '2025-11-26', '2025-11-26', 'B2B focus');

-- =====================================================
-- GRANTS (adjust as needed)
-- =====================================================

-- Grant permissions to application role (example)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

