import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from '../../commons';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Books)
    private readonly booksRepository: Repository<Books>,
  ) {}

  async create(dto: CreateBookDto): Promise<Books> {
    const book = this.booksRepository.create(dto);
    return this.booksRepository.save(book);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<Books>> {
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;
    const [data, total] = await this.booksRepository.findAndCount({ skip: offset, take: limit });
    return createPaginatedResponse(data, total, limit, offset, '/books');
  }

  async findById(id: number): Promise<Books | null> {
    return this.booksRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateBookDto): Promise<Books | null> {
    await this.booksRepository.update(id, dto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findById(id);
    if (!book) throw new NotFoundException('Livro não encontrado');
    await this.booksRepository.delete(id);
  }
}
