import { test, expect } from '@playwright/test';
import path from 'path';

test('capture dashboard screenshot', async ({ page }) => {
  // Navigate to the dashboard
  await page.goto('http://localhost:3000');
  
  // Wait for the specific loaded state
  await page.waitForSelector('.dashboard-loaded', { timeout: 30000 });
  
  // Wait for animations and network to settle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Verify the selector is present
  const dashboard = await page.$('.dashboard-loaded');
  expect(dashboard).not.toBeNull();
  
  // Capture full-page screenshot
  const screenshotPath = path.join(process.cwd(), 'public/assets/screenshots/dashboard-live.png');
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true,
    quality: 90,
    type: 'png'
  });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
});
