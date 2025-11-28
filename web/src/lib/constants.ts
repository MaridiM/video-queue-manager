import type { VideoQueueItem, ExtractedEntity, VideoImportRow, SearchQuery } from './types';

export const DEPARTMENTS = ['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'] as const;

export const STATUSES = [
  'pending',
  'selected',
  'transcribing',
  'transcribed',
  'processing',
  'complete',
  'rejected'
] as const;

export const PRIORITIES = ['low', 'medium', 'high'] as const;

export const FILTER_OPTIONS = {
  status: [
    { value: 'pending', label: 'Pending', count: 24 },
    { value: 'selected', label: 'Selected', count: 18 },
    { value: 'transcribing', label: 'Transcribing', count: 8 },
    { value: 'transcribed', label: 'Transcribed', count: 32 },
    { value: 'processing', label: 'Processing', count: 12 },
    { value: 'complete', label: 'Complete', count: 118 },
    { value: 'rejected', label: 'Rejected', count: 6 }
  ],
  department: [
    { value: 'DEV', label: 'Development', count: 45 },
    { value: 'SMM', label: 'Social Media', count: 38 },
    { value: 'VID', label: 'Video', count: 22 },
    { value: 'AID', label: 'AI & Automation', count: 51 },
    { value: 'DGN', label: 'Design', count: 14 },
    { value: 'MKT', label: 'Marketing', count: 18 }
  ],
  priority: [
    { value: 'high', label: 'High Priority', count: 28 },
    { value: 'medium', label: 'Medium Priority', count: 102 },
    { value: 'low', label: 'Low Priority', count: 58 }
  ]
};

export const MOCK_VIDEOS: VideoQueueItem[] = [
  {
    id: '1',
    created_at: '2025-11-28T10:00:00Z',
    video_url: 'https://youtube.com/watch?v=abc123',
    video_title: 'Claude Desktop MCP Setup Tutorial',
    channel_name: 'AI Explained',
    duration_minutes: 15,
    priority: 'high',
    status: 'selected',
    department: 'DEV',
    assigned_to: 'alex@remotehelpers.com',
    added_by: 'maria@remotehelpers.com',
    notes: 'Great tutorial on MCP connectors',
    perplexity_search_id: 'search_123'
  },
  {
    id: '2',
    created_at: '2025-11-28T11:30:00Z',
    video_url: 'https://youtube.com/watch?v=xyz789',
    video_title: 'n8n Workflow Automation for Developers',
    channel_name: 'DevOps Weekly',
    duration_minutes: 22,
    priority: 'medium',
    status: 'transcribing',
    department: 'DEV',
    assigned_to: 'jordan@remotehelpers.com',
    added_by: 'alex@remotehelpers.com',
    notes: null,
    perplexity_search_id: 'search_124'
  },
  {
    id: '3',
    created_at: '2025-11-27T09:00:00Z',
    video_url: 'https://youtube.com/watch?v=def456',
    video_title: 'Social Media Caption AI Tools',
    channel_name: 'Marketing Pro',
    duration_minutes: 18,
    priority: 'low',
    status: 'pending',
    department: 'SMM',
    assigned_to: null,
    added_by: 'sam@remotehelpers.com',
    notes: 'Check if tools are free',
    perplexity_search_id: 'search_125'
  },
  {
    id: '4',
    created_at: '2025-11-27T14:20:00Z',
    video_url: 'https://youtube.com/watch?v=ghi789',
    video_title: 'Advanced Video Editing Techniques in DaVinci',
    channel_name: 'Edit Master',
    duration_minutes: 45,
    priority: 'high',
    status: 'processing',
    department: 'VID',
    assigned_to: 'chris@remotehelpers.com',
    added_by: 'maria@remotehelpers.com',
    notes: 'Focus on color grading section',
    perplexity_search_id: 'search_126'
  },
  {
    id: '5',
    created_at: '2025-11-26T16:00:00Z',
    video_url: 'https://youtube.com/watch?v=jkl012',
    video_title: 'Prompt Engineering for Beginners',
    channel_name: 'AI Daily',
    duration_minutes: 10,
    priority: 'medium',
    status: 'complete',
    department: 'AID',
    assigned_to: 'sarah@remotehelpers.com',
    added_by: 'alex@remotehelpers.com',
    notes: 'Good intro material',
    perplexity_search_id: 'search_127'
  },
  {
    id: '6',
    created_at: '2025-11-25T11:00:00Z',
    video_url: 'https://youtube.com/watch?v=mno345',
    video_title: '2025 Graphic Design Trends',
    channel_name: 'Design Hub',
    duration_minutes: 12,
    priority: 'low',
    status: 'rejected',
    department: 'DGN',
    assigned_to: null,
    added_by: 'sam@remotehelpers.com',
    notes: 'Too generic',
    perplexity_search_id: 'search_128'
  }
];

// MOCK_SEARCHES - matches SQL table search_queue (snake_case)
export const MOCK_SEARCHES: SearchQuery[] = [
  {
    search_id: 'SEARCH-001',
    employee: 'Alex Johnson',
    department: 'DEV',
    topic: 'AI Development Tools',
    search_query: 'Claude Desktop MCP setup tutorial 2024',
    status: 'Completed',
    videos_found: 3,
    date_assigned: '2025-11-28',
    date_completed: '2025-11-28',
    notes: 'Focus on MCP integration',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 12,
    error_message: null,
    created_at: '2025-11-28T10:00:00Z',
    updated_at: '2025-11-28T14:30:00Z',
  },
  {
    search_id: 'SEARCH-002',
    employee: 'Maria Garcia',
    department: 'DEV',
    topic: 'Workflow Automation',
    search_query: 'n8n workflow automation examples for developers',
    status: 'In Progress',
    videos_found: 0,
    date_assigned: '2025-11-28',
    date_completed: null,
    notes: '',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 0,
    error_message: null,
    created_at: '2025-11-28T11:00:00Z',
    updated_at: '2025-11-28T11:00:00Z',
  },
  {
    search_id: 'SEARCH-003',
    employee: null,
    department: 'SMM',
    topic: 'Social Media Tools',
    search_query: 'Social media caption AI tools comparison',
    status: 'Assigned',
    videos_found: 0,
    date_assigned: '2025-11-28',
    date_completed: null,
    notes: 'Compare top 5 tools',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 0,
    error_message: null,
    created_at: '2025-11-28T09:00:00Z',
    updated_at: '2025-11-28T09:00:00Z',
  },
  {
    search_id: 'SEARCH-004',
    employee: 'Jordan Smith',
    department: 'VID',
    topic: 'Video Editing AI',
    search_query: 'Video editing AI tools 2024 premiere davinci',
    status: 'Completed',
    videos_found: 5,
    date_assigned: '2025-11-27',
    date_completed: '2025-11-27',
    notes: 'Premiere and DaVinci plugins',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 18,
    error_message: null,
    created_at: '2025-11-27T08:00:00Z',
    updated_at: '2025-11-27T16:00:00Z',
  },
  {
    search_id: 'SEARCH-005',
    employee: 'Sam Wilson',
    department: 'MKT',
    topic: 'Marketing Automation',
    search_query: 'AI automation tools for marketing teams',
    status: 'Assigned',
    videos_found: 0,
    date_assigned: '2025-11-27',
    date_completed: null,
    notes: 'Retry tomorrow',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 0,
    error_message: 'API rate limit exceeded',
    created_at: '2025-11-27T10:00:00Z',
    updated_at: '2025-11-27T10:30:00Z',
  },
  {
    search_id: 'SEARCH-006',
    employee: 'Chris Taylor',
    department: 'DGN',
    topic: 'AI Image Generation',
    search_query: 'Midjourney prompt engineering techniques advanced',
    status: 'Completed',
    videos_found: 8,
    date_assigned: '2025-11-27',
    date_completed: '2025-11-27',
    notes: 'Advanced techniques only',
    perplexity_creativity: 0.7,
    perplexity_structure_mode: false,
    results_count: 24,
    error_message: null,
    created_at: '2025-11-27T09:00:00Z',
    updated_at: '2025-11-27T17:00:00Z',
  },
  {
    search_id: 'SEARCH-007',
    employee: 'Alex Johnson',
    department: 'AID',
    topic: 'ChatGPT Integration',
    search_query: 'ChatGPT API integration best practices 2024',
    status: 'In Progress',
    videos_found: 0,
    date_assigned: '2025-11-28',
    date_completed: null,
    notes: '',
    perplexity_creativity: 0.5,
    perplexity_structure_mode: true,
    results_count: 0,
    error_message: null,
    created_at: '2025-11-28T12:00:00Z',
    updated_at: '2025-11-28T12:00:00Z',
  },
  {
    search_id: 'SEARCH-008',
    employee: 'Maria Garcia',
    department: 'SMM',
    topic: 'TikTok Strategy',
    search_query: 'TikTok content strategy for B2B companies',
    status: 'Completed',
    videos_found: 4,
    date_assigned: '2025-11-26',
    date_completed: '2025-11-26',
    notes: 'B2B focus',
    perplexity_creativity: 0.6,
    perplexity_structure_mode: true,
    results_count: 15,
    error_message: null,
    created_at: '2025-11-26T08:00:00Z',
    updated_at: '2025-11-26T15:00:00Z',
  }
];

// Status options matching CSV values
export const SEARCH_STATUS_OPTIONS = [
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' }
] as const;

export const MOCK_STATS = {
  totalVideos: 156,
  inProgress: 23,
  completed: 118,
  completionRate: 75.6
};

export const MOCK_TREND_DATA = [
  { date: '2025-11-22', videos_added: 18 },
  { date: '2025-11-23', videos_added: 22 },
  { date: '2025-11-24', videos_added: 15 },
  { date: '2025-11-25', videos_added: 28 },
  { date: '2025-11-26', videos_added: 31 },
  { date: '2025-11-27', videos_added: 24 },
  { date: '2025-11-28', videos_added: 18 }
];

export const MOCK_VIDEOS_FOR_UPLOAD = [
  {
    id: '1',
    video_title: 'Claude Desktop MCP Setup Tutorial',
    video_url: 'https://youtube.com/watch?v=abc123',
    status: 'selected',
    department: 'DEV'
  },
  {
    id: '2',
    video_title: 'n8n Workflow Automation for Developers',
    video_url: 'https://youtube.com/watch?v=xyz789',
    status: 'selected',
    department: 'DEV'
  },
  {
    id: '3',
    video_title: 'AI Caption Generator Tools Review',
    video_url: 'https://youtube.com/watch?v=def456',
    status: 'selected',
    department: 'SMM'
  }
];

export const MOCK_COST_DATA = {
  todayCost: 12.45,
  todayTokens: 1234567,
  todayCalls: 156,
  totalCost: 342.18,
  budgetLimit: 50
};

export const MOCK_NODES = [
  {
    id: 'TOOL-AI-224',
    type: 'tool',
    data: {
      label: 'Claude Desktop',
      category: 'AI',
      description: 'Desktop application for Claude AI'
    },
    position: { x: 250, y: 100 }
  },
  {
    id: 'WRF-026',
    type: 'workflow',
    data: {
      label: 'MCP Server Setup Process',
      steps: 8
    },
    position: { x: 250, y: 250 }
  },
  {
    id: 'ACTION-434',
    type: 'action',
    data: {
      label: 'Install MCP Server',
      difficulty: 'Medium'
    },
    position: { x: 100, y: 400 }
  },
  {
    id: 'ACTION-435',
    type: 'action',
    data: {
      label: 'Configure Settings',
      difficulty: 'Easy'
    },
    position: { x: 400, y: 400 }
  },
  {
    id: 'OBJ-AI-089',
    type: 'object',
    data: {
      label: 'MCP Configuration File',
      file_type: '.json'
    },
    position: { x: 250, y: 550 }
  },
  {
    id: 'TOOL-AUTOMATION-112',
    type: 'tool',
    data: {
      label: 'n8n',
      category: 'AUTOMATION'
    },
    position: { x: 600, y: 100 }
  },
  {
    id: 'WRF-027',
    type: 'workflow',
    data: {
      label: 'Automated Data Sync',
      steps: 5
    },
    position: { x: 600, y: 250 }
  }
];

export const MOCK_EDGES = [
  { id: 'e1', source: 'TOOL-AI-224', target: 'WRF-026', type: 'default', label: 'uses', animated: true },
  { id: 'e2', source: 'WRF-026', target: 'ACTION-434', type: 'default', label: 'contains' },
  { id: 'e3', source: 'WRF-026', target: 'ACTION-435', type: 'default', label: 'contains' },
  { id: 'e4', source: 'ACTION-435', target: 'OBJ-AI-089', type: 'default', label: 'requires' },
  { id: 'e5', source: 'TOOL-AUTOMATION-112', target: 'WRF-027', type: 'default', label: 'uses', animated: true }
];

export const NODE_COLORS = {
  tool: '#428eb4',
  workflow: '#34D399',
  action: '#FBBF24',
  object: '#A78BFA'
};

export const MOCK_EXTRACTED_TOOLS: ExtractedEntity[] = [
  {
    id: "1",
    entity_type: "TOOL",
    entity_name: "Claude Desktop",
    entity_id: "TOOL-AI-224",
    classification: "NEW",
    category: "AI",
    description: "Desktop application for Claude AI with MCP server support for local tool integration",
    video_id: "video_1",
    video_title: "Claude Desktop MCP Setup Tutorial",
    extracted_at: "2025-11-28T10:00:00Z",
    confidence_score: 0.95,
    metadata: {
      pricing: "Free + Pro ($20/mo)",
      platform: "Desktop (Mac/Windows)",
      website: "claude.ai"
    }
  },
  {
    id: "2",
    entity_type: "TOOL",
    entity_name: "n8n",
    entity_id: "TOOL-AUTOMATION-112",
    classification: "EXISTING",
    category: "AUTOMATION",
    description: "Workflow automation platform for developers with visual editor and 400+ integrations",
    video_id: "video_2",
    video_title: "n8n Workflow Automation",
    extracted_at: "2025-11-28T11:00:00Z",
    confidence_score: 0.98,
    metadata: {
      pricing: "Self-hosted free, Cloud from $20/mo",
      platform: "Web/Self-hosted",
      website: "n8n.io"
    }
  },
  {
    id: "3",
    entity_type: "TOOL",
    entity_name: "MCP Server Protocol",
    entity_id: "TOOL-AI-225",
    classification: "NEW",
    category: "AI",
    description: "Model Context Protocol for connecting AI assistants to external tools and data sources",
    video_id: "video_1",
    video_title: "Claude Desktop MCP Setup Tutorial",
    extracted_at: "2025-11-28T10:05:00Z",
    confidence_score: 0.92,
    metadata: {
      pricing: "Open Source",
      platform: "Cross-platform",
      website: "modelcontextprotocol.io"
    }
  },
  {
    id: "4",
    entity_type: "TOOL",
    entity_name: "Supabase",
    entity_id: "TOOL-DATABASE-045",
    classification: "EXISTING",
    category: "DATABASE",
    description: "Open source Firebase alternative with PostgreSQL database, real-time subscriptions, and authentication",
    video_id: "video_6",
    video_title: "Advanced Supabase Security",
    extracted_at: "2025-11-28T13:00:00Z",
    confidence_score: 0.97,
    metadata: {
      pricing: "Free tier + paid from $25/mo",
      platform: "Cloud/Self-hosted",
      website: "supabase.com"
    }
  }
];

export const MOCK_EXTRACTED_WORKFLOWS: ExtractedEntity[] = [
  {
    id: "10",
    entity_type: "WORKFLOW",
    entity_name: "MCP Server Setup Process",
    entity_id: "WRF-026",
    classification: "NEW",
    description: "Complete workflow for setting up MCP servers in Claude Desktop including installation, configuration, and testing",
    video_id: "video_1",
    video_title: "Claude Desktop MCP Setup Tutorial",
    extracted_at: "2025-11-28T10:00:00Z",
    steps_count: 8,
    estimated_time_minutes: 15,
    difficulty: "Medium",
    prerequisites: ["Claude Desktop installed", "Node.js v18+", "Code editor", "Basic JSON knowledge"],
    outputs: ["Configured MCP servers", "Working tool integrations", "Configuration file"]
  },
  {
    id: "11",
    entity_type: "WORKFLOW",
    entity_name: "n8n Automation Workflow Creation",
    entity_id: "WRF-027",
    classification: "NEW",
    description: "Process for creating automated workflows in n8n from trigger to execution with error handling",
    video_id: "video_2",
    video_title: "n8n Workflow Automation",
    extracted_at: "2025-11-28T11:00:00Z",
    steps_count: 12,
    estimated_time_minutes: 30,
    difficulty: "Hard",
    prerequisites: ["n8n instance running", "API credentials", "Understanding of webhooks"],
    outputs: ["Deployed workflow", "Automated data sync", "Error notifications"]
  }
];

export const MOCK_EXTRACTED_ACTIONS: ExtractedEntity[] = [];
export const MOCK_EXTRACTED_OBJECTS: ExtractedEntity[] = [];

export const BRONZE_LIBRARY_VIDEOS: VideoImportRow[] = [
  {
    video_url: "https://youtube.com/watch?v=abc",
    video_title: "How To Use AI Agents to 10x Your Creative AI Game (GLIF TUTORIAL)",
    channel_name: "Startup Ideas Podcast",
    duration_minutes: 20,
    priority: "high",
    department: "AID",
    notes: "GLIF tutorial for AI agents",
    status: "selected"
  },
  {
    video_url: "https://youtu.be/2XHgJXX49Jk",
    video_title: "How to get SO many leads you don't know what to do with them",
    channel_name: "Lead Generation",
    duration_minutes: 33,
    priority: "high",
    department: "MKT",
    notes: "Lead generation strategies",
    status: "selected"
  },
  {
    video_url: "https://youtube.com/watch?v=xyz",
    video_title: "My Agentic Engineering Tech Stack",
    channel_name: "AI Engineering",
    duration_minutes: 34,
    priority: "high",
    department: "DEV",
    notes: "Agentic AI tech stack overview",
    status: "selected"
  },
  {
    video_url: "https://youtu.be/MJ3F1-bfaVY",
    video_title: "Claude Code for Business: Run Your Entire Company With AI Team",
    channel_name: "Claude AI",
    duration_minutes: 30,
    priority: "high",
    department: "AID",
    notes: "Claude Code business automation",
    status: "selected"
  },
  {
    video_url: "https://youtu.be/UtXzdmpysmU",
    video_title: "n8n Quickstart: Master Workflow Automation Fundamentals",
    channel_name: "n8n",
    duration_minutes: 15,
    priority: "high",
    department: "DEV",
    notes: "n8n workflow automation basics",
    status: "selected"
  }
];

