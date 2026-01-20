import { test, expect } from '@playwright/test';

/**
 * Sample E2E Test - Homepage
 * 
 * This test verifies that the homepage loads correctly.
 * It's a basic smoke test to ensure the Playwright setup is working.
 */
test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the page title or heading exists
    // Adjust this selector based on your actual homepage
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check that the page has a title
    await expect(page).toHaveTitle(/.+/);
  });
});
