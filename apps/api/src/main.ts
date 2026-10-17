import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['health', ''],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('PikMoolya API')
    .setDescription('AI-Based Fair Price Discovery and Direct Market Access Platform for Farmers')
    .setVersion('2.4.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`PikMoolya NestJS Backend running on http://localhost:${port}/api`);
  console.log(`Swagger OpenAPI documentation available on http://localhost:${port}/api/docs`);
}

bootstrap();