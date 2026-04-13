import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:4200' });
  await app.listen(3000);
  // eslint-disable-next-line no-console
  console.log('api running on http://localhost:3000');
}

bootstrap();
