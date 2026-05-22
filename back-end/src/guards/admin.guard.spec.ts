import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('deve permitir acesso quando user.is_admin é true', () => {
    const req = { user: { id: 1, is_admin: true } };

    const result = guard.handleRequest(null, req.user);

    expect(result).toEqual(req.user);
  });

  it('deve lançar ForbiddenException quando user não é admin', () => {
    const user = { id: 1, is_admin: false };

    expect(() => guard.handleRequest(null, user)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando não há user', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(ForbiddenException);
  });

  it('deve propagar erro existente', () => {
    const error = new Error('auth error');

    expect(() => guard.handleRequest(error, null)).toThrow(error);
  });
});
