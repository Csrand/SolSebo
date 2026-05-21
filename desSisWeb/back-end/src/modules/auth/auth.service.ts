import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) {
      throw new BadRequestException('Username já está em uso');
    }

    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException('Email já está cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = await bcrypt.hash(
      `${Date.now()}-${dto.email}`,
      10,
    );

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

    return { message: 'Cadastro realizado! Verifique seu email para ativar sua conta.' };
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
    await this.usersService.update(user.id, {
      status_validacao: user.status_validacao,
      verification_token: user.verification_token,
      verification_token_expires: user.verification_token_expires,
    });

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

    if (!user.is_active) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.status_validacao) {
      throw new UnauthorizedException('Email não verificado');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    });

    const expiresIn = 3600;

    return {
      accessToken,
      expiresIn,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'Se o email existir, você receberá um link de recuperação.' };
    }

    const recoveryToken = await bcrypt.hash(
      `${Date.now()}-${dto.email}`,
      10,
    );
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    user.setRecoveryToken(recoveryToken, expires);
    await this.usersService.update(user.id, {
      recovery_token: user.recovery_token,
      token_expires: user.token_expires,
    });

    await this.mailService.sendRecoveryEmail(dto.email, recoveryToken);

    return { message: 'Se o email existir, você receberá um link de recuperação.' };
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
    await this.usersService.update(user.id, {
      senha_hash: user.senha_hash,
      recovery_token: user.recovery_token,
      token_expires: user.token_expires,
    });

    return { message: 'Senha redefinida com sucesso!' };
  }
}
