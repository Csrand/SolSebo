import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { getSessions, type ReadingSession } from '../api/sessions';

function SessionsPage() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSessions() {
    setIsLoading(true);
    setError('');
    try {
      const res = await getSessions(20, 0);
      setSessions(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao carregar sessões');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function formatDuration(minutes?: number): string {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <Link to="/dashboard" className="dashboard__link">Dashboard</Link>
            <Link to="/books" className="dashboard__link">Livros</Link>
            <Link to="/library" className="dashboard__link">Biblioteca</Link>
            <Link to="/sessions" className="dashboard__link dashboard__link--active">Sessões</Link>
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
        <div className="dashboard__header-row">
          <h1>Sessões de Leitura</h1>
          <Link to="/sessions/new" className="btn btn--primary">Nova Sessão</Link>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : sessions.length === 0 ? (
          <p className="empty-state">
            Nenhuma sessão de leitura ainda.{' '}
            <Link to="/sessions/new">Iniciar primeira sessão</Link>
          </p>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-card__header">
                  <span className="status-badge status-badge--active">{session.status}</span>
                  <span className="session-card__date">
                    {new Date(session.startedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="session-card__info">
                  <p>Livro #{session.bookId}</p>
                  <p>Tipo: {session.sessionType === 'timer' ? 'Timer' : 'Cronômetro'}</p>
                  {session.plannedDuration && <p>Planejado: {formatDuration(session.plannedDuration)}</p>}
                  {session.actualDuration && <p>Duração: {formatDuration(session.actualDuration)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export { SessionsPage };
