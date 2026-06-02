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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const verificationToken = await bcrypt.hash(
      `${Date.now()}-${dto.email}`,
      salt,
    );

    await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
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
    await this.usersService.update(user.id, {
      status_validacao: user.status_validacao,
      verification_token: user.verification_token,
      verification_token_expires: user.verification_token_expires,
    });

    return { message: 'Email verificado com sucesso!' };
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.validateCredentials(loginDto);
    if (!user) throw new UnauthorizedException();
    const { password: _, ...result } = user;
    return result;
  }
}
