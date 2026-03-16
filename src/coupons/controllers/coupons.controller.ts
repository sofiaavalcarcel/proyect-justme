import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CouponsService } from '../services/coupons.service';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user coupons' })
    getUserCoupons(@CurrentUser('id') userId: number) {
        return this.couponsService.getUserCoupons(userId);
    }

    @Post('validate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Validate a coupon code' })
    validateCoupon(@Body('code') code: string, @CurrentUser('id') userId: number) {
        return this.couponsService.validateCoupon(code, userId);
    }

    @Get('incentives')
    @ApiOperation({ summary: 'Get active incentive programs' })
    getIncentives() {
        return this.couponsService.getActiveIncentives();
    }

    @Post('incentives')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create incentive program (admin)' })
    createIncentive(@Body() body: any) {
        return this.couponsService.createIncentive(body);
    }
}
