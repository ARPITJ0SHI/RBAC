// Simulated delay to mimic API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data storage
let users = [];
let roles = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    id: "2",
    name: "Editor",
    description: "Can edit and manage content",
    permissions: ["read", "update"],
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access",
    permissions: ["read"],
  },
];

let permissions = [
  {
    id: "1",
    name: "create",
    description: "Create new items",
    category: "Content Management",
  },
  {
    id: "2",
    name: "read",
    description: "View items",
    category: "Content Management",
  },
  {
    id: "3",
    name: "update",
    description: "Modify existing items",
    category: "Content Management",
  },
  {
    id: "4",
    name: "delete",
    description: "Remove items",
    category: "Content Management",
  },
  {
    id: "5",
    name: "manage_users",
    description: "Manage user accounts",
    category: "User Management",
  },
  {
    id: "6",
    name: "manage_roles",
    description: "Manage roles and permissions",
    category: "Role Management",
  },
  {
    id: "7",
    name: "view_reports",
    description: "Access system reports",
    category: "Reporting",
  },
  {
    id: "8",
    name: "export_data",
    description: "Export system data",
    category: "Data Management",
  },
];

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Validate permissions
const validatePermissions = (permissionNames) => {
  const validPermissions = permissions.map((p) => p.name);
  const invalidPermissions = permissionNames.filter(
    (p) => !validPermissions.includes(p)
  );
  if (invalidPermissions.length > 0) {
    throw new Error(`Invalid permissions: ${invalidPermissions.join(", ")}`);
  }
  return true;
};

// Mock data
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    status: "active",
    mfaEnabled: true,
  },
];

// Store temporary session data
const tempSessionData = new Map();

export const authApi = {
  login: async (credentials) => {
    await delay(500);

    const user = mockUsers.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("Account is inactive");
    }

    // If MFA is enabled, create a session and return MFA requirement
    if (user.mfaEnabled) {
      const sessionId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
      tempSessionData.set(sessionId, {
        userId: user.id,
        timestamp: Date.now(),
      });

      console.log("Created MFA session:", sessionId); // Debug log
      return {
        requireMFA: true,
        sessionId,
      };
    }

    // If MFA is not enabled, return success with user data
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },

  verifyMFA: async (code, sessionId) => {
    await delay(500);

    console.log("Verifying MFA with session:", sessionId); // Debug log
    console.log("Active sessions:", Array.from(tempSessionData.keys())); // Debug log

    // Validate session
    const session = tempSessionData.get(sessionId);
    if (!session) {
      throw new Error("Invalid MFA session");
    }

    // Clean up expired sessions (15 minutes)
    const now = Date.now();
    for (const [key, data] of tempSessionData.entries()) {
      if (now - data.timestamp > 15 * 60 * 1000) {
        tempSessionData.delete(key);
      }
    }

    // Find user from session
    const user = mockUsers.find((u) => u.id === session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify MFA code (accept any 6-digit code for demo)
    if (!/^\d{6}$/.test(code)) {
      throw new Error("Invalid verification code format");
    }

    // Clean up the session after successful verification
    tempSessionData.delete(sessionId);
    console.log("MFA verification successful, session cleared"); // Debug log

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },

  logout: async () => {
    await delay(500);
    return { success: true };
  },

  // Add MFA management endpoints
  enableMFA: async (userId) => {
    await delay(500);
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      user.mfaEnabled = true;
      return {
        success: true,
        secret: user.mfaSecret, // In a real app, this would be newly generated
        qrCode: `otpauth://totp/RBAC:${user.email}?secret=${user.mfaSecret}&issuer=RBAC`,
      };
    }
    throw new Error("User not found");
  },

  disableMFA: async (userId, verificationCode) => {
    await delay(500);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify code before disabling
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      user.mfaEnabled = false;
      return { success: true };
    }
    throw new Error("Invalid verification code");
  },

  verifyMFASetup: async (userId, verificationCode) => {
    await delay(500);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    // For demo, accept any 6-digit code
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      return { success: true };
    }
    throw new Error("Invalid verification code");
  },
};

// User API
export const userApi = {
  async getUsers() {
    await delay(500);
    return [...users];
  },

  async getUserById(id) {
    await delay(300);
    return users.find((user) => user.id === id);
  },

  async createUser(userData) {
    await delay(500);
    // Validate roles
    if (userData.roles) {
      const validRoles = roles.map((r) => r.name);
      const invalidRoles = userData.roles.filter(
        (r) => !validRoles.includes(r)
      );
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
      }
    }

    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      status: userData.status || "Active",
    };
    users.push(newUser);
    return newUser;
  },

  async updateUser(id, userData) {
    await delay(500);
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");

    // Validate roles
    if (userData.roles) {
      const validRoles = roles.map((r) => r.name);
      const invalidRoles = userData.roles.filter(
        (r) => !validRoles.includes(r)
      );
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
      }
    }

    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updatedUser;
    return updatedUser;
  },

  async deleteUser(id) {
    await delay(500);
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");
    users = users.filter((user) => user.id !== id);
    return true;
  },
};

// Role API
export const roleApi = {
  async getRoles() {
    await delay(500);
    return [...roles];
  },

  async getRoleById(id) {
    await delay(300);
    return roles.find((role) => role.id === id);
  },

  async createRole(roleData) {
    await delay(500);
    // Validate permissions
    if (roleData.permissions) {
      validatePermissions(roleData.permissions);
    }

    const newRole = {
      id: generateId(),
      ...roleData,
      createdAt: new Date().toISOString(),
    };
    roles.push(newRole);
    return newRole;
  },

  async updateRole(id, roleData) {
    await delay(500);
    const index = roles.findIndex((role) => role.id === id);
    if (index === -1) throw new Error("Role not found");

    // Validate permissions
    if (roleData.permissions) {
      validatePermissions(roleData.permissions);
    }

    const updatedRole = {
      ...roles[index],
      ...roleData,
      updatedAt: new Date().toISOString(),
    };
    roles[index] = updatedRole;
    return updatedRole;
  },

  async deleteRole(id) {
    await delay(500);
    const index = roles.findIndex((role) => role.id === id);
    if (index === -1) throw new Error("Role not found");

    // Check if any users are using this role
    const usersWithRole = users.filter(
      (user) => user.roles && user.roles.includes(roles[index].name)
    );

    if (usersWithRole.length > 0) {
      throw new Error(
        `Cannot delete role: It is assigned to ${usersWithRole.length} user(s)`
      );
    }

    roles = roles.filter((role) => role.id !== id);
    return true;
  },
};

// Permission API
export const permissionApi = {
  async getPermissions() {
    await delay(500);
    return [...permissions];
  },

  async getPermissionById(id) {
    await delay(300);
    return permissions.find((permission) => permission.id === id);
  },

  async getPermissionsByCategory() {
    await delay(500);
    const categories = {};
    permissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  },
};
