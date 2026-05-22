import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '../components/Button';

function AdminPage() {
  const { user, logout } = useAuth();

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
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
            <Link to="/clubs" className="dashboard__link">Clubes</Link>
            {user?.is_admin && <Link to="/users" className="dashboard__link dashboard__link--active">Admin</Link>}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Admin: {user?.username}</span>
          <Button variant="secondary" onClick={() => logout()}>Sair</Button>
        </div>
      </header>
      <main className="dashboard__content">
        <h1>Administração</h1>
        <div className="dashboard__cards">
          <div className="dashboard__card">
            <h3>Usuários</h3>
            <p>Gerenciar usuários do sistema</p>
            <Link to="/users" className="btn btn--primary">Gerenciar</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export { AdminPage };
