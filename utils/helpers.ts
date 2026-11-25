// utils/helpers.ts
// ─────────────────────────────────────────────────────────────
// Shared helper functions used across all page objects & tests
// ─────────────────────────────────────────────────────────────
import { Page, FrameLocator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Wait for Razorpay iframe to appear and return it.
 * Razorpay always loads inside: iframe.razorpay-checkout-frame
 */
export async function getRazorpayFrame(page: Page): Promise<FrameLocator> {
  // Wait for the iframe to appear in the DOM
  await page.waitForSelector('iframe.razorpay-checkout-frame', {
    timeout: 30_000,
    state: 'attached',
  });
  return page.frameLocator('iframe.razorpay-checkout-frame');
}

/**
 * Take a screenshot and save it with a descriptive name.
 * Screenshots go to: test-results/screenshots/
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const dir = path.join('test-results', 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = path.join(dir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
}

/**
 * Detect if the second-factor (OTP/3DS/bank auth) page is visible.
 * Works whether it's an iframe, popup, or same-page redirect.
 * Returns true if found.
 */
export async function isSecondFactorPageVisible(page: Page): Promise<boolean> {
  const indicators = [
    'text=/OTP/i',
    'text=/One Time Password/i',
    'text=/3D Secure/i',
    'text=/Authentication/i',
    'text=/Verify/i',
    'text=/Enter.*code/i',
    'input[placeholder*="OTP"]',
    'input[placeholder*="otp"]',
    'input[name*="otp"]',
  ];

  for (const selector of indicators) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 2000 })) {
        console.log(`✅ Second-factor page detected via: ${selector}`);
        return true;
      }
    } catch {
      // Not found, try next
    }
  }
  return false;
}

/**
 * Wait for page navigation / network to settle
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // small buffer for JS to render
}
