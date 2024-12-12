import { authApi } from './authApi';
import API_URL from '../config/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const permissionsApi = {
  async getAllPermissions() {
    const response = await fetch(`${API_URL}/permissions`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async getPermissionById(id) {
    const response = await fetch(`${API_URL}/permissions/${id}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async createPermission(permission) {
    const response = await fetch(`${API_URL}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify(permission),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async updatePermission(id, updates) {
    const response = await fetch(`${API_URL}/permissions/${id}`, {
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

  async deletePermission(id) {
    try {
      const response = await fetch(`${API_URL}/permissions/${id}`, {
        method: 'DELETE',
        headers: {
          ...authApi.getAuthHeader(),
        },
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw new Error(error.message || 'Failed to delete permission');
    }
  },

  async getPermissionsByCategory(category) {
    const response = await fetch(`${API_URL}/permissions/category/${category}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async bulkUpdatePermissions(permissions) {
    const response = await fetch(`${API_URL}/permissions/bulk-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ permissions }),
    });
    const data = await handleResponse(response);
    return data.data;
  },
}; 