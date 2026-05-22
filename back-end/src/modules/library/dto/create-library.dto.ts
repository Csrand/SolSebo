import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StatusLeitura } from '../entities/biblioteca-usuario.entity';

export class CreateLibraryDto {
  @IsInt()
  bookId: number;

  @IsOptional()
  @IsEnum(StatusLeitura)
  status?: StatusLeitura;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;
}
