import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    mfaRequired: false,
    mfaSessionId: null,
  });

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

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
        }));
        return { requireMFA: true };
      }

      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
          mfaRequired: false,
          mfaSessionId: null,
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
    if (!state.mfaSessionId) {
      setState(prev => ({
        ...prev,
        error: 'Invalid MFA session',
      }));
      return { success: false };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authApi.verifyMFA(code, state.mfaSessionId);
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          loading: false,
          error: null,
          mfaRequired: false,
          mfaSessionId: null,
        }));
        return { success: true };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid verification code',
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
    setState(prev => ({ ...prev, loading: true }));
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        mfaRequired: false,
        mfaSessionId: null,
      });
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    mfaRequired: state.mfaRequired,
    mfaSessionId: state.mfaSessionId,
    login,
    logout,
    verifyMFA,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 