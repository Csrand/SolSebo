import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto, paginate, PaginatedResponse } from '../../commons';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<User>> {
    return paginate(this.userRepository, pagination, '/users');
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { verification_token: token },
    });
  }

  async findByRecoveryToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { recovery_token: token } });
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { refresh_token: token } });
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.userRepository.delete(id);
  }
}
