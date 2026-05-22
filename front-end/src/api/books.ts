import apiClient from './client';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  coverUrl?: string;
  description?: string;
  pageCount?: number;
  googleBooksId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
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
}

async function getBooks(limit = 10, offset = 0): Promise<PaginatedResponse<Book>> {
  return apiClient<PaginatedResponse<Book>>(`/books?limit=${limit}&offset=${offset}`);
}

async function getBook(id: number): Promise<Book> {
  return apiClient<Book>(`/books/${id}`);
}

async function createBook(dto: { title: string; author: string; isbn?: string; publisher?: string; publishedYear?: number; description?: string; pageCount?: number }): Promise<Book> {
  return apiClient<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

export { getBooks, getBook, createBook };
