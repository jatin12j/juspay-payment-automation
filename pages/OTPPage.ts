// pages/OTPPage.ts
// ─────────────────────────────────────────────────────────────
// Detects the Second-Factor Authentication screen across all
// payment methods (Card 3DS/OTP, Bank Login, UPI QR/Timer, Wallet Auth),
// including same-page redirects, iframes, and new tabs/popups.
// ─────────────────────────────────────────────────────────────
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { takeScreenshot } from '../utils/helpers';

export class OTPPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for second-factor page across all open pages/popups/iframes:
   * - Redirect away from CCAvenue checkout page (bank/3DS/wallet portal)
   * - Or OTP/3DS/QR/timer indicators on the current page or popup
   */
  async waitForSecondFactor(method: string, timeoutMs: number = 25_000): Promise<Page> {
    const startUrl = this.page.url();
    const deadline = Date.now() + timeoutMs;

    const indicators = [
      'text=/otp/i',
      'text=/one.?time.?password/i',
      'text=/3d.?secure/i',
      'text=/authenticate/i',
      'text=/verify/i',
      'text=/scan.*qr/i',
      'text=/upi/i',
      'text=/transaction.*declined/i',
      'text=/invalid.*card/i',
      'input[placeholder*="OTP" i]',
      'input[name*="otp" i]',
      'img[src*="qr" i], canvas',
    ];

    while (Date.now() < deadline) {
      const pages = this.page.context().pages();

      // 1. Check if a popup/new tab opened
      if (pages.length > 1) {
        const popup = pages[pages.length - 1];
        await popup.waitForLoadState('domcontentloaded').catch(() => {});
        console.log(`✅ [${method}] Second-factor popup detected: ${popup.url()}`);
        return popup;
      }

      // 2. Check if URL redirected away from CCAvenue initiateTransaction
      const currentUrl = this.page.url();
      if (currentUrl !== startUrl && !currentUrl.includes('command=initiateTransaction')) {
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        console.log(`✅ [${method}] Redirected to second-factor URL: ${currentUrl}`);
        return this.page;
      }

      // 3. Check for visible second-factor UI indicators (QR, 3DS iframe, OTP box)
      for (const sel of indicators) {
        const visible = await this.page.locator(sel).first().isVisible({ timeout: 300 }).catch(() => false);
        if (visible && (method === 'UPI' || this.page.url() !== startUrl || sel.includes('otp') || sel.includes('3d'))) {
          console.log(`✅ [${method}] Second-factor UI detected via: ${sel}`);
          return this.page;
        }
      }

      await this.page.waitForTimeout(800);
    }

    return this.page;
  }

  /** Capture full-page screenshot of the second-factor screen */
  async captureSecondFactor(targetPage: Page, method: string): Promise<void> {
    await targetPage.waitForTimeout(1500);
    await takeScreenshot(targetPage, `second-factor-${method.toLowerCase()}`);
  }
}
