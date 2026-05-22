import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new ForbiddenException('Acesso restrito a administradores');
    }
    if (!user.is_admin) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return user;
  }
}
