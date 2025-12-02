# Database Setup Guide - PostgreSQL

**База данных:** PostgreSQL 16  
**Строка подключения:** `postgresql://postgres:postgres@localhost:5434/phase0`  
**ORM:** Prisma

---

## 🚀 Быстрый старт

### 1. Запуск PostgreSQL через Docker Compose

```bash
# Перейти в директорию API
cd apps/api

# Запустить PostgreSQL контейнер
docker-compose up -d

# Проверить статус
docker-compose ps
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и убедитесь, что `DATABASE_URL` указан правильно:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
```

### 3. Применение миграций базы данных

```bash
# Применить миграции
npm run db:migrate

# Или через Prisma напрямую
npx prisma migrate dev
```

### 4. Заполнение начальными данными (опционально)

```bash
npm run db:seed
```

### 5. Запуск API сервера

```bash
# Режим разработки (с автоперезагрузкой)
npm run dev

# Продакшн режим
npm start
```

---

## 📊 Структура базы данных

### Таблицы

#### 1. `departments` - Департаменты
Справочная таблица департаментов компании.

**Поля:**
- `code` (PK) - Код департамента (DEV, SMM, VID, AID, DGN, MKT)
- `name` - Название департамента
- `description` - Описание (опционально)
- `created_at` - Дата создания

#### 2. `employees` - Сотрудники
Таблица сотрудников компании.

**Поля:**
- `id` (PK) - UUID
- `email` (UNIQUE) - Email сотрудника
- `full_name` - Полное имя
- `department` (FK) - Код департамента
- `is_active` - Активен ли сотрудник
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### 3. `search_queue` - Очередь поиска
Очередь задач на поиск видео контента.

**Поля:**
- `search_id` (PK) - ID поиска (SEARCH-001, SEARCH-002, ...)
- `employee` - Сотрудник, назначенный на поиск
- `department` (FK) - Департамент
- `topic` - Тема поиска
- `search_query` - Поисковый запрос
- `status` - Статус (Assigned, In Progress, Completed)
- `videos_found` - Количество найденных видео
- `date_assigned` - Дата назначения
- `date_completed` - Дата завершения
- `notes` - Заметки
- `perplexity_creativity` - Настройка креативности Perplexity (0.0-1.0)
- `perplexity_structure_mode` - Режим структурирования Perplexity
- `results_count` - Количество результатов
- `error_message` - Сообщение об ошибке (если есть)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### 4. `video_queue` - Очередь видео
Очередь видео для обработки и транскрипции.

**Поля:**
- `id` (PK) - UUID
- `queue_id` (UNIQUE) - ID в очереди (VIDEO-001, VIDEO-002, ...)
- `video_id` - YouTube Video ID
- `video_url` - URL видео
- `video_title` - Название видео
- `channel_name` - Название канала
- `channel_url` - URL канала
- `duration_minutes` - Длительность в минутах
- `duration` - Длительность (строка)
- `views` - Количество просмотров
- `likes` - Количество лайков
- `comments` - Количество комментариев
- `publish_date` - Дата публикации
- `priority` - Приоритет (low, medium, high)
- `status` - Статус (pending, selected, transcribing, transcribed, processing, complete, rejected)
- `department` (FK) - Департамент
- `topic_category` - Категория темы
- `research_source` - Источник исследования
- `priority_score` - Оценка приоритета (0-100)
- `assigned_to` - Назначено на сотрудника
- `added_by` - Добавлено сотрудником
- `added_date` - Дата добавления
- `selected_by` - Выбрано сотрудником
- `selected_date` - Дата выбора
- `parsed_date` - Дата парсинга
- `notes` - Заметки
- `perplexity_search_id` (FK) - Связь с search_queue
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### 5. `transcriptions` - Транскрипции
Транскрипции видео.

**Поля:**
- `id` (PK) - UUID
- `video_id` (FK) - ID видео из video_queue
- `raw_text` - Сырой текст транскрипции
- `formatted_text` - Отформатированный текст
- `language` - Язык (по умолчанию: en)
- `transcription_source` - Источник транскрипции
- `processing_time_seconds` - Время обработки в секундах
- `word_count` - Количество слов
- `status` - Статус (pending, completed, error)
- `error_message` - Сообщение об ошибке
- `created_at` - Дата создания
- `completed_at` - Дата завершения

#### 6. `extracted_entities` - Извлеченные сущности
Сущности, извлеченные из транскрипций (инструменты, workflows, действия, объекты).

**Поля:**
- `id` (PK) - UUID
- `entity_type` - Тип сущности (TOOL, WORKFLOW, ACTION, OBJECT)
- `entity_name` - Название сущности
- `entity_id` - ID сущности в системе
- `classification` - Классификация (NEW, EXISTING, UPDATE)
- `description` - Описание
- `category` - Категория
- `video_id` (FK) - ID видео
- `video_title` - Название видео
- `transcription_id` (FK) - ID транскрипции
- `steps_count` - Количество шагов (для workflows)
- `estimated_time_minutes` - Оценка времени в минутах
- `difficulty` - Сложность
- `prerequisites` - Предварительные требования (массив)
- `outputs` - Выходные данные (массив)
- `confidence_score` - Оценка уверенности (0.0-1.0)
- `metadata` - Дополнительные метаданные (JSON)
- `extracted_at` - Дата извлечения
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### 7. `researches` - Исследования
Мастер-лист исследований.

**Поля:**
- `id` (PK) - UUID
- `research_id` (UNIQUE) - ID исследования (RSH-001, RSH-002, ...)
- `title` - Название исследования
- `description` - Описание
- `department` (FK) - Департамент
- `category` - Категория
- `file_path` - Путь к файлу
- `status` - Статус (active, completed, archived)
- `total_searches` - Всего поисков
- `total_videos` - Всего видео
- `total_entities` - Всего сущностей
- `created_at` - Дата создания
- `updated_at` - Дата обновления
- `completed_at` - Дата завершения

---

## 🔧 Управление базой данных

### Prisma CLI команды

```bash
# Применить миграции
npm run db:migrate
# или
npx prisma migrate dev

# Сброс базы данных (удаляет все данные!)
npm run db:reset

# Открыть Prisma Studio (GUI для БД)
npm run db:studio

# Генерация Prisma Client после изменения schema
npx prisma generate

# Создать новую миграцию
npx prisma migrate dev --name migration_name
```

### Прямое подключение к PostgreSQL

```bash
# Через Docker
docker exec -it rems-postgres psql -U postgres -d phase0

# Или через psql напрямую (если установлен локально)
psql postgresql://postgres:postgres@localhost:5434/phase0
```

### Полезные SQL запросы

```sql
-- Просмотр всех таблиц
\dt

-- Просмотр структуры таблицы
\d video_queue

-- Количество записей в каждой таблице
SELECT 
  'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'search_queue', COUNT(*) FROM search_queue
UNION ALL
SELECT 'video_queue', COUNT(*) FROM video_queue
UNION ALL
SELECT 'transcriptions', COUNT(*) FROM transcriptions
UNION ALL
SELECT 'extracted_entities', COUNT(*) FROM extracted_entities
UNION ALL
SELECT 'researches', COUNT(*) FROM researches;

-- Видео по статусам
SELECT status, COUNT(*) as count 
FROM video_queue 
GROUP BY status 
ORDER BY count DESC;

-- Поиски по статусам
SELECT status, COUNT(*) as count 
FROM search_queue 
GROUP BY status 
ORDER BY count DESC;
```

---

## 🔐 Безопасность

### Рекомендации для продакшна:

1. **Измените пароль PostgreSQL:**
   ```yaml
   # В docker-compose.yml
   POSTGRES_PASSWORD: ваш_надежный_пароль
   ```

2. **Используйте переменные окружения:**
   ```env
   DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5434/phase0
   ```

3. **Ограничьте доступ к порту 5434:**
   - Используйте firewall правила
   - Или используйте Docker network вместо проброса портов

4. **Регулярные бэкапы:**
   ```bash
   # Создать бэкап
   docker exec rems-postgres pg_dump -U postgres phase0 > backup_$(date +%Y%m%d).sql
   
   # Восстановить из бэкапа
   docker exec -i rems-postgres psql -U postgres phase0 < backup_20250115.sql
   ```

---

## 🐛 Решение проблем

### Проблема: Не удается подключиться к базе данных

**Решение:**
1. Проверьте, запущен ли контейнер: `docker-compose ps`
2. Проверьте логи: `docker-compose logs postgres`
3. Убедитесь, что порт 5434 не занят: `netstat -an | grep 5434`
4. Проверьте переменную `DATABASE_URL` в `.env`

### Проблема: Миграции не применяются

**Решение:**
1. Убедитесь, что Prisma schema синхронизирован: `npx prisma validate`
2. Проверьте, что база данных существует
3. Попробуйте сбросить миграции: `npx prisma migrate reset`

### Проблема: Контейнер не запускается

**Решение:**
1. Проверьте логи: `docker-compose logs postgres`
2. Убедитесь, что порт 5434 свободен
3. Попробуйте удалить volume и создать заново:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

## 📚 Дополнительные ресурсы

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🔄 Обновление схемы базы данных

При изменении `schema.prisma`:

1. Создайте миграцию:
   ```bash
   npx prisma migrate dev --name описание_изменений
   ```

2. Примените миграцию:
   ```bash
   npx prisma migrate deploy
   ```

3. Обновите Prisma Client:
   ```bash
   npx prisma generate
   ```

---

**Последнее обновление:** 2025-01-15  
**Версия:** 1.0

