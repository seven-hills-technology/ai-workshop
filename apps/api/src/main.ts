import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:7801' });
  await app.listen(7800);
  // eslint-disable-next-line no-console
  console.log('api running on http://localhost:7800');
}

bootstrap();
