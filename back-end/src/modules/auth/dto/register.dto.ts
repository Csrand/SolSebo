import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from 'src/commons/decorators/match.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}
