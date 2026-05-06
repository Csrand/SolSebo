import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    const foundUser: User = await this.usersService.findOne(user.sub);

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    if (!foundUser.status_validacao) {
      throw new UnauthorizedException('E-mail not verified');
    }

    return true;
  }
}
