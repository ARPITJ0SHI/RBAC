// Mock active sessions
const mockSessions = new Map();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Session configuration
const SESSION_CONFIG = {
  maxConcurrentSessions: 3,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  maxInactivityTime: 15 * 60 * 1000, // 15 minutes
};

export const sessionApi = {
  async createSession(userId) {
    await delay(300);
    
    // Clean up expired sessions
    this.cleanupExpiredSessions();

    // Get user's existing sessions
    const userSessions = Array.from(mockSessions.values())
      .filter(session => session.userId === userId);

    // Check concurrent session limit
    if (userSessions.length >= SESSION_CONFIG.maxConcurrentSessions) {
      // Remove oldest session
      const oldestSession = userSessions.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )[0];
      mockSessions.delete(oldestSession.id);
    }

    const session = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_CONFIG.sessionTimeout).toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: '192.168.1.1', // In a real app, this would come from the request
      isActive: true,
    };

    mockSessions.set(session.id, session);
    return { ...session };
  },

  async validateSession(sessionId) {
    await delay(300);
    const session = mockSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.isActive) {
      throw new Error('Session is inactive');
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const lastActivity = new Date(session.lastActivity);

    // Check if session has expired
    if (now > expiresAt) {
      session.isActive = false;
      throw new Error('Session has expired');
    }

    // Check inactivity timeout
    if (now - lastActivity > SESSION_CONFIG.maxInactivityTime) {
      session.isActive = false;
      throw new Error('Session timeout due to inactivity');
    }

    // Update last activity
    session.lastActivity = now.toISOString();

    // Check if session needs to be refreshed
    if (expiresAt - now <= SESSION_CONFIG.refreshThreshold) {
      session.expiresAt = new Date(now.getTime() + SESSION_CONFIG.sessionTimeout).toISOString();
    }

    return { ...session };
  },

  async endSession(sessionId) {
    await delay(300);
    const session = mockSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date().toISOString();
    }
    return { success: true };
  },

  async getUserSessions(userId) {
    await delay(300);
    return Array.from(mockSessions.values())
      .filter(session => session.userId === userId)
      .map(session => ({ ...session }));
  },

  async endAllUserSessions(userId, exceptSessionId = null) {
    await delay(300);
    let endedCount = 0;

    mockSessions.forEach((session, id) => {
      if (session.userId === userId && id !== exceptSessionId && session.isActive) {
        session.isActive = false;
        session.endedAt = new Date().toISOString();
        endedCount++;
      }
    });

    return { success: true, endedCount };
  },

  cleanupExpiredSessions() {
    const now = new Date();
    mockSessions.forEach((session, id) => {
      if (new Date(session.expiresAt) < now) {
        session.isActive = false;
        session.endedAt = now.toISOString();
      }
    });
  },

  // Session events that can be subscribed to
  EVENTS: {
    SESSION_CREATED: 'SESSION_CREATED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    SESSION_ENDED: 'SESSION_ENDED',
    SESSION_REFRESHED: 'SESSION_REFRESHED',
  },
}; 