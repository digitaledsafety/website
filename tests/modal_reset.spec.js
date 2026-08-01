const { test, expect } = require('@playwright/test');

test.describe('Donation Modal Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should reset to prompt state when closed and reopened', async ({ page }) => {
    await page.goto('/marketplace/53.html');

    // Open modal
    await page.click('text=Launch Web App');
    await expect(page.locator('#donationModal')).toBeVisible();

    // Mock a successful donation by showing thank you message
    // We can't easily trigger the PayPal approval in a test,
    // but we can manually set the state if we want to test the reset.
    // Or we can just check if the Vanilla JS listener is even registered/working.

    // Let's manually show the thank-you message
    await page.evaluate(() => {
      document.getElementById('donation-prompt').style.display = 'none';
      document.getElementById('thank-you-message').style.display = 'block';
    });

    await expect(page.locator('#thank-you-message')).toBeVisible();
    await expect(page.locator('#donation-prompt')).not.toBeVisible();

    // Close modal
    await page.click('#donationModal .close');

    // Wait for modal to be hidden
    await expect(page.locator('#donationModal')).not.toBeVisible();

    // Open modal again
    await page.click('text=Launch Web App');
    await expect(page.locator('#donationModal')).toBeVisible();

    // Check if it reset to prompt
    const prompt = page.locator('#donation-prompt');
    const thankYou = page.locator('#thank-you-message');

    // This is expected to FAIL if the Vanilla JS listener doesn't work with BS4
    await expect(prompt).toBeVisible();
    await expect(thankYou).not.toBeVisible();
  });
});
