const baseRoles = [
  {
    name: 'admin',
    description: 'Super administrator with full system access',
    level: 0,
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'role.create', 'role.read', 'role.update', 'role.delete',
      'permission.create', 'permission.read', 'permission.update', 'permission.delete',
      'session.read', 'session.delete',
      'activity.read', 'activity.delete',
      'system.settings', 'system.backup', 'system.metrics',
    ],
  },
  {
    name: 'manager',
    description: 'Manager with user and role management capabilities',
    level: 1,
    permissions: [
      'user.create', 'user.read', 'user.update',
      'role.read',
      'permission.read',
      'session.read',
      'activity.read',
      'system.metrics',
    ],
  },
  {
    name: 'user',
    description: 'Regular user with basic access',
    level: 2,
    permissions: [
      'user.read',
      'role.read',
      'session.read',
      'activity.read',
    ],
  },
  {
    name: 'guest',
    description: 'Guest user with minimal access',
    level: 3,
    permissions: [
      'user.read',
      'role.read',
    ],
  },
];

module.exports = baseRoles; 