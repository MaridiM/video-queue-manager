-- CreateEnum
CREATE TYPE "DepartmentCode" AS ENUM ('DEV', 'SMM', 'VID', 'AID', 'DGN', 'MKT');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('pending', 'selected', 'transcribing', 'transcribed', 'processing', 'complete', 'rejected');

-- CreateEnum
CREATE TYPE "SearchStatus" AS ENUM ('Assigned', 'In Progress', 'Completed');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('TOOL', 'WORKFLOW', 'ACTION', 'OBJECT');

-- CreateEnum
CREATE TYPE "EntityClassification" AS ENUM ('NEW', 'EXISTING', 'UPDATE');

-- CreateTable
CREATE TABLE "departments" (
    "code" "DepartmentCode" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "department" "DepartmentCode",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queue" (
    "search_id" VARCHAR(20) NOT NULL,
    "employee" VARCHAR(255),
    "department" "DepartmentCode" NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "search_query" TEXT NOT NULL,
    "status" "SearchStatus" NOT NULL DEFAULT 'Assigned',
    "videos_found" INTEGER NOT NULL DEFAULT 0,
    "date_assigned" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_completed" DATE,
    "notes" TEXT NOT NULL DEFAULT '',
    "perplexity_creativity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "perplexity_structure_mode" BOOLEAN NOT NULL DEFAULT true,
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_queue_pkey" PRIMARY KEY ("search_id")
);

-- CreateTable
CREATE TABLE "video_queue" (
    "id" TEXT NOT NULL,
    "queue_id" VARCHAR(20),
    "video_id" VARCHAR(20),
    "video_url" TEXT NOT NULL,
    "video_title" VARCHAR(500) NOT NULL,
    "channel_name" VARCHAR(255),
    "channel_url" TEXT,
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "duration" VARCHAR(20),
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "publish_date" DATE,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'medium',
    "status" "VideoStatus" NOT NULL DEFAULT 'pending',
    "department" "DepartmentCode" NOT NULL,
    "topic_category" VARCHAR(255),
    "research_source" VARCHAR(100),
    "priority_score" DOUBLE PRECISION,
    "assigned_to" VARCHAR(255),
    "added_by" VARCHAR(255) NOT NULL,
    "added_date" DATE,
    "selected_by" VARCHAR(255),
    "selected_date" DATE,
    "parsed_date" DATE,
    "notes" TEXT,
    "perplexity_search_id" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcriptions" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "raw_text" TEXT,
    "formatted_text" TEXT,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "transcription_source" VARCHAR(50),
    "processing_time_seconds" INTEGER,
    "word_count" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_entities" (
    "id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_name" VARCHAR(255) NOT NULL,
    "entity_id" VARCHAR(100),
    "classification" "EntityClassification" NOT NULL DEFAULT 'NEW',
    "description" TEXT,
    "category" VARCHAR(100),
    "video_id" TEXT,
    "video_title" VARCHAR(500),
    "transcription_id" TEXT,
    "steps_count" INTEGER,
    "estimated_time_minutes" INTEGER,
    "difficulty" VARCHAR(50),
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outputs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence_score" DOUBLE PRECISION,
    "metadata" JSONB,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researches" (
    "id" TEXT NOT NULL,
    "research_id" VARCHAR(20) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "department" "DepartmentCode",
    "category" VARCHAR(100),
    "file_path" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "total_searches" INTEGER NOT NULL DEFAULT 0,
    "total_videos" INTEGER NOT NULL DEFAULT 0,
    "total_entities" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "researches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "search_queue_status_idx" ON "search_queue"("status");

-- CreateIndex
CREATE INDEX "search_queue_department_idx" ON "search_queue"("department");

-- CreateIndex
CREATE INDEX "search_queue_employee_idx" ON "search_queue"("employee");

-- CreateIndex
CREATE INDEX "search_queue_date_assigned_idx" ON "search_queue"("date_assigned");

-- CreateIndex
CREATE UNIQUE INDEX "video_queue_queue_id_key" ON "video_queue"("queue_id");

-- CreateIndex
CREATE INDEX "video_queue_status_idx" ON "video_queue"("status");

-- CreateIndex
CREATE INDEX "video_queue_department_idx" ON "video_queue"("department");

-- CreateIndex
CREATE INDEX "video_queue_priority_idx" ON "video_queue"("priority");

-- CreateIndex
CREATE INDEX "video_queue_assigned_to_idx" ON "video_queue"("assigned_to");

-- CreateIndex
CREATE INDEX "video_queue_perplexity_search_id_idx" ON "video_queue"("perplexity_search_id");

-- CreateIndex
CREATE INDEX "video_queue_created_at_idx" ON "video_queue"("created_at");

-- CreateIndex
CREATE INDEX "transcriptions_video_id_idx" ON "transcriptions"("video_id");

-- CreateIndex
CREATE INDEX "transcriptions_status_idx" ON "transcriptions"("status");

-- CreateIndex
CREATE INDEX "extracted_entities_entity_type_idx" ON "extracted_entities"("entity_type");

-- CreateIndex
CREATE INDEX "extracted_entities_classification_idx" ON "extracted_entities"("classification");

-- CreateIndex
CREATE INDEX "extracted_entities_video_id_idx" ON "extracted_entities"("video_id");

-- CreateIndex
CREATE INDEX "extracted_entities_entity_name_idx" ON "extracted_entities"("entity_name");

-- CreateIndex
CREATE INDEX "extracted_entities_category_idx" ON "extracted_entities"("category");

-- CreateIndex
CREATE UNIQUE INDEX "researches_research_id_key" ON "researches"("research_id");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_fkey" FOREIGN KEY ("department") REFERENCES "departments"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_queue" ADD CONSTRAINT "search_queue_department_fkey" FOREIGN KEY ("department") REFERENCES "departments"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_queue" ADD CONSTRAINT "video_queue_department_fkey" FOREIGN KEY ("department") REFERENCES "departments"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_queue" ADD CONSTRAINT "video_queue_perplexity_search_id_fkey" FOREIGN KEY ("perplexity_search_id") REFERENCES "search_queue"("search_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "video_queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_entities" ADD CONSTRAINT "extracted_entities_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "transcriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_department_fkey" FOREIGN KEY ("department") REFERENCES "departments"("code") ON DELETE SET NULL ON UPDATE CASCADE;
