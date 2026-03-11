import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(base => base.trim())
    : [];

  app.enableCors({
    origin: [
      'https://admin.jewellersparadise.com',
      'https://jewellersparadise.com',
      /\.jewellersparadise\.com$/, // Matches any subdomains
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:4000',
      ...corsOrigins,
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Origin',
    ],
    optionsSuccessStatus: 200,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
}
bootstrap();
