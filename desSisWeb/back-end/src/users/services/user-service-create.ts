import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRequest } from '../dto/request/user-request';
import { UserResponse } from '../dto/response/user-response';
import { UserConverte } from '../dto/converter/usar-converter';

export class UserServiceCreate {
  constructor(
    @InjectRepository(User)
    private readonly disciplineRepository: Repository<User>,
  ) {}

  async create(newUser: UserRequest): Promise<UserResponse> {
    let user = UserConverte.toUser(newUser);

    const hasUser = await this.disciplineRepository.findOne({
      where: {
        idUser: user.idUser,
      },
    });

    if (hasUser) {
      throw new HttpException(
        'Usuario com o email informado já está cadastrada',
        HttpStatus.BAD_REQUEST,
      );
    }

    user = await this.disciplineRepository.save(user);

    return UserConverte.toUserResponse(user);
  }
}
