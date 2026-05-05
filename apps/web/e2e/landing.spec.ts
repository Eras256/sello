import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section with title', async ({ page }) => {
    const title = page.locator('#hero-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Verify Once');
  });

  test('should display stats bar', async ({ page }) => {
    const statsBar = page.locator('#stats-bar');
    await expect(statsBar).toBeVisible();
    await expect(page.locator('#stat-attestations')).toContainText('50+');
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = page.locator('#nav-links a');
    await expect(navLinks).toHaveCount(6);
  });

  test('should have CTA buttons', async ({ page }) => {
    await expect(page.locator('#cta-verify')).toBeVisible();
    await expect(page.locator('#cta-docs')).toBeVisible();
  });

  test('should display how-it-works section', async ({ page }) => {
    const section = page.locator('#how-it-works');
    await expect(section).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('clicking Verify navigates to /verify', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/verify"]');
    await expect(page).toHaveURL('/verify');
  });

  test('clicking Docs navigates to /docs', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/docs"]');
    await expect(page).toHaveURL('/docs');
  });

  test('clicking Pricing navigates to /pricing', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL('/pricing');
  });
});
