import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  senha_hash: '$2b$10$fakehash',
  status_validacao: true,
  is_active: true,
  refresh_token: null,
  recovery_token: null,
  token_expires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsers: User[] = [
  { ...mockUser, id: 1 },
  { ...mockUser, id: 2, username: 'user2', email: 'user2@test.com' },
];

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const dto: CreateUserDto = {
        username: 'newuser',
        email: 'new@test.com',
        senha_hash: 'hashed',
      };

      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated response with custom pagination', async () => {
      const pagination = { limit: 5, offset: 10 };
      repository.findAndCount.mockResolvedValue([mockUsers, 50]);

      const result = await service.findAll(pagination);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(50);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.offset).toBe(10);
      expect(result.links.self).toContain('limit=5&offset=10');
      expect(result.links.next).toContain('limit=5&offset=15');
      expect(result.links.prev).toContain('limit=5&offset=5');
    });

    it('should use default pagination when not provided', async () => {
      repository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result.meta.limit).toBe(10);
      expect(result.meta.offset).toBe(0);
    });

    it('should return correct links when no next page exists', async () => {
      repository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result.links.next).toBeNull();
      expect(result.links.last).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByIdentifier', () => {
    it('should find user by username or email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByIdentifier('testuser');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: [{ username: 'testuser' }, { email: 'testuser' }],
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateDto = { firstName: 'Updated' };
      repository.update.mockResolvedValue(undefined);
      repository.findOne.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result?.firstName).toBe('Updated');
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      await service.updateRefreshToken(1, 'new-token-hash');

      expect(repository.update).toHaveBeenCalledWith(1, {
        refresh_token: 'new-token-hash',
      });
    });

    it('should clear refresh token when null', async () => {
      await service.updateRefreshToken(1, null);

      expect(repository.update).toHaveBeenCalledWith(1, {
        refresh_token: undefined,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      repository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
