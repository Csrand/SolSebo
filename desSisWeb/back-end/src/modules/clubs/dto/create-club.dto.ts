import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateClubDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  currentBookId?: number;
}
