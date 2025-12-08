# Анализ хранения токенов и настроек

**Дата анализа:** 2025-12-02  
**Статус:** Актуально

---

## 📍 Расположение файла настроек

### Основной файл настроек

**Путь:** `apps/api/settings.json`

**Определение пути в коде:**
```javascript
// apps/api/server.js:22-24
const __filename_temp = fileURLToPath(import.meta.url);
const __dirname_temp = path.dirname(__filename_temp);
const settingsFilePath = path.join(__dirname_temp, 'settings.json');
```

**Полный путь (относительно workspace):**
```
G:\Job\REMS\apps\3\work\01\apps\api\settings.json
```

**Абсолютный путь (в runtime):**
```
{__dirname}/settings.json
где __dirname = путь к apps/api/
```

---

## 🔐 Структура файла настроек

### Текущая структура `settings.json`:

```json
{
  "openai": {
    "apiKey": "",                    // OpenAI API ключ
    "enabled": false,                // Включён ли провайдер
    "model": "gpt-4o-mini"           // Модель по умолчанию
  },
  "google": {
    "apiKey": "",                    // Google AI API ключ
    "enabled": true,                 // Включён ли провайдер
    "model": "gemini-2.0-flash"      // Модель по умолчанию
  },
  "defaultProvider": "google",       // Провайдер по умолчанию
  "dropbox": {
    "accessToken": "",               // Dropbox Access Token
    "enabled": true,                 // Включена ли интеграция Dropbox
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",  // Корневой путь в Dropbox
    "configured": true               // Настроен ли Dropbox (автоматически)
  }
}
```

---

## 🔄 Загрузка и сохранение настроек

### Функция загрузки (`loadSettings()`)

**Расположение:** `apps/api/server.js:41-81`

**Логика:**
1. Проверяет существование файла `settings.json`
2. Если файл существует → загружает и парсит JSON
3. Если файла нет → создаёт дефолтные настройки из переменных окружения
4. Выполняет миграцию для старых версий настроек

**Fallback на переменные окружения:**
```javascript
// Если файл не существует, используются env переменные:
process.env.OPENAI_API_KEY
process.env.GOOGLE_AI_API_KEY
process.env.DROPBOX_ACCESS_TOKEN
```

**Код:**
```javascript
function loadSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const saved = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
      // Миграция для старых версий
      // ...
      return saved;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  // Fallback на env переменные
  return {
    openai: { apiKey: process.env.OPENAI_API_KEY || '', ... },
    google: { apiKey: process.env.GOOGLE_AI_API_KEY || '', ... },
    dropbox: { accessToken: process.env.DROPBOX_ACCESS_TOKEN || '', ... }
  };
}
```

### Функция сохранения (`saveSettings()`)

**Расположение:** `apps/api/server.js:84-86`

**Логика:**
- Сохраняет настройки в файл `settings.json`
- Форматирует JSON с отступами (2 пробела)

**Код:**
```javascript
function saveSettings(settings) {
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
}
```

---

## 🌐 API Эндпоинты для работы с настройками

### 1. Получение настроек

**Эндпоинт:** `GET /api/settings`

**Расположение:** `apps/api/server.js:2602-2629`

**Безопасность:**
- API ключи маскируются (показываются только последние 8 символов)
- Dropbox токен маскируется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "openai": {
      "apiKey": "...4o-mini",
      "enabled": false,
      "model": "gpt-4o-mini"
    },
    "google": {
      "apiKey": "...arlI0",
      "enabled": true,
      "model": "gemini-2.0-flash"
    },
    "defaultProvider": "google",
    "dropbox": {
      "accessToken": "...8MA_2JjUC5KYVLaodRFbOxctUUAwy5yx__R6IGFaEc",
      "enabled": true,
      "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
      "configured": true
    }
  }
}
```

### 2. Обновление настроек

**Эндпоинт:** `PUT /api/settings`

**Расположение:** `apps/api/server.js:2630-2701`

**Что обновляется:**
- OpenAI API ключ и настройки
- Google AI API ключ и настройки
- Провайдер по умолчанию

**Безопасность:**
- API ключи сохраняются в открытом виде в `settings.json`
- После сохранения переинициализируются AI клиенты

### 3. Настройки Dropbox

**Эндпоинты:**
- `GET /api/settings/dropbox` - получение настроек Dropbox
- `PUT /api/settings/dropbox` - обновление настроек Dropbox
- `POST /api/settings/dropbox/test` - тест подключения

**Расположение:** `apps/api/server.js:2753-2840`

**Безопасность:**
- Dropbox токен сохраняется в открытом виде в `settings.json`
- При возврате токен маскируется (последние 8 символов)

---

## 🔒 Безопасность

### ⚠️ Текущее состояние безопасности:

**Проблемы:**
1. ❌ **API ключи хранятся в открытом виде** в `settings.json`
2. ❌ **Файл не зашифрован** - любой с доступом к файлу может прочитать токены
3. ❌ **Нет шифрования** при сохранении
4. ⚠️ **Git ignore** - нужно убедиться, что `settings.json` в `.gitignore`

### ✅ Что сделано правильно:

1. ✅ API ключи маскируются при возврате через API
2. ✅ Fallback на переменные окружения (более безопасно)
3. ✅ Валидация токенов перед сохранением

---

## 📋 Рекомендации по безопасности

### 1. Добавить в `.gitignore`

Убедитесь, что `settings.json` не попадает в Git:

```gitignore
# Settings with API keys
apps/api/settings.json
```

### 2. Использовать переменные окружения (рекомендуется)

**Для production:**
- Использовать только переменные окружения
- Не хранить `settings.json` в репозитории
- Использовать секреты в CI/CD

**Пример `.env` файла:**
```env
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIzaSy...
DROPBOX_ACCESS_TOKEN=sl.u...
```

### 3. Шифрование (опционально)

Для дополнительной безопасности можно:
- Шифровать файл `settings.json` перед сохранением
- Использовать библиотеку типа `node-encrypt` или `crypto`
- Хранить ключ шифрования отдельно

### 4. Права доступа к файлу

**На Linux/Mac:**
```bash
chmod 600 apps/api/settings.json  # Только владелец может читать/писать
```

**На Windows:**
- Ограничить доступ через свойства файла
- Использовать Windows ACL

---

## 🔄 Миграция настроек

### Автоматическая миграция

Код автоматически мигрирует старые версии настроек:

**Добавление модели:**
```javascript
if (saved.google && !saved.google.model) {
  saved.google.model = 'gemini-2.0-flash';
}
```

**Добавление Dropbox настроек:**
```javascript
if (!saved.dropbox) {
  saved.dropbox = {
    accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
    enabled: !!process.env.DROPBOX_ACCESS_TOKEN,
    rootPath: '/ENTITIES/TASK_MANAGERS/RESEARCHES',
    configured: !!process.env.DROPBOX_ACCESS_TOKEN
  };
}
```

---

## 📊 Использование настроек в коде

### Где используются настройки:

1. **Инициализация AI клиентов:**
   ```javascript
   // apps/api/server.js:91-98
   const openai = aiSettings.openai.apiKey 
     ? new OpenAI({ apiKey: aiSettings.openai.apiKey })
     : null;
   
   let googleAI = aiSettings.google.apiKey 
     ? new GoogleGenerativeAI(aiSettings.google.apiKey)
     : null;
   ```

2. **Инициализация Dropbox сервиса:**
   ```javascript
   // apps/api/server.js:281 (в эндпоинтах)
   const dropboxService = getDropboxService(aiSettings.dropbox);
   ```

3. **Обработка транскрипций:**
   ```javascript
   // apps/api/server.js:1897-1930
   const provider = requestedProvider || aiSettings.defaultProvider;
   const useGoogle = provider === 'google' && googleAI && aiSettings.google.enabled;
   ```

---

## 🎯 Выводы

### Текущее хранилище:

✅ **Файл:** `apps/api/settings.json`  
✅ **Формат:** JSON (не зашифрован)  
✅ **Fallback:** Переменные окружения  
✅ **Маскирование:** При возврате через API  

### Рекомендации:

1. ✅ Добавить `settings.json` в `.gitignore`
2. ✅ Использовать переменные окружения для production
3. ⚠️ Рассмотреть шифрование для дополнительной безопасности
4. ✅ Ограничить права доступа к файлу

### Безопасность:

- **Development:** Текущий подход приемлем
- **Production:** Использовать только переменные окружения
- **CI/CD:** Использовать секреты из системы управления секретами

---

## 📝 Пример использования переменных окружения

### Создание `.env` файла:

```env
# AI Providers
OPENAI_API_KEY=sk-proj-...
GOOGLE_AI_API_KEY=AIzaSy...

# Dropbox
DROPBOX_ACCESS_TOKEN=sl.u.AGJEP-...

# Default Provider
DEFAULT_PROVIDER=google
```

### Загрузка в код:

```javascript
import 'dotenv/config';  // Уже есть в server.js:1

// Настройки автоматически загружаются из env, если settings.json не существует
```

---

**Последнее обновление:** 2025-12-02

