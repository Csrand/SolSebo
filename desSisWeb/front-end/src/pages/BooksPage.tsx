import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getBooks, createBook, type Book } from '../api/books';

function BooksPage() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadBooks() {
    setIsLoading(true);
    try {
      const res = await getBooks(50, 0);
      setBooks(res.data);
    } catch {
      setError('Erro ao carregar livros');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    await loadBooks();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createBook(formData);
      setSuccess('Livro adicionado com sucesso');
      setFormData({ title: '', author: '' });
      setShowForm(false);
      await loadBooks();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao criar livro');
    }
  }

  const filtered = search
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()),
      )
    : books;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <Link to="/dashboard" className="dashboard__link">Dashboard</Link>
            <Link to="/books" className="dashboard__link dashboard__link--active">Livros</Link>
            <Link to="/library" className="dashboard__link">Biblioteca</Link>
            <Link to="/sessions" className="dashboard__link">Sessões</Link>
            <Link to="/clubs" className="dashboard__link">Clubes</Link>
            {user?.is_admin && <Link to="/users" className="dashboard__link">Usuários</Link>}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Olá, {user?.username || 'Usuário'}</span>
          <Button variant="secondary" onClick={() => logout()}>Sair</Button>
        </div>
      </header>
      <main className="dashboard__content">
        <div className="dashboard__header-row">
          <h1>Livros</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Adicionar Livro'}
          </Button>
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
          <Input
            label=""
            placeholder="Buscar livro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="books-grid">
            {filtered.length === 0 ? (
              <p className="empty-state">Nenhum livro encontrado</p>
            ) : (
              filtered.map((book) => (
                <div key={book.id} className="book-card">
                  {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="book-card__cover" />}
                  <div className="book-card__info">
                    <h3 className="book-card__title">{book.title}</h3>
                    <p className="book-card__author">{book.author}</p>
                    {book.pageCount && <p className="book-card__pages">{book.pageCount} páginas</p>}
                    <Link to={`/library?add=${book.id}`} className="btn btn--primary btn--small">Adicionar à biblioteca</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export { BooksPage };
