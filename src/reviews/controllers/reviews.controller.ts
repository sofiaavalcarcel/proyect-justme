import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a review for a professional' })
    create(@CurrentUser('id') userId: number, @Body() body: { professionalId: number; bookingId?: number; rating: number; comment?: string }) {
        return this.reviewsService.create(userId, body);
    }

    @Get('professional/:professionalId')
    @ApiOperation({ summary: 'Get reviews for a professional' })
    findByProfessional(@Param('professionalId', ParseIntPipe) professionalId: number) {
        return this.reviewsService.findByProfessional(professionalId);
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get reviews by current user' })
    findByUser(@CurrentUser('id') userId: number) {
        return this.reviewsService.findByUser(userId);
    }
}
