// pages/DonationPage.ts
// ─────────────────────────────────────────────────────────────
// Page Object for Smile Foundation's Guest Donation Form
// URL: https://donate.smilefoundationindia.org/
//
// No login or CAPTCHA required. Filling this guest form
// redirects directly to the CCAvenue Payment Gateway.
// ─────────────────────────────────────────────────────────────
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface DonorDetails {
  amount: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  pan: string;
}

export class DonationPage extends BasePage {
  private readonly amountInput  = this.page.locator('#amount');
  private readonly nameInput    = this.page.locator('input[placeholder="Enter Full name"]');
  private readonly dobInput     = this.page.locator('input[placeholder="Enter Date Of Birth"]');
  private readonly emailInput   = this.page.locator('input[placeholder="Enter Email"]');
  private readonly phoneInput   = this.page.locator('input[placeholder="Enter Phone"]');
  private readonly countrySelect = this.page.locator('#country');
  private readonly stateSelect  = this.page.locator('#state');
  private readonly citySelect   = this.page.locator('#city');
  private readonly addressInput = this.page.locator('#address_1');
  private readonly zipInput     = this.page.locator('#zip_code');
  private readonly panInput     = this.page.locator('#txtpan');
  private readonly donateButton = this.page.locator('button:has-text("Donate")').last();

  constructor(page: Page) {
    super(page);
  }

  /** Open the guest donation page */
  async open(): Promise<void> {
    await this.goto('/');
    await this.amountInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  /** Fill donor details and submit to launch CCAvenue gateway */
  async fillDonorDetailsAndProceed(donor: DonorDetails): Promise<void> {
    await this.amountInput.fill(donor.amount);
    await this.nameInput.fill(donor.name);
    await this.dobInput.fill(donor.dob);
    await this.emailInput.fill(donor.email);
    await this.phoneInput.fill(donor.phone);

    await this.countrySelect.selectOption({ label: 'India' });
    await this.stateSelect.selectOption({ index: 1 });
    // Selecting a state dynamically populates #city dropdown
    await this.citySelect.waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForFunction(() => {
      const sel = document.querySelector('#city') as HTMLSelectElement | null;
      return sel && sel.options.length > 1;
    }, { timeout: 10_000 });
    await this.citySelect.selectOption({ index: 1 });

    await this.addressInput.fill(donor.address);
    await this.zipInput.fill(donor.zipCode);
    await this.panInput.fill(donor.pan);

    await this.donateButton.scrollIntoViewIfNeeded();
    await this.donateButton.click();

    // Wait for redirect to CCAvenue checkout
    await this.page.waitForURL(/ccavenue\.com/i, { timeout: 30_000 });
  }
}
