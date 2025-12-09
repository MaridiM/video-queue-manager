# Frontend Documentation

Полная документация по frontend приложению Queue Manager.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Структура проекта](#структура-проекта)
3. [Технологии](#технологии)
4. [Компоненты](#компоненты)
5. [Страницы](#страницы)
6. [API Client](#api-client)
7. [Типы и константы](#типы-и-константы)
8. [Стилизация](#стилизация)

---

## Обзор

Frontend приложение построено на **React 19** с использованием **TypeScript** и **Vite**. Приложение предоставляет современный пользовательский интерфейс для управления очередями видео и поисковых запросов.

### Основные возможности

- 📹 Управление Video Queue с фильтрацией и поиском
- 🔍 Управление Search Queue
- 📊 Dashboard с аналитикой и графиками
- ⚙️ Настройки AI провайдеров и Dropbox
- 🎨 Современный UI с Tailwind CSS
- 📱 Адаптивный дизайн

---

## Структура проекта

```
web/
├── src/
│   ├── components/          # React компоненты
│   │   ├── ui/             # Базовые UI компоненты
│   │   ├── VideoQueueTable.tsx
│   │   ├── SearchQueueTable.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── VideoForm.tsx
│   │   ├── VideoDetailView.tsx
│   │   └── ...
│   │
│   ├── pages/              # Страницы приложения
│   │   ├── Overview.tsx
│   │   ├── VideoQueue.tsx
│   │   ├── SearchQueue.tsx
│   │   └── Settings.tsx
│   │
│   ├── lib/                # Утилиты и типы
│   │   ├── api.ts         # API клиент
│   │   ├── types.ts       # TypeScript типы
│   │   ├── constants.ts   # Константы
│   │   └── utils.ts       # Утилиты
│   │
│   ├── styles/            # Стили
│   │   └── index.css
│   │
│   ├── App.tsx            # Главный компонент
│   └── main.tsx           # Точка входа
│
├── public/                # Статические файлы
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Технологии

### Основные зависимости

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "~5.9.3",
  "vite": "^7.2.4"
}
```

### UI библиотеки

```json
{
  "tailwindcss": "^4.1.17",
  "@tailwindcss/vite": "^4.1.17",
  "lucide-react": "^0.555.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

### Формы и валидация

```json
{
  "react-hook-form": "^7.66.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.13"
}
```

### Таблицы и данные

```json
{
  "@tanstack/react-table": "^8.21.3",
  "recharts": "^3.5.1",
  "reactflow": "^11.11.4"
}
```

### Утилиты

```json
{
  "react-router-dom": "^7.9.6",
  "react-dropzone": "^14.3.8",
  "papaparse": "^5.5.3"
}
```

---

## Компоненты

### UI Components (`components/ui/`)

Базовые переиспользуемые компоненты:

#### Button
```tsx
<Button variant="default" size="md">Click me</Button>
```

**Variants:** `default`, `outline`, `ghost`, `destructive`  
**Sizes:** `sm`, `md`, `lg`

#### Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  Content
</Modal>
```

#### Badge
```tsx
<Badge variant="default">Label</Badge>
```

#### StatusBadge
```tsx
<StatusBadge status="selected" />
<PriorityBadge priority="high" score={85} />
```

#### Input, Select, Textarea
Стандартные поля ввода с валидацией.

#### Card, Accordion, Tabs
Компоновочные компоненты.

---

### Feature Components

#### VideoQueueTable

Основная таблица для управления Video Queue.

**Функции:**
- Отображение списка видео
- Фильтрация по статусу, департаменту, приоритету
- Поиск по названию/каналу
- CRUD операции (Create, Read, Update, Delete)
- Синхронизация с CSV
- Экспорт данных
- Детальный просмотр видео

**Использование:**
```tsx
import { VideoQueueTable } from './components/VideoQueueTable';

<VideoQueueTable />
```

#### SearchQueueTable

Таблица для управления Search Queue.

**Функции:**
- Отображение поисковых запросов
- Фильтрация по статусу и департаменту
- Создание/редактирование/удаление запросов
- Статистика по статусам
- Синхронизация с CSV

#### FilterPanel

Боковая панель фильтров.

**Функции:**
- Фильтры по статусу, департаменту, приоритету
- Счетчики активных фильтров
- Сброс всех фильтров
- Отображение активных фильтров (pills)

#### VideoForm

Форма для добавления/редактирования видео.

**Поля:**
- Video URL (обязательное)
- Video Title (обязательное)
- Channel Name
- Duration (minutes)
- Views, Likes, Comments
- Priority (low/medium/high)
- Department
- Status
- Notes

**Валидация:**
- URL формат
- Минимальная длина названия
- Числовые поля

#### VideoDetailView

Детальный просмотр видео с транскрипцией.

**Функции:**
- Просмотр информации о видео
- Получение транскрипции с YouTube
- AI обработка транскрипции
- Pipeline визуализация
- Копирование промпта

#### DashboardStats

Виджеты статистики для Dashboard.

**Компоненты:**
- KPI карточки
- Графики распределения (Recharts)
- Тренды

#### CostTrackerWidget

Виджет отслеживания затрат на AI.

---

## Страницы

### Overview (`pages/Overview.tsx`)

Главная страница Dashboard.

**Компоненты:**
- KPI карточки (Total Researches, Pending Tasks, Videos, etc.)
- Графики распределения по департаментам
- Графики статусов видео
- Cost Tracker Widget

### VideoQueue (`pages/VideoQueue.tsx`)

Страница управления Video Queue.

**Компоненты:**
- VideoQueueTable
- FilterPanel
- Модальные окна для добавления/редактирования

### SearchQueue (`pages/SearchQueue.tsx`)

Страница управления Search Queue.

**Компоненты:**
- SearchQueueTable
- Статистика по статусам
- Форма создания запроса

### Settings (`pages/Settings.tsx`)

Страница настроек.

**Вкладки:**
- **AI Настройки** - настройка Google AI и OpenAI
- **Dropbox** - настройка Dropbox интеграции

**Функции:**
- Ввод и сохранение API ключей
- Выбор моделей AI
- Тестирование подключений
- Установка провайдера по умолчанию
- Настройка Dropbox токена

---

## API Client

### Структура (`lib/api.ts`)

Централизованный API клиент с типизацией.

**Основные функции:**

```typescript
// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit)

// Search Queue API
searchQueueAPI.getAll()
searchQueueAPI.create(data)
searchQueueAPI.update(id, data)
searchQueueAPI.delete(id)
searchQueueAPI.syncFromCSV()

// Video Queue API
videoQueueAPI.getAll()
videoQueueAPI.create(data)
videoQueueAPI.update(id, data)
videoQueueAPI.delete(id)
videoQueueAPI.syncFromCSV()
videoQueueAPI.batchUpdate(data)
videoQueueAPI.getSummary()

// Transcription API
transcriptionAPI.fetchYouTube(videoUrl)
transcriptionAPI.processWithAI(data)
transcriptionAPI.getStatus()

// Settings API
settingsAPI.get()
settingsAPI.update(settings)
settingsAPI.testConnection(provider, apiKey)

// Dropbox API
dropboxAPI.get()
dropboxAPI.update(settings)
dropboxAPI.testConnection(accessToken)
```

**Обработка ошибок:**
- Автоматическая проверка JSON ответов
- Детальные сообщения об ошибках
- Обработка сетевых ошибок

---

## Типы и константы

### Types (`lib/types.ts`)

```typescript
// Enums
type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'selected' | 'transcribing' | 'transcribed' | 'processing' | 'complete' | 'rejected';
type Department = 'DEV' | 'SMM' | 'VID' | 'AID' | 'DGN' | 'MKT';
type SearchStatus = 'Assigned' | 'In Progress' | 'Completed';

// Interfaces
interface VideoQueueItem {
  id: string;
  queue_id: string;
  video_url: string;
  video_title: string;
  channel_name?: string;
  duration_minutes: number;
  priority: Priority;
  status: Status;
  department: Department;
  // ...
}

interface SearchQuery {
  search_id: string;
  employee: string | null;
  department: Department;
  topic: string;
  search_query: string;
  status: SearchStatus;
  // ...
}
```

### Constants (`lib/constants.ts`)

```typescript
export const DEPARTMENTS = ['DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT'] as const;
export const STATUSES = ['pending', 'selected', 'transcribing', ...] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export const RESEARCH_SOURCES = ['Perplexity', 'Gemini', 'GPT', ...] as const;
```

---

## Стилизация

### Tailwind CSS v4

Приложение использует Tailwind CSS v4 с кастомной конфигурацией.

**Цветовая схема:**
- Основной: синий (`blue-600`)
- Успех: зеленый (`emerald-500`)
- Ошибка: красный (`red-500`)
- Предупреждение: желтый (`amber-500`)

**Темы:**
- Светлая тема (по умолчанию)
- Темная боковая панель

### Кастомные стили

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
  --color-secondary: #64748b;
}
```

---

## Маршрутизация

Приложение использует простую навигацию через состояние (без React Router).

**Страницы:**
- `dashboard` - Overview
- `queue` - Video Queue
- `search` - Search Queue
- `settings` - Settings

**Навигация:**
```tsx
const [currentView, setCurrentView] = useState<View>("dashboard");

<button onClick={() => setCurrentView("queue")}>
  Video Queue
</button>
```

---

## Состояние приложения

### Локальное состояние

Каждый компонент управляет своим состоянием через `useState`:

```tsx
const [data, setData] = useState<VideoQueueItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Загрузка данных

```tsx
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setIsLoading(true);
  const result = await videoQueueAPI.getAll();
  if (result.success && result.data) {
    setData(result.data);
  }
  setIsLoading(false);
};
```

---

## Формы и валидация

### React Hook Form + Zod

```tsx
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

<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register('video_url')} />
  {form.formState.errors.video_url && (
    <p>{form.formState.errors.video_url.message}</p>
  )}
</form>
```

---

## Адаптивность

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Мобильная адаптация

- Скрытие колонок таблиц на мобильных
- Адаптивные модальные окна
- Мобильное меню фильтров
- Адаптивные размеры шрифтов и отступов

---

## Производительность

### Оптимизации

- `useMemo` для фильтрации данных
- `useCallback` для обработчиков событий
- Ленивая загрузка компонентов (при необходимости)
- Оптимизация ре-рендеров

### Best Practices

- Разделение на мелкие компоненты
- Типизация всех данных
- Валидация на клиенте и сервере
- Обработка состояний загрузки и ошибок

---

**Последнее обновление:** 2025-12-02




