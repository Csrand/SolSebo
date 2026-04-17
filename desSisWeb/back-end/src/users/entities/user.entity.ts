import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../commons/entity/base-entity';

@Entity('USUARIOS')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'ID_USUARIO',
    type: 'int',
  })
  idUser?: number;

  @Column({
    name: 'FIRST_NAME',
    type: 'varchar',
    length: 50,
  })
  firstName: string = '';

  @Column({
    name: 'LAST_NAME',
    type: 'varchar',
    length: 50,
  })
  lastName: string = '';

  @Column({
    name: 'USERNAME',
    type: 'varchar',
    length: 50,
  })
  username: string = '';

  @Column({
    name: 'EMAIL',
    type: 'varchar',
    length: 100,
  })
  email: string = '';

  @Column({
    name: 'PASSWORD',
    type: 'varchar',
    length: 60,
  })
  password: string = '';

  constructor(data: Partial<User> = {}) {
    super();
    Object.assign(this, data);
  }
}
