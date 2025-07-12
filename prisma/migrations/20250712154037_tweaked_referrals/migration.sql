/*
  Warnings:

  - You are about to drop the column `refereeId` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `referrerId` on the `Referral` table. All the data in the column will be lost.
  - Added the required column `referrerClientId` to the `Referral` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_refereeId_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referrerId_fkey";

-- DropIndex
DROP INDEX "Referral_referrerId_idx";

-- AlterTable
ALTER TABLE "Referral" DROP COLUMN "refereeId",
DROP COLUMN "referrerId",
ADD COLUMN     "refereeClientId" TEXT,
ADD COLUMN     "referrerClientId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Referral_referrerClientId_idx" ON "Referral"("referrerClientId");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerClientId_fkey" FOREIGN KEY ("referrerClientId") REFERENCES "Client"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeClientId_fkey" FOREIGN KEY ("refereeClientId") REFERENCES "Client"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
