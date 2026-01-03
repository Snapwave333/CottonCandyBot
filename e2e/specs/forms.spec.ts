import { test, expect } from '@playwright/test';
import { StrategyPage } from '../pages/StrategyPage';
import { WalletLabPage } from '../pages/WalletLabPage';

test.describe('Form Submissions', () => {
  test('should create a new sniper strategy', async ({ page }) => {
    const strategyPage = new StrategyPage(page);
    await strategyPage.goto();
    
    const mockToken = 'EPjFW36Rc7H1fxb2VGq6nrURJcBvch59MuDTR8ne926V'; // Mock USDC for demo
    await strategyPage.addSniperStrategy(mockToken, '0.1');
    
    // In paper mode, we expect it to show up in the list
    await strategyPage.verifyStrategyInList(mockToken);
  });

  test('should create a swarm of wallets', async ({ page }) => {
    const walletLabPage = new WalletLabPage(page);
    await walletLabPage.goto();
    
    const swarmCount = '5';
    await walletLabPage.createSwarm(swarmCount);
    
    // Verify the UI updates to show the correct number of wallets
    // This assumes the backend is running and responds with new wallets
    await walletLabPage.verifyWalletsCreated(Number(swarmCount));
  });
});
