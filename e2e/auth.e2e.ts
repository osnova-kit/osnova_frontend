import { expect, test } from '@playwright/test';

import { root } from './root';

test('a wrong password is refused', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email').fill(root.email);
  await page.getByLabel('Password').fill(`${root.password}-wrong`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/en\/login$/);
});

test('the signed-in root opens the profile and signs out', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email').fill(root.email);
  await page.getByLabel('Password').fill(root.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/en\/admin$/);

  await page.goto('/en/profile');
  await expect(page.getByText(root.email).first()).toBeVisible();

  await page.getByRole('button', { name: 'Open profile menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.goto('/en/admin');
  await expect(page).toHaveURL(/\/en\/login/);
});
