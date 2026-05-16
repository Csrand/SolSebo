import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Pagination } from "../components/Pagination";
import type { PaginationLinks, PaginationMeta } from "../components/Pagination";
import apiClient from "../api/client";
import { createBook, type Book } from "../api/books";

function BooksPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ data: Book[]; links: PaginationLinks; meta: PaginationMeta } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(url: string = "/books?limit=10&offset=0") {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiClient<{ data: Book[]; links: PaginationLinks; meta: PaginationMeta }>(url);
      setData(res);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao carregar livros");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    loadData(`/books?limit=10&offset=0&search=${encodeURIComponent(search)}`);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await createBook(formData);
      setSuccess("Livro adicionado com sucesso");
      setFormData({ title: "", author: "" });
      setShowForm(false);
      loadData();
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao criar livro");
    }
  }

  return (
    <>
      <div className="dashboard__header-row">
        <h1>Catálogo de Livros</h1>
        {user && (
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Adicionar Livro"}
          </Button>
        )}
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {showForm && (
        <div className="form-card">
          <form onSubmit={handleCreate} className="auth-form">
            <Input label="Título" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <Input label="Autor" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required />
            <Button type="submit" variant="primary">Salvar</Button>
          </form>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-bar">
        <Input label="" placeholder="Buscar por título ou autor..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>

      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : data && data.data.length === 0 ? (
        <p className="empty-state">Nenhum livro encontrado</p>
      ) : data ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN</th>
                <th>Páginas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn || "-"}</td>
                  <td>{book.pageCount || "-"}</td>
                  <td><Link to={`/library?add=${book.id}`} className="btn btn--small">Adicionar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination links={data.links} meta={data.meta} onPageChange={(url) => loadData(url)} />
        </>
      ) : null}
    </>
  );
}

export { BooksPage };
