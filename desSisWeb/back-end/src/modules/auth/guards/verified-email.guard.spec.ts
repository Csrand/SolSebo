import { Test, TestingModule } from '@nestjs/testing';
import { VerifiedEmailGuard } from './verified-email.guard';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

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
  verification_token: null,
  verification_token_expires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VerifiedEmailGuard', () => {
  let guard: VerifiedEmailGuard;
  let usersService: jest.Mocked<UsersService>;

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { sub: 1 },
      }),
    }),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifiedEmailGuard,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<VerifiedEmailGuard>(VerifiedEmailGuard);
    usersService = module.get(UsersService);
  });

  it('should allow access when user has verified email', async () => {
    usersService.findOne.mockResolvedValue({
      ...mockUser,
      status_validacao: true,
    });

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when email not verified', async () => {
    usersService.findOne.mockResolvedValue({
      ...mockUser,
      status_validacao: false,
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when user not found', async () => {
    usersService.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
