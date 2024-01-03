import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from "helmet";
import * as cookieParser from "cookie-parser"

const cors = require('cors')
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors())

  const config = new DocumentBuilder()
    .setTitle('DJONANKO CORE API')
    .setDescription('Djonanko core API description')
    .setVersion('1.0')
    .addTag('Djonanko')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT");
  app.use(cookieParser())

  await app.listen(port);
}
bootstrap();
