import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly newsTicker = '[data-testid="news-ticker"]';
  readonly portfolioTable = '[data-testid="portfolio-table"]';
  readonly executionTerminal = '[data-testid="execution-terminal"]';
  readonly buyButton = 'button:has-text("Buy")';
  readonly sellButton = 'button:has-text("Sell")';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/');
  }

  async verifyDashboardItems() {
    await expect(this.page.locator(this.executionTerminal)).toBeVisible();
    await expect(this.page.locator(this.portfolioTable)).toBeVisible();
  }

  async executeTrade(side: 'BUY' | 'SELL', amount: string) {
    if (side === 'BUY') {
        await this.click(this.buyButton);
    } else {
        await this.click(this.sellButton);
    }
    // ... further interaction with trade modal/form if exists
  }
}
