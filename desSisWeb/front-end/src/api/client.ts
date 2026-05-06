const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restConfig } = config;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restConfig,
    headers: requestHeaders,
  });

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

export { apiClient };
export default apiClient;
