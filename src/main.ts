import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './config/env/env.service';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from './core/interceptors/log-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'RAMAX', // Default is "Nest"
    }),
  });
  app.enableCors();
  app.setGlobalPrefix('api');

  // Global validation for all comming requests
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: false,
      },
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LogInterceptor());

  const envService = app.get(EnvService);
  const HOST = 'http://localhost'; // TODO
  const PORT = envService.get('BE_PORT');
  await app.listen(PORT);

  console.log();
  const logger = new Logger('API Bootstrap');
  logger.verbose(`API available on: ${HOST}:${PORT}/api`);
  logger.verbose(`API health available on: ${HOST}:${PORT}/api/health`);

  // TODO: docs
}
bootstrap();
