import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from 'src/commons/decorators/match.decorator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword')
  confirmNewPassword: string;
}
