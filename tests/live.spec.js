const { test, expect } = require('@playwright/test');

test.describe('Live Stream Page', () => {
  test('should render video player, controls, live badge, CTAs, and platform links', async ({ page }) => {
    await page.goto('/live/');

    // Check page title & header
    await expect(page.locator('h1')).toContainText('Foundation Live Stream');
    await expect(page.locator('#liveStatusBadge')).toBeVisible();
    await expect(page.locator('#statusText')).toHaveText(/LIVE NOW|OFFLINE/);

    // Check video player element
    const video = page.locator('#video');
    await expect(video).toBeVisible();

    // Check cinema mode toggle
    const cinemaBtn = page.locator('#cinemaToggleBtn');
    await expect(cinemaBtn).toBeVisible();
    await cinemaBtn.click();
    await expect(page.locator('#livePageContainer')).toHaveClass(/cinema-mode/);

    // Check CTAs
    await expect(page.locator('#donateLiveBtn')).toBeVisible();
    await expect(page.locator('#shareLiveBtn')).toBeVisible();

    // Check external platform links
    await expect(page.locator('.platform-btn-youtube')).toBeVisible();
    await expect(page.locator('.platform-btn-twitch')).toBeVisible();
    await expect(page.locator('.platform-btn-discord')).toBeVisible();

    // Test donation modal trigger
    await page.locator('#donateLiveBtn').click();
    await expect(page.locator('#donationModal')).toBeVisible();
  });
});
