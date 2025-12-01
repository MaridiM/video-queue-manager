# Video Transcription JSON Schema

**Версия:** 2.0.0  
**Дата создания:** 2025-12-01  
**Расположение:** `apps/dev/transcriptions/`

---

## Обзор

Эта директория содержит JSON схему и шаблоны для стандартизированного хранения видео транскрипций с таксономическим анализом. 

**Версия 2.0** - полностью обновлена на основе глубокого анализа всех форматов из `02_TRANSCRIPTIONS/`:
- Video_001 (Markdown формат с timestamps)
- Video_006 (Markdown с workflows и enrichment rates)
- Video_009 (Task/Step/Project Templates)
- Video_021 (JSON с taxonomy analysis)
- Video_023 (Entity ID Assignment, Hierarchy Trees)
- Video_025 (Full taxonomy с integration patterns)
- Video_026 (JSON массив транскрипций)

## Файлы

| Файл | Описание |
|------|----------|
| `transcription_schema.json` | JSON Schema (draft-07) с полной валидацией |
| `transcription_template.json` | Пустой шаблон для новых транскрипций |
| `example_video_026.json` | Пример заполненного файла (Video_026) |
| `README.md` | Документация (этот файл) |

---

## Структура схемы

### Корневые поля

```json
{
  "video_id": "Video_XXX",           // Обязательно: уникальный ID
  "video_title": "...",              // Обязательно: название видео
  "metadata": { ... },               // Обязательно: метаданные
  "description": "...",              // Опционально: описание
  "tags": [],                        // Опционально: теги для поиска
  "transcription": [],               // Обязательно: массив транскрипции
  "taxonomy_analysis": { ... },      // Опционально: таксономический анализ
  "processing_status": { ... },      // Опционально: статус обработки
  "analysis_files": []               // Опционально: связанные файлы
}
```

### 1. Metadata (Метаданные)

```json
"metadata": {
  "channel": "Channel Name",
  "creator": "Creator Name",
  "channel_url": "https://youtube.com/@channel",
  "video_url": "https://youtu.be/xxx",
  "duration": "13:32",
  "publication_date": "2025-01-15",
  "extraction_date": "2025-12-01",       // NEW v2.0
  "extractor_version": "v4.0",           // NEW v2.0
  "language": "en",
  "subtitles_exist": false,              // NEW v2.0
  "topics": ["Topic 1", "Topic 2"],
  "tools_referenced": ["n8n", "Lovable"],
  "links_referenced": [
    { "url": "https://...", "description": "..." }
  ],
  "timestamps": [                        // NEW v2.0 - оглавление
    { "time": "00:00", "title": "Introduction" },
    { "time": "05:30", "title": "Demo 1" }
  ],
  "hashtags": ["#AI", "#automation"]     // NEW v2.0
}
```

### 2. Transcription (Транскрипция)

```json
"transcription": [
  {
    "start": "00:00",                // Начало сегмента
    "end": "00:06",                  // Конец сегмента (опционально)
    "speaker": "Host",               // Спикер (если несколько)
    "text": "...",                   // Текст транскрипции
    "annotations": [                 // Аннотации (опционально)
      { "type": "VISUAL", "content": "Dashboard preview" },
      { "type": "TEXT", "content": "Title on screen" },
      { "type": "ACTION", "content": "Clicks button" },
      { "type": "SOUND", "content": "Music plays" }
    ]
  }
]
```

### 3. Taxonomy Analysis (Таксономический анализ)

#### 3.1 Workflows (Рабочие процессы)

```json
"workflows": [
  {
    "workflow_id": "WF-AID-026-01",  // ID: WF-{DEPT}-{VIDEO}-{SEQ} или WRF-NNN
    "workflow_name": "Sales Email Ingestion Pipeline",
    "objective": "Описание цели",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "tasks": ["TSK-001", "TSK-002"],     // NEW v2.0
    "duration": "Real-time",
    "complexity": "High",
    "tools_used": ["n8n", "Google Sheets"],
    "input": "Sales notification emails",
    "output": "Structured sales record",
    "department": "AID",
    "enrichment_rate": "70%",            // NEW v2.0 (для lead gen)
    "related_entities": {                // NEW v2.0
      "tasks": ["TSK-001"],
      "tools": ["TOL-001"],
      "actions": ["ACT-001"],
      "professions": ["PRF-001"]
    },
    "status": "Pending_Review"           // NEW v2.0
  }
]
```

#### 3.1.1 Milestones (Вехи) - NEW v2.0

```json
"milestones": [
  {
    "milestone_id": "MLS-001",
    "name": "Initial Design Language Captured",
    "description": "Generate machine-readable file",
    "deliverable": "design.json file",
    "tasks": ["TSK-001", "TSK-002"]
  }
]
```

#### 3.1.2 Tasks (Задачи) - NEW v2.0

```json
"tasks": [
  {
    "task_id": "TSK-001",
    "task_name": "EXTRACT_DESIGN-STYLE_FROM_IMAGE",
    "department": "Design / AI",
    "action": "Extract",
    "object": "Design Style",
    "context": "From inspiration image using AI",
    "complexity": "Low",
    "time_estimate": "1-2 minutes",
    "parent_project": "AI_App_Design_System_Setup",
    "steps_used": ["STP-001", "STP-002"],
    "skills_required": ["analyzed design styles via Cursor"],
    "tools": ["Dribbble", "Cursor", "GPT-5"],
    "input": "Screenshot of design system",
    "output": "design.json file",
    "success_criteria": "Accurate capture of key visual elements",
    "reusable_in": ["New app kickoff", "Website redesigns"]
  }
]
```

#### 3.1.3 Steps (Шаги) - NEW v2.0

```json
"steps": [
  {
    "step_id": "STP-001",
    "step_name": "SEARCH_DRIBBBLE_FOR_INSPIRATION",
    "action": "Search",
    "object": "Design Inspiration",
    "tool": "Dribbble",
    "parent_tasks": ["TSK-001"],
    "complexity": "Low",
    "time_estimate": "2-5 minutes",
    "input": "Search term 'design system'",
    "output": "List of visual examples",
    "prerequisites": ["Access to Dribbble.com"],
    "instructions": ["Navigate to site", "Search", "Browse results"],
    "reusable_in": ["Any design task requiring visual research"]
  }
]
```

#### 3.1.4 Projects (Проекты) - NEW v2.0

```json
"projects": [
  {
    "project_id": "PRJ-001",
    "project_name": "AI_App_Design_System_Setup",
    "department": "Design / Development",
    "description": "Establish consistent design system",
    "duration": "Less than 1 hour",
    "complexity": "Medium",
    "phases": [
      {
        "phase_name": "Style Extraction",
        "description": "Analyze visual inspiration",
        "duration": "5-10 minutes",
        "output": "design.json file",
        "milestones": ["MLS-001"]
      }
    ]
  }
]
```

#### 3.2 Action Verbs (Глаголы действий)

7 категорий глаголов:

| Категория | Описание | Примеры |
|-----------|----------|---------|
| `creation_verbs` | Создание | Create, Generate, Design, Build |
| `modification_verbs` | Изменение | Edit, Update, Refine, Optimize |
| `analysis_verbs` | Анализ | Analyze, Review, Evaluate, Research |
| `organization_verbs` | Организация | Organize, Structure, Categorize |
| `communication_verbs` | Коммуникация | Present, Share, Publish, Send |
| `browser_agentic_operations` | Агентные операции | Navigate, Click, Execute, Watch |
| `data_operations` | Операции с данными | Parse, Extract, Scrape, Import |

#### 3.3 Task Chains (Цепочки задач)

Формат: `Step1 → Step2 → Step3 → Output`

```json
"task_chains": [
  "Email Received → Domain Check → Subject Check → AI Parse → Database Update",
  "Webhook Request → Authorization → Fetch Data → JSON Response"
]
```

#### 3.4 Skills (Навыки) - NEW v2.0

```json
"skills": [
  {
    "skill_id": "SKL-001",
    "skill_name": "Analyze Design Styles via Cursor",
    "skill_phrase": "analyzed design styles via Cursor",
    "difficulty": "Beginner",        // Beginner | Intermediate | Advanced | Expert
    "professions": ["UI/UX Designer", "AI Prompt Engineer"],
    "parent_tasks": ["TSK-001"],
    "workflows": ["WF-DGN-009-01"],
    "tools_required": ["Cursor", "GPT-5"],
    "time_to_learn": "10 minutes",
    "description": "Ability to use Cursor with GPT-5 to analyze UI screenshots"
  }
]
```

#### 3.5 Professions (Профессии) - NEW v2.0

```json
"professions": [
  {
    "profession_id": "PRF-001",
    "role_name": "Content Creator",
    "department": "SMM;VID",
    "description": "Creates digital content",
    "related_skills": ["SKL-001", "SKL-002"],
    "related_tools": ["TOL-001", "TOL-002"]
  }
]
```

#### 3.6 Tools Matrix (Матрица инструментов)

```json
"tools_matrix": [
  {
    "tool_id": "TOOL-AUT-001",       // ID: TOOL-{CATEGORY}-{SEQ} или TOL-XXX
    "tool": "n8n",
    "category": "Automation",
    "purpose": "Workflow automation platform",
    "used_for": "Email processing, webhooks",
    "vendor": "n8n GmbH",
    "department": "AID;DEV",         // NEW v2.0
    "source_video": "Video_026",     // NEW v2.0
    "integrations": ["Google Sheets", "Email"],
    "related_tools": ["Make.com"],   // NEW v2.0
    "mentioned_with": ["Zapier"]     // NEW v2.0
  }
]
```

#### 3.5 Objects & Deliverables (Объекты и результаты)

```json
"objects_deliverables": [
  {
    "object_id": "OBJ-DAT-026-01",   // ID: OBJ-{TYPE}-{VIDEO}-{SEQ}
    "name": "Sales Database Schema",
    "type": "Data_Asset",            // Design_Deliverable | Document | Media_Object | Data_Asset | Code_Artifact
    "description": "...",
    "related_tools": ["Google Sheets"],
    "related_workflows": ["WF-AID-026-01"]
  }
]
```

#### 3.8 Integration Patterns (Паттерны интеграции)

```json
"integration_patterns": [
  {
    "pattern_id": "INT-EML-026-01",
    "integration": "Email + n8n + AI Agent",
    "purpose": "Extract structured data from emails",
    "entity_chain": "OBJ-001 → TOL-001 → ACT-001 → OBJ-002",  // NEW v2.0
    "flow": "Email Body → Filters → AI Parser → Structured JSON",
    "department": "AID;VID",         // NEW v2.0
    "professions": ["PRF-001"]       // NEW v2.0
  }
]
```

#### 3.9 Entities Summary (Сводка сущностей) - NEW v2.0

```json
"entities_summary": {
  "total_entities": 37,
  "tools_count": 9,
  "workflows_count": 4,
  "actions_count": 13,
  "objects_count": 6,
  "skills_count": 3,
  "professions_count": 5,
  "primary_department": "AID",
  "secondary_departments": ["DEV", "SMM", "VID"]
}
```

#### 3.10 Hierarchy Trees (Иерархические деревья) - NEW v2.0

```json
"hierarchy_trees": [
  {
    "tree_name": "Web App Development Workflow Tree",
    "root_entity": "WRF-004 (Build and Deploy a Web App)",
    "children": [
      "TOL-003 (Google AI Studio - Build)",
      "TOL-008 (Google Cloud Run)",
      "OBJ-003 (Web App)",
      "ACT-009 (Build)",
      "SKL-002 (Web Application Development)"
    ]
  }
]
```

#### 3.11 Department Distribution (Распределение по департаментам) - NEW v2.0

```json
"department_distribution": {
  "AID": { "tools": 6, "workflows": 2, "actions": 6, "total": 18 },
  "DEV": { "tools": 3, "workflows": 1, "actions": 3, "total": 11 },
  "SMM": { "tools": 3, "workflows": 2, "actions": 1, "total": 10 }
}
```

#### 3.12 Reusability Analysis (Анализ повторного использования) - NEW v2.0

```json
"reusability_analysis": [
  {
    "entity_type": "task",
    "entity_id": "TSK-001",
    "reusable_in": ["New app kickoff", "Website redesigns", "Brand identity"],
    "variations": ["EXTRACT_COLOR-PALETTE_FROM_IMAGE"],
    "similar_entities": ["TSK-002", "TSK-003"]
  }
]
```

#### 3.13 Success Metrics (Метрики успеха) - NEW v2.0

```json
"success_metrics": [
  {
    "metric_name": "Design Quality",
    "workflow_or_task": "AI-Assisted Design System Generation",
    "value": "Incredible looking design",
    "context": "Compared to generic AI output",
    "benchmark": "Match quality of professionally designed system"
  },
  {
    "metric_name": "Enrichment Rate",
    "workflow_or_task": "Lead Enrichment Pipeline",
    "value": "70-80%",
    "context": "Valid emails from company domains",
    "benchmark": "Industry average 40-50%"
  }
]
```

### 4. Processing Status (Статус обработки)

```json
"processing_status": {
  "phase_1_transcription": "complete",    // pending | in_progress | complete
  "phase_2_naming": "complete",           // + skipped
  "phase_3_analysis": "complete",
  "phase_4_objects": "pending",
  "phase_5_gap_analysis": "pending",
  "phase_6_taxonomy_updates": "pending",
  "phase_7_reporting": "pending",
  "last_updated": "2025-12-01T12:00:00Z",
  "updated_by": "Username"
}
```

---

## Идентификаторы (ID Conventions)

| Тип | Формат | Пример |
|-----|--------|--------|
| Video ID | `Video_XXX` | `Video_026` |
| Workflow ID | `WF-{DEPT}-{VIDEO}-{SEQ}` | `WF-AID-026-01` |
| Tool ID | `TOOL-{CAT}-{SEQ}` | `TOOL-AUT-001` |
| Object ID | `OBJ-{TYPE}-{VIDEO}-{SEQ}` | `OBJ-DAT-026-01` |
| Pattern ID | `INT-{TYPE}-{VIDEO}-{SEQ}` | `INT-EML-026-01` |
| Technique ID | `OPT-{TYPE}-{VIDEO}-{SEQ}` | `OPT-SEC-026-01` |

### Коды департаментов (DEPT)

| Код | Департамент |
|-----|-------------|
| AID | AI & Automations |
| DEV | Development |
| DGN | Design |
| VID | Video Production |
| HRM | Human Resources |
| SLS | Sales |
| MKT | Marketing |
| SMM | Social Media |
| OPS | Operations |

### Категории инструментов (CAT)

| Код | Категория |
|-----|-----------|
| AUT | Automation |
| AI | AI/ML |
| DAT | Database |
| NOC | No-Code |
| DEV | Development |
| CRM | CRM Systems |
| COM | Communication |

---

## Использование

### Создание новой транскрипции

1. Скопируйте `transcription_template.json`
2. Переименуйте в `video_{id}.json`
3. Заполните обязательные поля:
   - `video_id`
   - `video_title`
   - `metadata.duration`
   - `transcription` (массив)
4. По мере анализа заполняйте `taxonomy_analysis`
5. Обновляйте `processing_status`

### Валидация JSON

```bash
# Используя ajv-cli
npx ajv validate -s transcription_schema.json -d your_file.json
```

### Конвертация из Markdown

Для конвертации существующих `.md` файлов:
1. Извлеките метаданные из заголовков
2. Парсите транскрипцию по timestamp паттерну `[MM:SS]`
3. Извлеките taxonomy_analysis из структурированных секций

---

## Совместимость с существующими форматами

Схема поддерживает оба существующих формата из `02_TRANSCRIPTIONS/`:

### Формат 1: Чистый JSON массив (Video_026.md)
```json
[{ "video_title": "...", "transcript": [...] }]
```
→ Конвертируется в корневой объект с `transcription`

### Формат 2: JSON объект с taxonomy (Video_025.md, Video_021.md)
```json
{
  "Video Title": "...",
  "metadata": {...},
  "TAXONOMY ANALYSIS": {...}
}
```
→ Нормализуются ключи (camelCase/snake_case → стандартный формат)

---

## Примеры

### Минимальный валидный файл

```json
{
  "video_id": "Video_027",
  "video_title": "My Video Title",
  "metadata": {
    "duration": "15:30"
  },
  "transcription": [
    {
      "start": "00:00",
      "text": "Hello and welcome..."
    }
  ]
}
```

### Полный файл с анализом

См. `example_video_026.json` для полного примера со всеми полями.

---

### 4. Provenance (Происхождение) - NEW v2.0

```json
"provenance": {
  "taxonomy_status": "Pending_Review",   // Pending_Review | Approved | Ready_for_Import
  "ready_for_import": true,
  "validation_required": true,
  "notes": "All new entities require review",
  "main_topics": ["Google AI Studio tutorial", "No-code web app generation"],
  "key_workflows": ["WRF-004 (Build and Deploy a Web App)"],
  "notable_tools": ["Google AI Studio", "Veo", "Cloud Run"]
}
```

---

## Версионирование

| Версия | Дата | Изменения |
|--------|------|-----------|
| 2.0.0 | 2025-12-01 | **Полное обновление** после анализа всех форматов из 02_TRANSCRIPTIONS: +milestones, +tasks, +steps, +projects, +skills, +professions, +entities_summary, +hierarchy_trees, +department_distribution, +reusability_analysis, +success_metrics, +provenance, расширенные metadata и tools_matrix |
| 1.0.0 | 2025-12-01 | Начальная версия на основе анализа 26 видео |

---

## Связанные ресурсы

- **Исходные транскрипции:** `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/`
- **Методологические промпты:** `ENTITIES/TASK_MANAGERS/RESEARCHES/01_PROMPTS/Video_Transcription/`
- **Индекс видео:** `02_TRANSCRIPTIONS/VIDEOS_INDEX.md`
- **README транскрипций:** `02_TRANSCRIPTIONS/README.md`

