# 📋 Video Add - Implementation Plan

**Дата:** 2025-11-28
**Источник анализа:** `01_VIDEO_QUEUE/scripts/add_video_to_queue.py`

---

## 📊 Сравнение: Scripts vs Web App

### Текущая форма добавления видео (VideoForm.tsx)

| Поле | В форме | Обязательное |
|------|---------|--------------|
| video_url | ✅ | Да |
| video_title | ✅ | Да |
| channel_name | ✅ | Нет |
| duration_minutes | ✅ | Да |
| priority | ✅ | Нет |
| department | ✅ | Нет |
| status | ✅ | Нет |
| notes | ✅ | Нет |

### Поля в Python скриптах (НЕ реализованы)

| Поле | Описание | Важность |
|------|----------|----------|
| topic_category | Категория темы исследования | 🔴 Высокая |
| research_source | Источник (Perplexity, Gemini, YouTube...) | 🔴 Высокая |
| views | Количество просмотров | 🟡 Средняя |
| likes | Количество лайков | 🟡 Средняя |
| comments | Количество комментариев | 🟡 Средняя |
| publish_date | Дата публикации видео | 🟡 Средняя |

---

## 🔴 Критичный функционал НЕ реализован

### 1. Duplicate Detection (Проверка дубликатов)

**В скриптах:**
```python
# Извлечение Video ID из URL
def extract_video_id(url):
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'v=([a-zA-Z0-9_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

# Проверка дубликата
if video_id in queue_df['Video_ID'].values:
    existing_queue_id = queue_df[queue_df['Video_ID'] == video_id]['Queue_ID'].values[0]
    print(f"⚠️ Video already in queue: {existing_queue_id}")
    return existing_queue_id
```

**В Web App:** ❌ Нет проверки - можно добавить одно видео несколько раз

---

### 2. Priority Score Calculation (Автоматический расчёт приоритета)

**В скриптах:**
```python
def calculate_priority_score(video_metadata):
    views = int(video_metadata.get('views', 0))
    likes = int(video_metadata.get('likes', 0))
    publish_date = video_metadata.get('publish_date', datetime.now())
    
    # Views (30%) - 1M = 30 points
    views_score = min(30, (views / 1000000) * 30)
    
    # Likes (20%) - 50K = 20 points
    likes_score = min(20, (likes / 50000) * 20)
    
    # Recency (30%) - новое = 30 points
    days_since_publish = (datetime.now() - publish_date).days
    recency_score = max(0, 30 - (days_since_publish / 365) * 30)
    
    # Engagement (20%) - 1% = 20 points
    engagement_score = min(20, (likes/views) * 2000) if views > 0 else 0
    
    return round(views_score + likes_score + recency_score + engagement_score, 2)
```

**В Web App:** ❌ Priority Score не рассчитывается автоматически

---

## 📝 План реализации

### Задача 1: Добавить недостающие поля в форму

**Файлы для изменения:**
- `apps/web/src/components/VideoForm.tsx`
- `apps/web/src/lib/types.ts`

**Новые поля:**
```typescript
interface VideoFormData {
  // Существующие поля...
  
  // Новые поля:
  topic_category?: string;      // Dropdown или input
  research_source?: string;     // Dropdown: Perplexity, Gemini, YouTube, GPT, DeepSeek
  views?: number;               // Input number
  likes?: number;               // Input number  
  comments?: number;            // Input number
  publish_date?: string;        // Date picker
}
```

**Константы для dropdown (constants.ts):**
```typescript
export const RESEARCH_SOURCES = [
  'Perplexity',
  'Gemini', 
  'YouTube',
  'GPT',
  'DeepSeek',
  'Manual'
] as const;

export const TOPIC_CATEGORIES = [
  'AI Automation',
  'Video Editing',
  'Design Research',
  'Social Media',
  'Marketing',
  'Development',
  'Other'
] as const;
```

---

### Задача 2: API endpoint для проверки дубликатов

**Файл:** `apps/api/server.js`

**Новый endpoint:**
```javascript
// GET /api/video-queue/check-duplicate?video_url=...
app.get('/api/video-queue/check-duplicate', async (req, res) => {
  try {
    const { video_url } = req.query;
    
    // Extract video ID from URL
    const videoId = extractVideoId(video_url);
    if (!videoId) {
      return res.json({ success: true, exists: false });
    }
    
    // Check if exists
    const existing = await prisma.videoQueue.findFirst({
      where: { videoId },
    });
    
    if (existing) {
      res.json({ 
        success: true, 
        exists: true, 
        existing_queue_id: existing.queueId,
        existing_title: existing.videoTitle
      });
    } else {
      res.json({ success: true, exists: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Задача 3: Frontend проверка дубликатов

**Файл:** `apps/web/src/components/VideoForm.tsx`

**Добавить:**
```typescript
const [duplicateWarning, setDuplicateWarning] = useState<{
  exists: boolean;
  queue_id?: string;
  title?: string;
} | null>(null);

// Debounced check when URL changes
useEffect(() => {
  const checkDuplicate = async () => {
    if (formData.video_url && formData.video_url.includes('youtube')) {
      const result = await videoQueueAPI.checkDuplicate(formData.video_url);
      if (result.success && result.data?.exists) {
        setDuplicateWarning({
          exists: true,
          queue_id: result.data.existing_queue_id,
          title: result.data.existing_title
        });
      } else {
        setDuplicateWarning(null);
      }
    }
  };
  
  const timeout = setTimeout(checkDuplicate, 500);
  return () => clearTimeout(timeout);
}, [formData.video_url]);
```

**UI предупреждение:**
```tsx
{duplicateWarning?.exists && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
    <AlertTriangle className="text-amber-500" size={18} />
    <div>
      <p className="text-amber-700 text-sm font-medium">
        ⚠️ This video already exists in queue!
      </p>
      <p className="text-amber-600 text-xs">
        Queue ID: {duplicateWarning.queue_id} - {duplicateWarning.title}
      </p>
    </div>
  </div>
)}
```

---

### Задача 4: API endpoint для расчёта Priority Score

**Файл:** `apps/api/server.js`

**Новый endpoint:**
```javascript
// POST /api/video-queue/calculate-priority
app.post('/api/video-queue/calculate-priority', async (req, res) => {
  try {
    const { views = 0, likes = 0, publish_date } = req.body;
    
    // Views score (30%) - 1M = 30 points
    const viewsScore = Math.min(30, (views / 1000000) * 30);
    
    // Likes score (20%) - 50K = 20 points
    const likesScore = Math.min(20, (likes / 50000) * 20);
    
    // Recency score (30%)
    let recencyScore = 30;
    if (publish_date) {
      const pubDate = new Date(publish_date);
      const daysSince = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
      recencyScore = Math.max(0, 30 - (daysSince / 365) * 30);
    }
    
    // Engagement score (20%)
    let engagementScore = 0;
    if (views > 0) {
      const engagementRate = likes / views;
      engagementScore = Math.min(20, engagementRate * 2000);
    }
    
    const totalScore = Math.round((viewsScore + likesScore + recencyScore + engagementScore) * 100) / 100;
    
    res.json({
      success: true,
      data: {
        total_score: totalScore,
        breakdown: {
          views_score: Math.round(viewsScore * 100) / 100,
          likes_score: Math.round(likesScore * 100) / 100,
          recency_score: Math.round(recencyScore * 100) / 100,
          engagement_score: Math.round(engagementScore * 100) / 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Задача 5: Frontend автоматический расчёт Priority Score

**В форме VideoForm.tsx:**
```typescript
const [priorityScore, setPriorityScore] = useState<{
  total: number;
  breakdown: { views: number; likes: number; recency: number; engagement: number };
} | null>(null);

// Calculate when metadata changes
useEffect(() => {
  const calculate = async () => {
    if (formData.views || formData.likes || formData.publish_date) {
      const result = await videoQueueAPI.calculatePriority({
        views: formData.views || 0,
        likes: formData.likes || 0,
        publish_date: formData.publish_date
      });
      if (result.success && result.data) {
        setPriorityScore({
          total: result.data.total_score,
          breakdown: result.data.breakdown
        });
      }
    }
  };
  
  const timeout = setTimeout(calculate, 300);
  return () => clearTimeout(timeout);
}, [formData.views, formData.likes, formData.publish_date]);
```

**UI отображение:**
```tsx
{priorityScore && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-blue-700 font-medium">Priority Score</span>
      <span className="text-2xl font-bold text-blue-600">
        {priorityScore.total}/100
      </span>
    </div>
    <div className="grid grid-cols-4 gap-2 text-xs">
      <div className="text-center">
        <div className="text-blue-600 font-medium">{priorityScore.breakdown.views}</div>
        <div className="text-gray-500">Views</div>
      </div>
      <div className="text-center">
        <div className="text-blue-600 font-medium">{priorityScore.breakdown.likes}</div>
        <div className="text-gray-500">Likes</div>
      </div>
      <div className="text-center">
        <div className="text-blue-600 font-medium">{priorityScore.breakdown.recency}</div>
        <div className="text-gray-500">Recency</div>
      </div>
      <div className="text-center">
        <div className="text-blue-600 font-medium">{priorityScore.breakdown.engagement}</div>
        <div className="text-gray-500">Engage</div>
      </div>
    </div>
  </div>
)}
```

---

## 📋 Итоговый чеклист реализации

### Backend (server.js)
- [ ] `GET /api/video-queue/check-duplicate` - проверка дубликатов
- [ ] `POST /api/video-queue/calculate-priority` - расчёт приоритета
- [ ] Обновить `POST /api/video-queue` - принимать новые поля

### Frontend (api.ts)
- [ ] `checkDuplicate(video_url)` - вызов проверки дубликатов
- [ ] `calculatePriority(metadata)` - вызов расчёта приоритета

### Frontend (types.ts)
- [ ] Добавить новые поля в `VideoFormData`
- [ ] Добавить интерфейс `PriorityScore`

### Frontend (constants.ts)
- [ ] Добавить `RESEARCH_SOURCES`
- [ ] Добавить `TOPIC_CATEGORIES`

### Frontend (VideoForm.tsx)
- [ ] Новые поля: topic_category, research_source, views, likes, comments, publish_date
- [ ] Duplicate warning UI
- [ ] Priority score calculation UI
- [ ] Debounced API calls

---

## ⏱️ Оценка времени

| Задача | Время |
|--------|-------|
| Backend endpoints | 30 мин |
| Frontend API functions | 15 мин |
| Types & constants | 10 мин |
| VideoForm новые поля | 30 мин |
| Duplicate detection UI | 20 мин |
| Priority score UI | 25 мин |
| Тестирование | 20 мин |
| **Итого** | **~2.5 часа** |

---

## 🎨 Mockup новой формы

```
┌─────────────────────────────────────────────────────────────┐
│                    Add Video to Queue                       │
├─────────────────────────────────────────────────────────────┤
│ Video URL *                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://youtube.com/watch?v=abc123                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ This video already exists in queue!                     │
│    Queue ID: VQ-005 - "AI Tutorial Video"                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Video Title *                    │ Channel Name             │
│ ┌───────────────────────────────┐│┌───────────────────────┐ │
│ │ How to use AI agents          │││ AI Explained          │ │
│ └───────────────────────────────┘│└───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Topic Category          │ Research Source                   │
│ ┌───────────────────────┐│┌─────────────────────────────────┐│
│ │ AI Automation       ▼ │││ Perplexity                    ▼ ││
│ └───────────────────────┘│└─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Views        │ Likes       │ Comments    │ Publish Date     │
│ ┌────────────┐│┌───────────┐│┌───────────┐│┌────────────────┐│
│ │ 1,500,000  │││ 45,000    │││ 2,300     │││ 2025-11-20     ││
│ └────────────┘│└───────────┘│└───────────┘│└────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Priority Score                                    85.5  │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │ │
│ │ │ 30.0 │ │ 18.0 │ │ 28.5 │ │  9.0 │                    │ │
│ │ │Views │ │Likes │ │Recen │ │Engag │                    │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘                    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Duration (mins) *   │ Department      │ Priority            │
│ ┌───────────────────┐│┌───────────────┐│┌─────────────────┐ │
│ │ 15                │││ DEV         ▼ │││ high          ▼ │ │
│ └───────────────────┘│└───────────────┘│└─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Notes                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Great tutorial on MCP connectors                        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                              ┌────────┐ ┌─────────────────┐ │
│                              │ Cancel │ │  Add to Queue   │ │
│                              └────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

**Создано:** 2025-11-28
**Статус:** План готов к реализации

