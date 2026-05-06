import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto, createPaginatedResponse, PaginatedResponse } from '../../commons';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResponse<User>> {
    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;

    const [data, total] = await this.userRepository.findAndCount({
      skip: offset,
      take: limit,
    });

    return createPaginatedResponse(
      data,
      total,
      limit,
      offset,
      '/users',
    );
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async findOne(id: number): Promise<User | null> {
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

  async update(id: number, updateUserDto: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      refresh_token: refreshToken ?? undefined,
    });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
