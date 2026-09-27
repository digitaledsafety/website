const { test, expect } = require('@playwright/test');

test.describe('Social Media Program Livestream Card', () => {
  test('should render livestream card and link to /live/', async ({ page }) => {
    await page.goto('/programs/4.html');

    // Check heading
    await expect(page.locator('#digital-advocacy--community-building')).toContainText('Digital Advocacy & Community Building');

    // Check card title and link
    const cardTitle = page.locator('.card-title', { hasText: 'Foundation Livestream' });
    await expect(cardTitle).toBeVisible();

    const liveBtn = page.locator('a[href="/live/"]');
    await expect(liveBtn).toBeVisible();
    await expect(liveBtn).toContainText('Watch Live Stream');

    // Take screenshot for verification
    await page.screenshot({ path: 'tests/social_media_live.png', fullPage: true });

    // Click link and verify navigation to live page
    await liveBtn.click();
    await expect(page).toHaveURL(/\/live\/?$/);
    await expect(page.locator('h1')).toContainText('Foundation Live Stream');
  });
});
