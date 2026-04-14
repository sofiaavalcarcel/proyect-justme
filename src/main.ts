import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // 1. Get port from ConfigService (recommended way)
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;

    // 2. Security Middlewares
    app.use(helmet());
    app.enableCors({
        origin: (origin, callback) => {
            // Allow any origin from localhost during development
            if (!origin || origin.startsWith('http://localhost')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // 3. Global Pipes & Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            exceptionFactory: (errors) => {
                const messages = errors.map((err) => ({
                    field: err.property,
                    errors: Object.values(err.constraints || {}),
                }));
                return new BadRequestException({ message: 'Validation failed', errors: messages });
            },
        }),
    );

    // 4. API Prefix
    app.setGlobalPrefix('api');

    // 5. Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle('JustMe API')
        .setDescription('JustMe — Location-based beauty marketplace API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // 6. Start Application
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
    logger.log(`📖 Documentation available at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
    const logger = new Logger('BootstrapError');
    logger.error('Critical failure during application startup', err);
    process.exit(1);
});
