import { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '../contexts/RBACContext';
import { permissionsApi } from '../services/permissionsApi';

export function usePermissions() {
  const { state, actions } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [categoryCache, setCategoryCache] = useState({});
  const [lastCategoryFetch, setLastCategoryFetch] = useState({});

 
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchPermissions = useCallback(async (forceFetch = false) => {
  
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return state.permissions;
    }

    try {
      setLoading(true);
      setError(null);
      const permissions = await permissionsApi.getAllPermissions();
      actions.setPermissions(permissions);
      setLastFetched(Date.now());
      return permissions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastFetched, state.permissions, actions]);

  const fetchPermissionsByCategory = useCallback(async (category, forceFetch = false) => {
   
    if (
      !forceFetch &&
      lastCategoryFetch[category] &&
      Date.now() - lastCategoryFetch[category] < CACHE_DURATION
    ) {
      return categoryCache[category];
    }

    try {
      setLoading(true);
      setError(null);
      const permissions = await permissionsApi.getPermissionsByCategory(category);
      
      
      setCategoryCache(prev => ({
        ...prev,
        [category]: permissions
      }));
      setLastCategoryFetch(prev => ({
        ...prev,
        [category]: Date.now()
      }));

      return permissions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastCategoryFetch, categoryCache]);

  const createPermission = async (permissionData) => {
    try {
      setLoading(true);
      setError(null);

     
      const tempId = Date.now().toString();
      const optimisticPermission = { 
        ...permissionData, 
        id: tempId, 
        status: 'pending' 
      };
      actions.addPermission(optimisticPermission);

      const newPermission = await permissionsApi.createPermission(permissionData);
      actions.updatePermission(newPermission); 
      
      
      if (permissionData.category) {
        setLastCategoryFetch(prev => ({
          ...prev,
          [permissionData.category]: null
        }));
      }

      return newPermission;
    } catch (err) {
    
      actions.deletePermission(tempId);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id, permissionData) => {
    try {
      setLoading(true);
      setError(null);

      
      const oldPermission = state.permissions.find(p => p.id === id);
      actions.updatePermission({ 
        ...oldPermission, 
        ...permissionData, 
        status: 'updating' 
      });

      const updatedPermission = await permissionsApi.updatePermission(id, permissionData);
      actions.updatePermission(updatedPermission);

      
      if (oldPermission?.category !== permissionData.category) {
        setLastCategoryFetch(prev => ({
          ...prev,
          [oldPermission?.category]: null,
          [permissionData.category]: null
        }));
      }

      return updatedPermission;
    } catch (err) {
      
      if (oldPermission) actions.updatePermission(oldPermission);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (id) => {
    try {
      setLoading(true);
      setError(null);

    
      const permissionToDelete = state.permissions.find(p => p.id === id);
      actions.deletePermission(id);

      await permissionsApi.deletePermission(id);

     
      if (permissionToDelete?.category) {
        setLastCategoryFetch(prev => ({
          ...prev,
          [permissionToDelete.category]: null
        }));
      }
    } catch (err) {
      
      if (permissionToDelete) actions.addPermission(permissionToDelete);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions: state.permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    fetchPermissionsByCategory,
    refetch: (forceFetch = true) => fetchPermissions(forceFetch),
  };
} 