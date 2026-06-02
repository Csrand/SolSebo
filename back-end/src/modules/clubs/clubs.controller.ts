import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { PaginationDto } from '../../commons';
import { LocalAuthGuard } from '../auth/guards/local.auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  create(@Request() req: { user: { id: number } }, @Body() dto: CreateClubDto) {
    return this.clubsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() pagination?: PaginationDto) {
    return this.clubsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findById(+id);
  }

  @UseGuards(LocalAuthGuard)
  @Get(':id/membros')
  getMembros(@Param('id') id: string) {
    return this.clubsService.getMembros(+id);
  }

  @UseGuards(LocalAuthGuard)
  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Request() req: { user: { id: number } }) {
    return this.clubsService.addMembro(+id, req.user.id);
  }

  @UseGuards(LocalAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubsService.update(+id, dto);
  }

  @UseGuards(LocalAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubsService.remove(+id);
  }
}
