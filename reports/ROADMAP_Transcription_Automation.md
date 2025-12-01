# 🎯 ROADMAP: Автоматизация транскрипции видео

**Дата создания:** 2025-12-01  
**Статус:** Планируется  
**Приоритет:** High

---

## 📋 Текущее состояние

### Как работает сейчас (Ручной процесс)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ТЕКУЩИЙ WORKFLOW (100% ручной)                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Пользователь копирует YouTube URL                              │
│                    ↓                                                │
│  2. Открывает AI Studio (aistudio.google.com)                      │
│                    ↓                                                │
│  3. Выбирает модель Gemini                                         │
│                    ↓                                                │
│  4. Вставляет URL + прикрепляет PMT-004 файл                       │
│                    ↓                                                │
│  5. Ждёт генерации транскрипта                                     │
│                    ↓                                                │
│  6. Копирует результат                                             │
│                    ↓                                                │
│  7. Сохраняет как Video_XXX.md в 02_TRANSCRIPTIONS                 │
│                                                                     │
│  ⏱️ Время: 15-30 минут на видео                                    │
│  👤 Требует: Человека на каждом шаге                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Промпты для транскрипции

| ID | Файл | Назначение |
|----|------|------------|
| **PMT-004** | `ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md` | Главный промпт транскрипции + taxonomy extraction |
| **PMT-005** | `ENTITIES/PROMPTS/PMT-005_Video_Naming_Alternatives.md` | Профессиональные названия видео |
| **PMT-006** | `ENTITIES/PROMPTS/PMT-006_Video_Analysis.md` | Детальный анализ для taxonomy |
| **PMT-007** | `ENTITIES/PROMPTS/PMT-007_Objects_Library_Extraction.md` | Извлечение объектов |
| **PMT-009** | `ENTITIES/PROMPTS/PMT-009_Taxonomy_Integration.md` | Gap Analysis + JSON Integration |
| **PMT-090** | `ENTITIES/PROMPTS/PMT-090_YouTube_Video_Processing.md` | Инструкция AI Studio + Gemini |

---

## 🎯 Цель автоматизации

```
┌─────────────────────────────────────────────────────────────────────┐
│  ЦЕЛЕВОЙ WORKFLOW (Автоматизированный)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Пользователь нажимает "Generate Transcript" в UI               │
│                    ↓                                                │
│  2. Система автоматически:                                         │
│     - Получает субтитры YouTube (YouTube Transcript API)           │
│     - Применяет PMT-004 форматирование (AI API)                    │
│     - Генерирует структурированный Markdown                        │
│                    ↓                                                │
│  3. Пользователь скачивает готовый Video_XXX.md                    │
│                                                                     │
│  ⏱️ Время: 1-2 минуты                                              │
│  👤 Требует: 1 клик                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Варианты реализации

### Вариант 1: YouTube Captions API (Рекомендуется)

**Принцип:** Получаем автогенерированные субтитры YouTube без скачивания видео.

```
YouTube URL → youtube-transcript npm → Raw Text → AI Formatting → Markdown
```

**Плюсы:**
- ✅ Не требует скачивания видео
- ✅ Быстро (5-10 секунд на получение субтитров)
- ✅ Бесплатно (YouTube API)
- ✅ Работает для большинства видео

**Минусы:**
- ❌ Зависит от наличия субтитров на YouTube
- ❌ Качество зависит от автогенерации YouTube
- ❌ Нет timestamps для некоторых видео

**NPM пакет:** `youtube-transcript`

```bash
npm install youtube-transcript
```

**Примерный код:**

```javascript
import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  
  // transcript = [{ text: "...", offset: 1234, duration: 5000 }, ...]
  return transcript.map(t => `[${formatTime(t.offset)}] ${t.text}`).join('\n');
}
```

---

### Вариант 2: OpenAI Whisper API

**Принцип:** Скачиваем аудио, транскрибируем через Whisper.

```
YouTube URL → yt-dlp (audio) → Whisper API → Raw Text → AI Formatting → Markdown
```

**Плюсы:**
- ✅ Высокое качество транскрипции
- ✅ Работает для любого видео
- ✅ Точные timestamps

**Минусы:**
- ❌ Требует скачивания аудио
- ❌ Платно (Whisper API: $0.006/мин)
- ❌ Медленнее (нужно скачать + обработать)

**Зависимости:**
- `yt-dlp` (CLI) или `ytdl-core` (npm)
- OpenAI API key

---

### Вариант 3: Google AI Studio API (Gemini)

**Принцип:** Используем Gemini API программно вместо веб-интерфейса.

```
YouTube URL → Gemini API (with video) → Structured Markdown
```

**Плюсы:**
- ✅ Может анализировать видео напрямую
- ✅ Полный PMT-004 анализ за один вызов
- ✅ Высокое качество

**Минусы:**
- ❌ Требует Gemini API key
- ❌ Платно (по токенам)
- ❌ Может быть медленным для длинных видео

**API:** Google AI Studio / Vertex AI

---

### Вариант 4: Гибридный подход (Рекомендуется для production)

**Принцип:** YouTube Captions + OpenAI/Claude для форматирования.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ГИБРИДНЫЙ ПОДХОД                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Этап 1: Получение raw текста                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ YouTube URL → youtube-transcript → Raw captions             │   │
│  │              (бесплатно, 5 сек)                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                         ↓                                          │
│  Этап 2: AI форматирование (PMT-004)                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Raw text + PMT-004 → OpenAI/Claude API → Structured MD      │   │
│  │                      ($0.01-0.05 за видео)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                         ↓                                          │
│  Этап 3: Сохранение                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Video_XXX.md → 02_TRANSCRIPTIONS/                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ⏱️ Общее время: 30-60 секунд                                      │
│  💰 Стоимость: ~$0.02-0.05 за видео                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 План реализации

### Фаза 1: Backend API (2-3 часа)

**Файлы для создания:**

```
apps/api/
├── services/
│   └── transcriptionService.js    # Сервис транскрипции
└── server.js                       # + новые endpoints
```

**Endpoints:**

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/transcription/youtube` | Получить транскрипт по URL |
| GET | `/api/transcription/youtube/:videoId` | Получить raw субтитры |
| POST | `/api/transcription/format` | Применить PMT-004 форматирование |

**Пример transcriptionService.js:**

```javascript
import { YoutubeTranscript } from 'youtube-transcript';

// Получить raw субтитры
export async function getYouTubeTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  
  return {
    success: true,
    videoId,
    segments,
    transcript: formatWithTimestamps(segments),
  };
}

// Применить PMT-004 структуру (базовая версия без AI)
export function applyBasicFormatting(rawTranscript, metadata) {
  return `# ${metadata.title}

## Metadata
- **Video Title**: ${metadata.title}
- **Channel**: ${metadata.channel}
- **URL**: ${metadata.url}

## Full Transcription

${rawTranscript}

---

## TAXONOMY ANALYSIS

> Note: Run through PMT-004 prompt for full analysis
`;
}

// Применить PMT-004 через AI API (расширенная версия)
export async function applyAIFormatting(rawTranscript, metadata, openaiKey) {
  // Вызов OpenAI/Claude API с PMT-004 prompt
  // ...
}
```

**Зависимости:**

```bash
cd apps/api
npm install youtube-transcript
# Опционально для AI форматирования:
npm install openai  # или @anthropic-ai/sdk
```

---

### Фаза 2: Frontend UI (2-3 часа)

**Файлы для изменения:**

```
apps/web/src/
├── lib/
│   └── api.ts                      # + transcriptionAPI
├── components/
│   └── VideoDetailPage.tsx         # + кнопка "Generate Transcript"
```

**Новый компонент VideoDetailPage.tsx:**

```typescript
// Добавить к существующему или создать новый
const [isTranscribing, setIsTranscribing] = useState(false);
const [transcript, setTranscript] = useState(null);

const handleGenerateTranscript = async () => {
  setIsTranscribing(true);
  try {
    const result = await transcriptionAPI.fromYouTube({
      video_url: video.video_url,
      video_title: video.video_title,
    });
    
    if (result.success) {
      setTranscript(result.data);
      // Показать модал с результатом или скачать файл
    }
  } finally {
    setIsTranscribing(false);
  }
};
```

**UI элементы:**

1. Кнопка "Generate Transcript" в карточке видео
2. Индикатор загрузки во время генерации
3. Модальное окно с preview транскрипта
4. Кнопки "Download .md" и "Copy to Clipboard"

---

### Фаза 3: AI Форматирование (Опционально, 2-3 часа)

**Если нужно полное PMT-004 форматирование:**

```javascript
// services/aiFormattingService.js

import OpenAI from 'openai';
import fs from 'fs';

const PMT004_PROMPT = fs.readFileSync(
  'ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md', 
  'utf-8'
);

export async function formatWithAI(rawTranscript, metadata) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PMT004_PROMPT },
      { role: 'user', content: `
Video Title: ${metadata.title}
Channel: ${metadata.channel}
URL: ${metadata.url}

Raw Transcript:
${rawTranscript}

Please format this according to the PMT-004 template.
      ` }
    ],
  });
  
  return response.choices[0].message.content;
}
```

**Стоимость:**
- GPT-4o: ~$0.01-0.03 за видео (10-20 мин)
- Claude 3.5 Sonnet: ~$0.01-0.02 за видео

---

### Фаза 4: Интеграция с Pipeline (1-2 часа)

**Автоматическое сохранение в 02_TRANSCRIPTIONS:**

```javascript
// После генерации транскрипта
const videoNumber = await getNextVideoNumber();
const filename = `Video_${String(videoNumber).padStart(3, '0')}.md`;
const filepath = `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/${filename}`;

fs.writeFileSync(filepath, formattedMarkdown);

// Обновить статус видео в очереди
await prisma.videoQueue.update({
  where: { queueId: video.queue_id },
  data: { 
    status: 'transcribed',
    parsedDate: new Date(),
  },
});
```

---

## 📊 Сравнение подходов

| Критерий | YouTube Captions | Whisper | Gemini | Гибридный |
|----------|-----------------|---------|--------|-----------|
| **Скорость** | ⚡ 5 сек | 🐢 2-5 мин | 🐢 1-3 мин | ⚡ 30-60 сек |
| **Качество** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Стоимость** | 💚 Бесплатно | 💰 $0.006/мин | 💰 $0.01-0.05 | 💰 $0.02-0.05 |
| **Сложность** | 🟢 Низкая | 🔴 Высокая | 🟡 Средняя | 🟡 Средняя |
| **Зависимости** | npm only | yt-dlp + API | API key | npm + API |
| **Timestamps** | ✅ Да | ✅ Да | ✅ Да | ✅ Да |
| **PMT-004** | ❌ Нужно доп. | ❌ Нужно доп. | ✅ Встроено | ✅ С AI |

**Рекомендация:** Начать с **YouTube Captions** (Вариант 1), затем добавить **AI форматирование** (Вариант 4).

---

## ✅ Checklist реализации

### Этап 1: Базовая функциональность
- [ ] Установить `youtube-transcript` в apps/api
- [ ] Создать `services/transcriptionService.js`
- [ ] Добавить endpoint `POST /api/transcription/youtube`
- [ ] Добавить `transcriptionAPI` в frontend api.ts
- [ ] Создать/обновить `VideoDetailPage.tsx`
- [ ] Добавить кнопку "Generate Transcript"
- [ ] Добавить модал с результатом
- [ ] Добавить download функциональность

### Этап 2: AI форматирование (опционально)
- [ ] Добавить OpenAI/Claude SDK
- [ ] Создать `services/aiFormattingService.js`
- [ ] Загрузить PMT-004 prompt
- [ ] Добавить endpoint для AI форматирования
- [ ] Добавить переключатель "Basic/Full formatting" в UI

### Этап 3: Интеграция с pipeline
- [ ] Автоматическое сохранение в 02_TRANSCRIPTIONS
- [ ] Автоматическое обновление статуса видео
- [ ] Генерация Video_XXX номера
- [ ] Интеграция с существующими скриптами обработки

---

## 🔗 Связанные файлы

**Промпты:**
- `ENTITIES/PROMPTS/PMT-004_Video_Transcription_v4.1.md`
- `ENTITIES/PROMPTS/PMT-090_YouTube_Video_Processing.md`

**Документация:**
- `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/README.md`
- `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_Discovery_Pipeline.md`

**Существующие скрипты обработки:**
- `ENTITIES/TASK_MANAGERS/RESEARCHES/scripts/process_video.py`
- `ENTITIES/TASK_MANAGERS/RESEARCHES/scripts/video_gap_analyzer.py`
- `ENTITIES/TASK_MANAGERS/RESEARCHES/scripts/video_json_updater.py`

---

## 📝 Примечания

1. **YouTube Captions не всегда доступны** — нужен fallback для видео без субтитров
2. **AI API keys** — хранить в `.env`, не коммитить
3. **Rate limits** — YouTube API имеет лимиты, OpenAI/Claude тоже
4. **Качество субтитров** — автогенерация YouTube может быть неточной

---

**Создано:** 2025-12-01  
**Автор:** System  
**Статус:** Roadmap документ

