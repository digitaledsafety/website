const { test, expect } = require('@playwright/test');

test('PWA manifest is correctly rendered on resource pages', async ({ page }) => {
  await page.goto('/resources/14.html');

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toBeAttached();

  const href = await manifestLink.evaluate(el => el.getAttribute('href'));
  expect(href).toContain('data:application/manifest+json');

  // For data URIs, it's often better to check if it's a valid data URI and contains key parts
  // especially when dealing with complex escaping/encoding issues in the test environment.
  expect(href).toContain('Shark Attack');
  expect(href).toContain('image/x-icon');
  expect(href).toContain('standalone');
});
