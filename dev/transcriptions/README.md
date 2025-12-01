# Video Transcription JSON Schema

**Версия:** 1.0.0  
**Дата создания:** 2025-12-01  
**Расположение:** `apps/dev/transcriptions/`

---

## Обзор

Эта директория содержит JSON схему и шаблоны для стандартизированного хранения видео транскрипций с таксономическим анализом. Схема разработана на основе анализа 26+ видео файлов из `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/`.

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
  "duration": "13:32",               // Формат: MM:SS или HH:MM:SS
  "publication_date": "2025-01-15",
  "language": "en",
  "topics": ["Topic 1", "Topic 2"],
  "tools_referenced": ["n8n", "Lovable"],
  "links_referenced": [
    { "url": "https://...", "description": "..." }
  ]
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
    "workflow_id": "WF-AID-026-01",  // ID: WF-{DEPT}-{VIDEO}-{SEQ}
    "workflow_name": "Sales Email Ingestion Pipeline",
    "objective": "Описание цели",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "duration": "Real-time",
    "complexity": "High",            // Low | Medium | High | Critical
    "tools_used": ["n8n", "Google Sheets"],
    "input": "Sales notification emails",
    "output": "Structured sales record",
    "department": "AID"              // AID, DEV, DGN, VID, HRM, SLS, etc.
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

#### 3.4 Tools Matrix (Матрица инструментов)

```json
"tools_matrix": [
  {
    "tool_id": "TOOL-AUT-001",       // ID: TOOL-{CATEGORY}-{SEQ}
    "tool": "n8n",
    "category": "Automation",
    "purpose": "Workflow automation platform",
    "used_for": "Email processing, webhooks",
    "vendor": "n8n GmbH",
    "integrations": ["Google Sheets", "Email"]
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

#### 3.6 Integration Patterns (Паттерны интеграции)

```json
"integration_patterns": [
  {
    "pattern_id": "INT-EML-026-01",  // ID: INT-{TYPE}-{VIDEO}-{SEQ}
    "integration": "Email + n8n + AI Agent",
    "purpose": "Extract structured data from emails",
    "flow": "Email Body → Filters → AI Parser → Structured JSON"
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

## Версионирование

| Версия | Дата | Изменения |
|--------|------|-----------|
| 1.0.0 | 2025-12-01 | Начальная версия на основе анализа 26 видео |

---

## Связанные ресурсы

- **Исходные транскрипции:** `ENTITIES/TASK_MANAGERS/RESEARCHES/02_TRANSCRIPTIONS/`
- **Методологические промпты:** `ENTITIES/TASK_MANAGERS/RESEARCHES/01_PROMPTS/Video_Transcription/`
- **Индекс видео:** `02_TRANSCRIPTIONS/VIDEOS_INDEX.md`
- **README транскрипций:** `02_TRANSCRIPTIONS/README.md`

