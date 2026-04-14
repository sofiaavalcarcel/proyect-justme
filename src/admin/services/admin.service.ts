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

    async updateUser(id: number, data: any) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) return null;
        
        // No permitimos actualizar el password por aquí por seguridad
        delete data.password;
        
        this.userRepo.merge(user, data);
        return this.userRepo.save(user);
    }

    async getServices() {
        return this.serviceRepo.find();
    }

    async updateService(id: number, data: any) {
        const service = await this.serviceRepo.findOne({ where: { id } });
        if (!service) return null;
        this.serviceRepo.merge(service, data);
        return this.serviceRepo.save(service);
    }

    async updateProfessional(id: number, data: any) {
        const pro = await this.proRepo.findOne({ where: { id }, relations: ['user'] });
        if (!pro) return null;

        // Si data contiene información del usuario (name, email, etc), la extraemos
        if (data.user && pro.user) {
            this.userRepo.merge(pro.user, data.user);
            await this.userRepo.save(pro.user);
            delete data.user;
        } else if (data.name || data.lastName || data.email) {
            // Manejo alternativo si el frontend envía los campos planos
            const { name, lastName, email, phone, ...proData } = data;
            const userData: any = {};
            if (name !== undefined) userData.name = name;
            if (lastName !== undefined) userData.lastName = lastName;
            if (email !== undefined) userData.email = email;
            if (phone !== undefined) userData.phone = phone;

            if (Object.keys(userData).length > 0 && pro.user) {
                this.userRepo.merge(pro.user, userData);
                await this.userRepo.save(pro.user);
            }
            data = proData;
        }

        this.proRepo.merge(pro, data);
        return this.proRepo.save(pro);
    }

    async verifyProfessional(professionalId: number) {
        await this.proRepo.update(professionalId, { verified: true });
        return { success: true };
    }
}
