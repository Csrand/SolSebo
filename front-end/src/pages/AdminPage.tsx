import { Link } from "react-router-dom";

function AdminPage() {
  return (
    <>
      <h1>Administração</h1>
      <div className="dashboard__cards">
        <div className="dashboard__card">
          <h3>Usuários</h3>
          <p>Gerenciar usuários do sistema</p>
          <Link to="/users" className="btn btn--primary">Gerenciar</Link>
        </div>
      </div>
    </>
  );
}

export { AdminPage };
