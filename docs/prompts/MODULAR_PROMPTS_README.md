# Modular Application Generation Prompts

**Project:** Queue Manager - Full-Stack Application
**Format:** 5-Part Modular Prompt System
**Total Size:** ~200KB combined
**Purpose:** Generate complete application using multiple focused prompts

---

## 📦 Module Structure

### ✅ Part 1: Core Configuration & Setup
**File:** `05_COMPLETE_APP_GENERATION_PROMPT_1.md` (69KB)
**Dependencies:** None (start here)
**Contains:**
- Technology stack (React 19, Express, Prisma, PostgreSQL)
- Complete database schema (7 models)
- Backend server setup
- Frontend app shell & Sidebar
- Shared UI components (Button, Card, Badge, Input)
- API client base
- Global styles & Tailwind config
- Environment configuration

**Status:** ✅ Complete

---

### ✅ Part 2: Dashboard Page
**File:** `05_COMPLETE_APP_GENERATION_PROMPT_2.md` (90KB)
**Dependencies:** Part 1
**Contains:**
- Dashboard statistics API endpoint
- Statistics cards with trends
- Recharts visualizations (Line, Pie, Bar charts)
- AI cost tracker widget
- Recent activity feed
- Progress bar component
- Status & priority badges
- 30-day trend analysis

**Status:** ✅ Complete

---

### ⏳ Part 3: Search Queue Page
**File:** `05_COMPLETE_APP_GENERATION_PROMPT_3.md`
**Dependencies:** Part 1
**Contains:**
- Search Queue CRUD API (5 endpoints)
- CSV synchronization (Dropbox + local fallback)
- TanStack Table with sorting
- Add/Edit form with Zod validation
- Perplexity AI settings (creativity, structure mode)
- Employee assignment
- Status tracking (Assigned → In Progress → Completed)

**Status:** ⏳ In Progress

---

### 🔲 Part 4: Video Queue Page
**File:** `05_COMPLETE_APP_GENERATION_PROMPT_4.md`
**Dependencies:** Part 1
**Will Contain:**
- Video Queue CRUD API (8 endpoints)
- Priority score calculation algorithm
- YouTube integration
- AI transcription pipeline (7 steps)
- Video detail view with transcription
- Entity extraction viewer
- Batch operations
- Export functionality (CSV, JSON, Markdown)
- Filter panel

**Status:** 🔲 Planned

---

### 🔲 Part 5: Settings Page
**File:** `05_COMPLETE_APP_GENERATION_PROMPT_5.md`
**Dependencies:** Part 1
**Will Contain:**
- AI Providers settings (Google AI, OpenAI)
- Model selection per provider
- API key management with masking
- Connection testing
- Dropbox settings (token, root path)
- Settings persistence (settings.json)

**Status:** 🔲 Planned

---

## 🚀 Usage Instructions

### Method 1: Sequential Generation (Recommended)

Use each part in order to build the application incrementally:

```
Step 1: Generate Core (Part 1)
→ AI generates: Database, Backend skeleton, Frontend shell, UI components

Step 2: Generate Dashboard (Part 2)
→ AI generates: Dashboard page with charts and statistics

Step 3: Generate Search Queue (Part 3)
→ AI generates: Search Queue management page

Step 4: Generate Video Queue (Part 4)
→ AI generates: Video Queue management + AI pipeline

Step 5: Generate Settings (Part 5)
→ AI generates: Settings page with AI/Dropbox configuration
```

### Method 2: Parallel Generation

For faster development with multiple AI instances:

```
AI Instance 1: Part 1 (Core) → Part 2 (Dashboard)
AI Instance 2: Part 1 (Core) → Part 3 (Search Queue)
AI Instance 3: Part 1 (Core) → Part 4 (Video Queue)
AI Instance 4: Part 1 (Core) → Part 5 (Settings)

Then merge all generated code
```

### Method 3: Single Comprehensive Prompt

If your AI supports large prompts (~200KB), combine all parts:

```bash
# Combine all parts into one prompt
cat 05_COMPLETE_APP_GENERATION_PROMPT_*.md > FULL_PROMPT.md

# Use FULL_PROMPT.md with AI
```

---

## 📋 Prompt Usage Template

### For Each Part:

```
I need you to generate code for [Part N: Module Name].

Context:
- This is part of a modular full-stack application
- Previous parts have been implemented: [list completed parts]
- Follow all architecture patterns from Part 1
- Use exact technology versions specified

Requirements:
1. Generate ALL code mentioned in the prompt
2. Preserve full UI detail and functionality
3. Include error handling and loading states
4. Follow TypeScript best practices
5. Use Tailwind CSS for styling
6. Implement all API endpoints completely

Output Format:
- Provide complete, working code files
- Include file paths for each code block
- Add comments for complex logic
- Ensure all imports are correct

Ready? Please generate [Part N] now.
```

---

## 🎯 Integration Checklist

After generating each part, verify:

### Part 1 (Core)
- [ ] Database migrations run successfully
- [ ] Backend server starts on port 3001
- [ ] Frontend dev server starts on port 5173
- [ ] Sidebar navigation displays correctly
- [ ] API health check returns 200 OK

### Part 2 (Dashboard)
- [ ] Dashboard loads without errors
- [ ] Statistics display correct counts
- [ ] Charts render with data
- [ ] Cost tracker widget appears
- [ ] Recent videos list shows data

### Part 3 (Search Queue)
- [ ] Search queue table displays
- [ ] Add/Edit form opens and saves
- [ ] CSV sync works (Dropbox or local)
- [ ] Status badges display correctly
- [ ] Delete confirmation works

### Part 4 (Video Queue)
- [ ] Video queue table with sorting/filtering
- [ ] Priority scores calculate correctly
- [ ] AI transcription pipeline runs
- [ ] Video detail view opens
- [ ] Export functions work

### Part 5 (Settings)
- [ ] AI provider settings save
- [ ] Connection tests work
- [ ] API keys are masked
- [ ] Dropbox settings persist
- [ ] Model selection functions

---

## 🔧 Troubleshooting

### If Generated Code Has Errors:

1. **Import Errors**
   - Verify all dependencies in package.json
   - Run `npm install` in both api/ and web/ directories

2. **Database Errors**
   - Check DATABASE_URL in .env
   - Run `npx prisma migrate dev`
   - Verify PostgreSQL is running

3. **API Connection Errors**
   - Check VITE_API_URL in web/.env
   - Ensure backend is running on port 3001
   - Verify CORS is enabled

4. **Styling Issues**
   - Check Tailwind CSS configuration
   - Verify @tailwindcss/vite plugin is installed
   - Restart dev server after config changes

5. **Type Errors**
   - Run `tsc --noEmit` to check TypeScript errors
   - Verify all interfaces are properly defined
   - Check that Prisma types are generated

---

## 📊 Module Size Breakdown

| Module | Size | Lines | Components | API Endpoints |
|--------|------|-------|------------|---------------|
| Part 1 | 69KB | 1000+ | 5 core UI | 3 |
| Part 2 | 90KB | 880+ | 4 dashboard | 1 (enhanced) |
| Part 3 | ~80KB | ~700 | 2 search | 5 |
| Part 4 | ~100KB | ~1000 | 5 video | 8 |
| Part 5 | ~60KB | ~500 | 3 settings | 7 |
| **Total** | **~400KB** | **~4000+** | **19** | **24** |

---

## ⚙️ Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
PORT=3001
NODE_ENV=development
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Settings (settings.json - auto-generated)
```json
{
  "openai": { "apiKey": "", "enabled": false, "model": "gpt-4o-mini" },
  "google": { "apiKey": "", "enabled": false, "model": "gemini-2.0-flash" },
  "defaultProvider": "google",
  "dropbox": { "accessToken": "", "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES", "enabled": false }
}
```

---

## 🎓 Best Practices

### When Using These Prompts:

1. **Start with Part 1** - Foundation is critical
2. **Test after each part** - Verify before moving forward
3. **Keep context** - Mention completed parts when generating new ones
4. **Review dependencies** - Check package.json matches each part
5. **Incremental commits** - Git commit after each working part
6. **Read comments** - Generated code includes implementation notes

### For AI:

- Provide full context about previously generated parts
- Specify exact file paths for output
- Request complete code, not pseudo-code
- Ask for TypeScript types explicitly
- Verify API endpoint paths match

---

## 📚 Additional Resources

### Related Documentation:
- **Original Prompt:** `05_COMPLETE_APP_GENERATION_PROMPT.md` (62KB, monolithic)
- **Analysis Summary:** `06_APP_ANALYSIS_SUMMARY.md` (12KB)
- **Backend Docs:** `01_BACKEND_ARCHITECTURE.md`
- **Frontend Docs:** `02_FRONTEND_ARCHITECTURE.md`
- **Database Docs:** `03_DATABASE_SCHEMA.md`

### Technology Documentation:
- React 19: https://react.dev
- Vite 7: https://vitejs.dev
- Prisma 7: https://www.prisma.io/docs
- Tailwind CSS 4: https://tailwindcss.com
- TanStack Table: https://tanstack.com/table

---

## ✅ Completion Status

- [x] Part 1: Core Setup (69KB)
- [x] Part 2: Dashboard (90KB)
- [ ] Part 3: Search Queue (~80KB) - **70% complete**
- [ ] Part 4: Video Queue (~100KB) - **Planned**
- [ ] Part 5: Settings (~60KB) - **Planned**
- [ ] Master README - **This file**

---

## 🎯 Success Criteria

Application is complete when:
- ✅ All 5 parts are generated
- ✅ All 24 API endpoints function
- ✅ All 19 components render correctly
- ✅ Database has all 7 models with data
- ✅ Dashboard shows statistics and charts
- ✅ Search Queue CRUD operations work
- ✅ Video Queue with AI pipeline functions
- ✅ Settings persist and connect to services
- ✅ No TypeScript errors
- ✅ No console errors in browser
- ✅ All tests pass (if implemented)

---

**Version:** 1.0.0
**Created:** 2025-12-09
**Last Updated:** 2025-12-09
**Maintainer:** Development Team

---

**Note:** This modular approach allows for better organization, parallel development, and easier maintenance compared to a single monolithic prompt.
