// Mock roles data with permission mapping
const mockRoles = [
  {
    id: 'r1',
    name: 'Super Admin',
    description: 'Full system access',
    permissions: ['p1', 'p2', 'p3', 'p4'],
    inheritsFrom: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    name: 'Manager',
    description: 'Department management access',
    permissions: ['p1', 'p3'],
    inheritsFrom: null,
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'r3',
    name: 'Team Lead',
    description: 'Team management access',
    permissions: ['p1'],
    inheritsFrom: 'r2', // Inherits from Manager
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get inherited permissions with cycle detection
const getInheritedPermissions = (roleId, visited = new Set()) => {
  // If we've seen this role before, we have a cycle
  if (visited.has(roleId)) {
    return [];
  }

  const role = mockRoles.find(r => r.id === roleId);
  if (!role) return [];

  // Add this role to visited set
  visited.add(roleId);

  let allPermissions = [...role.permissions];
  
  if (role.inheritsFrom) {
    const parentPermissions = getInheritedPermissions(role.inheritsFrom, visited);
    allPermissions = [...new Set([...allPermissions, ...parentPermissions])];
  }

  // Remove this role from visited set before returning
  visited.delete(roleId);

  return allPermissions;
};

export const roleApi = {
  async getAllRoles() {
    await delay(300);
    return mockRoles.map(role => ({
      ...role,
      effectivePermissions: getInheritedPermissions(role.id),
    }));
  },

  async getRoleById(id) {
    await delay(300);
    const role = mockRoles.find(r => r.id === id);
    if (!role) throw new Error('Role not found');
    
    return {
      ...role,
      effectivePermissions: getInheritedPermissions(role.id),
    };
  },

  async createRole(roleData) {
    await delay(300);
    if (!roleData.name) throw new Error('Role name is required');

    const newRole = {
      id: `r${mockRoles.length + 1}`,
      permissions: [],
      inheritsFrom: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...roleData,
    };

    // Check for circular inheritance
    if (newRole.inheritsFrom) {
      const visited = new Set([newRole.id]);
      let currentParent = newRole.inheritsFrom;
      
      while (currentParent) {
        if (visited.has(currentParent)) {
          throw new Error('Circular inheritance detected');
        }
        visited.add(currentParent);
        const parent = mockRoles.find(r => r.id === currentParent);
        currentParent = parent?.inheritsFrom;
      }
    }

    mockRoles.push(newRole);
    return {
      ...newRole,
      effectivePermissions: getInheritedPermissions(newRole.id),
    };
  },

  async updateRole(id, updates) {
    await delay(300);
    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');

    // Check for circular inheritance
    if (updates.inheritsFrom) {
      const visited = new Set([id]);
      let currentParent = updates.inheritsFrom;
      
      while (currentParent) {
        if (visited.has(currentParent)) {
          throw new Error('Circular inheritance detected');
        }
        visited.add(currentParent);
        const parent = mockRoles.find(r => r.id === currentParent);
        currentParent = parent?.inheritsFrom;
      }
    }

    mockRoles[index] = {
      ...mockRoles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...mockRoles[index],
      effectivePermissions: getInheritedPermissions(id),
    };
  },

  async deleteRole(id) {
    await delay(300);
    // Check if any roles inherit from this one
    const hasInheritors = mockRoles.some(r => r.inheritsFrom === id);
    if (hasInheritors) {
      throw new Error('Cannot delete role: other roles inherit from it');
    }

    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');

    mockRoles.splice(index, 1);
    return { success: true };
  },

  async assignPermissions(roleId, permissions) {
    await delay(300);
    const index = mockRoles.findIndex(r => r.id === roleId);
    if (index === -1) throw new Error('Role not found');

    mockRoles[index].permissions = [...permissions];
    mockRoles[index].updatedAt = new Date().toISOString();

    return {
      ...mockRoles[index],
      effectivePermissions: getInheritedPermissions(roleId),
    };
  },

  async setInheritance(roleId, parentRoleId) {
    await delay(300);
    const index = mockRoles.findIndex(r => r.id === roleId);
    if (index === -1) throw new Error('Role not found');

    if (parentRoleId) {
      const parentExists = mockRoles.some(r => r.id === parentRoleId);
      if (!parentExists) throw new Error('Parent role not found');

      // Check for circular inheritance
      const visited = new Set([roleId]);
      let currentParent = parentRoleId;
      
      while (currentParent) {
        if (visited.has(currentParent)) {
          throw new Error('Circular inheritance detected');
        }
        visited.add(currentParent);
        const parent = mockRoles.find(r => r.id === currentParent);
        currentParent = parent?.inheritsFrom;
      }
    }

    mockRoles[index].inheritsFrom = parentRoleId;
    mockRoles[index].updatedAt = new Date().toISOString();

    return {
      ...mockRoles[index],
      effectivePermissions: getInheritedPermissions(roleId),
    };
  },

  async getRoleHierarchy() {
    await delay(300);
    const buildHierarchy = (parentId = null, visited = new Set()) => {
      // If we've seen this parent before, we have a cycle
      if (visited.has(parentId)) {
        return [];
      }

      // Add this parent to visited set
      if (parentId) visited.add(parentId);

      const children = mockRoles
        .filter(role => role.inheritsFrom === parentId)
        .map(role => ({
          ...role,
          effectivePermissions: getInheritedPermissions(role.id),
          children: buildHierarchy(role.id, new Set(visited)),
        }));

      // Remove this parent from visited set before returning
      if (parentId) visited.delete(parentId);

      return children;
    };

    return buildHierarchy(null);
  },

  async cloneRole(roleId) {
    await delay(300);
    const sourceRole = mockRoles.find(r => r.id === roleId);
    if (!sourceRole) throw new Error('Source role not found');

    const newRole = {
      ...sourceRole,
      id: `r${mockRoles.length + 1}`,
      name: `${sourceRole.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockRoles.push(newRole);
    return {
      ...newRole,
      effectivePermissions: getInheritedPermissions(newRole.id),
    };
  },
}; 