import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { OwnershipGuard } from '../../../common/guards/ownership.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Modules('users')
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService){}

    @Get()
    @UseGuards(JwtAuthGuard, ModulesGuard, RolesGuard)
    @Roles('admin') // Solo un admin debería poder listar TODOS los usuarios
    @ApiOperation({ summary: 'Obtener todos los usuarios (Solo Admin)' })
    getUsers() {
        return this.usersService.findAll();
    }

    @Get(':userId')
    @UseGuards(JwtAuthGuard, ModulesGuard, OwnershipGuard)
    @ApiOperation({ summary: 'Obtener perfil de un usuario específico' })
    @ApiResponse({ status: 403, description: 'No tienes permiso para ver esta cuenta' })
    getOne(@Param('userId', ParseIntPipe) userId: number){
        return this.usersService.findOne(userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, ModulesGuard, RolesGuard)
    @Roles('admin') // Asumimos que la creación libre por API la hace un admin (el público usa /auth/register)
    @ApiOperation({ summary: 'Crear un nuevo usuario manualmente (Solo Admin)' })
    createUser(@Body() payload: CreateUserDto){
        return this.usersService.create(payload);
    }

    @Put(':userId')
    @UseGuards(JwtAuthGuard, ModulesGuard, OwnershipGuard)
    @ApiOperation({ summary: 'Actualizar datos de un usuario' })
    @ApiResponse({ status: 403, description: 'No tienes permiso para modificar esta cuenta' })
    updateUser(@Param('userId', ParseIntPipe) userId: number, @Body() payloadUpdated: UpdateUserDto){
        return this.usersService.updateUser(userId, payloadUpdated);
    }

    @Delete(':userId')
    @UseGuards(JwtAuthGuard, ModulesGuard, OwnershipGuard)
    @ApiOperation({ summary: 'Eliminar una cuenta de usuario' })
    @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta cuenta' })
    deleteUser(@Param('userId', ParseIntPipe) userId: number){
        this.usersService.deleteUser(userId);
    }

}
