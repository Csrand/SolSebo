import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <div className="dashboard__cards">
        <div className="dashboard__card">
          <h3>Livros</h3>
          <p>Busque e descubra novos livros para ler</p>
          <Link to="/books" className="btn btn--primary">Explorar</Link>
        </div>
        <div className="dashboard__card">
          <h3>Biblioteca</h3>
          <p>Gerencie sua coleção pessoal de livros</p>
          <Link to="/library" className="btn btn--primary">Ver Biblioteca</Link>
        </div>
        <div className="dashboard__card">
          <h3>Sessões de Leitura</h3>
          <p>Acompanhe seu tempo de leitura com timer</p>
          <Link to="/sessions" className="btn btn--primary">Iniciar</Link>
        </div>
        <div className="dashboard__card">
          <h3>Clubes do Livro</h3>
          <p>Participe de clubes e discuta sobre livros</p>
          <Link to="/clubs" className="btn btn--primary">Ver Clubes</Link>
        </div>
      </div>
    </>
  );
}

export { DashboardPage };
