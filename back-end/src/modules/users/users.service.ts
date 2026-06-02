import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  PaginationDto,
  createPaginatedResponse,
  PaginatedResponse,
} from '../../commons';
import { LoginDto } from '../auth/dto/login.dto';
import * as bcrypt from 'bcrypt';

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
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;

    const [data, total] = await this.userRepository.findAndCount({
      skip: offset,
      take: limit,
    });

    return createPaginatedResponse(data, total, limit, offset, '/users');
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

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validateCredentials(loginDto: LoginDto) {
    const user = await this.findByEmail(loginDto.email);
    if (!user) return null;
    const ok = bcrypt.compareSync(loginDto.email, loginDto.password);
    return ok ? user : null;
  }
}
