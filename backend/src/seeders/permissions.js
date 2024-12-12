const basePermissions = [
  // User Management
  {
    name: 'user.create',
    description: 'Create new users',
    category: 'User Management',
  },
  {
    name: 'user.read',
    description: 'View user information',
    category: 'User Management',
  },
  {
    name: 'user.update',
    description: 'Update user information',
    category: 'User Management',
  },
  {
    name: 'user.delete',
    description: 'Delete users',
    category: 'User Management',
  },

  // Role Management
  {
    name: 'role.create',
    description: 'Create new roles',
    category: 'Role Management',
  },
  {
    name: 'role.read',
    description: 'View role information',
    category: 'Role Management',
  },
  {
    name: 'role.update',
    description: 'Update role information',
    category: 'Role Management',
  },
  {
    name: 'role.delete',
    description: 'Delete roles',
    category: 'Role Management',
  },

  // Permission Management
  {
    name: 'permission.create',
    description: 'Create new permissions',
    category: 'Permission Management',
  },
  {
    name: 'permission.read',
    description: 'View permission information',
    category: 'Permission Management',
  },
  {
    name: 'permission.update',
    description: 'Update permission information',
    category: 'Permission Management',
  },
  {
    name: 'permission.delete',
    description: 'Delete permissions',
    category: 'Permission Management',
  },

  // Session Management
  {
    name: 'session.read',
    description: 'View session information',
    category: 'System',
  },
  {
    name: 'session.delete',
    description: 'Terminate sessions',
    category: 'System',
  },

  // Activity Management
  {
    name: 'activity.read',
    description: 'View activity logs',
    category: 'System',
  },
  {
    name: 'activity.delete',
    description: 'Delete activity logs',
    category: 'System',
  },

  // System Management
  {
    name: 'system.settings',
    description: 'Manage system settings',
    category: 'System',
  },
  {
    name: 'system.backup',
    description: 'Manage system backups',
    category: 'System',
  },
  {
    name: 'system.metrics',
    description: 'View system metrics',
    category: 'System',
  },
];

module.exports = basePermissions; 