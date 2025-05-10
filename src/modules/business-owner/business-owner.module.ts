import { Module } from '@nestjs/common';
import { BusinessOwnerController } from './business-owner.controller';
import { BusinessOwnerService } from './business-owner.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BusinessOwnerController],
  providers: [BusinessOwnerService],
  exports: [BusinessOwnerService],
})
export class BusinessOwnerModule {}
