import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ─── Load HTTPS Certificates ────────────────────────────────────────────────
  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, '..', 'localhost+2-key.pem')),
    cert: fs.readFileSync(join(__dirname, '..', 'localhost+2.pem')),
  };

  // ─── Create NestJS App ─────────────────────────────────────────────────────
  const app = await NestFactory.create(AppModule, {
    // Note: We're not passing httpsOptions here as we'll create servers manually
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // ─── Config & helpers ───────────────────────────────────────────────────────
  const configService = app.get<ConfigService<ConfigType>>(ConfigService);
  const port = configService.get('port', { infer: true }) ?? 3000;
  const httpsPort = port;
  const httpPort = port + 1; // Typically HTTP runs on next port (e.g., 3000 for HTTPS, 3001 for HTTP)

  // ─── CORS ───────────────────────────────────────────────────────────────────
  if (configService.get('security.cors.enabled', { infer: true })) {
    logger.log(
      'CORS enabled with origin: ' +
        configService.get('security.cors.origin', { infer: true }),
    );
    app.enableCors({
      origin: '*', // ⚠️ Dev only – restrict in production
      credentials: true,
    });
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
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

  // ─── Initialize App (without starting the server) ────────────────────────────
  await app.init();

  // ─── Create HTTP Server ─────────────────────────────────────────────────────
  // PORT 3001
  const httpServer = http.createServer(app.getHttpAdapter().getInstance());
  httpServer.listen(httpPort, '0.0.0.0', () => {
    logger.log(`✅ HTTP server running at: http://localhost:${httpPort}/api`);
  });

  // ─── Create HTTPS Server ─────────────────────────────────────────────────────
  // PORT 3000
  const httpsServer = https.createServer(
    httpsOptions,
    app.getHttpAdapter().getInstance(),
  );
  httpsServer.listen(httpsPort, '0.0.0.0', () => {
    logger.log(`✅ HTTPS server running at: https://localhost:${httpsPort}/api`);
  });

  // ─── Log Other Configurations ───────────────────────────────────────────────
  logger.log(
    `Supabase URL: ${configService.get('supabase.url', { infer: true })}`,
  );
}

bootstrap();