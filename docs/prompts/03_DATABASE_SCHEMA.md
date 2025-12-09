# Промпт: Database Schema - Queue Manager

## Цель

Создать полную схему базы данных PostgreSQL для Queue Manager приложения с использованием Prisma ORM.

## Технические требования

- **СУБД:** PostgreSQL 16+
- **ORM:** Prisma 7.0.1
- **База данных:** `phase0`
- **Порт:** 5434 (Docker)

## Полная схема Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================================================
// ENUMS
// =====================================================

enum DepartmentCode {
  DEV   // Development
  SMM   // Social Media Marketing
  VID   // Video
  AID   // AI & Automation
  DGN   // Design
  MKT   // Marketing
}

enum PriorityLevel {
  low
  medium
  high
}

enum VideoStatus {
  pending
  selected
  transcribing
  transcribed
  processing
  complete
  rejected
}

enum SearchStatus {
  Assigned
  In_Progress @map("In Progress")
  Completed
}

enum EntityType {
  TOOL
  WORKFLOW
  ACTION
  OBJECT
}

enum EntityClassification {
  NEW
  EXISTING
  UPDATE
}

// =====================================================
// TABLES
// =====================================================

// Departments reference table
model Department {
  code        DepartmentCode @id
  name        String         @db.VarChar(100)
  description String?        @db.Text
  createdAt   DateTime       @default(now()) @map("created_at")

  // Relations
  searchQueue SearchQueue[]
  videoQueue  VideoQueue[]
  employees   Employee[]
  researches  Research[]

  @@map("departments")
}

// Employees table
model Employee {
  id         String         @id @default(uuid())
  email      String         @unique @db.VarChar(255)
  fullName   String         @map("full_name") @db.VarChar(255)
  department DepartmentCode?
  isActive   Boolean        @default(true) @map("is_active")
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")

  // Relations
  departmentRef Department? @relation(fields: [department], references: [code])

  @@index([email])
  @@index([department])
  @@map("employees")
}

// Search Queue table
model SearchQueue {
  searchId             String         @id @map("search_id") @db.VarChar(20)
  employee             String?        @db.VarChar(255)
  department           DepartmentCode
  topic                String         @db.VarChar(255)
  searchQuery          String         @map("search_query") @db.Text
  status               SearchStatus   @default(Assigned)
  videosFound          Int            @default(0) @map("videos_found")
  dateAssigned         DateTime       @default(now()) @map("date_assigned") @db.Date
  dateCompleted        DateTime?      @map("date_completed") @db.Date
  notes                String         @default("") @db.Text
  
  // Perplexity settings
  perplexityCreativity    Float      @default(0.5) @map("perplexity_creativity")
  perplexityStructureMode Boolean    @default(true) @map("perplexity_structure_mode")
  resultsCount            Int        @default(0) @map("results_count")
  errorMessage            String?    @map("error_message") @db.Text
  
  // Timestamps
  createdAt            DateTime       @default(now()) @map("created_at")
  updatedAt            DateTime       @updatedAt @map("updated_at")

  // Relations
  departmentRef        Department     @relation(fields: [department], references: [code])
  videos               VideoQueue[]

  @@index([status])
  @@index([department])
  @@index([employee])
  @@index([dateAssigned])
  @@map("search_queue")
}

// Video Queue table
model VideoQueue {
  id              String         @id @default(uuid())
  queueId         String?        @unique @map("queue_id") @db.VarChar(20)
  videoId         String?        @map("video_id") @db.VarChar(20)
  videoUrl        String         @map("video_url") @db.Text
  videoTitle      String         @map("video_title") @db.VarChar(500)
  channelName     String?        @map("channel_name") @db.VarChar(255)
  channelUrl      String?        @map("channel_url") @db.Text
  durationMinutes Int            @default(0) @map("duration_minutes")
  duration        String?        @db.VarChar(20)
  views           Int            @default(0)
  likes           Int            @default(0)
  comments        Int            @default(0)
  publishDate     DateTime?      @map("publish_date") @db.Date
  
  // Classification
  priority        PriorityLevel  @default(medium)
  status          VideoStatus    @default(pending)
  department      DepartmentCode
  topicCategory   String?        @map("topic_category") @db.VarChar(255)
  researchSource  String?        @map("research_source") @db.VarChar(100)
  priorityScore   Float?         @map("priority_score")
  
  // Assignment
  assignedTo      String?        @map("assigned_to") @db.VarChar(255)
  addedBy         String         @map("added_by") @db.VarChar(255)
  addedDate       DateTime?      @map("added_date") @db.Date
  selectedBy      String?        @map("selected_by") @db.VarChar(255)
  selectedDate    DateTime?      @map("selected_date") @db.Date
  parsedDate      DateTime?      @map("parsed_date") @db.Date
  
  // Notes and references
  notes                String?      @db.Text
  perplexitySearchId   String?      @map("perplexity_search_id") @db.VarChar(20)
  
  // Timestamps
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  // Relations
  departmentRef   Department     @relation(fields: [department], references: [code])
  searchQueueRef  SearchQueue?   @relation(fields: [perplexitySearchId], references: [searchId])
  transcriptions  Transcription[]
  entities        ExtractedEntity[]

  @@index([status])
  @@index([department])
  @@index([priority])
  @@index([assignedTo])
  @@index([perplexitySearchId])
  @@index([createdAt])
  @@map("video_queue")
}

// Transcriptions table
model Transcription {
  id                    String       @id @default(uuid())
  videoId               String       @map("video_id")
  rawText               String?      @map("raw_text") @db.Text
  formattedText         String?      @map("formatted_text") @db.Text
  language              String       @default("en") @db.VarChar(10)
  transcriptionSource   String?      @map("transcription_source") @db.VarChar(50)
  processingTimeSeconds Int?         @map("processing_time_seconds")
  wordCount             Int?         @map("word_count")
  status                String       @default("pending") @db.VarChar(50)
  errorMessage          String?      @map("error_message") @db.Text
  createdAt             DateTime     @default(now()) @map("created_at")
  completedAt           DateTime?    @map("completed_at")

  // Relations
  video                 VideoQueue   @relation(fields: [videoId], references: [id], onDelete: Cascade)
  entities              ExtractedEntity[]

  @@index([videoId])
  @@index([status])
  @@map("transcriptions")
}

// Extracted Entities table
model ExtractedEntity {
  id                    String               @id @default(uuid())
  entityType            EntityType           @map("entity_type")
  entityName            String               @map("entity_name") @db.VarChar(255)
  entityId              String?              @map("entity_id") @db.VarChar(100)
  classification        EntityClassification @default(NEW)
  description           String?              @db.Text
  category              String?              @db.VarChar(100)
  
  // Source reference
  videoId               String?              @map("video_id")
  videoTitle            String?              @map("video_title") @db.VarChar(500)
  transcriptionId       String?              @map("transcription_id")
  
  // Workflow specific fields
  stepsCount            Int?                 @map("steps_count")
  estimatedTimeMinutes  Int?                 @map("estimated_time_minutes")
  difficulty            String?              @db.VarChar(50)
  prerequisites         String[]             @default([])
  outputs               String[]             @default([])
  
  // Analysis metadata
  confidenceScore       Float?               @map("confidence_score")
  metadata              Json?
  
  // Timestamps
  extractedAt           DateTime             @default(now()) @map("extracted_at")
  createdAt             DateTime             @default(now()) @map("created_at")
  updatedAt             DateTime             @updatedAt @map("updated_at")

  // Relations
  video                 VideoQueue?          @relation(fields: [videoId], references: [id], onDelete: SetNull)
  transcription         Transcription?       @relation(fields: [transcriptionId], references: [id], onDelete: SetNull)

  @@index([entityType])
  @@index([classification])
  @@index([videoId])
  @@index([entityName])
  @@index([category])
  @@map("extracted_entities")
}

// Research Master List
model Research {
  id           String         @id @default(uuid())
  researchId   String         @unique @map("research_id") @db.VarChar(20)
  title        String         @db.VarChar(500)
  description  String?        @db.Text
  department   DepartmentCode?
  category     String?        @db.VarChar(100)
  filePath     String?        @map("file_path") @db.Text
  status       String         @default("active") @db.VarChar(50)
  
  // Counts
  totalSearches  Int          @default(0) @map("total_searches")
  totalVideos    Int          @default(0) @map("total_videos")
  totalEntities  Int          @default(0) @map("total_entities")
  
  // Timestamps
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  completedAt  DateTime?      @map("completed_at")

  // Relations
  departmentRef Department?   @relation(fields: [department], references: [code])

  @@map("researches")
}
```

## Связи между таблицами

### Диаграмма связей

```
Department (1) ──< (N) SearchQueue
Department (1) ──< (N) VideoQueue
Department (1) ──< (N) Employee
Department (1) ──< (N) Research

SearchQueue (1) ──< (N) VideoQueue
VideoQueue (1) ──< (N) Transcription
VideoQueue (1) ──< (N) ExtractedEntity
Transcription (1) ──< (N) ExtractedEntity
```

### Каскадные удаления

- `VideoQueue` → `Transcription` (CASCADE)
- `VideoQueue` → `ExtractedEntity` (SET NULL)
- `Transcription` → `ExtractedEntity` (SET NULL)

## Индексы

### VideoQueue
- `status` - для фильтрации по статусу
- `department` - для фильтрации по департаменту
- `priority` - для сортировки по приоритету
- `assignedTo` - для поиска по назначенному
- `perplexitySearchId` - для связи с SearchQueue
- `createdAt` - для сортировки по дате

### SearchQueue
- `status` - для фильтрации по статусу
- `department` - для фильтрации по департаменту
- `employee` - для поиска по сотруднику
- `dateAssigned` - для сортировки по дате

### Transcription
- `videoId` - для связи с VideoQueue
- `status` - для фильтрации по статусу

### ExtractedEntity
- `entityType` - для фильтрации по типу
- `classification` - для фильтрации по классификации
- `videoId` - для связи с VideoQueue
- `entityName` - для поиска по названию
- `category` - для фильтрации по категории

## Миграции

### Создание миграции

```bash
npx prisma migrate dev --name init
```

### Применение миграций

```bash
npx prisma migrate deploy
```

### Сброс БД

```bash
npx prisma migrate reset --force
```

## Seed данные

### prisma/seed.js

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create departments
  const departments = [
    { code: 'DEV', name: 'Development', description: 'Software development' },
    { code: 'SMM', name: 'Social Media Marketing', description: 'Social media and marketing' },
    { code: 'VID', name: 'Video', description: 'Video production' },
    { code: 'AID', name: 'AI & Automation', description: 'AI and automation' },
    { code: 'DGN', name: 'Design', description: 'Graphic design' },
    { code: 'MKT', name: 'Marketing', description: 'Marketing' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  // Create test search queue entries
  // Create test video queue entries
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Примеры запросов

### Получить все видео со статусом "pending"

```typescript
const pendingVideos = await prisma.videoQueue.findMany({
  where: { status: 'pending' },
  orderBy: { priorityScore: 'desc' }
});
```

### Получить видео с транскрипциями

```typescript
const videosWithTranscripts = await prisma.videoQueue.findMany({
  include: {
    transcriptions: true,
    entities: true
  }
});
```

### Статистика по департаментам

```typescript
const deptStats = await prisma.videoQueue.groupBy({
  by: ['department'],
  _count: { department: true },
  _avg: { priorityScore: true }
});
```

### Поиск видео по названию

```typescript
const searchResults = await prisma.videoQueue.findMany({
  where: {
    videoTitle: {
      contains: 'tutorial',
      mode: 'insensitive'
    }
  }
});
```

## Требования к реализации

1. Все модели должны иметь правильные типы полей
2. Индексы должны быть созданы для часто запрашиваемых полей
3. Связи должны быть настроены корректно
4. Каскадные удаления должны работать правильно
5. Timestamps должны обновляться автоматически
6. Default значения должны быть установлены где необходимо

## Docker Compose

```yaml
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

## Переменные окружения

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/phase0
```

## Требования к реализации

1. Схема должна быть полностью типизирована
2. Все связи должны работать корректно
3. Индексы должны оптимизировать частые запросы
4. Миграции должны быть обратимыми
5. Seed данные должны заполнять базовые справочники




