import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pagination, UsersList, fetchUsers } from '../components/Pagination';
import type { PaginatedResponse, User } from '../api/users';
import { Button } from '../components/Button';

const USERS_API_URL = '/users?limit=10&offset=0';

function UsersPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData(url: string = USERS_API_URL) {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchUsers(url);
      setData(response);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__user">
          <span>Olá, {user?.username || 'Usuário'}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="dashboard__content">
        <h1>Usuários</h1>

        {error && <div className="alert alert--error">{error}</div>}

        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : data ? (
          <>
            <UsersList users={data.data} />
            <Pagination
              links={data.links}
              meta={data.meta}
              onPageChange={loadData}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}

export { UsersPage };
