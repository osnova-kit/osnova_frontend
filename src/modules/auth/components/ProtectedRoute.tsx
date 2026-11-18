import { Navigate } from 'react-router-dom';

import { type Area, landingPath } from '../areas';
import { useAuthStore } from '../authStore';
import { type Permission, can } from '../permissions';

interface Props {
  children: React.ReactNode;
  area?: Area;
  permission?: Permission;
}

const ProtectedRoute = ({ children, area, permission }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if ((area && !user.areas.includes(area)) || (permission && !can(user, permission))) {
    return <Navigate to={landingPath(user)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
