import { useState, useEffect } from 'react';
import { useRBAC } from '../contexts/RBACContext';
import { roleApi } from '../services/roleApi';

export function useRoles() {
  const { state, actions } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const roles = await roleApi.getRoles();
      roles.forEach(role => actions.addRole(role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData) => {
    try {
      setLoading(true);
      setError(null);
      const newRole = await roleApi.createRole(roleData);
      actions.addRole(newRole);
      return newRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, roleData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRole = await roleApi.updateRole(id, roleData);
      actions.updateRole(updatedRole);
      return updatedRole;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await roleApi.deleteRole(id);
      actions.deleteRole(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles: state.roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles,
  };
} 