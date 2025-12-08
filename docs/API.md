# API Documentation

Детальная документация REST API Queue Manager.

## 📋 Содержание

1. [Базовый URL](#базовый-url)
2. [Аутентификация](#аутентификация)
3. [Формат ответов](#формат-ответов)
4. [Коды ошибок](#коды-ошибок)
5. [Endpoints](#endpoints)

---

## Базовый URL

```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

---

## Аутентификация

В текущей версии API не требует аутентификации. Все endpoints доступны публично.

**Примечание:** Для production рекомендуется добавить аутентификацию (JWT, API keys).

---

## Формат ответов

### Успешный ответ

```json
{
  "success": true,
  "data": { ... }
}
```

### Ответ с ошибкой

```json
{
  "success": false,
  "error": "Error message description",
  "step": "step_name",        // optional
  "provider": "google",       // optional
  "errorCode": "ERROR_CODE",  // optional
  "details": "..."            // optional
}
```

---

## Коды ошибок

| HTTP Code | Описание |
|-----------|----------|
| 200 | Успешный запрос |
| 400 | Неверный запрос (валидация) |
| 401 | Ошибка аутентификации |
| 404 | Ресурс не найден |
| 409 | Конфликт (дубликат) |
| 429 | Rate Limit (слишком много запросов) |
| 500 | Внутренняя ошибка сервера |
| 503 | Сервис недоступен |

---

## Endpoints

### Health Check

#### `GET /api/health`

Проверка состояния сервера и подключения к БД.

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-02T12:00:00.000Z"
}
```

**Response 500 (если БД недоступна):**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Connection error message",
  "timestamp": "2025-12-02T12:00:00.000Z"
}
```

---

### Search Queue

#### `GET /api/search-queue`

Получить все записи очереди поиска.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "search_id": "SEARCH-001",
      "employee": "John Doe",
      "department": "DEV",
      "topic": "AI Development Tools",
      "search_query": "Claude Desktop MCP tutorial",
      "status": "Completed",
      "videos_found": 3,
      "date_assigned": "2025-11-28",
      "date_completed": "2025-11-28",
      "notes": "Focus on MCP integration",
      "perplexity_creativity": 0.5,
      "perplexity_structure_mode": true,
      "results_count": 12,
      "error_message": null,
      "created_at": "2025-11-28T10:00:00.000Z",
      "updated_at": "2025-11-28T14:30:00.000Z"
    }
  ]
}
```

#### `POST /api/search-queue`

Создать новую запись в очереди поиска.

**Request Body:**
```json
{
  "employee": "John Doe",
  "department": "DEV",
  "topic": "AI Development Tools",
  "search_query": "Claude Desktop MCP tutorial",
  "notes": "Focus on MCP integration"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "search_id": "SEARCH-001",
    "employee": "John Doe",
    "department": "DEV",
    "topic": "AI Development Tools",
    "search_query": "Claude Desktop MCP tutorial",
    "status": "Assigned",
    "videos_found": 0,
    "date_assigned": "2025-11-28",
    "notes": "Focus on MCP integration",
    "perplexity_creativity": 0.5,
    "perplexity_structure_mode": true,
    "results_count": 0
  }
}
```

#### `PUT /api/search-queue/:id`

Обновить запись очереди поиска.

**URL Parameters:**
- `id` - Search ID (например: `SEARCH-001`)

**Request Body (все поля опциональны):**
```json
{
  "employee": "Jane Smith",
  "department": "SMM",
  "topic": "Updated Topic",
  "search_query": "Updated query",
  "status": "In Progress",
  "videos_found": 5,
  "notes": "Updated notes",
  "date_completed": "2025-11-29",
  "error_message": null
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* Updated search queue entry */ }
}
```

#### `DELETE /api/search-queue/:id`

Удалить запись очереди поиска.

**Response 200:**
```json
{
  "success": true,
  "data": { /* Deleted entry */ }
}
```

#### `POST /api/search-queue/sync-csv`

Синхронизировать очередь поиска с CSV файлом.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "imported": 5,
    "updated": 3,
    "skipped": 0,
    "total": 8,
    "source": "dropbox",
    "csvPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv",
    "errors": [
      { "searchId": "SEARCH-010", "error": "Invalid department code" }
    ]
  }
}
```

---

### Video Queue

#### `GET /api/video-queue`

Получить все видео в очереди.

**Query Parameters:**
- `status` (optional) - фильтр по статусу

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "queue_id": "VQ-001",
      "video_id": "abc123xyz",
      "video_url": "https://youtube.com/watch?v=abc123xyz",
      "video_title": "Claude Desktop MCP Tutorial",
      "channel_name": "AI Explained",
      "channel_url": "https://youtube.com/@AIExplained",
      "duration_minutes": 15,
      "duration": "15:32",
      "views": 15000,
      "likes": 500,
      "comments": 120,
      "publish_date": "2025-11-01",
      "priority": "high",
      "priority_score": 85.5,
      "status": "selected",
      "department": "DEV",
      "topic_category": "AI Development",
      "research_source": "Perplexity",
      "assigned_to": "alex@example.com",
      "added_by": "maria@example.com",
      "added_date": "2025-11-28",
      "selected_by": "alex@example.com",
      "selected_date": "2025-11-28",
      "parsed_date": null,
      "notes": "Great tutorial on MCP",
      "perplexity_search_id": "SEARCH-001",
      "created_at": "2025-11-28T10:00:00.000Z",
      "updated_at": "2025-11-28T14:30:00.000Z"
    }
  ]
}
```

#### `POST /api/video-queue`

Добавить новое видео в очередь.

**Request Body:**
```json
{
  "video_url": "https://youtube.com/watch?v=xyz789",
  "video_title": "n8n Workflow Tutorial",
  "channel_name": "DevOps Weekly",
  "duration_minutes": 22,
  "views": 5000,
  "likes": 200,
  "comments": 50,
  "publish_date": "2025-11-15",
  "department": "DEV",
  "priority": "high",
  "topic_category": "Automation",
  "research_source": "Perplexity",
  "added_by": "alex@example.com",
  "notes": "Important tutorial",
  "perplexity_search_id": "SEARCH-001"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "queue_id": "VQ-002",
    "video_id": "xyz789",
    "priority_score": 72.5,
    /* ... остальные поля ... */
  }
}
```

**Response 409 (дубликат):**
```json
{
  "success": false,
  "error": "Video already exists in queue",
  "duplicate": true,
  "existing": {
    "queue_id": "VQ-001",
    "video_title": "n8n Workflow Tutorial",
    "status": "pending",
    "added_date": "2025-11-20"
  }
}
```

**Особенности:**
- Автоматическое извлечение `video_id` из URL
- Проверка на дубликаты по `video_id`
- Автоматический расчет `priority_score` (0-100)
- Генерация `queue_id` в формате `VQ-XXX`

#### `PUT /api/video-queue/:id`

Обновить видео в очереди.

**URL Parameters:**
- `id` - Queue ID или UUID (например: `VQ-001`)

**Request Body (все поля опциональны):**
```json
{
  "video_title": "Updated Title",
  "video_url": "https://youtube.com/watch?v=updated",
  "channel_name": "Updated Channel",
  "duration_minutes": 30,
  "priority": "medium",
  "status": "selected",
  "department": "SMM",
  "notes": "Updated notes",
  "selected_by": "alex@example.com"
}
```

**Автоматические действия:**
- При статусе `selected` → устанавливается `selected_date` и `selected_by`
- При статусе `transcribed`/`complete` → устанавливается `parsed_date`

**Response 200:**
```json
{
  "success": true,
  "data": { /* Updated video entry */ }
}
```

#### `DELETE /api/video-queue/:id`

Удалить видео из очереди.

**Response 200:**
```json
{
  "success": true,
  "data": { /* Deleted video entry */ }
}
```

#### `POST /api/video-queue/sync-csv`

Синхронизировать очередь видео с CSV файлом.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "updated": 5,
    "skipped": 2,
    "total": 17,
    "source": "dropbox",
    "csvPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv",
    "errors": [
      { "queueId": "VQ-050", "error": "Invalid status value" }
    ]
  }
}
```

#### `GET /api/video-queue/export`

Экспортировать очередь в различных форматах.

**Query Parameters:**
- `format` - `csv`, `json`, `md` (markdown) - default: `json`
- `status` (optional) - фильтр по статусу

**Response 200:**
- CSV: файл с заголовками `Content-Type: text/csv`
- JSON: JSON массив
- Markdown: форматированный Markdown документ

**Пример Markdown экспорта:**
```markdown
# 📹 Video Queue Export

**Export Date:** 2025-12-02 12:00:00
**Total Videos:** 156

## 📊 Summary

### By Status
- **pending**: 24 (15.4%)
- **selected**: 18 (11.5%)
...

## 📋 Videos Table
...
```

#### `POST /api/video-queue/batch-update`

Массовое обновление статусов видео.

**Request Body:**
```json
{
  "queue_ids": ["VQ-001", "VQ-002", "VQ-003"],
  "status": "selected",
  "selected_by": "alex@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "successful": ["VQ-001", "VQ-002", "VQ-003"],
    "errors": []
  }
}
```

#### `GET /api/video-queue/summary`

Получить статистику очереди.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "total_views": 2500000,
    "total_likes": 85000,
    "average_priority_score": "65.5",
    "by_status": [
      { "status": "pending", "count": 24, "percentage": "15.4" },
      { "status": "selected", "count": 18, "percentage": "11.5" },
      { "status": "complete", "count": 106, "percentage": "67.9" }
    ],
    "top_topics": [
      { "topic": "AI Development", "count": 45 },
      { "topic": "Video Editing", "count": 38 },
      { "topic": "Social Media", "count": 22 }
    ],
    "by_source": [
      { "source": "Perplexity", "count": 120 },
      { "source": "Manual", "count": 36 }
    ],
    "by_department": [
      { "department": "DEV", "count": 45 },
      { "department": "SMM", "count": 38 },
      { "department": "VID", "count": 22 }
    ]
  }
}
```

---

### Transcription API

#### `POST /api/transcription/youtube`

Получить транскрипцию YouTube видео.

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=abc123xyz",
  "videoId": "abc123xyz"  // optional
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "videoId": "abc123xyz",
    "videoUrl": "https://www.youtube.com/watch?v=abc123xyz",
    "language": "en",
    "languageName": "English",
    "totalSegments": 245,
    "totalDuration": "15:32",
    "totalDurationMs": 932000,
    "transcript": [
      {
        "timestamp": "00:00",
        "offsetMs": 0,
        "duration": 6000,
        "text": "Hey everyone, welcome to this tutorial..."
      },
      {
        "timestamp": "00:06",
        "offsetMs": 6000,
        "duration": 5000,
        "text": "Today we're going to learn about..."
      }
    ],
    "plainText": "[00:00] Hey everyone...\n[00:06] Today we're going...",
    "rawText": "Hey everyone welcome to this tutorial Today we're going to learn about...",
    "fetchedAt": "2025-12-02T12:00:00.000Z"
  }
}
```

**Response 404 (нет субтитров):**
```json
{
  "success": false,
  "error": "Субтитры недоступны для этого видео. Возможно, автор отключил субтитры или видео приватное."
}
```

#### `GET /api/transcription/youtube/:videoId`

Получить транскрипцию по video ID (GET вариант).

**URL Parameters:**
- `videoId` - YouTube video ID (11 символов)

**Response:** Аналогично `POST /api/transcription/youtube`

#### `POST /api/transcription/process`

Полный pipeline: YouTube → AI Processing → Save.

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=abc123xyz",
  "videoTitle": "Claude Desktop MCP Tutorial",
  "saveToFile": true,
  "provider": "google",
  "promptId": "PMT-004"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "videoId": "abc123xyz",
    "videoTitle": "Claude Desktop MCP Tutorial",
    "videoUrl": "https://www.youtube.com/watch?v=abc123xyz",
    "language": "en",
    "totalSegments": 245,
    "rawTranscriptLength": 12500,
    "processedLength": 18500,
    "savedFilePath": "/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_026.json",
    "aiProvider": "google",
    "aiModel": "gemini-2.0-flash",
    "format": "json",
    "timing": {
      "transcriptFetch": 1250,
      "aiProcessing": 15200,
      "jsonParsing": 350,
      "total": 16800
    },
    "transcription": {
      "video_id": "Video_026",
      "video_title": "Claude Desktop MCP Tutorial",
      "metadata": { ... },
      "transcription": [ ... ],
      "taxonomy_analysis": { ... }
    }
  }
}
```

**Response 429 (Rate Limit):**
```json
{
  "success": false,
  "error": "Rate limit exceeded for Google AI. Please wait a few minutes and try again.",
  "step": "ai_processing",
  "provider": "google",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60,
  "details": "The AI service is temporarily unavailable due to too many requests.",
  "retriesAttempted": 3
}
```

**Response 503 (AI не настроен):**
```json
{
  "success": false,
  "error": "No AI provider configured. Please add API key in Settings.",
  "providers": {
    "google": { "configured": false, "enabled": false },
    "openai": { "configured": false, "enabled": false }
  }
}
```

#### `GET /api/transcription/status`

Проверить статус AI провайдеров.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "youtubeTranscript": true,
    "aiProcessing": true,
    "openAIConfigured": true,
    "googleAIConfigured": true,
    "defaultProvider": "google",
    "googleModel": "gemini-2.0-flash",
    "openaiModel": "gpt-4o-mini"
  }
}
```

---

### Prompts API

#### `GET /api/prompts`

Получить список всех доступных промптов.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "promptId": "PMT-004",
      "fileName": "PMT-004_Video_Transcription_v4.1.md",
      "path": "/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md",
      "source": "dropbox"
    },
    {
      "promptId": "PMT-010",
      "fileName": "PMT-010_Complete_Workflow_Full.md",
      "path": "/ENTITIES/PROMPTS/PMT-010_Complete_Workflow_Full.md",
      "source": "local"
    }
  ],
  "source": "dropbox"
}
```

#### `GET /api/prompts/:promptId`

Получить содержимое конкретного промпта.

**URL Parameters:**
- `promptId` - ID промпта (например: `PMT-004`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "promptId": "PMT-004",
    "fileName": "PMT-004_Video_Transcription_v4.1.md",
    "content": "# Video Transcription Prompt v4.1\n\n...",
    "source": "dropbox",
    "filePath": "/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md",
    "lastModified": "2025-12-01T10:00:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Prompt \"PMT-999\" not found. Available prompts: PMT-004, PMT-005, ..."
}
```

---

### Settings API

#### `GET /api/settings`

Получить настройки AI провайдеров.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "openai": {
      "configured": true,
      "enabled": true,
      "model": "gpt-4o-mini",
      "availableModels": [
        { "id": "gpt-4o-mini", "name": "GPT-4o Mini", "description": "Быстрая и экономичная" },
        { "id": "gpt-4o", "name": "GPT-4o", "description": "Высокое качество" },
        { "id": "gpt-4-turbo", "name": "GPT-4 Turbo", "description": "Мощная, большой контекст" }
      ],
      "apiKeyPreview": "sk-...xyz"
    },
    "google": {
      "configured": true,
      "enabled": true,
      "model": "gemini-2.0-flash",
      "availableModels": [
        { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Новейшая, самая быстрая" },
        { "id": "gemini-1.5-flash-latest", "name": "Gemini 1.5 Flash", "description": "Быстрая и экономичная" },
        { "id": "gemini-1.5-pro-latest", "name": "Gemini 1.5 Pro", "description": "Высокое качество, дороже" }
      ],
      "apiKeyPreview": "AIza..."
    },
    "defaultProvider": "google"
  }
}
```

#### `PUT /api/settings`

Обновить настройки AI провайдеров.

**Request Body:**
```json
{
  "openai": {
    "apiKey": "sk-...",
    "enabled": true,
    "model": "gpt-4o-mini"
  },
  "google": {
    "apiKey": "AIza...",
    "enabled": true,
    "model": "gemini-2.0-flash"
  },
  "defaultProvider": "google"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* Updated settings */ }
}
```

#### `POST /api/settings/test`

Протестировать подключение к AI провайдеру.

**Request Body:**
```json
{
  "provider": "google",
  "apiKey": "AIza..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "provider": "google",
    "model": "gemini-2.0-flash",
    "response": "Test response from AI..."
  }
}
```

#### `GET /api/settings/dropbox`

Получить настройки Dropbox.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "sl.xxx...",
    "enabled": true,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": true
  }
}
```

#### `PUT /api/settings/dropbox`

Обновить настройки Dropbox.

**Request Body:**
```json
{
  "accessToken": "sl.xxx...",
  "enabled": true,
  "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES"
}
```

#### `POST /api/settings/dropbox/test`

Протестировать подключение к Dropbox.

**Request Body:**
```json
{
  "accessToken": "sl.xxx..."  // optional, uses saved token if empty
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Connection successful",
    "accountInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### Departments & Researches

#### `GET /api/departments`

Получить список всех департаментов.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "code": "DEV",
      "name": "Development",
      "description": "Software development department",
      "created_at": "2025-11-28T10:00:00.000Z"
    },
    {
      "code": "SMM",
      "name": "Social Media Marketing",
      "description": "Social media and marketing",
      "created_at": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

#### `GET /api/researches`

Получить список всех исследований.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "research_id": "RES-001",
      "title": "AI Tools Research",
      "description": "Research on AI development tools",
      "department": "DEV",
      "category": "AI",
      "file_path": "/path/to/file.md",
      "status": "active",
      "total_searches": 5,
      "total_videos": 12,
      "total_entities": 8,
      "created_at": "2025-11-28T10:00:00.000Z",
      "updated_at": "2025-11-28T14:30:00.000Z"
    }
  ]
}
```

#### `GET /api/overview`

Получить общую статистику для Dashboard.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalSearches": 45,
    "completedSearches": 32,
    "totalVideos": 156,
    "completedVideos": 118,
    "pendingSearchTasks": 13,
    "videosPendingProcessing": 38,
    "departmentDistribution": [
      { "name": "DEV", "value": 45 },
      { "name": "SMM", "value": 38 },
      { "name": "VID", "value": 22 },
      { "name": "AID", "value": 51 },
      { "name": "DGN", "value": 14 },
      { "name": "MKT", "value": 18 }
    ],
    "videoStatusDistribution": [
      { "name": "pending", "value": 24 },
      { "name": "selected", "value": 18 },
      { "name": "transcribing", "value": 8 },
      { "name": "transcribed", "value": 32 },
      { "name": "processing", "value": 12 },
      { "name": "complete", "value": 118 },
      { "name": "rejected", "value": 6 }
    ]
  }
}
```

---

## Rate Limiting

### Google AI Rate Limits

При ошибке 429 (Rate Limit):
- Автоматические повторы с экспоненциальной задержкой
- Максимум 3 попытки
- Задержки: 1s, 2s, 4s (максимум 10s)

### Рекомендации

- Не отправлять более 60 запросов в минуту
- Использовать batch операции где возможно
- Кэшировать результаты транскрипций

---

## Примеры использования

### JavaScript/TypeScript

```typescript
// Получить все видео
const response = await fetch('http://localhost:3001/api/video-queue');
const data = await response.json();

// Создать новое видео
const newVideo = await fetch('http://localhost:3001/api/video-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_url: 'https://youtube.com/watch?v=abc123',
    video_title: 'Tutorial',
    department: 'DEV',
    priority: 'high'
  })
});

// Обработать транскрипцию через AI
const transcription = await fetch('http://localhost:3001/api/transcription/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://youtube.com/watch?v=abc123',
    videoTitle: 'Tutorial',
    provider: 'google',
    promptId: 'PMT-004',
    saveToFile: true
  })
});
```

### cURL

```bash
# Получить все видео
curl http://localhost:3001/api/video-queue

# Создать новое видео
curl -X POST http://localhost:3001/api/video-queue \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://youtube.com/watch?v=abc123",
    "video_title": "Tutorial",
    "department": "DEV",
    "priority": "high"
  }'

# Синхронизировать с CSV
curl -X POST http://localhost:3001/api/video-queue/sync-csv
```

---

**Последнее обновление:** 2025-12-02

