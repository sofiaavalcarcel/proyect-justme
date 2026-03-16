import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from '../entities/professional.entity';
import { PortfolioImage } from '../entities/portfolio-image.entity';
import { CreateProfessionalDto, UpdateProfessionalDto, NearbySearchDto } from '../dtos/professional.dto';

@Injectable()
export class ProfessionalsService {
    constructor(
        @InjectRepository(Professional) private proRepo: Repository<Professional>,
        @InjectRepository(PortfolioImage) private portfolioRepo: Repository<PortfolioImage>,
    ) {}

    async findNearby(dto: NearbySearchDto) {
        const radius = dto.radius || 5; // km
        const radiusInDegrees = radius / 111.32; // approximate conversion

        let query = this.proRepo
            .createQueryBuilder('professional')
            .leftJoinAndSelect('professional.user', 'user')
            .leftJoinAndSelect('professional.professionalServices', 'ps')
            .leftJoinAndSelect('ps.service', 'service')
            .where('professional.isVisible = :visible', { visible: true })
            .andWhere('professional.latitude IS NOT NULL')
            .andWhere('professional.longitude IS NOT NULL')
            .andWhere(
                `ABS(professional.latitude - :lat) < :radiusInDegrees AND ABS(professional.longitude - :lng) < :radiusInDegrees`,
                { lat: dto.latitude, lng: dto.longitude, radiusInDegrees },
            );

        if (dto.service) {
            query = query.andWhere('service.name ILIKE :serviceName', {
                serviceName: `%${dto.service}%`,
            });
        }

        const professionals = await query
            .orderBy('professional.averageRating', 'DESC')
            .addOrderBy('professional.completedServices', 'DESC')
            .getMany();

        // Calculate actual distance and sort
        return professionals.map((pro) => {
            const distance = this.calculateDistance(
                dto.latitude,
                dto.longitude,
                Number(pro.latitude),
                Number(pro.longitude),
            );
            return { ...pro, distance: Math.round(distance * 10) / 10 };
        }).filter(pro => pro.distance <= radius)
          .sort((a, b) => a.distance - b.distance);
    }

    async findOne(id: number) {
        const professional = await this.proRepo.findOne({
            where: { id },
            relations: [
                'user',
                'professionalServices',
                'professionalServices.service',
                'portfolioImages',
                'schedules',
                'schedules.breaks',
                'reviews',
                'reviews.user',
            ],
        });
        if (!professional) {
            throw new NotFoundException(`Professional #${id} not found`);
        }
        return professional;
    }

    async findByUserId(userId: number) {
        return this.proRepo.findOne({
            where: { userId },
            relations: ['professionalServices', 'professionalServices.service', 'portfolioImages'],
        });
    }

    async create(userId: number, dto: CreateProfessionalDto) {
        const professional = this.proRepo.create({
            userId,
            ...dto,
        });
        return this.proRepo.save(professional);
    }

    async update(id: number, dto: UpdateProfessionalDto) {
        const professional = await this.findOne(id);
        this.proRepo.merge(professional, dto);
        return this.proRepo.save(professional);
    }

    async addPortfolioImage(professionalId: number, imageUrl: string, caption?: string) {
        const count = await this.portfolioRepo.count({ where: { professionalId } });
        const image = this.portfolioRepo.create({
            professionalId,
            imageUrl,
            caption,
            order: count,
        });
        return this.portfolioRepo.save(image);
    }

    async removePortfolioImage(imageId: number) {
        return this.portfolioRepo.delete(imageId);
    }

    async updateRating(professionalId: number) {
        const result = await this.proRepo
            .createQueryBuilder('professional')
            .leftJoin('professional.reviews', 'review')
            .select('AVG(review.rating)', 'avg')
            .addSelect('COUNT(review.id)', 'count')
            .where('professional.id = :id', { id: professionalId })
            .getRawOne();

        await this.proRepo.update(professionalId, {
            averageRating: parseFloat(result.avg) || 0,
            reviewCount: parseInt(result.count) || 0,
        });
    }

    async incrementCompletedServices(professionalId: number) {
        await this.proRepo.increment({ id: professionalId }, 'completedServices', 1);
    }

    async setVisibility(professionalId: number, visible: boolean) {
        await this.proRepo.update(professionalId, { isVisible: visible });
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
