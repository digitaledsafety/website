const { test, expect } = require('@playwright/test');

test.describe('Live Stream Page', () => {
  test('should render video player, controls, live badge, and CTAs', async ({ page }) => {
    await page.goto('/live/');

    // Check page title & header
    await expect(page.locator('h1')).toContainText('Foundation Live Stream');
    await expect(page.locator('#liveStatusBadge')).toBeVisible();
    await expect(page.locator('#statusText')).toHaveText(/LIVE NOW|OFFLINE/);

    // Check video player element
    const video = page.locator('#video');
    await expect(video).toBeVisible();

    // Take screenshot of light mode
    await page.screenshot({ path: 'live_light_mode.png', fullPage: true });

    // Check cinema mode toggle
    const cinemaBtn = page.locator('#cinemaToggleBtn');
    await expect(cinemaBtn).toBeVisible();
    await cinemaBtn.click();
    await expect(page.locator('#livePageContainer')).toHaveClass(/cinema-mode/);

    // Take screenshot of cinema mode
    await page.screenshot({ path: 'live_cinema_mode.png', fullPage: true });

    // Check CTAs
    await expect(page.locator('#donateLiveBtn')).toBeVisible();
    await expect(page.locator('#shareLiveBtn')).toBeVisible();

    // Test donation modal trigger
    await page.locator('#donateLiveBtn').click();
    await expect(page.locator('#donationModal')).toBeVisible();
  });
});
