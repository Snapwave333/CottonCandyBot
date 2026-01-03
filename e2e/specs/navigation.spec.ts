import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { StrategyPage } from '../pages/StrategyPage';
import { WalletLabPage } from '../pages/WalletLabPage';

test.describe('Navigation and Rendering', () => {
  test('should load the dashboard and display critical components', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await expect(page).toHaveTitle(/Cotton Candy/);
    await dashboardPage.verifyDashboardItems();
  });

  test('should navigate to strategy page and display configuration', async ({ page }) => {
    const strategyPage = new StrategyPage(page);
    await strategyPage.goto();
    await expect(page.locator(strategyPage.addStrategyButton)).toBeVisible();
  });

  test('should navigate to wallet lab and display swarm tools', async ({ page }) => {
    const walletLabPage = new WalletLabPage(page);
    await walletLabPage.goto();
    await expect(page.locator(walletLabPage.createSwarmButton)).toBeVisible();
  });
});
