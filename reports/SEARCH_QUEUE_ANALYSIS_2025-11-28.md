# Search Queue Analysis Report

**Дата:** 2025-11-28  
**Автор:** AI Assistant  
**Статус:** ⚠️ Требуется синхронизация данных

---

## 📋 Резюме

Выявлено **критическое несоответствие** между структурой данных в CSV файле (Python скрипты) и MOCK данными на фронтенде. Это препятствует корректной интеграции Search Queue с реальными данными.

---

## 🔍 Анализ структуры данных

### CSV Структура (Python Scripts)

**Файл:** `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`

```csv
Search_ID,Employee,Department,Topic,Search_Query,Status,Videos_Found,Date_Assigned,Date_Completed,Notes
```

| Поле | Тип | Пример | Описание |
|------|-----|--------|----------|
| `Search_ID` | string | `SEARCH-001` | Уникальный идентификатор |
| `Employee` | string | `john@company.com` | Email сотрудника |
| `Department` | string | `AID` | Код департамента |
| `Topic` | string | `AI Automation` | Тема поиска |
| `Search_Query` | string | `Claude tutorial...` | Текст запроса |
| `Status` | string | `Assigned` | Статус задачи |
| `Videos_Found` | number | `15` | Найдено видео |
| `Date_Assigned` | date | `2025-11-28` | Дата назначения |
| `Date_Completed` | date | `2025-11-28` | Дата завершения |
| `Notes` | string | `Good results` | Заметки |

### Frontend Структура (TypeScript)

**Файл:** `apps/web/src/lib/types.ts`

```typescript
interface SearchQuery {
  id: string;
  created_at: string;
  search_query: string;
  department: Department;
  status: SearchStatus;
  perplexity_settings?: object;
  results_count: number;
  videos_added: number;
  assigned_to: string | null;
  completed_at: string | null;
  error_message?: string;
}
```

---

## ⚠️ Выявленные несоответствия

### 1. Несовпадение имён полей

| # | CSV | Frontend | Статус |
|---|-----|----------|--------|
| 1 | `Search_ID` | `id` | ⚠️ Разные имена |
| 2 | `Employee` | `assigned_to` | ⚠️ Разные имена |
| 3 | `Department` | `department` | ✅ Совпадает |
| 4 | `Topic` | — | ❌ Отсутствует |
| 5 | `Search_Query` | `search_query` | ✅ Совпадает |
| 6 | `Status` | `status` | ⚠️ Разные значения |
| 7 | `Videos_Found` | `videos_added` | ⚠️ Разные имена |
| 8 | `Date_Assigned` | `created_at` | ⚠️ Разные имена |
| 9 | `Date_Completed` | `completed_at` | ⚠️ Разные имена |
| 10 | `Notes` | — | ❌ Отсутствует |
| 11 | — | `results_count` | ❌ Лишнее |
| 12 | — | `perplexity_settings` | ❌ Лишнее |
| 13 | — | `error_message` | ❌ Лишнее |

### 2. Несовпадение форматов ID

| Система | Формат | Пример |
|---------|--------|--------|
| CSV (Python) | `SEARCH-XXX` | `SEARCH-001` |
| Frontend | Произвольная строка | `"1"`, `"abc123"` |

### 3. Несовпадение статусов

| CSV (Python) | Frontend | Цвет бейджа |
|--------------|----------|-------------|
| `Assigned` | `pending` | 🔘 Серый |
| `In Progress` | `searching` | 🔵 Синий |
| `Completed` | `completed` | 🟢 Зелёный |
| — | `failed` | 🔴 Красный |

### 4. Несовпадение форматов дат

| Система | Формат | Пример |
|---------|--------|--------|
| CSV | `YYYY-MM-DD` | `2025-11-28` |
| Frontend | ISO 8601 | `2025-11-28T10:00:00Z` |

---

## 📊 MOCK данные vs Реальная структура

### Текущие MOCK_SEARCHES (8 записей)

```typescript
{
  id: '1',                           // ❌ Должно быть Search_ID: 'SEARCH-001'
  created_at: '2025-11-28T10:00:00Z', // ⚠️ Должно быть Date_Assigned: '2025-11-28'
  search_query: 'Claude Desktop...',  // ✅ OK
  department: 'DEV',                  // ✅ OK
  status: 'completed',                // ⚠️ Должно быть 'Completed'
  perplexity_settings: {...},         // ❌ Нет в CSV
  results_count: 12,                  // ❌ Нет в CSV
  videos_added: 3,                    // ⚠️ Должно быть Videos_Found: 3
  assigned_to: 'alex@...',            // ⚠️ Должно быть Employee
  completed_at: '2025-11-28T10:15:00Z', // ⚠️ Должно быть Date_Completed
  // ❌ Отсутствует Topic
  // ❌ Отсутствует Notes
}
```

### Требуемая структура

```typescript
{
  Search_ID: 'SEARCH-001',
  Employee: 'alex@remotehelpers.com',
  Department: 'DEV',
  Topic: 'AI Development Tools',
  Search_Query: 'Claude Desktop MCP setup tutorial 2024',
  Status: 'Completed',
  Videos_Found: 3,
  Date_Assigned: '2025-11-28',
  Date_Completed: '2025-11-28',
  Notes: 'Found 12 results, added 3 videos'
}
```

---

## 🛠️ Рекомендации

### Приоритет 1: Backend API (Critical)

Добавить CRUD операции в `server.js`:

```javascript
POST   /api/search-queue      // Создание задачи
PUT    /api/search-queue/:id  // Обновление
DELETE /api/search-queue/:id  // Удаление
```

### Приоритет 2: Синхронизация типов (High)

Обновить `types.ts`:

```typescript
export interface SearchQuery {
  Search_ID: string;
  Employee: string | null;
  Department: Department;
  Topic: string;
  Search_Query: string;
  Status: 'Assigned' | 'In Progress' | 'Completed';
  Videos_Found: number;
  Date_Assigned: string;
  Date_Completed: string | null;
  Notes: string;
}
```

### Приоритет 3: Обновить MOCK данные (Medium)

Привести `MOCK_SEARCHES` в соответствие с CSV структурой.

### Приоритет 4: Обновить UI компонент (Medium)

Адаптировать `SearchQueueTable.tsx`:
- Добавить поле `Topic`
- Добавить поле `Notes`
- Изменить маппинг статусов
- Обновить форму добавления/редактирования

---

## 📁 Затронутые файлы

### Backend
| Файл | Статус | Действие |
|------|--------|----------|
| `apps/api/server.js` | ⚠️ Требует доработки | Добавить POST/PUT/DELETE |

### Frontend
| Файл | Статус | Действие |
|------|--------|----------|
| `apps/web/src/lib/types.ts` | ❌ Не соответствует | Обновить интерфейс |
| `apps/web/src/lib/constants.ts` | ❌ Не соответствует | Обновить MOCK данные |
| `apps/web/src/components/SearchQueueTable.tsx` | ⚠️ Требует доработки | Адаптировать под новые поля |

### Data
| Файл | Статус |
|------|--------|
| `ENTITIES/.../Search_Queue_Master.csv` | ✅ Источник истины |

---

## 📈 Оценка трудозатрат

| Задача | Сложность | Время |
|--------|-----------|-------|
| Backend CRUD API | Medium | 1-2 часа |
| Синхронизация типов | Low | 30 мин |
| Обновление MOCK | Low | 30 мин |
| Обновление UI | Medium | 1-2 часа |
| Тестирование | Medium | 1 час |
| **ИТОГО** | | **4-6 часов** |

---

## ✅ Чек-лист исполнения

- [ ] Добавить POST /api/search-queue
- [ ] Добавить PUT /api/search-queue/:id
- [ ] Добавить DELETE /api/search-queue/:id
- [ ] Обновить SearchQuery interface
- [ ] Обновить MOCK_SEARCHES
- [ ] Добавить поле Topic в форму
- [ ] Добавить поле Notes в форму
- [ ] Синхронизировать статусы
- [ ] Подключить фронтенд к реальному API
- [ ] Протестировать CRUD операции

---

*Отчёт сгенерирован автоматически*  
*Версия: 1.0*

