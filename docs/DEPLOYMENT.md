# Deployment Documentation

Инструкции по развертыванию Queue Manager.

## 📋 Содержание

1. [Требования](#требования)
2. [Локальная разработка](#локальная-разработка)
3. [Production сборка](#production-сборка)
4. [Docker развертывание](#docker-развертывание)
5. [Переменные окружения](#переменные-окружения)

---

## Требования

### Минимальные требования

- **Node.js:** 18.x или выше
- **npm:** 9.x или выше
- **PostgreSQL:** 16.x или выше
- **Docker:** 20.x или выше (опционально)

### Рекомендуемые требования

- **Node.js:** 20.x LTS
- **PostgreSQL:** 16.x
- **RAM:** 4GB+
- **Disk:** 10GB+ свободного места

---

## Локальная разработка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd apps
```

### 2. Backend Setup

```bash
cd api

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
# Отредактируйте .env с вашими настройками

# Запуск PostgreSQL через Docker
docker-compose up -d

# Применение миграций
npm run db:migrate

# Заполнение тестовыми данными (опционально)
npm run db:seed

# Запуск dev сервера
npm run dev
```

Backend будет доступен на `http://localhost:3001`

### 3. Frontend Setup

```bash
cd web

# Установка зависимостей
npm install

# Создание .env файла (опционально)
echo "VITE_API_URL=http://localhost:3001" > .env

# Запуск dev сервера
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

---

## Production сборка

### Backend

```bash
cd api

# Установка production зависимостей
npm ci --production

# Применение миграций
npm run db:migrate

# Запуск сервера
npm start
```

**Или с PM2:**

```bash
npm install -g pm2
pm2 start server.js --name "queue-manager-api"
pm2 save
pm2 startup
```

### Frontend

```bash
cd web

# Production сборка
npm run build

# Предпросмотр сборки
npm run preview
```

Собранные файлы будут в `web/dist/`

**Развертывание на Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Docker развертывание

### Docker Compose

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: rems-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: phase0
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./api
    container_name: queue-manager-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/phase0
      PORT: 3001
    depends_on:
      - postgres
    volumes:
      - ./api/settings.json:/app/settings.json

  web:
    build: ./web
    container_name: queue-manager-web
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://localhost:3001
    depends_on:
      - api

volumes:
  postgres_data:
```

### Dockerfile для Backend

`api/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Dockerfile для Frontend

`web/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Запуск

```bash
docker-compose up -d
```

---

## Переменные окружения

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0

# Server
PORT=3001
NODE_ENV=production

# Dropbox Root (local fallback)
DROPBOX_ROOT=/path/to/dropbox/root

# AI Providers (optional, can be set in Settings UI)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
DROPBOX_ACCESS_TOKEN=your_dropbox_token_here
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## Мониторинг

### Health Check

```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-02T12:00:00.000Z"
}
```

### Логи

**Backend:**
- Логи выводятся в консоль
- Для production используйте логирование в файл или систему (Winston, Pino)

**Frontend:**
- Логи в браузерной консоли
- Для production отключите debug логи

---

## Резервное копирование

### База данных

```bash
# Экспорт
pg_dump -U postgres -d phase0 > backup_$(date +%Y%m%d).sql

# Импорт
psql -U postgres -d phase0 < backup_20251202.sql
```

### Автоматическое резервное копирование

```bash
# Crontab (ежедневно в 2:00)
0 2 * * * pg_dump -U postgres -d phase0 > /backups/phase0_$(date +\%Y\%m\%d).sql
```

---

## Обновление

### Backend

```bash
cd api
git pull
npm install
npm run db:migrate
pm2 restart queue-manager-api
```

### Frontend

```bash
cd web
git pull
npm install
npm run build
# Перезапустить Nginx или обновить Docker контейнер
```

---

## Troubleshooting

### Проблемы с подключением к БД

```bash
# Проверить статус PostgreSQL
docker ps | grep postgres

# Проверить логи
docker logs rems-postgres

# Проверить подключение
psql -U postgres -h localhost -p 5434 -d phase0
```

### Проблемы с миграциями

```bash
# Сбросить БД и применить миграции заново
npm run db:reset
```

### Проблемы с Dropbox

- Проверить токен доступа
- Проверить права доступа (scopes)
- Проверить логи сервера

---

**Последнее обновление:** 2025-12-02

