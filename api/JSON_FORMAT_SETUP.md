# Настройка JSON формата транскрипций v2.0

## ✅ Что было сделано

### 1. Созданы утилиты
- ✅ `apps/api/utils/transcriptionParser.js` - парсинг AI ответа в JSON схему v2.0
- ✅ `apps/api/utils/jsonValidator.js` - валидация JSON по схеме

### 2. Обновлен код
- ✅ `apps/api/server.js` - изменен для генерации JSON вместо Markdown
- ✅ `apps/api/package.json` - добавлены зависимости `ajv` и `ajv-formats`

### 3. Изменения в промптах
- ✅ SystemPrompt теперь требует JSON формат
- ✅ UserPrompt включает структуру JSON схемы v2.0
- ✅ Увеличены лимиты токенов (16000 → 32000)

---

## 🚀 Установка зависимостей

```bash
cd apps/api
npm install
```

Это установит:
- `ajv` - валидатор JSON схем
- `ajv-formats` - поддержка форматов (date, uri и т.д.)

---

## 📝 Что изменилось

### До изменений:
- ❌ Генерировался Markdown формат (`.md`)
- ❌ Результат не соответствовал JSON схеме
- ❌ Нет валидации структуры

### После изменений:
- ✅ Генерируется JSON формат (`.json`)
- ✅ Соответствует схеме `transcription_schema_v2.json`
- ✅ Автоматическая валидация перед сохранением
- ✅ Fallback структура при ошибках парсинга

---

## 🧪 Тестирование

### 1. Запустить сервер
```bash
cd apps/api
npm run dev
```

### 2. Протестировать транскрипцию
```bash
curl -X POST http://localhost:3001/api/transcription/process \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "videoTitle": "Test Video",
    "saveToFile": true
  }'
```

### 3. Проверить результат
Файл будет сохранен в:
```
ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json
```

### 4. Валидация JSON (опционально)
```bash
npx ajv validate -s apps/dev/transcriptions/transcription_schema_v2.json \
  -d ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json
```

---

## 📊 Структура JSON результата

Результат будет соответствовать схеме v2.0:

```json
{
  "video_id": "Video_001",
  "video_title": "...",
  "metadata": {
    "duration": "13:32",
    "language": "en",
    "extraction_date": "2025-01-15",
    "extractor_version": "v4.1",
    ...
  },
  "transcription": [
    {
      "start": "00:00",
      "end": "00:06",
      "text": "...",
      "annotations": []
    }
  ],
  "taxonomy_analysis": {
    "workflows": [...],
    "milestones": [...],
    "tasks": [...],
    "steps": [...],
    "action_verbs": {...},
    "tools_matrix": [...],
    ...
  },
  "processing_status": {...},
  "provenance": {...}
}
```

---

## ⚠️ Важные замечания

### 1. AI может вернуть Markdown вместо JSON
- Парсер автоматически извлекает JSON из markdown блоков
- Если JSON не найден, создается fallback структура

### 2. Валидация может показать предупреждения
- Это нормально, если некоторые опциональные поля отсутствуют
- Критические ошибки будут показаны в логах

### 3. Обратная совместимость
- Старые `.md` файлы остаются без изменений
- Новые транскрипции сохраняются как `.json`

---

## 🔧 Настройка промпта

Если нужно изменить формат вывода, отредактируйте:
- `SystemPrompt` (строка 1903 в `server.js`)
- `UserPrompt` (строка 1906 в `server.js`)

Или создайте отдельный промпт файл для JSON генерации.

---

## 📚 Дополнительная документация

- **Схема v2.0:** `apps/dev/transcriptions/transcription_schema_v2.json`
- **Пример:** `apps/dev/transcriptions/example_full_video_026.json`
- **Шаблон:** `apps/dev/transcriptions/transcription_template.json`
- **README:** `apps/dev/transcriptions/README.md`

---

## ✅ Готово к использованию!

После установки зависимостей (`npm install`) приложение готово генерировать JSON транскрипции по схеме v2.0.

