import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Transaction } from '../../wallet/entities/transaction.entity';
import { Service } from '../../services/entities/service.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Professional) private proRepo: Repository<Professional>,
        @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
        @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
        @InjectRepository(Service) private serviceRepo: Repository<Service>,
    ) {}

    async getDashboardStats() {
        const [totalUsers, totalProfessionals, totalBookings, activeServices] = await Promise.all([
            this.userRepo.count(),
            this.proRepo.count(),
            this.bookingRepo.count(),
            this.serviceRepo.count({ where: { isActive: true } }),
        ]);

        // Revenue calculation
        const revenueResult = await this.transactionRepo
            .createQueryBuilder('t')
            .select('SUM(CASE WHEN t.type = \'payment\' THEN t.amount ELSE 0 END)', 'totalRevenue')
            .addSelect('SUM(CASE WHEN t.type = \'commission\' THEN ABS(t.amount) ELSE 0 END)', 'commissionsCollected')
            .getRawOne();

        // Average rating
        const ratingResult = await this.proRepo
            .createQueryBuilder('p')
            .select('AVG(p.averageRating)', 'avgRating')
            .where('p.averageRating > 0')
            .getRawOne();

        return {
            totalUsers,
            totalProfessionals,
            totalBookings,
            totalRevenue: parseFloat(revenueResult?.totalRevenue) || 0,
            commissionsCollected: parseFloat(revenueResult?.commissionsCollected) || 0,
            activeServices,
            avgRating: parseFloat(ratingResult?.avgRating) || 0,
        };
    }

    async getUsers(page: number = 1, limit: number = 20) {
        const [data, total] = await this.userRepo.findAndCount({
            relations: ['roles'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getProfessionals(page: number = 1, limit: number = 20) {
        const [data, total] = await this.proRepo.findAndCount({
            relations: ['user', 'professionalServices', 'professionalServices.service'],
            skip: (page - 1) * limit,
            take: limit,
            order: { joinDate: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getTransactions(page: number = 1, limit: number = 20) {
        const [data, total] = await this.transactionRepo.findAndCount({
            relations: ['wallet', 'wallet.professional', 'wallet.professional.user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async toggleUserStatus(userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) return null;
        user.isActive = !user.isActive;
        return this.userRepo.save(user);
    }

    async verifyProfessional(professionalId: number) {
        await this.proRepo.update(professionalId, { verified: true });
        return { success: true };
    }
}
