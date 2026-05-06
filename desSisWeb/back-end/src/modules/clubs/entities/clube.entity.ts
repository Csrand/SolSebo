import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';

@Entity({ name: 'clubes' })
export class Clube extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'current_book_id', type: 'int', nullable: true })
  currentBookId?: number;

  @Column({ name: 'creator_id', type: 'int' })
  creatorId: number = 0;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  members: number[] = [];

  constructor(data: Partial<Clube> = {}) {
    super();
    Object.assign(this, data);
  }

  addMember(userId: number): void {
    if (!this.members.includes(userId)) {
      this.members.push(userId);
    }
  }
}
