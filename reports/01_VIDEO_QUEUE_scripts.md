# Video Queue Python Scripts

> **Дата:** 2025-11-28  
> **Путь:** `ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/scripts/`

---

## Обзор скриптов

| Скрипт | Назначение | Зависимости |
|--------|------------|-------------|
| `add_video_to_queue.py` | Добавление видео в очередь | pandas, calculate_priority |
| `add_video_to_queue_simple.py` | Добавление видео (без pandas) | csv, calculate_priority |
| `update_queue_status.py` | Обновление статуса видео | pandas |
| `calculate_priority.py` | Расчёт приоритета видео | — |
| `export_queue.py` | Экспорт очереди | pandas, json |

---

## 1️⃣ `add_video_to_queue.py` — Добавление видео (Pandas версия)

### Назначение
Добавляет новое видео в `Video_Queue_Master.csv` с автоматическим расчётом приоритета

### Использование
```bash
python add_video_to_queue.py <video_url> <added_by> <topic> <source> [notes]
```

### Параметры

| Параметр | Обязательный | Описание |
|----------|--------------|----------|
| `video_url` | ✅ Да | YouTube URL видео |
| `added_by` | ✅ Да | Имя сотрудника |
| `topic` | ✅ Да | Категория/тема исследования |
| `source` | ✅ Да | Источник (Perplexity, Gemini, GPT, DeepSeek, YouTube) |
| `notes` | ❌ Нет | Дополнительные заметки |

### Пример
```bash
python add_video_to_queue.py \
  'https://youtube.com/watch?v=dQw4w9WgXcQ' \
  'Niko Kar' \
  'UI Design Trends' \
  'Perplexity' \
  'Found via deep research on 2025 design trends'
```

### Алгоритм работы

```
┌─────────────────────────────────────────────────────────────┐
│  1. extract_video_id(url)                                   │
│     ├── Парсит YouTube URL                                  │
│     ├── Поддерживает форматы:                              │
│     │   • youtube.com/watch?v=XXX                          │
│     │   • youtu.be/XXX                                      │
│     │   • youtube.com/embed/XXX                            │
│     └── Возвращает 11-символьный Video_ID                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Проверка дубликатов                                     │
│     ├── Если Video_ID уже есть в CSV                       │
│     └── ⚠️ Возвращает существующий Queue_ID                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. generate_queue_id()                                     │
│     ├── Находит максимальный VQ-XXX                        │
│     └── Возвращает следующий ID (VQ-001, VQ-002...)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. calculate_priority_score()                              │
│     ├── Рассчитывает 0-100 баллов                          │
│     └── На основе views, likes, recency                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Создание записи                                         │
│     {                                                       │
│       Queue_ID: 'VQ-XXX',                                  │
│       Video_ID: 'dQw4w9WgXcQ',                             │
│       Video_Title: '[To be extracted]',                    │
│       Channel_Name: '[To be extracted]',                   │
│       Video_URL: url,                                       │
│       Status: 'Pending',                                   │
│       Priority_Score: 75.5,                                │
│       Added_By: 'Niko Kar',                                │
│       Added_Date: '2025-11-28',                            │
│       Topic_Category: topic,                               │
│       Research_Source: source,                             │
│       ...                                                   │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
```

### Создаваемая запись

```python
metadata = {
    'Queue_ID': queue_id,               # VQ-XXX (автогенерация)
    'Video_ID': video_id,               # Извлечённый ID
    'Video_Title': '[To be extracted]', # Заполняется позже
    'Channel_Name': '[To be extracted]',
    'Channel_URL': '[To be extracted]',
    'Video_URL': video_url,
    'Views': 0,
    'Likes': 0,
    'Comments': 0,
    'Publish_Date': 'YYYY-MM-DD',
    'Duration': '00:00:00',
    'Added_By': added_by,
    'Added_Date': 'YYYY-MM-DD',         # Текущая дата
    'Status': 'Pending',                # Всегда Pending
    'Selected_By': '',
    'Selected_Date': '',
    'Parsed_Date': '',
    'Topic_Category': topic_category,
    'Research_Source': research_source,
    'Priority_Score': priority_score,   # Рассчитано
    'Notes': notes
}
```

---

## 2️⃣ `add_video_to_queue_simple.py` — Добавление видео (без Pandas)

### Назначение
Идентичен `add_video_to_queue.py`, но использует стандартный модуль `csv` вместо pandas

### Отличия от основной версии

| Аспект | add_video_to_queue.py | add_video_to_queue_simple.py |
|--------|----------------------|------------------------------|
| Зависимости | pandas | csv (встроенный) |
| Размер | Больше | Меньше |
| Скорость | Медленнее | Быстрее |
| Рекомендация | Для анализа | Для production |

### Использование
```bash
python add_video_to_queue_simple.py <video_url> <added_by> <topic> <source> [notes]
```

---

## 3️⃣ `update_queue_status.py` — Обновление статуса

### Назначение
Изменяет статус видео в очереди и обновляет соответствующие даты

### Команды

#### Обновление статуса
```bash
python update_queue_status.py update <queue_id> <status> [selected_by]
```

#### Просмотр сводки
```bash
python update_queue_status.py summary
```

#### Список по статусу
```bash
python update_queue_status.py list <status>
```

### Допустимые статусы

| Статус | Описание | Обновляемые поля |
|--------|----------|------------------|
| `Pending` | Ожидает обработки | — |
| `Selected` | Выбрано для обработки | `Selected_By`, `Selected_Date` |
| `Parsing` | В процессе парсинга | — |
| `Parsed` | Парсинг завершён | `Parsed_Date` |
| `Rejected` | Отклонено | — |

### Примеры
```bash
# Выбрать видео для обработки
python update_queue_status.py update VQ-001 Selected 'Niko Kar'

# Отметить как обработанное
python update_queue_status.py update VQ-002 Parsed

# Показать сводку
python update_queue_status.py summary

# Список ожидающих
python update_queue_status.py list Pending
```

### Алгоритм обновления

```
┌─────────────────────────────────────────────────────────────┐
│  update_status(queue_id, new_status, selected_by)           │
│                                                             │
│  1. Валидация статуса                                       │
│     └── Pending | Selected | Parsing | Parsed | Rejected   │
│                                                             │
│  2. Поиск записи по Queue_ID                               │
│     └── ❌ Если не найдено → ошибка                         │
│                                                             │
│  3. Обновление полей:                                       │
│     ├── row['Status'] = new_status                         │
│     │                                                       │
│     ├── if new_status == 'Selected':                       │
│     │   ├── row['Selected_By'] = selected_by               │
│     │   └── row['Selected_Date'] = today                   │
│     │                                                       │
│     └── if new_status == 'Parsed':                         │
│         └── row['Parsed_Date'] = today                     │
│                                                             │
│  4. Сохранение CSV                                          │
└─────────────────────────────────────────────────────────────┘
```

### Вывод summary

```
============================================================
VIDEO QUEUE SUMMARY
============================================================

Total videos in queue: 5

Status Breakdown:
  Pending     :   2 ( 40.0%)
  Selected    :   1 ( 20.0%)
  Parsed      :   2 ( 40.0%)

Top Topics:
  AI Tools Overview              :   2
  Video Editing                  :   1
  UI Design Trends               :   1

Research Sources:
  Perplexity  :   3
  Gemini      :   1
  YouTube     :   1

============================================================
```

---

## 4️⃣ `calculate_priority.py` — Расчёт приоритета

### Назначение
Рассчитывает приоритет видео по шкале 0-100 на основе метаданных

### Использование
```bash
python calculate_priority.py <views> <likes> <publish_date>
```

### Пример
```bash
python calculate_priority.py 1500000 45000 2025-10-15
```

### Формула расчёта

```
┌─────────────────────────────────────────────────────────────┐
│  PRIORITY SCORE (0-100)                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Views Score (30% max)                              │   │
│  │  └── views / 1,000,000 × 30                         │   │
│  │      1M views = 30 points                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                            +                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Likes Score (20% max)                              │   │
│  │  └── likes / 50,000 × 20                            │   │
│  │      50K likes = 20 points                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            +                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Recency Score (30% max)                            │   │
│  │  └── 30 - (days_since_publish / 365) × 30           │   │
│  │      New video = 30 points                          │   │
│  │      1 year old = 0 points                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            +                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Engagement Score (20% max)                         │   │
│  │  └── (likes / views) × 2000                         │   │
│  │      1% engagement = 20 points                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                            =                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TOTAL: 0-100 points                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Примеры расчёта

| Тип видео | Views | Likes | Дней назад | Score |
|-----------|-------|-------|------------|-------|
| Вирусное новое | 5,000,000 | 200,000 | 7 | ~92 |
| Популярное свежее | 1,500,000 | 45,000 | 30 | ~75 |
| Среднее старое | 500,000 | 15,000 | 180 | ~45 |
| Малопопулярное | 10,000 | 200 | 60 | ~25 |

---

## 5️⃣ `export_queue.py` — Экспорт очереди

### Назначение
Экспортирует очередь видео в различные форматы

### Форматы экспорта

| Формат | Команда | Описание |
|--------|---------|----------|
| CSV | `csv` | Табличный формат |
| JSON | `json` | Структурированные данные |
| Markdown | `markdown` | Читаемый отчёт |
| Все | `all` | Все форматы сразу |

### Использование
```bash
python export_queue.py <format> [status_filter]
```

### Примеры
```bash
# Экспорт всего в CSV
python export_queue.py csv

# Экспорт только Pending в JSON
python export_queue.py json Pending

# Экспорт Selected в Markdown
python export_queue.py markdown Selected

# Экспорт во все форматы
python export_queue.py all
```

### Структура экспортируемых файлов

```
01_VIDEO_QUEUE/
└── exports/
    ├── queue_export_2025-11-28.csv
    ├── queue_export_2025-11-28.json
    ├── queue_export_2025-11-28.md
    ├── queue_export_2025-11-28_Pending.csv
    └── queue_export_2025-11-28_Selected.md
```

### JSON структура

```json
{
  "export_date": "2025-11-28 14:30:00",
  "total_videos": 5,
  "status_filter": "All",
  "videos": [
    {
      "Queue_ID": "VQ-001",
      "Video_ID": "dQw4w9WgXcQ",
      "Video_Title": "Google AI Studio Full Walkthrough",
      "Status": "Pending",
      "Priority_Score": 75.5,
      ...
    }
  ]
}
```

### Markdown структура

```markdown
# Video Queue Export

**Export Date**: 2025-11-28 14:30:00
**Total Videos**: 5

## Summary

### By Status
- **Pending**: 2
- **Selected**: 1
- **Parsed**: 2

## Videos

| Queue ID | Title | Status | Priority |
|----------|-------|--------|----------|
| VQ-003 | UI Design Trends | Selected | 92.8/100 |
| VQ-001 | Google AI Studio | Pending | 75.5/100 |
...
```

---

## 📊 Жизненный цикл видео

```
                                    add_video_to_queue.py
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Status: PENDING                                            │
│  ├── Queue_ID: VQ-XXX                                      │
│  ├── Priority_Score: calculated                            │
│  ├── Added_By: employee                                    │
│  └── Added_Date: today                                     │
└─────────────────────────────────────────────────────────────┘
                                           │
                    update_queue_status.py │ update VQ-XXX Selected 'Name'
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Status: SELECTED                                           │
│  ├── Selected_By: employee                                 │
│  └── Selected_Date: today                                  │
└─────────────────────────────────────────────────────────────┘
                                           │
                    update_queue_status.py │ update VQ-XXX Parsing
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Status: PARSING                                            │
│  └── (транскрипция в процессе)                             │
└─────────────────────────────────────────────────────────────┘
                                           │
                    update_queue_status.py │ update VQ-XXX Parsed
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Status: PARSED                                             │
│  └── Parsed_Date: today                                    │
└─────────────────────────────────────────────────────────────┘
                                           │
                       export_queue.py     │
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│  EXPORT                                                     │
│  ├── CSV: queue_export_2025-11-28.csv                      │
│  ├── JSON: queue_export_2025-11-28.json                    │
│  └── MD: queue_export_2025-11-28.md                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура файлов

```
ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/
├── Video_Queue_Master.csv          ← Основной CSV файл
├── exports/                        ← Экспортированные файлы
│   ├── queue_export_*.csv
│   ├── queue_export_*.json
│   └── queue_export_*.md
└── scripts/
    ├── add_video_to_queue.py       ← Добавление (pandas)
    ├── add_video_to_queue_simple.py ← Добавление (csv)
    ├── update_queue_status.py      ← Обновление статуса
    ├── calculate_priority.py       ← Расчёт приоритета
    └── export_queue.py             ← Экспорт
```

---

## 🔗 Связь с Frontend/Backend

| Действие | Python Script | Backend API | Frontend |
|----------|--------------|-------------|----------|
| Добавить видео | `add_video_to_queue.py` | ✅ `POST /api/video-queue` | `handleAdd()` |
| Обновить видео | `update_queue_status.py` | ✅ `PUT /api/video-queue/:id` | `handleEdit()` |
| Удалить видео | — | ✅ `DELETE /api/video-queue/:id` | `handleDelete()` |
| Читать очередь | — | ✅ `GET /api/video-queue` | `MOCK_VIDEOS` |
| Экспорт | `export_queue.py` | ❌ нет | — |
| Приоритет | `calculate_priority.py` | ❌ встроен частично | — |

### Статус интеграции

✅ **Video Queue имеет полный CRUD на backend!**  
(в отличие от Search Queue, где только GET)

---

## 📝 Рекомендации

### Для улучшения системы:

1. **Добавить API для экспорта:**
   ```javascript
   GET /api/video-queue/export?format=json&status=Pending
   ```

2. **Интегрировать расчёт приоритета в backend:**
   ```javascript
   // При добавлении автоматически рассчитывать Priority_Score
   ```

3. **Синхронизировать статусы:**
   - Backend: `Pending`, `Selected`, `Parsing`, `Parsed`, `Rejected`
   - Frontend: `pending`, `selected`, `transcribing`, `complete`, `rejected`

4. **Добавить webhook для обновлений:**
   - Уведомление при изменении статуса
   - Интеграция с Slack/Discord

---

## 📚 Ссылки

- **CSV файл:** `ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
- **SQL схема:** `apps/schemas.sql`
- **TypeScript типы:** `apps/web/src/lib/types.ts`
- **Mock данные:** `apps/web/src/lib/constants.ts`
- **Backend API:** `apps/api/server.js`

