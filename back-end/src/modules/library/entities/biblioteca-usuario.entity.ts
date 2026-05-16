import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

export enum StatusLeitura {
  WANT_TO_READ = 'want_to_read',
  READING = 'reading',
  READ = 'read',
}

@Entity({ name: 'biblioteca_usuario' })
@Index(['userId', 'bookId'], { unique: true })
export class BibliotecaUsuario extends BaseEntity {
  @Column({ name: 'user_id', type: 'int' })
  userId: number = 0;

  @Column({ name: 'book_id', type: 'int' })
  bookId: number = 0;

  @Column({ type: 'enum', enum: StatusLeitura })
  status: StatusLeitura = StatusLeitura.WANT_TO_READ;

  @Column({ name: 'current_page', type: 'int', default: 0 })
  currentPage: number = 0;

  @Column({ type: 'int', nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    name: 'added_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedAt: Date = new Date();

  @ManyToOne(() => User, (user) => user.libraryEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.libraryEntries, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  constructor(data: Partial<BibliotecaUsuario> = {}) {
    super();
    Object.assign(this, data);
  }

  updateProgress(page: number): void {
    this.currentPage = page;
  }
}
