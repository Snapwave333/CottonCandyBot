import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Visual Regression Testing', () => {
  test('dashboard layout should match baseline', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    // Wait for animations to settle if any
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('dashboard-layout.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('execution terminal should match baseline', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    
    const terminal = page.locator(dashboardPage.executionTerminal);
    await expect(terminal).toHaveScreenshot('execution-terminal.png');
  });
});
