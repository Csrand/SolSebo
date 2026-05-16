import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new ForbiddenException('Acesso restrito a administradores');
    }
    if (!(user as Record<string, unknown>).is_admin) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return user as TUser;
  }
}
