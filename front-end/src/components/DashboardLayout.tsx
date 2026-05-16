import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname === path ? "dashboard__link dashboard__link--active" : "dashboard__link";

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
            <Link to="/books" className={isActive("/books")}>Livros</Link>
            <Link to="/library" className={isActive("/library")}>Biblioteca</Link>
            <Link to="/sessions" className={isActive("/sessions")}>Sessões</Link>
            <Link to="/clubs" className={isActive("/clubs")}>Clubes</Link>
            {user?.is_admin && (
              <Link to="/users" className={isActive("/users")}>Usuários</Link>
            )}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Olá, {user?.username || "Usuário"}</span>
          <Button variant="secondary" onClick={logout}>Sair</Button>
        </div>
      </header>
      <main className="dashboard__content">
        <Outlet />
      </main>
    </div>
  );
}

export { DashboardLayout };
