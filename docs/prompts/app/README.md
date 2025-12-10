# Queue Manager - Modular Generation Prompts

**Location:** `docs/prompts/app/`
**Purpose:** Step-by-step application generation prompts
**Format:** 5 independent modules
**Total:** ~300KB combined

---

## 📦 Available Modules

### ✅ 01_CORE_SETUP.md (68KB)
**Status:** Complete
**Dependencies:** None (start here)

**Contains:**
- Complete technology stack (React 19, Express, Prisma, PostgreSQL)
- Full database schema (7 Prisma models)
- Backend server setup with middleware
- Frontend app shell (App.tsx, Sidebar)
- Shared UI components (Button, Card, Badge, Input)
- API client base (fetchAPI wrapper)
- Global Tailwind CSS configuration
- Environment setup (.env files)

**Use this to generate:**
- Database structure
- Backend foundation
- Frontend skeleton
- Navigation system

---

### ✅ 02_DASHBOARD_PAGE.md (26KB)
**Status:** Complete
**Dependencies:** 01_CORE_SETUP.md

**Contains:**
- Dashboard statistics API (`/api/overview`)
- 30-day trend analysis
- 4 main stat cards + 3 secondary
- Recharts visualizations:
  - Line chart (video processing trend)
  - Pie chart (department distribution)
  - Bar charts (status & priority breakdown)
- AI cost tracker widget with budget monitoring
- Recent activity feed
- Progress bar component
- StatusBadge & PriorityBadge components

**Use this to generate:**
- Complete Dashboard page
- All charts and visualizations
- Cost tracking functionality

---

### ✅ 03_SEARCH_QUEUE_PAGE.md
**Status:** Complete
**Dependencies:** 01_CORE_SETUP.md

**Should contain:**

#### Backend (5 endpoints):
```javascript
GET    /api/search-queue              // Get all searches
POST   /api/search-queue              // Create new search
PUT    /api/search-queue/:id          // Update search
DELETE /api/search-queue/:id          // Delete search
POST   /api/search-queue/sync-csv     // Sync from CSV (Dropbox/local)
```

#### Frontend Components:
- **SearchQueueTable.tsx** - TanStack Table with sorting
  - Columns: searchId, topic, query, department, status, videosFound, employee, actions
  - Features: Sort, edit, delete, CSV sync

- **SearchQueueForm.tsx** - Add/Edit modal
  - Fields: searchId, department, topic, searchQuery, employee, status
  - Perplexity settings: creativity (0-1), structureMode (checkbox)
  - Validation: React Hook Form + Zod

#### Key Features:
- CSV sync with Dropbox-first, local-fallback pattern
- Status workflow: Assigned → In_Progress → Completed
- Department & status badges
- Perplexity AI configuration per search
- Employee assignment
- Notes field

---

### ✅ 04_VIDEO_QUEUE_PAGE.md
**Status:** Complete
**Dependencies:** 01_CORE_SETUP.md

**Should contain:**

#### Backend (8 endpoints):
```javascript
GET    /api/video-queue                    // Get all videos (with filters)
POST   /api/video-queue                    // Create video (with duplicate check)
PUT    /api/video-queue/:id                // Update video
DELETE /api/video-queue/:id                // Delete video
POST   /api/video-queue/sync-csv           // CSV sync
POST   /api/video-queue/batch-update       // Batch operations
GET    /api/video-queue/summary            // Statistics
GET    /api/video-queue/export?format=     // Export (csv/json/markdown)
```

#### Business Logic:
```javascript
// Priority Score Calculation (0-100)
function calculatePriorityScore(video) {
  const viewsScore = Math.min((views / 1000000) * 30, 30);           // 30%
  const likesScore = Math.min((likes / 50000) * 20, 20);             // 20%
  const recencyScore = max(0, 30 - (ageInDays / 365) * 30);          // 30%
  const engagementScore = min((likes/views / 0.01) * 20, 20);        // 20%
  return viewsScore + likesScore + recencyScore + engagementScore;
}
```

#### Frontend Components:
- **VideoQueueTable.tsx** - Advanced table
  - Filters: status, department, priority
  - Sortable columns
  - Batch selection
  - Export button

- **VideoForm.tsx** - Video add/edit
  - URL validation & video ID extraction
  - Metadata fields (views, likes, duration)
  - Priority assignment
  - Advanced fields accordion

- **VideoDetailView.tsx** - Full video details
  - Video metadata display
  - AI transcription pipeline UI
  - Entity extraction viewer
  - Transcription text display

- **FilterPanel.tsx** - Advanced filtering
  - Status multi-select
  - Department multi-select
  - Priority multi-select
  - Search by title/URL

#### Key Features:
- YouTube video ID extraction
- Duplicate detection
- Auto priority scoring
- Status pipeline: pending → selected → transcribing → transcribed → processing → complete
- Batch status updates
- Export to multiple formats

---

### ✅ 05_SETTINGS_PAGE.md
**Status:** Complete
**Dependencies:** 01_CORE_SETUP.md

**Should contain:**

#### Backend (7 endpoints):
```javascript
GET    /api/settings                    // Get AI settings
PUT    /api/settings                    // Update AI settings
POST   /api/settings/test               // Test AI connection
GET    /api/settings/dropbox            // Get Dropbox settings
PUT    /api/settings/dropbox            // Update Dropbox settings
POST   /api/settings/dropbox/test       // Test Dropbox connection
GET    /api/settings/available-models   // List available models
```

#### Frontend Components:
- **Settings.tsx** - Main settings page
  - Tabs: AI Providers, Dropbox

- **AIProvidersSettings.tsx** - AI configuration
  - Google AI card:
    - API key input (masked)
    - Model selector (gemini-2.5-flash, gemini-1.5-flash, etc.)
    - Enable checkbox
    - Test connection button
  - OpenAI card:
    - API key input (masked)
    - Model selector (gpt-4o-mini, gpt-4o, gpt-4-turbo)
    - Enable checkbox
    - Test connection button
  - Default provider selector

- **DropboxSettings.tsx** - Dropbox configuration
  - Access token input (masked)
  - Root path input
  - Enable checkbox
  - Test connection button
  - Account info display (email, name)

#### Key Features:
- API key masking (show first 7 + last 4 chars)
- Connection testing with status feedback
- Settings persistence to `settings.json`
- Token validation (Dropbox: must start with "sl.", min 20 chars)
- Model selection per provider
- Default provider selection

---

## 🚀 Usage Instructions

### Step 1: Generate Core (Required First)

```
Prompt: Use 01_CORE_SETUP.md

Result:
- Database ready (7 models)
- Backend server running on :3001
- Frontend shell running on :5173
- Basic navigation working
```

### Step 2: Generate Pages (Any Order)

**Option A: Sequential (Recommended)**
```
Day 1: 01_CORE_SETUP → 02_DASHBOARD
Day 2: 03_SEARCH_QUEUE
Day 3: 04_VIDEO_QUEUE
Day 4: 05_SETTINGS
```

**Option B: Parallel (Faster)**
```
AI Instance 1: 01 + 02
AI Instance 2: 01 + 03
AI Instance 3: 01 + 04
AI Instance 4: 01 + 05
Then: Merge code
```

### Step 3: Integration

After each module, update `App.tsx`:

```typescript
import DashboardStats from './components/DashboardStats';          // Part 2
import SearchQueueTable from './components/SearchQueueTable';      // Part 3
import VideoQueueTable from './components/VideoQueueTable';        // Part 4
import Settings from './pages/Settings';                            // Part 5

// In render:
{currentView === 'dashboard' && <DashboardStats />}
{currentView === 'search-queue' && <SearchQueueTable />}
{currentView === 'video-queue' && <VideoQueueTable />}
{currentView === 'settings' && <Settings />}
```

---

## 📋 Prompt Template

For each part, use this template:

```
Generate [Part N: Module Name] for Queue Manager application.

Context:
- Part 1 (Core Setup) is complete
- Database schema is implemented (7 models)
- Backend runs on Express.js with Prisma
- Frontend uses React 19 + TypeScript + Vite + Tailwind

Requirements:
1. Generate ALL code from the prompt
2. Include file paths for each code block
3. Preserve full UI detail and functionality
4. Add error handling and loading states
5. Use TypeScript with proper types
6. Follow Tailwind CSS styling from Part 1

Please generate complete working code for [Part N].
```

---

## ⚙️ Environment Setup

Before starting, configure:

### Backend `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
PORT=3001
NODE_ENV=development
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01
```

### Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001
```

### Database:
```bash
cd api
npx prisma migrate dev
npm run db:seed
```

---

## ✅ Verification Checklist

### After Part 1 (Core):
- [ ] `npm run dev` works in api/
- [ ] `npm run dev` works in web/
- [ ] Database has 7 tables
- [ ] Sidebar navigation displays
- [ ] GET /api/health returns 200

### After Part 2 (Dashboard):
- [ ] Dashboard loads without errors
- [ ] Statistics show correct counts
- [ ] All charts render with data
- [ ] Cost tracker displays

### After Part 3 (Search Queue):
- [ ] Table displays searches
- [ ] Add/Edit form works
- [ ] CSV sync functions
- [ ] Delete confirmation works

### After Part 4 (Video Queue):
- [ ] Table with sorting/filtering
- [ ] Priority scores calculate
- [ ] Video detail view opens
- [ ] Export works

### After Part 5 (Settings):
- [ ] AI settings save
- [ ] Connection tests work
- [ ] API keys masked
- [ ] Dropbox settings persist

---

## 🎯 Module Status

| Module | Size | Status | Components | Endpoints |
|--------|------|--------|------------|-----------|
| 01 Core | 68KB | ✅ Complete | 5 UI | 3 |
| 02 Dashboard | 26KB | ✅ Complete | 4 | 1 |
| 03 Search Queue | ~35KB | ✅ Complete | 2 | 5 |
| 04 Video Queue | ~120KB | ✅ Complete | 5 | 8 |
| 05 Settings | ~60KB | ✅ Complete | 3 | 7 |
| **Total** | **~309KB** | **✅ 100%** | **19** | **24** |

---

## 🔧 Quick Commands

```bash
# Backend
cd api
npm install
npm run db:migrate
npm run dev

# Frontend
cd web
npm install
npm run dev

# Access
Frontend: http://localhost:5173
Backend: http://localhost:3001
Database: postgresql://localhost:5434/phase0
```

---

## 📚 Related Documentation

- **Original Monolithic Prompt:** `../05_COMPLETE_APP_GENERATION_PROMPT.md` (62KB)
- **Analysis Summary:** `../06_APP_ANALYSIS_SUMMARY.md` (12KB)
- **Maintenance Guide:** `../PROMPT_MAINTENANCE_TEMPLATE.md` - Как обновлять промпты
- **Quick Sync Cheatsheet:** `../QUICK_SYNC_CHEATSHEET.md` - Быстрая шпаргалка
- **Backend Architecture:** `../01_BACKEND_ARCHITECTURE.md`
- **Frontend Architecture:** `../02_FRONTEND_ARCHITECTURE.md`
- **Database Schema:** `../03_DATABASE_SCHEMA.md`

---

## 🔄 Maintenance & Updates

**ВАЖНО:** После изменений в коде приложения нужно синхронизировать промпты!

### Быстрая инструкция:

1. Внес изменения в код → выполни `git diff --name-only HEAD`
2. Определи какие модули затронуты (смотри карту в `../QUICK_SYNC_CHEATSHEET.md`)
3. Используй шаблоны из `../PROMPT_MAINTENANCE_TEMPLATE.md`
4. Дай промпт AI для обновления затронутых модулей
5. Проверь и закоммить обновленные промпты

### Полные руководства:

- 📘 [PROMPT_MAINTENANCE_TEMPLATE.md](../PROMPT_MAINTENANCE_TEMPLATE.md) - Подробные шаблоны для всех случаев
- ⚡ [QUICK_SYNC_CHEATSHEET.md](../QUICK_SYNC_CHEATSHEET.md) - Быстрая шпаргалка

**Правило:** Синхронизируй промпты в тот же день когда меняешь код!

---

**Version:** 1.0.0
**Created:** 2025-12-10
**Updated:** 2025-12-10
**Status:** ✅ 5/5 modules complete (All done!)

---

**Все модули созданы и готовы к использованию!** 🎉
