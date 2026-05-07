import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';
import { BibliotecaUsuario, StatusLeitura } from './entities/biblioteca-usuario.entity';

const mockEntry = {
  id: 1,
  userId: 1,
  bookId: 1,
  status: StatusLeitura.READING,
  currentPage: 50,
};

describe('LibraryService', () => {
  let service: LibraryService;
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
        LibraryService,
        {
          provide: getRepositoryToken(BibliotecaUsuario),
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

    service = module.get<LibraryService>(LibraryService);
    repository = module.get(getRepositoryToken(BibliotecaUsuario));
  });

  describe('create', () => {
    it('deve criar entrada com userId do token', async () => {
      repository.create.mockReturnValue(mockEntry);
      repository.save.mockResolvedValue(mockEntry);

      const result = await service.create(1, { bookId: 1 } as any);

      expect(repository.create).toHaveBeenCalledWith({ bookId: 1, userId: 1 });
      expect(repository.save).toHaveBeenCalled();
      expect(result.userId).toBe(1);
    });
  });

  describe('findAllByUser', () => {
    it('deve retornar entradas do usuário específico', async () => {
      repository.findAndCount.mockResolvedValue([[mockEntry], 1]);

      const result = await service.findAllByUser(1);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        skip: 0,
        take: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('deve retornar entrada quando encontrada', async () => {
      repository.findOne.mockResolvedValue(mockEntry);

      const result = await service.findById(1);

      expect(result).toEqual(mockEntry);
    });

    it('deve retornar null quando não encontrada', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar entrada', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...mockEntry, currentPage: 100 });

      const result = await service.update(1, { currentPage: 100 } as any);

      expect(repository.update).toHaveBeenCalledWith(1, { currentPage: 100 });
      expect(result?.currentPage).toBe(100);
    });
  });

  describe('remove', () => {
    it('deve remover entrada existente', async () => {
      repository.findOne.mockResolvedValue(mockEntry);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
