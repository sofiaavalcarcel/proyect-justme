import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'Santiago' })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiPropertyOptional({ example: 'Rivera' })
    @IsString()
    @IsOptional()
    readonly lastName?: string;

    @ApiProperty({ example: 'santiago@justme.com' })
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @ApiPropertyOptional({ example: '+57 310 555 1234' })
    @IsString()
    @IsOptional()
    readonly phone?: string;

    @ApiProperty({ example: 'SecureP@ss123' })
    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @ApiProperty({ example: 'user', enum: ['user', 'professional'] })
    @IsString()
    @IsNotEmpty()
    readonly role: string;
}
