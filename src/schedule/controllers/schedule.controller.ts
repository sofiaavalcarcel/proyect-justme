import {
    Controller, Get, Put, Body, Param, ParseIntPipe, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ScheduleService } from '../services/schedule.service';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Get(':professionalId')
    @ApiOperation({ summary: 'Get professional schedule configuration' })
    getSchedule(@Param('professionalId', ParseIntPipe) professionalId: number) {
        return this.scheduleService.getSchedule(professionalId);
    }

    @Put(':professionalId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set or update professional schedule' })
    setSchedule(
        @Param('professionalId', ParseIntPipe) professionalId: number,
        @Body() scheduleData: any,
    ) {
        return this.scheduleService.setSchedule(professionalId, scheduleData);
    }

    @Get(':professionalId/available-slots')
    @ApiOperation({ summary: 'Get available time slots for a date' })
    getAvailableSlots(
        @Param('professionalId', ParseIntPipe) professionalId: number,
        @Query('date') date: string,
    ) {
        return this.scheduleService.getAvailableSlots(professionalId, date);
    }
}
