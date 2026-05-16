import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto, paginate, PaginatedResponse } from '../../commons';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    if (dto.isbn) {
      const existing = await this.booksRepository.findOne({
        where: { isbn: dto.isbn },
      });
      if (existing) throw new ConflictException('ISBN já cadastrado');
    }
    const book = this.booksRepository.create(dto);
    return this.booksRepository.save(book);
  }

  async findAll(
    pagination?: PaginationDto,
    search?: string,
  ): Promise<PaginatedResponse<Book>> {
    const where = search
      ? [{ title: ILike(`%${search}%`) }, { author: ILike(`%${search}%`) }]
      : undefined;
    return paginate(
      this.booksRepository,
      pagination,
      '/books',
      where ? { where } : {},
    );
  }

  async findById(id: number): Promise<Book | null> {
    return this.booksRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book | null> {
    if (dto.isbn) {
      const existing = await this.booksRepository.findOne({
        where: { isbn: dto.isbn },
      });
      if (existing && existing.id !== id)
        throw new ConflictException('ISBN já cadastrado em outro livro');
    }
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) return null;
    Object.assign(book, dto);
    return this.booksRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findById(id);
    if (!book) throw new NotFoundException('Livro não encontrado');
    await this.booksRepository.delete(id);
  }
}
