# Comprehensive Playwright E2E Configuration Guide for Monorepo Projects

**Author:** Nexa Development Team  
**Date:** January 20, 2026  
**Version:** 1.0  
**Purpose:** Step-by-step guide for setting up Playwright E2E testing in a Turborepo/pnpm monorepo

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Installation Steps](#installation-steps)
4. [Configuration Files](#configuration-files)
5. [Package.json Scripts](#packagejson-scripts)
6. [Turbo Configuration](#turbo-configuration)
7. [Directory Structure](#directory-structure)
8. [Sample Tests](#sample-tests)
9. [Running Tests](#running-tests)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 **Prerequisites**

Before starting, ensure you have:

- ✅ Node.js 20+ installed
- ✅ pnpm package manager
- ✅ Turborepo monorepo structure
- ✅ At least one Next.js app in the monorepo
- ✅ Basic understanding of E2E testing concepts

**Monorepo Structure Assumption:**

```
my-monorepo/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── ui/
│   └── validators/
├── package.json          # Root package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 📁 **Project Structure Overview**

After setup, your structure will look like:

```
my-monorepo/
├── e2e/                           # Shared E2E test configuration
│   ├── playwright.config.ts      # Base Playwright config
│   └── tests/                    # Shared E2E tests
│       └── *.spec.ts
│
├── apps/
│   └── web/
│       ├── playwright.config.ts  # App-specific config (extends base)
│       ├── tests/                # App-specific tests
│       │   └── *.spec.ts
│       └── package.json          # Updated with test scripts
│
├── package.json                  # Updated with test scripts
├── turbo.json                    # Updated with test task
└── .gitignore                    # Updated with test artifacts
```

---

## 🚀 **Installation Steps**

### **Step 1: Install Playwright**

Install Playwright in both root and app-level package.json:

```bash
# From monorepo root
pnpm add -D @playwright/test -w

# From your app directory (e.g., apps/web)
cd apps/web
pnpm add -D @playwright/test
```

**Why both?**

- Root: For shared E2E tests across apps
- App-level: For app-specific tests and isolation

---

### **Step 2: Install Playwright Browsers**

```bash
# From monorepo root
pnpm exec playwright install chromium firefox

# Optional: Install all browsers including WebKit (Safari)
pnpm exec playwright install
```

**Browsers installed:**

- Chromium (for Chrome/Edge testing)
- Firefox (for Firefox testing)
- WebKit (for Safari testing) - optional

---

### **Step 3: Create Directory Structure**

```bash
# From monorepo root
mkdir -p e2e/tests
mkdir -p apps/web/tests
```

---

## ⚙️ **Configuration Files**

### **File 1: Base Playwright Config (`e2e/playwright.config.ts`)**

Create this file in the `e2e/` directory:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Test directory relative to this config file
  testDir: "./tests",

  // Maximum time one test can run
  timeout: 30_000,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers in CI
  workers: process.env.CI ? 2 : undefined,

  // Reporter configuration
  reporter: [["html", { open: "never" }]],

  // Shared settings for all tests
  use: {
    // Base URL for navigation (e.g., page.goto('/'))
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    // Collect trace on first retry
    trace: "on-first-retry",

    // Take screenshot only on failure
    screenshot: "only-on-failure",

    // Record video only on failure
    video: "retain-on-failure",
  },

  // Auto-start dev server before tests
  webServer: {
    // Command to start your dev server
    // Adjust path based on your app location
    command: "cd apps/web && pnpm dev",

    // URL to wait for before running tests
    url: "http://localhost:3000",

    // Reuse existing server in local dev, start fresh in CI
    reuseExistingServer: !process.env.CI,

    // Timeout for server to start (2 minutes)
    timeout: 120_000,
  },

  // Browser projects to run tests on
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // Uncomment to add Safari testing
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Uncomment to add mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],
});
```

**Key Configuration Explained:**

| Setting                         | Purpose                      | Recommended Value              |
| ------------------------------- | ---------------------------- | ------------------------------ |
| `testDir`                       | Where test files are located | `'./tests'`                    |
| `timeout`                       | Max time per test            | `30_000` (30 seconds)          |
| `retries`                       | Retry failed tests           | `2` in CI, `0` locally         |
| `workers`                       | Parallel test execution      | `2` in CI, unlimited locally   |
| `baseURL`                       | Base URL for navigation      | Your dev server URL            |
| `webServer.command`             | Start dev server             | Path to your app + dev command |
| `webServer.reuseExistingServer` | Reuse running server         | `!process.env.CI`              |

---

### **File 2: App-Specific Config (`apps/web/playwright.config.ts`)**

Create this file in your app directory (e.g., `apps/web/`):

```typescript
import baseConfig from "../../e2e/playwright.config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Extend base configuration
  ...baseConfig,

  // Override testDir for app-specific tests
  testDir: "./tests",

  // Override or extend use settings
  use: {
    ...baseConfig.use,
    // Override baseURL if different
    baseURL: "http://localhost:3000",
  },
});
```

**Why separate configs?**

- **Base config**: Shared settings, browser configs, global setup
- **App config**: App-specific overrides, custom test directory

---

## 📝 **Package.json Scripts**

### **Root `package.json`**

Add these scripts to your root `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### **App `package.json` (`apps/web/package.json`)**

Add the same scripts to your app's `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**Script Explanations:**

| Script            | Purpose                  | When to Use                  |
| ----------------- | ------------------------ | ---------------------------- |
| `test:e2e`        | Run all tests headless   | CI, quick local verification |
| `test:e2e:ui`     | Run with Playwright UI   | Development, debugging       |
| `test:e2e:headed` | Run with visible browser | Debugging, watching tests    |
| `test:e2e:debug`  | Run in debug mode        | Step-through debugging       |

---

## 🔧 **Turbo Configuration**

Update your `turbo.json` to include the test task:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "cache": false,
      "outputs": ["playwright-report/**", "test-results/**"]
    }
  }
}
```

**Why this configuration?**

- `dependsOn: ["^build"]`: Ensures apps are built before testing
- `cache: false`: Tests should always run fresh
- `outputs`: Captures test reports and results

---

## 📂 **Directory Structure**

### **Test File Organization**

```
e2e/
└── tests/
    ├── auth/
    │   ├── login.spec.ts
    │   └── signup.spec.ts
    ├── critical-flows/
    │   ├── transaction-creation.spec.ts
    │   └── budget-tracking.spec.ts
    └── smoke/
        └── homepage.spec.ts

apps/web/
└── tests/
    ├── pages/
    │   ├── dashboard.spec.ts
    │   └── settings.spec.ts
    └── components/
        └── navigation.spec.ts
```

**Organization Guidelines:**

| Directory                   | Use For                                          |
| --------------------------- | ------------------------------------------------ |
| `e2e/tests/`                | Cross-app integration tests, critical user flows |
| `apps/web/tests/`           | App-specific tests, page tests, component tests  |
| `e2e/tests/auth/`           | Authentication flows                             |
| `e2e/tests/critical-flows/` | Business-critical user journeys                  |
| `e2e/tests/smoke/`          | Quick smoke tests                                |

---

## 🧪 **Sample Tests**

### **Sample 1: Basic Smoke Test (`e2e/tests/smoke/homepage.spec.ts`)**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage Smoke Test", () => {
  test("should load the homepage successfully", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Verify page has a heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check page has a title
    await expect(page).toHaveTitle(/.+/);
  });
});
```

---

### **Sample 2: Authentication Flow (`e2e/tests/auth/login.spec.ts`)**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    // Verify form elements exist
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    // Fill in login form
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: /login/i }).click();

    // Wait for navigation
    await page.waitForURL("/dashboard");

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Password").fill("wrongpassword");

    // Submit form
    await page.getByRole("button", { name: /login/i }).click();

    // Verify error message appears
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });
});
```

---

### **Sample 3: Form Interaction (`e2e/tests/critical-flows/transaction-creation.spec.ts`)**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Transaction Creation", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test (you might want to use a fixture for this)
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /login/i }).click();
    await page.waitForURL("/dashboard");
  });

  test("should create an expense transaction", async ({ page }) => {
    // Navigate to transactions page
    await page.goto("/transactions");

    // Click "Add Transaction" button
    await page.getByRole("button", { name: /add transaction/i }).click();

    // Fill in transaction form
    await page.getByLabel("Type").selectOption("EXPENSE");
    await page.getByLabel("Amount").fill("50.00");
    await page.getByLabel("Category").selectOption("Groceries");
    await page.getByLabel("Account").selectOption("Checking");
    await page.getByLabel("Description").fill("Weekly groceries");

    // Submit form
    await page.getByRole("button", { name: /save/i }).click();

    // Verify transaction appears in list
    await expect(page.getByText("Weekly groceries")).toBeVisible();
    await expect(page.getByText("$50.00")).toBeVisible();
  });
});
```

---

## 🏃 **Running Tests**

### **Local Development**

```bash
# Run all tests (headless)
pnpm test:e2e

# Run with UI (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests (step through)
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e e2e/tests/auth/login.spec.ts

# Run tests matching pattern
pnpm test:e2e --grep "login"

# Run tests in specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox

# Run from specific app
cd apps/web
pnpm test:e2e
```

---

### **View Test Reports**

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

This opens an interactive report showing:

- ✅ Test results (pass/fail)
- 📸 Screenshots on failure
- 🎥 Videos on failure
- 🔍 Execution traces
- ⏱️ Performance metrics

---

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium firefox

      - name: Build apps
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

### **GitLab CI Example**

Create `.gitlab-ci.yml`:

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.57.0-jammy
  stage: test
  script:
    - npm install -g pnpm@10
    - pnpm install
    - pnpm exec playwright install chromium firefox
    - pnpm build
    - pnpm test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
```

---

## 📚 **Best Practices**

### **1. Test Organization**

✅ **DO:**

- Group related tests with `test.describe()`
- Use descriptive test names
- Keep tests independent (no shared state)
- Use fixtures for common setup

❌ **DON'T:**

- Create interdependent tests
- Use generic test names like "test 1"
- Share state between tests

---

### **2. Selectors**

✅ **DO:**

```typescript
// Use data-testid for stable selectors
await page.getByTestId("submit-button").click();

// Use role-based selectors
await page.getByRole("button", { name: /submit/i }).click();

// Use label text
await page.getByLabel("Email").fill("test@example.com");
```

❌ **DON'T:**

```typescript
// Avoid CSS selectors that can break
await page.locator(".btn-primary").click();

// Avoid XPath
await page.locator('//button[@class="submit"]').click();
```

---

### **3. Waiting Strategies**

✅ **DO:**

```typescript
// Wait for element to be visible
await expect(page.getByText("Success")).toBeVisible();

// Wait for navigation
await page.waitForURL("/dashboard");

// Wait for network to be idle
await page.waitForLoadState("networkidle");
```

❌ **DON'T:**

```typescript
// Avoid arbitrary waits
await page.waitForTimeout(5000); // Bad!
```

---

### **4. Test Data**

✅ **DO:**

```typescript
// Use fixtures for test data
const testUser = {
  email: "test@example.com",
  password: "Test123!@#",
};

// Clean up after tests
test.afterEach(async ({ page }) => {
  // Delete test data
});
```

❌ **DON'T:**

```typescript
// Hardcode production data
await page.fill('[name="email"]', "real.user@company.com");
```

---

### **5. Assertions**

✅ **DO:**

```typescript
// Use specific assertions
await expect(page.getByRole("heading")).toHaveText("Dashboard");
await expect(page).toHaveURL(/.*dashboard/);
await expect(page.getByTestId("balance")).toContainText("$1,234.56");
```

❌ **DON'T:**

```typescript
// Avoid weak assertions
expect(await page.locator("h1").textContent()).toBeTruthy();
```

---

## 🐛 **Troubleshooting**

### **Issue 1: "Browser not found"**

**Error:**

```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**

```bash
pnpm exec playwright install chromium firefox
```

---

### **Issue 2: "Port already in use"**

**Error:**

```
Error: Port 3000 is already in use
```

**Solution:**

1. Stop existing dev server
2. Or set `reuseExistingServer: true` in config
3. Or change port in `webServer.url`

---

### **Issue 3: "Test timeout"**

**Error:**

```
Test timeout of 30000ms exceeded
```

**Solution:**

```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});

// Or increase global timeout in config
timeout: 60_000,
```

---

### **Issue 4: "Element not found"**

**Error:**

```
Error: locator.click: Target closed
```

**Solution:**

```typescript
// Wait for element before interacting
await page.waitForSelector('[data-testid="submit"]');
await page.getByTestId("submit").click();

// Or use auto-waiting assertions
await expect(page.getByTestId("submit")).toBeVisible();
await page.getByTestId("submit").click();
```

---

### **Issue 5: "Flaky tests"**

**Symptoms:**

- Tests pass sometimes, fail other times
- Tests fail in CI but pass locally

**Solutions:**

1. **Add proper waits:**

   ```typescript
   await page.waitForLoadState("networkidle");
   await expect(element).toBeVisible();
   ```

2. **Increase retries in CI:**

   ```typescript
   retries: process.env.CI ? 3 : 0,
   ```

3. **Use stable selectors:**

   ```typescript
   // Good
   await page.getByTestId("submit-button");

   // Bad
   await page.locator(".btn-123");
   ```

---

## 📖 **Additional Resources**

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)

---

## ✅ **Setup Checklist**

Use this checklist when setting up Playwright in a new monorepo:

- [ ] Install `@playwright/test` in root and app package.json
- [ ] Install Playwright browsers (`pnpm exec playwright install`)
- [ ] Create `e2e/` directory with `playwright.config.ts`
- [ ] Create `e2e/tests/` directory
- [ ] Create app-specific `playwright.config.ts` (extends base)
- [ ] Create app-specific `tests/` directory
- [ ] Add test scripts to root `package.json`
- [ ] Add test scripts to app `package.json`
- [ ] Add `test:e2e` task to `turbo.json`
- [ ] Verify `.gitignore` includes test artifacts
- [ ] Create sample test to verify setup
- [ ] Run tests locally to confirm working
- [ ] Set up CI/CD pipeline
- [ ] Document app-specific test patterns

---

## 🎯 **Quick Start Template**

For quick setup, follow these commands:

```bash
# 1. Install Playwright
pnpm add -D @playwright/test -w
cd apps/web && pnpm add -D @playwright/test && cd ../..

# 2. Install browsers
pnpm exec playwright install chromium firefox

# 3. Create directories
mkdir -p e2e/tests apps/web/tests

# 4. Copy config files (from this guide)
# - e2e/playwright.config.ts
# - apps/web/playwright.config.ts

# 5. Update package.json files (add scripts from this guide)

# 6. Update turbo.json (add test:e2e task)

# 7. Create sample test
# - e2e/tests/homepage.spec.ts

# 8. Run tests
pnpm test:e2e:ui
```

---

## 📝 **Notes**

- This guide assumes a Turborepo + pnpm monorepo structure
- Adjust paths and commands based on your specific setup
- For npm/yarn, replace `pnpm` with your package manager
- For non-Next.js apps, adjust `webServer.command` accordingly
- Consider adding WebKit for Safari testing if needed
- Add mobile viewports for responsive testing

---

**End of Guide** 🎉

This configuration has been battle-tested on the Nexa Finance Platform and provides a solid foundation for E2E testing in monorepo projects.
