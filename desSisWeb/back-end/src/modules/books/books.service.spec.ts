import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Books } from './entities/book.entity';

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
          provide: getRepositoryToken(Books),
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
    repository = module.get(getRepositoryToken(Books));
  });

  describe('create', () => {
    it('deve criar e retornar um livro', async () => {
      repository.create.mockReturnValue(mockBook);
      repository.save.mockResolvedValue(mockBook);

      const dto = { title: 'Dom Casmurro', author: 'Machado de Assis' };
      const result = await service.create(dto as any);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Dom Casmurro');
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
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...mockBook, title: 'Memórias Póstumas' });

      const result = await service.update(1, { title: 'Memórias Póstumas' } as any);

      expect(repository.update).toHaveBeenCalledWith(1, { title: 'Memórias Póstumas' });
      expect(result?.title).toBe('Memórias Póstumas');
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
