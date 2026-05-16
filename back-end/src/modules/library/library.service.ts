import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibliotecaUsuario } from './entities/biblioteca-usuario.entity';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { PaginationDto, paginate, PaginatedResponse } from '../../commons';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(BibliotecaUsuario)
    private readonly libraryRepository: Repository<BibliotecaUsuario>,
  ) {}

  async create(
    userId: number,
    dto: CreateLibraryDto,
  ): Promise<BibliotecaUsuario> {
    const existing = await this.libraryRepository.findOne({
      where: { userId, bookId: dto.bookId },
    });
    if (existing) {
      throw new ConflictException('Livro já está na sua biblioteca');
    }
    const entry = this.libraryRepository.create({ ...dto, userId });
    return this.libraryRepository.save(entry);
  }

  async findAllByUser(
    userId: number,
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<BibliotecaUsuario>> {
    return paginate(this.libraryRepository, pagination, '/library', {
      where: { userId },
    });
  }

  async findById(id: number): Promise<BibliotecaUsuario | null> {
    return this.libraryRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    dto: UpdateLibraryDto,
  ): Promise<BibliotecaUsuario | null> {
    const entry = await this.findById(id);
    if (!entry) return null;
    Object.assign(entry, dto);
    return this.libraryRepository.save(entry);
  }

  async remove(id: number): Promise<void> {
    const entry = await this.findById(id);
    if (!entry)
      throw new NotFoundException('Entrada não encontrada na biblioteca');
    await this.libraryRepository.delete(id);
  }
}
