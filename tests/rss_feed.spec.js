const { test, expect } = require('@playwright/test');

test.describe('RSS Feed Parser and Sanitizer', () => {
  test('should parse and render RSS feed, sanitizing invalid/malicious URLs', async ({ page }) => {
    const mockRssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
 <title>Digital Education &amp; Safety Foundation Feed</title>
 <link>https://digitaleducationsafety.org</link>
 <description>Latest updates from Digital Education &amp; Safety Foundation</description>
 <item>
  <title>Valid Post Title</title>
  <link>https://digitaleducationsafety.org/valid-post</link>
  <description>This is a valid post description.</description>
  <pubDate>Mon, 27 Jul 2026 12:00:00 GMT</pubDate>
  <media:content url="https://digitaleducationsafety.org/assets/img/valid.jpg" />
 </item>
 <item>
  <title>New Post</title>
  <link>https://digitaleducationsafety.org/placeholder-1</link>
  <description>Should be filtered out because title is "New Post".</description>
  <pubDate>Mon, 27 Jul 2026 12:00:00 GMT</pubDate>
 </item>
 <item>
  <title>test</title>
  <link>https://digitaleducationsafety.org/placeholder-2</link>
  <description>Should be filtered out because title is "test".</description>
  <pubDate>Mon, 27 Jul 2026 12:00:00 GMT</pubDate>
 </item>
 <item>
  <title>Malicious Post</title>
  <link>javascript:alert(1)</link>
  <description>Should not render the link button since URL protocol is malicious.</description>
  <pubDate>Mon, 27 Jul 2026 12:00:00 GMT</pubDate>
  <media:content url="javascript:alert(2)" />
 </item>
</channel>
</rss>`;

    // Route the RSS feed URL to our mock XML response
    await page.route('**/v1/relay?action=rss**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/xml',
        body: mockRssXml,
      });
    });

    // Navigate to the Social Media program page which includes the RSS feed
    await page.goto('/programs/4.html', { waitUntil: 'domcontentloaded' });

    // Wait for feed rendering to complete by verifying container has cards
    await page.waitForSelector('#rss-feed-container');

    // Wait until there's at least one RSS card rendered
    await page.waitForFunction(() => {
      return document.querySelectorAll('.rss-card').length > 0;
    }, { timeout: 10000 });

    const rssCards = page.locator('.rss-card');
    const count = await rssCards.count();

    // 1. Valid Post and Malicious Post should render as cards (total 2).
    // Placeholder posts should be skipped.
    expect(count).toBe(2);

    // 2. Verify Valid Post is fully and correctly rendered
    const validCard = rssCards.nth(0);
    const validTitle = await validCard.locator('.card-title').textContent();
    expect(validTitle.trim()).toBe('Valid Post Title');

    const validImg = validCard.locator('.card-img-top');
    await expect(validImg).toHaveAttribute('src', 'https://digitaleducationsafety.org/assets/img/valid.jpg');

    const validBtn = validCard.locator('a.btn');
    await expect(validBtn).toBeVisible();
    await expect(validBtn).toHaveAttribute('href', 'https://digitaleducationsafety.org/valid-post');

    // 3. Verify Malicious Post is parsed but handles invalid URLs safely
    const maliciousCard = rssCards.nth(1);
    const maliciousTitle = await maliciousCard.locator('.card-title').textContent();
    expect(maliciousTitle.trim()).toBe('Malicious Post');

    // The image should fallback to standard /assets/img/logo.jpg because the javascript: url is invalid
    const maliciousImg = maliciousCard.locator('.card-img-top');
    await expect(maliciousImg).toHaveAttribute('src', '/assets/img/logo.jpg');

    // The link button should NOT be rendered since the URL protocol is invalid
    const maliciousBtn = maliciousCard.locator('a.btn');
    await expect(maliciousBtn).not.toBeVisible();
  });
});
