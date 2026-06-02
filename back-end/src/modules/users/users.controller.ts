import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../commons';
import { LocalAuthGuard } from '../auth/guards/local.auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @UseGuards(LocalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @UseGuards(LocalAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
