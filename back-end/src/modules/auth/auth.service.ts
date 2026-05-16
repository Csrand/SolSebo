import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new BadRequestException('Username já está em uso');
    }

    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException('Email já está cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await this.usersService.create({
      username: dto.username,
      email: dto.email,
      senha_hash: hashedPassword,
      status_validacao: false,
      is_active: true,
      verification_token: verificationToken,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await this.mailService.sendVerificationEmail(dto.email, verificationToken);

    return {
      message: 'Cadastro realizado! Verifique seu email para ativar sua conta.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(dto.token);
    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (
      user.verification_token_expires &&
      user.verification_token_expires < new Date()
    ) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    user.verifyEmail();
    await this.usersService.save(user);

    return { message: 'Email verificado com sucesso!' };
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByIdentifier(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.senha_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.is_active || !user.status_validacao) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTtl = this.configService.get<number>(
      'JWT_REFRESH_TTL',
      604800,
    );

    user.setRefreshToken(
      refreshToken,
      new Date(Date.now() + refreshTtl * 1000),
    );
    await this.usersService.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('JWT_TTL', 28800),
    };
  }

  async refresh(dto: RefreshDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByRefreshToken(dto.token);
    if (!user || !user.refresh_token || !user.refresh_token_expires) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (user.refresh_token_expires < new Date()) {
      user.clearRefreshToken();
      await this.usersService.save(user);
      throw new UnauthorizedException('Refresh token expirado');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTtl = this.configService.get<number>(
      'JWT_REFRESH_TTL',
      604800,
    );

    user.setRefreshToken(
      refreshToken,
      new Date(Date.now() + refreshTtl * 1000),
    );
    await this.usersService.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('JWT_TTL', 28800),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return {
        message: 'Se o email existir, você receberá um link de recuperação.',
      };
    }

    const recoveryToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    user.setRecoveryToken(recoveryToken, expires);
    await this.usersService.save(user);

    await this.mailService.sendRecoveryEmail(dto.email, recoveryToken);

    return {
      message: 'Se o email existir, você receberá um link de recuperação.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByRecoveryToken(dto.token);
    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (user.token_expires && user.token_expires < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.resetPassword(hashedPassword);
    await this.usersService.save(user);

    return { message: 'Senha redefinida com sucesso!' };
  }
}
