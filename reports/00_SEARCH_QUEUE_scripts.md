# Search Queue Python Scripts

> **Дата:** 2025-11-28  
> **Путь:** `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/scripts/`

---

## Обзор скриптов

| Скрипт | Назначение | Статус в CSV |
|--------|------------|--------------|
| `assign_search.py` | Создание новой задачи поиска | `Assigned` |
| `complete_search.py` | Завершение задачи поиска | `Completed` |

---

## 1️⃣ `assign_search.py` — Создание новой задачи поиска

### Назначение
Создаёт новую запись в `Search_Queue_Master.csv` со статусом `Assigned`

### Использование
```bash
python assign_search.py <employee> <department> <topic> [search_query] [notes]
```

### Параметры

| Параметр | Обязательный | Описание |
|----------|--------------|----------|
| `employee` | ✅ Да | Имя или email сотрудника |
| `department` | ✅ Да | Код департамента (DEV, SMM, VID, AID, DGN, MKT) |
| `topic` | ✅ Да | Тема поиска |
| `search_query` | ❌ Нет | Конкретный поисковый запрос |
| `notes` | ❌ Нет | Дополнительные заметки |

### Пример
```bash
python assign_search.py "John Doe" "DEV" "Claude AI tutorials" "Claude tutorial 2024" "Focus on recent videos"
```

### Алгоритм работы

```
┌─────────────────────────────────────────────────────────────┐
│  1. generate_search_id()                                    │
│     ├── Читает CSV файл                                     │
│     ├── Находит максимальный номер (SEARCH-XXX)            │
│     └── Возвращает следующий ID (SEARCH-001, SEARCH-002...)│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. assign_search()                                         │
│     ├── Создаёт новую строку:                              │
│     │   {                                                   │
│     │     Search_ID: 'SEARCH-XXX',                         │
│     │     Employee: employee,                              │
│     │     Department: department,                          │
│     │     Topic: topic,                                    │
│     │     Search_Query: search_query,                      │
│     │     Status: 'Assigned',        ← Всегда Assigned     │
│     │     Videos_Found: '0',         ← Всегда 0            │
│     │     Date_Assigned: 'YYYY-MM-DD', ← Сегодня           │
│     │     Date_Completed: '',        ← Пусто               │
│     │     Notes: notes                                     │
│     │   }                                                   │
│     ├── Добавляет в конец CSV                              │
│     └── Перезаписывает файл                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Вывод:                                                  │
│     ✅ Search task assigned: SEARCH-001                     │
│        Employee: John Doe                                   │
│        Department: DEV                                      │
│        Topic: Claude AI tutorials                           │
└─────────────────────────────────────────────────────────────┘
```

### Создаваемая запись

```python
new_row = {
    'Search_ID': search_id,                          # SEARCH-XXX (автогенерация)
    'Employee': employee,                            # Из параметра
    'Department': department,                        # Из параметра
    'Topic': topic,                                  # Из параметра
    'Search_Query': search_query,                    # Из параметра (опционально)
    'Status': 'Assigned',                            # Константа
    'Videos_Found': '0',                             # Константа
    'Date_Assigned': datetime.now().strftime('%Y-%m-%d'),  # Текущая дата
    'Date_Completed': '',                            # Пусто
    'Notes': notes                                   # Из параметра (опционально)
}
```

---

## 2️⃣ `complete_search.py` — Завершение задачи поиска

### Назначение
Обновляет существующую запись — меняет статус на `Completed`

### Использование
```bash
python complete_search.py <search_id> <videos_found> [notes]
```

### Параметры

| Параметр | Обязательный | Описание |
|----------|--------------|----------|
| `search_id` | ✅ Да | ID задачи (SEARCH-XXX) |
| `videos_found` | ✅ Да | Количество найденных видео (число) |
| `notes` | ❌ Нет | Обновлённые заметки |

### Пример
```bash
python complete_search.py SEARCH-001 15 "Found good tutorials"
```

### Алгоритм работы

```
┌─────────────────────────────────────────────────────────────┐
│  1. complete_search()                                       │
│     ├── Читает все строки из CSV                           │
│     ├── Ищет строку где Search_ID == search_id             │
│     │                                                       │
│     │   Если найдено:                                       │
│     │   ├── row['Status'] = 'Completed'                    │
│     │   ├── row['Videos_Found'] = videos_found             │
│     │   ├── row['Date_Completed'] = 'YYYY-MM-DD'           │
│     │   └── row['Notes'] = notes (если передано)           │
│     │                                                       │
│     │   Если НЕ найдено:                                   │
│     │   └── ❌ Error: Search ID not found                   │
│     │                                                       │
│     └── Перезаписывает CSV файл                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Вывод:                                                  │
│     ✅ Search completed: SEARCH-001                         │
│        Videos found: 15                                     │
│        Status: Completed                                    │
└─────────────────────────────────────────────────────────────┘
```

### Обновляемые поля

```python
row['Status'] = 'Completed'                              # Константа
row['Videos_Found'] = str(videos_found)                  # Из параметра
row['Date_Completed'] = datetime.now().strftime('%Y-%m-%d')  # Текущая дата
row['Notes'] = notes                                     # Из параметра (если передано)
```

---

## 📊 Жизненный цикл задачи

```
┌──────────────────┐    assign_search.py     ┌──────────────────┐
│                  │ ───────────────────────→│                  │
│   Нет задачи     │                         │  Status:         │
│                  │                         │  "Assigned"      │
└──────────────────┘                         │  Videos_Found: 0 │
                                             │  Date_Completed: │
                                             │    ""            │
                                             └────────┬─────────┘
                                                      │
                                                      │ (сотрудник
                                                      │  выполняет
                                                      │  поиск в
                                                      │  Perplexity)
                                                      ↓
                                             ┌──────────────────┐
                                             │                  │
                    complete_search.py       │  Status:         │
                 ←───────────────────────────│  "In Progress"   │
                                             │  (опционально)   │
                                             │                  │
                                             └────────┬─────────┘
                                                      │
                                                      ↓
┌──────────────────┐    complete_search.py   ┌──────────────────┐
│                  │ ←───────────────────────│                  │
│   Задача         │                         │  Status:         │
│   завершена      │                         │  "Completed"     │
│                  │                         │  Videos_Found: 15│
└──────────────────┘                         │  Date_Completed: │
                                             │  "2025-11-28"    │
                                             └──────────────────┘
```

---

## 📁 Структура файлов

```
ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/
├── Search_Queue_Master.csv     ← Основной CSV файл
└── scripts/
    ├── assign_search.py        ← Создание задачи
    └── complete_search.py      ← Завершение задачи
```

---

## 🔗 Связь с Frontend/Backend

| Действие | Python Script | Backend API | Frontend |
|----------|--------------|-------------|----------|
| Создать задачу | `assign_search.py` | ❌ POST отсутствует | `handleAdd()` |
| Завершить задачу | `complete_search.py` | ❌ PUT отсутствует | — |
| Читать задачи | — | ✅ `GET /api/search-queue` | `MOCK_SEARCHES` |
| Удалить задачу | — | ❌ DELETE отсутствует | `handleDelete()` |

### Проблемы интеграции

1. **Backend не имеет CRUD эндпоинтов для Search Queue**
   - Только `GET /api/search-queue` (чтение)
   - Нет `POST`, `PUT`, `DELETE`

2. **Frontend использует mock данные**
   - Данные из `constants.ts`
   - Не вызывает API

3. **CSV файл пустой**
   - `Search_Queue_Master.csv` содержит только заголовки

---

## 📝 Рекомендации

### Для полной интеграции необходимо:

1. **Добавить в `server.js`:**
   ```javascript
   // POST /api/search-queue - создание задачи
   // PUT /api/search-queue/:id - обновление задачи
   // DELETE /api/search-queue/:id - удаление задачи
   ```

2. **Обновить Frontend:**
   - Заменить `MOCK_SEARCHES` на `fetch('/api/search-queue')`
   - Добавить API вызовы в `handleAdd`, `handleEdit`, `handleDelete`

3. **Или использовать Supabase:**
   - Миграция на PostgreSQL
   - Использовать схему из `apps/schemas.sql`

---

## 📚 Ссылки

- **CSV файл:** `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- **SQL схема:** `apps/schemas.sql`
- **TypeScript типы:** `apps/web/src/lib/types.ts`
- **Mock данные:** `apps/web/src/lib/constants.ts`

