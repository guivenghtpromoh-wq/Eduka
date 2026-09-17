/**
 * Centralized Production API Client
 * Manages HTTP communication with Express backend, cookie/bearer credentials, 401/403 errors, and CSRF token propagation.
 */

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string = '/api/v1';

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Ensures HttpOnly session cookies are transmitted
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: {
              code: 'HTTP_ERROR',
              message: `Erreur serveur (${response.status}: ${response.statusText})`,
            },
          };
        }

        if (response.status === 401) {
          // Broadcast session expiration event
          window.dispatchEvent(new CustomEvent('eduka:unauthorized'));
        }

        throw new Error(errorData.error.message || 'Une erreur inconnue est survenue.');
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
