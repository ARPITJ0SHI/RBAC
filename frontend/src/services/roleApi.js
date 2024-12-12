import { authApi } from './authApi';

const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const roleApi = {
  async getAllRoles() {
    const response = await fetch(`${API_URL}/roles`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getRoleById(id) {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async createRole(roleData) {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify(roleData),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async updateRole(id, updates) {
    const response = await fetch(`${API_URL}/roles/${id}`, {
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

  async deleteRole(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: {
          ...authApi.getAuthHeader(),
        },
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new Error(error.message || 'Failed to delete role');
    }
  },

  async getRoleHierarchy() {
    const response = await fetch(`${API_URL}/roles/hierarchy`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async cloneRole(id, newRoleData) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authApi.getAuthHeader(),
        },
        body: JSON.stringify(newRoleData),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error cloning role:', error);
      throw new Error(error.message || 'Failed to clone role');
    }
  },

  async getEffectivePermissions(id) {
    const response = await fetch(`${API_URL}/roles/${id}/effective-permissions`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },
}; 