import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async validateUser(email: string, password: string) {
        const user: User = await this.usersService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, refreshToken: __, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles?.map((r: any) => r.name) || [],
        };

        const tokens = await this.generateTokens(payload);
        await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user,
        };
    }

    async register(registerDto: RegisterDto) {
        // Check if user already exists
        try {
            await this.usersService.findByEmail(registerDto.email);
            throw new ConflictException('Email already registered');
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            // User not found, proceed with registration
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const newUser = await this.usersService.createFromRegister({
            name: registerDto.name,
            lastName: registerDto.lastName || '',
            email: registerDto.email,
            phone: registerDto.phone || '',
            password: hashedPassword,
            role: registerDto.role,
        });

        const { password: _, refreshToken: __, ...userResult } = newUser;
        return this.login(userResult);
    }

    async refreshTokens(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles?.map((r: any) => r.name) || [],
        };

        const tokens = await this.generateTokens(payload);
        await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

        const { password: _, refreshToken: __, ...userResult } = user;
        return {
            ...tokens,
            user: userResult,
        };
    }

    async logout(userId: number) {
        await this.usersService.updateRefreshToken(userId, null);
        return { message: 'Logged out successfully' };
    }

    private async generateTokens(payload: { sub: number; email: string; roles: string[] }) {
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('config.jwt.refreshSecret'),
                expiresIn: this.configService.get<number>('config.jwt.refreshExpiresIn'),
            }),
        ]);

        return { access_token, refresh_token };
    }
}
