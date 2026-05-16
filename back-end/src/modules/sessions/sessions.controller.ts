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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PaginationDto } from '../../commons';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard, CheckOwnership } from '../../commons/guards';
import type { AuthenticatedRequest } from '../../commons/types/authenticated-request.type';

@Controller('sessions')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() pagination?: PaginationDto) {
    return this.sessionsService.findAllByUser(req.user.id, pagination);
  }

  @Get(':id')
  @CheckOwnership({
    serviceToken: 'SessionsService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Sessão de leitura',
  })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(+id);
  }

  @Patch(':id')
  @CheckOwnership({
    serviceToken: 'SessionsService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Sessão de leitura',
  })
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(+id, dto);
  }

  @Delete(':id')
  @CheckOwnership({
    serviceToken: 'SessionsService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Sessão de leitura',
  })
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(+id);
  }
}
