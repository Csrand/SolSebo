import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('deve ser definido', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeDefined();
  });
});
