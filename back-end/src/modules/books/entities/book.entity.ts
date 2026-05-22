import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';

@Entity({ name: 'livros' })
export class Books extends BaseEntity {
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

  @Column({ name: 'google_books_id', type: 'varchar', length: 100, nullable: true })
  googleBooksId?: string;

  constructor(data: Partial<Books> = {}) {
    super();
    Object.assign(this, data);
  }
}
