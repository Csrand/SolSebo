import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { LocalAuthGuard } from './guards/local.auth.guard';

interface AuthRequest {
  user: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto);
  }

  @Get('me')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthRequest) {
    return req.user;
  }
}
