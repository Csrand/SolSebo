import { Link, useLocation } from 'react-router-dom';

function VerifyNoticePage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verifique seu e-mail</h1>
        <div className="alert alert--success">
          Cadastro realizado! Enviamos um link de verificação para {email || 'seu e-mail'}.
        </div>
        <p className="auth-footer">
          <Link to="/login">Ir para o login</Link>
        </p>
      </div>
    </div>
  );
}

export { VerifyNoticePage };
