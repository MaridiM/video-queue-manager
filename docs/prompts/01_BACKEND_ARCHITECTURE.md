# Промпт: Backend Architecture - Queue Manager API

## Цель

Создать полнофункциональный Backend API сервер на Node.js + Express.js для Queue Manager приложения.

## Технический стек

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.21.0
- **Database:** PostgreSQL 16+ с Prisma ORM 7.0.1
- **Dependencies:**
  - `@prisma/client`, `prisma` - ORM
  - `@prisma/adapter-pg`, `pg` - PostgreSQL драйвер
  - `cors` - CORS middleware
  - `express` - веб-фреймворк
  - `dotenv` - переменные окружения
  - `@google/generative-ai` - Google AI (Gemini)
  - `openai` - OpenAI GPT
  - `dropbox` - Dropbox API
  - `ajv`, `ajv-formats` - JSON валидация
  - `papaparse` - CSV парсинг

## Структура проекта

```
api/
├── server.js                 # Главный файл (Express app)
├── package.json
├── .env                      # Переменные окружения
├── settings.json             # Настройки AI/Dropbox (генерируется)
├── docker-compose.yml        # PostgreSQL контейнер
│
├── prisma/
│   ├── schema.prisma         # Схема базы данных
│   ├── migrations/           # Миграции
│   └── seed.js               # Seed данные
│
├── services/
│   └── dropboxService.js     # Dropbox API сервис
│
└── utils/
    ├── transcriptionParser.js  # Парсинг AI ответов
    └── jsonValidator.js       # Валидация JSON
```

## Основные компоненты

### 1. Express Server Setup

**Требования:**
- Порт: 3001 (из .env или по умолчанию)
- CORS включен для всех origins
- JSON body parser
- Обработка ошибок

**Код структура:**
```javascript
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes here...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Prisma Database Setup

**Схема базы данных (prisma/schema.prisma):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum DepartmentCode { DEV, SMM, VID, AID, DGN, MKT }
enum PriorityLevel { low, medium, high }
enum VideoStatus { pending, selected, transcribing, transcribed, processing, complete, rejected }
enum SearchStatus { Assigned, In_Progress, Completed }
enum EntityType { TOOL, WORKFLOW, ACTION, OBJECT }
enum EntityClassification { NEW, EXISTING, UPDATE }

// Models (см. DATABASE_SCHEMA.md для полной схемы)
model Department { ... }
model SearchQueue { ... }
model VideoQueue { ... }
model Transcription { ... }
model ExtractedEntity { ... }
model Research { ... }
model Employee { ... }
```

**Инициализация Prisma:**
```javascript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### 3. API Endpoints Structure

#### Health Check
- `GET /api/health` - проверка состояния сервера и БД

#### Search Queue
- `GET /api/search-queue` - получить все записи
- `POST /api/search-queue` - создать запись
- `PUT /api/search-queue/:id` - обновить запись
- `DELETE /api/search-queue/:id` - удалить запись
- `POST /api/search-queue/sync-csv` - синхронизация с CSV

#### Video Queue
- `GET /api/video-queue` - получить все видео
- `POST /api/video-queue` - добавить видео
- `PUT /api/video-queue/:id` - обновить видео
- `DELETE /api/video-queue/:id` - удалить видео
- `POST /api/video-queue/sync-csv` - синхронизация с CSV
- `GET /api/video-queue/export` - экспорт (csv/json/md)
- `POST /api/video-queue/batch-update` - массовое обновление
- `GET /api/video-queue/summary` - статистика

#### Transcription
- `POST /api/transcription/youtube` - получить транскрипцию YouTube
- `GET /api/transcription/youtube/:videoId` - GET вариант
- `POST /api/transcription/process` - полный pipeline (YouTube → AI → Save)
- `GET /api/transcription/status` - статус AI провайдеров

#### Prompts
- `GET /api/prompts` - список всех промптов
- `GET /api/prompts/:promptId` - получить промпт по ID

#### Settings
- `GET /api/settings` - получить настройки AI
- `PUT /api/settings` - обновить настройки AI
- `POST /api/settings/test` - тест AI подключения
- `GET /api/settings/dropbox` - получить настройки Dropbox
- `PUT /api/settings/dropbox` - обновить настройки Dropbox
- `POST /api/settings/dropbox/test` - тест Dropbox подключения

#### Departments & Researches
- `GET /api/departments` - список департаментов
- `GET /api/researches` - список исследований
- `GET /api/overview` - общая статистика

### 4. Утилитные функции

#### calculatePriorityScore(views, likes, publishDate)
Расчет приоритетного рейтинга (0-100):
- Views: 30% weight (1M views = 30 pts)
- Likes: 20% weight (50K likes = 20 pts)
- Recency: 30% weight (newer = higher)
- Engagement: 20% weight (likes/views ratio)

#### extractVideoId(url)
Извлечение YouTube video ID из различных форматов URL:
- `youtube.com/watch?v=ID`
- `youtu.be/ID`
- `youtube.com/embed/ID`
- Прямой ID

#### formatTimestamp(ms)
Форматирование миллисекунд в MM:SS или HH:MM:SS

### 5. DropboxService

**Класс DropboxService (services/dropboxService.js):**

```javascript
class DropboxService {
  constructor(accessToken, rootPath)
  getFullPath(relativePath)
  async downloadFile(dropboxPath)
  async uploadFile(dropboxPath, content, mode)
  async fileExists(dropboxPath)
  async getMetadata(dropboxPath)
  async listFolder(dropboxPath)
  async listFolderAll(dropboxPath)
  async createFolder(dropboxPath)
  async delete(dropboxPath)
  async testConnection()
  parseDropboxError(error)
}

// Singleton factory
export function getDropboxService(settings)
```

**Особенности:**
- Валидация токена (должен начинаться с `sl.`)
- Очистка токена от лишних символов
- Fallback на локальные файлы при ошибках
- Детальный парсинг ошибок Dropbox API

### 6. AI Providers Integration

#### Google AI (Gemini)

**Инициализация:**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const googleAI = new GoogleGenerativeAI(apiKey);
const model = googleAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 32000
  }
});
```

**Доступные модели:**
- `gemini-2.0-flash` (default) - новейшая, самая быстрая
- `gemini-1.5-flash-latest` - быстрая и экономичная
- `gemini-1.5-pro-latest` - высокое качество

**Retry логика:**
- Автоматические повторы при ошибке 429
- Экспоненциальная задержка: 1s, 2s, 4s (максимум 10s)
- Максимум 3 попытки

#### OpenAI GPT

**Инициализация:**
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey });

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

**Доступные модели:**
- `gpt-4o-mini` (default) - быстрая и экономичная
- `gpt-4o` - высокое качество
- `gpt-4-turbo` - мощная, большой контекст

### 7. Settings Management

**Файл settings.json структура:**
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

**Функции:**
- `loadSettings()` - загрузка из файла или env
- `saveSettings(settings)` - сохранение в файл
- `reinitializeAIClients()` - переинициализация после изменений

### 8. YouTube Transcription

**Функция fetchYouTubeTranscript(videoId):**

Использует YouTube Innertube API:
1. POST запрос к `https://www.youtube.com/youtubei/v1/player`
2. Получение списка caption tracks
3. Загрузка субтитров в формате JSON3
4. Парсинг сегментов с таймкодами

**Формат ответа:**
```javascript
{
  segments: [
    { startMs: 0, durationMs: 6000, text: "..." }
  ],
  language: "en",
  languageName: "English"
}
```

### 9. AI Transcription Pipeline

**POST /api/transcription/process:**

Шаги:
1. **Fetch YouTube Transcript** - получение субтитров
2. **Load Prompt Template** - загрузка промпта (PMT-004 или PMT-010) из Dropbox или локально
3. **Process with AI** - обработка через Google Gemini или OpenAI GPT
4. **Parse AI Response** - парсинг в JSON схему v2.0
5. **Validate JSON** - валидация через Ajv
6. **Save to File** - сохранение в Dropbox или локально

**Особенности:**
- Retry логика для rate limits
- Обработка различных форматов ответов AI
- Fallback при ошибках парсинга
- Сохранение таймкодов в транскрипции

### 10. CSV Synchronization

**Логика синхронизации:**

1. Попытка загрузки из Dropbox (если включено)
2. Fallback на локальный файл
3. Парсинг CSV с обработкой quoted fields
4. Для каждой строки:
   - Проверка существования (по ID)
   - Update существующей или Create новой
   - Отслеживание imported/updated/skipped
5. Возврат результатов синхронизации

**Пути CSV файлов:**
- Search Queue: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- Video Queue: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

### 11. Error Handling

**Стандартный формат ошибок:**
```json
{
  "success": false,
  "error": "Error message",
  "step": "step_name",
  "provider": "google",
  "errorCode": "ERROR_CODE",
  "details": "..."
}
```

**HTTP Status Codes:**
- 200 - Успех
- 400 - Неверный запрос
- 401 - Ошибка аутентификации
- 404 - Ресурс не найден
- 409 - Конфликт (дубликат)
- 429 - Rate Limit
- 500 - Внутренняя ошибка
- 503 - Сервис недоступен

### 12. Логирование

Использовать префиксы для разных типов операций:
- `📝` - Транскрипции
- `📥` - Загрузка из Dropbox
- `📤` - Выгрузка в Dropbox
- `📁` - Локальные файлы
- `✅` - Успех
- `❌` - Ошибки
- `⚠️` - Предупреждения
- `🚀` - Запуск процессов

## Переменные окружения

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
PORT=3001
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01
OPENAI_API_KEY=optional
GOOGLE_AI_API_KEY=optional
DROPBOX_ACCESS_TOKEN=optional
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "node prisma/seed.js",
    "db:reset": "npx prisma migrate reset --force && npm run db:seed",
    "db:studio": "npx prisma studio"
  }
}
```

## Требования к реализации

1. Все endpoints должны возвращать стандартизированные ответы
2. Обработка ошибок на всех уровнях
3. Валидация входных данных
4. Логирование важных операций
5. Поддержка fallback механизмов
6. Retry логика для внешних API
7. Маскирование API ключей в ответах
8. Автоматическая установка дат при изменении статусов

## Тестирование

После генерации кода проверить:
- Все endpoints возвращают правильные форматы
- Обработка ошибок работает корректно
- CSV синхронизация работает с quoted fields
- AI pipeline обрабатывает различные форматы ответов
- Dropbox fallback работает при ошибках




