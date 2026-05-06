import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from 'src/commons/entity/base-entity';

export class User extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha_hash: string;

  @IsBoolean()
  @Type(() => Boolean)
  status_validacao: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  is_active: boolean;

  @IsOptional()
  @IsString()
  recovery_token?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  token_expires?: Date;
}
