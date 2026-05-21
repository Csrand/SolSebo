import apiClient from './client';

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  status_validacao: boolean;
  is_active: boolean;
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

async function getUsers(limit = 10, offset = 0): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(`/users?limit=${limit}&offset=${offset}`);
}

async function fetchUsersByUrl(url: string): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(url);
}

export { getUsers, fetchUsersByUrl };
