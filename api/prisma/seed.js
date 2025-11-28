import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create departments
  const departments = [
    { code: 'DEV', name: 'Development', description: 'Software development and programming' },
    { code: 'SMM', name: 'Social Media Marketing', description: 'Social media management and marketing' },
    { code: 'VID', name: 'Video Production', description: 'Video editing and production' },
    { code: 'AID', name: 'AI & Automation', description: 'AI tools and automation workflows' },
    { code: 'DGN', name: 'Design', description: 'Graphic and UI/UX design' },
    { code: 'MKT', name: 'Marketing', description: 'General marketing and advertising' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log('✅ Departments created');

  // Create search queue entries
  const searchQueues = [
    {
      searchId: 'SEARCH-001',
      employee: 'Alex Johnson',
      department: 'DEV',
      topic: 'AI Development Tools',
      searchQuery: 'Claude Desktop MCP setup tutorial 2024',
      status: 'Completed',
      videosFound: 3,
      dateAssigned: new Date('2025-11-28'),
      dateCompleted: new Date('2025-11-28'),
      notes: 'Focus on MCP integration',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 12,
    },
    {
      searchId: 'SEARCH-002',
      employee: 'Maria Garcia',
      department: 'DEV',
      topic: 'Workflow Automation',
      searchQuery: 'n8n workflow automation examples for developers',
      status: 'In_Progress',
      videosFound: 0,
      dateAssigned: new Date('2025-11-28'),
      notes: '',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 0,
    },
    {
      searchId: 'SEARCH-003',
      employee: null,
      department: 'SMM',
      topic: 'Social Media Tools',
      searchQuery: 'Social media caption AI tools comparison',
      status: 'Assigned',
      videosFound: 0,
      dateAssigned: new Date('2025-11-28'),
      notes: 'Compare top 5 tools',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 0,
    },
    {
      searchId: 'SEARCH-004',
      employee: 'Jordan Smith',
      department: 'VID',
      topic: 'Video Editing AI',
      searchQuery: 'Video editing AI tools 2024 premiere davinci',
      status: 'Completed',
      videosFound: 5,
      dateAssigned: new Date('2025-11-27'),
      dateCompleted: new Date('2025-11-27'),
      notes: 'Premiere and DaVinci plugins',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 18,
    },
    {
      searchId: 'SEARCH-005',
      employee: 'Sam Wilson',
      department: 'MKT',
      topic: 'Marketing Automation',
      searchQuery: 'AI automation tools for marketing teams',
      status: 'Assigned',
      videosFound: 0,
      dateAssigned: new Date('2025-11-27'),
      notes: 'Retry tomorrow',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 0,
      errorMessage: 'API rate limit exceeded',
    },
    {
      searchId: 'SEARCH-006',
      employee: 'Chris Taylor',
      department: 'DGN',
      topic: 'AI Image Generation',
      searchQuery: 'Midjourney prompt engineering techniques advanced',
      status: 'Completed',
      videosFound: 8,
      dateAssigned: new Date('2025-11-27'),
      dateCompleted: new Date('2025-11-27'),
      notes: 'Advanced techniques only',
      perplexityCreativity: 0.7,
      perplexityStructureMode: false,
      resultsCount: 24,
    },
    {
      searchId: 'SEARCH-007',
      employee: 'Alex Johnson',
      department: 'AID',
      topic: 'ChatGPT Integration',
      searchQuery: 'ChatGPT API integration best practices 2024',
      status: 'In_Progress',
      videosFound: 0,
      dateAssigned: new Date('2025-11-28'),
      notes: '',
      perplexityCreativity: 0.5,
      perplexityStructureMode: true,
      resultsCount: 0,
    },
    {
      searchId: 'SEARCH-008',
      employee: 'Maria Garcia',
      department: 'SMM',
      topic: 'TikTok Strategy',
      searchQuery: 'TikTok content strategy for B2B companies',
      status: 'Completed',
      videosFound: 4,
      dateAssigned: new Date('2025-11-26'),
      dateCompleted: new Date('2025-11-26'),
      notes: 'B2B focus',
      perplexityCreativity: 0.6,
      perplexityStructureMode: true,
      resultsCount: 15,
    },
  ];

  for (const sq of searchQueues) {
    await prisma.searchQueue.upsert({
      where: { searchId: sq.searchId },
      update: {},
      create: sq,
    });
  }
  console.log('✅ Search Queue entries created');

  // Create video queue entries
  const videoQueues = [
    {
      queueId: 'VQ-001',
      videoId: 'abc123',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      videoTitle: 'Claude Desktop MCP Setup Tutorial',
      channelName: 'AI Explained',
      durationMinutes: 15,
      duration: '00:15:00',
      views: 1500000,
      likes: 45000,
      comments: 2300,
      publishDate: new Date('2025-11-20'),
      priority: 'high',
      status: 'selected',
      department: 'DEV',
      topicCategory: 'AI Development',
      researchSource: 'Perplexity',
      priorityScore: 85.5,
      assignedTo: 'alex@remotehelpers.com',
      addedBy: 'maria@remotehelpers.com',
      addedDate: new Date('2025-11-28'),
      selectedBy: 'alex@remotehelpers.com',
      selectedDate: new Date('2025-11-28'),
      notes: 'Great tutorial on MCP connectors',
      perplexitySearchId: 'SEARCH-001',
    },
    {
      queueId: 'VQ-002',
      videoId: 'xyz789',
      videoUrl: 'https://youtube.com/watch?v=xyz789',
      videoTitle: 'n8n Workflow Automation for Developers',
      channelName: 'DevOps Weekly',
      durationMinutes: 22,
      duration: '00:22:00',
      views: 850000,
      likes: 32000,
      comments: 1800,
      publishDate: new Date('2025-11-15'),
      priority: 'medium',
      status: 'transcribing',
      department: 'DEV',
      topicCategory: 'Workflow Automation',
      researchSource: 'Perplexity',
      priorityScore: 72.3,
      assignedTo: 'jordan@remotehelpers.com',
      addedBy: 'alex@remotehelpers.com',
      addedDate: new Date('2025-11-28'),
      selectedBy: 'jordan@remotehelpers.com',
      selectedDate: new Date('2025-11-28'),
      perplexitySearchId: 'SEARCH-002',
    },
    {
      queueId: 'VQ-003',
      videoId: 'def456',
      videoUrl: 'https://youtube.com/watch?v=def456',
      videoTitle: 'Social Media Caption AI Tools',
      channelName: 'Marketing Pro',
      durationMinutes: 18,
      duration: '00:18:00',
      views: 320000,
      likes: 8500,
      comments: 650,
      publishDate: new Date('2025-11-10'),
      priority: 'low',
      status: 'pending',
      department: 'SMM',
      topicCategory: 'Social Media',
      researchSource: 'YouTube',
      priorityScore: 55.8,
      addedBy: 'sam@remotehelpers.com',
      addedDate: new Date('2025-11-27'),
      notes: 'Check if tools are free',
      perplexitySearchId: 'SEARCH-003',
    },
    {
      queueId: 'VQ-004',
      videoId: 'ghi789',
      videoUrl: 'https://youtube.com/watch?v=ghi789',
      videoTitle: 'Advanced Video Editing Techniques in DaVinci',
      channelName: 'Edit Master',
      durationMinutes: 45,
      duration: '00:45:00',
      views: 2500000,
      likes: 98000,
      comments: 4500,
      publishDate: new Date('2025-11-18'),
      priority: 'high',
      status: 'processing',
      department: 'VID',
      topicCategory: 'Video Editing',
      researchSource: 'Gemini',
      priorityScore: 92.8,
      assignedTo: 'chris@remotehelpers.com',
      addedBy: 'maria@remotehelpers.com',
      addedDate: new Date('2025-11-27'),
      selectedBy: 'chris@remotehelpers.com',
      selectedDate: new Date('2025-11-27'),
      notes: 'Focus on color grading section',
      perplexitySearchId: 'SEARCH-004',
    },
    {
      queueId: 'VQ-005',
      videoId: 'jkl012',
      videoUrl: 'https://youtube.com/watch?v=jkl012',
      videoTitle: 'Prompt Engineering for Beginners',
      channelName: 'AI Daily',
      durationMinutes: 10,
      duration: '00:10:00',
      views: 500000,
      likes: 15000,
      comments: 980,
      publishDate: new Date('2025-11-05'),
      priority: 'medium',
      status: 'complete',
      department: 'AID',
      topicCategory: 'AI Automation',
      researchSource: 'Perplexity',
      priorityScore: 68.7,
      assignedTo: 'sarah@remotehelpers.com',
      addedBy: 'alex@remotehelpers.com',
      addedDate: new Date('2025-11-26'),
      selectedBy: 'sarah@remotehelpers.com',
      selectedDate: new Date('2025-11-26'),
      parsedDate: new Date('2025-11-26'),
      notes: 'Good intro material',
    },
    {
      queueId: 'VQ-006',
      videoId: 'mno345',
      videoUrl: 'https://youtube.com/watch?v=mno345',
      videoTitle: '2025 Graphic Design Trends',
      channelName: 'Design Hub',
      durationMinutes: 12,
      duration: '00:12:00',
      views: 180000,
      likes: 5200,
      comments: 420,
      publishDate: new Date('2025-10-20'),
      priority: 'low',
      status: 'rejected',
      department: 'DGN',
      topicCategory: 'Design Trends',
      researchSource: 'YouTube',
      priorityScore: 42.3,
      addedBy: 'sam@remotehelpers.com',
      addedDate: new Date('2025-11-25'),
      notes: 'Too generic',
    },
  ];

  for (const vq of videoQueues) {
    await prisma.videoQueue.upsert({
      where: { queueId: vq.queueId },
      update: {},
      create: vq,
    });
  }
  console.log('✅ Video Queue entries created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

