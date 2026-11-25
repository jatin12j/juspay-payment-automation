// pages/BasePage.ts
// ─────────────────────────────────────────────────────────────
// Every page object extends this base class.
// Contains common actions shared across all pages.
// ─────────────────────────────────────────────────────────────
import { Page } from '@playwright/test';

export class BasePage {
  // 'page' is the Playwright browser page — like a browser tab
  constructor(protected page: Page) {}

  /** Navigate to a URL */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** Get the current page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Get the current URL */
  getCurrentUrl(): string {
    return this.page.url();
  }
}
