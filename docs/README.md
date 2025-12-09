# Queue Manager - Полная документация приложения

## 📋 Содержание

1. [Обзор приложения](#обзор-приложения)
2. [Архитектура](#архитектура)
3. [Быстрый старт](#быстрый-старт)
4. [Структура проекта](#структура-проекта)
5. [Документация по разделам](#документация-по-разделам)

---

## Обзор приложения

**Queue Manager** — это веб-приложение для управления очередями видео и поисковых запросов. Приложение предназначено для автоматизации процесса исследования, транскрибирования и обработки видео-контента с использованием AI технологий.

### Основные возможности

- 📹 **Video Queue** — управление очередью видео для обработки
- 🔍 **Search Queue** — управление поисковыми запросами для Perplexity AI
- 🤖 **AI Transcription** — автоматическая транскрипция видео через Google AI (Gemini) или OpenAI
- 📊 **Dashboard** — аналитика и статистика по всем процессам
- ⚙️ **Settings** — настройка AI провайдеров и Dropbox интеграции
- 📁 **Dropbox Integration** — синхронизация данных с облачным хранилищем

### Технологический стек

#### Frontend
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Tailwind CSS v4** — стилизация
- **TanStack Table** — таблицы данных
- **React Hook Form + Zod** — формы и валидация
- **Recharts** — графики и диаграммы
- **ReactFlow** — визуализация графов знаний

#### Backend
- **Node.js** — runtime
- **Express.js** — веб-фреймворк
- **PostgreSQL** — база данных
- **Prisma ORM** — работа с БД
- **Dropbox API** — облачное хранилище
- **Google AI (Gemini)** — AI обработка
- **OpenAI GPT** — альтернативный AI провайдер

---

## Архитектура

Приложение построено по архитектуре **Client-Server**:

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │◄──────────────────────────────►│                 │
│   Frontend      │                                │    Backend      │
│   (React)       │                                │   (Express)     │
│                 │                                │                 │
└─────────────────┘                                └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │   PostgreSQL    │
                                                   │   Database      │
                                                   └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │   Dropbox API   │
                                                   │   (Cloud)       │
                                                   └─────────────────┘
```

### Компоненты системы

1. **Frontend (Web)** — React приложение с компонентной архитектурой
2. **Backend (API)** — RESTful API сервер на Express.js
3. **Database** — PostgreSQL база данных с Prisma ORM
4. **External Services**:
   - Dropbox API — файловое хранилище
   - Google AI / OpenAI — AI обработка транскрипций
   - YouTube API — получение субтитров

---

## Быстрый старт

### Предварительные требования

- Node.js 18+ и npm
- PostgreSQL 16+ (или Docker)
- Git

### Установка и запуск

#### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd apps
```

#### 2. Backend Setup

```bash
cd api
npm install

# Создайте .env файл
cp .env.example .env
# Отредактируйте .env с вашими настройками

# Запустите PostgreSQL через Docker
docker-compose up -d

# Примените миграции
npm run db:migrate

# Запустите сервер
npm run dev
```

Backend будет доступен на `http://localhost:3001`

#### 3. Frontend Setup

```bash
cd web
npm install

# Создайте .env файл (опционально)
# VITE_API_URL=http://localhost:3001

# Запустите dev сервер
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

---

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
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── lib/           # Утилиты и типы
│   │   └── styles/        # Стили
│   └── package.json
│
├── docs/                   # Документация (эта папка)
│   ├── README.md          # Общая документация
│   ├── BACKEND.md         # Backend документация
│   ├── FRONTEND.md        # Frontend документация
│   ├── ARCHITECTURE.md    # Архитектура
│   ├── API.md             # API документация
│   ├── DATABASE.md        # База данных
│   └── DEPLOYMENT.md      # Развертывание
│
├── reports/               # Отчеты и анализы
└── dev/                   # Тестовые данные
```

---

## Документация по разделам

### 📘 [BACKEND.md](./BACKEND.md)
Полная документация по backend приложению:
- Структура проекта
- API endpoints
- Сервисы и утилиты
- Конфигурация
- Интеграции (Dropbox, AI)

### 🎨 [FRONTEND.md](./FRONTEND.md)
Полная документация по frontend приложению:
- Структура компонентов
- Страницы и маршруты
- UI компоненты
- Типы и константы
- API клиент

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
Архитектура приложения:
- Общая архитектура
- Паттерны проектирования
- Потоки данных
- Интеграции

### 🔌 [API.md](./API.md)
Детальная API документация:
- Все endpoints
- Форматы запросов/ответов
- Примеры использования
- Коды ошибок

### 🗄️ [DATABASE.md](./DATABASE.md)
Схема базы данных:
- Модели данных
- Связи между таблицами
- Миграции
- Seed данные

### 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md)
Инструкции по развертыванию:
- Production сборка
- Настройка окружения
- Docker контейнеры
- CI/CD

---

## Основные функции приложения

### 1. Video Queue Management
- Добавление видео в очередь
- Редактирование и удаление
- Фильтрация по статусу, департаменту, приоритету
- Автоматический расчет приоритетного рейтинга
- Синхронизация с CSV файлами

### 2. Search Queue Management
- Создание поисковых запросов
- Управление статусами (Assigned, In Progress, Completed)
- Связь с Video Queue
- Настройки Perplexity AI

### 3. AI Transcription Pipeline
- Получение субтитров с YouTube
- Обработка через Google AI (Gemini) или OpenAI
- Применение промптов (PMT-004, PMT-010)
- Сохранение в JSON формате
- Валидация по схеме v2.0

### 4. Dashboard & Analytics
- Статистика по видео и поискам
- Распределение по департаментам
- Статусы обработки
- Графики и диаграммы

### 5. Settings & Configuration
- Настройка AI провайдеров (Google AI, OpenAI)
- Выбор моделей
- Настройка Dropbox интеграции
- Тестирование подключений

---

## Переменные окружения

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0

# Server
PORT=3001

# Dropbox Root (local fallback)
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01

# AI Providers (optional, can be set in Settings UI)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
DROPBOX_ACCESS_TOKEN=your_dropbox_token_here
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## Скрипты

### Backend

```bash
npm run dev          # Запуск dev сервера с watch mode
npm start            # Запуск production сервера
npm run db:migrate   # Применить миграции
npm run db:seed      # Заполнить тестовыми данными
npm run db:studio    # Открыть Prisma Studio
npm run db:reset     # Сбросить БД и применить миграции
```

### Frontend

```bash
npm run dev          # Запуск dev сервера
npm run build       # Production сборка
npm run preview      # Предпросмотр production сборки
npm run lint         # Линтинг кода
```

---

## Поддержка и контакты

Для вопросов и предложений создавайте Issues в репозитории проекта.

---

**Последнее обновление:** 2025-12-02




