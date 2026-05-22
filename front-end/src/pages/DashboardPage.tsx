import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <a href="/dashboard" className="dashboard__link dashboard__link--active">Dashboard</a>
            <a href="/books" className="dashboard__link">Livros</a>
            <a href="/library" className="dashboard__link">Biblioteca</a>
            <a href="/sessions" className="dashboard__link">Sessões</a>
            <a href="/clubs" className="dashboard__link">Clubes</a>
            {user?.is_admin && <a href="/users" className="dashboard__link">Usuários</a>}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Olá, {user?.username || 'Usuário'}</span>
          <Button variant="secondary" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </header>
      <main className="dashboard__content">
        <h1>Dashboard</h1>
        <div className="dashboard__cards">
          <div className="dashboard__card">
            <h3>Livros</h3>
            <p>Busque e descubra novos livros para ler</p>
            <a href="/books" className="btn btn--primary">Explorar</a>
          </div>
          <div className="dashboard__card">
            <h3>Biblioteca</h3>
            <p>Gerencie sua coleção pessoal de livros</p>
            <a href="/library" className="btn btn--primary">Ver Biblioteca</a>
          </div>
          <div className="dashboard__card">
            <h3>Sessões de Leitura</h3>
            <p>Acompanhe seu tempo de leitura com timer</p>
            <a href="/sessions" className="btn btn--primary">Iniciar</a>
          </div>
          <div className="dashboard__card">
            <h3>Clubes do Livro</h3>
            <p>Participe de clubes e discuta sobre livros</p>
            <a href="/clubs" className="btn btn--primary">Ver Clubes</a>
          </div>
        </div>
      </main>
    </div>
  );
}

export { DashboardPage };
