import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('deve ser definido', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });

  it('deve extender AuthGuard("jwt")', () => {
    expect(JwtAuthGuard.prototype).toBeInstanceOf(AuthGuard('jwt'));
  });
});
