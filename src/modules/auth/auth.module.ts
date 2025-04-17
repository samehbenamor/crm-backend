import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseConfig } from '../../config/supabase.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseConfig],
  exports: [AuthService, SupabaseConfig], // Export SupabaseConfig
})
export class AuthModule {}