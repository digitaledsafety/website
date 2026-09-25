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

  test('should detect OFFLINE status when manifest contains #EXT-X-ENDLIST', async ({ page }) => {
    // Intercept m3u8 fetch and return static manifest with #EXT-X-ENDLIST
    await page.route('**/*.m3u8*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/x-mpegURL',
        body: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:4
#EXTINF:4.167000,
stream4.ts
#EXT-X-ENDLIST`
      });
    });

    await page.goto('/live/');

    await expect(page.locator('#statusText')).toHaveText('OFFLINE');
    await expect(page.locator('#offlineOverlay')).toBeVisible();
  });

  test('should detect LIVE NOW status when manifest does NOT contain #EXT-X-ENDLIST', async ({ page }) => {
    // Intercept m3u8 fetch and return live manifest without #EXT-X-ENDLIST
    await page.route('**/*.m3u8*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/x-mpegURL',
        body: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:4
#EXTINF:4.167000,
stream4.ts`
      });
    });

    await page.goto('/live/');

    await expect(page.locator('#statusText')).toHaveText('LIVE NOW');
    await expect(page.locator('#offlineOverlay')).not.toBeVisible();
  });
});
