import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibliotecaUsuario } from './entities/biblioteca-usuario.entity';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from '../../commons';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(BibliotecaUsuario)
    private readonly libraryRepository: Repository<BibliotecaUsuario>,
  ) {}

  async create(userId: number, dto: CreateLibraryDto): Promise<BibliotecaUsuario> {
    const entry = this.libraryRepository.create({ ...dto, userId });
    return this.libraryRepository.save(entry);
  }

  async findAllByUser(userId: number, pagination?: PaginationDto): Promise<PaginatedResponse<BibliotecaUsuario>> {
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;
    const [data, total] = await this.libraryRepository.findAndCount({
      where: { userId },
      skip: offset,
      take: limit,
    });
    return createPaginatedResponse(data, total, limit, offset, '/library');
  }

  async findById(id: number): Promise<BibliotecaUsuario | null> {
    return this.libraryRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateLibraryDto): Promise<BibliotecaUsuario | null> {
    await this.libraryRepository.update(id, dto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const entry = await this.findById(id);
    if (!entry) throw new NotFoundException('Entrada não encontrada na biblioteca');
    await this.libraryRepository.delete(id);
  }
}
