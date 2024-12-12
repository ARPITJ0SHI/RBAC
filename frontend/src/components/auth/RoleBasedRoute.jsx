import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  console.log('Current user:', user);
  console.log('Allowed roles:', allowedRoles);
  console.log('User role:', user?.role);

  if (!user || !allowedRoles.includes(user.role)) {
    // If user's role is not in the allowed roles, redirect to a restricted access page
    return <Navigate to="/restricted" />;
  }

  return children;
} 