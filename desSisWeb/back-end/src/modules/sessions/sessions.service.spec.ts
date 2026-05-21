import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessaoLeitura } from './entities/sessao-leitura.entity';

const mockSession = {
  id: 1,
  userId: 1,
  bookId: 1,
  sessionType: 'timer' as const,
  startedAt: new Date(),
  status: 'active',
};

describe('SessionsService', () => {
  let service: SessionsService;
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
        SessionsService,
        {
          provide: getRepositoryToken(SessaoLeitura),
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

    service = module.get<SessionsService>(SessionsService);
    repository = module.get(getRepositoryToken(SessaoLeitura));
  });

  describe('create', () => {
    it('deve criar sessão com userId e startedAt', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01'));
      repository.save.mockResolvedValue(mockSession);

      const result = await service.create(1, { bookId: 1 } as any);

      expect(result).toEqual(mockSession);
      jest.useRealTimers();
    });
  });

  describe('findAllByUser', () => {
    it('deve retornar sessões do usuário ordenadas por startedAt DESC', async () => {
      repository.findAndCount.mockResolvedValue([[mockSession], 1]);

      const result = await service.findAllByUser(1);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        skip: 0,
        take: 10,
        order: { startedAt: 'DESC' },
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('deve retornar sessão quando encontrada', async () => {
      repository.findOne.mockResolvedValue(mockSession);

      const result = await service.findById(1);

      expect(result).toEqual(mockSession);
    });

    it('deve retornar null quando não encontrada', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar sessão', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...mockSession, status: 'completed' });

      const result = await service.update(1, { status: 'completed' } as any);

      expect(repository.update).toHaveBeenCalledWith(1, { status: 'completed' });
      expect(result?.status).toBe('completed');
    });
  });

  describe('remove', () => {
    it('deve remover sessão existente', async () => {
      repository.findOne.mockResolvedValue(mockSession);
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
