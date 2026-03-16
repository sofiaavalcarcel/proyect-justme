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
    @ApiOperation({ summary: 'Get dashboard statistics' })
    getStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('users')
    @ApiOperation({ summary: 'Get paginated user list' })
    getUsers(@Query() pagination: PaginationDto) {
        return this.adminService.getUsers(pagination.page, pagination.limit);
    }

    @Get('professionals')
    @ApiOperation({ summary: 'Get paginated professional list' })
    getProfessionals(@Query() pagination: PaginationDto) {
        return this.adminService.getProfessionals(pagination.page, pagination.limit);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get paginated transaction list' })
    getTransactions(@Query() pagination: PaginationDto) {
        return this.adminService.getTransactions(pagination.page, pagination.limit);
    }

    @Patch('users/:id/status')
    @ApiOperation({ summary: 'Toggle user active status' })
    toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.toggleUserStatus(id);
    }

    @Patch('professionals/:id/verify')
    @ApiOperation({ summary: 'Verify a professional' })
    verifyProfessional(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.verifyProfessional(id);
    }
}
