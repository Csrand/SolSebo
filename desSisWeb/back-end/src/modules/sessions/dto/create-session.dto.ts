import { IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  bookId: number;

  @IsOptional()
  @IsIn(['timer', 'stopwatch'])
  sessionType?: 'timer' | 'stopwatch';

  @IsOptional()
  @IsInt()
  @Min(1)
  plannedDuration?: number;
}
