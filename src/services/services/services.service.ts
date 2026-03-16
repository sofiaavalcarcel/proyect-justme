import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { ProfessionalService } from '../entities/professional-service.entity';
import { CreateServiceDto, UpdateServiceDto } from '../dtos/service.dto';
import { CreateProfessionalServiceDto, UpdateProfessionalServiceDto } from '../dtos/professional-service.dto';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service) private serviceRepo: Repository<Service>,
        @InjectRepository(ProfessionalService) private proServiceRepo: Repository<ProfessionalService>,
    ) {}

    // Service categories
    async findAllCategories() {
        return this.serviceRepo.find({ where: { isActive: true } });
    }

    async findCategoryById(id: number) {
        const service = await this.serviceRepo.findOne({ where: { id } });
        if (!service) throw new NotFoundException(`Service #${id} not found`);
        return service;
    }

    async createCategory(dto: CreateServiceDto) {
        const service = this.serviceRepo.create(dto);
        return this.serviceRepo.save(service);
    }

    async updateCategory(id: number, dto: UpdateServiceDto) {
        const service = await this.findCategoryById(id);
        this.serviceRepo.merge(service, dto);
        return this.serviceRepo.save(service);
    }

    // Professional services
    async findProfessionalServices(professionalId: number) {
        return this.proServiceRepo.find({
            where: { professionalId, isActive: true },
            relations: ['service'],
        });
    }

    async addProfessionalService(professionalId: number, dto: CreateProfessionalServiceDto) {
        const service = this.proServiceRepo.create({
            professionalId,
            ...dto,
        });
        return this.proServiceRepo.save(service);
    }

    async updateProfessionalService(id: number, dto: UpdateProfessionalServiceDto) {
        const service = await this.proServiceRepo.findOne({ where: { id } });
        if (!service) throw new NotFoundException(`Professional service #${id} not found`);
        this.proServiceRepo.merge(service, dto);
        return this.proServiceRepo.save(service);
    }

    async removeProfessionalService(id: number) {
        return this.proServiceRepo.delete(id);
    }
}
