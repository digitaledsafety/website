const { test, expect } = require('@playwright/test');

test('homepage renders services from the collection', async ({ page }) => {
  await page.goto('/');

  // Verify services are present
  const servicesSection = page.locator('#services');
  await expect(servicesSection).toBeAttached();

  // Check for the three services defined in _services/
  const serviceTitles = ['Entrepreneurship', 'Engineering', 'Digital Safety'];
  for (const title of serviceTitles) {
    await expect(servicesSection.locator('h4', { hasText: title })).toBeVisible();
  }
});

test('marketplace search includes service-based matches', async ({ page }) => {
  await page.goto('/');

  const searchInput = page.locator('#marketplace-search');
  await searchInput.fill('Engineering');

  // Verify that only items with 'Engineering' in their metadata are shown
  // We check the service badge or title
  const marketplaceItems = page.locator('#marketplace-container .marketplace-item-wrapper');

  // Wait for the UI to update (client-side filtering)
  await page.waitForTimeout(500);

  const count = await marketplaceItems.count();
  for (let i = 0; i < count; i++) {
    const text = await marketplaceItems.nth(i).textContent();
    // It should contain 'Engineering' either in title, subtitle, or service badge
    expect(text.toLowerCase()).toContain('engineering');
  }
});

test('marketplace action buttons have aria-labels', async ({ page }) => {
  await page.goto('/');

  const actionButtons = page.locator('#marketplace-container .btn-install');
  const count = await actionButtons.count();

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      await expect(actionButtons.nth(i)).toHaveAttribute('aria-label');
    }
  }
});
