-- AlterTable
ALTER TABLE "schedule_task" ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;
