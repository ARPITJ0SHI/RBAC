import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  users: [],
  roles: [],
  permissions: [],
};

// Action types
const ActionTypes = {
  SET_USERS: 'SET_USERS',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  SET_ROLES: 'SET_ROLES',
  ADD_ROLE: 'ADD_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  ADD_PERMISSION: 'ADD_PERMISSION',
  UPDATE_PERMISSION: 'UPDATE_PERMISSION',
  DELETE_PERMISSION: 'DELETE_PERMISSION',
};

// Reducer function
function rbacReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USERS:
      return { ...state, users: action.payload };
    case ActionTypes.ADD_USER:
      return { 
        ...state, 
        users: [...state.users.filter(user => user.id !== action.payload.id), action.payload] 
      };
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case ActionTypes.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case ActionTypes.SET_ROLES:
      return { ...state, roles: action.payload };
    case ActionTypes.ADD_ROLE:
      return { 
        ...state, 
        roles: [...state.roles.filter(role => role.id !== action.payload.id), action.payload] 
      };
    case ActionTypes.UPDATE_ROLE:
      return {
        ...state,
        roles: state.roles.map(role =>
          role.id === action.payload.id ? action.payload : role
        ),
      };
    case ActionTypes.DELETE_ROLE:
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.payload),
      };
    case ActionTypes.SET_PERMISSIONS:
      return { ...state, permissions: action.payload };
    case ActionTypes.ADD_PERMISSION:
      return { 
        ...state, 
        permissions: [...state.permissions.filter(permission => permission.id !== action.payload.id), action.payload] 
      };
    case ActionTypes.UPDATE_PERMISSION:
      return {
        ...state,
        permissions: state.permissions.map(permission =>
          permission.id === action.payload.id ? action.payload : permission
        ),
      };
    case ActionTypes.DELETE_PERMISSION:
      return {
        ...state,
        permissions: state.permissions.filter(
          permission => permission.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

// Create context
const RBACContext = createContext();

// Context provider component
export function RBACProvider({ children }) {
  const [state, dispatch] = useReducer(rbacReducer, initialState);

  const value = {
    state,
    dispatch,
    actions: {
      setUsers: (users) => dispatch({ type: ActionTypes.SET_USERS, payload: users }),
      addUser: (user) => dispatch({ type: ActionTypes.ADD_USER, payload: user }),
      updateUser: (user) => dispatch({ type: ActionTypes.UPDATE_USER, payload: user }),
      deleteUser: (id) => dispatch({ type: ActionTypes.DELETE_USER, payload: id }),
      setRoles: (roles) => dispatch({ type: ActionTypes.SET_ROLES, payload: roles }),
      addRole: (role) => dispatch({ type: ActionTypes.ADD_ROLE, payload: role }),
      updateRole: (role) => dispatch({ type: ActionTypes.UPDATE_ROLE, payload: role }),
      deleteRole: (id) => dispatch({ type: ActionTypes.DELETE_ROLE, payload: id }),
      setPermissions: (permissions) => dispatch({ type: ActionTypes.SET_PERMISSIONS, payload: permissions }),
      addPermission: (permission) => dispatch({ type: ActionTypes.ADD_PERMISSION, payload: permission }),
      updatePermission: (permission) => dispatch({ type: ActionTypes.UPDATE_PERMISSION, payload: permission }),
      deletePermission: (id) => dispatch({ type: ActionTypes.DELETE_PERMISSION, payload: id }),
    },
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

// Custom hook for using the RBAC context
export function useRBAC() {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}

export default RBACContext; 