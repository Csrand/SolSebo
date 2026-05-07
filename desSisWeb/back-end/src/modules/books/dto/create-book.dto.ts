import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  author: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @IsOptional()
  @IsInt()
  publishedYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  googleBooksId?: string;
}
