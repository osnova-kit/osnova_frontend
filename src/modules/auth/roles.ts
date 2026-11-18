import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const SYSTEM_ROLES = ['root', 'moderator', 'user'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export function isSystemRole(role: string): role is SystemRole {
  return (SYSTEM_ROLES as readonly string[]).includes(role);
}

export function useRoleLabel(): (role: string) => string {
  const { t } = useTranslation('auth');
  return useCallback((role) => (isSystemRole(role) ? t(`roles.${role}`) : role), [t]);
}
