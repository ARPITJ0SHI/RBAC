import API_URL from '../config/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const authApi = {
  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);
    
    if (data.requireMFA) {
      return {
        requireMFA: true,
        sessionId: data.sessionId,
        userId: data.userId,
      };
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return {
        success: true,
        user: data.user,
      };
    }

    throw new Error('Invalid response from server');
  },

  async verifyMFA(code, sessionId, userId) {
    const response = await fetch(`${API_URL}/auth/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, sessionId, userId }),
    });

    const data = await handleResponse(response);
    
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    }

    throw new Error(data.error || 'Invalid verification code');
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    }

    throw new Error('Failed to refresh token');
  },

  async logout() {
    const token = localStorage.getItem('token');
    if (!token) return { success: true };

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    return { success: true };
  },

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
};
