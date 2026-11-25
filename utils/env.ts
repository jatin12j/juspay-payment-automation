// utils/env.ts
// ─────────────────────────────────────────────────────────────
// Loads environment variables from .env
// No sensitive credentials are ever hardcoded in tests
// ─────────────────────────────────────────────────────────────
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  BASE_URL:     process.env.BASE_URL     || 'https://donate.smilefoundationindia.org',
  DONOR_AMOUNT: process.env.DONOR_AMOUNT || '500',
  DONOR_NAME:   process.env.DONOR_NAME   || 'Test User',
  DONOR_DOB:    process.env.DONOR_DOB    || '1999-01-01',
  DONOR_EMAIL:  process.env.DONOR_EMAIL  || 'testqa@example.com',
  DONOR_PHONE:  process.env.DONOR_PHONE  || '9876543210',
  DONOR_ADDRESS:process.env.DONOR_ADDRESS|| '123 MG Road',
  DONOR_ZIP:    process.env.DONOR_ZIP    || '744101',
  DONOR_PAN:    process.env.DONOR_PAN    || 'ABCDE1234F',

  CARD_NUMBER:  process.env.CARD_NUMBER  || '4111111111111111',
  CARD_EXPIRY:  process.env.CARD_EXPIRY  || '12/28',
  CARD_CVV:     process.env.CARD_CVV     || '123',
  UPI_ID:       process.env.UPI_ID       || 'test@upi',
  WALLET_MOBILE:process.env.WALLET_MOBILE|| '9876543210',
};
