import {
    Controller, Get, Post, Patch, Delete, Body, Param,
    ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto, UpdateServiceDto } from '../dtos/service.dto';
import { CreateProfessionalServiceDto, UpdateProfessionalServiceDto } from '../dtos/professional-service.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    // Service Categories
    @Get('categories')
    @ApiOperation({ summary: 'Get all service categories' })
    findAllCategories() {
        return this.servicesService.findAllCategories();
    }

    @Get('categories/:id')
    @ApiOperation({ summary: 'Get service category by ID' })
    findCategory(@Param('id', ParseIntPipe) id: number) {
        return this.servicesService.findCategoryById(id);
    }

    @Post('categories')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create service category (admin)' })
    createCategory(@Body() dto: CreateServiceDto) {
        return this.servicesService.createCategory(dto);
    }

    @Patch('categories/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update service category (admin)' })
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
        return this.servicesService.updateCategory(id, dto);
    }

    // Professional Services
    @Get('professional/:professionalId')
    @ApiOperation({ summary: 'Get services offered by a professional' })
    findProfessionalServices(@Param('professionalId', ParseIntPipe) professionalId: number) {
        return this.servicesService.findProfessionalServices(professionalId);
    }

    @Post('professional/:professionalId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add service to professional profile' })
    addProfessionalService(
        @Param('professionalId', ParseIntPipe) professionalId: number,
        @Body() dto: CreateProfessionalServiceDto,
    ) {
        return this.servicesService.addProfessionalService(professionalId, dto);
    }

    @Patch('professional-service/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update professional service listing' })
    updateProfessionalService(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProfessionalServiceDto,
    ) {
        return this.servicesService.updateProfessionalService(id, dto);
    }

    @Delete('professional-service/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove professional service listing' })
    removeProfessionalService(@Param('id', ParseIntPipe) id: number) {
        return this.servicesService.removeProfessionalService(id);
    }
}
