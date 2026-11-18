import type { Area } from '../../api/generated';

export type { Area };

/**
 * Start page of each area. The backend lists a user's areas; the first is the landing one.
 * The user area starts on the site's home page: add its pages to the main menu.
 */
export const AREA_HOME: Record<Area, string> = {
  admin: '/admin',
  user: '/',
};

export function landingPath(user: { areas: Area[] } | null): string {
  const area = user?.areas[0];
  return area ? AREA_HOME[area] : '/';
}

export function areaOfPath(pathname: string): Area {
  return pathname === AREA_HOME.admin || pathname.startsWith(`${AREA_HOME.admin}/`)
    ? 'admin'
    : 'user';
}

export function otherArea(pathname: string, areas: Area[]): Area | undefined {
  const current = areaOfPath(pathname);
  return areas.find((area) => area !== current);
}
