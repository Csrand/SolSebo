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
import { LocalAuthGuard } from '../auth/guards/local.auth.guard';

@Controller('sessions')
@UseGuards(LocalAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { id: number } },
    @Query() pagination?: PaginationDto,
  ) {
    return this.sessionsService.findAllByUser(req.user.id, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(+id, dto);
  }

  @UseGuards(LocalAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(+id);
  }
}
