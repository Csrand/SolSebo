const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

function getAccessToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      return null;
    }

    const data = await response.json();
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    return null;
  }
}

async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restConfig } = config;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      (requestHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restConfig,
    headers: requestHeaders,
  });

  if (response.status === 401 && requiresAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (requestHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restConfig,
        headers: requestHeaders,
      });

      if (retryResponse.ok) {
        if (retryResponse.status === 204) return {} as T;
        return retryResponse.json();
      }

      const retryError = await retryResponse.json().catch(() => ({
        message: retryResponse.statusText,
        statusCode: retryResponse.status,
      }));
      throw retryError;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export { apiClient, getAccessToken, refreshAccessToken };
export default apiClient;
