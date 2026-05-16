import apiClient from "./client";
import type { PaginatedResponse } from "./types";

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

  async function getUsers(
  limit = 10,
  offset = 0,
): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(
    `/users?limit=${limit}&offset=${offset}`,
    { requiresAuth: true },
  );
}

async function fetchUsersByUrl(url: string): Promise<PaginatedResponse<User>> {
  return apiClient<PaginatedResponse<User>>(url, { requiresAuth: true });
}

export { getUsers, fetchUsersByUrl };
