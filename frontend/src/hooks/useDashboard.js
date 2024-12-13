import { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '../contexts/RBACContext';
import { activityApi } from '../services/activityApi';
import { sessionApi } from '../services/sessionApi';
import { roleApi } from '../services/roleApi';
import { permissionsApi } from '../services/permissionsApi';
import { userApi } from '../services/userApi';

export function useDashboard() {
  const { state } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activityStats: null,
    sessionStats: null,
    recentActivities: [],
  });
  const [lastFetched, setLastFetched] = useState(null);

  const CACHE_DURATION = 2 * 60 * 1000;

  const fetchDashboardData = useCallback(async (forceFetch = false) => {
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return dashboardData;
    }

    try {
      setLoading(true);
      setError(null);

      
      const [
        activityStatsResponse, 
        sessionStatsResponse, 
        recentActivitiesResponse, 
        roles, 
        permissions,
        users
      ] = await Promise.all([
        activityApi.getActivityStats(),
        sessionApi.getSessionStats(),
        activityApi.getActivities({ limit: 10, page: 1 }),
        roleApi.getAllRoles(),
        permissionsApi.getAllPermissions(),
        userApi.getAllUsers()
      ]);

      const newDashboardData = {
        activityStats: {
          roleCount: roles?.length || 0,
          permissionCount: permissions?.length || 0,
        },
        sessionStats: {
          activeUsers: users?.filter(u => u.status === 'active')?.length || 0,
          totalUsers: users?.length || 0,
        },
        recentActivities: recentActivitiesResponse?.data || [],
      };

      setDashboardData(newDashboardData);
      setLastFetched(Date.now());
      return newDashboardData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastFetched, dashboardData]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    ...dashboardData,
    refetch: (forceFetch = true) => fetchDashboardData(forceFetch),
  };
} 