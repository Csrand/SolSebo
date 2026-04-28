import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'ID_USUARIO',
    type: 'int',
  })
  id: number;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT' })
  updatedAt!: Date;

  constructor(data: Partial<BaseEntity> = {}) {
    Object.assign(this, data);
  }
}
