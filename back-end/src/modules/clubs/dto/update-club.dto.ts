import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  currentBookId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
