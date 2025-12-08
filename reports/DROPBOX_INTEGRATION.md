# Анализ интеграции Dropbox API и план реализации

**ID документа:** DROPBOX-INT-001  
**Создан:** 2025-12-01  
**Статус:** Планирование  
**Цель:** Полный анализ возможностей интеграции Dropbox API и дорожная карта реализации

---

## Содержание

1. [Анализ текущей архитектуры](#1-анализ-текущей-архитектуры)
2. [Чек-лист возможностей интеграции](#2-чек-лист-возможностей-интеграции)
3. [Требования к Dropbox API](#3-требования-к-dropbox-api)
4. [План реализации](#4-план-реализации)
5. [Структура настроек](#5-структура-настроек)
6. [Шаги настройки для разработчиков](#6-шаги-настройки-для-разработчиков)

---

## 1. Анализ текущей архитектуры

### 1.1 Архитектура Backend (`apps/api/server.js`)

**Текущее состояние:**
- **Фреймворк:** Express.js (Node.js)
- **База данных:** PostgreSQL через Prisma ORM
- **Хранилище файлов:** Локальная файловая система (жёстко заданные пути)
- **Хранилище настроек:** JSON файл (`settings.json`)

**Текущий паттерн доступа к файлам:**
```javascript
// Жёстко заданные локальные пути (НЕ используется Dropbox API)
const csvPath = path.join(__dirname, '..', '..', 'ENTITIES', 'TASK_MANAGERS', 'RESEARCHES', '00_SEARCH_QUEUE', 'Search_Queue_Master.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
```

**Проблемы:**
- ❌ Файлы доступны через локальные пути файловой системы
- ❌ Нет интеграции с Dropbox API
- ❌ Жёстко заданные пути ломаются при изменении расположения папки Dropbox
- ❌ Нет облачного доступа к файлам
- ❌ Данные хранятся локально, а не в облаке Dropbox

**Текущие эндпоинты синхронизации CSV:**
- `POST /api/search-queue/sync-csv` - Читает из локального CSV
- `POST /api/video-queue/sync-csv` - Читает из локального CSV

### 1.2 Архитектура Frontend (`apps/web/src/`)

**Текущее состояние:**
- **Фреймворк:** React 18 + TypeScript + Vite
- **API клиент:** `lib/api.ts` - REST API обёртка
- **Страница настроек:** `pages/Settings.tsx` - только настройки AI

**Текущая структура настроек:**
- Только настройки AI провайдеров (OpenAI, Google AI)
- Нет конфигурации Dropbox
- Настройки хранятся в `settings.json` на backend

**Текущие операции с файлами:**
- Кнопки синхронизации CSV запускают backend эндпоинты
- Нет прямого доступа к файлам из frontend
- Все операции с файлами проходят через backend API

### 1.3 Поток данных (Текущий)

```
┌─────────────┐
│   Dropbox   │
│  (Local FS) │
└──────┬──────┘
       │
       │ fs.readFileSync()
       │ (Локальный путь)
       ▼
┌─────────────┐
│   Backend   │
│  (server.js)│
└──────┬──────┘
       │
       │ REST API
       ▼
┌─────────────┐
│  Frontend   │
│  (React)    │
└─────────────┘
```

**Проблема:** Данные текут из локальной папки Dropbox → Backend → Frontend. Нет облачного API.

### 1.4 Поток данных (Целевой)

```
┌─────────────┐
│   Dropbox   │
│   (Cloud)   │
└──────┬──────┘
       │
       │ Dropbox API
       │ (REST/HTTP)
       ▼
┌─────────────┐
│   Backend   │
│  (server.js)│
└──────┬──────┘
       │
       │ REST API
       ▼
┌─────────────┐
│  Frontend   │
│  (React)    │
└─────────────┘
```

**Цель:** Все данные доступны через Dropbox API, без локального хранилища файлов.

---

## 2. Чек-лист возможностей интеграции

### 2.1 Операции с файлами

| Операция | Текущая реализация | Интеграция Dropbox API | Приоритет |
|----------|-------------------|----------------------|-----------|
| **Чтение CSV файлов** | `fs.readFileSync()` локальный путь | `filesDownload()` API | 🔴 ВЫСОКИЙ |
| **Запись CSV файлов** | `fs.writeFileSync()` локальный путь | `filesUpload()` API | 🔴 ВЫСОКИЙ |
| **Список файлов/папок** | `fs.readdirSync()` локальный путь | `filesListFolder()` API | 🟡 СРЕДНИЙ |
| **Проверка существования файла** | `fs.existsSync()` локальный путь | `filesGetMetadata()` API | 🟡 СРЕДНИЙ |
| **Получение метаданных файла** | `fs.statSync()` локальный путь | `filesGetMetadata()` API | 🟢 НИЗКИЙ |
| **Удаление файлов** | `fs.unlinkSync()` локальный путь | `filesDelete()` API | 🟢 НИЗКИЙ |
| **Создание папок** | `fs.mkdirSync()` локальный путь | `filesCreateFolder()` API | 🟢 НИЗКИЙ |

### 2.2 Текущие операции синхронизации CSV

| Эндпоинт | Текущее поведение | Необходима интеграция Dropbox |
|----------|------------------|-------------------------------|
| `POST /api/search-queue/sync-csv` | Читает `Search_Queue_Master.csv` из локального пути | ✅ Заменить на загрузку через Dropbox API |
| `POST /api/video-queue/sync-csv` | Читает `Video_Queue_Master.csv` из локального пути | ✅ Заменить на загрузку через Dropbox API |
| Сохранение транскрипции | Записывает `Video_XXX.json` в локальный путь | ✅ Заменить на загрузку через Dropbox API |

### 2.3 Расположения хранилища данных

| Тип данных | Текущее расположение | Путь в Dropbox | Необходима интеграция |
|------------|---------------------|----------------|----------------------|
| **Search Queue CSV** | `ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv` | `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv` | ✅ |
| **Video Queue CSV** | `ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv` | `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv` | ✅ |
| **Транскрипции** | `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json` | `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json` | ✅ |
| **Файлы анализа** | `ENTITIES/TASK_MANAGERS/RESEARCHES/03_ANALYSIS/` | `/ENTITIES/TASK_MANAGERS/RESEARCHES/03_ANALYSIS/` | 🟡 Будущее |
| **Отчёты** | `ENTITIES/TASK_MANAGERS/RESEARCHES/REPORTS/` | `/ENTITIES/TASK_MANAGERS/RESEARCHES/REPORTS/` | 🟡 Будущее |

### 2.4 Область интеграции

**Фаза 1 - Критично (Немедленно):**
- ✅ Заменить операции чтения CSV на Dropbox API
- ✅ Заменить сохранение транскрипций на загрузку через Dropbox API
- ✅ Добавить токен доступа Dropbox в настройки
- ✅ Создать обёртку сервиса Dropbox

**Фаза 2 - Важно (Следующий спринт):**
- ✅ Заменить все операции записи файлов
- ✅ Добавить возможности листинга файлов
- ✅ Добавить создание папок
- ✅ Обработка ошибок и логика повторов

**Фаза 3 - Желательно (Будущее):**
- ✅ Обнаружение изменений файлов (webhooks)
- ✅ Пакетные операции
- ✅ Версионирование файлов
- ✅ Разрешение конфликтов

---

## 3. Требования к Dropbox API

### 3.1 Настройка аккаунта разработчика Dropbox

**Необходимые шаги:**

1. **Создать приложение Dropbox**
   - Перейти на: https://www.dropbox.com/developers/apps
   - Нажать "Create app"
   - Выбрать:
     - **API:** Scoped access
     - **Type:** Full Dropbox
     - **Name:** Queue Manager (или ваше имя приложения)
     - **Permission type:** Full Dropbox access

2. **Сгенерировать токен доступа**
   - После создания приложения перейти на вкладку "Permissions"
   - Включить необходимые области доступа (см. 3.2)
   - Перейти в "Settings" → "OAuth 2" → "Generate access token"
   - Скопировать токен (начинается с `sl.`)

3. **Необходимые области доступа/Разрешения**

| Область доступа | Разрешение | Необходимо для |
|----------------|-----------|----------------|
| `files.content.read` | Чтение содержимого файлов | ✅ Чтение CSV, загрузка файлов |
| `files.content.write` | Запись содержимого файлов | ✅ Запись CSV, загрузка транскрипций |
| `files.metadata.read` | Чтение метаданных файлов/папок | ✅ Проверка существования файлов, листинг |
| `files.metadata.write` | Запись метаданных файлов/папок | ✅ Создание папок, обновление файлов |
| `files.metadata.write` | Удаление файлов | ✅ Удаление файлов (опционально) |

**Примечание:** Для типа доступа "Full Dropbox" все области доступа включены автоматически.

### 3.2 Типы токенов доступа

**Вариант 1: Кратковременный токен доступа (Текущий)**
- Токен истекает через 4 часа
- Требует механизм обновления токена
- Более безопасный, но требует OAuth flow

**Вариант 2: Долгоживущий токен доступа (Рекомендуется для MVP)**
- Генерируется из консоли разработчика Dropbox
- Не истекает (если не отозван)
- Более простая реализация
- **Использовать это для начальной реализации**

**Как сгенерировать долгоживущий токен:**
1. Перейти в консоль приложения Dropbox
2. Settings → OAuth 2
3. Нажать "Generate access token"
4. Скопировать токен (начинается с `sl.`)

### 3.3 Лимиты скорости API

| Операция | Лимит скорости | Примечания |
|----------|---------------|------------|
| **Загрузка файлов** | 600 запросов/час | На пользователя |
| **Выгрузка файлов** | 600 запросов/час | На пользователя |
| **Операции с метаданными** | 600 запросов/час | На пользователя |
| **Пакетные операции** | 1000 запросов/час | На пользователя |

**Рекомендации:**
- Реализовать ограничение скорости запросов
- Кэшировать метаданные файлов
- Использовать пакетные операции когда возможно
- Добавить экспоненциальную задержку для повторов

### 3.4 Необходимые данные из Dropbox

**Пути к файлам (Формат Dropbox API):**
- Все пути начинаются с `/` (корень Dropbox)
- Пример: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`

**Файлы для доступа:**

1. **Search Queue Master CSV**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
   - Операция: Чтение (синхронизация с базой данных)
   - Частота: По требованию (нажатие кнопки)

2. **Video Queue Master CSV**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
   - Операция: Чтение (синхронизация с базой данных)
   - Частота: По требованию (нажатие кнопки)

3. **JSON файлы транскрипций**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`
   - Операция: Запись (загрузка после обработки)
   - Частота: После каждой транскрипции

4. **Файлы анализа (Будущее)**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/03_ANALYSIS/`
   - Операция: Чтение/Запись
   - Частота: По требованию

### 3.5 Необходимые эндпоинты API

**Базовый URL Dropbox API:** `https://api.dropboxapi.com/2/`

| Эндпоинт | Метод | Назначение |
|----------|-------|-----------|
| `/files/download` | POST | Загрузка содержимого файла |
| `/files/upload` | POST | Выгрузка содержимого файла |
| `/files/list_folder` | POST | Список содержимого папки |
| `/files/get_metadata` | POST | Получение метаданных файла/папки |
| `/files/create_folder` | POST | Создание папки |
| `/files/delete` | POST | Удаление файла/папки |

**Документация:** https://www.dropbox.com/developers/documentation/http/documentation

---

## 4. План реализации

### 4.1 Реализация Backend

#### Шаг 1: Установить Dropbox SDK

```bash
cd apps/api
npm install dropbox
```

#### Шаг 2: Создать сервис Dropbox

**Файл:** `apps/api/services/dropboxService.js`

```javascript
import { Dropbox } from 'dropbox';
import fs from 'fs';
import path from 'path';

class DropboxService {
  constructor(accessToken) {
    this.dbx = new Dropbox({ accessToken });
  }

  // Загрузить файл из Dropbox
  async downloadFile(dropboxPath) {
    try {
      const response = await this.dbx.filesDownload({ path: dropboxPath });
      return response.result.fileBinary.toString('utf-8');
    } catch (error) {
      throw new Error(`Dropbox download failed: ${error.message}`);
    }
  }

  // Выгрузить файл в Dropbox
  async uploadFile(dropboxPath, content, mode = 'overwrite') {
    try {
      const response = await this.dbx.filesUpload({
        path: dropboxPath,
        contents: content,
        mode: { '.tag': mode },
        autorename: false,
        mute: false
      });
      return response.result;
    } catch (error) {
      throw new Error(`Dropbox upload failed: ${error.message}`);
    }
  }

  // Проверить существование файла
  async fileExists(dropboxPath) {
    try {
      await this.dbx.filesGetMetadata({ path: dropboxPath });
      return true;
    } catch (error) {
      if (error.status === 409) return false; // Не найдено
      throw error;
    }
  }

  // Список содержимого папки
  async listFolder(dropboxPath) {
    try {
      const response = await this.dbx.filesListFolder({ path: dropboxPath });
      return response.result.entries;
    } catch (error) {
      throw new Error(`Dropbox list folder failed: ${error.message}`);
    }
  }
}

export default DropboxService;
```

#### Шаг 3: Обновить структуру настроек

**Файл:** `apps/api/settings.json`

```json
{
  "ai": {
    "openai": {
      "apiKey": "",
      "enabled": false,
      "model": "gpt-4o-mini"
    },
    "google": {
      "apiKey": "",
      "enabled": true,
      "model": "gemini-2.0-flash"
    },
    "defaultProvider": "google"
  },
  "dropbox": {
    "accessToken": "",
    "enabled": false,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES"
  }
}
```

#### Шаг 4: Обновить эндпоинты синхронизации CSV

**Заменить в `apps/api/server.js`:**

```javascript
// СТАРЫЙ КОД (локальная файловая система):
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// НОВЫЙ КОД (Dropbox API):
const dropboxService = new DropboxService(dropboxSettings.accessToken);
const csvContent = await dropboxService.downloadFile('/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv');
```

#### Шаг 5: Обновить сохранение транскрипций

**Заменить в `apps/api/server.js`:**

```javascript
// СТАРЫЙ КОД (локальная файловая система):
fs.writeFileSync(savedFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

// НОВЫЙ КОД (Dropbox API):
const dropboxPath = `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/${fileName}`;
await dropboxService.uploadFile(dropboxPath, JSON.stringify(jsonData, null, 2));
```

### 4.2 Реализация Frontend

#### Шаг 1: Обновить страницу настроек

**Файл:** `apps/web/src/pages/Settings.tsx`

Добавить новую секцию для конфигурации Dropbox:

```typescript
// Добавить секцию настроек Dropbox
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Конфигурация Dropbox</h2>
  <DropboxSettingsCard
    accessToken={settings.dropbox?.accessToken}
    enabled={settings.dropbox?.enabled}
    onSave={handleSaveDropboxToken}
    onTest={handleTestDropbox}
  />
</div>
```

#### Шаг 2: Обновить API клиент

**Файл:** `apps/web/src/lib/api.ts`

Добавить API настроек Dropbox:

```typescript
export interface DropboxSettings {
  accessToken: string;
  enabled: boolean;
  rootPath: string;
}

export const dropboxAPI = {
  getSettings: () => fetchAPI<DropboxSettings>('/api/settings/dropbox'),
  updateSettings: (settings: Partial<DropboxSettings>) => 
    fetchAPI<DropboxSettings>('/api/settings/dropbox', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  testConnection: (accessToken: string) =>
    fetchAPI<{ success: boolean }>('/api/settings/dropbox/test', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),
};
```

### 4.3 Стратегия миграции

**Фаза 1: Двойной режим (Обратная совместимость)**
- Проверить существование токена Dropbox
- Если токен существует → использовать Dropbox API
- Если токена нет → откат на локальную файловую систему
- Позволяет постепенную миграцию

**Фаза 2: Только Dropbox**
- Удалить код локальной файловой системы
- Требовать токен Dropbox в настройках
- Показывать ошибку если токен не настроен

---

## 5. Структура настроек

### 5.1 Структура файла настроек

**Файл:** `apps/api/settings.json`

```json
{
  "ai": {
    "openai": {
      "apiKey": "",
      "enabled": false,
      "model": "gpt-4o-mini",
      "availableModels": [
        { "id": "gpt-4o-mini", "name": "GPT-4o Mini", "description": "Быстрая и экономичная" },
        { "id": "gpt-4o", "name": "GPT-4o", "description": "Высокое качество" },
        { "id": "gpt-4-turbo", "name": "GPT-4 Turbo", "description": "Мощная, большой контекст" }
      ]
    },
    "google": {
      "apiKey": "",
      "enabled": true,
      "model": "gemini-2.0-flash",
      "availableModels": [
        { "id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Новейшая, самая быстрая" },
        { "id": "gemini-1.5-flash-latest", "name": "Gemini 1.5 Flash", "description": "Быстрая и экономичная" },
        { "id": "gemini-1.5-pro-latest", "name": "Gemini 1.5 Pro", "description": "Высокое качество, дороже" }
      ]
    },
    "defaultProvider": "google"
  },
  "dropbox": {
    "accessToken": "",
    "enabled": false,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": false
  }
}
```

### 5.2 Эндпоинты API настроек

**Новые эндпоинты:**

```
GET  /api/settings              - Получить все настройки (AI + Dropbox)
PUT  /api/settings              - Обновить настройки (поддерживает частичные обновления)
GET  /api/settings/ai            - Получить только настройки AI
PUT  /api/settings/ai            - Обновить настройки AI
GET  /api/settings/dropbox       - Получить только настройки Dropbox
PUT  /api/settings/dropbox       - Обновить настройки Dropbox
POST /api/settings/dropbox/test  - Тестировать подключение Dropbox
```

### 5.3 Структура UI страницы настроек

```
┌─────────────────────────────────────────────────────────┐
│  Настройки                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 Конфигурация AI                                     │
│  ├── Google AI Studio                                    │
│  │   ├── API ключ: [••••••••]                           │
│  │   ├── Модель: [Gemini 2.0 Flash ▼]                   │
│  │   └── [✓ Включено] [Тест подключения]                │
│  │                                                       │
│  └── OpenAI                                              │
│      ├── API ключ: [••••••••]                           │
│      ├── Модель: [GPT-4o Mini ▼]                       │
│      └── [○ Выключено] [Тест подключения]                │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📦 Конфигурация Dropbox                                │
│  ├── Токен доступа: [••••••••••••••]                    │
│  ├── Корневой путь: [/ENTITIES/TASK_MANAGERS/RESEARCHES]│
│  ├── Статус: [✓ Подключено] / [✗ Не подключено]         │
│  └── [Тест подключения] [Сохранить]                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Валидация настроек

**Валидация токена Dropbox:**
- Формат токена: Начинается с `sl.` (долгоживущий) или `Bearer` (OAuth)
- Минимальная длина: 20 символов
- Тестировать подключение при сохранении
- Показывать ошибку если невалидный

**Валидация корневого пути:**
- Должен начинаться с `/`
- Без завершающего слеша
- По умолчанию: `/ENTITIES/TASK_MANAGERS/RESEARCHES`

---

## 6. Шаги настройки для разработчиков

### 6.1 Настройка аккаунта разработчика Dropbox

**Шаг 1: Создать аккаунт Dropbox**
- Перейти на: https://www.dropbox.com/
- Зарегистрироваться для бесплатного аккаунта (если нужно)
- Подтвердить email адрес

**Шаг 2: Создать приложение Dropbox**

1. Перейти на: https://www.dropbox.com/developers/apps
2. Нажать кнопку **"Create app"**
3. Заполнить форму:
   - **Choose an API:** Выбрать **"Scoped access"**
   - **Choose the type of access:** Выбрать **"Full Dropbox"**
   - **Name your app:** Ввести `Queue Manager` (или ваше предпочтительное имя)
   - **App folder name:** Оставить пустым (для доступа Full Dropbox)
4. Нажать **"Create app"**

**Шаг 3: Настроить разрешения приложения**

1. В панели управления приложением перейти на вкладку **"Permissions"**
2. Включить следующие области доступа:
   - ✅ `files.content.read` - Чтение содержимого файлов
   - ✅ `files.content.write` - Запись содержимого файлов
   - ✅ `files.metadata.read` - Чтение метаданных файлов/папок
   - ✅ `files.metadata.write` - Запись метаданных файлов/папок
3. Нажать **"Submit"** для сохранения разрешений

**Шаг 4: Сгенерировать токен доступа**

1. Перейти на вкладку **"Settings"**
2. Прокрутить до раздела **"OAuth 2"**
3. Под **"Generated access token"** нажать **"Generate"**
4. **Скопировать токен** (начинается с `sl.`)
   - ⚠️ **Важно:** Сохраните этот токен безопасно. Он больше не будет показан.
   - Пример формата: `sl.B1234567890abcdefghijklmnopqrstuvwxyz`

**Шаг 5: Тестирование токена (Опционально)**

Вы можете протестировать токен используя curl:

```bash
curl -X POST https://api.dropboxapi.com/2/users/get_current_account \
  --header "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Если успешно, вы получите JSON ответ с информацией о вашем аккаунте.

### 6.2 Необходимые права доступа

**Минимальные необходимые области доступа:**

| Область доступа | Назначение | Необходимо? |
|----------------|-----------|-------------|
| `files.content.read` | Загрузка CSV файлов, чтение транскрипций | ✅ **ДА** |
| `files.content.write` | Выгрузка транскрипций, обновление CSV файлов | ✅ **ДА** |
| `files.metadata.read` | Проверка существования файлов, листинг папок | ✅ **ДА** |
| `files.metadata.write` | Создание папок, обновление метаданных файлов | 🟡 Опционально |

**Примечание:** С типом доступа "Full Dropbox" все области доступа включены автоматически.

### 6.3 Необходимые данные из Dropbox

**Пути к файлам (Формат Dropbox API):**

Все пути относительны к корню Dropbox (`/`):

1. **Search Queue CSV**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
   - Операция: Чтение
   - Частота: Синхронизация по требованию

2. **Video Queue CSV**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
   - Операция: Чтение
   - Частота: Синхронизация по требованию

3. **Файлы транскрипций**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`
   - Операция: Запись (выгрузка)
   - Частота: После каждой обработки транскрипции

4. **Файлы анализа (Будущее)**
   - Путь: `/ENTITIES/TASK_MANAGERS/RESEARCHES/03_ANALYSIS/`
   - Операция: Чтение/Запись
   - Частота: По требованию

### 6.4 Соображения безопасности

**Хранение токена:**
- ✅ Хранить токен в `settings.json` (только backend)
- ✅ Никогда не раскрывать токен frontend
- ✅ Маскировать токен в ответах API (показывать только последние 4 символа)
- ✅ Использовать переменную окружения как резерв: `DROPBOX_ACCESS_TOKEN`

**Лучшие практики безопасности токена:**
- ⚠️ Никогда не коммитить токен в Git
- ⚠️ Добавить `settings.json` в `.gitignore`
- ⚠️ Использовать переменные окружения в продакшене
- ⚠️ Ротация токена если скомпрометирован
- ⚠️ Использовать отдельные токены для dev/staging/production

**Настройка переменной окружения:**

Создать файл `.env` в `apps/api/`:

```env
DROPBOX_ACCESS_TOKEN=sl.YOUR_TOKEN_HERE
```

Обновить `server.js` для использования переменной окружения:

```javascript
const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN || dropboxSettings.accessToken;
```

### 6.5 Чек-лист тестирования

**Перед реализацией:**
- [ ] Аккаунт Dropbox создан
- [ ] Приложение Dropbox создано
- [ ] Токен доступа сгенерирован
- [ ] Токен протестирован с curl/Postman
- [ ] Необходимые файлы существуют в Dropbox
- [ ] Пути к файлам проверены

**После реализации:**
- [ ] Токен можно сохранить в настройках
- [ ] Токен можно протестировать через API
- [ ] CSV файлы можно загрузить из Dropbox
- [ ] Файлы транскрипций можно выгрузить в Dropbox
- [ ] Обработка ошибок работает (невалидный токен, файл не найден)
- [ ] Страница настроек показывает статус Dropbox

---

## 7. Чек-лист реализации

### Фаза 1: Настройка Backend ✅ ЗАВЕРШЕНО

- [x] Установить npm пакет `dropbox`
- [x] Создать `services/dropboxService.js`
- [x] Обновить структуру `settings.json` (добавить секцию `dropbox`)
- [x] Обновить функцию `loadSettings()`
- [x] Обновить функцию `saveSettings()`
- [x] Добавить эндпоинты API настроек Dropbox:
  - [x] `GET /api/settings/dropbox`
  - [x] `PUT /api/settings/dropbox`
  - [x] `POST /api/settings/dropbox/test`
- [x] Заменить операции чтения CSV на Dropbox API
- [x] Заменить сохранение транскрипций на Dropbox API
- [x] Добавить обработку ошибок и логику повторов
- [x] Добавить логирование операций Dropbox

### Фаза 2: Настройка Frontend ✅ ЗАВЕРШЕНО

- [x] Обновить `lib/api.ts` (добавить клиент Dropbox API)
- [x] Обновить `pages/Settings.tsx` (добавить секцию Dropbox)
- [x] Создать `components/DropboxSettingsCard.tsx` (встроен в Settings.tsx)
- [x] Добавить поле ввода токена (тип password)
- [x] Добавить кнопку "Тест подключения"
- [x] Добавить индикатор статуса подключения
- [x] Добавить сообщения об ошибках для неудачных операций
- [x] Обновить макет страницы настроек (разделить AI и Dropbox)

### Фаза 3: Миграция ✅ ЗАВЕРШЕНО

- [x] Реализовать двойной режим (Dropbox + локальный откат)
- [x] Протестировать с существующими данными
- [x] Мигрировать все операции с файлами
- [ ] Удалить код локальной файловой системы (оставлен как fallback)
- [x] Обновить документацию
- [x] Обновить CHANGELOG.md

---

## 8. Обработка ошибок

### Распространённые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `invalid_access_token` | Токен истёк или невалидный | Регенерировать токен в консоли Dropbox |
| `path_not_found` | Путь к файлу не существует | Проверить путь в Dropbox, проверить настройку корневого пути |
| `rate_limit_exceeded` | Слишком много API запросов | Реализовать ограничение скорости, добавить повтор с задержкой |
| `insufficient_scope` | Токену не хватает необходимых разрешений | Регенерировать токен с правильными областями доступа |
| `conflict` | Файл уже существует (выгрузка) | Использовать режим `overwrite` или обработать конфликт |

### Стратегия обработки ошибок

```javascript
try {
  const content = await dropboxService.downloadFile(path);
  return content;
} catch (error) {
  if (error.status === 401) {
    // Невалидный токен
    throw new Error('Токен доступа Dropbox невалидный. Пожалуйста, обновите его в настройках.');
  } else if (error.status === 409) {
    // Файл не найден
    throw new Error(`Файл не найден в Dropbox: ${path}`);
  } else if (error.status === 429) {
    // Лимит скорости
    throw new Error('Превышен лимит скорости Dropbox API. Пожалуйста, попробуйте позже.');
  } else {
    throw new Error(`Ошибка Dropbox: ${error.message}`);
  }
}
```

---

## 9. Соображения производительности

### Стратегия кэширования

- Кэшировать метаданные файлов (избегать повторных API вызовов)
- Кэшировать содержимое CSV (обновлять при нажатии кнопки синхронизации)
- Кэшировать листинги папок (TTL: 5 минут)

### Ограничение скорости

- Реализовать ограничение скорости запросов (макс. 10 запросов/сек)
- Использовать пакетные операции когда возможно
- Добавить экспоненциальную задержку для повторов

### Оптимизация

- Использовать `filesDownloadZip` для множественных файлов (будущее)
- Реализовать инкрементальную синхронизацию (только изменённые файлы)
- Использовать webhooks для обновлений в реальном времени (будущее)

---

## 10. Будущие улучшения

### Фаза 4: Продвинутые функции

- [ ] Dropbox webhooks (уведомления об изменениях файлов в реальном времени)
- [ ] Пакетные операции с файлами
- [ ] Поддержка версионирования файлов
- [ ] UI разрешения конфликтов
- [ ] Дашборд статуса синхронизации
- [ ] История изменений файлов
- [ ] Автоматическое планирование синхронизации

---

## 11. Резюме

### Ключевые моменты

1. **Текущее состояние:** Приложение использует локальные пути файловой системы, не Dropbox API
2. **Цель:** Полная миграция на Dropbox API, удаление всего локального хранилища файлов
3. **Реализация:** Backend сервис + UI настроек + API эндпоинты
4. **Настройки:** Раздельные секции конфигурации AI и Dropbox
5. **Безопасность:** Токен хранится безопасно, никогда не раскрывается frontend

### Следующие шаги

1. ✅ Создать приложение Dropbox и сгенерировать токен доступа
2. ✅ Реализовать backend сервис Dropbox
3. ✅ Обновить структуру настроек и API
4. ✅ Обновить страницу настроек frontend
5. ✅ Заменить операции с файлами на Dropbox API
6. ✅ Протестировать и мигрировать

---

**Статус документа:** Готов к реализации  
**Последнее обновление:** 2025-12-01  
**Следующий пересмотр:** После завершения Фазы 1
