const { test, expect } = require('@playwright/test');

test.describe('Program Page Enhancements', () => {
  test('should have launch triggers in related marketplace items', async ({ page }) => {
    // Program 6 has related items
    await page.goto('/programs/6.html');

    // Check for the related items section
    await expect(page.locator('.related-marketplace')).toBeVisible();

    // Check for the Launch button
    const launchBtn = page.locator('.launch-trigger').first();
    await expect(launchBtn).toBeVisible();
    await expect(launchBtn).toHaveText('Launch');

    // Clicking it should show the donation modal (since we added it to the layout)
    await launchBtn.click();
    await expect(page.locator('#donationModal')).toBeVisible();
  });
});
