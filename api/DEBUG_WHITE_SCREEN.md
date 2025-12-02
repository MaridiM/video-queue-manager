# Отладка проблемы "белый экран"

## Возможные причины

### 1. Ошибка импорта модулей
**Симптом:** Белый экран при загрузке страницы

**Проверка:**
```bash
cd apps/api
node -e "import('./utils/transcriptionParser.js').then(m => console.log('OK')).catch(e => console.error('ERROR:', e))"
node -e "import('./utils/jsonValidator.js').then(m => console.log('OK')).catch(e => console.error('ERROR:', e))"
```

### 2. Ошибка парсинга JSON
**Симптом:** Белый экран после получения ответа от AI

**Проверка логов:**
- Откройте консоль сервера (терминал где запущен `npm run dev`)
- Ищите строки с `❌ Error parsing to JSON`
- Проверьте `aiResponsePreview` в ответе

### 3. Ошибка валидации схемы
**Симптом:** Белый экран при сохранении

**Проверка:**
- Убедитесь что файл `apps/dev/transcriptions/transcription_schema_v2.json` существует
- Проверьте логи на `⚠️ Schema file not found`

### 4. Ошибка в парсере
**Симптом:** Белый экран, ошибка в консоли браузера

**Проверка:**
1. Откройте DevTools (F12)
2. Вкладка Console - проверьте ошибки JavaScript
3. Вкладка Network - проверьте ответ API (должен быть JSON с `success: false`)

---

## Шаги отладки

### Шаг 1: Проверить логи сервера

```bash
# Запустите сервер с подробными логами
cd apps/api
npm run dev
```

При запросе транскрипции смотрите на:
- `🚀 Starting full transcription pipeline`
- `📝 Step 1: Fetching YouTube transcript...`
- `📄 Step 2: Loading PMT-004 prompt template...`
- `🤖 Step 3: Processing with...`
- `📦 Step 3.5: Parsing AI response...`
- `💾 Step 4: Saving to file...`

Если видите `❌` - это место ошибки.

### Шаг 2: Проверить ответ API

Откройте DevTools → Network → найдите запрос `/api/transcription/process`

**Если статус 500:**
- Откройте ответ - там будет JSON с описанием ошибки
- Проверьте поле `error` и `step`

**Если статус 200 но белый экран:**
- Проверьте поле `data.transcription` - возможно там ошибка
- Проверьте консоль браузера на ошибки JavaScript

### Шаг 3: Тест парсера отдельно

Создайте тестовый файл `test_parser.js`:

```javascript
import { parseAIResponseToJSON } from './utils/transcriptionParser.js';

const testResponse = `{
  "video_title": "Test",
  "metadata": {
    "duration": "10:00"
  },
  "transcription": []
}`;

const segments = [
  { startMs: 0, durationMs: 5000, text: "Hello" }
];

try {
  const result = parseAIResponseToJSON(
    testResponse,
    'test123',
    'Test Video',
    'https://youtube.com/watch?v=test123',
    'en',
    segments
  );
  console.log('✅ Parser works:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('❌ Parser error:', error);
  console.error('Stack:', error.stack);
}
```

Запустите:
```bash
node test_parser.js
```

### Шаг 4: Проверить зависимости

```bash
cd apps/api
npm list ajv ajv-formats
```

Если не установлены:
```bash
npm install
```

---

## Быстрое решение

### Если проблема в парсере:

1. **Временно отключите парсинг** - закомментируйте строки 2053-2102 в `server.js`
2. **Верните Markdown формат** - раскомментируйте старый код сохранения

### Если проблема в валидаторе:

Валидация не критична - ошибки валидации не должны ломать процесс. Если ломают, проверьте что `try-catch` вокруг валидации работает.

---

## Проверка работоспособности

### Минимальный тест:

```bash
curl -X POST http://localhost:3001/api/transcription/process \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoTitle": "Test",
    "saveToFile": false
  }' | jq .
```

Если видите JSON ответ с `success: true` - все работает.
Если `success: false` - проверьте поле `error`.

---

## Частые ошибки

### 1. "Transcription utilities not loaded properly"
**Решение:** Проверьте что файлы `utils/transcriptionParser.js` и `utils/jsonValidator.js` существуют и экспортируют функции правильно.

### 2. "Failed to parse AI response to JSON"
**Решение:** AI вернул не JSON. Проверьте `aiResponsePreview` в ответе - возможно AI вернул Markdown.

### 3. "Schema file not found"
**Решение:** Убедитесь что файл `apps/dev/transcriptions/transcription_schema_v2.json` существует.

### 4. Белый экран без ошибок в логах
**Решение:** Проблема на фронтенде. Проверьте консоль браузера (F12 → Console).

---

## Логирование для отладки

Добавьте в начало функции `parseAIResponseToJSON`:

```javascript
console.log('🔍 Parsing AI response...');
console.log('   Response length:', aiResponse.length);
console.log('   Response preview:', aiResponse.substring(0, 200));
```

Это поможет понять что именно получает парсер.


