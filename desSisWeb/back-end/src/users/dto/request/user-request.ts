import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserRequest {
  @Type(() => Number)
  @IsOptional()
  id: number;

  @IsNotEmpty({ message: 'O primeiro nome deve ser informado ' })
  @IsString({ message: 'O  primeiro nome deve ser do tipo string' })
  @MaxLength(50, {
    message:
      'O tamanho máximo é de 10 caracteres para o primeiro nome do usuário',
  })
  firstName: string = '';

  @IsNotEmpty({ message: 'O segundo nome deve ser informado ' })
  @IsString({ message: 'O  segundo nome deve ser do tipo string' })
  @MaxLength(50, {
    message: 'O tamanho máximo do segundo nome é de 50 caracteres',
  })
  lastName: string = '';

  @IsNotEmpty({ message: 'O username deve ser informado ' })
  @IsString({ message: 'O username deve ser do tipo string' })
  @MaxLength(50, {
    message: 'O tamanho máximo que um username pode ter é de 50 caracteres',
  })
  username: string = '';

  @IsNotEmpty({ message: 'O email deve ser informado ' })
  @IsString({ message: 'O email deve ser do tipo string' })
  @MaxLength(100, {
    message: 'O tamanho máximo do email é de 100 caracteres',
  })
  email: string = '';

  @IsNotEmpty({ message: 'A senha deve ser informada ' })
  @IsString({ message: 'O senha deve ser do tipo string' })
  @MaxLength(60, {
    message: 'O tamanho máximo da senha é de 60 caracteres',
  })
  password: string = '';

  constructor(data: Partial<UserRequest> = {}) {
    Object.assign(this, data);
  }
}
