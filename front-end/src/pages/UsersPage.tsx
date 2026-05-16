import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Pagination } from "../components/Pagination";
import type { PaginationLinks, PaginationMeta } from "../components/Pagination";
import { fetchUsersByUrl } from "../api/users";

interface UsersResponse {
  data: { id: number; username: string; firstName?: string; lastName?: string; email: string; status_validacao: boolean }[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

function UsersPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(url: string = "/users?limit=10&offset=0") {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchUsersByUrl(url);
      setData(response as any);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <>
      <h1>Usuários</h1>

      {error && <div className="alert alert--error">{error}</div>}

      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : data ? (
        <>
          <table className="data-table">
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
              {data.data.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.status_validacao ? "status-badge--active" : "status-badge--pending"}`}>
                      {u.status_validacao ? "Ativo" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination links={data.links} meta={data.meta} onPageChange={loadData} />
        </>
      ) : null}
    </>
  );
}

export { UsersPage };
