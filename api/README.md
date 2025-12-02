# RESEARCHES API Server

Backend API для RESEARCHES Dashboard с PostgreSQL базой данных.

## 🚀 Быстрый старт

См. [QUICK_START.md](./QUICK_START.md) для быстрого запуска за 3 шага.

## 📋 Настройка

### 1. Запуск PostgreSQL

```bash
cd apps/api
docker-compose up -d
```

### 2. Создайте файл `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0

# Server Configuration
PORT=3001

# Path to Dropbox root folder (without trailing slash)
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01

# AI Provider API Keys (Optional)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 3. Установите зависимости и примените миграции:

```bash
npm install
npm run db:migrate
npm run db:seed  # Опционально: заполнить тестовыми данными
```

### 4. Запустите сервер:

```bash
npm run dev
```

## 📊 База данных

**PostgreSQL 16** через Docker Compose

**Строка подключения:** `postgresql://postgres:postgres@localhost:5434/phase0`

**ORM:** Prisma

Подробная документация: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Управление БД:

```bash
# Применить миграции
npm run db:migrate

# Открыть Prisma Studio (GUI)
npm run db:studio

# Сброс БД (удаляет все данные!)
npm run db:reset

# Заполнить тестовыми данными
npm run db:seed
```

## 🔌 API Endpoints

### Health & Overview
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/overview` | GET | Dashboard overview statistics |

### Search Queue
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search-queue` | GET | Получить все записи очереди поиска |
| `/api/search-queue` | POST | Создать новую запись |
| `/api/search-queue/:id` | PUT | Обновить запись |
| `/api/search-queue/:id` | DELETE | Удалить запись |
| `/api/search-queue/sync-csv` | POST | Синхронизировать с CSV файлом |

### Video Queue
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/video-queue` | GET | Получить все видео в очереди |
| `/api/video-queue` | POST | Добавить видео в очередь |
| `/api/video-queue/:id` | PUT | Обновить видео |
| `/api/video-queue/:id` | DELETE | Удалить видео |
| `/api/video-queue/sync-csv` | POST | Синхронизировать с CSV файлом |
| `/api/video-queue/export` | GET | Экспортировать очередь |
| `/api/video-queue/summary` | GET | Статистика очереди |
| `/api/video-queue/batch-update` | POST | Массовое обновление |

### Transcriptions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transcription/youtube` | POST | Транскрибировать YouTube видео |
| `/api/transcription/youtube/:videoId` | GET | Получить статус транскрипции |
| `/api/transcription/process` | POST | Обработать транскрипцию |
| `/api/transcription/status` | GET | Статус обработки транскрипций |

### Researches & Departments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/researches` | GET | Master Research List |
| `/api/departments` | GET | Список департаментов |

### Prompts
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prompts` | GET | Список всех промптов |
| `/api/prompts/:promptId` | GET | Получить конкретный промпт |

### Settings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings` | GET | Получить настройки AI |
| `/api/settings` | PUT | Обновить настройки AI |
| `/api/settings/test` | POST | Протестировать настройки AI |

## 📁 Структура данных

### База данных (PostgreSQL)

Все данные хранятся в PostgreSQL через Prisma ORM:

- `departments` - Департаменты
- `employees` - Сотрудники
- `search_queue` - Очередь поиска видео
- `video_queue` - Очередь видео для обработки
- `transcriptions` - Транскрипции видео
- `extracted_entities` - Извлеченные сущности (инструменты, workflows)
- `researches` - Мастер-лист исследований

### CSV файлы (для синхронизации)

Сервер также может синхронизироваться с CSV файлами:
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/RESEARCHES_Master_List.csv`
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

