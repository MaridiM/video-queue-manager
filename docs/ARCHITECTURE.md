# Architecture Documentation

Архитектура приложения Queue Manager.

## 📋 Содержание

1. [Общая архитектура](#общая-архитектура)
2. [Архитектурные паттерны](#архитектурные-паттерны)
3. [Потоки данных](#потоки-данных)
4. [Интеграции](#интеграции)
5. [Безопасность](#безопасность)

---

## Общая архитектура

### Client-Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Components  │  │   Pages      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                                │
│                    ┌───────▼───────┐                       │
│                    │   API Client   │                       │
│                    └───────┬───────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST API
┌────────────────────────────┼────────────────────────────────┐
│                    ┌───────▼───────┐                       │
│                    │  Express API   │                       │
│                    └───────┬───────┘                       │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         │                  │                  │            │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐    │
│  │  Services   │  │    Utils     │  │   Database   │    │
│  │  (Dropbox)  │  │  (Parsers)   │  │   (Prisma)   │    │
│  └─────────────┘  └──────────────┘  └───────┬──────┘    │
│                                              │            │
└──────────────────────────────────────────────┼────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │    PostgreSQL       │
                                    └─────────────────────┘
```

---

## Архитектурные паттерны

### 1. RESTful API

Backend следует принципам REST:

- **GET** - получение данных
- **POST** - создание ресурсов
- **PUT** - обновление ресурсов
- **DELETE** - удаление ресурсов

**Примеры:**
```
GET    /api/video-queue          # Получить все видео
POST   /api/video-queue          # Создать видео
PUT    /api/video-queue/:id      # Обновить видео
DELETE /api/video-queue/:id      # Удалить видео
```

### 2. Service Layer Pattern

Сервисы инкапсулируют бизнес-логику:

```javascript
// services/dropboxService.js
class DropboxService {
  async downloadFile(path) { ... }
  async uploadFile(path, content) { ... }
}
```

### 3. Repository Pattern (через Prisma)

Prisma ORM действует как репозиторий:

```typescript
// Вместо прямых SQL запросов
const videos = await prisma.videoQueue.findMany({
  where: { status: 'pending' }
});
```

### 4. Factory Pattern

Создание сервисов через фабрики:

```javascript
// Singleton factory для DropboxService
export function getDropboxService(settings) {
  if (!dropboxInstance || dropboxInstance.accessToken !== settings.accessToken) {
    dropboxInstance = new DropboxService(settings.accessToken, settings.rootPath);
  }
  return dropboxInstance;
}
```

### 5. Strategy Pattern

Выбор AI провайдера:

```javascript
const provider = requestedProvider || aiSettings.defaultProvider;
if (provider === 'google') {
  // Использовать Google AI
} else {
  // Использовать OpenAI
}
```

---

## Потоки данных

### 1. Добавление видео в очередь

```
User Input (Frontend)
    │
    ▼
VideoForm Component
    │
    ▼
API Client (videoQueueAPI.create)
    │
    ▼
POST /api/video-queue
    │
    ├─► Extract video ID from URL
    ├─► Check for duplicates
    ├─► Calculate priority score
    │
    ▼
Prisma (Create VideoQueue)
    │
    ▼
PostgreSQL Database
    │
    ▼
Response to Frontend
    │
    ▼
Update UI (Refresh table)
```

### 2. AI Transcription Pipeline

```
User clicks "Process with AI"
    │
    ▼
POST /api/transcription/process
    │
    ├─► Step 1: Fetch YouTube Transcript
    │   └─► YouTube Innertube API
    │
    ├─► Step 2: Load Prompt Template
    │   ├─► Try Dropbox first
    │   └─► Fallback to local file
    │
    ├─► Step 3: Process with AI
    │   ├─► Google Gemini OR OpenAI GPT
    │   └─► Retry on rate limit (429)
    │
    ├─► Step 3.5: Parse AI Response
    │   └─► Convert to JSON schema v2.0
    │
    ├─► Step 4: Validate JSON
    │   └─► Ajv schema validation
    │
    └─► Step 5: Save to File
        ├─► Try Dropbox first
        └─► Fallback to local file
```

### 3. CSV Synchronization

```
User clicks "Sync from CSV"
    │
    ▼
POST /api/video-queue/sync-csv
    │
    ├─► Try Dropbox first
    │   └─► DropboxService.downloadFile()
    │
    ├─► Fallback to local file
    │   └─► fs.readFileSync()
    │
    ├─► Parse CSV (handle quoted fields)
    │
    ├─► For each row:
    │   ├─► Check if exists (by queueId)
    │   ├─► Update existing OR Create new
    │   └─► Track imported/updated/skipped
    │
    └─► Return sync results
```

---

## Интеграции

### 1. Dropbox API Integration

**Архитектура:**
- Singleton паттерн для DropboxService
- Fallback на локальные файлы при ошибках
- Прозрачное переключение между Dropbox и локальным хранилищем

**Пути в Dropbox:**
```
/ENTITIES/TASK_MANAGERS/RESEARCHES/
├── 00_SEARCH_QUEUE/
│   └── Search_Queue_Master.csv
├── 01_VIDEO_QUEUE/
│   └── Video_Queue_Master.csv
└── 02_TRANSCRIPTIONS/
    └── Video_XXX.json

/ENTITIES/PROMPTS/
└── PMT-XXX.md
```

### 2. AI Providers Integration

**Архитектура:**
- Абстракция над различными провайдерами
- Единый интерфейс для обработки
- Retry логика для rate limits
- Настройка через Settings API

**Провайдеры:**
- Google AI (Gemini) - основной
- OpenAI (GPT) - альтернативный

### 3. YouTube Integration

**Архитектура:**
- Прямое обращение к Innertube API
- Не требует официального API ключа
- Поддержка различных форматов URL

---

## Безопасность

### 1. API Keys Management

- API ключи хранятся в `settings.json` (не в git)
- Маскирование ключей в ответах API
- Валидация формата токенов

### 2. Input Validation

- Валидация на клиенте (Zod schemas)
- Валидация на сервере (Prisma types)
- Санитизация входных данных

### 3. Error Handling

- Не раскрывать внутренние ошибки в production
- Логирование ошибок на сервере
- Понятные сообщения для пользователя

### 4. CORS

- Настроен CORS для frontend домена
- Разрешен только необходимый origin

---

## Масштабируемость

### Горизонтальное масштабирование

- Stateless API сервер
- Внешняя база данных (PostgreSQL)
- Внешнее хранилище (Dropbox)

### Вертикальное масштабирование

- Connection pooling для PostgreSQL
- Кэширование настроек в памяти
- Оптимизация запросов к БД (индексы)

---

**Последнее обновление:** 2025-12-02

