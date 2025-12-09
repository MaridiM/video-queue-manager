# Промпт: Frontend Architecture - Queue Manager Web App

## Цель

Создать полнофункциональное React приложение на TypeScript с современным UI для Queue Manager.

## Технический стек

- **Framework:** React 19.2.0
- **Language:** TypeScript 5.9.3
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS v4.1.17
- **UI Libraries:**
  - TanStack Table 8.21.3 - таблицы данных
  - React Hook Form 7.66.1 + Zod 4.1.13 - формы и валидация
  - Recharts 3.5.1 - графики и диаграммы
  - ReactFlow 11.11.4 - визуализация графов
  - Lucide React 0.555.0 - иконки
- **Utilities:**
  - react-router-dom 7.9.6 - маршрутизация (опционально)
  - react-dropzone 14.3.8 - загрузка файлов
  - papaparse 5.5.3 - парсинг CSV

## Структура проекта

```
web/
├── src/
│   ├── components/          # React компоненты
│   │   ├── ui/              # Базовые UI компоненты
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── VideoQueueTable.tsx
│   │   ├── SearchQueueTable.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── VideoForm.tsx
│   │   ├── VideoDetailView.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── BulkVideoImport.tsx
│   │   ├── UploadTranscriptionScreen.tsx
│   │   ├── EntityExtractionViewer.tsx
│   │   ├── KnowledgeMapViewer.tsx
│   │   └── CostTrackerWidget.tsx
│   │
│   ├── pages/               # Страницы приложения
│   │   ├── Overview.tsx
│   │   ├── VideoQueue.tsx
│   │   ├── SearchQueue.tsx
│   │   └── Settings.tsx
│   │
│   ├── lib/                 # Утилиты и типы
│   │   ├── api.ts           # API клиент
│   │   ├── types.ts         # TypeScript типы
│   │   ├── constants.ts     # Константы
│   │   └── utils.ts         # Утилиты
│   │
│   ├── styles/
│   │   └── index.css        # Глобальные стили
│   │
│   ├── App.tsx              # Главный компонент
│   └── main.tsx             # Точка входа
│
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Основные компоненты

### 1. App.tsx - Главный компонент

**Структура:**
- Sidebar навигация (AdminRHS стиль)
- Header с заголовком страницы
- Main content area с условным рендерингом страниц
- Состояние для текущего view

**Навигация:**
```typescript
type View = 
  | "dashboard"
  | "queue"
  | "search"
  | "settings";

const [currentView, setCurrentView] = useState<View>("dashboard");
```

**Sidebar стиль:**
- Темная тема (slate-900)
- Синие акценты для активных элементов
- Иконки из Lucide React
- User info внизу

### 2. API Client (lib/api.ts)

**Структура:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit)

// API модули
export const searchQueueAPI = { ... }
export const videoQueueAPI = { ... }
export const transcriptionAPI = { ... }
export const settingsAPI = { ... }
export const dropboxAPI = { ... }
export const overviewAPI = { ... }
```

**Особенности:**
- Типизированные ответы
- Обработка ошибок
- Проверка JSON формата
- Детальные сообщения об ошибках

### 3. Types (lib/types.ts)

**Основные типы:**
```typescript
type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'selected' | 'transcribing' | 'transcribed' | 'processing' | 'complete' | 'rejected';
type Department = 'DEV' | 'SMM' | 'VID' | 'AID' | 'DGN' | 'MKT';
type SearchStatus = 'Assigned' | 'In Progress' | 'Completed';

interface VideoQueueItem { ... }
interface SearchQuery { ... }
interface VideoFormData { ... }
interface ExtractedEntity { ... }
```

### 4. Constants (lib/constants.ts)

**Константы:**
```typescript
export const DEPARTMENTS = ['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'] as const;
export const STATUSES = ['pending', 'selected', ...] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export const RESEARCH_SOURCES = ['Perplexity', 'Gemini', 'GPT', ...] as const;
```

### 5. UI Components (components/ui/)

#### Button
```typescript
<Button variant="default" size="md">Click me</Button>
```
**Variants:** `default`, `outline`, `ghost`, `destructive`  
**Sizes:** `sm`, `md`, `lg`

#### Modal
```typescript
<Modal isOpen={isOpen} onClose={onClose} title="Title" size="lg">
  Content
</Modal>
```
**Sizes:** `default`, `lg`, `xl`, `full`

#### StatusBadge
```typescript
<StatusBadge status="selected" />
<PriorityBadge priority="high" score={85} />
```

#### Input, Select, Textarea
Стандартные поля с валидацией и error states.

### 6. VideoQueueTable Component

**Функции:**
- Отображение таблицы видео с TanStack Table
- Фильтрация по статусу, департаменту, приоритету
- Поиск по названию/каналу
- CRUD операции (модальные окна)
- Синхронизация с CSV
- Экспорт данных
- Детальный просмотр видео

**Состояние:**
```typescript
const [data, setData] = useState<VideoQueueItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [filters, setFilters] = useState<FilterState>({...});
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingVideo, setEditingVideo] = useState<VideoQueueItem | null>(null);
```

**Таблица колонки:**
- Video Details (title, channel, duration)
- Department
- Status
- Priority
- Added By / Date
- Actions (Edit, Delete)

### 7. SearchQueueTable Component

**Функции:**
- Отображение поисковых запросов
- Статистика по статусам
- Фильтрация и поиск
- CRUD операции
- Синхронизация с CSV

**Статистика:**
- Total Searches
- Pending
- In Progress
- Completed

### 8. FilterPanel Component

**Функции:**
- Сворачиваемые секции (Accordion)
- Multi-select чекбоксы
- Счетчики активных фильтров
- Кнопка "Clear All"
- Отображение активных фильтров (pills)

**Секции:**
- Status filters
- Department filters
- Priority filters

### 9. VideoForm Component

**Поля формы:**
- Video URL (required, URL validation)
- Video Title (required, min 3 chars)
- Channel Name (optional)
- Duration Minutes (required, number)
- Views, Likes, Comments (optional, numbers)
- Publish Date (optional, date)
- Priority (required, select)
- Department (required, select)
- Status (required, select)
- Notes (optional, textarea)

**Валидация:**
- Zod schema для валидации
- React Hook Form для управления формой
- Отображение ошибок под полями

### 10. VideoDetailView Component

**Функции:**
- Просмотр детальной информации о видео
- Получение транскрипции с YouTube
- AI обработка транскрипции
- Pipeline визуализация (шаги процесса)
- Копирование промпта
- Выбор AI провайдера

**Pipeline Steps:**
1. Captions (YouTube transcript)
2. AI Processing
3. Save to File

### 11. DashboardStats Component

**Виджеты:**
- KPI карточки (Total Researches, Pending Tasks, Videos, etc.)
- Pie Chart - распределение по департаментам (Recharts)
- Bar Chart - распределение по статусам (Recharts)
- Cost Tracker Widget

### 12. Settings Page

**Вкладки:**
- **AI Настройки**
  - Google AI карточка
  - OpenAI карточка
  - Выбор модели
  - Тестирование подключения
  - Установка провайдера по умолчанию

- **Dropbox**
  - Ввод токена доступа
  - Тестирование подключения
  - Отображение root path
  - Инструкции по получению токена

**ProviderCard компонент:**
- Статус настройки (configured/enabled)
- Превью API ключа (маскирование)
- Выбор модели
- Toggle включения/выключения
- Кнопка "Сделать основным"

### 13. Styling (Tailwind CSS v4)

**Цветовая схема:**
- Primary: `blue-600`
- Success: `emerald-500`
- Error: `red-500`
- Warning: `amber-500`
- Dark sidebar: `slate-900`

**Кастомные стили (index.css):**
```css
/* Анимации */
@keyframes fadeIn { ... }
@keyframes zoomIn { ... }
@keyframes pulse { ... }

/* Кастомный скроллбар */
::-webkit-scrollbar { ... }

/* CSS переменные */
:root {
  --color-primary: #2563eb;
}
```

### 14. Адаптивность

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Мобильная адаптация:**
- Скрытие колонок таблиц на мобильных
- Адаптивные модальные окна
- Мобильное меню фильтров
- Адаптивные размеры шрифтов и отступов

### 15. Формы и валидация

**React Hook Form + Zod:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  video_url: z.string().url('Must be a valid URL'),
  video_title: z.string().min(3, 'Title must be at least 3 characters'),
  duration_minutes: z.number().min(1)
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### 16. Таблицы (TanStack Table)

**Настройка:**
```typescript
import { useReactTable, getCoreRowModel, ... } from '@tanstack/react-table';

const table = useReactTable({
  data: filteredData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 15 } }
});
```

**Функции:**
- Сортировка по колонкам
- Фильтрация
- Пагинация
- Адаптивные колонки

### 17. Графики (Recharts)

**Pie Chart:**
```typescript
import { PieChart, Pie, Cell } from 'recharts';

<PieChart>
  <Pie data={data} dataKey="value" label={...}>
    {data.map((_, index) => (
      <Cell key={index} fill={COLORS[index]} />
    ))}
  </Pie>
</PieChart>
```

**Bar Chart:**
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

<BarChart data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#3b82f6" />
</BarChart>
```

### 18. Обработка состояний

**Загрузка:**
```typescript
if (isLoading) {
  return <Loader2 className="animate-spin" />;
}
```

**Ошибки:**
```typescript
if (error) {
  return (
    <div className="bg-red-50 text-red-700">
      <AlertCircle />
      {error}
    </div>
  );
}
```

**Пустые состояния:**
```typescript
if (data.length === 0) {
  return (
    <div className="text-center">
      <p>No data found</p>
      <Button onClick={handleAdd}>Add New</Button>
    </div>
  );
}
```

## Vite Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

## Требования к реализации

1. Все компоненты должны быть типизированы
2. Обработка состояний загрузки и ошибок
3. Валидация форм на клиенте
4. Адаптивный дизайн для всех экранов
5. Доступность (accessibility)
6. Оптимизация ре-рендеров (useMemo, useCallback)
7. Консистентный UI стиль (AdminRHS theme)
8. Обработка edge cases (пустые данные, ошибки сети)

## UI/UX Требования

1. **Цветовая схема:**
   - Темная боковая панель (slate-900)
   - Светлый основной контент (white/slate-50)
   - Синие акценты для активных элементов
   - Зеленый для успешных операций
   - Красный для ошибок

2. **Типографика:**
   - Заголовки: font-bold, text-xl/2xl
   - Основной текст: text-sm/base
   - Мелкий текст: text-xs

3. **Отступы:**
   - Контейнеры: p-4/p-6
   - Элементы: gap-2/gap-4
   - Секции: space-y-4/space-y-6

4. **Интерактивность:**
   - Hover эффекты на кнопках и ссылках
   - Transition анимации
   - Loading states
   - Disabled states

5. **Модальные окна:**
   - Backdrop с blur
   - Центрирование
   - Закрытие по ESC или клику вне
   - Анимация появления

## Тестирование

После генерации кода проверить:
- Все компоненты рендерятся без ошибок
- Формы валидируются корректно
- API запросы работают
- Фильтры и поиск функционируют
- Адаптивность на разных экранах
- Состояния загрузки и ошибок отображаются




