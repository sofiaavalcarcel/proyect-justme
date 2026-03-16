import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProfessionalServiceDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    serviceId: number;

    @ApiProperty({ example: 35.00 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 60, description: 'Duration in minutes' })
    @IsNumber()
    duration: number;

    @ApiPropertyOptional({ example: 'Precision haircut with wash and style' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateProfessionalServiceDto extends PartialType(CreateProfessionalServiceDto) {}
