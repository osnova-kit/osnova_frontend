import { expect, test } from '@playwright/test';

import { unique } from './root';

test('the home page switches the language', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('heading', { name: 'Osnova', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Language' }).click();
  await page.getByRole('menuitem', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.getByRole('menuitem', { name: 'Главная' })).toBeVisible();
});

test('the contact form checks the fields and sends', async ({ page }) => {
  await page.goto('/en/examples/contact');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('This field is required.').first()).toBeVisible();

  await page.getByLabel('Name').fill('E2E visitor');
  await page.getByLabel('Email').fill('visitor@example.com');
  await page.getByLabel('Message').fill(unique('A question from the end-to-end test'));
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('button', { name: 'Send another' })).toBeVisible();
});
