import {
    Controller, Get, Put, Body, Param, ParseIntPipe, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ScheduleService } from '../services/schedule.service';

@ApiTags('Agenda')
@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Get(':professionalId')
    @ApiOperation({ summary: 'Obtener configuración de agenda del profesional' })
    getSchedule(@Param('professionalId', ParseIntPipe) professionalId: number) {
        return this.scheduleService.getSchedule(professionalId);
    }

    @Put(':professionalId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Configurar o actualizar la agenda del profesional' })
    setSchedule(
        @Param('professionalId', ParseIntPipe) professionalId: number,
        @Body() scheduleData: any,
    ) {
        return this.scheduleService.setSchedule(professionalId, scheduleData);
    }

    @Get(':professionalId/available-slots')
    @ApiOperation({ summary: 'Obtener los horarios disponibles para una fecha' })
    getAvailableSlots(
        @Param('professionalId', ParseIntPipe) professionalId: number,
        @Query('date') date: string,
    ) {
        return this.scheduleService.getAvailableSlots(professionalId, date);
    }
}
