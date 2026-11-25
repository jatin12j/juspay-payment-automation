import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env file — real credentials never go in this file
dotenv.config();

const authFile = 'auth.json';
const hasAuth = fs.existsSync(authFile);

export default defineConfig({
  // ── Where are the tests? ──────────────────────────────────
  testDir: './tests',

  // ── Run tests one at a time (so videos are clear) ─────────
  workers: 1,

  // ── Don't retry on failure (clean honest results) ─────────
  retries: 0,

  // ── Timeout per test: 2 minutes ───────────────────────────
  timeout: 120_000,

  // ── HTML report generated in playwright-report/ ───────────
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']   // also print results in terminal
  ],

  use: {
    // ── Target website ─────────────────────────────────────
    baseURL: process.env.BASE_URL || 'https://donate.smilefoundationindia.org',

    // ── Run with browser visible (headed mode) ─────────────
    headless: false,

    // ── Slow things down so videos are readable ────────────
    launchOptions: {
      slowMo: 800,
    },

    // ── Record video of EVERY test ─────────────────────────
    video: 'on',

    // ── Screenshot on failure ──────────────────────────────
    screenshot: 'only-on-failure',

    // ── Full trace for debugging ───────────────────────────
    trace: 'on',

    // ── Browser window size ────────────────────────────────
    viewport: { width: 1280, height: 720 },

    // ── Wait up to 30s for elements to appear ─────────────
    actionTimeout: 30_000,
    navigationTimeout: 60_000,

    // ── Ignore SSL errors (some production sites have cert issues) ─
    ignoreHTTPSErrors: true,

    // ── Re-use saved login session if available ───────────
    storageState: hasAuth ? authFile : undefined,
  },

  // ── Save all test artifacts here ──────────────────────────
  outputDir: 'test-results',

  // ── Run only on Chromium (Chrome) ─────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
