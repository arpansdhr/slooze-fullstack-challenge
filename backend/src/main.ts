import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Allow local frontend to call backend GraphQL API
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(4000);
  console.log('Backend listening on http://localhost:4000/graphql');
}
bootstrap();