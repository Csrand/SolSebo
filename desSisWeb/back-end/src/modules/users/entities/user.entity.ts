import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/commons/entity/base-entity';

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
  senha_hash: string;

  @Column({ name: 'status_validacao', type: 'boolean', default: false })
  status_validacao: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'verification_token', type: 'char', length: 60, nullable: true })
  verification_token?: string;

  @Column({ name: 'verification_token_expires', type: 'datetime', nullable: true })
  verification_token_expires?: Date;

  @Column({ name: 'recovery_token', type: 'char', length: 60, nullable: true })
  recovery_token?: string;

  @Column({ name: 'token_expires', type: 'datetime', nullable: true })
  token_expires?: Date;

  @Column({ name: 'refresh_token', type: 'char', length: 60, nullable: true })
  refresh_token?: string;

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
    this.senha_hash = newPasswordHash;
    this.recovery_token = null;
    this.token_expires = null;
  }
}
