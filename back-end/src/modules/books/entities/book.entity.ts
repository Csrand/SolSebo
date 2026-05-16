import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';
import { BibliotecaUsuario } from '../../library/entities/biblioteca-usuario.entity';
import { SessaoLeitura } from '../../sessions/entities/sessao-leitura.entity';

@Entity({ name: 'livros' })
export class Book extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string = '';

  @Column({ type: 'varchar', length: 255 })
  author: string = '';

  @Column({ type: 'varchar', length: 20, nullable: true })
  isbn?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher?: string;

  @Column({ name: 'published_year', type: 'int', nullable: true })
  publishedYear?: number;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount?: number;

  @Column({
    name: 'google_books_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  googleBooksId?: string;

  @OneToMany(() => BibliotecaUsuario, (bu) => bu.book, { onDelete: 'CASCADE' })
  libraryEntries: BibliotecaUsuario[];

  @OneToMany(() => SessaoLeitura, (sl) => sl.book, { onDelete: 'CASCADE' })
  sessions: SessaoLeitura[];

  constructor(data: Partial<Book> = {}) {
    super();
    Object.assign(this, data);
  }
}
