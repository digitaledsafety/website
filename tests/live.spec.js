const { test, expect } = require('@playwright/test');

test.describe('Live Stream Page', () => {
  test('should render video player, controls, live badge, CTAs, platform links, and sidebar schedule', async ({ page }) => {
    await page.goto('/live/');

    // Check page title & header
    await expect(page.locator('h1')).toContainText('Foundation Live Stream');
    await expect(page.locator('#liveStatusBadge')).toBeVisible();
    await expect(page.locator('#statusText')).toHaveText(/LIVE NOW|OFFLINE/);

    // Check video player element
    const video = page.locator('#video');
    await expect(video).toBeVisible();

    // Check CTAs
    await expect(page.locator('#donateLiveBtn')).toBeVisible();
    await expect(page.locator('#shareLiveBtn')).toBeVisible();

    // Check main explanation card
    await expect(page.locator('.live-info-card')).toContainText('About The Digital Education & Safety Foundation Livestreams');

    // Check external platform links
    await expect(page.locator('.platform-btn-youtube')).toBeVisible();
    await expect(page.locator('.platform-btn-twitch')).toBeVisible();
    await expect(page.locator('.platform-btn-discord')).toBeVisible();

    // Check Sidebar Schedule section elements
    await expect(page.locator('.schedule-sidebar-card')).toBeVisible();
    await expect(page.locator('#btnFilterUpcoming')).toBeVisible();
    await expect(page.locator('#btnFilterPast')).toBeVisible();
    await expect(page.locator('.event-card-compact').first()).toBeVisible();

    // Test donation modal trigger
    await page.locator('#donateLiveBtn').click();
    await expect(page.locator('#donationModal')).toBeVisible();
  });

  test('should filter between upcoming and past streams in sidebar widget', async ({ page }) => {
    await page.goto('/live/');

    // Default filter is upcoming streams
    await expect(page.locator('#btnFilterUpcoming')).toHaveClass(/active/);
    await expect(page.locator('.event-card-compact').first()).toBeVisible();

    // Switch filter to past highlights
    await page.locator('#btnFilterPast').click();
    await expect(page.locator('#btnFilterPast')).toHaveClass(/active/);
    await expect(page.locator('.event-card-compact').first()).toBeVisible();
  });

  test('should detect OFFLINE status and display Next Stream Countdown overlay when manifest contains #EXT-X-ENDLIST', async ({ page }) => {
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
    await expect(page.locator('#nextStreamOverlayBox')).toBeVisible();
    await expect(page.locator('#countdownTimer')).toBeVisible();
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
