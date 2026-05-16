import apiClient from "./client";
import type { PaginatedResponse } from "./types";

export interface Club {
  id: number;
  name: string;
  description?: string;
  currentBookId?: number;
  creatorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: number;
  clubeId: number;
  userId: number;
  cargo: string;
  joinedAt: string;
}

async function getClubs(
  limit = 10,
  offset = 0,
): Promise<PaginatedResponse<Club>> {
  return apiClient<PaginatedResponse<Club>>(
    `/clubs?limit=${limit}&offset=${offset}`,
  );
}

async function getClub(id: number): Promise<Club> {
  return apiClient<Club>(`/clubs/${id}`);
}

async function createClub(dto: {
  name: string;
  description?: string;
  currentBookId?: number;
}): Promise<Club> {
  return apiClient<Club>("/clubs", {
    method: "POST",
    body: JSON.stringify(dto),
    requiresAuth: true,
  });
}

async function getMembers(clubId: number): Promise<ClubMember[]> {
  return apiClient<ClubMember[]>(`/clubs/${clubId}/membros`, {
    requiresAuth: true,
  });
}

async function joinClub(clubId: number): Promise<ClubMember> {
  return apiClient<ClubMember>(`/clubs/${clubId}/membros`, {
    method: "POST",
    requiresAuth: true,
  });
}

async function leaveClub(clubId: number): Promise<void> {
  return apiClient<void>(`/clubs/${clubId}/membros`, {
    method: "DELETE",
    requiresAuth: true,
  });
}

export { getClubs, getClub, createClub, getMembers, joinClub, leaveClub };
