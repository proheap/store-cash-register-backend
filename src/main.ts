import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConstants } from './configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle(swaggerConstants.title)
    .setDescription(swaggerConstants.description)
    .setVersion(swaggerConstants.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConstants.route, app, document);
  await app.listen(process.env.BE_PORT);
}
bootstrap();
