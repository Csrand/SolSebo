import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
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
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: { save: jest.fn() },
};

describe('ClubsService', () => {
  let service: ClubsService;
  let clubsRepository: jest.Mocked<{
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  }>;
  let membrosRepository: jest.Mocked<{
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
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
            findOne: jest.fn(),
            findAndCount: jest.fn(),
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
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
    clubsRepository = module.get(getRepositoryToken(Clube));
    membrosRepository = module.get(getRepositoryToken(ClubeMembro));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar clube e adicionar criador como owner', async () => {
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockClub);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockMember);

      const result = await service.create(1, { name: 'Clube do Livro' } as any);

      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockClub);
    });

    it('deve fazer rollback se segundo save falhar', async () => {
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockClub);
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.create(1, { name: 'Clube do Livro' } as any),
      ).rejects.toThrow('DB error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de clubes', async () => {
      clubsRepository.findAndCount.mockResolvedValue([[mockClub], 1]);
      const result = await service.findAll();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
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
    it('deve retornar lista de membros com relations', async () => {
      membrosRepository.find.mockResolvedValue([mockMember]);
      const result = await service.getMembros(1);
      expect(membrosRepository.find).toHaveBeenCalledWith({
        where: { clubeId: 1 },
        relations: ['user'],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('addMembro', () => {
    it('deve adicionar membro ao clube', async () => {
      clubsRepository.findOne.mockResolvedValue(mockClub);
      membrosRepository.findOne.mockResolvedValue(null);
      membrosRepository.create.mockReturnValue(mockMember);
      membrosRepository.save.mockResolvedValue(mockMember);

      const result = await service.addMembro(1, 2);
      expect(result.userId).toBe(1);
    });

    it('deve lançar ConflictException se já é membro', async () => {
      clubsRepository.findOne.mockResolvedValue(mockClub);
      membrosRepository.findOne.mockResolvedValue(mockMember);

      await expect(service.addMembro(1, 2)).rejects.toThrow(ConflictException);
    });

    it('deve lançar ForbiddenException se clube está inativo', async () => {
      clubsRepository.findOne.mockResolvedValue({
        ...mockClub,
        isActive: false,
      });

      await expect(service.addMembro(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMembro', () => {
    it('deve remover membro do clube', async () => {
      membrosRepository.findOne.mockResolvedValue(mockMember);
      clubsRepository.findOne.mockResolvedValue(mockClub);

      await service.removeMembro(1, 2);

      expect(membrosRepository.delete).toHaveBeenCalledWith({
        clubeId: 1,
        userId: 2,
      });
    });

    it('deve lançar NotFoundException se membro não está no clube', async () => {
      membrosRepository.findOne.mockResolvedValue(null);

      await expect(service.removeMembro(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se criador tentar sair', async () => {
      membrosRepository.findOne.mockResolvedValue({
        ...mockMember,
        userId: 1,
        cargo: 'owner',
      });
      clubsRepository.findOne.mockResolvedValue(mockClub);

      await expect(service.removeMembro(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se clube não existe', async () => {
      membrosRepository.findOne.mockResolvedValue(mockMember);
      clubsRepository.findOne.mockResolvedValue(null);

      await expect(service.removeMembro(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar clube', async () => {
      const updatedClub = { ...mockClub, name: 'Novo Nome' };
      clubsRepository.findOne.mockResolvedValue(mockClub);
      clubsRepository.save.mockResolvedValue(updatedClub);

      const result = await service.update(1, { name: 'Novo Nome' } as any);
      expect(result?.name).toBe('Novo Nome');
    });
  });

  describe('remove', () => {
    it('deve remover clube e seus membros', async () => {
      clubsRepository.findOne.mockResolvedValue(mockClub);
      clubsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);
      expect(clubsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se clube não existe', async () => {
      clubsRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
