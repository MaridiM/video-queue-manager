# CHANGELOG

Все изменения проекта Queue Manager (Video Queue + Search Queue).

---

## [1.11.0] - 2025-12-02

### Added - Game Academy Design System Integration

Применена полная дизайн-система Game Academy ко всему приложению.

#### 🎨 Дизайн-система:

**Цветовая палитра (`apps/web/src/styles/index.css`):**
- Обновлены CSS переменные согласно Game Academy Design System
- Primary цвета: #2563EB с полной палитрой от 50 до 900
- Secondary/Neutral цвета для текста и фона
- Semantic цвета: success, warning, error, info
- Department цвета: designers (#6D28D9), developers (#147857), managers (#DC2626), marketers (#EC4899), videographers (#F97316)
- Priority цвета с градациями от critical до veryLow

**Типографика:**
- Шрифт изменен с Inter на Roboto
- Добавлен Google Fonts импорт для Roboto (300, 400, 500, 600, 700)
- Обновлены стили заголовков (h1-h5) согласно дизайн-системе
- Line heights и letter spacing соответствуют спецификации

**Компоненты UI:**

**Button (`apps/web/src/components/ui/Button.tsx`):**
- Обновлены все варианты: primary, secondary, outline, ghost, destructive
- Добавлены hover эффекты с translateY(-1px) и увеличенной тенью
- Border radius: 8px (соответствует дизайн-системе)
- Transitions: 300ms ease-in-out
- Focus states с ring эффектом

**Card (`apps/web/src/components/ui/Card.tsx`):**
- Border radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.10)
- Hover эффект: translateY(-2px) с увеличенной тенью
- Использует CSS переменные для цветов

**StatusBadge (`apps/web/src/components/ui/StatusBadge.tsx`):**
- Обновлены цвета для всех статусов согласно дизайн-системе
- Department badges используют правильные цвета из палитры
- Priority badges с градациями на основе score (0-100)
- Border radius: 9999px (full)

**Input (`apps/web/src/components/ui/Input.tsx`):**
- Border radius: 8px
- Focus state с shadow: 0 0 0 3px rgba(37,99,235,0.1)
- Hover state с изменением border цвета
- Использует CSS переменные для всех цветов

**Select (`apps/web/src/components/ui/Select.tsx`):**
- Обновлен dropdown arrow icon
- Стили соответствуют Input компоненту
- Правильные focus и hover states

**Textarea (`apps/web/src/components/ui/Textarea.tsx`):**
- Min height: 120px
- Resize: vertical
- Стили соответствуют Input компоненту

**Dialog (`apps/web/src/components/ui/Dialog.tsx`):**
- Backdrop: rgba(0,0,0,0.6) с blur(4px)
- Border radius: 12px
- Shadow: 0 10px 30px rgba(0,0,0,0.15)
- Анимация: slideUp + fadeIn (300ms)
- Header и Footer с правильными отступами и границами

**Layout (`apps/web/src/App.tsx`):**
- Sidebar обновлен: белый фон вместо темного
- Активные элементы: rgba(37,99,235,0.15) background
- Hover states с правильными цветами
- Header с правильными z-index и shadow
- Max width контента: 1280px

**Анимации (`apps/web/src/styles/index.css`):**
- Добавлены все keyframes из дизайн-системы:
  - fadeIn, fadeOut
  - slideUp, slideDown
  - slideInRight, slideInLeft
  - scaleIn, scaleOut
  - spin, pulse, fluidWave
- Transitions: fast (150ms), normal (300ms), slow (500ms)
- Поддержка prefers-reduced-motion

**Accessibility:**
- Focus-visible стили с outline и border-radius
- Правильные z-index значения (dropdown: 1000, modal: 1050, tooltip: 1070)
- Semantic HTML структура

**Файлы изменены:**
- `apps/web/index.html` - добавлен Roboto шрифт
- `apps/web/src/styles/index.css` - полное обновление CSS переменных и анимаций
- `apps/web/src/lib/designSystem.ts` - новый файл с конфигурацией дизайн-системы
- `apps/web/src/components/ui/Button.tsx` - обновлены стили
- `apps/web/src/components/ui/Card.tsx` - обновлены стили
- `apps/web/src/components/ui/StatusBadge.tsx` - обновлены цвета и стили
- `apps/web/src/components/ui/Input.tsx` - обновлены стили
- `apps/web/src/components/ui/Select.tsx` - обновлены стили
- `apps/web/src/components/ui/Textarea.tsx` - обновлены стили
- `apps/web/src/components/ui/Dialog.tsx` - обновлены стили
- `apps/web/src/App.tsx` - обновлен layout и sidebar

**Reference:**
- Video Catalog: https://adminrhs.github.io/Video-catalog/
- Design System: https://adminrhs.github.io/Design-system/

---

## [1.10.0] - 2025-12-02

### Added - New Video Catalog UI (Отменено)

Полностью переделан интерфейс Video Queue в стиле современного видео-каталога (изменения отменены).

#### 🎨 Новый дизайн:

**VideoCard Component (`apps/web/src/components/VideoCard.tsx`):**
- YouTube thumbnail preview с автоматическим получением изображений
- Duration badge на превью видео
- Quick actions при hover: Add to queue, Save to Watch Later, Share
- Play overlay с красивой анимацией
- Channel avatar с инициалами
- Status, Department и Priority badges
- Views, Likes и дата публикации
- Hover эффекты и плавные анимации

**VideoQueueCatalog Component (`apps/web/src/components/VideoQueueCatalog.tsx`):**
- Grid layout с карточками видео (3 колонки на desktop)
- Category tabs: All, Developers, Designers, Marketers, Videographers, Social Media, AI & Data
- Grid/List view toggle для переключения режимов отображения
- Gradient header banner с красивым фоном
- Enhanced stats cards с градиентами и иконками
- Collapsible filters panel
- Search with real-time filtering
- Empty state с призывом к действию

#### 🐛 Исправления (API Error Handling):

**Global Error Handler (`apps/api/server.js`):**
- Добавлен middleware для установки `Content-Type: application/json` для всех API routes
- Глобальный обработчик ошибок с корректным JSON форматом
- 404 handler для неизвестных маршрутов
- Специальная обработка ошибок Prisma (P1001, P1002, P1003 - database connection)
- Исправлена ошибка "Invalid response format. Expected JSON, got text/plain"
- Все endpoint'ы теперь используют `next(error)` для передачи ошибок в глобальный handler

**Файлы изменены:**
- `apps/web/src/components/VideoCard.tsx` - новый компонент карточки видео
- `apps/web/src/components/VideoQueueCatalog.tsx` - новый компонент каталога видео
- `apps/web/src/App.tsx` - интеграция VideoQueueCatalog
- `apps/api/server.js` - улучшена обработка ошибок, добавлены middleware

---

## [1.9.3] - 2025-12-02

### Fixed - Google AI Rate Limit Error (429) Handling

Исправлена обработка ошибки 429 (Too Many Requests) от Google AI API с добавлением автоматических повторов.

#### 🐛 Исправления:

**Rate Limit Error Handling (`apps/api/server.js`):**
- Добавлена специальная обработка ошибки 429 (Too Many Requests)
- Реализован автоматический retry с экспоненциальной задержкой (до 3 попыток)
- Улучшены сообщения об ошибках для пользователя
- Добавлена обработка ошибок аутентификации (401/403)

**Retry Logic:**
- Автоматические повторы при ошибке 429
- Экспоненциальная задержка: 1s, 2s, 4s (максимум 10s)
- Максимум 3 попытки перед возвратом ошибки
- Логирование каждой попытки повтора

**Улучшенные сообщения об ошибках:**
- **Rate Limit (429):** Понятное сообщение с рекомендацией подождать
- **Authentication (401/403):** Указание проверить API ключ в Settings
- **Generic Errors:** Детальная информация об ошибке

**Пример ответа при ошибке 429:**
```json
{
  "success": false,
  "error": "Rate limit exceeded for Google AI. Please wait a few minutes and try again.",
  "step": "ai_processing",
  "provider": "google",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60,
  "details": "The AI service is temporarily unavailable due to too many requests. Please try again in a few minutes.",
  "retriesAttempted": 3
}
```

**Файлы изменены:**
- `apps/api/server.js` - добавлена retry логика и улучшена обработка ошибок Google AI

---

## [1.9.2] - 2025-12-02

### Fixed - Google AI Processing Error & Complete Dropbox Integration

Исправлена ошибка при обработке транскрипций через Google AI и завершена миграция всех файловых операций на Dropbox API.

#### 🐛 Исправления:

**Google AI Processing (`apps/api/server.js`):**
- Исправлена обработка ответа от Google Generative AI
- Добавлена поддержка различных форматов ответа от Google AI API
- Улучшена обработка ошибок при извлечении текста из ответа
- Добавлены fallback методы для получения текста ответа

**Проблема была в:**
- `result.response.text()` может быть асинхронным или недоступным в некоторых случаях
- Не все форматы ответа Google AI обрабатывались корректно

**Решение:**
- Добавлена проверка различных способов получения текста из ответа
- Поддержка `result.response.text()`, `result.response.text`, `result.response.candidates[0].content.parts[0].text`
- Улучшена обработка ошибок с детальными сообщениями

#### ✅ Завершена миграция на Dropbox API:

**Промпты (PMT-004, PMT-010):**
- ✅ `GET /api/prompts/:promptId` - загрузка промпта из Dropbox с fallback на локальный файл
- ✅ `GET /api/prompts` - список промптов из Dropbox с fallback на локальные файлы
- ✅ `POST /api/transcription/process` - загрузка промпта из Dropbox перед обработкой

**Пути в Dropbox:**
- PMT-004: `/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md`
- PMT-010: `/ENTITIES/PROMPTS/PMT-010_Complete_Workflow_Full.md`
- Все промпты: `/ENTITIES/PROMPTS/`

**Реализация:**
- Используется `getDropboxService()` для получения экземпляра DropboxService
- Если Dropbox включён и токен валиден → загрузка из Dropbox
- Если Dropbox отключён или ошибка → fallback на локальные файлы
- В ответе API указывается `source: 'dropbox' | 'local'`

#### 📊 Статус интеграции Dropbox:

**Полностью мигрировано:**
- ✅ CSV синхронизация (Search Queue, Video Queue)
- ✅ Сохранение транскрипций
- ✅ Загрузка промптов (PMT-004, PMT-010 и другие)

**Осталось локальным (не критично):**
- ⚠️ Настройки приложения (`settings.json`) - можно оставить локальным

#### 📝 Анализ:

Создан документ `apps/reports/DROPBOX_INTEGRATION_ANALYSIS.md` с полным анализом:
- Текущее состояние интеграции
- Детальный анализ каждой операции
- Известные проблемы и решения
- Чек-лист миграции

**Файлы изменены:**
- `apps/api/server.js` - исправлена обработка Google AI, мигрированы промпты на Dropbox
- `apps/reports/DROPBOX_INTEGRATION_ANALYSIS.md` - создан анализ интеграции

---

## [1.9.1] - 2025-12-02

### Fixed - Video Queue Sync White Screen & Dropbox Integration Verification

Исправлена проблема с белым экраном при синхронизации Video Queue и улучшена обработка ответов от Dropbox API.

#### 🐛 Исправления:

**Backend (`apps/api/server.js`):**
- Исправлен ответ API для sync-csv эндпоинтов - теперь всегда возвращается `csvPath`
- Добавлено поле `source` в ответ для указания источника данных ('dropbox' или 'local')
- Улучшена обработка путей для Dropbox и локальных файлов

**Frontend (`apps/web/src/components/VideoQueueTable.tsx`, `SearchQueueTable.tsx`):**
- Исправлена ошибка при отображении результата синхронизации (белый экран)
- Обновлён интерфейс `SyncCSVResult` для поддержки опциональных полей
- Добавлена проверка существования `csvPath` перед отображением
- Улучшено отображение источника данных (Dropbox или Local File)

**API Interface (`apps/web/src/lib/api.ts`):**
- Обновлён интерфейс `SyncCSVResult`:
  - `source` - опциональное поле ('dropbox' | 'local')
  - `csvPath` - опциональное поле (путь к файлу)
  - `errors` - поддержка как `searchId`, так и `queueId` в ошибках

#### ✅ Проверка интеграции Dropbox:

**Текущее состояние:**
- ✅ Backend проверяет наличие Dropbox токена и включён ли он
- ✅ Если Dropbox включён и токен валиден → данные загружаются из Dropbox API
- ✅ Если Dropbox отключён или ошибка → автоматический fallback на локальные файлы
- ✅ В ответе API указывается источник данных (`source: 'dropbox' | 'local'`)

**Логирование:**
- В консоли backend видно, откуда загружаются данные:
  - `📥 Attempting to download ... from Dropbox...`
  - `✅ ... loaded from Dropbox` или `📁 ... loaded from local file`

**Файлы изменены:**
- `apps/api/server.js` - исправлены ответы sync-csv эндпоинтов
- `apps/web/src/lib/api.ts` - обновлён интерфейс SyncCSVResult
- `apps/web/src/components/VideoQueueTable.tsx` - исправлена обработка результата синхронизации
- `apps/web/src/components/SearchQueueTable.tsx` - обновлено отображение источника данных

---

## [1.9.0] - 2025-12-02

### Added - Full Dropbox API Integration

Реализована полная интеграция с Dropbox API для файловых операций. Теперь все данные могут загружаться из облака Dropbox.

#### 🚀 Новые возможности:

**DropboxService Module (`apps/api/services/dropboxService.js`):**
- Создан отдельный модуль для работы с Dropbox API
- Поддержка всех основных операций:
  - `downloadFile()` - загрузка файлов из Dropbox
  - `uploadFile()` - выгрузка файлов в Dropbox
  - `listFolder()` / `listFolderAll()` - список файлов в папке
  - `fileExists()` - проверка существования файла
  - `getMetadata()` - получение метаданных файла
  - `createFolder()` - создание папки
  - `delete()` - удаление файла/папки
  - `testConnection()` - тест подключения
- Автоматическая очистка и валидация токена
- Подробный парсинг ошибок Dropbox API
- Singleton паттерн для переиспользования экземпляра

**Миграция файловых операций:**
- `POST /api/search-queue/sync-csv` - загрузка CSV из Dropbox
- `POST /api/video-queue/sync-csv` - загрузка CSV из Dropbox  
- `POST /api/transcription/process` - сохранение транскрипций в Dropbox

**Fallback механизм:**
- Если Dropbox недоступен или отключён, используются локальные файлы
- Автоматическое переключение при ошибках Dropbox API
- В ответе API указывается источник данных (`source: 'dropbox' | 'local'`)

#### 📦 Установленные зависимости:

```bash
npm install dropbox
```

#### 🔧 Технические детали:

**Пути к файлам в Dropbox:**
- Search Queue CSV: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- Video Queue CSV: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
- Транскрипции: `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`

**Файлы изменены:**
- `apps/api/package.json` - добавлен пакет `dropbox`
- `apps/api/services/dropboxService.js` - новый модуль (создан)
- `apps/api/server.js` - интеграция DropboxService во все файловые операции

#### 📝 Как использовать:

1. Настройте Dropbox токен в UI (Settings → Dropbox)
2. Включите интеграцию (переключатель "Enabled")
3. Нажмите "Тест подключения" для проверки
4. Все операции синхронизации теперь используют Dropbox API

#### ⚠️ Важно:

- Токен должен иметь права на чтение/запись файлов
- При ошибках Dropbox автоматически используются локальные файлы
- Логи показывают источник данных (Dropbox или локальный)

---

## [1.8.2] - 2025-12-02

### Changed - Dropbox Settings UI Improvements

Улучшен интерфейс настроек Dropbox для более удобного использования.

#### 🎨 UI Изменения:

**Удалено:**
- Удалён верхний блок для вставки токена (дублировал функциональность)

**Добавлено:**
- Кнопка "Тест подключения" в карточке DropboxSettingsCard для тестирования сохранённого токена
- Кнопка доступна даже когда токен не редактируется (использует сохранённый токен)
- Визуальная индикация результата теста (успех/ошибка)

**Улучшено:**
- Упрощён интерфейс - теперь только одна карточка с настройками Dropbox
- Тестирование сохранённого токена работает без необходимости вводить токен заново
- Backend автоматически использует сохранённый токен при тестировании, если токен не передан

**Файлы изменены:**
- `apps/web/src/pages/Settings.tsx` - удалён верхний блок, добавлена кнопка теста в карточку
- `apps/api/server.js` - улучшена логика тестирования (использование сохранённого токена)

---

## [1.8.1] - 2025-12-02

### Fixed - Dropbox Token Validation & Error Handling

Исправлена ошибка `invalid_access_token` при тестировании подключения к Dropbox.

#### 🔧 Исправления:

**Backend (`apps/api/server.js`):**
- Добавлена очистка токена от лишних пробелов, кавычек и символов новой строки
- Добавлена валидация формата токена (должен начинаться с `sl.`)
- Добавлена проверка минимальной длины токена
- Улучшена обработка ошибок Dropbox API с детальным парсингом ответов
- Добавлено логирование для отладки проблем с токенами
- Токен очищается перед сохранением в настройках

**Frontend (`apps/web/src/pages/Settings.tsx`):**
- Добавлена очистка токена перед отправкой на тестирование
- Улучшена валидация токена на клиенте

#### 📝 Анализ проблемы:

**Причины ошибки `invalid_access_token`:**
1. Лишние пробелы или символы новой строки в токене
2. Кавычки вокруг токена (при копировании из некоторых источников)
3. Некорректный формат токена (не начинается с `sl.`)
4. Слишком короткий токен

**Решение:**
- Автоматическая очистка токена от лишних символов
- Валидация формата перед отправкой запроса
- Детальные сообщения об ошибках для пользователя

---

## [1.8.0] - 2025-12-02

### Added - Dropbox Settings UI & Backend API

Реализована страница настроек Dropbox с возможностью добавления токена доступа.

#### 🖥️ Frontend (Settings Page):

**Обновления UI:**
- Добавлены вкладки (Tabs) на странице Settings: "AI Настройки" и "Dropbox"
- Новый компонент `DropboxSettingsCard` для управления токеном
- Блок для вставки токена доступа с валидацией (проверка `sl.` префикса)
- Кнопки "Сохранить токен" и "Тест подключения"
- Подробные инструкции по получению токена из Dropbox Developer Console
- Состояния загрузки и отображение ошибок

**Файлы изменены:**
- `apps/web/src/pages/Settings.tsx` - добавлены табы и Dropbox UI
- `apps/web/src/lib/api.ts` - добавлены интерфейсы и методы для Dropbox API

#### ⚙️ Backend (API Endpoints):

**Новые эндпоинты:**
```
GET  /api/settings/dropbox       - Получить настройки Dropbox
PUT  /api/settings/dropbox       - Обновить настройки Dropbox  
POST /api/settings/dropbox/test  - Тестировать подключение к Dropbox
```

**Реализация:**
- Эндпоинт тестирования вызывает Dropbox API `/2/users/get_current_account`
- Токен сохраняется в `settings.json` (секция `dropbox`)
- Токен маскируется в ответах API (показываются только последние 8 символов)
- Автоматическая миграция старых настроек (добавление секции `dropbox`)

**Файлы изменены:**
- `apps/api/server.js` - добавлены Dropbox API endpoints

---

## [1.7.0] - 2025-12-01

### Added - Dropbox Integration Analysis & Implementation Plan

Создан полный анализ возможностей интеграции Dropbox API и план реализации.

#### 📄 Новый документ: `apps/reports/DROPBOX_INTEGRATION.md`

**Содержание:**
- Анализ текущей архитектуры backend и frontend
- Чек-лист возможностей интеграции Dropbox API
- Требования к Dropbox API (scopes, permissions, rate limits)
- Пошаговый план реализации
- Структура настроек (разделение AI и Dropbox)
- Инструкции для разработчиков по настройке Dropbox

#### 🎯 Ключевые выводы анализа:

**Текущее состояние:**
- ❌ Приложение использует локальные пути к файлам (`fs.readFileSync()`)
- ❌ Нет интеграции с Dropbox API
- ❌ Данные хранятся локально, не в облаке Dropbox

**Цель интеграции:**
- ✅ Полная миграция на Dropbox API
- ✅ Удаление всех локальных операций с файлами
- ✅ Все данные хранятся только в Dropbox (cloud)
- ✅ Настройка токена доступа через Settings

#### 📋 План реализации:

**Phase 1 - Backend:**
- Установка `dropbox` npm пакета
- Создание `services/dropboxService.js`
- Обновление структуры `settings.json` (добавление секции `dropbox`)
- Замена CSV операций на Dropbox API
- Новые API endpoints для настроек Dropbox

**Phase 2 - Frontend:**
- Обновление страницы Settings (разделение AI и Dropbox)
- Компонент `DropboxSettingsCard` для настройки токена
- Тестирование подключения к Dropbox
- Индикатор статуса подключения

**Phase 3 - Миграция:**
- Реализация dual-mode (Dropbox + fallback на локальные файлы)
- Постепенная миграция всех операций
- Удаление кода локальной файловой системы

#### 🔐 Требования к Dropbox Developer Account:

**Шаги настройки:**
1. Создать Dropbox аккаунт
2. Создать приложение в Dropbox Developer Console
3. Выбрать "Full Dropbox" access type
4. Сгенерировать long-lived access token
5. Сохранить токен в настройках приложения

**Required Scopes:**
- `files.content.read` - чтение файлов
- `files.content.write` - запись файлов
- `files.metadata.read` - чтение метаданных
- `files.metadata.write` - запись метаданных

**Файлы для доступа:**
- `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`
- `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`

#### 📁 Структура настроек:

```json
{
  "ai": { ... },
  "dropbox": {
    "accessToken": "",
    "enabled": false,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": false
  }
}
```

#### 🔄 Новые API Endpoints:

```
GET  /api/settings/dropbox       - Получить настройки Dropbox
PUT  /api/settings/dropbox       - Обновить настройки Dropbox
POST /api/settings/dropbox/test  - Тестировать подключение
```

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

