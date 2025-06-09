-- CreateTable
CREATE TABLE "PointsWallet" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointsWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointsWallet_clientId_idx" ON "PointsWallet"("clientId");

-- CreateIndex
CREATE INDEX "PointsWallet_businessId_idx" ON "PointsWallet"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "PointsWallet_clientId_businessId_key" ON "PointsWallet"("clientId", "businessId");

-- CreateIndex
CREATE INDEX "PointsTransaction_walletId_idx" ON "PointsTransaction"("walletId");

-- CreateIndex
CREATE INDEX "PointsTransaction_referenceId_idx" ON "PointsTransaction"("referenceId");

-- AddForeignKey
ALTER TABLE "PointsWallet" ADD CONSTRAINT "PointsWallet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsWallet" ADD CONSTRAINT "PointsWallet_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "PointsWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
