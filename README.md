# 🎯 Juspay Campus Hackathon — Payment Automation Suite

> **Automated end-to-end payment journey testing across 4 payment methods on a live Indian web application using Playwright + TypeScript (Page Object Model).**

---

## 📌 Project Overview

This project automates the guest checkout and payment flow on **[Smile Foundation](https://donate.smilefoundationindia.org/)**, which processes payments through the **CCAvenue Payment Gateway** (`secure.ccavenue.com`).

Each payment method runs as an independent, data-driven Playwright test that navigates from the guest donation form to the **second-factor authentication screen** (Bank Login, UPI QR/Pending screen, Wallet OTP, or Card 3DS/OTP) and stops safely before any real money moves.

### Payment Methods Automated
| Method | Gateway Option | Screen Reached (Honest Status) | Video Recording |
|---|---|---|---|
| 🏦 **Netbanking (SBI)** | `#OPTNBK` | **State Bank of India Online Login Page** (authentic bank auth page) | `videos/netbanking-payment.webm` |
| 👛 **Wallet (MobiKwik)** | `#OPTWLT` | **MobiKwik Wallet Login & "Get OTP" screen** (authentic OTP prompt) | `videos/wallet-payment.webm` |
| 📱 **UPI** | `#OPTUPI` | **Payment-Pending QR screen** with 5-min timer (not a second-factor page; real approval happens in the UPI app) | `videos/upi-payment.webm` |
| 💳 **Credit/Debit Card** | `#OPTCRDC` | Enters test card & submits; dummy card `4111...1111` hits CCAvenue's error screen in live mode (a real card in `.env` reaches Bank 3DS/OTP) | `videos/card-payment.webm` |

---

## 🛠️ Tech Stack & Why

| Tool | Version | Why Chosen |
|---|---|---|
| **Playwright Test** | `^1.65.1` | Reliable auto-waiting, native video/trace/HTML report generation, multi-tab/popup support |
| **TypeScript** | `^7.0.2` | Strong typing for Page Objects and test data |
| **Node.js** | `18+` | Fast, cross-platform runtime |
| **dotenv** | `^18.0.10` | Keeps test/donor/card values out of source code |

**Architecture:** **Page Object Model (POM)** — locators live strictly inside `pages/`, test logic stays clean in `tests/`, and shared utilities live in `utils/`.

---

## ✅ Prerequisites

```bash
node --version   # Node.js 18+
npm --version    # npm 8+
```

---

## 🚀 Setup & Installation (Fresh Machine)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd JuspQE

# 2. Install dependencies & Chromium browser
npm install && npx playwright install chromium

# 3. Create your local .env from the template
cp .env.example .env
```

### Environment Variables (`.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `BASE_URL` | Target web application URL | `https://donate.smilefoundationindia.org` |
| `DONOR_AMOUNT` | Donation amount (minimum ₹500 on site; stopped before payment) | `500` |
| `DONOR_NAME` | Guest donor name | `Test User` |
| `DONOR_DOB` | Date of birth (`YYYY-MM-DD`) | `1999-01-01` |
| `DONOR_EMAIL` | Guest email | `testqa@example.com` |
| `DONOR_PHONE` | 10-digit test mobile number | `9876543210` |
| `DONOR_ADDRESS` | Street address | `123 MG Road` |
| `DONOR_ZIP` | Postal code | `744101` |
| `DONOR_PAN` | Test PAN format | `ABCDE1234F` |
| `CARD_NUMBER` | Test Visa card number (no real charge) | `4111111111111111` |
| `CARD_EXPIRY` | Expiry (`MM/YY`) | `12/28` |
| `CARD_CVV` | 3-digit CVV | `123` |
| `UPI_ID` | Test UPI handle | `test@upi` |
| `WALLET_MOBILE` | Test wallet mobile | `9876543210` |

> ⚠️ **Security:** `.env` is excluded by `.gitignore`. Never commit real card numbers, real PANs, or personal credentials.

---

## ▶️ Running the Tests

```bash
# Run all 4 payment methods (headed mode, slowMo, videos & HTML report enabled)
npm test

# Run a single payment method
npm run test:card
npm run test:netbanking
npm run test:upi
npm run test:wallet

# Run a single test by title
npx playwright test --grep "Netbanking"

# Open the HTML test report
npm run report
```

---

## 📁 Where Artifacts Are Saved

- **Final Demo Videos:** `videos/` (`card-payment.webm`, `netbanking-payment.webm`, `upi-payment.webm`, `wallet-payment.webm`)
- **Raw Playwright Videos & Traces:** `test-results/<test-name>/video.webm` and `trace.zip`
- **Second-Factor Screenshots:** `test-results/screenshots/second-factor-*.png`
- **HTML Report:** `playwright-report/index.html` (view with `npm run report`)

---

## 🔐 OTP Handling & Limitations (Honest Assessment)

- **No Real Money / No Security Bypass:** All flows stop before any transaction is authorized.
- **Netbanking & Wallet:** Reach authentic live second-factor / authentication screens (**SBI Personal Banking Login** and **MobiKwik Get OTP**).
- **UPI Limitation:** UPI reaches the **payment-pending QR waiting screen** (`Scan and Pay`), which is **not** a second-factor page—the actual second-factor approval happens inside the user's mobile UPI app.
- **Card Limitation:** Because CCAvenue is running in **live production mode**, the dummy Visa test card (`4111111111111111`) fails live BIN/gateway validation and displays CCAvenue's error screen rather than a bank 3DS/OTP page. Using a valid card in `.env` reaches the bank 3DS/OTP screen, but we intentionally do **not** include or record real card numbers.

---

## 📂 Project Structure

```
JuspQE/
├── pages/
│   ├── BasePage.ts          # Shared navigation & base helpers
│   ├── DonationPage.ts      # Guest checkout form on Smile Foundation
│   ├── PaymentPage.ts       # CCAvenue payment method selectors & actions
│   └── OTPPage.ts           # Second-factor detection (URL, popup, UI) & screenshots
├── tests/
│   └── payment.spec.ts      # Data-driven spec covering Card, Netbanking, UPI, Wallet
├── utils/
│   ├── env.ts               # Environment variable loader
│   └── helpers.ts           # Screenshot & frame helpers
├── videos/                  # Final recorded .webm videos for submission
├── playwright.config.ts     # Headed mode, slowMo: 800, video: 'on', trace: 'on'
├── tsconfig.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🧩 Challenges Faced & How I Solved Them

1. **Initial Target Blocked Automation with Mandatory Email 2FA:** Initially explored an ed-tech checkout (`indianbackpacker.in`), which enforced Email 2FA OTP on every new browser login. Switched to a true **guest-checkout** live application (`donate.smilefoundationindia.org` → **CCAvenue**) so anyone can clone and run `npm test` unattended on a fresh machine.
2. **Dynamic Cascading State → City Dropdown:** Selecting a State dynamically populates `#city` asynchronously. Solved with `page.waitForFunction()` waiting for `options.length > 1` before selecting a city.
3. **Hidden Duplicate Buttons & Intercepted Radio Labels on CCAvenue:** `#make-payment-net-banking` existed in 3 hidden/visible tabs and `<label for="wallet-0">` intercepted clicks on the radio input. Scoped locators using `:visible` and clicked `label[for="wallet-0"]` directly.
4. **Cross-Method Second-Factor Detection:** Different payment methods present second-factor differently (page redirect for SBI/MobiKwik vs. same-page QR timer for UPI). Built `OTPPage.waitForSecondFactor()` to detect new tabs/popups, URL redirects, and UI indicators uniformly.

---

## 🎬 Demo Videos (Submission Links)

- **Card Payment Flow:** `videos/card-payment.webm` — _[Add Drive/YouTube link]_
- **Netbanking (SBI) Flow:** `videos/netbanking-payment.webm` — _[Add Drive/YouTube link]_
- **UPI QR Flow:** `videos/upi-payment.webm` — _[Add Drive/YouTube link]_
- **Wallet (MobiKwik) Flow:** `videos/wallet-payment.webm` — _[Add Drive/YouTube link]_
- **Terminal Execution Recording:** _[Add Drive/YouTube link]_
