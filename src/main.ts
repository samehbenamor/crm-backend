import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);
  
  // Use Render's PORT environment variable (default 10000) or fallback to 3000 for local dev
  const port = process.env.PORT || 3000;

  // ─── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: '*', // Adjust for production
    credentials: true,
  });

  // ─── Global Config ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Static files
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`🚀 Server running on port ${port}`);
  });

  // Log configurations
  logger.log(`Supabase URL: ${configService.get('supabase.url', { infer: true })}`);
}

bootstrap();