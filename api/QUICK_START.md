# Quick Start Guide - PostgreSQL Setup

Быстрое руководство по запуску PostgreSQL базы данных для REMS API.

---

## ⚡ Быстрый запуск (3 шага)

### Шаг 1: Запустить PostgreSQL

```bash
cd apps/api
docker-compose up -d
```

### Шаг 2: Настроить переменные окружения

Создайте файл `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
PORT=3001
DROPBOX_ROOT=G:/Job/REMS/apps/3/work/01
```

### Шаг 3: Применить миграции и запустить сервер

```bash
npm install
npm run db:migrate
npm run db:seed  # Опционально: заполнить тестовыми данными
npm run dev
```

**Готово!** API доступен на `http://localhost:3001`

---

## 🔍 Проверка работы

### Проверить статус PostgreSQL:

```bash
docker-compose ps
```

### Проверить подключение к БД:

```bash
docker exec -it rems-postgres psql -U postgres -d phase0 -c "SELECT version();"
```

### Проверить API:

```bash
curl http://localhost:3001/api/health
```

---

## 📊 Prisma Studio (GUI для БД)

Открыть визуальный редактор базы данных:

```bash
npm run db:studio
```

Откроется в браузере на `http://localhost:5555`

---

## 🛠️ Полезные команды

```bash
# Остановить PostgreSQL
docker-compose down

# Остановить и удалить данные
docker-compose down -v

# Просмотр логов PostgreSQL
docker-compose logs -f postgres

# Сброс базы данных (удаляет все данные!)
npm run db:reset

# Создать бэкап
docker exec rems-postgres pg_dump -U postgres phase0 > backup.sql
```

---

## 📚 Подробная документация

См. [DATABASE_SETUP.md](./DATABASE_SETUP.md) для полной документации.

---

## 🐛 Проблемы?

**Порт 5434 занят?**
- Измените порт в `docker-compose.yml`: `"5435:5432"`
- Обновите `DATABASE_URL` в `.env`

**Не удается подключиться?**
- Проверьте, что контейнер запущен: `docker-compose ps`
- Проверьте логи: `docker-compose logs postgres`

**Миграции не применяются?**
- Убедитесь, что `.env` файл существует
- Проверьте `DATABASE_URL`: `echo $DATABASE_URL`

