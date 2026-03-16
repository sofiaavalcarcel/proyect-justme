import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from './entities/professional.entity';
import { PortfolioImage } from './entities/portfolio-image.entity';
import { ProfessionalsService } from './services/professionals.service';
import { ProfessionalsController } from './controllers/professionals.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Module({
    imports: [
        TypeOrmModule.forFeature([Professional, PortfolioImage]),
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/portfolio',
                filename: (_req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
        }),
    ],
    controllers: [ProfessionalsController],
    providers: [ProfessionalsService],
    exports: [ProfessionalsService],
})
export class ProfessionalsModule {}
