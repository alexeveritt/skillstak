import { test, expect } from '@playwright/test';
import { signup, login, createTestUser, logout } from './helpers/auth';

test.describe('Home Page - Authenticated User Flow', () => {
  let testUser: { email: string; password: string };

  test.beforeAll(() => {
    testUser = createTestUser();
  });

  test('should complete full user journey from signup to project creation', async ({ page }) => {
    // 1. Sign up a new user
    await signup(page, testUser.email, testUser.password);

    // 2. Should see welcome screen for new user
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByText(/smart learning/i)).toBeVisible();

    // 3. Click create first pack button
    await page.getByRole('button', { name: /create first pack/i }).click();

    // 4. Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();

    // 5. Enter project name
    const projectName = 'My First Project';
    await page.getByPlaceholder(/spanish verbs|javascript basics/i).fill(projectName);

    // 6. Submit form
    await page.getByRole('button', { name: /^create$/i }).click();

    // 7. Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // 8. Should see the new project
    await expect(page.getByText(projectName)).toBeVisible();
    await expect(page.getByText(/no cards yet/i)).toBeVisible();
  });

  test('should show validation - create button disabled when name is empty', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Open create dialog
    await page.getByRole('button', { name: /create/i }).first().click();

    // Create button should be disabled
    const createButton = page.getByRole('button', { name: /^create$/i });
    await expect(createButton).toBeDisabled();

    // Type a name
    await page.getByPlaceholder(/spanish verbs|javascript basics/i).fill('Test');

    // Now it should be enabled
    await expect(createButton).toBeEnabled();
  });

  test('should cancel project creation dialog', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Open create dialog
    await page.getByRole('button', { name: /create/i }).first().click();

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate to project when clicked', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Click on a project card
    const projectLink = page.locator('a[href^="/p/"]').first();
    await projectLink.click();

    // Should navigate to project page (either /p/:id or /p/:id/edit)
    await expect(page).toHaveURL(/\/p\/[a-zA-Z0-9-_]+/);
  });

  test('should display header with user menu', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Header should be visible
    await expect(page.locator('header')).toBeVisible();

    // User email or menu should be visible
    await expect(page.getByText(testUser.email)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Logout
    await logout(page);

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Home Page - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should not allow direct access to home without auth', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/login/);

    // Verify we're on login page
    await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible();
  });
});

