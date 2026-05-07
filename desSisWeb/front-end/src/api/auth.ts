import apiClient from './client';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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

async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getProfile(): Promise<User> {
  return apiClient<User>('/auth/me', { requiresAuth: true });
}

async function logout(): Promise<void> {
  return apiClient<void>('/auth/logout', {
    method: 'POST',
    requiresAuth: true,
  });
}

async function getUsers(limit = 10, offset = 0): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(
    `/users?limit=${limit}&offset=${offset}`,
  );
}

export { login, register, getProfile, logout, getUsers };
