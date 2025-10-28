import { test, expect } from '@playwright/test';

/**
 * Basic smoke test to verify Playwright is working correctly
 */
test.describe('Basic Setup', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/login');

    // Check that we can load a page
    await expect(page).toHaveURL(/\/login/);

    // Check for basic elements that should exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should have a working signup page', async ({ page }) => {
    await page.goto('/signup');

    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should redirect to login from root when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

