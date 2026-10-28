const { test, expect } = require('@playwright/test');

test.describe('Donation Interceptor', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should show donation modal when clicking Launch on marketplace grid', async ({ page }) => {
    await page.goto('/');

    // Wait for the grid container to be present
    await page.waitForSelector('#marketplace-container');

    // Wait for at least one launch trigger to appear (rendered via JS)
    await page.waitForFunction(() => document.querySelectorAll('.launch-trigger').length > 0, { timeout: 15000 });

    const launchBtn = page.locator('.launch-trigger').first();
    await launchBtn.click();

    // Verify modal is visible
    const modal = page.locator('#donationModal');
    await expect(modal).toBeVisible();
  });

  test('should show donation modal when clicking Launch on item page', async ({ page }) => {
    // Navigate to a specific marketplace item
    await page.goto('/marketplace/53.html');

    const launchBtn = page.locator('text=Launch Web App');
    await expect(launchBtn).toBeVisible();
    await launchBtn.click();

    // Verify modal is visible
    const modal = page.locator('#donationModal');
    await expect(modal).toBeVisible();
  });

  test('should skip modal if hasDonated is true', async ({ page }) => {
    // Go to the page first to set localStorage for that origin
    await page.goto('/marketplace/53.html');
    await page.evaluate(() => localStorage.setItem('hasDonated', 'true'));
    // Reload to apply
    await page.reload();

    const launchBtn = page.locator('text=Launch Web App');

    // If hasDonated is true, clicking launch should NOT show the modal.
    // It would normally navigate away, so we just check the modal status.
    await launchBtn.click();

    const modal = page.locator('#donationModal');
    // It should either be hidden or never have appeared
    await expect(modal).not.toBeVisible();
  });

  test('should launch app when clicking "No thanks, just launch"', async ({ page }) => {
    await page.goto('/marketplace/53.html');

    await page.click('text=Launch Web App');
    await page.waitForSelector('#donationModal', { state: 'visible' });

    const skipBtn = page.locator('text=No thanks, just launch');

    // Intercept navigation or check if link is opened
    // In our implementation, it does window.open(link, '_blank')
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      skipBtn.click(),
    ]);

    expect(popup).toBeTruthy();
    await expect(page.locator('#donationModal')).not.toBeVisible();
  });
});
