import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';
import { Book } from '../../books/entities/book.entity';
import { User } from '../../users/entities/user.entity';

export type SessionType = 'timer' | 'stopwatch';

@Entity({ name: 'sessoes_leitura' })
export class SessaoLeitura extends BaseEntity {
  @Column({ name: 'user_id', type: 'int' })
  userId: number = 0;

  @Column({ name: 'book_id', type: 'int' })
  bookId: number = 0;

  @Column({ name: 'session_type', type: 'varchar', length: 20 })
  sessionType: SessionType = 'timer';

  @Column({ name: 'started_at', type: 'datetime' })
  startedAt: Date = new Date();

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt?: Date;

  @Column({ name: 'planned_duration', type: 'int', nullable: true })
  plannedDuration?: number;

  @Column({ name: 'actual_duration', type: 'int', nullable: true })
  actualDuration?: number;

  @Column({ name: 'reflection_text', type: 'text', nullable: true })
  reflectionText?: string;

  @Column({ name: 'reflection_timer_duration', type: 'int', nullable: true })
  reflectionTimerDuration?: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string = 'active';

  @ManyToOne(() => Book, (book) => book.sessions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(data: Partial<SessaoLeitura> = {}) {
    super();
    Object.assign(this, data);
  }

  calculateReflectionDuration(): number {
    if (this.actualDuration) return Math.floor(this.actualDuration * 0.2);
    return 0;
  }

  complete(reflectionText: string, actualDuration?: number): void {
    this.reflectionText = reflectionText;
    if (actualDuration !== undefined) this.actualDuration = actualDuration;
    this.status = 'completed';
    this.endedAt = new Date();
  }
}
