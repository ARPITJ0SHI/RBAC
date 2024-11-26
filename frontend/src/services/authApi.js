const mockUsers = [
  {
    id: "1",
    email: "admin@gmail.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    mfaEnabled: true,
  },
];

const tempSessionData = new Map();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SESSION_CONFIG = {
  maxConcurrentSessions: 3,
  sessionTimeout: 30 * 60 * 1000,
  refreshThreshold: 5 * 60 * 1000,
  maxInactivityTime: 15 * 60 * 1000,
};

export const authApi = {
  async login(credentials) {
    await delay(500);
    const user = mockUsers.find((u) => u.email === credentials.email);

    if (!user || user.password !== credentials.password) {
      throw new Error("Invalid email or password");
    }

    if (user.mfaEnabled) {
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      tempSessionData.set(sessionId, {
        userId: user.id,
        timestamp: Date.now(),
      });

      return { requireMFA: true, sessionId };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  async verifyMFA(code, sessionId) {
    await delay(500);
    const session = tempSessionData.get(sessionId);
    
    if (!session) throw new Error("Invalid MFA session");
    const user = mockUsers.find((u) => u.id === session.userId);
    if (!user) throw new Error("User not found");
    if (!/^\d{6}$/.test(code)) throw new Error("Invalid verification code format");

    tempSessionData.delete(sessionId);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  async logout() {
    await delay(500);
    return { success: true };
  },
};
