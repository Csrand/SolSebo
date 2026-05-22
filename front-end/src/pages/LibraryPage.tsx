import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { addToLibrary, removeFromLibrary, fetchByUrl, type LibraryEntry } from '../api/library';

function LibraryPage() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [links, setLinks] = useState<Record<string, string | null>>({ self: '', first: '', next: null, prev: null, last: null });
  const [meta, setMeta] = useState({ total: 0, limit: 10, offset: 0 });

  async function loadData(url: string = `/library?limit=10&offset=0`) {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchByUrl(url);
      setEntries(res.data);
      setLinks(res.links);
      setMeta(res.meta);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao carregar biblioteca');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const addBookId = searchParams.get('add');
    if (addBookId) {
      addToLibrary({ bookId: Number(addBookId) })
        .then(() => {
          setSuccess('Livro adicionado com sucesso');
          loadData();
        })
        .catch((err: unknown) => {
          const error = err as { message?: string };
          setError(error.message || 'Erro ao adicionar livro');
        });
    }
  }, [searchParams.get('add')]);

  async function handleRemove(id: number) {
    try {
      await removeFromLibrary(id);
      setSuccess('Livro removido da biblioteca');
      loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao remover livro');
    }
  }

  const statusLabels: Record<string, string> = {
    want_to_read: 'Quero ler',
    reading: 'Lendo',
    read: 'Lido',
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <Link to="/dashboard" className="dashboard__link">Dashboard</Link>
            <Link to="/books" className="dashboard__link">Livros</Link>
            <Link to="/library" className="dashboard__link dashboard__link--active">Biblioteca</Link>
            <Link to="/sessions" className="dashboard__link">Sessões</Link>
            <Link to="/clubs" className="dashboard__link">Clubes</Link>
            {user?.is_admin && <Link to="/users" className="dashboard__link">Usuários</Link>}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Olá, {user?.username || 'Usuário'}</span>
          <Button variant="secondary" onClick={() => logout()}>Sair</Button>
        </div>
      </header>
      <main className="dashboard__content">
        <h1>Minha Biblioteca</h1>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : entries.length === 0 ? (
          <p className="empty-state">Sua biblioteca está vazia. <Link to="/books">Explorar livros</Link></p>
        ) : (
          <>
            <div className="entries-list">
              {entries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-card__info">
                    <p className="entry-card__book-id">Book #{entry.bookId}</p>
                    <span className="status-badge status-badge--active">{statusLabels[entry.status] || entry.status}</span>
                    {entry.currentPage > 0 && <p className="entry-card__pages">Página {entry.currentPage}</p>}
                  </div>
                  <div className="entry-card__actions">
                    <Link to={`/sessions/new?book=${entry.bookId}`} className="btn btn--primary btn--small">Ler</Link>
                    <Button variant="secondary" onClick={() => handleRemove(entry.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <div className="pagination__info">
                Mostrando {meta.offset + 1} - {Math.min(meta.offset + meta.limit, meta.total)} de {meta.total}
              </div>
              <div className="pagination__nav">
                <Button variant="secondary" onClick={() => links.first && loadData(links.first)} disabled={meta.offset === 0}>
                  Primeira
                </Button>
                <Button variant="secondary" onClick={() => links.prev && loadData(links.prev)} disabled={!links.prev}>
                  Anterior
                </Button>
                <span className="pagination__page">
                  Página {Math.floor(meta.offset / meta.limit) + 1} de {Math.ceil(meta.total / meta.limit) || 1}
                </span>
                <Button variant="secondary" onClick={() => links.next && loadData(links.next)} disabled={!links.next}>
                  Próxima
                </Button>
                <Button variant="secondary" onClick={() => links.last && loadData(links.last)} disabled={meta.offset + meta.limit >= meta.total}>
                  Última
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export { LibraryPage };
