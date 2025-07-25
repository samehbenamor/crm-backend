import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseConfig } from '../../config/supabase.config';
import { ClientModule } from '../client/client.module';
import { BusinessOwnerModule } from '../business-owner/business-owner.module';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [forwardRef(() => ClientModule), forwardRef(() => BusinessOwnerModule), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Export SupabaseConfig
})
export class AuthModule {}
