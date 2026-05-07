import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';

@Entity({ name: 'clube_membros' })
@Index(['clubeId', 'userId'], { unique: true })
export class ClubeMembro extends BaseEntity {
  @Column({ name: 'clube_id', type: 'int' })
  clubeId: number = 0;

  @Column({ name: 'user_id', type: 'int' })
  userId: number = 0;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  cargo: string = 'member';

  @Column({ name: 'joined_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date = new Date();

  constructor(data: Partial<ClubeMembro> = {}) {
    super();
    Object.assign(this, data);
  }
}
