import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

const mockBook = {
  id: 1,
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  isbn: '978-85-01-00000-0',
  pageCount: 256,
};

describe('BooksService', () => {
  let service: BooksService;
  let repository: jest.Mocked<{
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get(getRepositoryToken(Book));
  });

  describe('create', () => {
    it('deve criar e retornar um livro', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockBook);
      repository.save.mockResolvedValue(mockBook);

      const dto = { title: 'Dom Casmurro', author: 'Machado de Assis' };
      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Dom Casmurro');
    });

    it('deve lançar ConflictException quando ISBN já existe', async () => {
      repository.findOne.mockResolvedValue(mockBook);

      const dto = {
        title: 'Outro Livro',
        author: 'Outro Autor',
        isbn: '978-85-01-00000-0',
      };
      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada', async () => {
      repository.findAndCount.mockResolvedValue([[mockBook], 1]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.links.self).toContain('/books');
    });

    it('deve aceitar parâmetro de busca', async () => {
      repository.findAndCount.mockResolvedValue([[mockBook], 1]);

      await service.findAll(undefined, 'Machado');

      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deve retornar livro quando encontrado', async () => {
      repository.findOne.mockResolvedValue(mockBook);
      const result = await service.findById(1);
      expect(result).toEqual(mockBook);
    });

    it('deve retornar null quando não encontrado', async () => {
      repository.findOne.mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o livro', async () => {
      const updatedBook = { ...mockBook, title: 'Memórias Póstumas' };
      repository.findOne.mockResolvedValue(mockBook);
      repository.save.mockResolvedValue(updatedBook);

      const result = await service.update(1, {
        title: 'Memórias Póstumas',
      } as any);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Memórias Póstumas' }),
      );
      expect(result?.title).toBe('Memórias Póstumas');
    });

    it('deve lançar ConflictException se ISBN já existe em outro livro', async () => {
      repository.findOne.mockResolvedValue({ ...mockBook, id: 2 });

      await expect(
        service.update(1, { isbn: '978-85-01-00000-0' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('deve remover livro existente', async () => {
      repository.findOne.mockResolvedValue(mockBook);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se livro não existe', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
