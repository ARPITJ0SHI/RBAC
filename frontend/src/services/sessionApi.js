import { authApi } from './authApi';
import API_URL from '../config/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const sessionApi = {
  async getCurrentSession() {
    const response = await fetch(`${API_URL}/sessions/current`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getUserSessions(userId) {
    const response = await fetch(`${API_URL}/sessions/user/${userId}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async terminateSession(sessionId) {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async terminateAllSessions(userId) {
    const response = await fetch(`${API_URL}/sessions/user/${userId}`, {
      method: 'DELETE',
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async refreshSession() {
    const response = await fetch(`${API_URL}/sessions/refresh`, {
      method: 'POST',
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getSessionStats() {
    const response = await fetch(`${API_URL}/sessions/stats`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },


  EVENTS: {
    SESSION_CREATED: 'SESSION_CREATED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    SESSION_ENDED: 'SESSION_ENDED',
    SESSION_REFRESHED: 'SESSION_REFRESHED',
  },
}; 