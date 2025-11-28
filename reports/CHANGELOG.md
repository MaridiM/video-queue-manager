# CHANGELOG

## [2024-11-28] Video Queue - Реализация функционала Python скриптов

### 🎯 Цель
Перенос функционала из Python скриптов (`add_video_to_queue.py`, `calculate_priority.py`) в веб-приложение.

---

### ✅ Backend (apps/api/server.js)

#### Добавлены утилитарные функции:

**1. `calculatePriorityScore(views, likes, publishDate)`**
- Расчёт Priority Score (0-100) на основе метрик видео
- Алгоритм идентичен Python скрипту `calculate_priority.py`:
  - Views (30% weight) — 1M views = 30 pts
  - Likes (20% weight) — 50K likes = 20 pts
  - Recency (30% weight) — новее = выше
  - Engagement (20% weight) — likes/views ratio

**2. `extractVideoId(url)`**
- Извлечение Video ID из YouTube URL
- Поддерживает форматы:
  - `youtube.com/watch?v=ID`
  - `youtu.be/ID`
  - `youtube.com/embed/ID`
- Поддержка тестовых ID любой длины (не только 11 символов)

#### Обновлён endpoint POST /api/video-queue:

**Добавлена проверка дубликатов:**
```javascript
const existingVideo = await prisma.videoQueue.findFirst({
  where: { videoId: videoId }
});
if (existingVideo) {
  return res.status(409).json({
    success: false,
    error: 'Video already exists in queue',
    duplicate: true,
    existing: { queue_id, video_title, status }
  });
}
```

**Автоматический расчёт приоритета:**
```javascript
const priorityScore = calculatePriorityScore(views, likes, publishDate);

// Авто-определение уровня приоритета
if (priorityScore >= 60) priorityLevel = 'high';
else if (priorityScore >= 30) priorityLevel = 'medium';
else priorityLevel = 'low';
```

**Добавлено логирование:**
```
📹 Creating video entry:
   URL: https://youtube.com/watch?v=...
   Extracted Video ID: abc123xyz11
   Views: 150000 | Likes: 5000
✅ Video created successfully:
   Queue ID: VQ-009
   Video ID in DB: abc123xyz11
   Priority Score: 45.23
```

---

### ✅ Frontend Types (apps/web/src/lib/types.ts)

**Обновлён интерфейс VideoQueueItem:**
```typescript
export interface VideoQueueItem {
  // Новые поля:
  video_id?: string;
  views?: number;
  likes?: number;
  comments?: number;
  publish_date?: string;
  priority_score?: number;  // 0-100
  topic_category?: string;
  research_source?: ResearchSource;
  added_date?: string;
  duration?: string;  // HH:MM:SS format
}
```

**Добавлен тип ResearchSource:**
```typescript
export type ResearchSource = 'Perplexity' | 'Gemini' | 'GPT' | 'DeepSeek' | 'YouTube' | 'Manual';
```

**Обновлён интерфейс VideoFormData:**
```typescript
export interface VideoFormData {
  // Новые поля:
  views?: number;
  likes?: number;
  comments?: number;
  publish_date?: string;
  topic_category?: string;
  research_source?: ResearchSource;
  added_by?: string;
}
```

---

### ✅ Frontend Constants (apps/web/src/lib/constants.ts)

**Добавлены константы:**
```typescript
export const RESEARCH_SOURCES = [
  'Perplexity', 'Gemini', 'GPT', 'DeepSeek', 'YouTube', 'Manual'
] as const;

export const TOPIC_CATEGORIES = [
  'AI Development', 'Video Editing', 'Design Research',
  'Social Media', 'Marketing', 'Automation', 'Workflow', 'Other'
] as const;
```

---

### ✅ VideoForm Component (apps/web/src/components/VideoForm.tsx)

**Добавлены новые поля формы:**

| Поле | Тип | Описание |
|------|-----|----------|
| Topic Category | select | AI Development, Video Editing, etc. |
| Research Source | select | Perplexity, Gemini, GPT, DeepSeek, YouTube, Manual |

**Добавлена раскрывающаяся секция "Video Metrics":**
- Views (number input)
- Likes (number input)
- Comments (number input)
- Publish Date (date picker)
- Added By (text input)

**Подсказка под Priority:**
```
"Auto-calculated from metrics if views/likes provided"
```

---

### ✅ VideoQueueTable Component (apps/web/src/components/VideoQueueTable.tsx)

**Обновлена функция handleAdd:**
```typescript
const result = await videoQueueAPI.create({
  video_url: formData.video_url,
  video_title: formData.video_title,
  channel_name: formData.channel_name,
  duration_minutes: formData.duration_minutes,
  views: formData.views,           // NEW
  likes: formData.likes,           // NEW
  comments: formData.comments,     // NEW
  publish_date: formData.publish_date,  // NEW
  priority: formData.priority,
  department: formData.department,
  topic_category: formData.topic_category,    // NEW
  research_source: formData.research_source,  // NEW
  added_by: formData.added_by || 'System',    // NEW
  notes: formData.notes,
});
```

**Добавлено отображение ошибок в модальном окне:**
```jsx
{error && (
  <div className="mb-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
    <AlertCircle /> Error
    <p>{error}</p>
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

---

### ✅ API Client (apps/web/src/lib/api.ts)

**Обновлена функция videoQueueAPI.create:**
```typescript
create: (data: {
  video_url: string;
  video_title: string;
  channel_name?: string;
  duration_minutes?: number;
  views?: number;        // NEW
  likes?: number;        // NEW
  comments?: number;     // NEW
  publish_date?: string; // NEW
  priority?: string;
  department: string;
  topic_category?: string;    // NEW
  research_source?: string;   // NEW
  added_by?: string;          // NEW
  notes?: string;
}) => fetchAPI<VideoQueueAPI>('/api/video-queue', { ... })
```

---

## Сравнение с Python скриптом

| Функционал | Python | Web App |
|------------|--------|---------|
| extract_video_id() | ✅ | ✅ |
| generate_queue_id() | VQ-XXX | VQ-XXX ✅ |
| Duplicate detection | ✅ | ✅ |
| calculate_priority_score() | 0-100 | 0-100 ✅ |
| Queue_ID | ✅ | ✅ |
| Video_ID | ✅ | ✅ |
| Video_Title | ✅ | ✅ |
| Channel_Name | ✅ | ✅ |
| Video_URL | ✅ | ✅ |
| Views | ✅ | ✅ |
| Likes | ✅ | ✅ |
| Comments | ✅ | ✅ |
| Publish_Date | ✅ | ✅ |
| Duration | ✅ | ✅ |
| Added_By | ✅ | ✅ |
| Added_Date | ✅ auto | ✅ auto |
| Status | ✅ | ✅ |
| Topic_Category | ✅ | ✅ |
| Research_Source | ✅ | ✅ |
| Priority_Score | ✅ | ✅ |
| Notes | ✅ | ✅ |

---

## Файлы изменены

```
apps/api/server.js
  + calculatePriorityScore()
  + extractVideoId()
  + Duplicate detection
  + Priority auto-calculation
  + Console logging

apps/web/src/lib/types.ts
  + ResearchSource type
  + VideoQueueItem fields
  + VideoFormData fields

apps/web/src/lib/constants.ts
  + RESEARCH_SOURCES
  + TOPIC_CATEGORIES

apps/web/src/lib/api.ts
  + videoQueueAPI.create fields

apps/web/src/components/VideoForm.tsx
  + Topic Category field
  + Research Source field
  + Video Metrics section (collapsible)
  + Views, Likes, Comments, Publish Date, Added By

apps/web/src/components/VideoQueueTable.tsx
  + handleAdd with new fields
  + Error display in modal
  + X icon import
```

---

## Тестирование

### Проверка извлечения Video ID:
```
✅ https://youtube.com/watch?v=mno345      → mno345
✅ https://youtube.com/watch?v=dQw4w9WgXcQ → dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ            → dQw4w9WgXcQ
✅ https://youtube.com/embed/xyz123        → xyz123
```

### Проверка дубликатов:
```
✅ При добавлении видео с существующим Video ID:
   → Ошибка 409: "Video already exists in queue"
   → Показывается в модальном окне
```

### Проверка Priority Score:
```
✅ Views: 1,500,000 | Likes: 45,000 | 30 days old
   → Score: ~75 (high priority)

✅ Views: 10,000 | Likes: 200 | 60 days old
   → Score: ~25 (low priority)
```

---

## [2024-11-28] Update Queue Status - Реализация update_queue_status.py

### ✅ Backend Additions

#### 1. Автоматические даты при смене статуса (PUT /api/video-queue/:id)

```javascript
// При status='selected' → auto-set selected_date, selected_by
// При status='transcribed' или 'complete' → auto-set parsed_date
```

#### 2. Batch Update Endpoint (POST /api/video-queue/batch-update)

```javascript
// Request:
{
  "queue_ids": ["VQ-001", "VQ-002", "VQ-003"],
  "status": "selected",
  "selected_by": "john@example.com"
}

// Response:
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "successful": ["VQ-001", "VQ-002", "VQ-003"]
  }
}
```

#### 3. Queue Summary Endpoint (GET /api/video-queue/summary)

```javascript
// Response:
{
  "success": true,
  "data": {
    "total": 25,
    "total_views": 15000000,
    "total_likes": 450000,
    "average_priority_score": "52.30",
    "by_status": [
      { "status": "pending", "count": 10, "percentage": "40.0" },
      { "status": "selected", "count": 8, "percentage": "32.0" }
    ],
    "top_topics": [
      { "topic": "AI Development", "count": 8 },
      { "topic": "Video Editing", "count": 5 }
    ],
    "by_source": [
      { "source": "Perplexity", "count": 12 },
      { "source": "YouTube", "count": 8 }
    ],
    "by_department": [
      { "department": "DEV", "count": 10 },
      { "department": "VID", "count": 8 }
    ]
  }
}
```

### ✅ Frontend API Client Additions

```typescript
// api.ts
videoQueueAPI.batchUpdate({
  queue_ids: ['VQ-001', 'VQ-002'],
  status: 'selected',
  selected_by: 'user@example.com'
});

videoQueueAPI.getSummary();
```

### Сравнение с Python

| Функция Python | Web App | Статус |
|----------------|---------|--------|
| `update_status()` | PUT /api/video-queue/:id | ✅ + auto-dates |
| `update_multiple_status()` | POST /api/video-queue/batch-update | ✅ |
| `show_queue_summary()` | GET /api/video-queue/summary | ✅ |
| `list_by_status()` | Client-side filter | ✅ |

