# Search Queue - Анализ и документация

> Анализ текущего состояния Search Queue и план интеграции.

**Дата:** 2025-11-28

---

## 📊 Анализ текущего состояния

### Backend (`server.js`)

**✅ Реализовано:**
```javascript
GET /api/search-queue - читает CSV файл
```

**❌ Не реализовано:**
- `POST /api/search-queue` - создание
- `PUT /api/search-queue/:id` - обновление  
- `DELETE /api/search-queue/:id` - удаление

### Frontend (`SearchQueueTable.tsx`)

**✅ Реализовано (на MOCK данных):**
- Добавление новой задачи
- Редактирование
- Удаление
- Фильтрация по статусу и департаменту
- Поиск

**❌ Проблема:**
- Работает только с `MOCK_SEARCHES` в памяти
- Не подключено к реальному API
- Структура данных отличается от CSV

---

## 📋 CSV Структура (`Search_Queue_Master.csv`)

```csv
Search_ID,Employee,Department,Topic,Search_Query,Status,Videos_Found,Date_Assigned,Date_Completed,Notes
```

### Поля CSV

| Поле | Тип | Описание |
|------|-----|----------|
| `Search_ID` | string | Уникальный ID (SEARCH-001, SEARCH-002...) |
| `Employee` | string | Исполнитель задачи |
| `Department` | string | Департамент (DEV, AID, VID, SMM...) |
| `Topic` | string | Тема поиска |
| `Search_Query` | string | Текст поискового запроса |
| `Status` | string | Статус (Assigned, In Progress, Completed) |
| `Videos_Found` | number | Количество найденных видео |
| `Date_Assigned` | date | Дата назначения (YYYY-MM-DD) |
| `Date_Completed` | date | Дата завершения (YYYY-MM-DD) |
| `Notes` | string | Заметки |

---

## ⚠️ Несоответствие: Python Scripts vs Frontend

| Поле Python (CSV) | Поле Frontend | Статус |
|-------------------|---------------|--------|
| `Search_ID` | `id` | ⚠️ Несовпадение |
| `Employee` | `assigned_to` | ⚠️ Несовпадение |
| `Department` | `department` | ✅ Совпадает |
| `Topic` | - | ❌ Отсутствует на фронте |
| `Search_Query` | `search_query` | ✅ Совпадает |
| `Status` | `status` | ⚠️ Значения разные |
| `Videos_Found` | `videos_added` | ⚠️ Несовпадение |
| `Date_Assigned` | `created_at` | ⚠️ Несовпадение |
| `Date_Completed` | `completed_at` | ⚠️ Несовпадение |
| `Notes` | - | ❌ Отсутствует на фронте |

### Статусы: Python vs Frontend

| Python Script | Frontend | Описание |
|---------------|----------|----------|
| `Assigned` | `pending` | Задача назначена |
| `In Progress` | `searching` | Поиск выполняется |
| `Completed` | `completed` | Завершено |
| - | `failed` | Ошибка (только фронт) |

---

## 🔄 Цикл создания новой задачи Search Queue

```
┌─────────────────────────────────────────────────────────────────────┐
│                    СОЗДАНИЕ SEARCH TASK                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. ИНИЦИАЦИЯ                                                        │
│     ├─ Пользователь открывает Search Queue                          │
│     ├─ Нажимает "New Search"                                         │
│     └─ Заполняет форму:                                              │
│         • Search Query: "Claude Desktop MCP tutorial 2024"           │
│         • Department: AID                                            │
│         • Topic: AI Automation                                       │
│         • Employee: john@company.com                                 │
│                                                                      │
│  2. СОЗДАНИЕ (POST /api/search-queue)                               │
│     ├─ Backend генерирует ID: SEARCH-001                            │
│     ├─ Записывает в Search_Queue_Master.csv                         │
│     └─ Возвращает созданную запись                                   │
│                                                                      │
│  3. СТАТУС: "Assigned" (pending)                                     │
│     └─ Задача появляется в таблице                                   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    ВЫПОЛНЕНИЕ SEARCH                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  4. ПОИСК В PERPLEXITY                                               │
│     ├─ Сотрудник берёт задачу                                        │
│     ├─ Обновляет статус → "In Progress" (searching)                  │
│     └─ Выполняет поиск в Perplexity AI                               │
│                                                                      │
│  5. ОБРАБОТКА РЕЗУЛЬТАТОВ                                            │
│     ├─ Анализ найденных видео                                        │
│     ├─ Отбор релевантных                                             │
│     └─ Добавление в Video Queue                                      │
│                                                                      │
│  6. ЗАВЕРШЕНИЕ                                                        │
│     ├─ Обновляет статус → "Completed"                                │
│     ├─ Указывает Videos_Found                                        │
│     ├─ Записывает Notes с результатами                               │
│     └─ Устанавливает Date_Completed                                  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    ИНТЕГРАЦИЯ С VIDEO QUEUE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  7. ПЕРЕДАЧА ВИДЕО                                                   │
│     ├─ Найденные видео → Video Queue                                 │
│     ├─ Ссылка Search_ID → Research_Source                           │
│     └─ Видео получают статус "Pending"                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ План реализации

### Этап 1: Backend CRUD

Добавить в `server.js`:

```javascript
// POST /api/search-queue - создание новой задачи
app.post('/api/search-queue', async (req, res) => {
  // Генерация SEARCH-XXX ID
  // Запись в CSV
});

// PUT /api/search-queue/:id - обновление задачи
app.put('/api/search-queue/:id', async (req, res) => {
  // Поиск по Search_ID
  // Обновление полей
});

// DELETE /api/search-queue/:id - удаление задачи
app.delete('/api/search-queue/:id', async (req, res) => {
  // Поиск по Search_ID
  // Удаление из CSV
});
```

### Этап 2: Frontend интеграция

1. Заменить `MOCK_SEARCHES` на вызовы API
2. Синхронизировать типы данных с CSV структурой
3. Добавить поле `topic` в форму
4. Добавить поле `notes` в форму

### Этап 3: Синхронизация статусов

| API Status | Frontend Status | Badge Color |
|------------|-----------------|-------------|
| `Assigned` | `pending` | Gray |
| `In Progress` | `searching` | Blue |
| `Completed` | `completed` | Green |
| `Failed` | `failed` | Red |

---

## 📁 Связанные файлы

### Backend
- `apps/api/server.js` - API сервер

### Frontend
- `apps/web/src/components/SearchQueueTable.tsx` - UI компонент
- `apps/web/src/lib/types.ts` - TypeScript типы
- `apps/web/src/lib/constants.ts` - константы и mock данные
- `apps/web/src/lib/api.ts` - API клиент

### Data
- `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`

### Python Scripts
- `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/scripts/assign_search.py`
- `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/scripts/complete_search.py`

---

## 🔗 Связь с Video Queue

После завершения поиска, найденные видео добавляются в Video Queue:

```
Search Queue                          Video Queue
┌────────────────┐                   ┌────────────────┐
│ SEARCH-001     │                   │ VQ-001         │
│ Status: Done   │ ───────────────►  │ Research_Source│
│ Videos: 5      │   добавление      │ = SEARCH-001   │
└────────────────┘   видео           └────────────────┘
```

---

*Последнее обновление: 2025-11-28*

