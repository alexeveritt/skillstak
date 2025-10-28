import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration supporting both Node.js dev mode and Cloudflare/Wrangler mode
 *
 * Usage:
 * - npm run test:e2e:node - Test against Node.js dev server (npm run dev)
 * - npm run test:e2e:cf - Test against Cloudflare/Wrangler dev server (npm run dev:wrangler)
 * - npm run test:e2e - Default, tests against Node.js dev server
 */

const testEnv = process.env.TEST_ENV || "node";
const isCloudflareMode = testEnv === "cloudflare";

// Different ports and commands for different environments
const config = {
  node: {
    command: "npm run dev",
    url: "http://localhost:5173",
    port: 5173,
  },
  cloudflare: {
    command: "npm run dev:wrangler",
    url: "http://localhost:8788",
    port: 8788,
  },
};

const selectedConfig = config[testEnv as keyof typeof config] || config.node;

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || selectedConfig.url,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // Uncomment to test on Firefox and WebKit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Start dev server before running tests */
  webServer: process.env.START_SERVER
    ? {
        command: selectedConfig.command,
        url: selectedConfig.url,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
});
