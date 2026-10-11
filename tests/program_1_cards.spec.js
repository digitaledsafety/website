const { test, expect } = require('@playwright/test');

test.describe('Program 1 Cards Verification', () => {
  test('should display GitHub Profile card and restore inline Scratch link', async ({ page }) => {
    await page.goto('/programs/1.html');

    // Verify inline link is present
    const inlineHereLink = page.locator('a[href="https://scratch.digitaleducationsafety.org"]', { hasText: 'here' });
    await expect(inlineHereLink).toBeVisible();

    // Verify Scratch Fork Card is absent
    const scratchCard = page.locator('.card', { hasText: 'Scratch Fork' });
    await expect(scratchCard).toHaveCount(0);

    // Verify GitHub Profile Card is present
    const githubCard = page.locator('.card', { hasText: 'GitHub Profile' });
    await expect(githubCard).toBeVisible();

    const githubBtn = githubCard.locator('a.btn');
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toHaveAttribute('href', 'https://github.com/digitaledsafety');
    await expect(githubBtn).toHaveText('Visit GitHub');
  });
});
