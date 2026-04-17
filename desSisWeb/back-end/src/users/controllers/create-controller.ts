import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ROUTE } from 'src/commons/constants/system-urls';
import { UserServiceCreate } from '../services/user-service-create';
import { UserRequest } from '../dto/request/user-request';
import { UserResponse } from '../dto/response/user-response';
import { Result } from 'src/commons/messages/message';
import { MessageSystem } from 'src/commons/messages/message-system';

@Controller(ROUTE.Users.BASE)
export class UserControllerCreate {
  constructor(private readonly userServiceCreate: UserServiceCreate) {}

  @HttpCode(HttpStatus.CREATED)
  @Post(ROUTE.Users.CREATE)
  async create(
    @Req() req: Request,
    @Body() userRequest: UserRequest,
  ): Promise<Result<UserResponse>> {
    const response = await this.userServiceCreate.create(userRequest);

    return MessageSystem.showMessage(
      HttpStatus.CREATED,
      'Usuário cadastrado com sucesso!',
      response,
      req.path,
      null,
    );
  }
}
