
const mockActivityLogs = [
  {
    id: 'a1',
    userId: 'u1',
    action: 'LOGIN',
    details: 'User logged in successfully',
    timestamp: '2024-01-20T10:30:00Z',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activityApi = {
  async logActivity(userId, action, details = '') {
    await delay(300);
    const newLog = {
      id: `a${mockActivityLogs.length + 1}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1', // In a real app, this would come from the request
      userAgent: navigator.userAgent,
    };

    mockActivityLogs.push(newLog);
    return { ...newLog };
  },

  async getUserActivities(userId, options = {}) {
    await delay(300);
    let activities = mockActivityLogs.filter(log => log.userId === userId);

    // Apply filters
    if (options.action) {
      activities = activities.filter(log => log.action === options.action);
    }
    if (options.startDate) {
      activities = activities.filter(log => new Date(log.timestamp) >= new Date(options.startDate));
    }
    if (options.endDate) {
      activities = activities.filter(log => new Date(log.timestamp) <= new Date(options.endDate));
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      activities: activities.slice(start, end),
      total: activities.length,
      page,
      totalPages: Math.ceil(activities.length / limit),
    };
  },

  async getSystemActivities(options = {}) {
    await delay(300);
    let activities = [...mockActivityLogs];

    // Apply filters
    if (options.userId) {
      activities = activities.filter(log => log.userId === options.userId);
    }
    if (options.action) {
      activities = activities.filter(log => log.action === options.action);
    }
    if (options.startDate) {
      activities = activities.filter(log => new Date(log.timestamp) >= new Date(options.startDate));
    }
    if (options.endDate) {
      activities = activities.filter(log => new Date(log.timestamp) <= new Date(options.endDate));
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      activities: activities.slice(start, end),
      total: activities.length,
      page,
      totalPages: Math.ceil(activities.length / limit),
    };
  },

  // Activity types for consistent logging
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