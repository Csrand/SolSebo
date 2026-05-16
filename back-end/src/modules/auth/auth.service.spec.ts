import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-value'),
  compare: jest.fn(),
}));

const mockUser = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  username: 'testuser',
  email: 'test@test.com',
  senha_hash: 'hashed',
  status_validacao: true,
  is_active: true,
  is_admin: false,
  verification_token: null,
  verification_token_expires: null,
  recovery_token: null,
  token_expires: null,
  refresh_token: null,
  refresh_token_expires: null,
  verifyEmail: jest.fn(() => {
    mockUser.status_validacao = true;
    mockUser.verification_token = null;
    mockUser.verification_token_expires = null;
  }),
  setRecoveryToken: jest.fn((token: string, expires: Date) => {
    mockUser.recovery_token = token;
    mockUser.token_expires = expires;
  }),
  resetPassword: jest.fn((hash: string) => {
    mockUser.senha_hash = hash;
    mockUser.recovery_token = null;
    mockUser.token_expires = null;
  }),
  setRefreshToken: jest.fn((token: string, expires: Date) => {
    mockUser.refresh_token = token;
    mockUser.refresh_token_expires = expires;
  }),
  clearRefreshToken: jest.fn(() => {
    mockUser.refresh_token = null;
    mockUser.refresh_token_expires = null;
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            findByIdentifier: jest.fn(),
            findByVerificationToken: jest.fn(),
            findByRecoveryToken: jest.fn(),
            findByRefreshToken: jest.fn(),
            create: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue?: number) => {
                if (key === 'JWT_REFRESH_TTL') return 604800;
                if (key === 'JWT_TTL') return 28800;
                return defaultValue;
              }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendRecoveryEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe('register', () => {
    it('deve criar usuário e enviar email de verificação', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);

      const dto = {
        username: 'newuser',
        email: 'new@test.com',
        password: '123456',
        confirmPassword: '123456',
      };
      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'new@test.com',
        expect.any(String),
      );
      expect(result.message).toContain('Verifique seu email');
    });

    it('deve rejeitar username duplicado', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);

      const dto = {
        username: 'testuser',
        email: 'other@test.com',
        password: '123456',
        confirmPassword: '123456',
      };
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('deve ativar a conta com token válido', async () => {
      const user = {
        ...mockUser,
        verification_token_expires: new Date(Date.now() + 3600000),
      };
      usersService.findByVerificationToken.mockResolvedValue(user);

      const result = await service.verifyEmail({ token: 'valid-token' });
      expect(user.verifyEmail).toHaveBeenCalled();
      expect(result.message).toContain('verificado');
    });

    it('deve rejeitar token inválido', async () => {
      usersService.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail({ token: 'invalid' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('deve retornar token com credenciais corretas', async () => {
      usersService.findByIdentifier.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result.accessToken).toBe('jwt-token');
    });

    it('deve rejeitar senha errada', async () => {
      usersService.findByIdentifier.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve rejeitar email não verificado', async () => {
      const unverified = { ...mockUser, status_validacao: false };
      usersService.findByIdentifier.mockResolvedValue(unverified);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email se usuário existe', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.forgotPassword({ email: 'test@test.com' });

      expect(mailService.sendRecoveryEmail).toHaveBeenCalled();
      expect(result.message).toContain('recuperação');
    });

    it('não deve revelar se email não existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nonexistent@test.com',
      });

      expect(mailService.sendRecoveryEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('recuperação');
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com token válido', async () => {
      const user = {
        ...mockUser,
        token_expires: new Date(Date.now() + 3600000),
      };
      usersService.findByRecoveryToken.mockResolvedValue(user);

      const result = await service.resetPassword({
        token: 'valid',
        newPassword: '654321',
        confirmNewPassword: '654321',
      });

      expect(user.resetPassword).toHaveBeenCalled();
      expect(result.message).toContain('redefinida');
    });

    it('deve rejeitar token inválido', async () => {
      usersService.findByRecoveryToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'invalid',
          newPassword: '654321',
          confirmNewPassword: '654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
