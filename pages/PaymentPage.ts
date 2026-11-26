// pages/PaymentPage.ts
// ─────────────────────────────────────────────────────────────
// Page Object for CCAvenue Payment Gateway
// URL: https://secure.ccavenue.com/transaction/transaction.do
//
// Supports all 4 payment methods:
//   1. Card       (#OPTCRDC) → 3DS / Bank OTP page
//   2. Netbanking (#OPTNBK)  → Bank Login / Auth page
//   3. UPI        (#OPTUPI)  → UPI QR / Collect waiting screen
//   4. Wallet     (#OPTWLT)  → Wallet Auth / OTP page
// ─────────────────────────────────────────────────────────────
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PaymentPage extends BasePage {
  // Payment option tabs
  private readonly cardOption = this.page.locator('#OPTCRDC');
  private readonly netbankingOption = this.page.locator('#OPTNBK');
  private readonly walletOption = this.page.locator('#OPTWLT');
  private readonly upiOption = this.page.locator('#OPTUPI');

  // Card fields
  private readonly cardNumberInput = this.page.locator('#credit-card');
  private readonly cardExpiryInput = this.page.locator('#cardexpiry');
  private readonly cardCvvInput = this.page.locator('#cvvnumber');
  private readonly cardPayBtn = this.page.locator('a.makePayment:visible').first();

  // Netbanking fields
  private readonly bankSelect = this.page.locator('#netbanking-select');
  private readonly netbankingPayBtn = this.page.locator('#make-payment-net-banking.netbanking-btn:visible').first();

  // UPI fields
  private readonly generateQrBtn = this.page.locator('a.generate-btn:visible').first();

  // Wallet fields
  private readonly mobikwikRadio = this.page.locator('label[for="wallet-0"], label:has-text("Mobikwik")').first();
  private readonly walletPayBtn = this.page.locator('button.wallet-pay:visible').first();

  constructor(page: Page) {
    super(page);
  }

  /** Wait for CCAvenue payment options screen to be ready */
  async waitForGatewayReady(): Promise<void> {
    await this.cardOption.waitFor({ state: 'visible', timeout: 25_000 });
  }

  /** Card flow: select Card, fill test card details, click PAY NOW */
  async payWithCard(cardNumber: string, expiry: string, cvv: string): Promise<void> {
    await this.cardOption.click();
    await this.cardNumberInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.cardNumberInput.fill(cardNumber);
    await this.cardExpiryInput.fill(expiry);
    await this.cardCvvInput.fill(cvv);
    await this.cardPayBtn.click();
  }

  /** Netbanking flow: select Netbanking, choose State Bank of India, click PAY NOW */
  async payWithNetbanking(): Promise<void> {
    await this.netbankingOption.click();
    await this.bankSelect.waitFor({ state: 'visible', timeout: 10_000 });
    await this.bankSelect.selectOption({ index: 1 });
    await this.netbankingPayBtn.click();
  }

  /** UPI flow: select UPI and generate QR / second-factor waiting screen */
  async payWithUPI(): Promise<void> {
    await this.upiOption.click();
    await this.generateQrBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.generateQrBtn.click();
  }

  /** Wallet flow: select Wallet, pick Mobikwik, click PAY NOW */
  async payWithWallet(): Promise<void> {
    await this.walletOption.click();
    await this.mobikwikRadio.waitFor({ state: 'visible', timeout: 10_000 });
    await this.mobikwikRadio.click();
    await this.walletPayBtn.click();
  }
}
