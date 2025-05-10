/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_contact_id_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Deal";

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "DealStage";

-- DropEnum
DROP TYPE "RelatedToType";

-- CreateTable
CREATE TABLE "BusinessOwner" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "interests" TEXT[],
    "location" TEXT,
    "notificationPreferences" JSONB,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessOwner_userId_idx" ON "BusinessOwner"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");

-- CreateIndex
CREATE INDEX "Follow_clientId_idx" ON "Follow"("clientId");

-- CreateIndex
CREATE INDEX "Follow_businessId_idx" ON "Follow"("businessId");

-- CreateIndex
CREATE INDEX "Post_businessId_idx" ON "Post"("businessId");
