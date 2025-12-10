# Complete Application Generation Prompt: Queue Manager

## Executive Summary

Create a full-stack **Queue Manager** web application - a sophisticated video research and AI transcription management system. This application manages video queues and search queues, integrates with AI providers (Google Gemini, OpenAI), Dropbox cloud storage, and YouTube for automated video transcription and analysis.

---

## 🎯 Application Purpose

Build a professional research management platform that:
- Manages YouTube video queues for processing and transcription
- Tracks Perplexity AI search queries and results
- Automatically transcribes videos using AI (Google Gemini or OpenAI GPT)
- Extracts structured entities (Tools, Workflows, Actions, Objects) from transcripts
- Synchronizes data with Dropbox cloud storage
- Provides analytics dashboards and export capabilities

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│   Frontend      │◄──────────────────────────────►│    Backend      │
│   (React)       │                                │   (Express)     │
│   Port: 5173    │                                │   Port: 3001    │
└─────────────────┘                                └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │   PostgreSQL    │
                                                   │   Port: 5434    │
                                                   └─────────────────┘
```

### Architecture Patterns
1. **Client-Server** - React SPA + Express REST API
2. **Service Layer** - DropboxService encapsulates cloud operations
3. **Repository Pattern** - Prisma ORM for database access
4. **Strategy Pattern** - Multiple AI provider support (Google/OpenAI)
5. **Factory Pattern** - Singleton service instances
6. **Fallback Pattern** - Dropbox → Local file system fallback

---

## ⚠️ CRITICAL: Known Issues & Preventive Measures

**BEFORE GENERATING THE APPLICATION, READ THIS SECTION CAREFULLY!**

### Issue 1: Tailwind CSS PostCSS Plugin Error ❌

**Error Message:**
```
[postcss] Cannot find module 'tailwindcss/plugin'
Require stack:
- node_modules\tailwindcss-animate\index.js
```

**Root Cause:**
- Tailwind CSS 4.x uses new PostCSS plugin architecture
- `tailwindcss-animate` v1.0.7 requires Tailwind 4.x
- Mixing Tailwind 3.x with `tailwindcss-animate` causes this error

**MANDATORY SOLUTION:**
1. ✅ Use **Tailwind CSS 3.4.1** (NOT 4.x)
2. ✅ **DO NOT include `tailwindcss-animate`** in dependencies
3. ✅ Set `plugins: []` in `tailwind.config.js` (empty array)
4. ✅ Use standard Tailwind CSS without animation plugin

**Correct package.json:**
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.1"  // ✅ 3.4.1, NOT 4.x
  }
  // ❌ DO NOT ADD: "tailwindcss-animate": "^1.0.7"
}
```

**Correct tailwind.config.js:**
```javascript
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { /* ... */ } },
  plugins: [] // ✅ EMPTY - no tailwindcss-animate
}
```

---

### Issue 2: Prisma Client Not Generated ❌

**Error Message:**
```
SyntaxError: Named export 'PrismaClient' not found.
The requested module '@prisma/client' is a CommonJS module
```

**Root Cause:**
- Prisma Client is not generated after creating `schema.prisma`
- Backend tries to import non-existent `@prisma/client`

**MANDATORY SOLUTION:**
1. ✅ After creating `backend/prisma/schema.prisma`
2. ✅ **IMMEDIATELY run:** `npx prisma generate`
3. ✅ This generates Prisma Client in `node_modules/@prisma/client`
4. ✅ Run again after ANY schema changes

**Correct Setup Sequence:**
```bash
# 1. Create schema
# backend/prisma/schema.prisma

# 2. ⚠️ CRITICAL: Generate Prisma Client
cd backend
npx prisma generate

# 3. Apply migrations
npx prisma migrate dev

# 4. Now backend can import PrismaClient
npm run dev  # ✅ Works!
```

---

### Issue 3: PostgreSQL Port Conflict ⚠️

**Problem:**
- Default PostgreSQL port 5432 often occupied on Windows

**SOLUTION:**
- Use port **5436** for Docker PostgreSQL
- Update DATABASE_URL accordingly

**Correct Docker Command:**
```bash
docker run -d \
  --name queue-manager-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=queue_manager \
  -p 5436:5432 \  # ✅ External port 5436
  postgres:16
```

**Correct DATABASE_URL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/queue_manager?schema=public"
#                                                          ^^^^ Port 5436
```

---

## 📦 Technology Stack

### Frontend Stack
```json
{
  "framework": "React 19.2.0",
  "language": "TypeScript 5.9.3",
  "buildTool": "Vite 7.2.4",
  "styling": "Tailwind CSS 3.4.1",
  "uiComponents": "shadcn/ui (custom)",
  "icons": "lucide-react 0.555.0",
  "tables": "@tanstack/react-table 8.21.3",
  "forms": "react-hook-form 7.66.1",
  "validation": "zod 4.1.13",
  "charts": "recharts 3.5.1",
  "graphs": "reactflow 11.11.4",
  "fileUpload": "react-dropzone 14.3.8",
  "csvParsing": "papaparse 5.5.3",
  "routing": "react-router-dom 7.9.6 (available, not actively used)"
}
```

**⚠️ Important Notes:**
- **Tailwind CSS 3.4.1** is used for stability (avoid 4.x PostCSS conflicts)
- **DO NOT include `tailwindcss-animate`** - it requires Tailwind 4.x and causes PostCSS errors
- Tailwind config should have **empty plugins array**: `plugins: []`

### Backend Stack
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 4.21.0",
  "database": "PostgreSQL 16+",
  "orm": "Prisma 7.0.1",
  "aiProviders": [
    "@google/generative-ai 0.24.1",
    "openai 6.9.1"
  ],
  "cloudStorage": "dropbox 10.34.0",
  "youtubeAPI": "youtube-captions-scraper 2.0.3",
  "validation": "ajv 8.12.0 + ajv-formats 2.1.1",
  "csvParsing": "papaparse 5.4.1",
  "middleware": ["cors 2.8.5", "express.json()"]
}
```

---

## 🗄️ Database Schema (PostgreSQL + Prisma)

### Core Models

#### 1. Department (Reference Table)
```prisma
model Department {
  code        DepartmentCode @id  // DEV, SMM, VID, AID, DGN, MKT
  name        String @db.VarChar(100)
  description String? @db.Text
  createdAt   DateTime @default(now())

  // Relations
  searchQueue SearchQueue[]
  videoQueue  VideoQueue[]
  employees   Employee[]
  researches  Research[]
}
```

#### 2. Employee
```prisma
model Employee {
  id         String @id @default(uuid())
  email      String @unique @db.VarChar(255)
  fullName   String @db.VarChar(255)
  department DepartmentCode?
  isActive   Boolean @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### 3. SearchQueue (Perplexity AI Searches)
```prisma
model SearchQueue {
  searchId                String @id @db.VarChar(20)  // SEARCH-001 format
  employee                String? @db.VarChar(255)
  department              DepartmentCode
  topic                   String @db.VarChar(255)
  searchQuery             String @db.Text
  status                  SearchStatus @default(Assigned)  // Assigned, In_Progress, Completed
  videosFound             Int @default(0)
  dateAssigned            DateTime @default(now()) @db.Date
  dateCompleted           DateTime? @db.Date
  notes                   String @default("") @db.Text

  // Perplexity API Settings
  perplexityCreativity    Float @default(0.5)        // 0.0 - 1.0
  perplexityStructureMode Boolean @default(true)
  resultsCount            Int @default(0)
  errorMessage            String? @db.Text

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Relations
  videos                  VideoQueue[]
}
```

#### 4. VideoQueue (YouTube Videos)
```prisma
model VideoQueue {
  id              String @id @default(uuid())
  queueId         String? @unique @db.VarChar(20)  // VQ-001 format
  videoId         String? @db.VarChar(20)           // YouTube video ID
  videoUrl        String @db.Text
  videoTitle      String @db.VarChar(500)
  channelName     String? @db.VarChar(255)
  channelUrl      String? @db.Text
  durationMinutes Int @default(0)
  duration        String? @db.VarChar(20)
  views           Int @default(0)
  likes           Int @default(0)
  comments        Int @default(0)
  publishDate     DateTime? @db.Date

  // Classification
  priority        PriorityLevel @default(medium)     // low, medium, high
  status          VideoStatus @default(pending)      // pending → selected → transcribing → transcribed → processing → complete
  department      DepartmentCode
  topicCategory   String? @db.VarChar(255)
  researchSource  String? @db.VarChar(100)
  priorityScore   Float?                             // 0-100 calculated score

  // Assignment
  assignedTo      String? @db.VarChar(255)
  addedBy         String @db.VarChar(255)
  addedDate       DateTime? @db.Date
  selectedBy      String? @db.VarChar(255)
  selectedDate    DateTime? @db.Date
  parsedDate      DateTime? @db.Date

  notes                  String? @db.Text
  perplexitySearchId     String? @db.VarChar(20)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  searchQueueRef  SearchQueue? @relation(fields: [perplexitySearchId])
  transcriptions  Transcription[]
  entities        ExtractedEntity[]
}
```

#### 5. Transcription
```prisma
model Transcription {
  id                    String @id @default(uuid())
  videoId               String
  rawText               String? @db.Text
  formattedText         String? @db.Text
  language              String @default("en") @db.VarChar(10)
  transcriptionSource   String? @db.VarChar(50)
  processingTimeSeconds Int?
  wordCount             Int?
  status                String @default("pending") @db.VarChar(50)
  errorMessage          String? @db.Text
  createdAt             DateTime @default(now())
  completedAt           DateTime?

  // Relations
  video                 VideoQueue @relation(onDelete: Cascade)
  entities              ExtractedEntity[]
}
```

#### 6. ExtractedEntity (AI-Extracted Entities)
```prisma
model ExtractedEntity {
  id                    String @id @default(uuid())
  entityType            EntityType           // TOOL, WORKFLOW, ACTION, OBJECT
  entityName            String @db.VarChar(255)
  entityId              String? @db.VarChar(100)
  classification        EntityClassification @default(NEW)  // NEW, EXISTING, UPDATE
  description           String? @db.Text
  category              String? @db.VarChar(100)

  // Source reference
  videoId               String?
  videoTitle            String? @db.VarChar(500)
  transcriptionId       String?

  // Workflow-specific fields
  stepsCount            Int?
  estimatedTimeMinutes  Int?
  difficulty            String? @db.VarChar(50)
  prerequisites         String[] @default([])
  outputs               String[] @default([])

  // Analysis metadata
  confidenceScore       Float?
  metadata              Json?

  extractedAt           DateTime @default(now())
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  video                 VideoQueue? @relation(onDelete: SetNull)
  transcription         Transcription? @relation(onDelete: SetNull)
}
```

#### 7. Research (Master Research Projects)
```prisma
model Research {
  id             String @id @default(uuid())
  researchId     String @unique @db.VarChar(20)
  title          String @db.VarChar(500)
  description    String? @db.Text
  department     DepartmentCode?
  category       String? @db.VarChar(100)
  filePath       String? @db.Text
  status         String @default("active") @db.VarChar(50)

  // Aggregate counts
  totalSearches  Int @default(0)
  totalVideos    Int @default(0)
  totalEntities  Int @default(0)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  completedAt    DateTime?
}
```

### Enums
```prisma
enum DepartmentCode { DEV, SMM, VID, AID, DGN, MKT }
enum PriorityLevel { low, medium, high }
enum VideoStatus { pending, selected, transcribing, transcribed, processing, complete, rejected }
enum SearchStatus { Assigned, In_Progress, Completed }
enum EntityType { TOOL, WORKFLOW, ACTION, OBJECT }
enum EntityClassification { NEW, EXISTING, UPDATE }
```

---

## 🔌 Backend API Implementation

### Server Setup (server.js)

**Main Configuration:**
```javascript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Settings management
let aiSettings = { /* Load from settings.json */ };
```

### Core API Endpoints (32 total)

#### Health & Overview
```javascript
// GET /api/health
// Returns: { status: 'ok', database: 'connected', timestamp: ISO8601 }

// GET /api/overview
// Returns: Dashboard statistics (video counts, search counts, entity counts by department)
```

#### Search Queue Management (5 endpoints)
```javascript
// GET /api/search-queue
// Returns: Array of all search queue entries

// POST /api/search-queue
// Body: { searchId, employee, department, topic, searchQuery, ... }
// Returns: Created search entry

// PUT /api/search-queue/:id
// Body: Updated fields
// Returns: Updated search entry

// DELETE /api/search-queue/:id
// Returns: { success: true }

// POST /api/search-queue/sync-csv
// Syncs from Dropbox or local CSV file
// Path: /ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv
// Returns: { imported, updated, skipped, errors, source: 'dropbox'|'local' }
```

#### Video Queue Management (8 endpoints)
```javascript
// GET /api/video-queue
// Query params: ?status=pending&department=DEV&priority=high
// Returns: Filtered array of videos

// POST /api/video-queue
// Body: { videoUrl, videoTitle, channelName, department, addedBy, ... }
// Logic: Extract videoId, check duplicates, calculate priority score
// Returns: Created video entry or 409 if duplicate

// PUT /api/video-queue/:id
// Body: Updated fields
// Auto-updates timestamps (selectedDate, parsedDate) based on status changes
// Returns: Updated video entry

// DELETE /api/video-queue/:id
// Returns: { success: true }

// POST /api/video-queue/sync-csv
// Path: /ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv
// Returns: Sync results with source indicator

// POST /api/video-queue/batch-update
// Body: { videoIds: [], updates: { status: 'selected' } }
// Returns: Updated videos

// GET /api/video-queue/summary
// Returns: { total, byStatus: {}, byDepartment: {}, byPriority: {} }

// GET /api/video-queue/export?format=csv|json|markdown
// Returns: Exported data in requested format
```

#### Transcription & YouTube API (4 endpoints)
```javascript
// POST /api/transcription/youtube
// Body: { videoUrl }
// Uses: youtube-captions-scraper
// Returns: { videoId, transcript: { text, segments: [{ text, start, duration }] } }

// GET /api/transcription/youtube/:videoId
// Returns: YouTube transcript for video ID

// POST /api/transcription/process
// Body: { videoUrl, promptId: 'PMT-004', provider: 'google'|'openai', model: 'gemini-2.0-flash' }
// Pipeline:
//   1. Fetch YouTube transcript
//   2. Load prompt from Dropbox (fallback local)
//   3. Call AI provider (Google Gemini or OpenAI GPT)
//   4. Parse AI response to JSON
//   5. Validate with Ajv schema
//   6. Save to Dropbox/local file
// Returns: { success, data: { entities, metadata }, filePath, processingTime }

// GET /api/transcription/status
// Returns: { available: true, providers: { google: { enabled, model }, openai: { enabled, model } } }
```

#### Settings Management (7 endpoints)
```javascript
// GET /api/settings
// Returns: { openai: { enabled, model, apiKey: 'sk-***7890' }, google: { ... }, defaultProvider: 'google' }
// Note: API keys are masked (first 7 + last 4 chars)

// PUT /api/settings
// Body: { provider: 'google', apiKey: 'AIza...', model: 'gemini-2.0-flash', enabled: true }
// Saves to settings.json
// Returns: Updated settings (masked)

// POST /api/settings/test
// Body: { provider: 'google'|'openai' }
// Tests API connection with simple prompt
// Returns: { success: true, model: 'gemini-2.0-flash', responseTime: 1234 }

// GET /api/settings/dropbox
// Returns: { accessToken: 'sl.***xyz', rootPath: '/ENTITIES/TASK_MANAGERS/RESEARCHES', enabled: true }

// PUT /api/settings/dropbox
// Body: { accessToken: 'sl.xxx', rootPath: '/path', enabled: true }
// Validates token format (must start with 'sl.', min 20 chars)
// Returns: Updated settings (masked)

// POST /api/settings/dropbox/test
// Tests Dropbox connection by fetching account info
// Returns: { success: true, accountEmail: 'user@example.com', accountName: 'User Name' }
```

#### Prompts API (2 endpoints)
```javascript
// GET /api/prompts
// Returns: Array of available prompts [{ id: 'PMT-004', title: 'Video Transcription v4.1', path: '...' }]

// GET /api/prompts/:promptId
// Tries Dropbox first, falls back to local
// Path: /ENTITIES/PROMPTS/PMT-XXX.md
// Returns: { promptId, content: '...markdown content...' }
```

#### Reference Data (2 endpoints)
```javascript
// GET /api/departments
// Returns: Array of departments from database

// GET /api/researches
// Returns: Array of research projects
```

### Business Logic

#### Priority Score Algorithm
```javascript
function calculatePriorityScore(video) {
  const MAX_VIEWS = 1000000;
  const MAX_LIKES = 50000;
  const MAX_AGE_DAYS = 365;

  // Views score (30%)
  const viewsScore = Math.min((video.views / MAX_VIEWS) * 30, 30);

  // Likes score (20%)
  const likesScore = Math.min((video.likes / MAX_LIKES) * 20, 20);

  // Recency score (30%) - newer is better
  const ageInDays = (Date.now() - new Date(video.publishDate)) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 30 - (ageInDays / MAX_AGE_DAYS) * 30);

  // Engagement score (20%) - likes/views ratio
  const engagementRatio = video.views > 0 ? video.likes / video.views : 0;
  const engagementScore = Math.min((engagementRatio / 0.01) * 20, 20);

  return viewsScore + likesScore + recencyScore + engagementScore;
}
```

#### Dropbox Service (services/dropboxService.js)
```javascript
import { Dropbox } from 'dropbox';

class DropboxService {
  constructor(accessToken, rootPath) {
    this.accessToken = accessToken;
    this.rootPath = rootPath || '';
    this.dbx = new Dropbox({ accessToken });
  }

  // Download file as string
  async downloadFile(path) {
    const response = await this.dbx.filesDownload({ path: this.rootPath + path });
    return response.result.fileBinary.toString('utf-8');
  }

  // Upload file
  async uploadFile(path, content) {
    await this.dbx.filesUpload({
      path: this.rootPath + path,
      contents: content,
      mode: 'overwrite',
      autorename: true
    });
  }

  // Check if file exists
  async fileExists(path) {
    try {
      await this.dbx.filesGetMetadata({ path: this.rootPath + path });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file metadata
  async getMetadata(path) { /* ... */ }

  // List folder contents
  async listFolder(path) { /* ... */ }

  // Create folder
  async createFolder(path) { /* ... */ }

  // Delete file
  async delete(path) { /* ... */ }

  // Test connection
  async testConnection() {
    const response = await this.dbx.usersGetCurrentAccount();
    return {
      email: response.result.email,
      name: response.result.name.display_name
    };
  }
}

// Singleton factory
let dropboxInstance = null;
export function getDropboxService(settings) {
  if (!dropboxInstance || dropboxInstance.accessToken !== settings.accessToken) {
    dropboxInstance = new DropboxService(settings.accessToken, settings.rootPath);
  }
  return dropboxInstance;
}
```

#### AI Transcription Pipeline
```javascript
// POST /api/transcription/process implementation
async function processTranscription(req, res) {
  const { videoUrl, promptId = 'PMT-004', provider, model } = req.body;

  try {
    // Step 1: Fetch YouTube transcript
    const videoId = extractVideoId(videoUrl);
    const transcript = await fetchYouTubeTranscript(videoId);

    // Step 2: Load prompt template
    let promptContent;
    if (dropboxService.enabled) {
      promptContent = await dropboxService.downloadFile(`/ENTITIES/PROMPTS/${promptId}.md`);
    } else {
      promptContent = fs.readFileSync(`./prompts/${promptId}.md`, 'utf-8');
    }

    // Step 3: Call AI provider with retry logic
    const selectedProvider = provider || aiSettings.defaultProvider;
    let aiResponse;
    let retries = 0;
    const MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        if (selectedProvider === 'google') {
          const genAI = new GoogleGenerativeAI(aiSettings.google.apiKey);
          const aiModel = genAI.getGenerativeModel({ model: aiSettings.google.model });
          const result = await aiModel.generateContent(promptContent + '\n\n' + transcript.text);
          aiResponse = result.response.text();
        } else {
          const openai = new OpenAI({ apiKey: aiSettings.openai.apiKey });
          const completion = await openai.chat.completions.create({
            model: aiSettings.openai.model,
            messages: [
              { role: 'system', content: promptContent },
              { role: 'user', content: transcript.text }
            ]
          });
          aiResponse = completion.choices[0].message.content;
        }
        break; // Success
      } catch (error) {
        if (error.status === 429) { // Rate limit
          retries++;
          const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
          await sleep(waitTime);
        } else {
          throw error;
        }
      }
    }

    // Step 4: Parse AI response to JSON
    const parsedData = parseTranscriptionResponse(aiResponse);

    // Step 5: Validate with Ajv
    const ajv = new Ajv();
    addFormats(ajv);
    const schema = JSON.parse(fs.readFileSync('./transcription_schema_v2.json'));
    const validate = ajv.compile(schema);

    if (!validate(parsedData)) {
      throw new Error('Validation failed: ' + JSON.stringify(validate.errors));
    }

    // Step 6: Save to file
    const fileName = `Video_${videoId}.json`;
    const filePath = `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/${fileName}`;

    if (dropboxService.enabled) {
      await dropboxService.uploadFile(filePath, JSON.stringify(parsedData, null, 2));
    } else {
      fs.writeFileSync(`./transcriptions/${fileName}`, JSON.stringify(parsedData, null, 2));
    }

    return res.json({
      success: true,
      data: parsedData,
      filePath,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Transcription processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

#### CSV Synchronization with Fallback
```javascript
async function syncVideoQueueFromCSV(req, res) {
  let csvContent;
  let source = 'dropbox';

  try {
    // Try Dropbox first
    if (dropboxService && dropboxService.enabled) {
      csvContent = await dropboxService.downloadFile(
        '/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv'
      );
    }
  } catch (error) {
    console.log('Dropbox fetch failed, falling back to local file');
    source = 'local';
    csvContent = fs.readFileSync('./data/Video_Queue_Master.csv', 'utf-8');
  }

  // Parse CSV
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  let imported = 0, updated = 0, skipped = 0;
  const errors = [];

  for (const row of parsed.data) {
    try {
      const videoId = extractVideoId(row.Video_URL);

      // Check if exists
      const existing = await prisma.videoQueue.findFirst({
        where: { videoId }
      });

      if (existing) {
        // Update
        await prisma.videoQueue.update({
          where: { id: existing.id },
          data: mapCSVRowToModel(row)
        });
        updated++;
      } else {
        // Create
        await prisma.videoQueue.create({
          data: mapCSVRowToModel(row)
        });
        imported++;
      }
    } catch (error) {
      errors.push({ row: row.Queue_ID, error: error.message });
      skipped++;
    }
  }

  return res.json({
    success: true,
    imported,
    updated,
    skipped,
    errors,
    source
  });
}
```

### Error Handling
```javascript
// Global error handler (last middleware)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});
```

### Graceful Shutdown
```javascript
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  pool.end();
  process.exit(0);
});
```

---

## 🎨 Frontend Implementation

### Application Structure

**Main App Component (App.tsx):**
```typescript
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import VideoQueueTable from './components/VideoQueueTable';
import SearchQueueTable from './components/SearchQueueTable';
import Settings from './pages/Settings';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Fixed left, dark theme */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            {getPageTitle(currentView)}
          </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardStats />}
            {currentView === 'video-queue' && <VideoQueueTable />}
            {currentView === 'search-queue' && <SearchQueueTable />}
            {currentView === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Component Architecture

#### 1. Sidebar Navigation (Sidebar.tsx)
```typescript
interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'search-queue', icon: Search, label: 'Search Queue' },
  { id: 'video-queue', icon: Video, label: 'Video Queue' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

function Sidebar({ currentView, onNavigate }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-blue-500">Queue Manager</h2>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              currentView === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

#### 2. Dashboard Statistics (DashboardStats.tsx)
```typescript
import { LineChart, Line, BarChart, Bar, PieChart, Pie } from 'recharts';

function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/overview')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Videos"
          value={stats?.totalVideos}
          icon={Video}
          trend="+12%"
        />
        <StatCard
          title="Completed"
          value={stats?.completedVideos}
          icon={CheckCircle}
          trend="+8%"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressVideos}
          icon={Clock}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingVideos}
          icon={AlertCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Processing Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={stats?.trendData}>
              <Line type="monotone" dataKey="videos" stroke="#2563eb" />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie data={stats?.departmentData} dataKey="count" />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      {/* AI Cost Tracker Widget */}
      <CostTrackerWidget />
    </div>
  );
}
```

#### 3. Video Queue Table (VideoQueueTable.tsx)
```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

function VideoQueueTable() {
  const [data, setData] = useState<VideoQueueItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    department: [],
    priority: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    const response = await videoQueueAPI.getAll();
    if (response.success) {
      setData(response.data);
    }
    setIsLoading(false);
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'queueId',
      header: 'Queue ID',
      cell: info => <span className="font-mono">{info.getValue()}</span>
    },
    {
      accessorKey: 'videoTitle',
      header: 'Title',
      cell: info => (
        <a href={info.row.original.videoUrl} target="_blank" className="text-blue-600 hover:underline">
          {info.getValue()}
        </a>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: info => <PriorityBadge priority={info.getValue()} />
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: info => <Badge>{info.getValue()}</Badge>
    },
    {
      accessorKey: 'priorityScore',
      header: 'Score',
      cell: info => <span className="font-semibold">{info.getValue()?.toFixed(1)}</span>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openDetailView(info.row.original)}>
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => editVideo(info.row.original)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => deleteVideo(info.row.original.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
          <Button variant="outline" onClick={syncFromCSV}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync CSV
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>{header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-slate-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### 4. Video Form (VideoForm.tsx)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const videoSchema = z.object({
  videoUrl: z.string().url().refine(url => url.includes('youtube.com') || url.includes('youtu.be')),
  videoTitle: z.string().min(1, 'Title is required'),
  channelName: z.string().optional(),
  department: z.enum(['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT']),
  addedBy: z.string().min(1, 'Your name is required'),
  priority: z.enum(['low', 'medium', 'high']),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  durationMinutes: z.number().optional()
});

function VideoForm({ video, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: video || {}
  });

  const onSubmit = async (data) => {
    const response = video
      ? await videoQueueAPI.update(video.id, data)
      : await videoQueueAPI.create(data);

    if (response.success) {
      onSave(response.data);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Video URL *</label>
        <Input {...register('videoUrl')} placeholder="https://www.youtube.com/watch?v=..." />
        {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Video Title *</label>
        <Input {...register('videoTitle')} />
        {errors.videoTitle && <p className="text-red-500 text-sm mt-1">{errors.videoTitle.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Department *</label>
          <Select {...register('department')}>
            <option value="DEV">Development</option>
            <option value="SMM">Social Media Marketing</option>
            <option value="VID">Video Production</option>
            <option value="AID">AI Development</option>
            <option value="DGN">Design</option>
            <option value="MKT">Marketing</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority *</label>
          <Select {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Added By *</label>
        <Input {...register('addedBy')} placeholder="Your name" />
      </div>

      {/* Advanced Fields Toggle */}
      <Accordion>
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Fields</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Views</label>
                <Input type="number" {...register('views', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Likes</label>
                <Input type="number" {...register('likes', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comments</label>
                <Input type="number" {...register('comments', { valueAsNumber: true })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Video</Button>
      </div>
    </form>
  );
}
```

#### 5. Video Detail View (VideoDetailView.tsx)
```typescript
function VideoDetailView({ video, onClose }) {
  const [transcript, setTranscript] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const processWithAI = async () => {
    setIsProcessing(true);
    setPipelineStep(0);

    try {
      // Step 1: Fetch transcript
      setPipelineStep(1);
      const transcriptResponse = await transcriptionAPI.fetchYouTube({
        videoUrl: video.videoUrl
      });

      // Step 2: Process with AI
      setPipelineStep(2);
      const processResponse = await transcriptionAPI.processWithAI({
        videoUrl: video.videoUrl,
        promptId: 'PMT-004',
        provider: 'google'
      });

      // Step 3: Complete
      setPipelineStep(3);
      setTranscript(processResponse.data);

    } catch (error) {
      alert('Processing failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{video.videoTitle}</h2>
            <p className="text-slate-600">{video.channelName}</p>
          </div>
          <Button onClick={onClose} variant="ghost">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Info */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Queue ID" value={video.queueId} />
          <InfoItem label="Video ID" value={video.videoId} />
          <InfoItem label="Status" value={<StatusBadge status={video.status} />} />
          <InfoItem label="Priority" value={<PriorityBadge priority={video.priority} score={video.priorityScore} />} />
          <InfoItem label="Department" value={video.department} />
          <InfoItem label="Views" value={video.views?.toLocaleString()} />
          <InfoItem label="Likes" value={video.likes?.toLocaleString()} />
          <InfoItem label="Duration" value={`${video.durationMinutes} min`} />
        </div>

        {/* AI Processing Section */}
        <Card>
          <CardHeader>
            <CardTitle>AI Transcription Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {pipelineStep >= 1 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 animate-spin" />}
                  <span>Fetching YouTube transcript...</span>
                </div>
                <div className="flex items-center gap-3">
                  {pipelineStep >= 2 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5" />}
                  <span>Processing with AI (PMT-004)...</span>
                </div>
                <div className="flex items-center gap-3">
                  {pipelineStep >= 3 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5" />}
                  <span>Saving results...</span>
                </div>
              </div>
            ) : (
              <Button onClick={processWithAI}>
                <Zap className="w-4 h-4 mr-2" />
                Process with AI
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Transcription Results */}
        {transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tools">
                <TabsList>
                  <TabsTrigger value="tools">Tools ({transcript.tools?.length})</TabsTrigger>
                  <TabsTrigger value="workflows">Workflows ({transcript.workflows?.length})</TabsTrigger>
                  <TabsTrigger value="actions">Actions ({transcript.actions?.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="tools">
                  {transcript.tools?.map(tool => (
                    <EntityCard key={tool.id} entity={tool} type="TOOL" />
                  ))}
                </TabsContent>
                {/* Similar for workflows and actions */}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  );
}
```

#### 6. Settings Page (Settings.tsx)
```typescript
function Settings() {
  const [activeTab, setActiveTab] = useState('ai');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="dropbox">Dropbox</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AIProvidersSettings />
        </TabsContent>

        <TabsContent value="dropbox">
          <DropboxSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AIProvidersSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const response = await settingsAPI.get();
    if (response.success) {
      setSettings(response.data);
    }
    setIsLoading(false);
  };

  const handleSave = async (provider, data) => {
    const response = await settingsAPI.update({
      provider,
      ...data
    });

    if (response.success) {
      alert('Settings saved successfully!');
      fetchSettings();
    }
  };

  const testConnection = async (provider) => {
    const response = await settingsAPI.testConnection({ provider });
    if (response.success) {
      alert(`✓ Connected to ${provider} successfully!\nModel: ${response.model}\nResponse time: ${response.responseTime}ms`);
    } else {
      alert(`✗ Connection failed: ${response.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google AI Card */}
      <Card>
        <CardHeader>
          <CardTitle>Google AI (Gemini)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSave('google', googleFormData); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={googleFormData.apiKey}
                  onChange={e => setGoogleFormData({ ...googleFormData, apiKey: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <Select
                  value={googleFormData.model}
                  onChange={e => setGoogleFormData({ ...googleFormData, model: e.target.value })}
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
                  <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Best Quality)</option>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={googleFormData.enabled}
                  onCheckedChange={checked => setGoogleFormData({ ...googleFormData, enabled: checked })}
                />
                <label>Enable Google AI</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Settings</Button>
                <Button type="button" variant="outline" onClick={() => testConnection('google')}>
                  Test Connection
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* OpenAI Card - Similar structure */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI (GPT)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Similar form for OpenAI */}
        </CardContent>
      </Card>

      {/* Default Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Default Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={settings?.defaultProvider} onChange={handleDefaultProviderChange}>
            <option value="google">Google AI (Gemini)</option>
            <option value="openai">OpenAI (GPT)</option>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}

function DropboxSettings() {
  const [settings, setSettings] = useState(null);

  const testDropboxConnection = async () => {
    const response = await dropboxAPI.testConnection();
    if (response.success) {
      alert(`✓ Connected to Dropbox!\nAccount: ${response.accountEmail}\nName: ${response.accountName}`);
    } else {
      alert(`✗ Connection failed: ${response.error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dropbox Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Access Token</label>
            <Input
              type="password"
              placeholder="sl.xxx..."
              value={formData.accessToken}
              onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
            />
            <p className="text-sm text-slate-600 mt-1">
              Token must start with "sl." and be at least 20 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Root Path</label>
            <Input
              placeholder="/ENTITIES/TASK_MANAGERS/RESEARCHES"
              value={formData.rootPath}
              onChange={e => setFormData({ ...formData, rootPath: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.enabled}
              onCheckedChange={checked => setFormData({ ...formData, enabled: checked })}
            />
            <label>Enable Dropbox Sync</label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Settings</Button>
            <Button type="button" variant="outline" onClick={testDropboxConnection}>
              Test Connection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### API Client (lib/api.ts)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// API Modules
export const videoQueueAPI = {
  getAll: () => fetchAPI<VideoQueueItem[]>('/api/video-queue'),
  create: (data: Partial<VideoQueueItem>) => fetchAPI('/api/video-queue', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: Partial<VideoQueueItem>) => fetchAPI(`/api/video-queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => fetchAPI(`/api/video-queue/${id}`, { method: 'DELETE' }),
  syncFromCSV: () => fetchAPI('/api/video-queue/sync-csv', { method: 'POST' }),
  batchUpdate: (data: { videoIds: string[], updates: any }) => fetchAPI('/api/video-queue/batch-update', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSummary: () => fetchAPI('/api/video-queue/summary'),
  getExportUrl: (format: 'csv' | 'json' | 'markdown') => `${API_BASE_URL}/api/video-queue/export?format=${format}`
};

export const searchQueueAPI = {
  getAll: () => fetchAPI<SearchQueueItem[]>('/api/search-queue'),
  create: (data: Partial<SearchQueueItem>) => fetchAPI('/api/search-queue', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: Partial<SearchQueueItem>) => fetchAPI(`/api/search-queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => fetchAPI(`/api/search-queue/${id}`, { method: 'DELETE' }),
  syncFromCSV: () => fetchAPI('/api/search-queue/sync-csv', { method: 'POST' })
};

export const transcriptionAPI = {
  fetchYouTube: (data: { videoUrl: string }) => fetchAPI('/api/transcription/youtube', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  processWithAI: (data: { videoUrl: string, promptId?: string, provider?: string }) =>
    fetchAPI('/api/transcription/process', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getStatus: () => fetchAPI('/api/transcription/status')
};

export const settingsAPI = {
  get: () => fetchAPI('/api/settings'),
  update: (data: any) => fetchAPI('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  testConnection: (data: { provider: string }) => fetchAPI('/api/settings/test', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export const dropboxAPI = {
  get: () => fetchAPI('/api/settings/dropbox'),
  update: (data: any) => fetchAPI('/api/settings/dropbox', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  testConnection: () => fetchAPI('/api/settings/dropbox/test', { method: 'POST' })
};

export const overviewAPI = {
  get: () => fetchAPI('/api/overview')
};

export const departmentsAPI = {
  getAll: () => fetchAPI('/api/departments')
};
```

### UI Components (shadcn/ui based)

Create the following reusable components in `src/components/ui/`:

1. **Button.tsx** - Variants: default, destructive, outline, secondary, ghost
2. **Card.tsx** - Card, CardHeader, CardTitle, CardContent, CardFooter
3. **Input.tsx** - Text input with consistent styling
4. **Select.tsx** - Dropdown select
5. **Checkbox.tsx** - Checkbox with label support
6. **Badge.tsx** - Status and info badges
7. **StatusBadge.tsx** - Colored badges for video/search status
8. **Tabs.tsx** - Tab navigation component
9. **Modal.tsx** - Dialog/modal overlay
10. **Accordion.tsx** - Collapsible sections
11. **Progress.tsx** - Progress bar
12. **Textarea.tsx** - Multi-line text input

### Styling (Tailwind CSS)

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... other colors
      }
    }
  },
  plugins: [], // ⚠️ IMPORTANT: Empty plugins array (do not use tailwindcss-animate)
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --destructive: 0 84.2% 60.2%;
    --radius: 0.5rem;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

---

## 🚀 Deployment & Configuration

### Environment Variables

**Backend (.env):**
```env
# Database
# ⚠️ IMPORTANT: Use port 5436 (not 5432) to avoid conflicts
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/queue_manager?schema=public"

# Server
PORT=3001
NODE_ENV=development

# File Storage (local fallback)
DROPBOX_ROOT=./data

# AI Providers (optional - can be set via Settings UI)
GOOGLE_AI_API_KEY=
OPENAI_API_KEY=
DROPBOX_ACCESS_TOKEN=
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
```

### Settings File (settings.json)
```json
{
  "openai": {
    "apiKey": "sk-proj-xxx",
    "enabled": true,
    "model": "gpt-4o-mini"
  },
  "google": {
    "apiKey": "AIza-xxx",
    "enabled": true,
    "model": "gemini-2.0-flash"
  },
  "defaultProvider": "google",
  "dropbox": {
    "accessToken": "sl.xxx",
    "enabled": true,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": true
  }
}
```

### Database Setup

```bash
# Install PostgreSQL (or use Docker)
# ⚠️ IMPORTANT: Use port 5436 to avoid conflicts with local PostgreSQL
docker run -d \
  --name queue-manager-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=queue_manager \
  -p 5436:5432 \
  postgres:16

# Update DATABASE_URL in backend/.env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5436/queue_manager?schema=public"

# Apply Prisma migrations
cd backend
npx prisma migrate dev

# ⚠️ CRITICAL: Generate Prisma Client
npx prisma generate

# Seed database with departments
npx prisma db seed
```

### Development Setup

```bash
# Backend
cd backend
npm install

# ⚠️ CRITICAL: Generate Prisma Client after schema creation
npx prisma generate

npm run dev  # Runs on http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

**⚠️ Important Backend Setup Steps:**
1. After creating `prisma/schema.prisma`, **ALWAYS run `npx prisma generate`**
2. This generates the Prisma Client in `node_modules/@prisma/client`
3. Without this step, backend will fail with: `Named export 'PrismaClient' not found`
4. Run `npx prisma generate` again after any schema changes

### Production Build

```bash
# Backend
cd api
npm install --production
npm start

# Frontend
cd web
npm install
npm run build  # Output: dist/
# Serve with Nginx or static host
```

### Docker Deployment (Optional)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: phase0
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/phase0
      PORT: 3001
    depends_on:
      - postgres

  web:
    build: ./web
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## 📝 Key Features Implementation

### 1. Video Priority Score Calculation
Automatic calculation based on views (30%), likes (20%), recency (30%), engagement (20%)

### 2. AI Transcription Pipeline
Full workflow: YouTube → Prompt → AI (Google/OpenAI) → JSON Validation → Dropbox/Local Save

### 3. CSV Synchronization
Dual-source loading with Dropbox-first, local-fallback pattern

### 4. Duplicate Detection
Extract YouTube video ID, check database before insertion

### 5. Batch Operations
Update multiple videos simultaneously (status changes, assignments)

### 6. Export Functionality
Export video queue in CSV, JSON, or Markdown format

### 7. Dashboard Analytics
Real-time statistics with Recharts visualization

### 8. Settings Management
UI-based configuration for AI providers and Dropbox (no need to edit files)

### 9. Rate Limit Handling
Automatic retry with exponential backoff for API rate limits

### 10. Fallback Mechanisms
Dropbox → Local file system fallback for all file operations

---

## 🔒 Security Considerations

### Implemented
- API key masking in responses
- Token format validation
- CORS configuration
- Environment variable protection
- Input sanitization via Prisma

### Recommended for Production
- JWT authentication
- API rate limiting
- HTTPS/SSL encryption
- Role-based access control (RBAC)
- Database backup encryption
- Token rotation policies
- Request logging

---

## 📊 Database Indexes

```sql
-- VideoQueue indexes
CREATE INDEX idx_video_queue_status ON video_queue(status);
CREATE INDEX idx_video_queue_department ON video_queue(department);
CREATE INDEX idx_video_queue_priority ON video_queue(priority);
CREATE INDEX idx_video_queue_created_at ON video_queue(created_at);

-- SearchQueue indexes
CREATE INDEX idx_search_queue_status ON search_queue(status);
CREATE INDEX idx_search_queue_department ON search_queue(department);

-- ExtractedEntity indexes
CREATE INDEX idx_entity_type ON extracted_entities(entity_type);
CREATE INDEX idx_entity_classification ON extracted_entities(classification);
```

---

## 🧪 Testing Strategy

### Backend Testing
```javascript
// Example: Test video creation
import request from 'supertest';
import app from './server.js';

describe('POST /api/video-queue', () => {
  it('should create a new video', async () => {
    const response = await request(app)
      .post('/api/video-queue')
      .send({
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoTitle: 'Test Video',
        department: 'DEV',
        addedBy: 'Test User'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.videoId).toBe('dQw4w9WgXcQ');
  });

  it('should reject duplicate videos', async () => {
    // ... duplicate test
  });
});
```

### Frontend Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import VideoForm from './VideoForm';

describe('VideoForm', () => {
  it('should validate required fields', async () => {
    render(<VideoForm onSave={() => {}} onClose={() => {}} />);

    fireEvent.click(screen.getByText('Save Video'));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });
});
```

---

## 📖 Usage Examples

### Creating a Video
```typescript
// Frontend
const video = {
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoTitle: 'Rick Astley - Never Gonna Give You Up',
  channelName: 'Rick Astley',
  department: 'SMM',
  addedBy: 'John Doe',
  priority: 'high',
  views: 1400000000,
  likes: 16000000
};

const response = await videoQueueAPI.create(video);
// Returns: { success: true, data: { id: '...', queueId: 'VQ-001', videoId: 'dQw4w9WgXcQ', priorityScore: 87.5 } }
```

### Processing with AI
```typescript
const result = await transcriptionAPI.processWithAI({
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  promptId: 'PMT-004',
  provider: 'google'
});

// Returns:
// {
//   success: true,
//   data: {
//     tools: [{ name: 'Tool 1', description: '...', classification: 'NEW' }],
//     workflows: [...],
//     actions: [...]
//   },
//   filePath: '/ENTITIES/.../Video_dQw4w9WgXcQ.json',
//   processingTime: 3456
// }
```

### Syncing from CSV
```typescript
const syncResult = await videoQueueAPI.syncFromCSV();
// Returns:
// {
//   success: true,
//   imported: 12,
//   updated: 5,
//   skipped: 2,
//   errors: [],
//   source: 'dropbox'
// }
```

---

## 🎯 Success Criteria

Your implementation is complete when:

✅ Backend API has all 32 endpoints functioning
✅ Database schema matches Prisma schema exactly
✅ Frontend displays Dashboard, Video Queue, Search Queue, Settings
✅ AI transcription pipeline works end-to-end
✅ Dropbox integration with fallback to local files
✅ CSV sync operations work correctly
✅ Priority score calculation is accurate
✅ Settings UI allows AI provider and Dropbox configuration
✅ All tables are sortable and filterable
✅ Export functionality works (CSV, JSON, Markdown)
✅ Rate limit retry logic functions properly
✅ All UI components render correctly with Tailwind styling

---

## 📚 Additional Resources

### Dropbox File Structure
```
/ENTITIES/
├── TASK_MANAGERS/RESEARCHES/
│   ├── 00_SEARCH_QUEUE/
│   │   └── Search_Queue_Master.csv
│   ├── 01_VIDEO_QUEUE/
│   │   └── Video_Queue_Master.csv
│   └── 02_TRANSCRIPTIONS/
│       └── Video_XXX.json
└── PROMPTS/
    ├── PMT-004_Video_Transcription_v4.1.md
    ├── PMT-010_Complete_Workflow_Full.md
    └── ... (other prompts)
```

### JSON Schema (Transcription v2.0)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["videoMetadata", "tools", "workflows", "actions"],
  "properties": {
    "videoMetadata": {
      "type": "object",
      "properties": {
        "videoId": { "type": "string" },
        "title": { "type": "string" },
        "channelName": { "type": "string" }
      }
    },
    "tools": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["entityId", "name", "classification"],
        "properties": {
          "entityId": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "classification": { "enum": ["NEW", "EXISTING", "UPDATE"] },
          "category": { "type": "string" },
          "confidenceScore": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    },
    "workflows": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["entityId", "name", "steps"],
        "properties": {
          "entityId": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "steps": { "type": "array", "items": { "type": "string" } },
          "estimatedTimeMinutes": { "type": "integer" },
          "difficulty": { "enum": ["beginner", "intermediate", "advanced"] },
          "prerequisites": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "actions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["entityId", "name"],
        "properties": {
          "entityId": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "category": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 🎬 Final Notes

This is a production-ready, full-stack application with:
- **3,000+ lines of backend code** (Express + Prisma)
- **3,500+ lines of frontend code** (React + TypeScript)
- **32 REST API endpoints**
- **7 database models** with relationships
- **Multiple external integrations** (Google AI, OpenAI, Dropbox, YouTube)
- **Comprehensive UI** with 15+ components
- **Professional design** with Tailwind CSS

The application follows modern best practices including:
- Separation of concerns (Service layer, Repository pattern)
- Type safety (TypeScript, Prisma)
- Error handling and validation
- Fallback mechanisms for resilience
- Component-based architecture
- RESTful API design
- Responsive UI design

**Estimated development time:** 60-80 hours for a single developer
**Lines of code:** ~8,000+ total

---

**Version:** 1.0.0
**Last Updated:** 2025-12-09
**Documentation Language:** English (with Russian UI strings where applicable)

---

## 🚀 Quick Start Command Summary

```bash
# Setup PostgreSQL Database
docker run -d \
  --name queue-manager-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=queue_manager \
  -p 5436:5432 \
  postgres:16

# Backend Setup
cd backend
npm install

# ⚠️ CRITICAL: Generate Prisma Client (MUST DO!)
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Seed database with departments
npx prisma db seed

# Start backend server
npm run dev  # Runs on http://localhost:3001

# Frontend Setup (separate terminal)
cd frontend
npm install

# ⚠️ Verify package.json has Tailwind CSS 3.4.1 (NOT 4.x)
# ⚠️ Verify tailwind.config.js has plugins: [] (NO tailwindcss-animate)

# Start frontend
npm run dev  # Runs on http://localhost:5175

# Access Application
# Frontend: http://localhost:5175
# Backend API: http://localhost:3001/api/health
# Database: postgresql://localhost:5436/queue_manager
# Prisma Studio: npx prisma studio (opens on http://localhost:5555)
```

**⚠️ Common Issues & Solutions:**

1. **PostCSS Error: "Cannot find module 'tailwindcss/plugin'"**
   - Solution: Use Tailwind CSS 3.4.1, NOT 4.x
   - Remove `tailwindcss-animate` from dependencies
   - Set `plugins: []` in tailwind.config.js

2. **Backend Error: "Named export 'PrismaClient' not found"**
   - Solution: Run `npx prisma generate` after creating schema
   - This generates the Prisma Client code

3. **Port 5432 Already in Use**
   - Solution: Use port 5436 for PostgreSQL (already configured in examples)

**🎉 You now have everything needed to recreate this application!**
