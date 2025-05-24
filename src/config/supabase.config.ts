// src/config/supabase.config.ts

import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Injectable, Global } from '@nestjs/common';
import { ConfigType } from './configuration';

@Injectable()
export class SupabaseConfig {
  private readonly supabase;
  private readonly authSupabase;

  constructor(private configService: ConfigService<ConfigType>) {
    this.supabase = createClient(
      this.configService.get('supabase.url', { infer: true })!,
      this.configService.get('supabase.publicKey', { infer: true })!,
      
      {
        db: {
          schema: 'public' // Explicitly only use public schema
        }
      }
    );
    this.authSupabase = createClient(
      this.configService.get('supabase.url', { infer: true })!,
      this.configService.get('supabase.serviceKey', { infer: true })!,
      {
        db: {
          schema: 'auth'
        }
      }
    );
  }

  get client() {
    return this.supabase;
  }
  get authClient() {
    return this.authSupabase;
  }
  /**
   * Create a Supabase client that will use the user's JWT token
   * This helps bypass RLS issues when the server makes requests
   */
  getClientWithUser(jwt: string) {
    return createClient(
      this.configService.get('supabase.url', { infer: true })!,
      this.configService.get('supabase.publicKey', { infer: true })!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    );
  }
}

// Export a function to create Supabase client without dependency injection
// Useful for guards and decorators where DI is not available
export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string
) => {
  return createClient(supabaseUrl, supabaseKey);
};