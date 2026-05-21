import { useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.newPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Token de recuperação não encontrado.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      setSuccessMessage(res.message);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Redefinir Senha</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert--error">{error}</div>}
          {successMessage && <div className="alert alert--success">{successMessage}</div>}

          <Input
            label="Nova Senha"
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={formData.confirmNewPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmNewPassword: e.target.value,
              }))
            }
            required
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            Redefinir
          </Button>
        </form>

        {successMessage && (
          <p className="auth-footer">
            <Link to="/login">Ir para o login</Link>
          </p>
        )}
        {!successMessage && (
          <p className="auth-footer">
            <Link to="/login">Voltar ao login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export { ResetPasswordPage };
