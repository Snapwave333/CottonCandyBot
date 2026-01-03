import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class WalletLabPage extends BasePage {
  readonly createSwarmButton = 'button:has-text("Create Swarm")';
  readonly swarmCountInput = 'input[type="number"]';
  readonly confirmSwarmButton = 'button:has-text("Confirm")';
  readonly walletGrid = '[data-testid="wallet-grid"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/wallet-lab');
  }

  async createSwarm(count: string) {
    await this.click(this.createSwarmButton);
    await this.fill(this.swarmCountInput, count);
    await this.click(this.confirmSwarmButton);
  }

  async verifyWalletsCreated(count: number) {
    const wallets = this.page.locator('[data-testid="wallet-card"]');
    await expect(wallets).toHaveCount(count);
  }
}
