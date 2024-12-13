import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    mfaRequired: false,
    mfaSessionId: null,
    userId: null,
    showSessionWarning: false,
    sessionExpiry: null,
  });

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await authApi.refreshToken();
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        const decoded = jwtDecode(response.token);
        setState(prev => ({
          ...prev,
          user: response.user,
          showSessionWarning: false,
          sessionExpiry: decoded.exp * 1000,
          isAuthenticated: true,
          loading: false,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        loading: false,
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          const refreshSuccess = await refreshSession();
          if (!refreshSuccess) {
            setState(prev => ({
              ...prev,
              isAuthenticated: false,
              loading: false,
            }));
          }
        } else {
          try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const data = await response.json();
            
            if (response.ok && data.user) {
              setState(prev => ({
                ...prev,
                user: data.user,
                isAuthenticated: true,
                loading: false,
                sessionExpiry: decoded.exp * 1000,
              }));
            } else {
              throw new Error('Failed to load user data');
            }
          } catch (error) {
            console.error('Error loading user data:', error);
            const refreshSuccess = await refreshSession();
            if (!refreshSuccess) {
              setState(prev => ({
                ...prev,
                isAuthenticated: false,
                loading: false,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
        }));
      }
    };

    initializeAuth();
  }, [refreshSession]);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const warningTime = 5 * 60 * 1000; 
      const timeUntilExpiry = expiryTime - Date.now();

      if (timeUntilExpiry <= 0) {
        const refreshSuccess = await refreshSession();
        if (!refreshSuccess) {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            showSessionWarning: false,
            sessionExpiry: null,
          }));
        }
      } else if (timeUntilExpiry <= warningTime) {
        setState(prev => ({
          ...prev,
          showSessionWarning: true,
          sessionExpiry: expiryTime,
        }));
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await refreshSession();
    }
  }, [refreshSession]);

  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(checkSession, 60000);
      checkSession();
      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, checkSession]);

  const login = async (credentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authApi.login(credentials);
      
      if (response.requireMFA) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          mfaRequired: true,
          mfaSessionId: response.sessionId,
          userId: response.userId,
        }));
        return { requireMFA: true };
      }

      if (response.success) {
        const decoded = jwtDecode(response.token);
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
          mfaRequired: false,
          mfaSessionId: null,
          userId: null,
          sessionExpiry: decoded.exp * 1000,
        }));
        return { success: true };
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid credentials',
      }));
      return { success: false };
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Invalid email or password',
      }));
      return { success: false };
    }
  };

  const verifyMFA = async (code) => {
    if (!state.mfaSessionId || !state.userId) {
      setState(prev => ({
        ...prev,
        error: 'Invalid MFA session',
      }));
      return { success: false };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authApi.verifyMFA(code, state.mfaSessionId, state.userId);
      if (response.success && response.token) {
        const decoded = jwtDecode(response.token);
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
          mfaRequired: false,
          mfaSessionId: null,
          userId: null,
          sessionExpiry: decoded.exp * 1000,
        }));
        return { success: true };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: response.error || 'Invalid verification code',
      }));
      return { success: false };
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Invalid verification code',
      }));
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        mfaRequired: false,
        mfaSessionId: null,
        userId: null,
        showSessionWarning: false,
        sessionExpiry: null,
      });
    }
  };

  const value = {
    ...state,
    login,
    logout,
    verifyMFA,
    clearError,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth }; 