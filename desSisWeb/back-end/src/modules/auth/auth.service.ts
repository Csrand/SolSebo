import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { User } from '../users/entities/user.entity';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByIdentifier(loginDto.identifier);
    if (!user) {
      this.logger.warn(`Login failed: user not found - identifier: ${loginDto.identifier}`);
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.senha_hash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: wrong password - user: ${user.username}`);
      throw new UnauthorizedException('Senha incorreta');
    }

    if (!user.is_active) {
      this.logger.warn(`Login failed: account deactivated - user: ${user.username}`);
      throw new UnauthorizedException('Conta desativada');
    }

    if (!user.status_validacao) {
      this.logger.warn(`Login failed: email not verified - user: ${user.username}`);
      throw new UnauthorizedException('E-mail não verificado');
    }

    this.logger.log(`User logged in: ${user.username}`);

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtAudience = this.configService.get<string>('JWT_TOKEN_AUDIENCE');
    const jwtIssuer = this.configService.get<string>('JWT_TOKEN_ISSUER');
    const jwtTtl = this.configService.get<number>('JWT_TTL');
    const jwtRefreshTtl = this.configService.get<number>('JWT_REFRESH_TTL');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        audience: jwtAudience,
        issuer: jwtIssuer,
        expiresIn: jwtTtl,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        audience: jwtAudience,
        issuer: jwtIssuer,
        expiresIn: jwtRefreshTtl,
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken, // Return raw token, not hash
      expiresIn: Number(jwtTtl),
    };
  }

  async register(registerDto: RegisterDto): Promise<void> {
    const existingUserByUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUserByUsername) {
      this.logger.warn(`Registration failed: username already exists - ${registerDto.username}`);
      throw new BadRequestException('Username already exists');
    }

    const existingUserByEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingUserByEmail) {
      this.logger.warn(`Registration failed: email already exists - ${registerDto.email}`);
      throw new BadRequestException('Email already exists');
    }

    this.logger.log(`Registering new user: ${registerDto.username}`);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = await bcrypt.hash(
      `${Date.now()}-${registerDto.email}-verification`,
      10,
    );

    const user = await this.usersService.create({
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      senha_hash: hashedPassword,
      status_validacao: false,
      is_active: true,
      verification_token: verificationToken,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    this.logger.log(`Verification email sent to: ${user.email}`);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne({
      verification_token: token,
    });

    if (!user) {
      this.logger.warn(`Email verification failed: invalid token`);
      throw new BadRequestException('Invalid or expired token');
    }

    if (
      user.verification_token_expires &&
      user.verification_token_expires < new Date()
    ) {
      this.logger.warn(`Email verification failed: expired token - user: ${user.username}`);
      throw new BadRequestException('Invalid or expired token');
    }

    user.verifyEmail();
    await this.usersService.update(user.id, {
      status_validacao: user.status_validacao,
      verification_token: user.verification_token,
      verification_token_expires: user.verification_token_expires,
    });

    this.logger.log(`Email verified for user: ${user.username}`);
    return { message: 'E-mail verificado com sucesso' };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.logger.log(`Password recovery requested for non-existent email: ${email}`);
      return; // Security: do not reveal if email exists
    }

    this.logger.log(`Password recovery requested for user: ${user.username}`);

    const recoveryToken = await bcrypt.hash(
      `${Date.now()}-${email}-recovery`,
      10,
    );

    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

    user.setRecoveryToken(recoveryToken, expires);
    await this.usersService.update(user.id, {
      recovery_token: user.recovery_token,
      token_expires: user.token_expires,
    });

    await this.mailService.sendRecoveryEmail(email, recoveryToken);
    this.logger.log(`Recovery email sent to: ${email}`);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne({
      recovery_token: token,
    });

    if (!user) {
      this.logger.warn(`Password reset failed: invalid token`);
      throw new BadRequestException('Invalid or expired token');
    }

    if (user.token_expires && user.token_expires < new Date()) {
      this.logger.warn(`Password reset failed: expired token - user: ${user.username}`);
      throw new BadRequestException('Invalid or expired token');
    }

    this.logger.log(`Password reset for user: ${user.username}`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.resetPassword(hashedPassword);
    await this.usersService.update(user.id, {
      senha_hash: user.senha_hash,
      recovery_token: user.recovery_token,
      token_expires: user.token_expires,
    });

    this.logger.log(`Password successfully reset for user: ${user.username}`);
    return { message: 'Senha redefinida com sucesso' };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const payload: JwtPayload = this.jwtService.verify(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);
      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refresh_token,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtAudience = this.configService.get<string>('JWT_TOKEN_AUDIENCE');
      const jwtIssuer = this.configService.get<string>('JWT_TOKEN_ISSUER');
      const jwtTtl = this.configService.get<number>('JWT_TTL');
      const jwtRefreshTtl = this.configService.get<number>('JWT_REFRESH_TTL');

      const tokenPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(tokenPayload, {
          secret: jwtSecret,
          audience: jwtAudience,
          issuer: jwtIssuer,
          expiresIn: jwtTtl,
        }),
        this.jwtService.signAsync(tokenPayload, {
          secret: jwtSecret,
          audience: jwtAudience,
          issuer: jwtIssuer,
          expiresIn: jwtRefreshTtl,
        }),
      ]);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

      return {
        accessToken,
        refreshToken, // Return raw token, not hash
        expiresIn: Number(jwtTtl),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
