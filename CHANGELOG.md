# CHANGELOG

Все изменения проекта Queue Manager (Video Queue + Search Queue).

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

**Last Updated:** 2025-11-28 12:45 UTC

