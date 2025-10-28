import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page - it will redirect to login if not authenticated
    await page.goto("/");
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display welcome screen for new users with no projects", async ({ page, context }) => {
    // For this test, you'll need to authenticate first
    // This is a placeholder - you'll need to implement authentication helper
    // await login(page, 'test@example.com', 'password');

    // TODO: Implement authentication flow
    // For now, skip this test until auth is set up
    test.skip();

    await page.goto("/");

    // Check for welcome elements
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
    await expect(page.getByText(/create your first pack/i)).toBeVisible();

    // Check for feature highlights
    await expect(page.getByText(/smart learning/i)).toBeVisible();
    await expect(page.getByText(/track progress/i)).toBeVisible();
    await expect(page.getByText(/stay consistent/i)).toBeVisible();

    // Check for CTA button
    const createButton = page.getByRole("button", { name: /create first pack/i });
    await expect(createButton).toBeVisible();
  });

  test("should open create project dialog when clicking create button", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Click create button
    await page.getByRole("button", { name: /create first pack/i }).click();

    // Check dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/create new pack/i)).toBeVisible();
    await expect(page.getByLabel(/pack name/i)).toBeVisible();
  });

  test("should create a new project successfully", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Open dialog
    await page.getByRole("button", { name: /create first pack/i }).click();

    // Fill in project name
    const projectName = "Test Project " + Date.now();
    await page.getByLabel(/pack name/i).fill(projectName);

    // Submit form
    await page.getByRole("button", { name: /^create$/i }).click();

    // Wait for dialog to close and project to be created
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Should see the new project in the list
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("should show validation error for empty project name", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Open dialog
    await page.getByRole("button", { name: /create first pack/i }).click();

    // Submit without filling name
    const createButton = page.getByRole("button", { name: /^create$/i });

    // Button should be disabled when empty
    await expect(createButton).toBeDisabled();
  });

  test("should display existing projects with stats", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Should show "Your Learning Journey" heading
    await expect(page.getByRole("heading", { name: /your learning journey/i })).toBeVisible();

    // Should show at least one project card
    const projectCards = page.locator('[class*="Card"]').filter({ hasText: /cards total|due|no cards yet/i });
    await expect(projectCards.first()).toBeVisible();
  });

  test("should navigate to project when clicking on project card", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Click on first project
    const firstProject = page.locator('[class*="Card"]').first();
    await firstProject.click();

    // Should navigate to project page
    await expect(page).toHaveURL(/\/p\/[a-zA-Z0-9]+/);
  });

  test("should show project stats correctly", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Find a project card with stats
    const projectCard = page.locator('[class*="Card"]').first();

    // Should show mastered, learning, and new card counts
    await expect(projectCard.getByText(/mastered/i)).toBeVisible();
    await expect(projectCard.getByText(/learning/i)).toBeVisible();
    await expect(projectCard.getByText(/new/i)).toBeVisible();
  });

  test("should open edit menu for project", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // Click on edit menu (three dots)
    const editMenuButton = page.locator('button[aria-label*="menu"], button').filter({ hasText: /⋮|︙/ }).first();
    await editMenuButton.click();

    // Should show edit menu options
    await expect(page.getByRole("menuitem", { name: /edit/i })).toBeVisible();
  });

  test("should handle project import", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    await page.goto("/");

    // This test would require setting up the import modal
    // and providing valid project data
    // TODO: Implement when import functionality is tested
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    test.skip(); // Skip until auth is implemented

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that elements are still visible and usable
    await expect(page.getByRole("heading", { name: /welcome|your learning journey/i })).toBeVisible();

    // Create button should be visible and clickable
    const createButton = page.getByRole("button", { name: /create/i }).first();
    await expect(createButton).toBeVisible();
  });
});
