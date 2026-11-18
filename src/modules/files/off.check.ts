import type * as files from '.';
import type * as off from '../off';
import type { Fits } from '../offCheck';

export const fitsOff: [Fits<typeof files.filesRoutes, typeof off.filesRoutes>] = [true];
