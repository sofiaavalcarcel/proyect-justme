import {
    Controller, Get, Post, Patch, Delete, Body, Param,
    ParseIntPipe, Query, UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfessionalsService } from '../services/professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto, NearbySearchDto } from '../dtos/professional.dto';

@ApiTags('Professionals')
@Controller('professionals')
export class ProfessionalsController {
    constructor(private readonly professionalsService: ProfessionalsService) {}

    @Get('nearby')
    @ApiOperation({ summary: 'Find professionals near a location' })
    findNearby(@Query() query: NearbySearchDto) {
        return this.professionalsService.findNearby(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get professional profile by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.professionalsService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get professional profile by user ID' })
    findByUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.professionalsService.findByUserId(userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create professional profile' })
    create(@CurrentUser('id') userId: number, @Body() dto: CreateProfessionalDto) {
        return this.professionalsService.create(userId, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update professional profile' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfessionalDto) {
        return this.professionalsService.update(id, dto);
    }

    @Post(':id/portfolio')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload portfolio image' })
    async uploadPortfolioImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('caption') caption?: string,
    ) {
        const imageUrl = `/uploads/portfolio/${file?.filename || 'default.jpg'}`;
        return this.professionalsService.addPortfolioImage(id, imageUrl, caption);
    }

    @Delete('portfolio/:imageId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove portfolio image' })
    removePortfolioImage(@Param('imageId', ParseIntPipe) imageId: number) {
        return this.professionalsService.removePortfolioImage(imageId);
    }
}
