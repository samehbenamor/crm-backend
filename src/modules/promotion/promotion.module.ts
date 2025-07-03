// promotion/promotion.module.ts
import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessModule } from '../business/business.module';
import { FidelityModule } from '../fidelity/fidelity.module';
import { QrCodeService } from './qr-code.service';
@Module({
  imports: [PrismaModule, BusinessModule, FidelityModule],
  controllers: [PromotionController],
  providers: [PromotionService, QrCodeService],
  exports: [PromotionService],
})
export class PromotionModule {}