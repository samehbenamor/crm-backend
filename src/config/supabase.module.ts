// src/config/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { SupabaseConfig } from './supabase.config';

@Global()                      // makes every exported provider visible everywhere
@Module({
  providers: [SupabaseConfig], // register the provider once
  exports:   [SupabaseConfig], // re-export it
})
export class SupabaseModule {}
