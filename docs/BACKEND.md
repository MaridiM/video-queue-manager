# Backend Documentation

Полная документация по backend приложению Queue Manager.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Структура проекта](#структура-проекта)
3. [Технологии](#технологии)
4. [API Endpoints](#api-endpoints)
5. [Сервисы](#сервисы)
6. [Утилиты](#утилиты)
7. [База данных](#база-данных)
8. [Конфигурация](#конфигурация)
9. [Интеграции](#интеграции)

---

## Обзор

Backend приложение построено на **Node.js** с использованием **Express.js** фреймворка. Приложение предоставляет RESTful API для управления очередями видео и поисковых запросов, обработки транскрипций через AI и синхронизации данных с Dropbox.

### Основные возможности

- 📹 Управление Video Queue (CRUD операции)
- 🔍 Управление Search Queue (CRUD операции)
- 🤖 AI обработка транскрипций (Google AI, OpenAI)
- 📁 Интеграция с Dropbox API
- 🗄️ Работа с PostgreSQL через Prisma ORM
- 📊 Статистика и аналитика
- 🔄 Синхронизация с CSV файлами

---

## Структура проекта

```
api/
├── server.js                 # Главный файл сервера (Express app)
├── package.json             # Зависимости и скрипты
├── .env                     # Переменные окружения
├── settings.json            # Настройки AI и Dropbox (генерируется)
├── docker-compose.yml       # PostgreSQL контейнер
│
├── prisma/
│   ├── schema.prisma        # Схема базы данных
│   ├── migrations/          # Миграции БД
│   └── seed.js              # Seed данные
│
├── services/
│   └── dropboxService.js    # Dropbox API сервис
│
└── utils/
    ├── transcriptionParser.js  # Парсинг AI ответов в JSON
    └── jsonValidator.js        # Валидация JSON транскрипций
```

---

## Технологии

### Основные зависимости

```json
{
  "express": "^4.21.0",           // Web framework
  "@prisma/client": "^7.0.1",      // Prisma ORM client
  "prisma": "^7.0.1",              // Prisma CLI
  "pg": "^8.16.3",                 // PostgreSQL driver
  "@prisma/adapter-pg": "^7.0.1",  // Prisma PostgreSQL adapter
  "cors": "^2.8.5",                // CORS middleware
  "dotenv": "^17.2.3"              // Environment variables
}
```

### AI и внешние сервисы

```json
{
  "@google/generative-ai": "^0.24.1",  // Google AI (Gemini)
  "openai": "^6.9.1",                  // OpenAI GPT
  "dropbox": "^10.34.0"                // Dropbox API
}
```

### Утилиты

```json
{
  "ajv": "^8.12.0",              // JSON Schema validator
  "ajv-formats": "^2.1.1",       // JSON Schema formats
  "papaparse": "^5.4.1"          // CSV parsing
}
```

---

## API Endpoints

### Health Check

#### `GET /api/health`

Проверка состояния сервера и подключения к БД.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-02T12:00:00.000Z"
}
```

---

### Search Queue

#### `GET /api/search-queue`

Получить все записи очереди поиска.

**Response:**
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
      "results_count": 12
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

#### `PUT /api/search-queue/:id`

Обновить запись очереди поиска.

#### `DELETE /api/search-queue/:id`

Удалить запись очереди поиска.

#### `POST /api/search-queue/sync-csv`

Синхронизировать очередь поиска с CSV файлом из Dropbox или локального хранилища.

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 5,
    "updated": 3,
    "skipped": 0,
    "total": 8,
    "source": "dropbox",
    "csvPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv"
  }
}
```

---

### Video Queue

#### `GET /api/video-queue`

Получить все видео в очереди.

**Query Parameters:**
- `status` (optional) - фильтр по статусу

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "queue_id": "VQ-001",
      "video_id": "abc123xyz",
      "video_url": "https://youtube.com/watch?v=abc123xyz",
      "video_title": "Claude Desktop MCP Tutorial",
      "channel_name": "AI Explained",
      "duration_minutes": 15,
      "views": 15000,
      "likes": 500,
      "priority": "high",
      "priority_score": 85.5,
      "status": "selected",
      "department": "DEV",
      "added_by": "maria@example.com",
      "added_date": "2025-11-28"
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
  "department": "DEV",
  "priority": "high",
  "added_by": "alex@example.com",
  "notes": "Important tutorial"
}
```

**Особенности:**
- Автоматическое извлечение `video_id` из URL
- Проверка на дубликаты по `video_id`
- Автоматический расчет `priority_score` (0-100)
- Генерация `queue_id` в формате `VQ-XXX`

#### `PUT /api/video-queue/:id`

Обновить видео в очереди.

**Особенности:**
- Автоматическая установка дат при изменении статуса:
  - `selected` → устанавливает `selected_date` и `selected_by`
  - `transcribed` / `complete` → устанавливает `parsed_date`

#### `DELETE /api/video-queue/:id`

Удалить видео из очереди.

#### `POST /api/video-queue/sync-csv`

Синхронизировать очередь видео с CSV файлом.

#### `GET /api/video-queue/export`

Экспортировать очередь в различных форматах.

**Query Parameters:**
- `format` - `csv`, `json`, `md` (markdown)
- `status` (optional) - фильтр по статусу

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

#### `GET /api/video-queue/summary`

Получить статистику очереди.

**Response:**
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
      { "status": "selected", "count": 18, "percentage": "11.5" }
    ],
    "top_topics": [
      { "topic": "AI Development", "count": 45 },
      { "topic": "Video Editing", "count": 38 }
    ],
    "by_source": [
      { "source": "Perplexity", "count": 120 },
      { "source": "Manual", "count": 36 }
    ],
    "by_department": [
      { "department": "DEV", "count": 45 },
      { "department": "SMM", "count": 38 }
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

**Response:**
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
      }
    ],
    "plainText": "[00:00] Hey everyone...",
    "rawText": "Hey everyone welcome to this tutorial...",
    "fetchedAt": "2025-12-02T12:00:00.000Z"
  }
}
```

#### `GET /api/transcription/youtube/:videoId`

Получить транскрипцию по video ID (GET вариант).

#### `POST /api/transcription/process`

Полный pipeline: YouTube → AI Processing → Save.

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=abc123xyz",
  "videoTitle": "Claude Desktop MCP Tutorial",
  "saveToFile": true,
  "provider": "google",  // "google" or "openai"
  "promptId": "PMT-004"  // "PMT-004" or "PMT-010"
}
```

**Response:**
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
    "transcription": { /* JSON schema v2.0 */ }
  }
}
```

**Pipeline Steps:**
1. Fetch YouTube transcript (Innertube API)
2. Load prompt template (PMT-004 or PMT-010) from Dropbox or local
3. Process with AI (Google Gemini or OpenAI GPT)
4. Parse AI response to JSON schema v2.0
5. Validate JSON
6. Save to file (Dropbox or local)

#### `GET /api/transcription/status`

Проверить статус AI провайдеров.

**Response:**
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

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "promptId": "PMT-004",
      "fileName": "PMT-004_Video_Transcription_v4.1.md",
      "path": "/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md",
      "source": "dropbox"
    }
  ],
  "source": "dropbox"
}
```

#### `GET /api/prompts/:promptId`

Получить содержимое конкретного промпта.

**Response:**
```json
{
  "success": true,
  "data": {
    "promptId": "PMT-004",
    "fileName": "PMT-004_Video_Transcription_v4.1.md",
    "content": "# Video Transcription Prompt...",
    "source": "dropbox",
    "filePath": "/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md",
    "lastModified": "2025-12-01T10:00:00.000Z"
  }
}
```

**Доступные промпты:**
- `PMT-004` - Video Transcription v4.1
- `PMT-005` - Video Naming Alternatives
- `PMT-006` - Video Analysis
- `PMT-007` - Objects Library Extraction
- `PMT-008` - Video Analysis Improvements
- `PMT-009` - Taxonomy Integration
- `PMT-010` - Complete Workflow Full
- `PMT-011` - Complete Workflow Short
- `PMT-012` - Transcript Processing Workflow
- `PMT-013` - Script Generation from Video

---

### Settings API

#### `GET /api/settings`

Получить настройки AI провайдеров.

**Response:**
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
        { "id": "gpt-4o", "name": "GPT-4o", "description": "Высокое качество" }
      ],
      "apiKeyPreview": "sk-...xyz"
    },
    "google": {
      "configured": true,
      "enabled": true,
      "model": "gemini-2.0-flash",
      "availableModels": [
        { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Новейшая, самая быстрая" }
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

#### `POST /api/settings/test`

Протестировать подключение к AI провайдеру.

**Request Body:**
```json
{
  "provider": "google",
  "apiKey": "AIza..."
}
```

#### `GET /api/settings/dropbox`

Получить настройки Dropbox.

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

---

### Departments & Researches

#### `GET /api/departments`

Получить список всех департаментов.

#### `GET /api/researches`

Получить список всех исследований.

#### `GET /api/overview`

Получить общую статистику для Dashboard.

**Response:**
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
      { "name": "SMM", "value": 38 }
    ],
    "videoStatusDistribution": [
      { "name": "pending", "value": 24 },
      { "name": "selected", "value": 18 }
    ]
  }
}
```

---

## Сервисы

### DropboxService

Модуль для работы с Dropbox API (`services/dropboxService.js`).

**Методы:**

- `downloadFile(dropboxPath)` - загрузить файл из Dropbox
- `uploadFile(dropboxPath, content, mode)` - загрузить файл в Dropbox
- `listFolder(dropboxPath)` - список файлов в папке
- `listFolderAll(dropboxPath)` - список всех файлов (с пагинацией)
- `fileExists(dropboxPath)` - проверить существование файла
- `getMetadata(dropboxPath)` - получить метаданные файла
- `createFolder(dropboxPath)` - создать папку
- `delete(dropboxPath)` - удалить файл/папку
- `testConnection()` - протестировать подключение

**Использование:**

```javascript
import { getDropboxService } from './services/dropboxService.js';

const dropboxService = getDropboxService(aiSettings.dropbox);
if (dropboxService) {
  const content = await dropboxService.downloadFile('/path/to/file.csv');
}
```

**Fallback механизм:**
- Если Dropbox недоступен или отключен, используется локальная файловая система
- В ответах API указывается `source: 'dropbox' | 'local'`

---

## Утилиты

### transcriptionParser.js

Парсинг ответов AI в JSON схему v2.0.

**Функции:**

- `parseAIResponseToJSON(aiResponse, videoId, videoTitle, videoUrl, languageName, segments)` - парсинг AI ответа в JSON

**Особенности:**
- Поддержка различных форматов ответов AI
- Нормализация структуры под схему v2.0
- Fallback при ошибках парсинга
- Сохранение таймкодов в транскрипции

### jsonValidator.js

Валидация JSON транскрипций по схеме v2.0.

**Функции:**

- `validateTranscriptionJSON(jsonData)` - валидация JSON по схеме
- `checkRequiredFields(jsonData)` - проверка обязательных полей

**Схема:**
- Использует `dev/transcriptions/transcription_schema_v2.json`
- Валидация через Ajv

---

## База данных

### Prisma Schema

Схема базы данных определена в `prisma/schema.prisma`.

**Основные модели:**

- `Department` - департаменты
- `Employee` - сотрудники
- `SearchQueue` - очередь поисковых запросов
- `VideoQueue` - очередь видео
- `Transcription` - транскрипции видео
- `ExtractedEntity` - извлеченные сущности
- `Research` - мастер-лист исследований

Подробнее см. [DATABASE.md](./DATABASE.md)

### Миграции

```bash
# Применить миграции
npm run db:migrate

# Сбросить БД и применить миграции
npm run db:reset

# Открыть Prisma Studio
npm run db:studio
```

---

## Конфигурация

### Переменные окружения (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0

# Server
PORT=3001

# Dropbox Root (local fallback)
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01

# AI Providers (optional, can be set in Settings UI)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
DROPBOX_ACCESS_TOKEN=your_dropbox_token_here
```

### settings.json

Файл генерируется автоматически при сохранении настроек через UI.

**Структура:**

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
  "defaultProvider": "google",
  "dropbox": {
    "accessToken": "sl.xxx...",
    "enabled": true,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": true
  }
}
```

---

## Интеграции

### Google AI (Gemini)

**Модели:**
- `gemini-2.0-flash` (default) - новейшая, самая быстрая
- `gemini-1.5-flash-latest` - быстрая и экономичная
- `gemini-1.5-pro-latest` - высокое качество, дороже

**Использование:**
```javascript
const model = googleAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 32000
  }
});
```

**Retry логика:**
- Автоматические повторы при ошибке 429 (Rate Limit)
- Экспоненциальная задержка: 1s, 2s, 4s
- Максимум 3 попытки

### OpenAI GPT

**Модели:**
- `gpt-4o-mini` (default) - быстрая и экономичная
- `gpt-4o` - высокое качество
- `gpt-4-turbo` - мощная, большой контекст

**Использование:**
```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: 32000,
  temperature: 0.3
});
```

### Dropbox API

**Требования:**
- Access Token (начинается с `sl.`)
- Разрешения: `files.content.read`, `files.content.write`, `files.metadata.read`

**Пути в Dropbox:**
- Search Queue CSV: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- Video Queue CSV: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
- Transcriptions: `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`
- Prompts: `/ENTITIES/PROMPTS/PMT-XXX.md`

### YouTube Innertube API

Используется для получения субтитров YouTube видео без официального API.

**Особенности:**
- Прямое обращение к Innertube API
- Поддержка различных форматов URL
- Автоматическое определение языка
- Форматирование таймкодов

---

## Обработка ошибок

### Стандартный формат ошибок

```json
{
  "success": false,
  "error": "Error message description",
  "step": "step_name",  // optional
  "provider": "google",  // optional
  "errorCode": "ERROR_CODE",  // optional
  "details": "Additional details"  // optional
}
```

### HTTP Status Codes

- `200` - Успешный запрос
- `400` - Неверный запрос
- `401` - Ошибка аутентификации
- `404` - Ресурс не найден
- `409` - Конфликт (например, дубликат видео)
- `429` - Rate Limit (слишком много запросов)
- `500` - Внутренняя ошибка сервера
- `503` - Сервис недоступен

---

## Логирование

Сервер использует `console.log` для логирования:

- `📝` - Операции с транскрипциями
- `📥` - Загрузка из Dropbox
- `📤` - Выгрузка в Dropbox
- `📁` - Локальные файловые операции
- `✅` - Успешные операции
- `❌` - Ошибки
- `⚠️` - Предупреждения
- `🚀` - Запуск процессов

---

## Производительность

### Оптимизации

- Использование Prisma connection pooling
- Batch операции для массовых обновлений
- Кэширование настроек в памяти
- Retry логика для внешних API
- Fallback на локальные файлы при ошибках Dropbox

### Рекомендации

- Использовать индексы в БД для часто запрашиваемых полей
- Настроить connection pool для PostgreSQL
- Мониторить использование AI API (rate limits)
- Регулярно синхронизировать с CSV файлами

---

**Последнее обновление:** 2025-12-02

