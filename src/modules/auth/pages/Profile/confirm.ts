import type { AccountDelete } from '../../../../api/generated';

/** What confirms an account deletion: the password, or the email of an account without one. */
export function deleteConfirmation(typed: string, hasPassword: boolean): AccountDelete {
  return hasPassword ? { password: typed } : { email: typed };
}
