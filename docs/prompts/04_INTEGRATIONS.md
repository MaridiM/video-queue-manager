# Промпт: External Integrations - Queue Manager

## Цель

Создать интеграции с внешними сервисами: Dropbox API, Google AI (Gemini), OpenAI GPT, и YouTube Innertube API.

## 1. Dropbox API Integration

### Требования

- **SDK:** `dropbox` версия 10.34.0
- **Access Token:** должен начинаться с `sl.`
- **Scopes:** 
  - `files.content.read` - чтение файлов
  - `files.content.write` - запись файлов
  - `files.metadata.read` - чтение метаданных

### DropboxService Class

**Полная реализация:**

```javascript
import { Dropbox } from 'dropbox';

class DropboxService {
  constructor(accessToken, rootPath = '/ENTITIES/TASK_MANAGERS/RESEARCHES') {
    // Валидация токена
    this.accessToken = accessToken.trim().replace(/^["']|["']$/g, '').trim();
    
    if (!this.accessToken.startsWith('sl.')) {
      throw new Error('Invalid Dropbox access token format. Token must start with "sl."');
    }
    
    this.rootPath = rootPath;
    this.dbx = new Dropbox({ accessToken: this.accessToken });
  }

  getFullPath(relativePath) {
    if (relativePath.startsWith('/')) {
      return relativePath;
    }
    return `${this.rootPath}/${relativePath}`.replace(/\/+/g, '/');
  }

  async downloadFile(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    const response = await this.dbx.filesDownload({ path: fullPath });
    
    // Обработка различных форматов ответа
    const fileContent = response.result.fileBinary;
    if (Buffer.isBuffer(fileContent)) {
      return fileContent.toString('utf-8');
    }
    // ... обработка других форматов
  }

  async uploadFile(dropboxPath, content, mode = 'overwrite') {
    const fullPath = this.getFullPath(dropboxPath);
    const contentBuffer = typeof content === 'string' 
      ? Buffer.from(content, 'utf-8') 
      : content;
    
    const response = await this.dbx.filesUpload({
      path: fullPath,
      contents: contentBuffer,
      mode: { '.tag': mode },
      autorename: false,
      mute: false
    });
    
    return response.result;
  }

  async fileExists(dropboxPath) {
    try {
      await this.dbx.filesGetMetadata({ path: this.getFullPath(dropboxPath) });
      return true;
    } catch (error) {
      if (error.status === 409) return false;
      throw error;
    }
  }

  async listFolder(dropboxPath) {
    const response = await this.dbx.filesListFolder({ 
      path: this.getFullPath(dropboxPath) 
    });
    return response.result.entries;
  }

  async listFolderAll(dropboxPath) {
    const allEntries = [];
    let response = await this.dbx.filesListFolder({ 
      path: this.getFullPath(dropboxPath) 
    });
    allEntries.push(...response.result.entries);
    
    while (response.result.has_more) {
      response = await this.dbx.filesListFolderContinue({
        cursor: response.result.cursor
      });
      allEntries.push(...response.result.entries);
    }
    
    return allEntries;
  }

  async testConnection() {
    const response = await this.dbx.usersGetCurrentAccount();
    return {
      success: true,
      accountInfo: {
        name: response.result.name.display_name,
        email: response.result.email
      }
    };
  }

  parseDropboxError(error) {
    if (error.error?.error_summary) {
      return error.error.error_summary;
    }
    if (error.status === 401) {
      return 'Invalid or expired access token';
    }
    if (error.status === 409) {
      const pathError = error.error?.error?.path?.['.tag'];
      if (pathError === 'not_found') {
        return 'File or folder not found';
      }
    }
    return error.message || 'Unknown Dropbox error';
  }
}

// Singleton factory
let dropboxInstance = null;

export function getDropboxService(settings) {
  if (!settings?.accessToken || !settings?.enabled) {
    return null;
  }
  
  if (!dropboxInstance || dropboxInstance.accessToken !== settings.accessToken) {
    dropboxInstance = new DropboxService(settings.accessToken, settings.rootPath);
  }
  
  return dropboxInstance;
}

export default DropboxService;
```

### Пути в Dropbox

```
/ENTITIES/TASK_MANAGERS/RESEARCHES/
├── 00_SEARCH_QUEUE/
│   └── Search_Queue_Master.csv
├── 01_VIDEO_QUEUE/
│   └── Video_Queue_Master.csv
└── 02_TRANSCRIPTIONS/
    └── Video_XXX.json

/ENTITIES/PROMPTS/
└── PMT-XXX.md
```

### Fallback механизм

```javascript
// Всегда сначала пробуем Dropbox, затем локальный файл
let content = null;
const dropboxService = getDropboxService(aiSettings.dropbox);

if (dropboxService) {
  try {
    content = await dropboxService.downloadFile(dropboxPath);
    source = 'dropbox';
  } catch (dropboxError) {
    console.warn('Dropbox failed, falling back to local');
  }
}

if (!content) {
  content = fs.readFileSync(localPath, 'utf-8');
  source = 'local';
}
```

---

## 2. Google AI (Gemini) Integration

### Требования

- **SDK:** `@google/generative-ai` версия 0.24.1
- **API Key:** получается из Google AI Studio
- **Модели:**
  - `gemini-2.0-flash` (default) - новейшая, самая быстрая
  - `gemini-1.5-flash-latest` - быстрая и экономичная
  - `gemini-1.5-pro-latest` - высокое качество, дороже

### Инициализация

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const googleAI = new GoogleGenerativeAI(apiKey);

const model = googleAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 32000
  }
});
```

### Использование

```javascript
const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
const result = await model.generateContent(fullPrompt);

// Обработка ответа (различные форматы)
let aiResponse;
if (result.response && typeof result.response.text === 'function') {
  aiResponse = await result.response.text();
} else if (result.response && result.response.text) {
  aiResponse = result.response.text;
} else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
  aiResponse = result.response.candidates[0].content.parts[0].text;
}
```

### Retry логика для Rate Limits

```javascript
const maxRetries = 3;
let retryCount = 0;

while (retryCount <= maxRetries) {
  try {
    const result = await model.generateContent(fullPrompt);
    // Success - break
    break;
  } catch (aiError) {
    const isRateLimit = aiError.message.includes('429') || 
                       aiError.message.includes('Too Many Requests');
    
    if (isRateLimit && retryCount < maxRetries) {
      retryCount++;
      const delayMs = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }
    throw aiError;
  }
}
```

### Обработка ошибок

```javascript
// Rate Limit (429)
if (error.status === 429) {
  return {
    success: false,
    error: 'Rate limit exceeded for Google AI. Please wait a few minutes and try again.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  };
}

// Authentication (401/403)
if (error.status === 401 || error.status === 403) {
  return {
    success: false,
    error: 'Authentication failed. Please check your API key in Settings.',
    errorCode: 'AUTHENTICATION_ERROR'
  };
}
```

---

## 3. OpenAI GPT Integration

### Требования

- **SDK:** `openai` версия 6.9.1
- **API Key:** получается из OpenAI Platform
- **Модели:**
  - `gpt-4o-mini` (default) - быстрая и экономичная
  - `gpt-4o` - высокое качество
  - `gpt-4-turbo` - мощная, большой контекст

### Инициализация

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey });
```

### Использование

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: 32000,
  temperature: 0.3
});

const aiResponse = completion.choices[0]?.message?.content || '';
```

### Retry логика

Аналогично Google AI - экспоненциальная задержка при ошибке 429.

---

## 4. YouTube Innertube API Integration

### Требования

- Прямое обращение к Innertube API (без официального SDK)
- Поддержка различных форматов YouTube URL
- Обработка JSON3 формата субтитров

### Функция получения транскрипции

```javascript
async function fetchYouTubeTranscript(videoId) {
  // Step 1: Get video player info via Innertube API
  const playerResponse = await httpsPost(
    'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    {
      context: {
        client: {
          hl: 'en',
          gl: 'US',
          clientName: 'WEB',
          clientVersion: '2.20231219.04.00'
        }
      },
      videoId: videoId
    }
  );
  
  // Step 2: Extract caption tracks
  const captions = playerResponse.data?.captions?.playerCaptionsTracklistRenderer;
  if (!captions?.captionTracks?.length) {
    throw new Error('No captions available for this video');
  }
  
  // Step 3: Get first caption track (usually auto-generated English)
  const track = captions.captionTracks[0];
  const captionUrl = track.baseUrl + '&fmt=json3';
  
  // Step 4: Fetch actual captions
  const captionResponse = await httpsGet(captionUrl);
  const captionData = JSON.parse(captionResponse);
  
  // Step 5: Parse transcript segments
  const segments = captionData.events
    .filter(e => e.segs && e.segs.length > 0)
    .map(e => ({
      startMs: e.tStartMs || 0,
      durationMs: e.dDurationMs || 0,
      text: e.segs.map(s => s.utf8 || '').join('').trim()
    }))
    .filter(s => s.text.length > 0);
  
  return {
    segments,
    language: track.languageCode || 'en',
    languageName: track.name?.simpleText || 'Unknown'
  };
}
```

### Извлечение Video ID

```javascript
function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
```

### Форматирование таймкодов

```javascript
function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
```

---

## 5. AI Transcription Pipeline

### Полный workflow

```javascript
// POST /api/transcription/process

// Step 1: Fetch YouTube Transcript
const transcriptResult = await fetchYouTubeTranscript(videoId);
const segments = transcriptResult.segments;
const transcriptWithTimestamps = segments.map(s => {
  const timestamp = formatTimestamp(s.startMs);
  return `[${timestamp}] ${s.text}`;
}).join('\n');

// Step 2: Load Prompt Template
const promptTemplate = await loadPromptFromDropboxOrLocal('PMT-004');

// Step 3: Process with AI
const systemPrompt = `You are a video transcription specialist...`;
const userPrompt = `## Video Information\n...\n## Transcript\n${transcriptWithTimestamps}\n\n## Instructions\n${promptTemplate}`;

const aiResponse = await processWithAI(systemPrompt, userPrompt, provider);

// Step 4: Parse AI Response to JSON Schema v2.0
const jsonData = parseAIResponseToJSON(
  aiResponse,
  videoId,
  videoTitle,
  videoUrl,
  languageName,
  segments
);

// Step 5: Validate JSON
const validation = validateTranscriptionJSON(jsonData);

// Step 6: Save to File
await saveTranscriptionToDropboxOrLocal(jsonData, videoId);
```

### Парсинг AI ответа

```javascript
function parseAIResponseToJSON(aiResponse, videoId, videoTitle, videoUrl, languageName, segments) {
  // Удалить markdown code blocks
  const cleaned = aiResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  let jsonData;
  try {
    jsonData = JSON.parse(cleaned);
  } catch (e) {
    // Попытка извлечь JSON из markdown
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                     aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in AI response');
    }
  }
  
  // Нормализация под схему v2.0
  return normalizeToSchemaV2(jsonData, videoId, videoTitle, videoUrl, languageName, segments);
}
```

### Валидация JSON

```javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync('transcription_schema_v2.json', 'utf-8'));
const validate = ajv.compile(schema);

function validateTranscriptionJSON(jsonData) {
  const valid = validate(jsonData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(err => ({
        path: err.instancePath,
        message: err.message
      }))
    };
  }
  
  return { valid: true, errors: [] };
}
```

---

## 6. Settings Management

### Структура settings.json

```json
{
  "openai": {
    "apiKey": "sk-...",
    "enabled": true,
    "model": "gpt-4o-mini"
  },
  "google": {
    "apiKey": "AIza...",
    "enabled": true,
    "model": "gemini-2.0-flash"
  },
  "defaultProvider": "google",
  "dropbox": {
    "accessToken": "sl.xxx...",
    "enabled": true,
    "rootPath": "/ENTITIES/TASK_MANAGERS/RESEARCHES",
    "configured": true
  }
}
```

### Загрузка настроек

```javascript
function loadSettings() {
  const defaults = {
    openai: { 
      apiKey: process.env.OPENAI_API_KEY || '', 
      enabled: !!process.env.OPENAI_API_KEY, 
      model: 'gpt-4o-mini' 
    },
    google: { 
      apiKey: process.env.GOOGLE_AI_API_KEY || '', 
      enabled: !!process.env.GOOGLE_AI_API_KEY, 
      model: 'gemini-2.0-flash' 
    },
    defaultProvider: 'google',
    dropbox: {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN || '',
      enabled: !!process.env.DROPBOX_ACCESS_TOKEN,
      rootPath: '/ENTITIES/TASK_MANAGERS/RESEARCHES',
      configured: !!process.env.DROPBOX_ACCESS_TOKEN
    }
  };
  
  try {
    if (fs.existsSync(settingsFilePath)) {
      const saved = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
      return { ...defaults, ...saved };
    }
  } catch (e) {
    console.warn('Error loading settings, using defaults');
  }
  
  return defaults;
}
```

### Сохранение настроек

```javascript
function saveSettings(settings) {
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
  // Переинициализация AI клиентов
  reinitializeAIClients();
}
```

---

## 7. Error Handling Patterns

### Стандартизированные ошибки

```javascript
// Rate Limit
{
  success: false,
  error: "Rate limit exceeded for Google AI. Please wait a few minutes and try again.",
  step: "ai_processing",
  provider: "google",
  errorCode: "RATE_LIMIT_EXCEEDED",
  retryAfter: 60,
  retriesAttempted: 3
}

// Authentication
{
  success: false,
  error: "Authentication failed. Please check your API key in Settings.",
  step: "ai_processing",
  provider: "google",
  errorCode: "AUTHENTICATION_ERROR"
}

// Generic
{
  success: false,
  error: "Error message description",
  step: "step_name",
  details: "Additional details"
}
```

---

## 8. Требования к реализации

1. **Dropbox Integration:**
   - Singleton паттерн для сервиса
   - Fallback на локальные файлы
   - Валидация токена
   - Детальный парсинг ошибок

2. **AI Providers:**
   - Единый интерфейс для обоих провайдеров
   - Retry логика для rate limits
   - Обработка различных форматов ответов
   - Настройка через Settings API

3. **YouTube Integration:**
   - Поддержка различных форматов URL
   - Обработка ошибок (нет субтитров, приватное видео)
   - Форматирование таймкодов

4. **Pipeline:**
   - Четкие шаги процесса
   - Обработка ошибок на каждом шаге
   - Логирование прогресса
   - Валидация результатов

5. **Settings:**
   - Загрузка из файла или env
   - Маскирование ключей в ответах
   - Переинициализация клиентов после изменений

---

## 9. Тестирование интеграций

### Dropbox
- Тест подключения с валидным токеном
- Тест загрузки файла
- Тест выгрузки файла
- Тест fallback на локальные файлы

### Google AI
- Тест с валидным API ключом
- Тест обработки транскрипции
- Тест retry логики при rate limit
- Тест обработки различных форматов ответов

### OpenAI
- Тест с валидным API ключом
- Тест обработки транскрипции
- Тест retry логики

### YouTube
- Тест получения транскрипции
- Тест различных форматов URL
- Тест обработки ошибок (нет субтитров)

---

## 10. Примеры использования

### Dropbox

```javascript
const dropboxService = getDropboxService(aiSettings.dropbox);
if (dropboxService) {
  const content = await dropboxService.downloadFile('/path/to/file.csv');
  await dropboxService.uploadFile('/path/to/output.json', jsonContent);
}
```

### Google AI

```javascript
const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const result = await model.generateContent(prompt);
const response = await result.response.text();
```

### OpenAI

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }]
});
const response = completion.choices[0].message.content;
```

### YouTube

```javascript
const transcript = await fetchYouTubeTranscript('abc123xyz');
console.log(transcript.segments); // Array of segments with timestamps
```




