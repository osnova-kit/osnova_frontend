import type * as notifications from '.';
import type * as off from '../off';
import type { Fits } from '../offCheck';

export const fitsOff: [Fits<typeof notifications.NotificationBell, typeof off.NotificationBell>] = [
  true,
];
