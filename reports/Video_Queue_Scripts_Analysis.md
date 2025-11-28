# 📊 Анализ функционала: Video Queue Scripts vs Web App

**Дата анализа:** 2025-11-28
**Источник:** `ENTITIES/TASK_MANAGERS/RESEARCHES/01_VIDEO_QUEUE/scripts/`

---

## Сравнительная таблица

| Функция | Python Scripts | Web App | Статус |
|---------|---------------|---------|--------|
| **Добавление видео** | ✅ Полный | ⚠️ Базовый | Частично |
| **Обновление статуса** | ✅ Полный | ⚠️ Базовый | Частично |
| **Расчёт приоритета** | ✅ Алгоритм | ❌ Нет | **Отсутствует** |
| **Экспорт CSV** | ✅ + фильтр статуса | ✅ Базовый | Частично |
| **Экспорт JSON** | ✅ + фильтр статуса | ✅ Базовый | Частично |
| **Экспорт Markdown** | ✅ Полный | ❌ Нет | **Отсутствует** |
| **Дублирование видео** | ✅ Проверка | ❌ Нет | **Отсутствует** |
| **Массовое обновление** | ✅ Batch update | ❌ Нет | **Отсутствует** |
| **Статистика очереди** | ✅ Summary | ⚠️ Минимальная | Частично |
| **Sync from CSV** | — | ✅ Да | ✅ Реализовано |

---

## 🔴 НЕ РЕАЛИЗОВАНО в Web App

### 1. Priority Score Calculation (`calculate_priority.py`)

**Алгоритм расчёта 0-100:**

| Компонент | Вес | Максимум | Формула |
|-----------|-----|----------|---------|
| Views | 30% | 30 points | `min(30, (views / 1_000_000) * 30)` |
| Likes | 20% | 20 points | `min(20, (likes / 50_000) * 20)` |
| Recency | 30% | 30 points | `max(0, 30 - (days_since_publish / 365) * 30)` |
| Engagement | 20% | 20 points | `min(20, (likes/views) * 2000)` |

**Код из скрипта:**
```python
def calculate_priority_score(video_metadata):
    views = int(video_metadata.get('views', 0))
    likes = int(video_metadata.get('likes', 0))
    publish_date = video_metadata.get('publish_date', datetime.now())
    
    # Views score (30% weight) - 1M views = max 30 points
    views_score = min(30, (views / 1000000) * 30)
    
    # Likes score (20% weight) - 50K likes = max 20 points
    likes_score = min(20, (likes / 50000) * 20)
    
    # Recency score (30% weight) - 30 points for brand new
    days_since_publish = (datetime.now() - publish_date).days
    recency_score = max(0, 30 - (days_since_publish / 365) * 30)
    
    # Engagement score (20% weight) - 1% engagement = 20 points
    if views > 0:
        engagement_rate = likes / views
        engagement_score = min(20, engagement_rate * 2000)
    else:
        engagement_score = 0
    
    return round(views_score + likes_score + recency_score + engagement_score, 2)
```

**В приложении:** Priority Score не рассчитывается автоматически

---

### 2. Duplicate Detection

**Код из скрипта:**
```python
# Проверка существующего видео по Video_ID
if not queue_df.empty and video_id in queue_df['Video_ID'].values:
    existing_queue_id = queue_df[queue_df['Video_ID'] == video_id]['Queue_ID'].values[0]
    print(f"⚠️ Video already in queue: {existing_queue_id}")
    return existing_queue_id
```

**В приложении:** Можно добавить одно и то же видео несколько раз без предупреждения

---

### 3. Export to Markdown (`export_queue.py`)

Генерирует красивый Markdown отчёт с:
- Сводкой по статусам
- Топ темами
- Таблицей видео
- Детальным листингом каждого видео

**Структура экспорта:**
```markdown
# Video Queue Export

**Export Date**: 2025-11-28 15:30:00
**Total Videos**: 45
**Status Filter**: All

---

## Summary

### By Status
- **Pending**: 20
- **Selected**: 8
- **Parsing**: 5
- **Parsed**: 10
- **Rejected**: 2

### Top Topics
- **AI Automation**: 15
- **Video Editing**: 12

---

## Videos

| Queue ID | Title | Channel | Topic | Status | Priority | Added By | Added Date |
|----------|-------|---------|-------|--------|----------|----------|------------|
| VQ-001 | Claude Desktop... | AI Explained | AI Dev | Selected | 85.5/100 | maria@ | 2025-11-28 |

---

## Detailed Listing

### VQ-001: Claude Desktop MCP Setup Tutorial

- **Channel**: AI Explained
- **Video URL**: https://youtube.com/watch?v=...
- **Views**: 1,500,000
- **Likes**: 45,000
...
```

**В приложении:** Только CSV и JSON экспорт

---

### 4. Status Filter for Export

**Использование в скриптах:**
```bash
python export_queue.py csv Pending    # Только Pending
python export_queue.py json Selected  # Только Selected
python export_queue.py all            # Все форматы
```

**В приложении:** Экспорт всех записей без возможности фильтрации

---

### 5. Batch Status Update (`update_queue_status.py`)

**Код из скрипта:**
```python
def update_multiple_status(queue_ids, new_status, selected_by=None):
    """
    Update the status of multiple videos at once.
    """
    results = {
        'successful': [],
        'failed': []
    }

    for queue_id in queue_ids:
        success = update_status(queue_id, new_status, selected_by)
        if success:
            results['successful'].append(queue_id)
        else:
            results['failed'].append(queue_id)

    return results
```

**В приложении:** Только обновление по одному видео

---

### 6. Auto-date Updates for Status Changes

**Код из скрипта:**
```python
def update_status(queue_id, new_status, selected_by=None):
    today = datetime.now().strftime('%Y-%m-%d')

    if new_status == 'Selected':
        if selected_by:
            queue_df.at[idx, 'Selected_By'] = selected_by
        queue_df.at[idx, 'Selected_Date'] = today

    elif new_status == 'Parsed':
        queue_df.at[idx, 'Parsed_Date'] = today
```

**В приложении:** Даты `Selected_Date` и `Parsed_Date` не обновляются автоматически при смене статуса

---

### 7. Queue Summary Dashboard

**Вывод из скрипта:**
```
VIDEO QUEUE SUMMARY
============================================================
Total videos in queue: 45

Status Breakdown:
  Pending     : 20 (44.4%)
  Selected    :  8 (17.8%)
  Parsing     :  5 (11.1%)
  Parsed      : 10 (22.2%)
  Rejected    :  2 ( 4.4%)

Top Topics:
  AI Automation         : 15
  Video Editing         : 12
  Design Research       :  8

Research Sources:
  Perplexity  : 25
  YouTube     : 15
  Gemini      :  5
============================================================
```

**В приложении:** Минимальная статистика - только общий счётчик видео

---

### 8. Недостающие поля в форме добавления видео

| Поле | В скриптах | В Web App |
|------|-----------|-----------|
| `video_url` | ✅ | ✅ |
| `video_title` | ✅ | ✅ |
| `channel_name` | ✅ | ✅ |
| `topic_category` | ✅ | ❌ |
| `research_source` | ✅ | ❌ |
| `views` | ✅ | ❌ |
| `likes` | ✅ | ❌ |
| `comments` | ✅ | ❌ |
| `publish_date` | ✅ | ❌ |
| `duration` | ✅ | ⚠️ (duration_minutes) |
| `priority` | ✅ | ✅ |
| `department` | ✅ | ✅ |
| `notes` | ✅ | ✅ |

---

## ✅ Рекомендации по реализации

### Приоритет 1 (Высокий)

| # | Функция | Описание | Сложность |
|---|---------|----------|-----------|
| 1 | 🔢 Priority Score Calculation | Автоматический расчёт приоритета при добавлении/редактировании | Средняя |
| 2 | ⚠️ Duplicate Detection | Проверка дубликатов по Video_ID при добавлении | Низкая |
| 3 | 📅 Auto-date Updates | Автоматические даты при смене статуса на Selected/Parsed | Низкая |

### Приоритет 2 (Средний)

| # | Функция | Описание | Сложность |
|---|---------|----------|-----------|
| 4 | 📊 Queue Summary Dashboard | Статистика по статусам, темам, источникам | Средняя |
| 5 | 📝 Export to Markdown | Красивый MD отчёт с таблицами | Средняя |
| 6 | 🔍 Export with Status Filter | Выбор статуса при экспорте | Низкая |

### Приоритет 3 (Низкий)

| # | Функция | Описание | Сложность |
|---|---------|----------|-----------|
| 7 | ✅ Batch Status Update | Массовое обновление с чекбоксами | Высокая |
| 8 | 📝 Extended Add Form | Все поля метаданных (views, likes, topic_category...) | Средняя |

---

## Файлы скриптов

| Файл | Размер | Строк | Основная функция |
|------|--------|-------|------------------|
| `add_video_to_queue.py` | 7.6KB | 236 | Добавление видео с pandas |
| `add_video_to_queue_simple.py` | 8.6KB | 268 | Добавление видео без pandas |
| `update_queue_status.py` | 7.1KB | 245 | Обновление статуса + summary |
| `calculate_priority.py` | 6.7KB | 190 | Расчёт приоритета 0-100 |
| `export_queue.py` | 8.7KB | 275 | Экспорт CSV/JSON/Markdown |

---

## Заключение

**Покрытие функционала:** ~60%

Основные пробелы:
1. Нет автоматического расчёта приоритета
2. Нет проверки дубликатов
3. Нет экспорта в Markdown
4. Ограниченная статистика
5. Нет массового обновления

**Рекомендация:** Начать с реализации Priority Score Calculation и Duplicate Detection как наиболее важных для качества данных.

---

**Создано:** 2025-11-28
**Автор:** AI Analysis

