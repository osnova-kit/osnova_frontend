import { Suspense, lazy } from 'react';

const Bell = lazy(() => import('./Bell/Bell'));

export const NotificationBell = () => (
  <Suspense fallback={null}>
    <Bell />
  </Suspense>
);
