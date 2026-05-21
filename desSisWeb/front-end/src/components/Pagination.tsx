import apiClient from '../api/client';
import type { PaginatedResponse, User } from '../api/users';
import { Button } from '../components/Button';

interface PaginationProps {
  links: {
    self: string;
    first: string;
    next: string | null;
    prev: string | null;
    last: string | null;
  };
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  onPageChange: (url: string) => void;
}

function Pagination({ links, meta, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(meta.offset / meta.limit) + 1;
  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="pagination">
      <div className="pagination__info">
        Mostrando {meta.offset + 1} - {Math.min(meta.offset + meta.limit, meta.total)} de {meta.total}
      </div>
      <div className="pagination__nav">
        <Button
          variant="secondary"
          onClick={() => onPageChange(links.first)}
          disabled={!links.prev && currentPage === 1}
        >
          Primeira
        </Button>
        <Button
          variant="secondary"
          onClick={() => links.prev && onPageChange(links.prev)}
          disabled={!links.prev}
        >
          Anterior
        </Button>
        <span className="pagination__page">
          Página {currentPage} de {totalPages || 1}
        </span>
        <Button
          variant="secondary"
          onClick={() => links.next && onPageChange(links.next)}
          disabled={!links.next}
        >
          Próxima
        </Button>
        <Button
          variant="secondary"
          onClick={() => links.last && onPageChange(links.last)}
          disabled={!links.last}
        >
          Última
        </Button>
      </div>
    </div>
  );
}

interface UsersListProps {
  users: User[];
}

function UsersList({ users }: UsersListProps) {
  return (
    <div className="users-list">
      {users.length === 0 ? (
        <p className="users-list__empty">Nenhum usuário encontrado</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`status-badge ${
                      user.status_validacao ? 'status-badge--active' : 'status-badge--pending'
                    }`}
                  >
                    {user.status_validacao ? 'Ativo' : 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

async function fetchUsers(url: string): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(url);
}

export { Pagination, UsersList, fetchUsers };
