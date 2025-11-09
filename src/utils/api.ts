// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors gracefully (e.g., backend not available)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Backend server is not available. Please ensure the server is running or configure VITE_API_BASE_URL.');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new APIClient();

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiClient.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    });
  },

  register: async (email: string, password: string, name?: string) => {
    return apiClient.post<{ token: string; user: any }>('/auth/register', {
      email,
      password,
      name,
    });
  },

  verify: async () => {
    return apiClient.get<{ valid: boolean; user: any }>('/auth/verify');
  },

  setToken: (token: string | null) => {
    apiClient.setToken(token);
  },
};

// Upload API
export const uploadAPI = {
  getSignedUploadUrl: async (filename: string, fileType: string, folder?: string) => {
    return apiClient.post<{ uploadUrl: string; key: string; url: string }>(
      '/upload/signed-url',
      { filename, fileType, folder }
    );
  },

  getSignedReadUrl: async (key: string) => {
    return apiClient.post<{ url: string }>('/upload/signed-read-url', { key });
  },

  deleteFile: async (key: string) => {
    return apiClient.delete(`/upload/${key}`);
  },
};

// User API
export const userAPI = {
  getMe: async () => {
    return apiClient.get<any>('/users/me');
  },

  updateMe: async (data: { name?: string }) => {
    return apiClient.put<any>('/users/me', data);
  },
};

