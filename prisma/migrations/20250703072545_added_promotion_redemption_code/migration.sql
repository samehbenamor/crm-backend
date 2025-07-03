-- CreateTable
CREATE TABLE "PromotionRedemptionCode" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrCodePath" TEXT NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "PromotionRedemptionCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRedemptionCode_code_key" ON "PromotionRedemptionCode"("code");

-- CreateIndex
CREATE INDEX "PromotionRedemptionCode_promotionId_idx" ON "PromotionRedemptionCode"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionRedemptionCode_walletId_idx" ON "PromotionRedemptionCode"("walletId");

-- CreateIndex
CREATE INDEX "PromotionRedemptionCode_code_idx" ON "PromotionRedemptionCode"("code");

-- AddForeignKey
ALTER TABLE "PromotionRedemptionCode" ADD CONSTRAINT "PromotionRedemptionCode_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemptionCode" ADD CONSTRAINT "PromotionRedemptionCode_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "PointsWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
