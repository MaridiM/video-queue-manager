# RESEARCHES - Scripts Documentation

> Документация всех скриптов для обработки видео и управления исследованиями.

**Дата обновления:** 2025-11-28  
**Расположение скриптов:** `ENTITIES/TASK_MANAGERS/RESEARCHES/`

---

## 📁 Структура папок RESEARCHES

```
RESEARCHES/
├── 00_SEARCH_QUEUE/        # Очередь поиска видео
│   ├── scripts/            # Скрипты управления поиском
│   ├── Active_Searches/    # Активные поисковые задания
│   ├── Completed_Searches/ # Завершённые поиски
│   └── Search_Queue_Master.csv
│
├── 01_VIDEO_QUEUE/         # Очередь видео для обработки
│   ├── scripts/            # Скрипты управления очередью
│   └── Video_Queue_Master.csv
│
├── 02_TRANSCRIPTIONS/      # Транскрипции видео
│   └── Video_XXX.md        # Файлы транскрипций
│
├── 03_ANALYSIS/            # Gap-анализ и отчёты
│   ├── Extractions/
│   ├── Gap_Analysis/
│   ├── Library_Mapping/
│   └── Phase_Reports/
│
├── 04_INTEGRATION/         # Интеграция в LIBRARIES
│
├── 05_NEXT_DEVELOPMENT/    # Планы разработки
│
└── scripts/                # Главные скрипты обработки
```

---

## 🔍 00_SEARCH_QUEUE - Скрипты поиска

### `assign_search.py`

**Назначение:** Создание нового задания на поиск видео для сотрудника.

**Использование:**
```bash
python assign_search.py <employee> <department> <topic> [search_query] [notes]
```

**Пример:**
```bash
python assign_search.py "John Doe" "AI" "Claude AI tutorials" "Claude tutorial" "Focus on recent videos"
```

**Функционал:**
- Генерирует уникальный `SEARCH-XXX` ID
- Создаёт запись в `Search_Queue_Master.csv`
- Устанавливает статус "Assigned"
- Записывает дату назначения

**Поля в CSV:**
- `Search_ID` - уникальный идентификатор
- `Employee` - исполнитель
- `Department` - отдел
- `Topic` - тема поиска
- `Search_Query` - поисковый запрос
- `Status` - статус (Assigned/In Progress/Completed)
- `Videos_Found` - количество найденных видео
- `Date_Assigned` - дата назначения
- `Date_Completed` - дата завершения
- `Notes` - заметки

---

### `complete_search.py`

**Назначение:** Завершение поискового задания с записью результатов.

**Использование:**
```bash
python complete_search.py <search_id> <videos_found> [notes]
```

**Пример:**
```bash
python complete_search.py SEARCH-001 15 "Found good tutorials on n8n automation"
```

**Функционал:**
- Находит запись по Search_ID
- Обновляет статус на "Completed"
- Записывает количество найденных видео
- Записывает дату завершения
- Добавляет заметки

---

## 📹 01_VIDEO_QUEUE - Скрипты очереди видео

### `add_video_to_queue.py` / `add_video_to_queue_simple.py`

**Назначение:** Добавление видео в очередь обработки.

> `_simple.py` - версия без pandas (только стандартная библиотека)

**Использование:**
```bash
python add_video_to_queue.py <video_url> <added_by> <topic> <source> [notes]
```

**Пример:**
```bash
python add_video_to_queue.py \
  "https://youtube.com/watch?v=dQw4w9WgXcQ" \
  "Niko Kar" \
  "UI Design Trends" \
  "Perplexity" \
  "Found via deep research on 2025 design trends"
```

**Функционал:**
- Извлекает YouTube Video ID из URL
- Проверяет дубликаты в очереди
- Генерирует уникальный `VQ-XXX` Queue ID
- Автоматически рассчитывает Priority Score
- Сохраняет метаданные в `Video_Queue_Master.csv`

**Поддерживаемые форматы URL:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

**Источники (Research Source):**
- `Perplexity`
- `Gemini`
- `GPT`
- `DeepSeek`
- `YouTube`

---

### `calculate_priority.py`

**Назначение:** Расчёт приоритетного рейтинга видео (0-100).

**Использование:**
```bash
python calculate_priority.py <views> <likes> <publish_date>
```

**Пример:**
```bash
python calculate_priority.py 1500000 45000 2025-10-15
```

**Алгоритм расчёта (0-100 баллов):**

| Компонент | Вес | Описание |
|-----------|-----|----------|
| **Views Score** | 30% | 1M views = max 30 баллов |
| **Likes Score** | 20% | 50K likes = max 20 баллов |
| **Recency Score** | 30% | Новые видео → высокий балл, линейное снижение за 365 дней |
| **Engagement Score** | 20% | Соотношение likes/views, 1% engagement = 20 баллов |

**Пример вывода:**
```
Priority Score: 67.50/100

Breakdown:
  Views: 15.00/30
  Likes: 18.00/20
  Recency: 27.50/30
  Engagement: 7.00/20
```

---

### `update_queue_status.py`

**Назначение:** Обновление статуса видео в очереди.

**Использование:**
```bash
# Обновить статус конкретного видео
python update_queue_status.py update <queue_id> <status> [selected_by]

# Показать сводку очереди
python update_queue_status.py summary

# Показать видео по статусу
python update_queue_status.py list <status>
```

**Примеры:**
```bash
python update_queue_status.py update VQ-001 Selected "Niko Kar"
python update_queue_status.py update VQ-002 Parsed
python update_queue_status.py summary
python update_queue_status.py list Pending
```

**Доступные статусы:**
- `Pending` - ожидает обработки
- `Selected` - выбрано для обработки
- `Parsing` - в процессе парсинга
- `Parsed` - парсинг завершён
- `Rejected` - отклонено

**Автоматические поля:**
- `Selected_Date` - при переходе в Selected
- `Parsed_Date` - при переходе в Parsed

---

### `export_queue.py`

**Назначение:** Экспорт очереди в различные форматы.

**Использование:**
```bash
python export_queue.py <format> [status_filter]
```

**Форматы:**
- `csv` - CSV таблица
- `json` - JSON с метаданными
- `markdown` - Markdown с таблицей и детальным списком
- `all` - все форматы сразу

**Примеры:**
```bash
python export_queue.py csv
python export_queue.py json Pending
python export_queue.py markdown Selected
python export_queue.py all
```

**Экспортируемые файлы:**
```
01_VIDEO_QUEUE/exports/
├── queue_export_2025-11-28.csv
├── queue_export_2025-11-28.json
└── queue_export_2025-11-28.md
```

---

### `video_queue_manager.py`

**Назначение:** Полноценный менеджер очереди видео с CLI интерфейсом.

**Использование:**
```bash
python video_queue_manager.py init                    # Создать новую очередь
python video_queue_manager.py add --video video.json  # Добавить видео
python video_queue_manager.py process                 # Обработать следующее видео
python video_queue_manager.py batch --max 5           # Обработать пакет видео
python video_queue_manager.py complete --video VIDEO_001  # Отметить как завершённое
python video_queue_manager.py status                  # Показать статус очереди
```

**Автовыбор метода транскрипции:**
| Условие | Метод |
|---------|-------|
| ≤ 40 минут И ≤ 100MB | Google AI Studio |
| > 40 минут ИЛИ > 100MB | TurboScribe |

**Формат очереди (JSON):**
```json
{
  "queue_id": "QUEUE_2025-11-28_143022",
  "created_date": "2025-11-28T14:30:22",
  "total_videos": 15,
  "status": "active",
  "videos": [...],
  "statistics": {
    "queued": 10,
    "in_progress": 2,
    "completed": 3,
    "failed": 0
  }
}
```

---

## 🛠️ scripts/ - Главные скрипты обработки

### `process_video.py` ⭐ (Master Orchestrator)

**Назначение:** Полная автоматизация обработки видео (Фазы 5-7).

**Использование:**
```bash
python process_video.py Video_024
python process_video.py Video_024 --dry-run
python process_video.py Video_024 --auto-approve --skip-report
python process_video.py Video_024 --phase gap-analysis
```

**Флаги:**
| Флаг | Описание |
|------|----------|
| `--dry-run` | Превью без изменений |
| `--auto-approve` | Без подтверждений |
| `--skip-update` | Пропустить обновление JSON |
| `--skip-report` | Пропустить генерацию отчёта |
| `--phase` | Запустить только определённую фазу |

**Фазы обработки:**
1. **ID Scan** - поиск следующих доступных ID
2. **Gap Analysis** - анализ расхождений с LIBRARIES
3. **JSON Update** - обновление JSON файлов
4. **Report Generation** - создание отчёта интеграции

**Экономия времени:** 1.5-2 часа → 5-10 минут

---

### `video_id_scanner.py`

**Назначение:** Поиск следующих доступных ID сущностей во всех LIBRARIES.

**Использование:**
```bash
python video_id_scanner.py
python video_id_scanner.py --output json
python video_id_scanner.py --entity-type workflows
python video_id_scanner.py --validate
```

**Выходные данные:**
```json
{
  "workflows": "WRF-025",
  "actions": {
    "command": "ACTION-156",
    "master": "ACTION-203"
  },
  "objects": {
    "SMM": "OBJ-SMM-045",
    "VID": "OBJ-VID-032",
    "DEV": "OBJ-DEV-018",
    "AI": "OBJ-AI-027"
  },
  "skills": "SKL-065",
  "tools": {
    "AI": "TOOL-AI-223",
    "VID": "TOOL-VID-045"
  }
}
```

**Экономия времени:** 15-30 минут

---

### `video_gap_analyzer.py`

**Назначение:** Анализ расхождений между транскрипцией и существующими LIBRARIES.

**Использование:**
```bash
python video_gap_analyzer.py Video_023
python video_gap_analyzer.py Video_023 --output json
python video_gap_analyzer.py Video_023 --detailed
```

**Категории результатов:**
- **NEW** - новые сущности для добавления
- **EXISTS** - уже существует в LIBRARIES
- **UPDATE** - требует обновления (совпадение имени)

**Анализируемые типы:**
- Workflows (WRF-XXX)
- Actions (ACTION-XXX)
- Objects (OBJ-XXX-XXX)
- Skills (SKL-XXX)
- Tools (TOOL-XXX-XXX)
- Professions

**Экономия времени:** 30-45 минут

---

### `video_json_updater.py`

**Назначение:** Безопасное обновление JSON файлов LIBRARIES новыми сущностями.

**Использование:**
```bash
python video_json_updater.py Video_023 --dry-run
python video_json_updater.py Video_023 --auto-approve
python video_json_updater.py Video_023 --entity-type workflows
```

**Функционал:**
- Автоматическое создание резервных копий
- Валидация данных
- Сохранение cross-references
- Rollback при ошибках

**Создаваемые файлы:**
- `WRF-XXX_Workflow_Name.json` - workflows
- `Tool_Name.json` - tools
- `Profession_Name.json` - professions
- Обновление `actions_master.json`, `all_skills.json`

**Экономия времени:** 45-60 минут

---

### `video_integration_reporter.py`

**Назначение:** Генерация детальных отчётов интеграции.

**Использование:**
```bash
python video_integration_reporter.py Video_023
python video_integration_reporter.py Video_023 --format json
python video_integration_reporter.py Video_023 --include-cross-refs
```

**Содержимое отчёта:**
- Executive Summary
- Статистика по типам сущностей
- Детальные списки NEW/EXISTS/UPDATE
- Следующие доступные ID
- Cross-reference валидация
- Рекомендации

**Форматы выхода:**
- Markdown (`.md`)
- JSON (`.json`)

**Экономия времени:** 20-30 минут

---

### `update_video_progress.py`

**Назначение:** Отслеживание прогресса обработки видео.

**Использование:**
```bash
# Добавить видео в трекер
python update_video_progress.py add <video_number> <title> <youtube_url> <employee>

# Обновить фазу
python update_video_progress.py update <video_number> <phase_name> [notes]

# Просмотр прогресса
python update_video_progress.py view [video_number]
```

**Примеры:**
```bash
python update_video_progress.py add 22 "Claude AI Tutorial" "https://youtube.com/..." "John"
python update_video_progress.py update 22 Phase_1_Transcribed "Used PMT-004"
python update_video_progress.py view 22
python update_video_progress.py view  # все видео
```

**Фазы обработки:**
| Фаза | Описание | Промпт |
|------|----------|--------|
| `Phase_0_Queued` | Добавлено в очередь | - |
| `Phase_1_Transcribed` | Транскрипция + анализ | PMT-004 |
| `Phase_2_Extraction` | Извлечение сущностей | PMT-007 |
| `Phase_3_Gap_Analysis` | Gap-анализ | PMT-009 Part 1 |
| `Phase_4_Integration` | Интеграция в JSON | PMT-009 Part 2 |
| `Phase_5_Mapping` | Финальный маппинг | PMT-009 Part 3 |
| `Complete` | Завершено | - |

---

### `analyze_video_phases.py`

**Назначение:** Анализ статуса фаз обработки всех видео.

**Использование:**
```bash
python analyze_video_phases.py        # Таблица фаз
python analyze_video_phases.py gaps   # Детальный отчёт о пропусках
```

**Вывод:**
```
Video  Title                          Current Phase          P0   P1   P2   P3   P4   P5   Done
-----------------------------------------------------------------------------------------------
V001   Claude AI Complete Tutorial    P4 Integration         YES  YES  YES  YES  NO   NO   NO
V002   n8n Automation Workflow        P2 Extraction          YES  YES  YES  NO   NO   NO   NO
V003   Figma Design System            Complete               YES  YES  YES  YES  YES  YES  YES
```

**Функционал:**
- Поиск всех транскрибированных видео
- Анализ завершённости каждой фазы
- Выявление "узких мест" (bottlenecks)
- Рекомендации по следующим действиям

---

### `generate_progress_report.py`

**Назначение:** Генерация отчётов о прогрессе.

**Использование:**
```bash
python generate_progress_report.py summary   # Сводный отчёт
python generate_progress_report.py detailed  # Детальный отчёт
python generate_progress_report.py weekly    # Еженедельный отчёт
python generate_progress_report.py all       # Все отчёты
```

**Типы отчётов:**

| Тип | Содержимое |
|-----|------------|
| `summary` | Общая статистика, распределение по статусам и фазам |
| `detailed` | Полная информация по каждому видео |
| `weekly` | Активность за последние 7 дней |

**Файлы отчётов:**
```
REPORTS/
├── Progress_Summary_2025-11-28.md
├── Progress_Detailed_2025-11-28.md
└── Progress_Weekly_2025-11-28.md
```

---

### `check_prompts_compliance.py`

**Назначение:** Проверка промптов на соответствие актуальной структуре.

**Использование:**
```bash
python check_prompts_compliance.py        # Проверка compliance
python check_prompts_compliance.py stats  # Статистика по ссылкам
```

**Проверяемые элементы:**
- Устаревшие названия фаз
- Старые пути к директориям
- Ссылки на deprecated промпты (PMT-005, PMT-006)
- Форматы ID сущностей

**Рекомендации:**
- Обновление Phase_2_Named → Phase_1_Transcribed
- PMT-005/PMT-006 → PMT-004
- RESEARCHES/VIDEO_RESEARCHES → RESEARCHES/

---

### `verify_manual_integration.py`

**Назначение:** Проверка интеграции видео в LIBRARIES.

**Использование:**
```bash
python verify_manual_integration.py         # Стандартная проверка
python verify_manual_integration.py --deep  # Глубокое сканирование Dropbox
```

**Проверяемое:**
- Ссылки на видео в LIBRARIES JSON файлах
- Ссылки в Task Managers
- Наличие в Master List
- "Разбросанные" файлы по Dropbox (при --deep)

**Статусы:**
- `INTEGRATED` - найдены ссылки в LIBRARIES
- `PENDING` - есть сущности, но нет ссылок
- `NO ENTITIES` - нет извлечённых сущностей

---

## 📋 Вспомогательные файлы

### `config.py`

**Назначение:** Конфигурация путей и констант.

**Содержимое:**
```python
# Базовые пути
BASE_PATH = Path("C:/Users/Dell/Dropbox/ENTITIES")
LIBRARIES_PATH = BASE_PATH / "LIBRARIES"
RESEARCHES_PATH = BASE_PATH / "TASK_MANAGERS" / "RESEARCHES"

# Префиксы ID
WORKFLOW_PREFIX = "WRF"
ACTION_PREFIX = "ACTION"
SKILL_PREFIX = "SKL"

# Валидные коды отделов
VALID_DEPARTMENTS = ["AID", "DEV", "VID", "SMM", "DGN", "MKT", "HRM", "SLS", "LG", "OPS", "FIN", "LGL"]
```

---

### `utils.py`

**Назначение:** Общие утилиты для всех скриптов.

**Функции:**
- `load_json(path)` - безопасная загрузка JSON
- `save_json(path, data, backup=True)` - сохранение с бэкапом
- `backup_file(path)` - создание timestamped копии
- `get_next_id(existing_ids, prefix)` - генерация следующего ID
- `validate_entity_id(id, type)` - валидация формата ID
- `create_markdown_table(headers, rows)` - создание MD таблицы

---

### `markdown_parser.py`

**Назначение:** Парсинг Markdown транскрипций.

**Функционал:**
- Извлечение секций из транскрипций
- Парсинг CSV таблиц в Markdown
- Извлечение workflows, actions, objects, tools

---

## 🚀 Типичный workflow обработки видео

```bash
# 1. Добавить видео в очередь
python 01_VIDEO_QUEUE/scripts/add_video_to_queue.py \
  "https://youtube.com/watch?v=abc123" \
  "Employee Name" \
  "AI Automation" \
  "Perplexity"

# 2. Проверить статус очереди
python 01_VIDEO_QUEUE/scripts/update_queue_status.py summary

# 3. Выбрать видео для обработки
python 01_VIDEO_QUEUE/scripts/update_queue_status.py update VQ-001 Selected "Employee"

# 4. После транскрипции - обновить прогресс
python scripts/update_video_progress.py update 1 Phase_1_Transcribed "PMT-004 applied"

# 5. Запустить полную обработку
python scripts/process_video.py Video_001 --dry-run  # сначала preview
python scripts/process_video.py Video_001 --auto-approve  # потом выполнение

# 6. Проверить результат
python scripts/analyze_video_phases.py
```

---

## 📊 Экономия времени

| Процесс | Вручную | Автоматизировано |
|---------|---------|------------------|
| Поиск следующих ID | 15-30 мин | < 1 мин |
| Gap анализ | 30-45 мин | 2-3 мин |
| Обновление JSON | 45-60 мин | 3-5 мин |
| Генерация отчётов | 20-30 мин | < 1 мин |
| **ИТОГО на видео** | **1.5-2.5 часа** | **5-10 мин** |

---

## ⚠️ Требования

### Python пакеты:
```
pandas>=1.5.0    # для версии с pandas
papaparse        # для CSV обработки (JS)
```

### Структура файлов:
- Транскрипции в `02_TRANSCRIPTIONS/Video_XXX.md`
- Очередь в `01_VIDEO_QUEUE/Video_Queue_Master.csv`
- LIBRARIES в `ENTITIES/LIBRARIES/`

---

*Последнее обновление: 2025-11-28*

