import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt, IsBoolean, IsOptional, IsEmail } from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly name: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly lastName?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly docType?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly docNumber?: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly password: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly phone?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    readonly avatar?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional()
    readonly isActive?: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    @ApiProperty({ type: [Number] })
    readonly roleIds: number[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}