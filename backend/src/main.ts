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

  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`Backend listening on port ${port}`);
}
bootstrap();