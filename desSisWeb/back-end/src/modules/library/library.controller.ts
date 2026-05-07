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
import { AdminGuard } from '../../guards/admin.guard';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  create(@Request() req: { user: { id: number } }, @Body() dto: CreateLibraryDto) {
    return this.libraryService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: { user: { id: number } }, @Query() pagination?: PaginationDto) {
    return this.libraryService.findAllByUser(req.user.id, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLibraryDto) {
    return this.libraryService.update(+id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryService.remove(+id);
  }
}
