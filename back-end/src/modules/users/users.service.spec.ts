import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  senha_hash: 'hashed',
  status_validacao: true,
  is_active: true,
  is_admin: false,
};

describe('UsersService', () => {
  let service: UsersService;
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
        UsersService,
        {
          provide: getRepositoryToken(User),
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

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não encontrado', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('deve remover usuário existente', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se usuário não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
