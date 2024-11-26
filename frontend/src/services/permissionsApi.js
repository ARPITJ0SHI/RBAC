// Mock permissions data
const mockPermissions = [
  {
    id: 'p1',
    name: 'user.read',
    description: 'Read user information',
    category: 'User Management',
    isActive: true,
  },
  {
    id: 'p2',
    name: 'user.write',
    description: 'Create and update user information',
    category: 'User Management',
    isActive: true,
  },
  {
    id: 'p3',
    name: 'role.read',
    description: 'View role information',
    category: 'Role Management',
    isActive: true,
  },
  {
    id: 'p4',
    name: 'role.write',
    description: 'Create and update roles',
    category: 'Role Management',
    isActive: true,
  },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const permissionsApi = {
  async getAllPermissions() {
    await delay(300);
    return [...mockPermissions];
  },

  async getPermissionById(id) {
    await delay(300);
    const permission = mockPermissions.find(p => p.id === id);
    if (!permission) throw new Error('Permission not found');
    return { ...permission };
  },

  async updatePermission(id, updates) {
    await delay(300);
    const index = mockPermissions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Permission not found');
    
    mockPermissions[index] = {
      ...mockPermissions[index],
      ...updates,
    };
    return { ...mockPermissions[index] };
  },

  async createPermission(permission) {
    await delay(300);
    const newPermission = {
      id: `p${mockPermissions.length + 1}`,
      isActive: true,
      ...permission,
    };
    mockPermissions.push(newPermission);
    return { ...newPermission };
  },

  async deletePermission(id) {
    await delay(300);
    const index = mockPermissions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Permission not found');
    mockPermissions.splice(index, 1);
    return { success: true };
  },
}; 