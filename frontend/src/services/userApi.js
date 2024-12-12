import { authApi } from './authApi';

const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const userApi = {
  async getAllUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getUserById(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async createUser(userData) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async updateUser(id, updates) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async updateUserRole(id, role) {
    const response = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ role }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async updateUserStatus(id, status) {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async bulkUpdateStatus(userIds, status) {
    const response = await fetch(`${API_URL}/users/bulk-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ userIds, status }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async bulkAssignRole(userIds, roleId) {
    const response = await fetch(`${API_URL}/users/bulk-role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ userIds, roleId }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getAllRoles() {
    const response = await fetch(`${API_URL}/roles`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },
};
