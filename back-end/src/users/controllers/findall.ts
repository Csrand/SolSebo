import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ROUTE } from 'src/commons/constants/system-urls';
import { UserServiceFindAll } from '../services/user-service-findall';
import { UserResponse } from '../dto/response/user-response';
import { Result } from 'src/commons/messages/message';
import { MessageSystem } from 'src/commons/messages/message-system';

@Controller(ROUTE.Users.BASE)
export class UserControllerFindAll {
  constructor(private readonly userServiceFindAll: UserServiceFindAll) {}

  @HttpCode(HttpStatus.OK)
  @Get(ROUTE.Users.LIST)
  async findAll(@Req() req: Request): Promise<Result<UserResponse[]>> {
    const response = await this.userServiceFindAll.findAll();

    return MessageSystem.showMessage(
      HttpStatus.OK,
      'Listagem de disciplinas!',
      response,
      req.path,
      null,
    );
  }
}
