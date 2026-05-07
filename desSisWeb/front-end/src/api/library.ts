import apiClient from './client';

export interface LibraryEntry {
  id: number;
  userId: number;
  bookId: number;
  status: 'want_to_read' | 'reading' | 'read';
  currentPage: number;
  rating?: number;
  notes?: string;
  addedAt: string;
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

async function getLibrary(limit = 10, offset = 0): Promise<PaginatedResponse<LibraryEntry>> {
  return apiClient<PaginatedResponse<LibraryEntry>>(`/library?limit=${limit}&offset=${offset}`, {
    requiresAuth: true,
  });
}

async function addToLibrary(dto: { bookId: number; status?: string; currentPage?: number }): Promise<LibraryEntry> {
  return apiClient<LibraryEntry>('/library', {
    method: 'POST',
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

async function removeFromLibrary(id: number): Promise<void> {
  return apiClient<void>(`/library/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

async function updateLibraryEntry(id: number, dto: { status?: string; currentPage?: number; rating?: number; notes?: string }): Promise<LibraryEntry> {
  return apiClient<LibraryEntry>(`/library/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

async function fetchByUrl(url: string): Promise<PaginatedResponse<LibraryEntry>> {
  return apiClient<PaginatedResponse<LibraryEntry>>(url, { requiresAuth: true });
}

export { getLibrary, addToLibrary, removeFromLibrary, updateLibraryEntry, fetchByUrl };
