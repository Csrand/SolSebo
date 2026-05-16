import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "../components/Pagination";
import type { PaginationLinks, PaginationMeta } from "../components/Pagination";
import apiClient from "../api/client";
import type { ReadingSession } from "../api/sessions";

function SessionsPage() {
  const [data, setData] = useState<{ data: ReadingSession[]; links: PaginationLinks; meta: PaginationMeta } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(url: string = "/sessions?limit=10&offset=0") {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiClient<{ data: ReadingSession[]; links: PaginationLinks; meta: PaginationMeta }>(url, { requiresAuth: true });
      setData(res);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao carregar sessões");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function formatDuration(minutes?: number): string {
    if (!minutes) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  return (
    <>
      <div className="dashboard__header-row">
        <h1>Sessões de Leitura</h1>
        <Link to="/sessions/new" className="btn btn--primary">Nova Sessão</Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : data && data.data.length === 0 ? (
        <p className="empty-state">Nenhuma sessão de leitura ainda. <Link to="/sessions/new">Iniciar primeira sessão</Link></p>
      ) : data ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Livro</th>
                <th>Tipo</th>
                <th>Duração</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((session) => (
                <tr key={session.id}>
                  <td>{new Date(session.startedAt).toLocaleDateString("pt-BR")}</td>
                  <td>{(session as any).book?.title || `Livro #${session.bookId}`}</td>
                  <td>{session.sessionType === "timer" ? "Timer" : "Cronômetro"}</td>
                  <td>{formatDuration(session.actualDuration)}</td>
                  <td><span className="status-badge">{session.status}</span></td>
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

export { SessionsPage };
