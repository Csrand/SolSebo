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
import { LibraryService } from './library.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { PaginationDto } from '../../commons';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard, CheckOwnership } from '../../commons/guards';
import type { AuthenticatedRequest } from '../../commons/types/authenticated-request.type';

@Controller('library')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateLibraryDto) {
    return this.libraryService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest, @Query() pagination?: PaginationDto) {
    return this.libraryService.findAllByUser(req.user.id, pagination);
  }

  @Get(':id')
  @CheckOwnership({
    serviceToken: 'LibraryService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Entrada na biblioteca',
  })
  findOne(@Param('id') id: string) {
    return this.libraryService.findById(+id);
  }

  @Patch(':id')
  @CheckOwnership({
    serviceToken: 'LibraryService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Entrada na biblioteca',
  })
  update(@Param('id') id: string, @Body() dto: UpdateLibraryDto) {
    return this.libraryService.update(+id, dto);
  }

  @Delete(':id')
  @CheckOwnership({
    serviceToken: 'LibraryService',
    serviceMethod: 'findById',
    ownerField: 'userId',
    entityName: 'Entrada na biblioteca',
  })
  remove(@Param('id') id: string) {
    return this.libraryService.remove(+id);
  }
}
