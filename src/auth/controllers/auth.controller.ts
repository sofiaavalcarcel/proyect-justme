import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión con correo electrónico y contraseña' })
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(body.email, body.password);
        return this.authService.login(user);
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refrescar el token de acceso' })
    async refresh(@CurrentUser('id') userId: number) {
        return this.authService.refreshTokens(userId);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cerrar sesión e invalidar el token de refresco' })
    async logout(@CurrentUser('id') userId: number) {
        return this.authService.logout(userId);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
    async getProfile(@CurrentUser() user: any) {
        return user;
    }
}
