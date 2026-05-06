import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');

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
  verifyEmail: jest.fn(),
  setRecoveryToken: jest.fn(),
  resetPassword: jest.fn(),
};

const mockTokenResponse = {
  accessToken: 'fake-jwt-token',
  refreshToken: '$2b$10$fake-refresh-hash',
  expiresIn: 3600,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mailService: jest.Mocked<MailService>;

  const mockUsersService = {
    findByIdentifier: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateRefreshToken: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, unknown> = {
        JWT_SECRET: 'test-secret',
        JWT_TOKEN_AUDIENCE: 'test-audience',
        JWT_TOKEN_ISSUER: 'test-issuer',
        JWT_TTL: 3600,
        JWT_REFRESH_TTL: 86400,
      };
      return config[key];
    }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendRecoveryEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    mailService = module.get(MailService);

    jwtService.signAsync.mockImplementation(async () => {
      return 'fake-jwt-token';
    });

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$2b$10$fake-refresh-hash');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      identifier: 'testuser',
      password: 'password123',
    };

    beforeEach(() => {
      bcrypt.compare.mockResolvedValue(true);
      usersService.findByIdentifier.mockResolvedValue(mockUser);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
      bcrypt.hash.mockResolvedValue('$2b$10$fake-refresh-hash');
      jwtService.signAsync.mockImplementation(async () => 'fake-jwt-token');
    });

    it('should login successfully with valid credentials', async () => {
      const result = await service.login(loginDto);

      expect(usersService.findByIdentifier).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
        refreshToken: 'fake-jwt-token', // raw token, not hash
        expiresIn: 3600,
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        1,
        '$2b$10$fake-refresh-hash', // hash stored
      );
    });

    it('should throw UnauthorizedException with "User not found" when user not found', async () => {
      usersService.findByIdentifier.mockResolvedValue(null);

      try {
        await service.login(loginDto);
      } catch (e) {
        expect(e.response.message).toBe('Usuário não encontrado');
      }
    });

    it('should throw UnauthorizedException with "Wrong password" when password is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false);
      usersService.findByIdentifier.mockResolvedValue(mockUser);

      try {
        await service.login(loginDto);
      } catch (e) {
        expect(e.response.message).toBe('Senha incorreta');
      }
    });

    it('should throw UnauthorizedException when account is deactivated', async () => {
      bcrypt.compare.mockResolvedValue(true);
      usersService.findByIdentifier.mockResolvedValue({
        ...mockUser,
        is_active: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      bcrypt.hash.mockResolvedValue('$2b$10$hashed-password');
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
    });

    it('should register successfully with valid data', async () => {
      const result = await service.register(registerDto);

      expect(usersService.findByUsername).toHaveBeenCalledWith('newuser');
      expect(usersService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should NOT return JWT tokens (no auto-login)', async () => {
      const result = await service.register(registerDto);

      expect(result).toBeUndefined();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should generate verification token and send verification email', async () => {
      const result = await service.register(registerDto);

      expect(result).toBeUndefined();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          senha_hash: '$2b$10$hashed-password',
          status_validacao: false,
        }),
      );
    });

    it('should throw BadRequestException when username already exists', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const userWithToken = {
        ...mockUser,
        verification_token: 'valid-token',
        verification_token_expires: new Date(Date.now() + 3600000),
        status_validacao: false,
        verifyEmail: jest.fn(function(this: any) {
          this.status_validacao = true;
          this.verification_token = null;
          this.verification_token_expires = null;
        }),
      };
      mockUsersService.findOne.mockResolvedValue(userWithToken);
      mockUsersService.update.mockResolvedValue(undefined);

      const result = await service.verifyEmail('valid-token');

      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ verification_token: 'valid-token' }),
      );
      expect(userWithToken.verifyEmail).toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userWithToken.id,
        expect.objectContaining({
          status_validacao: true,
          verification_token: null,
          verification_token_expires: null,
        }),
      );
      expect(result).toEqual({ message: 'E-mail verificado com sucesso' });
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        verification_token: 'hashed-token',
        verification_token_expires: new Date(Date.now() - 3600000), // expired
      };
      mockUsersService.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should generate recovery token and send recovery email', async () => {
      const user = {
        ...mockUser,
        recovery_token: null,
        token_expires: null,
        setRecoveryToken: jest.fn(function(this: any, token: string, expires: Date) {
          this.recovery_token = token;
          this.token_expires = expires;
        }),
      };
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.update.mockResolvedValue(undefined);

      await service.forgotPassword('test@example.com');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(user.setRecoveryToken).toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          recovery_token: expect.any(String),
          token_expires: expect.any(Date),
        }),
      );
      expect(mockMailService.sendRecoveryEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      );
    });

    it('should NOT throw error when email not found (security)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('unknown@test.com')).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const userWithToken = {
        ...mockUser,
        recovery_token: 'valid-token',
        token_expires: new Date(Date.now() + 3600000),
        resetPassword: jest.fn(function(this: any, newHash: string) {
          this.senha_hash = newHash;
          this.recovery_token = null;
          this.token_expires = null;
        }),
      };
      mockUsersService.findOne.mockResolvedValue(userWithToken);
      mockUsersService.update.mockResolvedValue(undefined);
      bcrypt.hash.mockResolvedValue('$2b$10$new-hashed-password');

      const result = await service.resetPassword('valid-token', 'NewPass123');

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
      expect(userWithToken.resetPassword).toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userWithToken.id,
        expect.objectContaining({
          senha_hash: expect.any(String),
          recovery_token: null,
          token_expires: null,
        }),
      );
      expect(result).toEqual({ message: 'Senha redefinida com sucesso' });
    });

    it('should throw BadRequestException with invalid token', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'NewPass123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        recovery_token: 'hashed-token',
        token_expires: new Date(Date.now() - 3600000), // expired
      };
      mockUsersService.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(
        service.resetPassword('expired-token', 'NewPass123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh token successfully', async () => {
      jwtService.verify.mockReturnValue({
        sub: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      usersService.findOne.mockResolvedValue({
        ...mockUser,
        refresh_token: '$2b$10$stored-hash',
      });
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshToken(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalled();
      expect(result.accessToken).toEqual('fake-jwt-token');
      expect(result.expiresIn).toBe(3600);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false);
      jwtService.verify.mockReturnValue({
        sub: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      usersService.findOne.mockResolvedValue(mockUser);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when jwt verify fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      await service.logout(1);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        1,
        null,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      bcrypt.compare.mockResolvedValue(true);
      usersService.findByIdentifier.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      usersService.findByIdentifier.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false);
      usersService.findByIdentifier.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'wrong');

      expect(result).toBeNull();
    });
  });
});
