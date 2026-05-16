import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';
import { User } from '../../users/entities/user.entity';
import { ClubeMembro } from './clube-membro.entity';

@Entity({ name: 'clubes' })
export class Clube extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string = '';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'current_book_id', type: 'int', nullable: true })
  currentBookId?: number;

  @Column({ name: 'creator_id', type: 'int', nullable: true })
  creatorId?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean = true;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => ClubeMembro, (cm) => cm.clube, { onDelete: 'CASCADE' })
  membros: ClubeMembro[];

  constructor(data: Partial<Clube> = {}) {
    super();
    Object.assign(this, data);
  }
}
