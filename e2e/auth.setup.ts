import { expect, test as setup } from '@playwright/test';

import { root } from './root';

setup('root signs in and lands in the admin', async ({ page }) => {
  expect(root.email, 'set E2E_EMAIL and E2E_PASSWORD').not.toBe('');
  await page.goto('/en/login');
  await page.getByLabel('Email').fill(root.email);
  await page.getByLabel('Password').fill(root.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/en\/admin$/);
  await page.context().storageState({ path: root.state });
});
