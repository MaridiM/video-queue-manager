# CHANGELOG

Все изменения проекта Queue Manager (Video Queue + Search Queue).

---

## [1.6.0] - 2025-12-01

### Added - AI Settings Page & Multi-Provider Support

Добавлена полноценная страница настроек AI провайдеров с поддержкой выбора моделей.

#### 🆕 Новая страница Settings (`pages/Settings.tsx`)

| Функция | Описание |
|---------|----------|
| **API Key Management** | Ввод, сохранение и маскирование ключей |
| **Provider Toggle** | Включение/выключение провайдеров |
| **Model Selection** | Выбор модели после сохранения ключа |
| **Connection Test** | Тестирование API подключения |
| **Default Provider** | Установка провайдера по умолчанию |

#### 🤖 Поддерживаемые модели

| Провайдер | Модели |
|-----------|--------|
| **Google AI Studio** | `gemini-2.0-flash` (default), `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest` |
| **OpenAI** | `gpt-4o-mini` (default), `gpt-4o`, `gpt-4-turbo` |

#### 📡 Новые API эндпоинты

```
GET  /api/settings       - Получение настроек (ключи маскируются)
PUT  /api/settings       - Обновление настроек (apiKey, model, enabled)
POST /api/settings/test  - Тестирование подключения к провайдеру
```

#### 📦 Новые зависимости
```bash
npm install @google/generative-ai
```

#### 📁 Файлы изменены/добавлены
- `apps/api/server.js` - Settings API, model selection, settings.json storage
- `apps/web/src/lib/api.ts` - `settingsAPI`, новые типы `AISettings`, `AIModelInfo`
- `apps/web/src/pages/Settings.tsx` - новая страница (полностью)
- `apps/web/src/App.tsx` - добавлена навигация на Settings
- `apps/web/src/components/VideoDetailView.tsx` - выбор провайдера в AI Process

---

## [1.6.1] - 2025-12-01

### Fixed - Timestamps Preservation in AI Transcription

Исправлена потеря таймкодов при AI обработке транскрипций.

#### Проблема
Таймкоды терялись при подготовке текста для AI:
```javascript
// ❌ До: таймкоды терялись
const rawText = segments.map(s => s.text).join(' ');
// Результат: "hey everyone my name is vishwas and welcome..."
```

#### Решение
```javascript
// ✅ После: таймкоды сохраняются
const transcriptWithTimestamps = segments.map(s => {
  const timestamp = formatTimestamp(s.startMs);
  return `[${timestamp}] ${s.text}`;
}).join('\n');
// Результат:
// [00:00] hey everyone my name is vishwas
// [00:15] and welcome to the most comprehensive...
```

#### Обновлённый промпт для AI
```
## Transcript with Timestamps
[00:00] hey everyone...
[00:15] and welcome...

IMPORTANT: Preserve the timestamps [MM:SS] in the Word-for-Word Transcription section.
```

#### Файлы изменены
- `apps/api/server.js` - `transcriptWithTimestamps`, обновлённый `userPrompt`

---

## [1.5.0] - 2025-12-01

### Added - AI Transcription Pipeline UI

Полная переработка модального окна транскрипции с автоматизированным workflow.

#### 🎬 Новый AI Pipeline Modal

**Было:** 3 вкладки (YouTube Captions, AI Process, PMT-004)
**Стало:** Единый экран AI Transcription Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  🪄 Полный AI Pipeline                                       │
│     YouTube Captions → Gemini/OpenAI → PMT-004 → Файл       │
│                                                              │
│  [○ Captions] ─── [○ AI] ─── [○ Save]   ← Pipeline Steps    │
│                                                              │
│  📄 Prompt: PMT-004_Video_Transcription_v4.1  [📋 Copy]     │
│                                                              │
│         🌐 Google AI    ✨ OpenAI                            │
│              [🪄 Process with AI]                            │
└──────────────────────────────────────────────────────────────┘
```

#### Новые функции:
- ✅ **Pipeline visualization** - визуальные шаги (Captions → AI → Save)
- ✅ **Prompt badge** - показывает используемый промпт PMT-004
- ✅ **Copy Prompt button** - копирование полного промпта в буфер
- ✅ **Unified workflow** - всё под капотом в одном потоке
- ✅ **Step tracking** - отслеживание текущего шага обработки

#### Файлы изменены:
- `VideoDetailView.tsx` - полная переработка модала транскрипции

---

### Added - PMT-013: Script Generation from Video

Новый промпт для генерации сценариев на основе видео-транскрипций.

**Файл:** `ENTITIES/PROMPTS/PMT-013_Script_Generation_from_Video.md`

**Назначение:** Трансформация транскрипции в готовый сценарий для записи видео

**Структура выхода:**
- 🎬 Scene-by-scene script
- 🎤 Narration (готовые фразы для начитки)
- 📺 Visuals (что показывать на экране)
- ⏱️ Timing (тайминги для каждой сцены)
- 🔊 Audio notes
- 📊 SEO elements

**Папка для скриптов:** `ENTITIES/TASK_MANAGERS/RESEARCHES/03_SCRIPTS/`

---

### Fixed - Google Gemini Model Name

**Проблема:** Ошибка 404 при вызове AI Process
```
models/gemini-1.5-flash is not found for API version v1beta
```

**Решение:** Обновлено название модели
```javascript
// Было:
model: 'gemini-1.5-flash'

// Стало:
model: 'gemini-1.5-flash-latest'
```

**Файл:** `apps/api/server.js` (4 места)

---

### Updated - Modal Width & Responsiveness

#### Generate Transcription Modal
- **Размер:** +30% шире (`max-w-lg` → `max-w-2xl` через `size="lg"`)
- **Адаптивность:** Отступы `p-2 sm:p-4` для разных экранов

**Файлы:**
- `Modal.tsx` - добавлен prop `size` с вариантами: `default`, `lg`, `xl`, `full`
- `VideoDetailView.tsx` - использует `size="lg"`

#### Settings Page
- **Ширина:** `max-w-4xl` → `max-w-7xl` (896px → 1280px)
- **Grid:** `lg:grid-cols-2` → `md:grid-cols-2` (раньше переключается)
- **Адаптивность:** Размеры шрифтов, отступов, кнопок для mobile/tablet/desktop

**Файл:** `apps/web/src/pages/Settings.tsx`

---

### Technical Changes

#### Removed from VideoDetailView:
- `activeTab` state и `handleTabChange`
- `transcriptData`, `transcriptLoading`, `transcriptError` states
- `promptData`, `promptLoading`, `promptError` states
- `fetchTranscript()`, `fetchPrompt()`, `handleRetryPrompt()` functions
- YouTube Captions tab UI
- PMT-004 Prompt tab UI

#### Added to VideoDetailView:
- `pipelineStep` state для отслеживания шагов
- `pipelineMessage` state для сообщений
- `promptCopying`, `promptCopied` states для кнопки копирования
- `handleCopyPrompt()` function
- Pipeline steps visualization component

#### Updated Imports:
```typescript
// Removed:
Folder, FolderOpen, Captions, Download, Play

// Kept:
Youtube, Sparkles, FileText, Wand2, Save, CheckCircle, Loader2
```

---

## [1.4.3] - 2025-11-28

### Updated - Search Queue Form (Python Script Compatibility)

Обновлена форма "Add New Search Query" для соответствия полям Python скрипта `assign_search.py`.

#### Новые поля формы:
| Поле | Обязательное | Описание |
|------|--------------|----------|
| **Employee** | ✅ Yes | Имя или email сотрудника |
| **Department** | ✅ Yes | Код департамента |
| **Topic** | ✅ Yes | Тема поиска |
| **Search Query** | ❌ No | Конкретный поисковый запрос |
| **Notes** | ❌ No | Дополнительные заметки |

#### Изменения в файлах:
- `SearchQueueTable.tsx` - обновлена форма и таблица
- `types.ts` - обновлен интерфейс `SearchFormData`
- `constants.ts` - обновлены MOCK данные с полями `topic`, `notes` и ID формата `SEARCH-XXX`

#### Обновлена таблица:
- Колонка "Topic / Query" вместо "Search Query"
- Добавлена колонка "Employee"
- Добавлена колонка "Notes"
- ID теперь в формате `SEARCH-001`, `SEARCH-002`...

---

## [1.4.2] - 2025-11-28

### Added - Search Queue Analysis Report

Создан детальный отчёт анализа Search Queue: `apps/reports/SEARCH_QUEUE_ANALYSIS_2025-11-28.md`

**Содержимое отчёта:**
- Сравнение CSV структуры vs Frontend типов
- Выявленные несоответствия (13 пунктов)
- Различия в форматах ID, статусов, дат
- Рекомендации по исправлению
- Оценка трудозатрат (4-6 часов)
- Чек-лист исполнения

---

## [1.4.1] - 2025-11-28

### Fixed - CSV File Paths in Backend

Исправлены пути к CSV файлам в `server.js` для соответствия реальной структуре Dropbox.

**Проблема:** Пути в коде не соответствовали структуре `ENTITIES/TASK_MANAGERS/RESEARCHES/`.

**Было (неправильно):**
```javascript
readCSV('RESEARCHES/RESEARCHES_Master_List.csv')
readCSV('RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv')
readCSV('RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv')
```

**Стало (правильно):**
```javascript
readCSV('ENTITIES/TASK_MANAGERS/RESEARCHES/RESEARCHES_Master_List.csv')
readCSV('ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv')
readCSV('ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv')
```

### Added - Search Queue Documentation

Создан файл `apps/SEARCH_QUEUE.md` с анализом:
- Текущее состояние backend/frontend
- Структура CSV файла
- Несоответствие полей Python ↔ Frontend
- Цикл создания новой задачи
- План реализации CRUD операций
- Связь с Video Queue

---

## [1.4.0] - 2025-11-28

### Added - RESEARCHES Scripts Documentation

Создана полная документация всех скриптов из папки `ENTITIES/TASK_MANAGERS/RESEARCHES/`.

#### 📄 Новый файл: `apps/RESEARCHES.md`

Документирует все скрипты для обработки видео и управления исследованиями:

### 00_SEARCH_QUEUE Scripts
| Скрипт | Назначение |
|--------|------------|
| `assign_search.py` | Создание нового задания на поиск видео |
| `complete_search.py` | Завершение поискового задания с записью результатов |

### 01_VIDEO_QUEUE Scripts
| Скрипт | Назначение |
|--------|------------|
| `add_video_to_queue.py` | Добавление видео в очередь (pandas версия) |
| `add_video_to_queue_simple.py` | Добавление видео (без pandas) |
| `calculate_priority.py` | Расчёт приоритетного рейтинга 0-100 |
| `update_queue_status.py` | Обновление статуса видео в очереди |
| `export_queue.py` | Экспорт очереди в CSV/JSON/Markdown |
| `video_queue_manager.py` | Полноценный менеджер очереди с CLI |

### Main Scripts (RESEARCHES/scripts/)
| Скрипт | Назначение | Экономия времени |
|--------|------------|------------------|
| `process_video.py` | Master orchestrator (Фазы 5-7) | 1.5-2ч → 5-10мин |
| `video_id_scanner.py` | Поиск следующих ID в LIBRARIES | 15-30 мин |
| `video_gap_analyzer.py` | Gap-анализ транскрипций | 30-45 мин |
| `video_json_updater.py` | Обновление JSON файлов | 45-60 мин |
| `video_integration_reporter.py` | Генерация отчётов интеграции | 20-30 мин |
| `update_video_progress.py` | Отслеживание прогресса | - |
| `analyze_video_phases.py` | Анализ статуса фаз | - |
| `generate_progress_report.py` | Генерация отчётов прогресса | - |
| `check_prompts_compliance.py` | Проверка промптов | - |
| `verify_manual_integration.py` | Проверка интеграции в LIBRARIES | - |

### Utility Files
- `config.py` - конфигурация путей и констант
- `utils.py` - общие утилиты (load_json, save_json, backup_file)
- `markdown_parser.py` - парсинг Markdown транскрипций

---

## [1.3.1] - 2025-11-28

### Verified - Video Queue Table Spec Compliance
Проверка соответствия реализации Video Queue спецификации.

#### ✅ Реализованные функции:
| Функция | Статус |
|---------|--------|
| Display videos with status badges | ✅ Implemented |
| Filter by status, department, priority | ✅ FilterPanel |
| Add videos with form validation | ✅ VideoForm + Modal |
| Edit videos (pre-filled form) | ✅ editingVideo state |
| Delete with confirmation dialog | ✅ Delete Modal |
| Search by title/channel | ✅ searchTerm filter |
| Priority badges (low/medium/high) | ✅ PriorityBadge |
| Status badges (7 статусов) | ✅ StatusBadge |
| YouTube icon + external link | ✅ Video Details column |
| Duration display | ✅ Clock icon + minutes |
| AdminRHS-AI-Catalog design | ✅ Blue theme |
| Mobile responsive | ✅ Adaptive layout |

#### 📋 Компоненты Video Queue:
- `VideoQueueTable.tsx` - основная таблица с CRUD
- `VideoForm.tsx` - форма с валидацией
- `FilterPanel.tsx` - боковая панель фильтров
- `StatusBadge.tsx` - бейджи статусов
- `Modal.tsx` - модальные окна

#### ⏸️ Отложено:
- Real-time Supabase подключение (используем mock данные)
- Пагинация (placeholder)
- Сортировка по колонкам
- Экспорт в CSV

### Verified - Filter Panel Component Spec Compliance

#### ✅ Реализованные функции:
| Функция | Статус |
|---------|--------|
| Collapsible filter sections | ✅ Accordion UI |
| Multi-select checkboxes | ✅ Checkbox component |
| Filter count badge (header) | ✅ activeFilterCount |
| Filter count badge (per section) | ✅ AccordionTrigger |
| Clear all filters button | ✅ clearAll() |
| Active Filter Pills | ✅ Footer section |
| Click-to-remove pills | ✅ onClick handler |
| AdminRHS-AI-Catalog design | ✅ Blue theme |

#### 📋 Компоненты:
- `FilterPanel.tsx` - основной компонент фильтров
- `Accordion.tsx` - сворачиваемые секции
- `Checkbox.tsx` - чекбоксы с иконкой
- `Badge.tsx` - бейджи счётчиков и пилюли

#### ⏸️ Отложено:
- Date Range filter (опционально)
- Count per option display `(24)` (закомментировано)

---

## [1.3.0] - 2025-11-28

### Added - Search Queue Page
- ✅ Новая страница **Search Queue** для управления поисковыми запросами Perplexity AI
- ✅ Типы `SearchQuery`, `SearchFormData`, `SearchStatus` в `types.ts`
- ✅ Mock данные `MOCK_SEARCHES` (8 примеров поисковых запросов)
- ✅ Константы `SEARCH_STATUS_OPTIONS` для фильтрации

### Features - SearchQueueTable Component
- 📊 Карточки статистики (Total, Pending, Searching, Completed, Failed)
- 🔍 Поиск по тексту запроса
- 🏷️ Фильтры по статусу и департаменту
- ➕ Добавление нового поискового запроса (модальное окно)
- ✏️ Редактирование существующих запросов
- 🗑️ Удаление с подтверждением
- 🏷️ Бейджи статусов с иконками:
  - `pending` - Clock (серый)
  - `searching` - Loader2 с анимацией (синий)
  - `completed` - CheckCircle (зелёный)
  - `failed` - AlertCircle (красный)

### Fixed
- 🔧 Убран горизонтальный скролл на странице Search Queue
- 📱 Адаптивная таблица с скрытием колонок на мобильных устройствах
- 📱 Респонсивная сетка статистики и фильтров

---

## [1.2.0] - 2025-11-28

### Added - Full Copy of video-queue-manager
Полная копия приложения `video-queue-manager` в `web` приложении.

### Types (`src/lib/types.ts`)
- `Priority` - low | medium | high
- `Status` - pending | selected | transcribing | transcribed | processing | complete | rejected
- `Department` - DEV | SMM | VID | AID | DGN | MKT
- `VideoQueueItem` - интерфейс для видео
- `VideoFormData` - данные формы видео
- `VideoImportRow` - строка импорта CSV
- `EntityType`, `EntityClassification`, `ExtractedEntity` - для Entity Extraction

### Constants (`src/lib/constants.ts`)
- `DEPARTMENTS`, `STATUSES`, `PRIORITIES` - константы
- `FILTER_OPTIONS` - опции фильтров
- `MOCK_VIDEOS` - 6 примеров видео
- `MOCK_STATS`, `MOCK_TREND_DATA` - статистика дашборда
- `MOCK_VIDEOS_FOR_UPLOAD` - видео для загрузки транскрипций
- `MOCK_COST_DATA` - данные трекера затрат
- `MOCK_NODES`, `MOCK_EDGES`, `NODE_COLORS` - для Knowledge Map
- `MOCK_EXTRACTED_TOOLS`, `MOCK_EXTRACTED_WORKFLOWS` - извлечённые сущности
- `BRONZE_LIBRARY_VIDEOS` - библиотека видео для импорта

### UI Components (`src/components/ui/`)
- `Card.tsx` - Card, CardHeader, CardTitle, CardContent
- `Badge.tsx` - бейджи с вариантами (default, secondary, outline, destructive)
- `Tabs.tsx` - Tabs, TabsList, TabsTrigger, TabsContent
- `Progress.tsx` - прогресс бар
- `Accordion.tsx` - Accordion, AccordionItem, AccordionTrigger, AccordionContent
- `Checkbox.tsx` - чекбокс с иконкой Check
- `Modal.tsx` - модальное окно с backdrop
- `Button.tsx` - кнопки (уже существовал)

### Page Components (`src/components/`)
- `StatusBadge.tsx` - StatusBadge, PriorityBadge
- `VideoForm.tsx` - форма добавления/редактирования видео
- `FilterPanel.tsx` - боковая панель фильтров
- `DashboardStats.tsx` - статистика с графиками Recharts
- `CostTrackerWidget.tsx` - виджет AI Cost Tracker
- `VideoQueueTable.tsx` - таблица Video Queue с CRUD
- `BulkVideoImport.tsx` - массовый импорт CSV/JSON с drag&drop
- `UploadTranscriptionScreen.tsx` - загрузка транскрипций
- `EntityExtractionViewer.tsx` - просмотр извлечённых сущностей (Tools, Workflows, Actions, Objects)
- `KnowledgeMapViewer.tsx` - визуальная карта знаний с ReactFlow

### Navigation (`src/App.tsx`)
Полная структура с сайдбаром AdminRHS-style:
1. **Dashboard** - обзор со статистикой и виджетами
2. **Video Queue** - таблица видео с фильтрами и CRUD
3. **Bulk Import** - массовый импорт из CSV/JSON
4. **Search Queue** - очередь поисковых запросов
5. **Upload Transcript** - загрузка транскрипций
6. **Entity Extraction** - просмотр Tools/Workflows/Actions/Objects
7. **Knowledge Map** - визуальная карта знаний
8. **Settings** - placeholder

### Dependencies Added
```bash
npm install react-dropzone papaparse @types/papaparse reactflow recharts
npm install @tanstack/react-table react-hook-form @hookform/resolvers zod
```

---

## [1.1.0] - 2025-11-27

### Added - Backend API
API сервер на Express.js для работы с CSV файлами.

### API Endpoints (`apps/api/server.js`)
- `GET /api/health` - проверка здоровья сервера
- `GET /api/researches` - список исследований из CSV
- `GET /api/search-queue` - очередь поисковых запросов
- `GET /api/video-queue` - очередь видео
- `POST /api/video-queue` - добавление видео
- `PUT /api/video-queue/:id` - обновление видео
- `DELETE /api/video-queue/:id` - удаление видео
- `GET /api/overview` - агрегированная статистика

### CSV Files (Data Source)
- `RESEARCHES/RESEARCHES_Master_List.csv`
- `RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- `RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

### Dependencies
```bash
npm install express cors papaparse dotenv
```

### Configuration
- `.env` файл с `DROPBOX_ROOT` и `PORT`

---

## [1.0.0] - 2025-11-27

### Initial Setup
Создание базовой структуры проекта.

### Frontend (`apps/web/`)
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Базовые компоненты UI (Button, Input)
- Структура папок:
  ```
  src/
  ├── components/
  │   └── ui/
  ├── lib/
  │   ├── types.ts
  │   ├── constants.ts
  │   ├── utils.ts
  │   └── api.ts
  ├── styles/
  │   └── index.css
  ├── App.tsx
  └── main.tsx
  ```

### Backend (`apps/api/`)
- Node.js + Express
- Структура:
  ```
  api/
  ├── server.js
  ├── package.json
  ├── .env
  └── README.md
  ```

### Styling
- AdminRHS-AI-Catalog design (blue theme)
- CSS переменные для тем
- Custom scrollbar
- Анимации (fadeIn, zoomIn, pulse)

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - type safety
- **Vite** - build tool
- **Tailwind CSS v4** - styling
- **Lucide React** - icons
- **TanStack Table** - data grid
- **React Hook Form + Zod** - forms & validation
- **Recharts** - charts
- **ReactFlow** - node-based diagrams
- **react-dropzone** - file uploads
- **papaparse** - CSV parsing

### Backend
- **Node.js** - runtime
- **Express** - web framework
- **papaparse** - CSV parsing
- **cors** - CORS middleware
- **dotenv** - environment variables

---

## Running the Project

### Frontend
```bash
cd apps/web
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd apps/api
npm install
npm run dev
# → http://localhost:3001
```

---

**Last Updated:** 2025-12-01 20:30 UTC

