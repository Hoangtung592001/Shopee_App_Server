require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from '$app/app.module';
import config from '$config';
import { getLogger } from 'log4js';
import '$helpers/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    cors: true,
  });

  await app.listen(config.SERVER_PORT);
  getLogger().info(`Server is running on port ${config.SERVER_PORT}`);
}
bootstrap();
