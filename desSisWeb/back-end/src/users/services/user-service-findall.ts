import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserResponse } from '../dto/response/user-response';
import { UserConverte } from '../dto/converter/usar-converter';

@Injectable()
export class UserServiceFindAll {
  constructor(
    @InjectRepository(User)
    private readonly disciplineRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponse[]> {
    const usuarios = await this.disciplineRepository.find({
      order: {
        id: 'ASC',
      },
    });
    return UserConverte.toListUserResponse(usuarios);
  }
}
