import type * as auth from '.';
import type * as off from '../off';
import type { Fits, StateOf } from '../offCheck';

export const fitsOff: [
  Fits<StateOf<typeof auth.useAuthStore>, StateOf<typeof off.useAuthStore>>,
  Fits<typeof auth.AREA_HOME, typeof off.AREA_HOME>,
  Fits<typeof auth.areaOfPath, typeof off.areaOfPath>,
  Fits<typeof auth.otherArea, typeof off.otherArea>,
  Fits<typeof auth.authPublicRoutes, typeof off.authPublicRoutes>,
  Fits<typeof auth.authLayoutRoutes, typeof off.authLayoutRoutes>,
] = [true, true, true, true, true, true];
