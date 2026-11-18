import { expect, test } from '@playwright/test';

import { root, unique } from './root';

test.use({ storageState: root.state });

test('a form sent by a visitor is a lead in the admin', async ({ page }) => {
  const message = unique('Please call me back');
  await page.goto('/en/examples/contact');
  await page.getByLabel('Name').fill('E2E lead');
  await page.getByLabel('Email').fill('lead@example.com');
  await page.getByLabel('Message').fill(message);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('button', { name: 'Send another' })).toBeVisible();

  await page.goto('/en/admin/leads');
  await page.getByPlaceholder('Search in submissions').fill(message);
  await page.getByPlaceholder('Search in submissions').press('Enter');
  const row = page.getByRole('row').filter({ hasText: 'E2E lead' });
  await expect(row).toHaveCount(1);
  await expect(row.getByText('New')).toBeVisible();
});

test('the users page lists the root', async ({ page }) => {
  await page.goto('/en/admin/users');
  const row = page.getByRole('row').filter({ hasText: root.email });
  await expect(row.getByText('Root', { exact: true })).toBeVisible();
  await expect(row.getByText('Active')).toBeVisible();
});

test('a role is created with a permission and deleted', async ({ page }) => {
  const name = unique('E2E role');
  await page.goto('/en/admin/roles');
  await page.getByRole('button', { name: 'New role' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill(name);
  const permission = dialog.getByRole('checkbox', { name: 'View the audit log' });
  await permission.click();
  await expect(permission).toBeChecked();
  await dialog.getByRole('button', { name: 'Save' }).click();

  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('tooltip').getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('a site setting is saved and shows on the site', async ({ page }) => {
  const name = unique('E2E site');
  await page.goto('/en/admin/settings/site');
  const field = page.getByLabel('Name');
  const before = await field.inputValue();

  await field.fill(name);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue(name);
  await expect(page.getByRole('banner').getByText(name)).toBeVisible();

  await page.getByLabel('Name').fill(before);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved')).toBeVisible();
});
