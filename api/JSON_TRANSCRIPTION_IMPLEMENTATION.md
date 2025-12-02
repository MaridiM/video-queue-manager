# Реализация JSON формата транскрипций (v2.0)

**Дата:** 2025-01-15  
**Цель:** Изменить приложение для генерации JSON транскрипций по схеме v2.0 вместо Markdown

---

## 📋 Текущая ситуация

### Что есть сейчас:
- ✅ Приложение использует PMT-004 для обработки
- ✅ Сохраняет результат в Markdown формате (`.md`)
- ✅ Генерирует структурированный контент с таксономией

### Что нужно:
- ✅ Генерировать JSON по схеме `transcription_schema_v2.json`
- ✅ Сохранять файлы как `.json` вместо `.md`
- ✅ Валидировать JSON по схеме перед сохранением
- ✅ Преобразовывать ответ AI в структурированный JSON

---

## 🎯 План изменений

### 1. Создать новый промпт для JSON генерации
**Файл:** `apps/api/prompts/PMT-004_JSON_Output_v4.1.md`

### 2. Обновить SystemPrompt и UserPrompt
**Файл:** `apps/api/server.js` (строки 1903-1922)

### 3. Создать функцию преобразования AI ответа в JSON схему
**Файл:** `apps/api/utils/transcriptionParser.js` (новый файл)

### 4. Обновить логику сохранения файлов
**Файл:** `apps/api/server.js` (строки 1987-2028)

### 5. Добавить валидацию JSON по схеме
**Файл:** `apps/api/utils/jsonValidator.js` (новый файл)

---

## 📝 Детальный план реализации

### Шаг 1: Создать JSON-ориентированный промпт

Нужно создать версию PMT-004, которая требует JSON вывод вместо Markdown.

**Ключевые изменения:**
- Изменить `OUTPUT FORMAT` с Markdown на JSON
- Указать точную структуру JSON согласно схеме v2.0
- Добавить примеры JSON структуры

### Шаг 2: Обновить SystemPrompt

```javascript
const systemPrompt = `You are a video transcription specialist following PMT-004 v4.1-JSON instructions.

🔴 CRITICAL REQUIREMENTS:
1. OUTPUT FORMAT: Valid JSON ONLY - NEVER Markdown, NEVER plain text
2. You MUST output a complete JSON object matching transcription_schema_v2.json structure
3. All required fields must be present: video_id, video_title, metadata, transcription
4. Taxonomy analysis should be structured as nested objects/arrays
5. Use proper JSON syntax: double quotes, correct commas, valid structure
6. Preserve timestamps in transcription array as "start" and "end" fields
7. Extract TASK_MANAGERS entities: milestones (MLS-###), tasks (TSK-###), steps (STP-###)

Output ONLY valid JSON. No markdown, no explanations, no code blocks.`;
```

### Шаг 3: Обновить UserPrompt

```javascript
const userPrompt = `## Video Information
- Video ID: ${videoId}
- Video Title: ${videoTitle || 'Unknown'}
- Video URL: https://www.youtube.com/watch?v=${videoId}
- Language: ${languageName}
- Total Segments: ${segments.length}

## Transcript Segments
${JSON.stringify(segments.map(s => ({
  start: formatTimestamp(s.startMs),
  end: formatTimestamp(s.startMs + s.durationMs),
  text: s.text
})), null, 2)}

---

## Instructions Template (PMT-004 v4.1-JSON)
${promptTemplate}

---

## 🔴 CRITICAL PROCESSING INSTRUCTIONS

Process the transcript above and output a complete JSON object matching transcription_schema_v2.json.

**REQUIRED JSON STRUCTURE:**
{
  "video_id": "Video_XXX",
  "video_title": "...",
  "metadata": {
    "duration": "MM:SS",
    "language": "en",
    "video_url": "...",
    "extraction_date": "YYYY-MM-DD",
    "extractor_version": "v4.1",
    "topics": [...],
    "tools_referenced": [...]
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
  "processing_status": {
    "phase_1_transcription": "complete",
    ...
  }
}

**OUTPUT:** Valid JSON object only. No markdown formatting, no code blocks.`;
```

### Шаг 4: Создать парсер для преобразования AI ответа

**Файл:** `apps/api/utils/transcriptionParser.js`

```javascript
/**
 * Парсит ответ AI и преобразует в JSON схему v2.0
 */
function parseAIResponseToJSON(aiResponse, videoId, videoTitle, videoUrl, languageName, segments) {
  try {
    // Попытка 1: Парсинг чистого JSON
    let jsonData;
    try {
      // Удалить markdown code blocks если есть
      const cleaned = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      jsonData = JSON.parse(cleaned);
    } catch (e) {
      // Попытка 2: Извлечь JSON из markdown
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    // Нормализация структуры под схему v2.0
    return normalizeToSchemaV2(jsonData, videoId, videoTitle, videoUrl, languageName, segments);
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Fallback: создать базовую структуру из доступных данных
    return createFallbackJSON(videoId, videoTitle, videoUrl, languageName, segments);
  }
}

function normalizeToSchemaV2(data, videoId, videoTitle, videoUrl, languageName, segments) {
  // Преобразование транскрипции в формат схемы
  const transcription = segments.map(s => ({
    start: formatTimestamp(s.startMs),
    end: formatTimestamp(s.startMs + s.durationMs),
    speaker: data.metadata?.speaker || '',
    text: s.text,
    annotations: []
  }));
  
  return {
    video_id: data.video_id || `Video_${videoId}`,
    video_title: data.video_title || videoTitle || 'Unknown',
    metadata: {
      channel: data.metadata?.channel || '',
      creator: data.metadata?.creator || '',
      channel_url: data.metadata?.channel_url || '',
      video_url: data.metadata?.video_url || videoUrl,
      duration: data.metadata?.duration || calculateDuration(segments),
      publication_date: data.metadata?.publication_date || '',
      extraction_date: new Date().toISOString().split('T')[0],
      extractor_version: 'v4.1',
      language: data.metadata?.language || languageName || 'en',
      subtitles_exist: data.metadata?.subtitles_exist || false,
      topics: data.metadata?.topics || data.metadata?.key_topics || [],
      tools_referenced: data.metadata?.tools_referenced || [],
      links_referenced: data.metadata?.links_referenced || [],
      timestamps: data.metadata?.timestamps || [],
      hashtags: data.metadata?.hashtags || []
    },
    description: data.description || '',
    tags: data.tags || [],
    transcription: transcription,
    taxonomy_analysis: normalizeTaxonomyAnalysis(data.taxonomy_analysis || data.TAXONOMY_ANALYSIS || {}),
    processing_status: {
      phase_1_transcription: 'complete',
      phase_2_naming: 'complete',
      phase_3_analysis: data.taxonomy_analysis ? 'complete' : 'pending',
      phase_4_objects: 'pending',
      phase_5_gap_analysis: 'pending',
      phase_6_taxonomy_updates: 'pending',
      phase_7_reporting: 'pending',
      last_updated: new Date().toISOString(),
      updated_by: 'AI Assistant'
    },
    analysis_files: [],
    provenance: {
      taxonomy_status: 'Pending_Review',
      ready_for_import: false,
      validation_required: true,
      notes: 'Generated from AI transcription',
      main_topics: data.metadata?.topics || [],
      key_workflows: (data.taxonomy_analysis?.workflows || []).map(w => w.workflow_id || w.workflow_name),
      notable_tools: data.metadata?.tools_referenced || []
    }
  };
}

function normalizeTaxonomyAnalysis(taxonomy) {
  return {
    workflows: taxonomy.workflows || taxonomy.Workflows_Identified || [],
    milestones: taxonomy.milestones || [],
    tasks: taxonomy.tasks || taxonomy.Task_Templates || [],
    steps: taxonomy.steps || taxonomy.Step_Templates || [],
    projects: taxonomy.projects || [],
    action_verbs: normalizeActionVerbs(taxonomy.action_verbs || taxonomy.Action_Verbs_Extracted || {}),
    task_chains: taxonomy.task_chains || taxonomy.Task_Chains || [],
    responsibilities_vocabulary: taxonomy.responsibilities_vocabulary || taxonomy.Responsibilities_Vocabulary || {},
    skills: taxonomy.skills || [],
    professions: taxonomy.professions || [],
    tools_matrix: taxonomy.tools_matrix || taxonomy.Tools_Technologies_Matrix || [],
    objects_deliverables: taxonomy.objects_deliverables || taxonomy.Objects_Deliverables || [],
    integration_patterns: taxonomy.integration_patterns || taxonomy.Integration_Patterns || [],
    business_concepts: taxonomy.business_concepts || taxonomy.Business_Concepts_Strategy || [],
    optimization_techniques: taxonomy.optimization_techniques || taxonomy.Optimization_Best_Practices || [],
    entities_summary: taxonomy.entities_summary || {},
    hierarchy_trees: taxonomy.hierarchy_trees || [],
    department_distribution: taxonomy.department_distribution || {},
    reusability_analysis: taxonomy.reusability_analysis || [],
    success_metrics: taxonomy.success_metrics || []
  };
}

function normalizeActionVerbs(verbs) {
  return {
    creation_verbs: verbs.creation_verbs || verbs.CREATION_VERBS || [],
    modification_verbs: verbs.modification_verbs || verbs.MODIFICATION_VERBS || [],
    analysis_verbs: verbs.analysis_verbs || verbs.ANALYSIS_VERBS || [],
    organization_verbs: verbs.organization_verbs || verbs.ORGANIZATION_VERBS || [],
    communication_verbs: verbs.communication_verbs || verbs.COMMUNICATION_VERBS || [],
    browser_agentic_operations: verbs.browser_agentic_operations || verbs.BROWSER_AGENTIC_OPERATIONS || [],
    data_operations: verbs.data_operations || verbs.DATA_OPERATIONS || []
  };
}

function createFallbackJSON(videoId, videoTitle, videoUrl, languageName, segments) {
  return {
    video_id: `Video_${videoId}`,
    video_title: videoTitle || 'Unknown',
    metadata: {
      video_url: videoUrl,
      duration: calculateDuration(segments),
      language: languageName || 'en',
      extraction_date: new Date().toISOString().split('T')[0],
      extractor_version: 'v4.1'
    },
    transcription: segments.map(s => ({
      start: formatTimestamp(s.startMs),
      end: formatTimestamp(s.startMs + s.durationMs),
      text: s.text,
      annotations: []
    })),
    taxonomy_analysis: {},
    processing_status: {
      phase_1_transcription: 'complete',
      phase_2_naming: 'pending',
      phase_3_analysis: 'pending',
      phase_4_objects: 'pending',
      phase_5_gap_analysis: 'pending',
      phase_6_taxonomy_updates: 'pending',
      phase_7_reporting: 'pending',
      last_updated: new Date().toISOString(),
      updated_by: 'AI Assistant'
    }
  };
}

function calculateDuration(segments) {
  if (segments.length === 0) return '00:00';
  const lastSegment = segments[segments.length - 1];
  const totalMs = lastSegment.startMs + lastSegment.durationMs;
  return formatTimestamp(totalMs);
}

function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

module.exports = {
  parseAIResponseToJSON,
  normalizeToSchemaV2,
  createFallbackJSON
};
```

### Шаг 5: Добавить валидацию JSON

**Файл:** `apps/api/utils/jsonValidator.js`

```javascript
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Загрузить схему
const schemaPath = path.join(__dirname, '..', '..', 'dev', 'transcriptions', 'transcription_schema_v2.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const validate = ajv.compile(schema);

function validateTranscriptionJSON(jsonData) {
  const valid = validate(jsonData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(err => ({
        path: err.instancePath || err.schemaPath,
        message: err.message,
        params: err.params
      }))
    };
  }
  
  return { valid: true, errors: [] };
}

module.exports = {
  validateTranscriptionJSON
};
```

### Шаг 6: Обновить код в server.js

**Изменения в `apps/api/server.js`:**

1. **Добавить импорты:**
```javascript
const { parseAIResponseToJSON } = require('./utils/transcriptionParser');
const { validateTranscriptionJSON } = require('./utils/jsonValidator');
```

2. **Обновить SystemPrompt и UserPrompt** (строки 1903-1922)

3. **После получения aiResponse** (после строки 1977):
```javascript
// Парсинг и преобразование в JSON схему v2.0
console.log(`\n📦 Step 3.5: Parsing AI response to JSON schema v2.0...`);
let jsonData;
try {
  jsonData = parseAIResponseToJSON(
    aiResponse,
    videoId,
    videoTitle,
    `https://www.youtube.com/watch?v=${videoId}`,
    languageName,
    segments
  );
  
  // Валидация JSON
  const validation = validateTranscriptionJSON(jsonData);
  if (!validation.valid) {
    console.warn('⚠️ JSON validation warnings:', validation.errors);
  } else {
    console.log('   ✅ JSON validated successfully');
  }
} catch (parseError) {
  console.error('   ❌ Error parsing to JSON:', parseError.message);
  return res.status(500).json({
    success: false,
    error: `Failed to parse AI response to JSON: ${parseError.message}`,
    step: 'json_parsing'
  });
}
```

4. **Обновить сохранение файла** (строки 1987-2028):
```javascript
if (saveToFile) {
  console.log(`\n💾 Step 4: Saving to JSON file...`);
  
  const transcriptionsDir = path.join(__dirname, '..', '..', 'ENTITIES', 'TASK_MANAGERS', 'RESEARCHES', '02_TRANSCRIPTIONS');
  
  if (!fs.existsSync(transcriptionsDir)) {
    fs.mkdirSync(transcriptionsDir, { recursive: true });
  }
  
  // Найти следующий номер видео
  const existingFiles = fs.readdirSync(transcriptionsDir)
    .filter(f => f.match(/^Video_\d+\.json$/) || f.match(/^Video_\d+\.md$/));
  
  const existingNumbers = existingFiles
    .map(f => {
      const match = f.match(/Video_(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  const fileName = `Video_${String(nextNumber).padStart(3, '0')}.json`;
  savedFilePath = path.join(transcriptionsDir, fileName);
  
  // Сохранить как JSON
  fs.writeFileSync(savedFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`   ✅ Saved to: ${savedFilePath}`);
}
```

5. **Обновить ответ API** (строки 2036-2056):
```javascript
res.json({
  success: true,
  data: {
    videoId,
    videoTitle: videoTitle || 'Unknown',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    language: languageName,
    totalSegments: segments.length,
    rawTranscriptLength: transcriptWithTimestamps.length,
    processedLength: JSON.stringify(jsonData).length,
    savedFilePath: savedFilePath?.replace(/\\/g, '/'),
    aiProvider: actualProvider,
    aiModel: modelUsed,
    format: 'json_v2.0',
    timing: {
      transcriptFetch: step1Time,
      aiProcessing: step3Time,
      jsonParsing: Date.now() - startStep3,
      total: totalTime
    },
    transcription: jsonData
  }
});
```

---

## 📦 Установка зависимостей

```bash
cd apps/api
npm install ajv ajv-formats
```

---

## ✅ Чеклист реализации

- [ ] Создать `apps/api/utils/transcriptionParser.js`
- [ ] Создать `apps/api/utils/jsonValidator.js`
- [ ] Установить зависимости (`ajv`, `ajv-formats`)
- [ ] Обновить SystemPrompt в `server.js`
- [ ] Обновить UserPrompt в `server.js`
- [ ] Добавить парсинг AI ответа в `server.js`
- [ ] Добавить валидацию JSON в `server.js`
- [ ] Обновить логику сохранения файлов (`.json` вместо `.md`)
- [ ] Обновить ответ API
- [ ] Протестировать с реальным видео

---

## 🧪 Тестирование

### Тест 1: Базовая транскрипция
```bash
curl -X POST http://localhost:3001/api/transcription/process \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "videoTitle": "Test Video",
    "saveToFile": true
  }'
```

### Тест 2: Валидация JSON
```bash
# Проверить созданный файл
npx ajv validate -s apps/dev/transcriptions/transcription_schema_v2.json \
  -d ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/Video_XXX.json
```

---

## 📊 Ожидаемый результат

После реализации:
- ✅ Файлы сохраняются как `.json` вместо `.md`
- ✅ JSON соответствует схеме v2.0
- ✅ Все обязательные поля присутствуют
- ✅ Таксономический анализ структурирован правильно
- ✅ Валидация проходит успешно

---

## 🔄 Обратная совместимость

Для существующих `.md` файлов можно создать конвертер:
- `apps/api/utils/markdownToJSON.js` - конвертирует старые `.md` в `.json`

---

**Готово к реализации!** Начните с создания утилит (`transcriptionParser.js`, `jsonValidator.js`), затем обновите `server.js`.

