import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Layout from './components/layout/Layout';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import RoleList from './components/roles/RoleList';
import RoleForm from './components/roles/RoleForm';
import PermissionList from './components/permissions/PermissionList';
import LoginPage from './components/auth/LoginPage';
import SessionWarning from './components/auth/SessionWarning';
import RestrictedAccess from './components/auth/RestrictedAccess';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import Dashboard from './components/dashboard/Dashboard';
import { RBACProvider } from './contexts/RBACContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PermissionsPage from './components/permissions/PermissionsPage';
import UserManagement from './components/users/UserManagement';
import RoleManagement from './components/roles/RoleManagement';


const ADMIN_ROUTES = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/users', element: <UserManagement /> },
  { path: '/roles', element: <RoleManagement /> },
  { path: '/permissions', element: <PermissionsPage /> },
];

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; 
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AuthenticatedApp() {
  const { user } = useAuth();
  
 
  if (user?.role !== 'admin') {
    return <Navigate to="/restricted" />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Admin Routes */}
        {ADMIN_ROUTES.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                {route.element}
              </RoleBasedRoute>
            }
          />
        ))}

        <Route path="/restricted" element={<RestrictedAccess />} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <SessionWarning />
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <RBACProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <AuthenticatedApp />
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </RBACProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;