import { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '../contexts/RBACContext';
import { roleApi } from '../services/roleApi';

export function useRoles() {
  const { state, actions } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchRoles = useCallback(async (forceFetch = false) => {
    // Return cached data if within cache duration
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return state.roles;
    }

    try {
      setLoading(true);
      setError(null);
      const roles = await roleApi.getAllRoles();
      actions.setRoles(roles);
      setLastFetched(Date.now());
      return roles;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastFetched, state.roles, actions]);

  const createRole = async (roleData) => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticRole = { ...roleData, id: tempId, status: 'pending' };
      actions.addRole(optimisticRole);

      const newRole = await roleApi.createRole(roleData);
      actions.updateRole(newRole); // Replace optimistic with real data
      return newRole;
    } catch (err) {
      // Rollback optimistic update
      actions.deleteRole(tempId);
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

      // Optimistic update
      const oldRole = state.roles.find(r => r.id === id);
      actions.updateRole({ ...oldRole, ...roleData, status: 'updating' });

      const updatedRole = await roleApi.updateRole(id, roleData);
      actions.updateRole(updatedRole);
      return updatedRole;
    } catch (err) {
      // Rollback optimistic update
      if (oldRole) actions.updateRole(oldRole);
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

      // Optimistic update
      const roleToDelete = state.roles.find(r => r.id === id);
      actions.deleteRole(id);

      await roleApi.deleteRole(id);
    } catch (err) {
      // Rollback optimistic update
      if (roleToDelete) actions.addRole(roleToDelete);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles: state.roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refetch: (forceFetch = true) => fetchRoles(forceFetch),
  };
} 