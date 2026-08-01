const { test, expect } = require('@playwright/test');

test('verify services and marketplace filters', async ({ page }) => {
  await page.goto('/');

  // Verify Services section
  const servicesHeading = page.locator('#services .section-heading');
  await expect(servicesHeading).toBeVisible();

  // Take screenshot of Services section
  await page.locator('#services').screenshot({ path: 'screenshots/homepage_services.png' });

  // Verify Marketplace items exist
  const marketplaceItems = page.locator('#marketplace-container .marketplace-item-wrapper');
  await expect(marketplaceItems.first()).toBeVisible();

  // Test filter: Engineering
  await page.selectOption('#marketplace-filter', 'Engineering');
  // Wait for transition/render
  await page.waitForTimeout(500);

  // Check that filtered items have Engineering badge
  const engineeringBadges = page.locator('.service-badge:has-text("Engineering")');
  await expect(engineeringBadges.first()).toBeVisible();

  await page.screenshot({ path: 'screenshots/marketplace_engineering.png' });

  // Test filter: Digital Safety
  await page.selectOption('#marketplace-filter', 'Digital Safety');
  await page.waitForTimeout(500);

  const safetyBadges = page.locator('.service-badge:has-text("Digital Safety")');
  await expect(safetyBadges.first()).toBeVisible();

  await page.screenshot({ path: 'screenshots/marketplace_digital_safety.png' });
});
