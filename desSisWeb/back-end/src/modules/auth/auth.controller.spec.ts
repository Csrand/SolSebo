import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const mockTokenResponse = {
  accessToken: 'fake-jwt-token',
  refreshToken: 'fake-refresh-token-raw',
  expiresIn: 3600,
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call service.login with correct dto', async () => {
      const loginDto: LoginDto = {
        identifier: 'testuser',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(mockTokenResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('register', () => {
    it('should call service.register with correct dto and return void', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'password123',
      };
      mockAuthService.register.mockResolvedValue(undefined);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBeUndefined();
    });
  });

  describe('verifyEmail', () => {
    it('should call service.verifyEmail with token', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({
        message: 'E-mail verificado com sucesso',
      });

      const result = await controller.verifyEmail('valid-token');

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({ message: 'E-mail verificado com sucesso' });
    });
  });

  describe('forgotPassword', () => {
    it('should call service.forgotPassword with email and return void', async () => {
      const forgotDto: ForgotPasswordDto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(forgotDto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should call service.resetPassword with token and new password', async () => {
      const resetDto: ResetPasswordDto = {
        token: 'valid-token',
        newPassword: 'NewPass123',
      };
      mockAuthService.resetPassword.mockResolvedValue({
        message: 'Senha redefinida com sucesso',
      });

      const result = await controller.resetPassword(resetDto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'valid-token',
        'NewPass123',
      );
      expect(result).toEqual({ message: 'Senha redefinida com sucesso' });
    });
  });

  describe('refreshToken', () => {
    it('should call service.refreshToken with correct dto', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
      mockAuthService.refreshToken.mockResolvedValue(mockTokenResponse);

      const result = await controller.refreshToken(refreshDto);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('logout', () => {
    it('should call service.logout with user id from request', async () => {
      const req = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const req = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      const result = controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
});
