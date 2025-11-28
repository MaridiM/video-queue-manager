# 📊 Цикл работы RESEARCHES System

**Дата создания:** 2025-11-28
**Статус:** ✅ Production Ready
**Версия:** 2.0 (Post-Restructure)

---

Это **7-фазовая система** для исследования, обработки и интеграции видео-контента в экосистему таксономии.

---

## 🔄 Визуальная схема полного цикла

```
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 0: SEARCH QUEUE                           │
   │  📋 00_SEARCH_QUEUE/                                               │
   │  • Анализ еженедельных отчётов → определение пробелов              │
   │  • Генерация поисковых запросов по департаментам                   │
   │  • Назначение задач сотрудникам (Search_Queue_Master.csv)          │
   │  • Сотрудник выполняет поиск (Perplexity, Gemini, YouTube)         │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 0→1: VIDEO QUEUE                          │
   │  🎬 01_VIDEO_QUEUE/                                                │
   │  • Накопление найденных видео (до 20 шт. от одного поиска)         │
   │  • Автоматический расчёт приоритета (views, likes, recency)        │
   │  • Ручной отбор видео для транскрипции                             │
   │  • Статусы: Pending → Selected → Parsing → Parsed / Rejected       │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 1: TRANSCRIPTION                          │
   │  📝 02_TRANSCRIPTIONS/                                             │
   │  • Полная транскрипция видео с timestamps                          │
   │  • PMT-004: Video Transcription v4.1                               │
   │  • Извлечение 37+ сущностей:                                       │
   │    - Workflows (WRF-###), Tools (TOL-###)                          │
   │    - Action verbs (7 категорий), Objects (OBJ-###)                 │
   │    - Integration patterns, Task chains                             │
   │  • Output: Video_XXX.md                                            │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 2: EXTRACTION                             │
   │  🔍 03_ANALYSIS/Extractions/                                       │
   │  • Глубокое извлечение сущностей                                   │
   │  • PMT-007: Objects Library Extraction                             │
   │  • Извлекаем ВСЕ типы сущностей:                                   │
   │    - Objects, Tools, Actions, Workflows                            │
   │    - Professions, Skills, Departments                              │
   │  • Создаём перекрёстные ссылки (bidirectional links)               │
   │  • Output: Video_XXX_Phase3_Analysis.md                            │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 3: GAP ANALYSIS                           │
   │  📊 03_ANALYSIS/Gap_Analysis/                                      │
   │  • Сравнение с существующей таксономией                            │
   │  • PMT-009 Part 1: Taxonomy Integration                            │
   │  • Определяем: NEW vs EXISTING сущности                            │
   │  • Приоритизация по уровням: Critical/High/Medium/Low              │
   │  • Обнаружение дубликатов                                          │
   │  • Output: Video_XXX_Gap_Analysis.md                               │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 4: INTEGRATION                            │
   │  🔧 04_INTEGRATION/                                                │
   │  • Создание JSON файлов для новых сущностей                        │
   │  • PMT-009 Part 2: Taxonomy Integration                            │
   │  • Обновление мастер-реестров                                      │
   │  • Перемещение файлов в LIBRARIES/                                 │
   │  • Output: JSON files → LIBRARIES/Tools/, Actions/, etc.           │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
   ┌────────────────────────────────────────────────────────────────────┐
   │                    PHASE 5: LIBRARY MAPPING                        │
   │  📚 03_ANALYSIS/Library_Mapping/                                   │
   │  • Финальная документация и отчётность                             │
   │  • PMT-009 Part 3: Taxonomy Integration                            │
   │  • Генерация отчёта о маппинге                                     │
   │  • Проверка bidirectional links                                    │
   │  • Output: Video_XXX_Library_Mapping_Report.md                     │
   └──────────────────────────────┬─────────────────────────────────────┘
                                  ↓
                          ✅ COMPLETE STATUS
```

---

## 📁 Детальное описание каждой фазы

### 📋 Phase 0: Search Queue (`00_SEARCH_QUEUE/`)

**Цель:** Управление заданиями на поиск видео

**Файлы:**
- `Search_Queue_Master.csv` — база активных поисковых заданий
- `Search_Prompts/` — сгенерированные поисковые запросы
- `Active_Searches/` — поиски в процессе
- `Completed_Searches/` — завершённые поиски

**Workflow:**
1. **Weekly Report Analysis** → Identifies research gaps
2. **Search Prompt Generation** → Creates targeted search queries
3. **Search Assignment** → Assigns to employees
4. **Search Execution** → Employee runs searches
5. **Video Discovery** → Results added to VIDEO_QUEUE

**Команды:**
```bash
# Назначить задачу поиска
python scripts/assign_search.py "Employee Name" "Department" "Research Topic"

# Завершить поиск
python scripts/complete_search.py SEARCH-001 --videos-found 15
```

---

### 🎬 Phase 0→1: Video Queue (`01_VIDEO_QUEUE/`)

**Цель:** Накопление и приоритизация найденных видео

**Проблема ДО:** Сотрудник находит 20 видео → выбирает 1 (10-15 мин) → 19 видео теряются

**Решение ПОСЛЕ:** Все 20 видео накапливаются → ручной обзор за 2-3 мин → batch-обработка

**Статусы видео:**
```
Pending → Selected → Parsing → Parsed
    ↓
Rejected
```

**Priority Score (0-100):**
| Компонент | Вес | Максимум |
|-----------|-----|----------|
| Views | 30% | 1M views = 30 points |
| Likes | 20% | 50K likes = 20 points |
| Recency | 30% | новое видео = 30 points |
| Engagement | 20% | likes/views 1% = 20 points |

**Уровни приоритета:**
- **High Priority (70-100):** Viral, recent, high engagement
- **Medium Priority (40-69):** Good performance, moderate recency
- **Low Priority (0-39):** Older or lower performing

**Команды:**
```bash
# Добавить видео
python scripts/add_video_to_queue.py "URL" "Employee" "Topic" "Source" "Notes"

# Обновить статус
python scripts/update_queue_status.py update VQ-001 Selected "Employee Name"

# Просмотр сводки
python scripts/update_queue_status.py summary
```

---

### 📝 Phase 1: Transcription (`02_TRANSCRIPTIONS/`)

**Цель:** Полная транскрипция с таксономическим анализом

**Промпт:** PMT-004 Video Transcription v4.1

**Извлекаемые сущности (37+):**
| Тип | ID формат | Примеры |
|-----|-----------|---------|
| Workflows | WRF-### | Email parsing workflow, Dashboard generation |
| Tools | TOL-### | n8n, Lovable, Deepseek R1 |
| Action verbs | ACT-### | create, configure, parse, aggregate |
| Objects | OBJ-### | dashboards, reports, scripts |
| Integration patterns | - | API connections, webhooks |
| Task chains | - | Sequential process steps |

**Категории Action verbs (7):**
1. Creation
2. Modification
3. Analysis
4. Organization
5. Communication
6. Integration
7. Configuration

**Выходной файл:** `Video_XXX.md` с структурированной транскрипцией

**Формат транскрипции:**
```markdown
# Video Title

## Metadata
- Channel: ...
- URL: ...
- Duration: ...

## Full Transcription
[00:00] Speaker: Text...
[00:30] Speaker: More text...

## Taxonomy Analysis
### Workflows Identified
...
```

---

### 🔍 Phase 2: Extraction (`03_ANALYSIS/Extractions/`)

**Цель:** Глубокое извлечение ВСЕХ типов сущностей

**Промпт:** PMT-007 Objects Library Extraction

**Что извлекаем:**
| Тип | Описание | Пример |
|-----|----------|--------|
| Objects | Deliverables, outputs | thumbnails, videos, scripts, dashboards |
| Tools | Software, platforms | n8n, Lovable, Deepseek R1, Google Sheets |
| Actions | Operations, verbs | create, configure, parse, aggregate, filter |
| Workflows | Process sequences | Email parsing → AI extraction → Storage |
| Professions | Roles | Automation Engineer, Sales Analyst |
| Skills | Competencies | API integration, Data visualization |
| Departments | Org units | BIZ, AUT, DEV, FIN |

**Перекрёстные ссылки (Cross-references):**
- Object ↔ Tools (какие инструменты создают объект)
- Object ↔ Actions (какие действия с объектом)
- Object ↔ Workflows (в каких процессах используется)
- Object ↔ Professions (кто работает с объектом)

**Выход:** `Video_XXX_Phase3_Analysis.md`

---

### 📊 Phase 3: Gap Analysis (`03_ANALYSIS/Gap_Analysis/`)

**Цель:** Сравнение с существующей таксономией

**Промпт:** PMT-009 Part 1: Taxonomy Integration

**Процесс:**
1. **Inventory Check** — список всех tools/concepts из видео
2. **Taxonomy Search** — проверка существования в LIBRARIES
3. **Gap Scoring** — приоритизация недостающих элементов
4. **Coverage Calculation** — Existing items / Total items = Coverage %
5. **Recommendations** — список элементов для добавления/улучшения

**Уровни приоритета:**
| Уровень | Определение | Действие |
|---------|-------------|----------|
| **Critical** | Core tool central to workflow | Create immediately |
| **High** | Supporting tool heavily referenced | Create within session |
| **Medium** | Mentioned tool with clear use case | Create if time permits |
| **Low** | Briefly mentioned, minimal context | Add to backlog |

**Выход:** `Video_XXX_Gap_Analysis.md`

---

### 🔧 Phase 4: Integration (`04_INTEGRATION/`)

**Цель:** Создание JSON файлов и интеграция в таксономию

**Промпт:** PMT-009 Part 2: Taxonomy Integration

**Действия:**
1. Create JSON files for new entities
2. Update master registries
3. Move files to LIBRARIES/
4. Establish bidirectional cross-references

**Выходные пути:**
| Тип сущности | Путь назначения |
|--------------|-----------------|
| Tools | `ENTITIES/LIBRARIES/Tools/TOOL-{CATEGORY}-###.json` |
| Actions | `ENTITIES/LIBRARIES/Actions/Actions_Master.json` |
| Objects | `ENTITIES/LIBRARIES/Responsibilities/Objects/` |
| Professions | `ENTITIES/LIBRARIES/Responsibilities/Professions/` |
| Skills | `ENTITIES/LIBRARIES/Skills/` |
| Workflows | `ENTITIES/TASK_MANAGERS/TSM-006_Workflows/WRF-###.json` |

**Формат JSON для Tool:**
```json
{
  "tool_id": "TOL-AI-XXX",
  "name": "Tool Name",
  "category": "AI/Automation",
  "vendor": "Company",
  "purpose": "Description",
  "use_cases": ["Use case 1", "Use case 2"],
  "integrations": ["Tool A", "Tool B"],
  "source_video": "Video_XXX"
}
```

---

### 📚 Phase 5: Library Mapping (`03_ANALYSIS/Library_Mapping/`)

**Цель:** Финальная документация и верификация

**Промпт:** PMT-009 Part 3: Taxonomy Integration

**Содержание отчёта:**
- Coverage metrics (before/after)
- Gap analysis results
- Files created/modified
- Business value and insights
- Recommendations for future

**Выход:** `Video_XXX_Library_Mapping_Report.md`

**Пример метрик покрытия:**
| Метрика | До | После | Улучшение |
|---------|----|---------| ----------|
| Tools | 40% (3/7) | 95% (7/7) | +55% |
| Workflows | 0% | 100% (12 new) | +12 workflows |
| Actions | 60% | 90% | +30% |

---

## ⏱️ Временные оценки

| Фаза | Время | Уровень автоматизации |
|------|-------|-----------------------|
| Phase 0: Search Queue | 5-10 мин | ✅ Полная автоматизация |
| Phase 0→1: Video Queue | 2-5 мин | ✅ Полная автоматизация |
| Phase 1: Transcription | 1-2 часа | ✅ Автоматизировано (с промптом) |
| Phase 2: Extraction | 20-45 мин | 🔄 Полуавтоматическая |
| Phase 3: Gap Analysis | 30-45 мин | 🔄 Полуавтоматическая |
| Phase 4: Integration | 45-60 мин | ⚠️ Ручная (JSON создание) |
| Phase 5: Mapping | 20-30 мин | 🔄 Полуавтоматическая |

**Общее время на полную обработку видео:** 3-5 часов

---

## 📈 Текущие метрики системы

| Метрика | Значение |
|---------|----------|
| Обработано видео | 26+ (Video_001 - Video_026) |
| Скриптов автоматизации | 14 Python scripts |
| Промптов | 50+ исследовательских |
| Ускорение после реструктуризации | ~25% |
| Сущностей на видео | 37+ (PMT-004 v4.0+) |

---

## 🛠️ Полный список скриптов

### Search Queue Scripts (2)
| Скрипт | Назначение |
|--------|------------|
| `assign_search.py` | Назначить поисковую задачу сотруднику |
| `complete_search.py` | Отметить поиск завершённым |

### Video Queue Scripts (6)
| Скрипт | Назначение |
|--------|------------|
| `add_video_to_queue.py` | Добавить видео с полными метаданными |
| `add_video_to_queue_simple.py` | Быстрое добавление видео |
| `update_queue_status.py` | Обновить статус видео |
| `calculate_priority.py` | Рассчитать/обновить priority score |
| `export_queue.py` | Экспорт в CSV/JSON/Markdown |
| `video_queue_manager.py` | Интерактивный CLI менеджер |

### Progress Tracking Scripts (2)
| Скрипт | Назначение |
|--------|------------|
| `update_video_progress.py` | Отслеживание видео через 7 фаз |
| `generate_progress_report.py` | Генерация summary/detailed/weekly отчётов |

### Utility Scripts (4)
| Скрипт | Назначение |
|--------|------------|
| `config.py` | Управление конфигурацией |
| `utils.py` | Общие утилиты |
| `video_id_scanner.py` | Валидация video IDs |

---

## 📚 Связанная документация

- **System Overview:** `ENTITIES/TASK_MANAGERS/RESEARCHES/SYSTEM_OVERVIEW.md`
- **Scripts Inventory:** `ENTITIES/TASK_MANAGERS/RESEARCHES/SCRIPTS_INVENTORY.md`
- **Video Transcription Prompts:** `ENTITIES/TASK_MANAGERS/RESEARCHES/PROMPTS/Video_Transcription/`
- **Taxonomy Integration:** `ENTITIES/TASK_MANAGERS/RESEARCHES/PROMPTS/Taxonomy_Integration/`

---

## 📞 Контакты и поддержка

**Maintained By:** Taxonomy Team
**Last Update:** 2025-11-28
**Status:** ✅ Production Ready

---

**End of Document**

