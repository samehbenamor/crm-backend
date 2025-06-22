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

  // ─── Config & helpers ────────────────────────────────────────────────────────
  const configService = app.get<ConfigService<ConfigType>>(ConfigService);
  const port = configService.get('port', { infer: true }) ?? 3000;

  // ─── CORS ────────────────────────────────────────────────────────────────────
  if (configService.get('security.cors.enabled', { infer: true })) {
    logger.log(
      'CORS enabled with origin: ' +
        configService.get('security.cors.origin', { infer: true }),
    );
    app.enableCors({
      origin: '*',         // ⚠️ dev only – tighten in production
      credentials: true,
    });
  }

  // ─── Validation ──────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Routing ────────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  // ─── Start server ────────────────────────────────────────────────────────────
  await app.listen(port, '0.0.0.0'); // bind to ALL interfaces once

  logger.log(`Application running on port ${port}`);
  logger.log(
    `Supabase URL: ${configService.get('supabase.url', { infer: true })}`,
  );
}

bootstrap();
