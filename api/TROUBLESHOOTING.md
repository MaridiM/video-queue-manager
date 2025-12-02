# Устранение проблем: Белый экран при транскрипции

## 🔍 Диагностика проблемы

Если вы получаете белый экран при создании транскрипции, проверьте следующее:

### 1. Проверьте логи сервера

Откройте консоль где запущен сервер и посмотрите на ошибки:

```bash
cd apps/api
npm run dev
```

Ищите ошибки типа:
- `Error parsing AI response`
- `Failed to parse AI response to JSON`
- `Transcription utilities not loaded properly`

### 2. Проверьте установку зависимостей

```bash
cd apps/api
npm install
```

Убедитесь, что установлены:
- `ajv`
- `ajv-formats`

### 3. Проверьте наличие файлов утилит

Убедитесь, что существуют:
- `apps/api/utils/transcriptionParser.js`
- `apps/api/utils/jsonValidator.js`

### 4. Проверьте консоль браузера

Откройте DevTools (F12) и проверьте:
- **Console** - есть ли ошибки JavaScript
- **Network** - какой статус у запроса `/api/transcription/process`

### 5. Проверьте ответ API

В Network tab найдите запрос и посмотрите Response:
- Если статус 500 - смотрите `error` и `step` в ответе
- Если статус 200 - проверьте структуру `data`

---

## 🛠️ Частые проблемы и решения

### Проблема 1: Модули не загружаются

**Симптомы:**
- Ошибка: `Cannot find module './utils/transcriptionParser.js'`
- Ошибка: `Transcription utilities not loaded properly`

**Решение:**
```bash
# Проверьте структуру папок
ls apps/api/utils/

# Должны быть файлы:
# - transcriptionParser.js
# - jsonValidator.js
```

### Проблема 2: Ошибка парсинга JSON

**Симптомы:**
- Ошибка: `Failed to parse AI response to JSON`
- В логах: `No valid JSON found in AI response`

**Причина:**
AI вернул Markdown вместо JSON

**Решение:**
- Парсер автоматически пытается извлечь JSON из markdown
- Если не получается, создается fallback структура
- Проверьте промпт - он должен требовать JSON формат

### Проблема 3: Ошибка валидации схемы

**Симптомы:**
- Предупреждения: `JSON validation warnings`
- Схема не найдена: `Schema file not found`

**Решение:**
```bash
# Проверьте наличие схемы
ls apps/dev/transcriptions/transcription_schema_v2.json

# Если файла нет, скопируйте из репозитория
```

### Проблема 4: Белый экран без ошибок

**Симптомы:**
- Нет ошибок в консоли
- Запрос возвращает 200, но экран белый

**Причина:**
Возможно, фронтенд не обрабатывает новый формат ответа

**Решение:**
Проверьте структуру ответа API:
```json
{
  "success": true,
  "data": {
    "transcription": { ... },  // Теперь это объект, а не строка
    "format": "json_v2.0"
  }
}
```

---

## 🧪 Тестирование

### Тест 1: Проверка импортов

```bash
cd apps/api
node -e "import('./utils/transcriptionParser.js').then(() => console.log('OK')).catch(e => console.error('ERROR:', e))"
node -e "import('./utils/jsonValidator.js').then(() => console.log('OK')).catch(e => console.error('ERROR:', e))"
```

### Тест 2: Проверка API напрямую

```bash
curl -X POST http://localhost:3001/api/transcription/process \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=SHORT_VIDEO_ID",
    "videoTitle": "Test",
    "saveToFile": false
  }' | jq .
```

### Тест 3: Проверка логов

Включите детальные логи:
```bash
NODE_ENV=development npm run dev
```

---

## 📝 Отладка

### Включить детальные логи

В `server.js` добавьте больше console.log:

```javascript
console.log('AI Response type:', typeof aiResponse);
console.log('AI Response length:', aiResponse?.length);
console.log('AI Response preview:', aiResponse?.substring(0, 200));
```

### Проверить структуру данных

Добавьте проверки:
```javascript
console.log('Segments:', segments?.length);
console.log('Video ID:', videoId);
console.log('Video Title:', videoTitle);
```

---

## ✅ Быстрое решение

Если ничего не помогает, временно отключите JSON парсинг:

1. Закомментируйте импорты:
```javascript
// import { parseAIResponseToJSON } from './utils/transcriptionParser.js';
// import { validateTranscriptionJSON } from './utils/jsonValidator.js';
```

2. Верните старый код сохранения Markdown

3. Проверьте, работает ли базовая транскрипция

4. Затем постепенно включайте JSON функциональность

---

## 📞 Если проблема не решена

Соберите следующую информацию:

1. **Логи сервера** (полный вывод консоли)
2. **Ответ API** (из Network tab)
3. **Ошибки браузера** (из Console)
4. **Версии пакетов**: `npm list ajv ajv-formats`

И отправьте для анализа.

