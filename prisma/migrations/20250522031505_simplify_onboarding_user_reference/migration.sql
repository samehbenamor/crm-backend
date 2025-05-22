/*
  Warnings:

  - You are about to drop the column `clientId` on the `ClientOnboarding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `ClientOnboarding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ClientOnboarding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientOnboarding" DROP CONSTRAINT "ClientOnboarding_clientId_fkey";

-- DropIndex
DROP INDEX "ClientOnboarding_clientId_key";

-- AlterTable
ALTER TABLE "ClientOnboarding" DROP COLUMN "clientId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClientOnboarding_userId_key" ON "ClientOnboarding"("userId");
