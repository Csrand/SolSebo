import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../commons/entity/base-entity';

@Entity({ name: 'usuarios' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'senha_hash', type: 'char', length: 60 })
  password: string;

  @Column({ name: 'status_validacao', type: 'boolean', default: false })
  status_validacao: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({
    name: 'verification_token',
    type: 'char',
    length: 60,
    nullable: true,
  })
  verification_token: string | null = null;

  @Column({
    name: 'verification_token_expires',
    type: 'datetime',
    nullable: true,
  })
  verification_token_expires: Date | null = null;

  @Column({ name: 'recovery_token', type: 'char', length: 60, nullable: true })
  recovery_token: string | null = null;

  @Column({ name: 'token_expires', type: 'datetime', nullable: true })
  token_expires: Date | null = null;

  verifyEmail(): void {
    this.status_validacao = true;
    this.verification_token = null;
    this.verification_token_expires = null;
  }

  setRecoveryToken(token: string, expires: Date): void {
    this.recovery_token = token;
    this.token_expires = expires;
  }

  resetPassword(newPasswordHash: string): void {
    this.password = newPasswordHash;
    this.recovery_token = null;
    this.token_expires = null;
  }
}
