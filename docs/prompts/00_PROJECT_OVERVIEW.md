# Промпт: Обзор проекта Queue Manager

## Цель промпта

Этот промпт предназначен для генерации полного описания проекта Queue Manager - веб-приложения для управления очередями видео и поисковых запросов с AI обработкой транскрипций.

## Контекст проекта

**Queue Manager** - это полнофункциональное веб-приложение для автоматизации процесса исследования, транскрибирования и обработки видео-контента с использованием AI технологий.

## Основные требования

### Функциональные требования

1. **Video Queue Management**
   - CRUD операции для видео в очереди
   - Автоматический расчет приоритетного рейтинга (0-100)
   - Фильтрация по статусу, департаменту, приоритету
   - Поиск по названию/каналу
   - Синхронизация с CSV файлами
   - Экспорт в CSV/JSON/Markdown

2. **Search Queue Management**
   - Управление поисковыми запросами для Perplexity AI
   - Связь с Video Queue
   - Отслеживание статусов (Assigned, In Progress, Completed)
   - Настройки Perplexity (creativity, structure mode)

3. **AI Transcription Pipeline**
   - Получение субтитров с YouTube (Innertube API)
   - Обработка через Google AI (Gemini) или OpenAI GPT
   - Применение промптов (PMT-004, PMT-010)
   - Парсинг ответов AI в JSON схему v2.0
   - Валидация JSON транскрипций
   - Сохранение в Dropbox или локальное хранилище

4. **Dashboard & Analytics**
   - Статистика по видео и поискам
   - Распределение по департаментам
   - Графики статусов обработки
   - KPI метрики

5. **Settings & Configuration**
   - Настройка AI провайдеров (Google AI, OpenAI)
   - Выбор моделей AI
   - Настройка Dropbox интеграции
   - Тестирование подключений

### Технические требования

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 16+ с Prisma ORM 7.x
- **External APIs:**
  - Dropbox API (v10.x) - файловое хранилище
  - Google AI (Gemini) - AI обработка
  - OpenAI GPT - альтернативный AI провайдер
  - YouTube Innertube API - получение субтитров

#### Frontend
- **Framework:** React 19 с TypeScript
- **Build Tool:** Vite 7.x
- **Styling:** Tailwind CSS v4
- **UI Libraries:**
  - TanStack Table - таблицы данных
  - React Hook Form + Zod - формы и валидация
  - Recharts - графики
  - ReactFlow - визуализация графов
  - Lucide React - иконки

### Архитектурные требования

1. **Client-Server Architecture**
   - RESTful API на Express.js
   - React SPA на фронтенде
   - Разделение ответственности

2. **Database Design**
   - PostgreSQL с Prisma ORM
   - Нормализованная структура
   - Индексы для оптимизации
   - Каскадные удаления где необходимо

3. **External Integrations**
   - Dropbox API с fallback на локальные файлы
   - AI провайдеры с retry логикой
   - YouTube API для субтитров

4. **Error Handling**
   - Стандартизированные форматы ошибок
   - Детальное логирование
   - Понятные сообщения для пользователя

## Структура проекта

```
apps/
├── api/                    # Backend приложение
│   ├── prisma/             # Prisma схемы и миграции
│   ├── services/           # Сервисы (Dropbox, AI)
│   ├── utils/              # Утилиты
│   ├── server.js           # Главный файл сервера
│   └── package.json
│
├── web/                    # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── lib/            # Утилиты и типы
│   │   └── styles/         # Стили
│   └── package.json
│
└── docs/                   # Документация
    └── prompts/            # Промпты для генерации
```

## Ключевые особенности

1. **Автоматический расчет приоритетного рейтинга**
   - Views (30% weight)
   - Likes (20% weight)
   - Recency (30% weight)
   - Engagement (20% weight)

2. **AI Transcription Pipeline**
   - 5 шагов: YouTube → Prompt → AI → Parse → Save
   - Retry логика для rate limits
   - Поддержка нескольких промптов

3. **Dropbox Integration**
   - Singleton паттерн для сервиса
   - Fallback на локальные файлы
   - Прозрачное переключение

4. **CSV Synchronization**
   - Двусторонняя синхронизация
   - Обработка quoted fields
   - Отслеживание изменений

## Ожидаемый результат

Полнофункциональное веб-приложение с:
- Backend API сервером на Express.js
- Frontend React приложением
- PostgreSQL базой данных
- Интеграциями с Dropbox и AI провайдерами
- Полной документацией

## Следующие шаги

Используйте следующие промпты для детальной генерации:
1. `01_BACKEND_ARCHITECTURE.md` - Backend структура и код
2. `02_FRONTEND_ARCHITECTURE.md` - Frontend структура и код
3. `03_DATABASE_SCHEMA.md` - Схема базы данных
4. `04_INTEGRATIONS.md` - Интеграции (Dropbox, AI)
5. `05_CONFIGURATION.md` - Конфигурация и развертывание




