import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleBreak } from './entities/schedule-break.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ScheduleService } from './services/schedule.service';
import { ScheduleController } from './controllers/schedule.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule, ScheduleBreak, Booking])],
    controllers: [ScheduleController],
    providers: [ScheduleService],
    exports: [ScheduleService],
})
export class ScheduleModule {}
