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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard, CheckOwnership } from '../../commons/guards';
import type { AuthenticatedRequest } from '../../commons/types/authenticated-request.type';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateClubDto) {
    return this.clubsService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Query() pagination?: PaginationDto,
    @Query('search') search?: string,
  ) {
    return this.clubsService.findAll(pagination, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/membros')
  getMembros(@Param('id') id: string) {
    return this.clubsService.getMembros(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/membros')
  addMembro(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.clubsService.addMembro(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/membros')
  async removeMembro(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.clubsService.removeMembro(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Patch(':id')
  @CheckOwnership({
    serviceToken: 'ClubsService',
    serviceMethod: 'findById',
    ownerField: 'creatorId',
    entityName: 'Clube',
  })
  update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubsService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Delete(':id')
  @CheckOwnership({
    serviceToken: 'ClubsService',
    serviceMethod: 'findById',
    ownerField: 'creatorId',
    entityName: 'Clube',
  })
  remove(@Param('id') id: string) {
    return this.clubsService.remove(+id);
  }
}
