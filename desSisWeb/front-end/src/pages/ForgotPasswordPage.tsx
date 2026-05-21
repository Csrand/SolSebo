import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await forgotPassword({ email });
      setMessage(res.message);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao solicitar recuperação');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recuperar Senha</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert--error">{error}</div>}
          {message && <div className="alert alert--success">{message}</div>}

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            Enviar
          </Button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}

export { ForgotPasswordPage };
