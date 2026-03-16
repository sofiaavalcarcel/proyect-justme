import {
    Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dtos/booking.dto';
import { BookingStatus } from '../entities/booking.entity';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new booking' })
    create(@CurrentUser('id') userId: number, @Body() dto: CreateBookingDto) {
        return this.bookingsService.create(userId, dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user bookings' })
    findUserBookings(@CurrentUser('id') userId: number) {
        return this.bookingsService.findUserBookings(userId);
    }

    @Get('professional/:professionalId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get bookings for a professional' })
    findProfessionalBookings(@Param('professionalId', ParseIntPipe) professionalId: number) {
        return this.bookingsService.findProfessionalBookings(professionalId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get booking by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update booking status' })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBookingStatusDto,
    ) {
        return this.bookingsService.updateStatus(id, dto.status as BookingStatus);
    }
}
