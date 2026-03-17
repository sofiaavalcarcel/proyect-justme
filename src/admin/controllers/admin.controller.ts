import { Controller, Get, Patch, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from '../services/admin.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
    getStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('users')
    @ApiOperation({ summary: 'Obtener listado paginado de usuarios' })
    getUsers(@Query() pagination: PaginationDto) {
        return this.adminService.getUsers(pagination.page, pagination.limit);
    }

    @Get('professionals')
    @ApiOperation({ summary: 'Obtener listado paginado de profesionales' })
    getProfessionals(@Query() pagination: PaginationDto) {
        return this.adminService.getProfessionals(pagination.page, pagination.limit);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Obtener listado paginado de transacciones' })
    getTransactions(@Query() pagination: PaginationDto) {
        return this.adminService.getTransactions(pagination.page, pagination.limit);
    }

    @Patch('users/:id/status')
    @ApiOperation({ summary: 'Alternar estado activo del usuario' })
    toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.toggleUserStatus(id);
    }

    @Patch('professionals/:id/verify')
    @ApiOperation({ summary: 'Verificar a un profesional' })
    verifyProfessional(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.verifyProfessional(id);
    }
}
