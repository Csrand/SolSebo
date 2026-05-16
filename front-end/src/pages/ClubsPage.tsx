import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Pagination } from "../components/Pagination";
import type { PaginationLinks, PaginationMeta } from "../components/Pagination";
import apiClient from "../api/client";
import { createClub, joinClub, leaveClub, type Club } from "../api/clubs";

function ClubsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ data: Club[]; links: PaginationLinks; meta: PaginationMeta } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(url: string = "/clubs?limit=10&offset=0") {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiClient<{ data: Club[]; links: PaginationLinks; meta: PaginationMeta }>(url);
      setData(res);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao carregar clubes");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await createClub(formData);
      setSuccess("Clube criado com sucesso");
      setFormData({ name: "", description: "" });
      setShowForm(false);
      loadData();
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao criar clube");
    }
  }

  async function handleJoin(clubId: number) {
    setError(""); setSuccess("");
    try {
      await joinClub(clubId);
      setSuccess("Você entrou no clube");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao entrar no clube");
    }
  }

  async function handleLeave(clubId: number) {
    setError(""); setSuccess("");
    try {
      await leaveClub(clubId);
      setSuccess("Você saiu do clube");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao sair do clube");
    }
  }

  return (
    <>
      <div className="dashboard__header-row">
        <h1>Clubes do Livro</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Criar Clube"}
        </Button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {showForm && (
        <div className="form-card">
          <form onSubmit={handleCreate} className="auth-form">
            <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Descrição" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Button type="submit" variant="primary">Salvar</Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : data && data.data.length === 0 ? (
        <p className="empty-state">Nenhum clube encontrado. Crie o primeiro!</p>
      ) : data ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((club) => (
                <tr key={club.id}>
                  <td>{club.name}</td>
                  <td>{club.description || "-"}</td>
                  <td>{club.isActive ? "Sim" : "Não"}</td>
                  <td>
                    {user && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="primary" onClick={() => handleJoin(club.id)}>Entrar</Button>
                        <Button variant="secondary" onClick={() => handleLeave(club.id)}>Sair</Button>
                      </div>
                    )}
                  </td>
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

export { ClubsPage };
