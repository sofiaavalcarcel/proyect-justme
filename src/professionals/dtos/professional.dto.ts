import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProfessionalDto {
    @ApiProperty({ example: 'Expert barber with 5 years experience' })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiProperty({ example: 4.711 })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: -74.0721 })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiPropertyOptional({ example: '123 Salon Ave, Bogotá' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 5.0 })
    @IsNumber()
    @IsOptional()
    serviceRadius?: number;
}

export class UpdateProfessionalDto extends PartialType(CreateProfessionalDto) {}

export class NearbySearchDto {
    @ApiProperty({ example: 4.711 })
    @IsNumber()
    latitude: number;

    @ApiProperty({ example: -74.0721 })
    @IsNumber()
    longitude: number;

    @ApiPropertyOptional({ example: 'Barber' })
    @IsString()
    @IsOptional()
    service?: string;

    @ApiPropertyOptional({ example: '2026-03-15' })
    @IsString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({ example: '10:00' })
    @IsString()
    @IsOptional()
    time?: string;

    @ApiPropertyOptional({ example: 5, default: 5 })
    @IsNumber()
    @IsOptional()
    radius?: number;
}
