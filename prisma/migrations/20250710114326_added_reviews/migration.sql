-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "Review_businessId_idx" ON "Review"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_clientId_businessId_key" ON "Review"("clientId", "businessId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
