import { BibliotecaUsuario } from './biblioteca-usuario.entity';
import { StatusLeitura } from '../enums/status-leitura.enum';

describe('BibliotecaUsuario Entity', () => {
  it('should create with user and book ids', () => {
    const item = new BibliotecaUsuario({
      userId: 1,
      bookId: 1,
      status: StatusLeitura.READING,
    });

    expect(item.userId).toBe(1);
    expect(item.bookId).toBe(1);
    expect(item.status).toBe(StatusLeitura.READING);
  });

  it('should have default status as WANT_TO_READ', () => {
    const item = new BibliotecaUsuario();
    expect(item.status).toBe(StatusLeitura.WANT_TO_READ);
  });

  it('should update current page', () => {
    const item = new BibliotecaUsuario();
    item.updateProgress(50);
    expect(item.currentPage).toBe(50);
  });
});
