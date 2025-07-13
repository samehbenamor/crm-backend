-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_refereeClientId_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referrerClientId_fkey";

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerClientId_fkey" FOREIGN KEY ("referrerClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeClientId_fkey" FOREIGN KEY ("refereeClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
