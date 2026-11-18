import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import ProtectedRoute from './components/ProtectedRoute';
import { saveLanguageChoices } from './language';

export { default as ProtectedRoute } from './components/ProtectedRoute';
export { useAuthStore } from './authStore';
export { AREA_HOME, type Area, areaOfPath, landingPath, otherArea } from './areas';
export { type Permission, can, useCan } from './permissions';
export { SYSTEM_ROLES, type SystemRole, isSystemRole, useRoleLabel } from './roles';

const profileElement = lazyElement(() => import('./pages/Profile/Profile'));

saveLanguageChoices();

export const authPublicRoutes: RouteObject[] = [
  { path: '/login', element: lazyElement(() => import('./pages/Login/Login')) },
  {
    path: '/register',
    element: lazyElement(() => import('./pages/Register/Register')),
  },
  {
    path: '/verify-email',
    element: lazyElement(() => import('./pages/VerifyEmail/VerifyEmail')),
  },
  {
    path: '/forgot-password',
    element: lazyElement(() => import('./pages/ForgotPassword/ForgotPassword')),
  },
  {
    path: '/reset-password',
    element: lazyElement(() => import('./pages/ResetPassword/ResetPassword')),
  },
  {
    path: '/oauth/:provider/callback',
    element: lazyElement(() => import('./pages/OAuthCallback/OAuthCallback')),
  },
];

export const authLayoutRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProtectedRoute>{profileElement}</ProtectedRoute>,
  },
];
