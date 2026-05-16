import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function register(
  payload: RegisterPayload,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function refreshToken(token: string): Promise<RefreshResponse> {
  return apiClient<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

async function getProfile(): Promise<AuthUser> {
  return apiClient<AuthUser>("/auth/me", { requiresAuth: true });
}

export {
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
};
