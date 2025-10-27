# E2E Testing with Playwright

This directory contains end-to-end tests for the Skillstak application using Playwright.

## Setup

Playwright is already installed. If you need to reinstall browsers:

```bash
npx playwright install
```

## Important: Dev Server Requirements

**You must manually start your dev server before running tests:**

```bash
# Terminal 1: Start dev server (runs on port 5173)
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

The Playwright config is set to **NOT auto-start the server by default** to avoid conflicts.

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Debug a specific test
```bash
npm run test:e2e:debug
```

### View the last test report
```bash
npm run test:e2e:report
```

### Run a specific test file
```bash
npm run test:e2e tests/e2e/smoke.spec.ts
```

## Test Structure

```
tests/
├── e2e/
│   ├── helpers/
│   │   └── auth.ts                    # Authentication helpers
│   ├── smoke.spec.ts                   # Basic smoke tests
│   ├── home.spec.ts                    # Home page tests (template)
│   └── home-authenticated.spec.ts      # Full user flow tests
└── README.md
```

## Configuration

- **App URL**: `http://localhost:5173` (standard React Router dev server)
- **Test Directory**: `tests/e2e/`
- **Default Browser**: Chromium (Firefox and WebKit available but commented out)
- **Auto-start server**: Disabled (set `START_SERVER=1` to enable)

## Writing Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

### Using Authentication Helpers

```typescript
import { signup, login, createTestUser } from './helpers/auth';

test('authenticated test', async ({ page }) => {
  const user = createTestUser();
  await signup(page, user.email, user.password);
  
  // Now test authenticated features
});
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for elements**: Use `await expect(...).toBeVisible()` instead of arbitrary waits
3. **Create reusable helpers**: Put common actions in `helpers/` directory
4. **Isolate tests**: Each test should be independent and create its own data
5. **Use test.describe**: Group related tests together

## Debugging Tips

- Use `await page.pause()` to pause execution and inspect in browser
- Use `--debug` flag to step through tests
- Check `test-results/` for screenshots and traces of failed tests
- Use `--ui` mode for an interactive debugging experience

## CI/CD

For CI environments, you can enable auto-start of the dev server:

```bash
START_SERVER=1 npm run test:e2e
```
