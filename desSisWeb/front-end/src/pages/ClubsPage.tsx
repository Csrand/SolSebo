import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getClubs, createClub, joinClub, type Club } from '../api/clubs';

function ClubsPage() {
  const { user, logout } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadClubs() {
    setIsLoading(true);
    setError('');
    try {
      const res = await getClubs(50, 0);
      setClubs(res.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao carregar clubes');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClubs();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createClub(formData);
      setSuccess('Clube criado com sucesso');
      setFormData({ name: '', description: '' });
      setShowForm(false);
      await loadClubs();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao criar clube');
    }
  }

  async function handleJoin(clubId: number) {
    setError('');
    setSuccess('');
    try {
      await joinClub(clubId);
      setSuccess('Você entrou no clube');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao entrar no clube');
    }
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
            <Link to="/sessions" className="dashboard__link">Sessões</Link>
            <Link to="/clubs" className="dashboard__link dashboard__link--active">Clubes</Link>
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
          <h1>Clubes do Livro</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Criar Clube'}
          </Button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        {showForm && (
          <div className="form-card">
            <form onSubmit={handleCreate} className="auth-form">
              <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Descrição" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <Button type="submit" variant="primary">Salvar</Button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : clubs.length === 0 ? (
          <p className="empty-state">Nenhum clube encontrado. Crie o primeiro!</p>
        ) : (
          <div className="clubs-grid">
            {clubs.map((club) => (
              <div key={club.id} className="club-card">
                <h3 className="club-card__name">{club.name}</h3>
                {club.description && <p className="club-card__description">{club.description}</p>}
                <div className="club-card__actions">
                  <Button variant="primary" onClick={() => handleJoin(club.id)}>Entrar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export { ClubsPage };
