# Анализ интеграции Dropbox API

**Дата анализа:** 2025-12-02  
**Статус:** Частично реализовано

---

## 📊 Текущее состояние интеграции

### ✅ Реализовано (Мигрировано на Dropbox API)

1. **Синхронизация CSV файлов:**
   - ✅ `POST /api/search-queue/sync-csv` - загрузка из Dropbox с fallback на локальный файл
   - ✅ `POST /api/video-queue/sync-csv` - загрузка из Dropbox с fallback на локальный файл

2. **Сохранение транскрипций:**
   - ✅ `POST /api/transcription/process` - сохранение в Dropbox с fallback на локальный файл

3. **Настройки Dropbox:**
   - ✅ `GET /api/settings/dropbox` - получение настроек
   - ✅ `PUT /api/settings/dropbox` - обновление настроек
   - ✅ `POST /api/settings/dropbox/test` - тест подключения

### ❌ НЕ реализовано (Всё ещё используют локальные файлы)

1. **Загрузка промптов (PMT-004, PMT-010):**
   - ❌ `GET /api/prompts/:promptId` - читает из локальной файловой системы
   - ❌ `GET /api/prompts` - список промптов из локальной файловой системы
   - ❌ `POST /api/transcription/process` - загружает промпт из локальной файловой системы

2. **Настройки приложения:**
   - ❌ `loadSettings()` - читает `settings.json` из локальной файловой системы
   - ❌ `saveSettings()` - записывает `settings.json` в локальную файловую систему

---

## 🔍 Детальный анализ

### 1. Операции с CSV файлами ✅

**Статус:** Полностью мигрировано

**Реализация:**
- Используется `getDropboxService()` для получения экземпляра DropboxService
- Если Dropbox включён и токен валиден → загрузка из Dropbox
- Если Dropbox отключён или ошибка → fallback на локальные файлы
- В ответе API указывается `source: 'dropbox' | 'local'`

**Пути в Dropbox:**
- Search Queue: `/ENTITIES/TASK_MANAGERS/RESEARCHES/00_SEARCH_QUEUE/Search_Queue_Master.csv`
- Video Queue: `/ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/Video_Queue_Master.csv`

### 2. Сохранение транскрипций ✅

**Статус:** Полностью мигрировано

**Реализация:**
- При сохранении транскрипции сначала пытается загрузить в Dropbox
- Если Dropbox недоступен → сохраняет локально
- Автоматически создаёт папку в Dropbox, если её нет
- Определяет следующий номер файла (Video_XXX.json) из существующих файлов в Dropbox

**Путь в Dropbox:**
- Транскрипции: `/ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json`

### 3. Загрузка промптов ❌

**Статус:** НЕ мигрировано - использует локальные файлы

**Текущая реализация:**
```javascript
// apps/api/server.js:1990
const promptPath = path.join(__dirname, '..', '..', 'ENTITIES', 'PROMPTS', promptFileName);
const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
```

**Проблема:**
- Промпты PMT-004 и PMT-010 загружаются из локальной файловой системы
- Нет интеграции с Dropbox API
- Если файлы не существуют локально → ошибка

**Необходимо мигрировать:**
- `GET /api/prompts/:promptId` - загрузка промпта из Dropbox
- `GET /api/prompts` - список промптов из Dropbox
- `POST /api/transcription/process` - загрузка промпта из Dropbox перед обработкой

**Пути в Dropbox:**
- PMT-004: `/ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md`
- PMT-010: `/ENTITIES/PROMPTS/PMT-010_Complete_Workflow_Full.md`

### 4. Настройки приложения ❌

**Статус:** НЕ мигрировано - использует локальные файлы

**Текущая реализация:**
```javascript
// apps/api/server.js:43
const saved = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

// apps/api/server.js:84
fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
```

**Проблема:**
- Настройки читаются и записываются в локальный файл `settings.json`
- Нет синхронизации с Dropbox

**Рекомендация:**
- Можно оставить локальное хранение настроек (они не критичны для синхронизации)
- Или мигрировать на Dropbox для централизованного управления

---

## 🐛 Известные проблемы

### Проблема 1: Ошибка при обработке через Google AI

**Описание:**
При выборе промпта (PMT-004 или PMT-010) и нажатии "Process with Google AI" возникает ошибка.

**Возможные причины:**
1. Проблема с обработкой ответа Google AI (`result.response.text()`)
2. Ошибка в промпте (слишком длинный или неправильный формат)
3. Проблема с токеном Google AI
4. Ошибка парсинга ответа

**Требуется проверка:**
- Логи сервера при ошибке
- Формат ответа от Google AI
- Обработка ошибок в коде

---

## 📋 Чек-лист миграции

### Высокий приоритет

- [ ] Мигрировать загрузку промптов на Dropbox API
  - [ ] `GET /api/prompts/:promptId` - загрузка из Dropbox
  - [ ] `GET /api/prompts` - список из Dropbox
  - [ ] `POST /api/transcription/process` - загрузка промпта из Dropbox

### Средний приоритет

- [ ] Рассмотреть миграцию настроек на Dropbox (опционально)

### Низкий приоритет

- [ ] Добавить кэширование промптов для производительности
- [ ] Добавить версионирование промптов

---

## 🎯 Выводы

1. **Интеграция Dropbox частично реализована:**
   - ✅ CSV синхронизация работает через Dropbox
   - ✅ Сохранение транскрипций работает через Dropbox
   - ❌ Загрузка промптов всё ещё использует локальные файлы

2. **Критическая проблема:**
   - Ошибка при обработке через Google AI требует немедленного исправления

3. **Рекомендации:**
   - Завершить миграцию промптов на Dropbox API
   - Исправить ошибку Google AI обработки
   - Добавить более детальное логирование для отладки

---

## 📝 Следующие шаги

1. Исправить ошибку Google AI обработки
2. Мигрировать загрузку промптов на Dropbox API
3. Протестировать все операции с Dropbox
4. Обновить документацию

