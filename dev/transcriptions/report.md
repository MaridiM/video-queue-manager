# ✅ Анализ покрытия данных (v2.0)

## Сравнение с файлами из `02_TRANSCRIPTIONS`

| Поле из файлов             | Video_001 | Video_006 | Video_009 | Video_013 | Video_021 | Video_026 | **Схема v2.0**                                |
| -------------------------- | --------- | --------- | --------- | --------- | --------- | --------- | --------------------------------------------- |
| Video Title                | ✅         | ✅         | ✅         | ✅         | ✅         | ✅         | ✅ `video_title`                               |
| Description                | ✅         | ✅         | ✅         | ✅         | ✅         | ✅         | ✅ `description`                               |
| Duration                   | —         | ✅         | —         | ✅         | ✅         | —         | ✅ `metadata.duration`                         |
| Creator/Channel            | —         | ✅         | ✅         | ✅         | ✅         | —         | ✅ `metadata.creator`                          |
| Video URL                  | —         | ✅         | —         | ✅         | ✅         | —         | ✅ `metadata.video_url`                        |
| Publication Date           | —         | ✅         | —         | ✅         | —         | —         | ✅ `metadata.publication_date`                 |
| Timestamps (оглавление)    | ✅         | —         | —         | —         | —         | —         | ✅ `metadata.timestamps`                       |
| Subtitles info             | ✅         | —         | —         | —         | —         | —         | ✅ `metadata.subtitles_exist`                  |
| Hashtags                   | ✅         | —         | —         | —         | —         | —         | ✅ `metadata.hashtags`                         |
| Key Topics                 | ✅         | ✅         | ✅         | ✅         | ✅         | ✅         | ✅ `metadata.topics`                           |
| Links Referenced           | ✅         | ✅         | —         | ✅         | ✅         | —         | ✅ `metadata.links_referenced`                 |
| Tools Referenced           | —         | ✅         | ✅         | —         | —         | ✅         | ✅ `metadata.tools_referenced`                 |
| Transcription `[00:00]`    | ✅         | ✅         | ✅         | ✅         | ✅         | ✅         | ✅ `transcription[]`                           |
| Annotations [VISUAL]       | —         | —         | ✅         | —         | —         | —         | ✅ `transcription[].annotations`               |
| **TAXONOMY**               |           |           |           |           |           |           |                                               |
| Workflows                  | ✅         | ✅         | ✅         | —         | ✅         | ✅         | ✅ `taxonomy_analysis.workflows`               |
| Action Verbs (7 категорий) | —         | ✅         | —         | —         | ✅         | —         | ✅ `taxonomy_analysis.action_verbs`            |
| Task Chains                | —         | ✅         | —         | —         | ✅         | —         | ✅ `taxonomy_analysis.task_chains`             |
| Tools Matrix               | —         | ✅         | ✅         | —         | ✅         | —         | ✅ `taxonomy_analysis.tools_matrix`            |
| Objects/Deliverables       | —         | ✅         | —         | —         | —         | —         | ✅ `taxonomy_analysis.objects_deliverables`    |
| Integration Patterns       | —         | ✅         | —         | —         | ✅         | —         | ✅ `taxonomy_analysis.integration_patterns`    |
| Business Concepts          | —         | ✅         | —         | —         | —         | —         | ✅ `taxonomy_analysis.business_concepts`       |
| Optimization Techniques    | —         | ✅         | —         | —         | ✅         | —         | ✅ `taxonomy_analysis.optimization_techniques` |
| **ADVANCED (из v3.0+)**    |           |           |           |           |           |           |                                               |
| TASK Templates             | —         | —         | ✅         | —         | —         | —         | ✅ `taxonomy_analysis.tasks`                   |
| STEP Templates             | —         | —         | ✅         | —         | —         | —         | ✅ `taxonomy_analysis.steps`                   |
| Milestones (MLS)           | —         | —         | —         | —         | —         | —         | ✅ `taxonomy_analysis.milestones`              |
| Skills                     | —         | —         | ✅         | —         | —         | —         | ✅ `taxonomy_analysis.skills`                  |
| Professions                | —         | —         | —         | —         | —         | —         | ✅ `taxonomy_analysis.professions`             |
| Enrichment Rate            | —         | ✅         | —         | —         | —         | —         | ✅ `workflows[].enrichment_rate`               |
| Extractor Version          | —         | —         | —         | —         | —         | —         | ✅ `metadata.extractor_version`                |

## Результат проверки

| Категория             | Покрытие |
| --------------------- | -------- |
| **Metadata**          | 100% ✅   |
| **Transcription**     | 100% ✅   |
| **Taxonomy Analysis** | 100% ✅   |
| **Processing Status** | 100% ✅   |
| **Advanced Features** | 100% ✅   |

# Добавлено в v2.0 (относительно v1.0)

1. **Metadata расширения:**
   - `extraction_date` — дата обработки
   - `extractor_version` — версия промпта (v3.0, v3.1, v4.0)
   - `subtitles_exist` — флаг субтитров
   - `timestamps` — оглавление видео
   - `hashtags` — хештеги из описания

2. **Taxonomy Analysis расширения:**
   - `milestones` — вехи (MLS-XXX)
   - `tasks` — шаблоны задач (TSK-XXX)
   - `steps` — шаблоны шагов (STP-XXX)
   - `projects` — шаблоны проектов
   - `skills` — навыки с уровнями сложности
   - `professions` — профессиональные роли
   - `entities_summary` — сводка всех сущностей
   - `department_distribution` — распределение по департаментам
   - `hierarchy_trees` — иерархические связи
   - `reusability_analysis` — анализ повторного использования
   - `success_metrics` — метрики успеха

3. **Workflows расширения:**
   - `enrichment_rate` — метрика обогащения (для lead gen)
   - `related_entities` — связанные сущности
   - `status` — статус workflow

4. **Provenance (новая секция):**
   - `taxonomy_status` — статус таксономии
   - `ready_for_import` — готовность к импорту
   - `key_workflows`, `notable_tools`

**Вывод:** Схема v2.0 полностью покрывает все существующие форматы файлов без потери данных.