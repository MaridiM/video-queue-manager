# Database Documentation

Документация по базе данных Queue Manager.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Схема базы данных](#схема-базы-данных)
3. [Модели данных](#модели-данных)
4. [Связи](#связи)
5. [Миграции](#миграции)
6. [Seed данные](#seed-данные)

---

## Обзор

База данных построена на **PostgreSQL 16+** с использованием **Prisma ORM** для управления схемой и миграциями.

### Технические детали

- **СУБД:** PostgreSQL 16
- **ORM:** Prisma 7.0
- **Порт:** 5434 (Docker)
- **База данных:** `phase0`
- **Пользователь:** `postgres`

---

## Схема базы данных

### Enums

#### DepartmentCode
```prisma
enum DepartmentCode {
  DEV   // Development
  SMM   // Social Media Marketing
  VID   // Video
  AID   // AI & Automation
  DGN   // Design
  MKT   // Marketing
}
```

#### PriorityLevel
```prisma
enum PriorityLevel {
  low
  medium
  high
}
```

#### VideoStatus
```prisma
enum VideoStatus {
  pending
  selected
  transcribing
  transcribed
  processing
  complete
  rejected
}
```

#### SearchStatus
```prisma
enum SearchStatus {
  Assigned
  In_Progress    // Maps to "In Progress" in CSV
  Completed
}
```

#### EntityType
```prisma
enum EntityType {
  TOOL
  WORKFLOW
  ACTION
  OBJECT
}
```

#### EntityClassification
```prisma
enum EntityClassification {
  NEW
  EXISTING
  UPDATE
}
```

---

## Модели данных

### Department

Справочник департаментов.

```prisma
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
```

**Поля:**
- `code` - код департамента (PK)
- `name` - название
- `description` - описание (опционально)

---

### Employee

Сотрудники.

```prisma
model Employee {
  id         String         @id @default(uuid())
  email      String         @unique @db.VarChar(255)
  fullName   String         @map("full_name") @db.VarChar(255)
  department DepartmentCode?
  isActive   Boolean        @default(true) @map("is_active")
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")

  departmentRef Department? @relation(fields: [department], references: [code])

  @@index([email])
  @@index([department])
  @@map("employees")
}
```

---

### SearchQueue

Очередь поисковых запросов.

```prisma
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
```

**Ключевые поля:**
- `searchId` - уникальный ID (формат: `SEARCH-001`)
- `searchQuery` - текст поискового запроса
- `perplexityCreativity` - уровень креативности (0.0-1.0)
- `videosFound` - количество найденных видео

---

### VideoQueue

Очередь видео для обработки.

```prisma
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
```

**Ключевые поля:**
- `queueId` - уникальный ID очереди (формат: `VQ-001`)
- `videoId` - YouTube video ID (11 символов)
- `priorityScore` - автоматически рассчитываемый рейтинг (0-100)
- `perplexitySearchId` - связь с SearchQueue

**Автоматические даты:**
- При статусе `selected` → устанавливается `selectedDate`
- При статусе `transcribed`/`complete` → устанавливается `parsedDate`

---

### Transcription

Транскрипции видео.

```prisma
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
```

---

### ExtractedEntity

Извлеченные сущности из транскрипций.

```prisma
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
  estimatedTimeMinutes Int?                 @map("estimated_time_minutes")
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
  transcription         Transcription?      @relation(fields: [transcriptionId], references: [id], onDelete: SetNull)

  @@index([entityType])
  @@index([classification])
  @@index([videoId])
  @@index([entityName])
  @@index([category])
  @@map("extracted_entities")
}
```

**Типы сущностей:**
- `TOOL` - инструменты
- `WORKFLOW` - рабочие процессы
- `ACTION` - действия
- `OBJECT` - объекты/документы

---

### Research

Мастер-лист исследований.

```prisma
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

---

## Связи

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

---

## Миграции

### Применение миграций

```bash
# Применить все миграции
npm run db:migrate

# Сбросить БД и применить миграции
npm run db:reset

# Создать новую миграцию
npx prisma migrate dev --name migration_name
```

### Структура миграций

```
prisma/
└── migrations/
    └── 20251128145109_init/
        └── migration.sql
```

---

## Seed данные

### Заполнение тестовыми данными

```bash
npm run db:seed
```

**Seed файл:** `prisma/seed.js`

**Создаются:**
- Департаменты (DEV, SMM, VID, AID, DGN, MKT)
- Тестовые записи SearchQueue
- Тестовые записи VideoQueue

---

## Индексы

### Оптимизация запросов

**VideoQueue:**
- `status` - фильтрация по статусу
- `department` - фильтрация по департаменту
- `priority` - сортировка по приоритету
- `assignedTo` - поиск по назначенному
- `perplexitySearchId` - связь с SearchQueue
- `createdAt` - сортировка по дате

**SearchQueue:**
- `status` - фильтрация по статусу
- `department` - фильтрация по департаменту
- `employee` - поиск по сотруднику
- `dateAssigned` - сортировка по дате

**Transcription:**
- `videoId` - связь с VideoQueue
- `status` - фильтрация по статусу

**ExtractedEntity:**
- `entityType` - фильтрация по типу
- `classification` - фильтрация по классификации
- `videoId` - связь с VideoQueue
- `entityName` - поиск по названию
- `category` - фильтрация по категории

---

## Запросы

### Примеры запросов через Prisma

```typescript
// Получить все видео со статусом "pending"
const pendingVideos = await prisma.videoQueue.findMany({
  where: { status: 'pending' },
  orderBy: { priorityScore: 'desc' }
});

// Получить видео с транскрипциями
const videosWithTranscripts = await prisma.videoQueue.findMany({
  include: {
    transcriptions: true,
    entities: true
  }
});

// Статистика по департаментам
const deptStats = await prisma.videoQueue.groupBy({
  by: ['department'],
  _count: { department: true },
  _avg: { priorityScore: true }
});

// Поиск видео по названию
const searchResults = await prisma.videoQueue.findMany({
  where: {
    videoTitle: {
      contains: 'tutorial',
      mode: 'insensitive'
    }
  }
});
```

---

## Резервное копирование

### Экспорт данных

```bash
# Экспорт через pg_dump
pg_dump -U postgres -d phase0 > backup.sql

# Импорт
psql -U postgres -d phase0 < backup.sql
```

### Prisma Studio

Визуальный редактор базы данных:

```bash
npm run db:studio
```

Открывается на `http://localhost:5555`

---

**Последнее обновление:** 2025-12-02

