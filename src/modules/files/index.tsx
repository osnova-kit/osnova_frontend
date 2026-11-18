import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import { ProtectedRoute } from '../auth';

export const filesRoutes: RouteObject[] = [
  {
    path: 'files',
    element: (
      <ProtectedRoute area="user">
        {lazyElement(() => import('./pages/MyFiles/MyFiles'))}
      </ProtectedRoute>
    ),
  },
];
