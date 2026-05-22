import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { Clube } from './entities/clube.entity';
import { ClubeMembro } from './entities/clube-membro.entity';

const mockClub = {
  id: 1,
  name: 'Clube do Livro',
  description: 'Clube de leitura',
  creatorId: 1,
  isActive: true,
};

const mockMember = {
  id: 1,
  clubeId: 1,
  userId: 1,
  cargo: 'owner',
  joinedAt: new Date(),
};

describe('ClubsService', () => {
  let service: ClubsService;
  let clubsRepository: jest.Mocked<{
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  }>;
  let membrosRepository: jest.Mocked<{
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsService,
        {
          provide: getRepositoryToken(Clube),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClubeMembro),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
    clubsRepository = module.get(getRepositoryToken(Clube));
    membrosRepository = module.get(getRepositoryToken(ClubeMembro));
  });

  describe('create', () => {
    it('deve criar clube e adicionar criador como owner', async () => {
      clubsRepository.create.mockReturnValue(mockClub);
      clubsRepository.save.mockResolvedValue(mockClub);
      membrosRepository.save.mockResolvedValue(mockMember);

      const result = await service.create(1, { name: 'Clube do Livro' } as any);

      expect(clubsRepository.create).toHaveBeenCalledWith({ name: 'Clube do Livro', creatorId: 1 });
      expect(clubsRepository.save).toHaveBeenCalled();
      expect(membrosRepository.save).toHaveBeenCalledWith({
        clubeId: 1,
        userId: 1,
        cargo: 'owner',
      });
      expect(result.name).toBe('Clube do Livro');
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de clubes', async () => {
      clubsRepository.findAndCount.mockResolvedValue([[mockClub], 1]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.links.self).toContain('/clubs');
    });
  });

  describe('findById', () => {
    it('deve retornar clube quando encontrado', async () => {
      clubsRepository.findOne.mockResolvedValue(mockClub);

      const result = await service.findById(1);

      expect(result).toEqual(mockClub);
    });

    it('deve retornar null quando não encontrado', async () => {
      clubsRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('getMembros', () => {
    it('deve retornar lista de membros do clube', async () => {
      membrosRepository.find.mockResolvedValue([mockMember]);

      const result = await service.getMembros(1);

      expect(membrosRepository.find).toHaveBeenCalledWith({ where: { clubeId: 1 } });
      expect(result).toHaveLength(1);
      expect(result[0].cargo).toBe('owner');
    });
  });

  describe('addMembro', () => {
    it('deve adicionar membro ao clube', async () => {
      membrosRepository.create.mockReturnValue(mockMember);
      membrosRepository.save.mockResolvedValue(mockMember);

      const result = await service.addMembro(1, 2);

      expect(membrosRepository.create).toHaveBeenCalledWith({ clubeId: 1, userId: 2 });
      expect(membrosRepository.save).toHaveBeenCalled();
      expect(result.userId).toBe(1);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar clube', async () => {
      clubsRepository.update.mockResolvedValue({ affected: 1 } as any);
      clubsRepository.findOne.mockResolvedValue({ ...mockClub, name: 'Novo Nome' });

      const result = await service.update(1, { name: 'Novo Nome' } as any);

      expect(clubsRepository.update).toHaveBeenCalledWith(1, { name: 'Novo Nome' });
      expect(result?.name).toBe('Novo Nome');
    });
  });

  describe('remove', () => {
    it('deve remover clube e seus membros', async () => {
      clubsRepository.findOne.mockResolvedValue(mockClub);
      membrosRepository.delete.mockResolvedValue({ affected: 1 } as any);
      clubsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(membrosRepository.delete).toHaveBeenCalledWith({ clubeId: 1 });
      expect(clubsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se clube não existe', async () => {
      clubsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
