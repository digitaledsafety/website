const { test, expect } = require('@playwright/test');

test.describe('Program 1 Cards Verification', () => {
  test('should display Scratch Fork and GitHub Profile cards without inline link', async ({ page }) => {
    await page.goto('/programs/1.html');

    // Verify inline link is not present
    const inlineHereLink = page.locator('a[href="https://scratch.digitaleducationsafety.org"]', { hasText: 'here' });
    await expect(inlineHereLink).toHaveCount(0);

    // Verify Scratch Fork Card
    const scratchCard = page.locator('.card', { hasText: 'Scratch Fork' });
    await expect(scratchCard).toBeVisible();

    const scratchBtn = scratchCard.locator('a.btn');
    await expect(scratchBtn).toBeVisible();
    await expect(scratchBtn).toHaveAttribute('href', 'https://scratch.digitaleducationsafety.org');
    await expect(scratchBtn).toHaveText('Launch Scratch');

    // Verify GitHub Profile Card
    const githubCard = page.locator('.card', { hasText: 'GitHub Profile' });
    await expect(githubCard).toBeVisible();

    const githubBtn = githubCard.locator('a.btn');
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toHaveAttribute('href', 'https://github.com/digitaledsafety');
    await expect(githubBtn).toHaveText('Visit GitHub');
  });
});
