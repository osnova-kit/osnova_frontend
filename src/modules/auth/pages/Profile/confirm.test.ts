import { describe, expect, it } from 'vitest';

import { deleteConfirmation } from './confirm';

describe('deleteConfirmation', () => {
  it('sends the password of an account that has one', () => {
    expect(deleteConfirmation('ann@example.com', true)).toEqual({ password: 'ann@example.com' });
  });

  it('sends the email of an account without a password', () => {
    expect(deleteConfirmation('ann@example.com', false)).toEqual({ email: 'ann@example.com' });
  });
});
