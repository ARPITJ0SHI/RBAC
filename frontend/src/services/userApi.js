const mockUsers = [
  {
    id: "u1",
    email: "admin@gmail.com",
    name: "Admin User",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-20T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u2",
    email: "manager@gmail.com",
    name: "Manager User",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-19T15:45:00Z",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "u3",
    email: "user@gmail.com",
    name: "Regular User",
    role: "user",
    status: "inactive",
    lastLogin: "2024-01-18T09:20:00Z",
    createdAt: "2024-01-03T00:00:00Z",
  },
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const userApi = {
  async getAllUsers() {
    await delay(300);
    return [...mockUsers];
  },

  async getUserById(id) {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    return { ...user };
  },

  async createUser(userData) {
    await delay(300);
    if (!userData.email || !userData.name || !userData.role) {
      throw new Error("Missing required fields");
    }

    const newUser = {
      id: `u${mockUsers.length + 1}`,
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: null,
      ...userData,
    };

    mockUsers.push(newUser);
    return { ...newUser };
  },

  async updateUser(id, updates) {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");

    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return { ...mockUsers[index] };
  },

  async deleteUser(id) {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");
    mockUsers.splice(index, 1);
    return { success: true };
  },

  async updateUserStatus(id, status) {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");

    mockUsers[index].status = status;
    mockUsers[index].updatedAt = new Date().toISOString();
    return { ...mockUsers[index] };
  },

  async assignRole(userId, roleId) {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    mockUsers[userIndex].role = roleId;
    mockUsers[userIndex].updatedAt = new Date().toISOString();
    return { ...mockUsers[userIndex] };
  },

  async bulkUpdateStatus(userIds, status) {
    await delay(500);
    userIds.forEach(id => {
      const user = mockUsers.find(u => u.id === id);
      if (user) {
        user.status = status;
        user.updatedAt = new Date().toISOString();
      }
    });
    return { success: true };
  },

  async bulkAssignRole(userIds, roleId) {
    await delay(500);
    userIds.forEach(id => {
      const user = mockUsers.find(u => u.id === id);
      if (user) {
        user.role = roleId;
        user.updatedAt = new Date().toISOString();
      }
    });
    return { success: true };
  },
};
