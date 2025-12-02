# Рекомендации по оптимизации промпта для высококачественных результатов

**Дата:** 2025-01-15  
**Анализ:** Код приложения и примеры транскрипций  
**Цель:** Получение результатов уровня Video_028.md вместо Video_20.md

---

## 📊 Текущая ситуация

### ✅ Что работает правильно:
- Приложение использует **PMT-004_Video_Transcription_v4.1.md** - это правильный выбор
- Промпт загружается из правильного пути
- Используются правильные AI модели (Gemini 2.0 Flash / GPT-4o-mini)

### ❌ Проблемы качества:

**Video_20.md** (низкое качество):
- JSON формат вместо Markdown
- Базовая структура без таксономии
- Отсутствуют MLS, TSK, STP сущности
- Нет иерархических деревьев
- Нет CSV мастер-листа

**Video_028.md** (высокое качество):
- ✅ Полный Markdown формат
- ✅ Все 16 секций заполнены
- ✅ MLS-001, MLS-002 (Milestones)
- ✅ TSK-001 до TSK-010 (Tasks)
- ✅ Иерархические деревья
- ✅ CSV мастер-лист
- ✅ Department Distribution Analysis
- ✅ Action-Object-Tool Probability Mapping

---

## 🎯 Рекомендация: Улучшить SystemPrompt и UserPrompt

### Проблема в текущем коде:

**Текущий SystemPrompt** (строка 1903):
```javascript
const systemPrompt = `You are a video transcription specialist. Follow the instructions in the provided template exactly.
Output ONLY the structured markdown document as specified. Do not include any preamble or explanation.`;
```

**Проблемы:**
- Слишком короткий
- Не подчеркивает критичность формата Markdown
- Не упоминает TASK_MANAGERS сущности
- Не акцентирует внимание на всех 16 секциях

---

## ✅ Рекомендуемое решение

### Улучшенный SystemPrompt:

```javascript
const systemPrompt = `You are a video transcription specialist following PMT-004 v4.1-TASK_MANAGERS instructions.

🔴 CRITICAL REQUIREMENTS:
1. OUTPUT FORMAT: Markdown (.md) ONLY - NEVER JSON, NEVER plain text
2. You MUST extract TASK_MANAGERS entities: Milestones (MLS-###), Tasks (TSK-###), Steps (STP-###)
3. You MUST include ALL 16 sections from the template:
   - Sections 1-3: Metadata, Description, Word-for-Word Transcription
   - Section 4: Milestone Templates (MLS-###)
   - Section 5: Action Verbs (7 categories A-G)
   - Section 6: Task Templates (TSK-###)
   - Section 7: Step Templates (STP-###)
   - Section 8: Task Chains
   - Section 9: Action-Object-Tool Probability Mapping
   - Section 10: Responsibilities Vocabulary
   - Section 11: Tools & Technologies Matrix (TABLE format)
   - Section 12: Objects & Deliverables
   - Section 13: Entity ID Assignment & CSV Master List (ONLY MLS, TSK, STP)
   - Section 14: Hierarchical Relationship Trees (ASCII format)
   - Section 15: Department Distribution Analysis (TABLE format)
   - Section 16: Video Source Metadata & Provenance

4. PRESERVE timestamps [MM:SS] in Word-for-Word Transcription section
5. Use proper Markdown formatting: # headers, tables, code blocks
6. Reference LIBRARIES entities (ACT-###, OBJ-###, TOL-###, SKL-###, PRF-###, RSP-###) but DO NOT create new ones
7. Only extract TASK_MANAGERS entities (MLS, TSK, STP) as new entities

Output ONLY the complete structured markdown document. No preamble, no explanations, no JSON.`;
```

### Улучшенный UserPrompt:

```javascript
const userPrompt = `## Video Information
- Video ID: ${videoId}
- Video Title: ${videoTitle || 'Unknown'}
- Video URL: https://www.youtube.com/watch?v=${videoId}
- Language: ${languageName}
- Total Segments: ${segments.length}

## Transcript with Timestamps
${transcriptWithTimestamps}

---

## Instructions Template (PMT-004 v4.1-TASK_MANAGERS)
${promptTemplate}

---

## 🔴 CRITICAL PROCESSING INSTRUCTIONS

Process the transcript above following the PMT-004 template EXACTLY.

**MANDATORY SECTIONS TO INCLUDE:**
1. ✅ Metadata Section (title, channel, URL, duration, date)
2. ✅ Description Section (full description, key topics, links)
3. ✅ Word-for-Word Transcription (with [MM:SS] timestamps preserved)
4. ✅ Milestone Templates (MLS-###) - Identify clusters of sequential tasks
5. ✅ Task Templates (TSK-###) - Extract individual tasks
6. ✅ Step Templates (STP-###) - Extract atomic steps
7. ✅ Action Verbs & Operations (7 categories: A-G)
8. ✅ Task Chains (sequential flows with →)
9. ✅ Action-Object-Tool Probability Mapping (7-phase extraction sequence)
10. ✅ Responsibilities Vocabulary (roles, activities, skills)
11. ✅ Tools & Technologies Matrix (TABLE format, not JSON)
12. ✅ Objects & Deliverables (reference LIBRARIES OBJ-### only)
13. ✅ Entity ID Assignment & CSV Master List (ONLY MLS, TSK, STP entities)
14. ✅ Hierarchical Relationship Trees (ASCII format: MLS → TSK → STP)
15. ✅ Department Distribution Analysis (TABLE: Department, ISO, MLS, TSK, STP, Total)
16. ✅ Video Source Metadata & Provenance (VIDEO_ID, extraction date, entity breakdown)

**FORMAT REQUIREMENTS:**
- Start document with # heading (Markdown format)
- Use proper Markdown tables for Tools Matrix and Department Distribution
- Use ASCII tree characters (├──, └──, │) for hierarchical trees
- CSV Master List must include header row: New_ID,Entity_Type,Name,Description,Department,Source,Status
- Preserve ALL timestamps [MM:SS] from transcript in Word-for-Word section

**ENTITY EXTRACTION RULES:**
- EXTRACT: MLS-### (Milestones), TSK-### (Tasks), STP-### (Steps)
- REFERENCE ONLY: ACT-###, OBJ-###, TOL-###, SKL-###, PRF-###, RSP-### (from LIBRARIES)
- DO NOT create new LIBRARIES entities, only reference existing ones
- Assign sequential IDs: MLS-001, MLS-002, TSK-001, TSK-002, etc.

**OUTPUT:** Complete structured markdown document (.md format) with all 16 sections.`;
```

---

## 🔧 Дополнительные улучшения кода

### 1. Увеличить maxOutputTokens для Gemini:

```javascript
// Текущее (строка 1935):
maxOutputTokens: 16000,

// Рекомендуемое:
maxOutputTokens: 32000, // Увеличить для полных транскрипций
```

### 2. Увеличить max_tokens для OpenAI:

```javascript
// Текущее (строка 1956):
max_tokens: 16000,

// Рекомендуемое:
max_tokens: 32000, // Увеличить для полных транскрипций
```

### 3. Добавить валидацию формата ответа:

```javascript
// После получения aiResponse (после строки 1977):
// Валидация формата
if (aiResponse.trim().startsWith('{') || aiResponse.trim().startsWith('[')) {
  console.error('❌ ERROR: AI returned JSON instead of Markdown!');
  return res.status(500).json({
    success: false,
    error: 'AI returned JSON format instead of Markdown. Please check prompt configuration.',
    step: 'format_validation',
    receivedFormat: 'JSON',
    expectedFormat: 'Markdown'
  });
}

if (!aiResponse.includes('# ') && !aiResponse.includes('## ')) {
  console.warn('⚠️ WARNING: Response may not be proper Markdown format');
}

// Проверка наличия критических секций
const requiredSections = [
  'Metadata',
  'Word-for-Word Transcription',
  'Milestone Templates',
  'Task Templates',
  'CSV Master List',
  'Hierarchical Relationship Trees'
];

const missingSections = requiredSections.filter(section => 
  !aiResponse.includes(section) && !aiResponse.includes(section.toLowerCase())
);

if (missingSections.length > 0) {
  console.warn(`⚠️ WARNING: Missing sections: ${missingSections.join(', ')}`);
}
```

---

## 📋 Чеклист для проверки качества результата

Добавить валидацию после обработки:

```javascript
function validateTranscriptionQuality(aiResponse) {
  const checks = {
    isMarkdown: !aiResponse.trim().startsWith('{') && !aiResponse.trim().startsWith('['),
    hasMetadata: /##\s*Metadata|#\s*Video Title/i.test(aiResponse),
    hasTranscription: /Word-for-Word Transcription|##\s*3\./i.test(aiResponse),
    hasMilestones: /MILESTONE_ID:\s*MLS-|##\s*4\.\s*Milestone/i.test(aiResponse),
    hasTasks: /TASK_ID:\s*TSK-|TSK-\d+/i.test(aiResponse),
    hasSteps: /STEP_ID:\s*STP-|STP-\d+/i.test(aiResponse),
    hasCSV: /```csv|New_ID,Entity_Type/i.test(aiResponse),
    hasTree: /├──|└──|MLS-\d+.*TSK-\d+/i.test(aiResponse),
    hasDepartmentTable: /\|\s*Department\s*\|\s*ISO/i.test(aiResponse),
    hasToolsMatrix: /\|\s*Tool.*Category.*Purpose/i.test(aiResponse)
  };
  
  const passed = Object.values(checks).filter(v => v).length;
  const total = Object.keys(checks).length;
  const qualityScore = (passed / total) * 100;
  
  return {
    qualityScore,
    checks,
    passed,
    total,
    isHighQuality: qualityScore >= 80
  };
}

// Использовать после получения aiResponse:
const qualityCheck = validateTranscriptionQuality(aiResponse);
console.log(`📊 Quality Score: ${qualityCheck.qualityScore}%`);
if (!qualityCheck.isHighQuality) {
  console.warn('⚠️ Quality below 80% - some sections may be missing');
}
```

---

## 🎯 Итоговая рекомендация

### ✅ Лучший промпт для вашего приложения: **PMT-004_Video_Transcription_v4.1.md**

**Почему:**
1. ✅ Уже используется в коде - правильный выбор
2. ✅ Специально разработан для извлечения TASK_MANAGERS сущностей
3. ✅ Включает все необходимые секции для высококачественного результата
4. ✅ Имеет четкие инструкции по формату (Markdown, не JSON)
5. ✅ Поддерживает иерархические структуры (MLS → TSK → STP)

### 🔧 Что нужно улучшить:

1. **Усилить SystemPrompt** - добавить четкие требования к формату и секциям
2. **Улучшить UserPrompt** - акцентировать внимание на критических требованиях
3. **Увеличить лимиты токенов** - для полных транскрипций нужно больше места
4. **Добавить валидацию** - проверять формат и наличие всех секций

### 📝 Приоритет изменений:

**HIGH PRIORITY:**
1. Улучшить SystemPrompt (критично для формата)
2. Улучшить UserPrompt (критично для полноты)
3. Увеличить maxOutputTokens/max_tokens

**MEDIUM PRIORITY:**
4. Добавить валидацию формата
5. Добавить проверку качества результата

**LOW PRIORITY:**
6. Логирование качества для мониторинга
7. Автоматические повторные попытки при низком качестве

---

## 💡 Пример улучшенного кода

```javascript
// ========================================
// STEP 3: Process with AI (Google Gemini or OpenAI)
// ========================================
console.log(`\n🤖 Step 3: Processing with ${actualProvider === 'google' ? 'Google Gemini' : 'OpenAI GPT-4'}...`);
const startStep3 = Date.now();

// УЛУЧШЕННЫЙ SystemPrompt
const systemPrompt = `You are a video transcription specialist following PMT-004 v4.1-TASK_MANAGERS instructions.

🔴 CRITICAL REQUIREMENTS:
1. OUTPUT FORMAT: Markdown (.md) ONLY - NEVER JSON, NEVER plain text
2. You MUST extract TASK_MANAGERS entities: Milestones (MLS-###), Tasks (TSK-###), Steps (STP-###)
3. You MUST include ALL 16 sections from the template
4. PRESERVE timestamps [MM:SS] in Word-for-Word Transcription section
5. Use proper Markdown formatting: # headers, tables, code blocks
6. Reference LIBRARIES entities (ACT-###, OBJ-###, TOL-###, SKL-###, PRF-###, RSP-###) but DO NOT create new ones
7. Only extract TASK_MANAGERS entities (MLS, TSK, STP) as new entities

Output ONLY the complete structured markdown document. No preamble, no explanations, no JSON.`;

// УЛУЧШЕННЫЙ UserPrompt
const userPrompt = `## Video Information
- Video ID: ${videoId}
- Video Title: ${videoTitle || 'Unknown'}
- Video URL: https://www.youtube.com/watch?v=${videoId}
- Language: ${languageName}
- Total Segments: ${segments.length}

## Transcript with Timestamps
${transcriptWithTimestamps}

---

## Instructions Template (PMT-004 v4.1-TASK_MANAGERS)
${promptTemplate}

---

## 🔴 CRITICAL PROCESSING INSTRUCTIONS

Process the transcript above following the PMT-004 template EXACTLY.

**MANDATORY SECTIONS TO INCLUDE:**
1. ✅ Metadata Section
2. ✅ Description Section  
3. ✅ Word-for-Word Transcription (with [MM:SS] timestamps preserved)
4. ✅ Milestone Templates (MLS-###)
5. ✅ Task Templates (TSK-###)
6. ✅ Step Templates (STP-###)
7. ✅ Action Verbs & Operations (7 categories: A-G)
8. ✅ Task Chains
9. ✅ Action-Object-Tool Probability Mapping
10. ✅ Responsibilities Vocabulary
11. ✅ Tools & Technologies Matrix (TABLE format)
12. ✅ Objects & Deliverables
13. ✅ Entity ID Assignment & CSV Master List (ONLY MLS, TSK, STP)
14. ✅ Hierarchical Relationship Trees (ASCII format)
15. ✅ Department Distribution Analysis (TABLE format)
16. ✅ Video Source Metadata & Provenance

**FORMAT REQUIREMENTS:**
- Start document with # heading (Markdown format)
- Use proper Markdown tables for Tools Matrix and Department Distribution
- Use ASCII tree characters (├──, └──, │) for hierarchical trees
- CSV Master List must include header row: New_ID,Entity_Type,Name,Description,Department,Source,Status
- Preserve ALL timestamps [MM:SS] from transcript

**OUTPUT:** Complete structured markdown document (.md format) with all 16 sections.`;

let aiResponse;
let modelUsed;

try {
  if (actualProvider === 'google') {
    const googleModel = aiSettings.google.model || 'gemini-2.0-flash';
    const model = googleAI.getGenerativeModel({ 
      model: googleModel,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 32000, // УВЕЛИЧЕНО с 16000
      }
    });
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(fullPrompt);
    aiResponse = result.response.text();
    modelUsed = googleModel;
    
    if (!aiResponse) {
      throw new Error('Empty response from Google AI');
    }
  } else {
    const openaiModel = aiSettings.openai.model || 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 32000, // УВЕЛИЧЕНО с 16000
      temperature: 0.3
    });
    
    aiResponse = completion.choices[0]?.message?.content;
    modelUsed = openaiModel;
    
    if (!aiResponse) {
      throw new Error('Empty response from OpenAI');
    }
  }
  
  // ВАЛИДАЦИЯ ФОРМАТА
  if (aiResponse.trim().startsWith('{') || aiResponse.trim().startsWith('[')) {
    console.error('❌ ERROR: AI returned JSON instead of Markdown!');
    return res.status(500).json({
      success: false,
      error: 'AI returned JSON format instead of Markdown. Please check prompt configuration.',
      step: 'format_validation'
    });
  }
  
  // ПРОВЕРКА КАЧЕСТВА
  const qualityCheck = validateTranscriptionQuality(aiResponse);
  console.log(`📊 Quality Score: ${qualityCheck.qualityScore}%`);
  if (!qualityCheck.isHighQuality) {
    console.warn(`⚠️ WARNING: Quality below 80% - Missing sections: ${Object.entries(qualityCheck.checks).filter(([k,v]) => !v).map(([k]) => k).join(', ')}`);
  }
  
} catch (aiError) {
  // ... existing error handling
}
```

---

## 📊 Ожидаемые результаты после улучшений

### До улучшений (Video_20.md):
- ❌ JSON формат
- ❌ Базовая структура
- ❌ Нет MLS/TSK/STP сущностей
- ❌ Качество: ~30%

### После улучшений (как Video_028.md):
- ✅ Markdown формат
- ✅ Все 16 секций заполнены
- ✅ MLS-001, MLS-002 (Milestones)
- ✅ TSK-001 до TSK-010 (Tasks)
- ✅ Иерархические деревья
- ✅ CSV мастер-лист
- ✅ Качество: 90%+

---

## 🚀 Быстрое внедрение

### Шаг 1: Обновить SystemPrompt (5 минут)
Заменить строки 1903-1904 на улучшенную версию

### Шаг 2: Обновить UserPrompt (5 минут)
Заменить строки 1906-1922 на улучшенную версию

### Шаг 3: Увеличить лимиты токенов (2 минуты)
Изменить maxOutputTokens и max_tokens на 32000

### Шаг 4: Добавить валидацию (10 минут)
Добавить функцию validateTranscriptionQuality и проверки

**Общее время:** ~20 минут  
**Ожидаемое улучшение:** 60%+ повышение качества результатов

---

**Рекомендация:** Начать с Шагов 1-3 (HIGH PRIORITY) для немедленного улучшения качества.

