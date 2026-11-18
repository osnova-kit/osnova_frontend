import type * as admin from '.';
import type * as off from '../off';
import type { Fits } from '../offCheck';

export const fitsOff: [Fits<typeof admin.adminRoute, typeof off.adminRoute>] = [true];
