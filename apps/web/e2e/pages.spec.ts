import { test, expect } from '@playwright/test';

test.describe('Explorer Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer');
  });

  test('should display search input', async ({ page }) => {
    await expect(page.locator('#explorer-search')).toBeVisible();
  });

  test('should display empty state', async ({ page }) => {
    await expect(page.locator('#explorer-result')).toContainText('No address searched yet');
  });

  test('should have search button', async ({ page }) => {
    await expect(page.locator('#explorer-search-btn')).toBeVisible();
  });
});

test.describe('Docs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs');
  });

  test('should display installation section', async ({ page }) => {
    await expect(page.locator('#installation')).toBeVisible();
  });

  test('should display API reference', async ({ page }) => {
    await expect(page.locator('#api-reference')).toBeVisible();
  });

  test('should display tier definitions', async ({ page }) => {
    await expect(page.locator('#tiers')).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should display all 4 pricing cards', async ({ page }) => {
    await expect(page.locator('#pricing-free')).toBeVisible();
    await expect(page.locator('#pricing-starter')).toBeVisible();
    await expect(page.locator('#pricing-growth')).toBeVisible();
    await expect(page.locator('#pricing-enterprise')).toBeVisible();
  });
});
