import { SessaoLeitura } from './sessao-leitura.entity';

describe('SessaoLeitura Entity', () => {
  it('should create session with user and book', () => {
    const session = new SessaoLeitura({
      userId: 1,
      bookId: 1,
      sessionType: 'timer',
      plannedDuration: 25,
    });

    expect(session.userId).toBe(1);
    expect(session.sessionType).toBe('timer');
    expect(session.plannedDuration).toBe(25);
  });

  it('should calculate reflection duration as 20% of session', () => {
    const session = new SessaoLeitura({
      plannedDuration: 60,
      actualDuration: 50,
    });

    const reflection = session.calculateReflectionDuration();
    expect(reflection).toBe(10); // 20% of 50
  });

  it('should complete session with reflection text', () => {
    const session = new SessaoLeitura();
    session.complete('Great book about clean code', 60);

    expect(session.reflectionText).toBe('Great book about clean code');
    expect(session.actualDuration).toBe(60);
    expect(session.status).toBe('completed');
  });
});
