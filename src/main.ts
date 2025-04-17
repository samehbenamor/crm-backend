import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const configService = app.get(ConfigService<ConfigType>);
  const port = configService.get('port', { infer: true }) || 3000;
  if (configService.get('security.cors.enabled', { infer: true })) {
    logger.log(
      'CORS enabled with origin: ' +
        configService.get('security.cors.origin', { infer: true }),
    );
    app.enableCors({
      origin: configService.get('security.cors.origin', { infer: true }),
      credentials: true,
    });
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will remove non-decorated properties
      transform: true,  // automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // throw errors if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix('api');
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(
    `Supabase URL: ${configService.get('supabase.url', { infer: true })}`,
  );
}
bootstrap();
