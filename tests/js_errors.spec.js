const { test, expect } = require('@playwright/test');

test.describe('JavaScript Error Check', () => {
  test('should load default layout pages without throwing JS errors', async ({ page }) => {
    const errors = [];
    const consoleErrors = [];

    // Listen for unhandled exceptions
    page.on('pageerror', (exception) => {
      const msg = exception.message;
      // Filter out third-party/external exceptions
      if (!msg.includes('CookieYes') && !msg.includes('Turnstile') && !msg.includes('turnstile')) {
        errors.push(msg);
      }
    });

    // Listen for console error messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore network failures or third-party tracking/cookie blocks
        if (!text.includes('Failed to load resource') &&
            !text.includes('turnstile') &&
            !text.includes('CookieYes') &&
            !text.includes('cookieyes')) {
          consoleErrors.push(text);
        }
      }
    });

    // Navigate to a page that uses the default layout and does not contain the PayPal donate button
    // e.g. Open Source page
    await page.goto('/open-source.html', { waitUntil: 'domcontentloaded' });

    // Wait a brief moment to ensure all scripts execute
    await page.waitForTimeout(2000);

    // Verify no unhandled page errors occurred
    expect(errors).toEqual([]);

    // Verify no critical console errors occurred
    expect(consoleErrors).toEqual([]);
  });
});
