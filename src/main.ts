import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './config/env/env.service';
import { ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from './common/interceptors/log-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  envService.get('BE_PORT');

  const PORT = envService.get('BE_PORT');
  await app.listen(PORT);
}
bootstrap();
