// fidelity/fidelity.module.ts
import { Module } from '@nestjs/common';
import { FidelityService } from './fidelity.service';
import { FidelityController } from './fidelity.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientModule } from '../client/client.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [PrismaModule, ClientModule, BusinessModule],
  controllers: [FidelityController],
  providers: [FidelityService],
  exports: [FidelityService],
})
export class FidelityModule {}