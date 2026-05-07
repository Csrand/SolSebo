import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  actualDuration?: number;

  @IsOptional()
  @IsString()
  reflectionText?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
