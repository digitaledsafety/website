const { test, expect } = require('@playwright/test');

const sampleEvents = [
  {
    "id": "event-1",
    "title": "Empowering Underserved Communities with Open-Source STEM Tools",
    "description": "Learn how modern open-source software and low-cost hardware can transform STEM education.",
    "start_utc": "2027-04-15T18:00:00Z",
    "start": "2027-04-15T18:00:00Z",
    "end": "2027-04-15T19:30:00Z",
    "url": "https://digitaleducationandsafety.org/live/",
    "speaker": "Digital Education & Safety Team"
  },
  {
    "id": "event-4",
    "title": "Introduction to Robotics and IoT for Beginners",
    "description": "Past workshop recap and Q&A covering microcontroller basics.",
    "start_utc": "2024-03-10T17:00:00Z",
    "start": "2024-03-10T17:00:00Z",
    "end": "2024-03-10T18:30:00Z",
    "url": "https://digitaleducationandsafety.org/live/",
    "speaker": "Robotics Club Mentors"
  }
];

test.describe('Live Stream Page', () => {
  test.beforeEach(async ({ page }) => {
    // Route primary API calls to return test dataset deterministically
    await page.route('**/relay?action=odata*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: sampleEvents })
      });
    });
  });

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

  test('should sort past events descending by start date and limit to top 5', async ({ page }) => {
    const multiPastEvents = [
      { id: 'p1', title: 'Past Stream 2021', start_utc: '2021-01-01T12:00:00Z', start: '2021-01-01T12:00:00Z' },
      { id: 'p2', title: 'Past Stream 2022', start_utc: '2022-01-01T12:00:00Z', start: '2022-01-01T12:00:00Z' },
      { id: 'p3', title: 'Past Stream 2023', start_utc: '2023-01-01T12:00:00Z', start: '2023-01-01T12:00:00Z' },
      { id: 'p4', title: 'Past Stream 2024-01', start_utc: '2024-01-01T12:00:00Z', start: '2024-01-01T12:00:00Z' },
      { id: 'p5', title: 'Past Stream 2024-02', start_utc: '2024-02-01T12:00:00Z', start: '2024-02-01T12:00:00Z' },
      { id: 'p6', title: 'Past Stream 2024-03', start_utc: '2024-03-01T12:00:00Z', start: '2024-03-01T12:00:00Z' },
      { id: 'p7', title: 'Past Stream 2024-04', start_utc: '2024-04-01T12:00:00Z', start: '2024-04-01T12:00:00Z' },
    ];

    await page.route('**/relay?action=odata*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: multiPastEvents })
      });
    });

    await page.goto('/live/');
    await page.locator('#btnFilterPast').click();

    const cards = page.locator('.event-card-compact');
    await expect(cards).toHaveCount(5);

    // Most recent (p7: 2024-04) should be first
    await expect(cards.nth(0)).toContainText('Past Stream 2024-04');
    await expect(cards.nth(1)).toContainText('Past Stream 2024-03');
    await expect(cards.nth(2)).toContainText('Past Stream 2024-02');
    await expect(cards.nth(3)).toContainText('Past Stream 2024-01');
    await expect(cards.nth(4)).toContainText('Past Stream 2023');
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
