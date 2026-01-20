import { test, expect } from '@playwright/test';

/**
 * Sample E2E Test - Login Page (Homepage redirects here)
 * 
 * This test verifies that the login page loads correctly.
 * It's a basic smoke test to ensure the Playwright setup is working.
 */
test.describe('Login Page (Homepage)', () => {
  test('should redirect from homepage to login', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Should redirect to login
    await page.waitForURL('/login');

    // Verify we're on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the login heading exists
    const heading = page.getByRole('heading', { name: /welcome back/i });
    await expect(heading).toBeVisible();

    // Verify form elements exist
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/login');

    // Check that the page has a title
    await expect(page).toHaveTitle(/.+/);
  });

  test('should have sign up link', async ({ page }) => {
    await page.goto('/login');

    // Verify sign up tab/link exists
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
  });
});
