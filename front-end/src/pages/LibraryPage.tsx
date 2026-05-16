import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Pagination } from "../components/Pagination";
import type { PaginationLinks, PaginationMeta } from "../components/Pagination";
import { addToLibrary, removeFromLibrary, fetchByUrl, type LibraryEntry } from "../api/library";

function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addBookId = searchParams.get("add");
  const [data, setData] = useState<{ data: LibraryEntry[]; links: PaginationLinks; meta: PaginationMeta } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(url: string = "/library?limit=10&offset=0") {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetchByUrl(url);
      setData(res);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao carregar biblioteca");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (addBookId) {
      addToLibrary({ bookId: Number(addBookId) })
        .then(() => {
          setSuccess("Livro adicionado com sucesso");
          setSearchParams({}, { replace: true });
          loadData();
        })
        .catch((err: unknown) => setError((err as { message?: string }).message || "Erro ao adicionar livro"));
    }
  }, [addBookId]);

  async function handleRemove(id: number) {
    try {
      await removeFromLibrary(id);
      setSuccess("Livro removido da biblioteca");
      loadData();
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao remover livro");
    }
  }

  const statusLabels: Record<string, string> = {
    want_to_read: "Quero ler",
    reading: "Lendo",
    read: "Lido",
  };

  return (
    <>
      <div className="dashboard__header-row">
        <h1>Minha Biblioteca</h1>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : data && data.data.length === 0 ? (
        <p className="empty-state">Sua biblioteca está vazia. <Link to="/books">Explorar livros</Link></p>
      ) : data ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Livro</th>
                <th>Status</th>
                <th>Página</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((entry) => (
                <tr key={entry.id}>
                  <td>{(entry as any).book?.title || `Livro #${entry.bookId}`}</td>
                  <td><span className="status-badge status-badge--active">{statusLabels[entry.status] || entry.status}</span></td>
                  <td>{entry.currentPage > 0 ? `Página ${entry.currentPage}` : "-"}</td>
                  <td>
                    <Link to={`/sessions/new?book=${entry.bookId}`} className="btn btn--small">Ler</Link>
                    <Button variant="secondary" onClick={() => handleRemove(entry.id)}>Remover</Button>
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

export { LibraryPage };
