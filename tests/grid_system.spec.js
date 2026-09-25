const { test, expect } = require('@playwright/test');

test.describe('Universal Grid System', () => {
  test.beforeEach(async ({ page }) => {
    // Block external resources that might slow down the tests
    await page.route('**/*.{png,jpg,jpeg,svg,gif}', route => route.abort());
    await page.route('**/cdn-cookieyes.com/**', route => route.abort());
    await page.route('**/challenges.cloudflare.com/**', route => route.abort());
    await page.route('**/fonts.googleapis.com/**', route => route.abort());
    await page.route('**/fonts.gstatic.com/**', route => route.abort());
  });

  test('Open Source page search and filtering', async ({ page }) => {
    await page.goto('/open-source.html', { waitUntil: 'domcontentloaded' });

    // Check initial state
    const cards = page.locator('#opensource-container .card');
    await expect(cards).not.toHaveCount(0, { timeout: 20000 });

    // Test search
    await page.fill('#opensource-search', 'Android');
    await page.waitForTimeout(1500);

    const filteredBySearch = page.locator('#opensource-container .card');
    const count = await filteredBySearch.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Glossaries page search and filtering', async ({ page }) => {
    await page.goto('/glossaries.html', { waitUntil: 'domcontentloaded' });

    // Check if initial cards are loaded
    const cards = page.locator('#glossary-container .card');
    await expect(cards).not.toHaveCount(0, { timeout: 20000 });

    // Test search
    await page.fill('#glossary-search', 'AGI');
    await page.waitForTimeout(1500);

    const filteredBySearch = page.locator('#glossary-container .card');
    const count = await filteredBySearch.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Organizations page search and filtering', async ({ page }) => {
    await page.goto('/organizations.html', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('#orgs-container .card');
    await expect(cards).not.toHaveCount(0, { timeout: 20000 });

    // Test filter
    const filterSelect = page.locator('#orgs-filter');
    const options = await filterSelect.locator('option').allInnerTexts();
    if (options.length > 1) {
        const firstFilter = options[1];
        await filterSelect.selectOption(firstFilter);
        await page.waitForTimeout(1000);
        const filteredByTag = page.locator('#orgs-container .card');
        await expect(filteredByTag).not.toHaveCount(0);
    }
  });

  test('Category page search and filtering', async ({ page }) => {
    await page.goto('/categories/apps.html', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('#resources-container .card');
    await expect(cards).not.toHaveCount(0, { timeout: 20000 });

    // Test search
    await page.fill('#resources-search', 'a'); // Generic search to trigger filter
    await page.waitForTimeout(1500);

    const filteredBySearch = page.locator('#resources-container .card');
    const count = await filteredBySearch.count();
    expect(count).toBeGreaterThan(0);
  });
});
