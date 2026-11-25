// tests/payment.spec.ts
// ─────────────────────────────────────────────────────────────
// JUSPAY HACKATHON — Data-Driven Payment Automation Suite
// Target: https://donate.smilefoundationindia.org/ → CCAvenue
//
// Automates 4 independent payment journeys to the second-factor
// authentication screen (3DS/OTP, Bank Auth, UPI QR, Wallet Auth).
// Each method runs as its own test so each produces its own video.
// ─────────────────────────────────────────────────────────────
import { test, expect } from '@playwright/test';
import { DonationPage } from '../pages/DonationPage';
import { PaymentPage } from '../pages/PaymentPage';
import { OTPPage } from '../pages/OTPPage';
import { ENV } from '../utils/env';

type PaymentMethod = 'Card' | 'Netbanking' | 'UPI' | 'Wallet';

const PAYMENT_METHODS: { method: PaymentMethod; description: string }[] = [
  { method: 'Card',       description: 'Credit/Debit Card → Gateway 3DS / Validation flow' },
  { method: 'Netbanking', description: 'Netbanking (SBI) → Bank Login / Auth page' },
  { method: 'UPI',        description: 'UPI → Payment-Pending QR screen (app approval)' },
  { method: 'Wallet',     description: 'Wallet (MobiKwik) → Wallet Login / Get OTP screen' },
];

for (const { method, description } of PAYMENT_METHODS) {
  test(`${method} Payment - ${description}`, async ({ page }) => {
    const donationPage = new DonationPage(page);
    const paymentPage = new PaymentPage(page);
    const otpPage = new OTPPage(page);

    // Step 1: Open guest donation page & fill details from .env
    await donationPage.open();
    await donationPage.fillDonorDetailsAndProceed({
      amount: ENV.DONOR_AMOUNT,
      name: ENV.DONOR_NAME,
      dob: ENV.DONOR_DOB,
      email: ENV.DONOR_EMAIL,
      phone: ENV.DONOR_PHONE,
      address: ENV.DONOR_ADDRESS,
      zipCode: ENV.DONOR_ZIP,
      pan: ENV.DONOR_PAN,
    });

    // Step 2: Wait for CCAvenue gateway & execute selected payment method
    await paymentPage.waitForGatewayReady();
    expect(page.url()).toContain('ccavenue.com');

    switch (method) {
      case 'Card':
        await paymentPage.payWithCard(ENV.CARD_NUMBER, ENV.CARD_EXPIRY, ENV.CARD_CVV);
        break;
      case 'Netbanking':
        await paymentPage.payWithNetbanking();
        break;
      case 'UPI':
        await paymentPage.payWithUPI();
        break;
      case 'Wallet':
        await paymentPage.payWithWallet();
        break;
    }

    // Step 3: Wait for & screenshot second-factor screen (stop before real payment)
    const secondFactorPage = await otpPage.waitForSecondFactor(method, 25_000);
    await otpPage.captureSecondFactor(secondFactorPage, method);

    // Optional Bonus: Human-in-the-loop OTP prompt (disabled by default via ENABLE_OTP_PROMPT=false)
    if (ENV.ENABLE_OTP_PROMPT && (method === 'Card' || method === 'Wallet')) {
      await otpPage.semiAutomatedOTPEntry(secondFactorPage);
    }

    // Assert we progressed past initial merchant form into gateway/second-factor
    expect(secondFactorPage.url()).not.toContain('smilefoundationindia.org');
  });
}
