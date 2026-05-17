-- DropIndex
DROP INDEX "Sale_createdAt_idx";

-- DropIndex
DROP INDEX "Sale_paymentStatus_idx";

-- DropIndex
DROP INDEX "Sale_tenantId_idx";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
