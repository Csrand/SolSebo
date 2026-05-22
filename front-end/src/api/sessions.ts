import apiClient from './client';

export interface ReadingSession {
  id: number;
  userId: number;
  bookId: number;
  sessionType: 'timer' | 'stopwatch';
  startedAt: string;
  endedAt?: string;
  plannedDuration?: number;
  actualDuration?: number;
  reflectionText?: string;
  reflectionTimerDuration?: number;
  status: string;
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

async function getSessions(limit = 10, offset = 0): Promise<PaginatedResponse<ReadingSession>> {
  return apiClient<PaginatedResponse<ReadingSession>>(`/sessions?limit=${limit}&offset=${offset}`, {
    requiresAuth: true,
  });
}

async function getSession(id: number): Promise<ReadingSession> {
  return apiClient<ReadingSession>(`/sessions/${id}`, { requiresAuth: true });
}

async function createSession(dto: { bookId: number; sessionType?: string; plannedDuration?: number }): Promise<ReadingSession> {
  return apiClient<ReadingSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

async function updateSession(id: number, dto: { status?: string; actualDuration?: number; reflectionText?: string }): Promise<ReadingSession> {
  return apiClient<ReadingSession>(`/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

export { getSessions, getSession, createSession, updateSession };
