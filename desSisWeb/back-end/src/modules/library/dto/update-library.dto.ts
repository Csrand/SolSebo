import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { StatusLeitura } from '../entities/biblioteca-usuario.entity';

export class UpdateLibraryDto {
  @IsOptional()
  @IsEnum(StatusLeitura)
  status?: StatusLeitura;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
