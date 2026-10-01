const { test, expect } = require('@playwright/test');

test('marketplace search has aria-label', async ({ page }) => {
  await page.goto('/');
  const searchInput = page.locator('#marketplace-search');
  await expect(searchInput).toHaveAttribute('aria-label', /Search/i);
});

test('marketplace displays no results message when no items match', async ({ page }) => {
  await page.goto('/');
  const searchInput = page.locator('#marketplace-search');
  await searchInput.fill('nonexistent-item-xyz-123');

  const noResultsMessage = page.locator('#marketplace-no-results');
  await expect(noResultsMessage).toBeVisible();
  await expect(noResultsMessage).toHaveAttribute('role', 'status');
});

test('marketplace items display localized labels', async ({ page }) => {
  await page.goto('/');

  // Wait for items to be rendered
  const firstMetaItem = page.locator('.meta-item').first();
  await expect(firstMetaItem).toBeVisible();

  const platformLabel = page.locator('.meta-label', { hasText: /Platform:/i }).first();
  await expect(platformLabel).toBeVisible();

  const categoryLabel = page.locator('.meta-label', { hasText: /Category:/i }).first();
  await expect(categoryLabel).toBeVisible();
});

test('marketplace clear filters button resets filters', async ({ page }) => {
  await page.goto('/');

  const searchInput = page.locator('#marketplace-search');
  const clearFiltersBtn = page.locator('#marketplace-clear');

  // Fill search and verify no results message might appear if we use a specific term
  await searchInput.fill('nonexistent-item-xyz-123');
  await expect(page.locator('#marketplace-no-results')).toBeVisible();

  // Click clear filters
  await clearFiltersBtn.click();

  // Verify search input is cleared
  await expect(searchInput).toHaveValue('');

  // Verify no results message is hidden and items are back
  await expect(page.locator('#marketplace-no-results')).toBeHidden();
  const items = page.locator('.marketplace-item-wrapper');
  await expect(items.count()).resolves.toBeGreaterThan(0);
});

test('marketplace has correct ARIA roles', async ({ page }) => {
  await page.goto('/');

  const container = page.locator('#marketplace-container');
  await expect(container).toHaveAttribute('role', 'list');

  const firstItem = page.locator('.marketplace-item-wrapper').first();
  await expect(firstItem).toHaveAttribute('role', 'listitem');
});
