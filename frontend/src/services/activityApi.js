import { authApi } from './authApi';
import API_URL from '../config/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const activityApi = {
  async getActivities(options = {}) {
    const queryParams = new URLSearchParams();
    if (options.userId) queryParams.append('userId', options.userId);
    if (options.action) queryParams.append('action', options.action);
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);

    const response = await fetch(`${API_URL}/activities?${queryParams}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data;
  },

  async getUserActivities(userId, options = {}) {
    const queryParams = new URLSearchParams();
    if (options.action) queryParams.append('action', options.action);
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);

    const response = await fetch(`${API_URL}/activities/user/${userId}?${queryParams}`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data;
  },

  async getActivityStats() {
    const response = await fetch(`${API_URL}/activities/stats`, {
      headers: {
        ...authApi.getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  },

  async deleteOldActivities(days) {
    const response = await fetch(`${API_URL}/activities/cleanup`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authApi.getAuthHeader(),
      },
      body: JSON.stringify({ days }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

 
  ACTIVITIES: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    PROFILE_UPDATE: 'PROFILE_UPDATE',
    ROLE_ASSIGNED: 'ROLE_ASSIGNED',
    PERMISSION_GRANTED: 'PERMISSION_GRANTED',
    PERMISSION_REVOKED: 'PERMISSION_REVOKED',
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    ROLE_CREATED: 'ROLE_CREATED',
    ROLE_UPDATED: 'ROLE_UPDATED',
    ROLE_DELETED: 'ROLE_DELETED',
  },
}; 