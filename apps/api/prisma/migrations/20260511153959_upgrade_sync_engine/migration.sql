/*
  Warnings:

  - You are about to drop the column `type` on the `SyncEvent` table. All the data in the column will be lost.
  - Added the required column `eventType` to the `SyncEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SyncEvent" DROP COLUMN "type",
ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SyncEvent_tenantId_idx" ON "SyncEvent"("tenantId");

-- CreateIndex
CREATE INDEX "SyncEvent_status_idx" ON "SyncEvent"("status");

-- CreateIndex
CREATE INDEX "SyncEvent_createdAt_idx" ON "SyncEvent"("createdAt");
