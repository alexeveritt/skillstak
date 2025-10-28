import { type Page } from "@playwright/test";

/**
 * Helper function to sign up a new user
 */
export async function signup(page: Page, email: string, password: string) {
  await page.goto("/signup");
  await page.getByLabel(/email/i).fill(email);
  await page
    .getByLabel(/password/i)
    .first()
    .fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();
  // Wait for redirect to home page
  await page.waitForURL("/");
}

/**
 * Helper function to log in an existing user
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  // Wait for redirect to home page
  await page.waitForURL("/");
}

/**
 * Helper function to log out
 */
export async function logout(page: Page) {
  await page.goto("/logout");
  await page.waitForURL("/login");
}

/**
 * Create a test user with a unique email
 */
export function createTestUser() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    password: "TestPassword123!",
  };
}
