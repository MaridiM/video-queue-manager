# API Documentation

Backend API для Queue Manager приложения.

**Base URL:** `http://localhost:3001/api`

---

## 📋 Содержание

- [Health Check](#health-check)
- [Researches](#researches)
- [Search Queue](#search-queue)
- [Video Queue](#video-queue)
- [Overview Statistics](#overview-statistics)

---

## Health Check

### GET `/api/health`

Проверка состояния сервера.

**Response:**
```json
{
  "status": "ok",
  "dropboxRoot": "G:/Job/REMS/apps/3/work/01",
  "timestamp": "2025-11-28T12:00:00.000Z"
}
```

---

## Researches

### GET `/api/researches`

Получить список всех исследований.

**Source:** `RESEARCHES/RESEARCHES_Master_List.csv`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Research_ID": "RES-001",
      "Title": "AI Tools Research",
      "Department": "DEV",
      "Status": "Active",
      "File_Path": "path/to/file.md",
      "fileExists": true
    }
  ]
}
```

**Fields:**
| Поле | Тип | Описание |
|------|-----|----------|
| Research_ID | string | Уникальный ID исследования |
| Title | string | Название |
| Department | string | Отдел (DEV, SMM, VID, AID, DGN, MKT) |
| Status | string | Статус (Active, Completed, Archived) |
| File_Path | string | Путь к файлу |
| fileExists | boolean | Существует ли файл (добавляется API) |

---

## Search Queue

### GET `/api/search-queue`

Получить очередь поисковых запросов.

**Source:** `RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Search_ID": "SQ-001",
      "Search_Query": "Claude Desktop MCP tutorial",
      "Department": "DEV",
      "Status": "completed",
      "Results_Count": 12,
      "Videos_Added": 3,
      "Assigned_To": "alex@remotehelpers.com",
      "Created_At": "2025-11-28"
    }
  ]
}
```

**Fields:**
| Поле | Тип | Описание |
|------|-----|----------|
| Search_ID | string | Уникальный ID запроса |
| Search_Query | string | Текст поискового запроса |
| Department | string | Отдел |
| Status | string | pending / searching / completed / failed |
| Results_Count | number | Количество найденных результатов |
| Videos_Added | number | Добавлено видео в очередь |
| Assigned_To | string | Email ответственного |
| Created_At | string | Дата создания |

---

## Video Queue

### GET `/api/video-queue`

Получить очередь видео.

**Source:** `RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Queue_ID": "VQ-001",
      "Video_Title": "Claude Desktop MCP Setup Tutorial",
      "Video_URL": "https://youtube.com/watch?v=abc123",
      "Channel_Name": "AI Explained",
      "Duration_Minutes": 15,
      "Duration": "15m",
      "Topic_Category": "DEV",
      "Priority_Score": 85,
      "Status": "Selected",
      "Added_By": "maria@remotehelpers.com",
      "Added_Date": "2025-11-28",
      "Notes": "Great tutorial",
      "Views": 15000,
      "Likes": 500,
      "Publish_Date": "2025-11-01"
    }
  ]
}
```

---

### POST `/api/video-queue`

Добавить новое видео в очередь.

**Request Body:**
```json
{
  "video_url": "https://youtube.com/watch?v=xyz789",
  "video_title": "n8n Workflow Tutorial",
  "channel_name": "DevOps Weekly",
  "duration_minutes": 22,
  "department": "DEV",
  "priority": "high",
  "status": "Pending",
  "added_by": "alex@remotehelpers.com",
  "notes": "Important tutorial"
}
```

**Request Fields:**
| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| video_url | string | ✅ | URL видео |
| video_title | string | ✅ | Название видео |
| channel_name | string | ❌ | Название канала |
| duration_minutes | number | ❌ | Длительность в минутах |
| department | string | ❌ | Отдел (default: DEV) |
| priority | string | ❌ | low / medium / high |
| status | string | ❌ | Статус (default: Pending) |
| added_by | string | ❌ | Email добавившего |
| notes | string | ❌ | Заметки |

**Priority Mapping:**
| priority | Priority_Score |
|----------|----------------|
| high | 85 |
| medium | 50 |
| low | 25 |

**Response:**
```json
{
  "success": true,
  "data": {
    "Queue_ID": "VQ-007",
    "Video_Title": "n8n Workflow Tutorial",
    "Video_URL": "https://youtube.com/watch?v=xyz789",
    "Channel_Name": "DevOps Weekly",
    "Duration_Minutes": 22,
    "Topic_Category": "DEV",
    "Priority_Score": 85,
    "Status": "Pending",
    "Added_By": "alex@remotehelpers.com",
    "Added_Date": "2025-11-28",
    "Notes": "Important tutorial",
    "Views": 0,
    "Likes": 0,
    "Publish_Date": "",
    "Duration": "22m"
  }
}
```

---

### PUT `/api/video-queue/:id`

Обновить видео в очереди.

**URL Parameters:**
| Параметр | Описание |
|----------|----------|
| id | Queue_ID видео (например: VQ-001) |

**Request Body:**
```json
{
  "video_title": "Updated Title",
  "video_url": "https://youtube.com/watch?v=updated",
  "channel_name": "Updated Channel",
  "duration_minutes": 30,
  "department": "SMM",
  "priority": "medium",
  "status": "Selected",
  "notes": "Updated notes"
}
```

> ⚠️ Все поля опциональны. Передавайте только те, которые нужно обновить.

**Response:**
```json
{
  "success": true,
  "data": {
    "Queue_ID": "VQ-001",
    "Video_Title": "Updated Title",
    // ... остальные поля
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Video not found"
}
```

---

### DELETE `/api/video-queue/:id`

Удалить видео из очереди.

**URL Parameters:**
| Параметр | Описание |
|----------|----------|
| id | Queue_ID видео (например: VQ-001) |

**Response:**
```json
{
  "success": true,
  "data": {
    "Queue_ID": "VQ-001",
    "Video_Title": "Deleted Video",
    // ... удалённые данные
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Video not found"
}
```

---

## Overview Statistics

### GET `/api/overview`

Получить агрегированную статистику по всем данным.

**Sources:**
- `RESEARCHES/RESEARCHES_Master_List.csv`
- `RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- `RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalResearches": 45,
    "pendingSearchTasks": 12,
    "videosPendingProcessing": 28,
    "totalVideos": 156,
    "departmentDistribution": [
      { "name": "DEV", "value": 45 },
      { "name": "SMM", "value": 38 },
      { "name": "VID", "value": 22 },
      { "name": "AID", "value": 51 }
    ],
    "videoStatusDistribution": [
      { "name": "Pending", "value": 24 },
      { "name": "Selected", "value": 18 },
      { "name": "Transcribing", "value": 8 },
      { "name": "Complete", "value": 106 }
    ]
  }
}
```

**Fields:**
| Поле | Тип | Описание |
|------|-----|----------|
| totalResearches | number | Активных исследований |
| pendingSearchTasks | number | Задач в очереди поиска |
| videosPendingProcessing | number | Видео в обработке |
| totalVideos | number | Всего видео |
| departmentDistribution | array | Распределение по отделам |
| videoStatusDistribution | array | Распределение по статусам |

---

## 🔧 Конфигурация

### Environment Variables (.env)

```env
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01
PORT=3001
```

### Запуск сервера

```bash
cd apps/api
npm install
npm run dev
```

---

## 📁 Структура CSV файлов

### Video_Queue_Master.csv

```csv
Queue_ID,Video_Title,Video_URL,Channel_Name,Duration_Minutes,Duration,Topic_Category,Priority_Score,Status,Added_By,Added_Date,Notes,Views,Likes,Publish_Date
VQ-001,Claude Desktop MCP Tutorial,https://youtube.com/...,AI Explained,15,15m,DEV,85,Selected,maria@rhs.com,2025-11-28,Great video,15000,500,2025-11-01
```

### Search_Queue_Master.csv

```csv
Search_ID,Search_Query,Department,Status,Results_Count,Videos_Added,Assigned_To,Created_At
SQ-001,Claude Desktop MCP tutorial,DEV,completed,12,3,alex@rhs.com,2025-11-28
```

---

## ❌ Error Responses

Все ошибки возвращаются в формате:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
| Code | Описание |
|------|----------|
| 200 | Успешный запрос |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

---

**Last Updated:** 2025-11-28

