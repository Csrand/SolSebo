import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Body,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../commons';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import type { AuthenticatedRequest } from '../../commons/types/authenticated-request.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (req.user.id !== +id && !req.user.is_admin) {
      throw new ForbiddenException();
    }
    return this.usersService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id && !req.user.is_admin) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esse usuario',
      );
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
