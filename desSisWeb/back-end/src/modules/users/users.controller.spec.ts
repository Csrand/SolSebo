import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockUser = {
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

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    findByIdentifier: jest.fn(),
    update: jest.fn(),
    updateRefreshToken: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct dto', async () => {
      const dto: CreateUserDto = {
        username: 'newuser',
        email: 'new@test.com',
        senha_hash: 'hashed',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with default pagination', async () => {
      const mockResponse = {
        data: [mockUser],
        links: { self: '/users', first: '/users', next: null, prev: null, last: null },
        meta: { total: 1, limit: 10, offset: 0 },
      };
      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call service.findAll with custom pagination', async () => {
      const mockResponse = {
        data: [mockUser],
        links: { self: '/users', first: '/users', next: null, prev: null, last: null },
        meta: { total: 1, limit: 5, offset: 10 },
      };
      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ limit: 5, offset: 10 });

      expect(mockUsersService.findAll).toHaveBeenCalledWith({ limit: 5, offset: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with parsed id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call service.update with correct id and dto', async () => {
      const updateDto = { firstName: 'Updated' };
      mockUsersService.update.mockResolvedValue({ ...mockUser, firstName: 'Updated' });

      const result = await controller.update('1', updateDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ ...mockUser, firstName: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should call service.remove with parsed id', async () => {
      await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
