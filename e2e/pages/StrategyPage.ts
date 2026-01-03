import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class StrategyPage extends BasePage {
  readonly addStrategyButton = 'button:has-text("Add Strategy")';
  readonly strategyForm = '[data-testid="strategy-form"]';
  readonly tokenAddressInput = 'input[name="targetToken"]';
  readonly amountInput = 'input[name="amountInSol"]';
  readonly submitButton = 'button[type="submit"]';
  readonly strategyList = '[data-testid="strategy-list"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/strategies');
  }

  async addSniperStrategy(tokenAddress: string, amount: string) {
    await this.click(this.addStrategyButton);
    await this.fill(this.tokenAddressInput, tokenAddress);
    await this.fill(this.amountInput, amount);
    await this.click(this.submitButton);
  }

  async verifyStrategyInList(tokenAddress: string) {
    await expect(this.page.locator(this.strategyList)).toContainText(tokenAddress);
  }
}
