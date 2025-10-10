import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './config/env/env.service';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { LogInterceptor } from './core/interceptors/log-interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_API_SECURITY } from './core/constants/swagger-security';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'RAMAX', // Default is "Nest"
    }),
  });

  // App config
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

  // Global intercepting for logging all comming requests
  app.useGlobalInterceptors(new LogInterceptor());

  // Docs Config
  const swaggerUrlPrefix = `api/docs`;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RAMAX - MIS')
    .setDescription('Sistema de informações gerenciais e gerais da RAMAX Group')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      SWAGGER_API_SECURITY.BEARER_AUTH,
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Chave de acesso à API (header x-api-key)',
      },
      SWAGGER_API_SECURITY.API_KEY_AUTH,
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(swaggerUrlPrefix, app, documentFactory, {
    jsonDocumentUrl: `${swaggerUrlPrefix}/json`,
  });

  const envService = app.get(EnvService);
  const HOST = envService.get('BE_HOST');
  const PORT = envService.get('BE_PORT');
  await app.listen(PORT);

  const logger = new Logger('API Bootstrap');
  console.log();
  logger.verbose(`API available on: ${HOST}/api`);
  logger.verbose(`API health available on: ${HOST}/api/health`);
  logger.verbose(`API Docs available on: ${HOST}/api/docs`);
}
bootstrap();
