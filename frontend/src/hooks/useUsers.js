import { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '../contexts/RBACContext';
import { userApi } from '../services/userApi';

export function useUsers() {
  const { state, actions } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);


  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchUsers = useCallback(async (forceFetch = false) => {
  
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return state.users;
    }

    try {
      setLoading(true);
      setError(null);
      const users = await userApi.getAllUsers();
      actions.setUsers(users);
      setLastFetched(Date.now());
      return users;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastFetched, state.users, actions]);

  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
     
      const tempId = Date.now().toString();
      const optimisticUser = { ...userData, id: tempId, status: 'pending' };
      actions.addUser(optimisticUser);

      const newUser = await userApi.createUser(userData);
      actions.updateUser(newUser); 
      return newUser;
    } catch (err) {

      actions.deleteUser(tempId);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      setError(null);

  
      const oldUser = state.users.find(u => u.id === id);
      actions.updateUser({ ...oldUser, ...userData, status: 'updating' });

      const updatedUser = await userApi.updateUser(id, userData);
      actions.updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
     
      if (oldUser) actions.updateUser(oldUser);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      setLoading(true);
      setError(null);

    
      const userToDelete = state.users.find(u => u.id === id);
      actions.deleteUser(id);

      await userApi.deleteUser(id);
    } catch (err) {
     
      if (userToDelete) actions.addUser(userToDelete);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: state.users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: (forceFetch = true) => fetchUsers(forceFetch),
  };
} 