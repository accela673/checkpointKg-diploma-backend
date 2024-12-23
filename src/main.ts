import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'path'; // Для разрешения пути до папки
dotenv.config();
const timeout = require('connect-timeout');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Конфигурация порта и безопасности
  const PORT = process.env.PORT || 8080;
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 1000, // Ограничение на 1000 запросов с одного IP за 15 минут
      message: 'Too many requests from this IP, please try again later.',
      headers: true,
    }),
  );
  app.use(timeout('50s'));

  // Включаем валидацию для запросов
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Отклонение запросов с лишними полями
      transform: true,
    }),
  );

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('CheckpointKg')
    .setDescription('API documentation for diploma work')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запуск сервера
  await app.listen(PORT, () =>
    Logger.log(`App is running on url ${process.env.BASE_URL}`),
  );
}
bootstrap();
