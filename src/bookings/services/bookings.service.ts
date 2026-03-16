import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { ProfessionalService } from '../../services/entities/professional-service.entity';
import { CreateBookingDto } from '../dtos/booking.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { ProfessionalsService } from '../../professionals/services/professionals.service';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
        @InjectRepository(ProfessionalService) private proServiceRepo: Repository<ProfessionalService>,
        private notificationsService: NotificationsService,
        private professionalsService: ProfessionalsService,
    ) {}

    async create(userId: number, dto: CreateBookingDto) {
        // Get service duration
        const proService = await this.proServiceRepo.findOne({
            where: { id: dto.professionalServiceId },
            relations: ['service'],
        });
        if (!proService) throw new NotFoundException('Professional service not found');

        // Calculate end time
        const endTime = this.addMinutes(dto.startTime, proService.duration);

        // Check for conflicting bookings
        const conflict = await this.bookingRepo
            .createQueryBuilder('booking')
            .where('booking.professionalId = :proId', { proId: dto.professionalId })
            .andWhere('booking.date = :date', { date: dto.date })
            .andWhere('booking.status IN (:...statuses)', {
                statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
            })
            .andWhere(
                '(booking.startTime < :endTime AND booking.endTime > :startTime)',
                { startTime: dto.startTime, endTime },
            )
            .getOne();

        if (conflict) {
            throw new BadRequestException('Time slot conflicts with an existing booking');
        }

        // Create booking (auto-confirmed)
        const booking = this.bookingRepo.create({
            userId,
            professionalId: dto.professionalId,
            professionalServiceId: dto.professionalServiceId,
            date: dto.date,
            startTime: dto.startTime,
            endTime,
            price: proService.price,
            location: dto.location,
            locationType: dto.locationType,
            status: BookingStatus.CONFIRMED,
        });

        const saved = await this.bookingRepo.save(booking);

        // Notify professional
        const professional = await this.professionalsService.findOne(dto.professionalId);
        await this.notificationsService.send(
            professional.userId,
            'New Booking',
            `You have a new booking for ${proService.service?.name} on ${dto.date} at ${dto.startTime}`,
            NotificationType.BOOKING,
            { bookingId: saved.id },
        );

        return saved;
    }

    async findUserBookings(userId: number) {
        return this.bookingRepo.find({
            where: { userId },
            relations: ['professional', 'professional.user', 'professionalService', 'professionalService.service'],
            order: { date: 'DESC', startTime: 'DESC' },
        });
    }

    async findProfessionalBookings(professionalId: number) {
        return this.bookingRepo.find({
            where: { professionalId },
            relations: ['user', 'professionalService', 'professionalService.service'],
            order: { date: 'DESC', startTime: 'DESC' },
        });
    }

    async findOne(id: number) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
            relations: ['user', 'professional', 'professional.user', 'professionalService', 'professionalService.service'],
        });
        if (!booking) throw new NotFoundException(`Booking #${id} not found`);
        return booking;
    }

    async updateStatus(id: number, status: BookingStatus) {
        const booking = await this.findOne(id);
        booking.status = status;

        if (status === BookingStatus.COMPLETED) {
            await this.professionalsService.incrementCompletedServices(booking.professionalId);
        }

        return this.bookingRepo.save(booking);
    }

    private addMinutes(time: string, minutes: number): string {
        const [h, m] = time.split(':').map(Number);
        const totalMinutes = h * 60 + (m || 0) + minutes;
        const newH = Math.floor(totalMinutes / 60);
        const newM = totalMinutes % 60;
        return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    }
}
