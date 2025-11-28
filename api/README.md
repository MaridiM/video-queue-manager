# RESEARCHES API Server

Backend API для RESEARCHES Dashboard.

## Настройка

1. Создайте файл `.env` в папке `api/`:

```env
# Path to Dropbox root folder (without trailing slash)
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01

# Server port
PORT=3001
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите сервер:

```bash
npm run dev
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/overview` | Dashboard overview statistics |
| `GET /api/researches` | Master Research List with file existence check |
| `GET /api/search-queue` | Search Queue data |
| `GET /api/video-queue` | Video Queue data |

## Структура данных

Сервер читает CSV файлы из:
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/RESEARCHES_Master_List.csv`
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- `${DROPBOX_ROOT}/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

