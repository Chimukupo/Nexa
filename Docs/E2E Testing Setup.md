# Playwright E2E Testing Setup - Complete

**Date:** January 20, 2026  
**Status:** ✅ Configured and Ready

---

## ✅ **What Was Fixed:**

### **1. Test Directories Created**

- ✅ `e2e/tests/` - For shared E2E tests
- ✅ `apps/web/tests/` - For web app-specific tests

### **2. Test Scripts Added**

**Root `package.json`:**

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:debug": "playwright test --debug"
```

**`apps/web/package.json`:**

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:debug": "playwright test --debug"
```

### **3. Turbo Task Configured**

**`turbo.json`:**

```json
"test:e2e": {
  "dependsOn": ["^build"],
  "cache": false,
  "outputs": ["playwright-report/**", "test-results/**"]
}
```

### **4. WebServer Auto-Start**

**`e2e/playwright.config.ts`:**

```typescript
webServer: {
  command: 'cd apps/web && pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

**Benefits:**

- ✅ Automatically starts Next.js dev server before tests
- ✅ Reuses existing server in local development
- ✅ Starts fresh server in CI
- ✅ 2-minute timeout for slow starts

### **5. Port Configuration Fixed**

**Before:** `apps/web` config used port 3001  
**After:** Both configs use port 3000 (Next.js default)

### **6. Browsers Installed**

```bash
pnpm exec playwright install chromium firefox
```

**Installed:**

- ✅ Chromium (Chrome/Edge testing)
- ✅ Firefox (Firefox testing)

### **7. Sample Test Created**

**`e2e/tests/homepage.spec.ts`:**

- Basic smoke test for homepage
- Verifies page loads and has content
- Template for future tests

---

## 📋 **How to Run Tests:**

### **Run All Tests (Headless)**

```bash
pnpm test:e2e
```

### **Run Tests with UI Mode (Recommended for Development)**

```bash
pnpm test:e2e:ui
```

### **Run Tests in Headed Mode (See Browser)**

```bash
pnpm test:e2e:headed
```

### **Debug Tests**

```bash
pnpm test:e2e:debug
```

### **Run Specific Test File**

```bash
pnpm test:e2e e2e/tests/homepage.spec.ts
```

### **Run Tests in Specific Browser**

```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
```

---

## 🎯 **Test Organization:**

### **Directory Structure:**

```
nexa/
├── e2e/
│   ├── playwright.config.ts    # Base config
│   └── tests/
│       └── homepage.spec.ts    # Sample test
│
└── apps/web/
    ├── playwright.config.ts    # App-specific config
    └── tests/                  # App-specific tests (empty for now)
```

### **When to Use Each:**

**`e2e/tests/`** - Use for:

- Cross-app integration tests
- Shared test utilities
- End-to-end user flows

**`apps/web/tests/`** - Use for:

- Web app-specific tests
- Page-level tests
- Component integration tests

---

## 📝 **Test Writing Guidelines:**

### **Basic Test Structure:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    // 1. Navigate
    await page.goto("/path");

    // 2. Interact
    await page.click("button");

    // 3. Assert
    await expect(page.locator("h1")).toHaveText("Expected");
  });
});
```

### **Best Practices:**

1. ✅ Use descriptive test names
2. ✅ Group related tests with `test.describe()`
3. ✅ Use `page.locator()` for selectors
4. ✅ Wait for elements with `await expect().toBeVisible()`
5. ✅ Use data-testid attributes for stable selectors
6. ✅ Keep tests independent (no shared state)

---

## 🔧 **Configuration Details:**

### **Timeouts:**

- Test timeout: 30 seconds
- WebServer startup: 2 minutes

### **Retries:**

- Local: 0 retries
- CI: 2 retries

### **Workers:**

- Local: Unlimited (parallel)
- CI: 2 workers

### **Artifacts:**

- Screenshots: Only on failure
- Videos: Retained on failure
- Traces: On first retry

### **Browsers:**

- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ⏳ WebKit (Safari) - Can be added later
- ⏳ Mobile viewports - Can be added later

---

## 🚀 **Next Steps:**

### **Priority 1: Write Critical Tests**

1. Authentication flow (signup, login, logout)
2. Transaction creation (income, expense, transfer)
3. Account management (create, edit, delete)
4. Budget tracking (view, update)

### **Priority 2: Add More Coverage**

5. Savings goals
6. Dashboard widgets
7. Dark mode toggle
8. Mobile responsive tests

### **Priority 3: CI Integration**

9. Add GitHub Actions workflow
10. Run tests on PR
11. Generate test reports

---

## 📊 **Test Reports:**

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

**Report includes:**

- ✅ Test results (pass/fail)
- ✅ Screenshots on failure
- ✅ Videos on failure
- ✅ Execution traces
- ✅ Performance metrics

---

## 🐛 **Troubleshooting:**

### **Issue: "Browser not found"**

**Solution:**

```bash
pnpm exec playwright install
```

### **Issue: "Port 3000 already in use"**

**Solution:**

1. Stop existing dev server
2. Or set `reuseExistingServer: true` in config

### **Issue: "Test timeout"**

**Solution:**

1. Increase timeout in test: `test.setTimeout(60000)`
2. Or increase global timeout in config

### **Issue: "Element not found"**

**Solution:**

1. Use `await page.waitForSelector()`
2. Or use `await expect().toBeVisible()`
3. Check selector is correct

---

## ✅ **Setup Complete Checklist:**

- [x] Test directories created
- [x] Test scripts added to package.json
- [x] Turbo task configured
- [x] WebServer auto-start configured
- [x] Port configuration fixed
- [x] Browsers installed
- [x] Sample test created
- [x] .gitignore entries present

**Status: Ready to write and run E2E tests!** 🎉

---

## 📚 **Resources:**

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
