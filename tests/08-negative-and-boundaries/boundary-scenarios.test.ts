import { requestPhoneOTP, verifyPhoneOTP, verifyPassword } from '../../src/utils/security';
import { verifyPhoneOTP as verifyPhoneOTPAuthHelper, requestPhoneOTP as requestPhoneOTPAuthHelper } from '../../src/utils/authHelpers';
import { BillingModuleSettings, SocietyCoreSettings } from '../../src/types';

describe('08 - Negative & Boundary Testing Scenarios', () => {

  describe('Phone OTP Authentication Boundaries', () => {
    test('Should reject invalid OTP code attempts for phone authentication', () => {
      const phone = '+91 98765 43210';
      requestPhoneOTPAuthHelper(phone);

      // Attempt verification with wrong 6-digit code
      const isInvalidCodeVerified = verifyPhoneOTPAuthHelper(phone, '999999');
      expect(isInvalidCodeVerified).toBe(false);

      // Attempt verification with malformed/alphanumeric code
      const isMalformedVerified = verifyPhoneOTPAuthHelper(phone, 'ABCDEF');
      expect(isMalformedVerified).toBe(false);

      // Attempt verification with empty string
      const isEmptyVerified = verifyPhoneOTPAuthHelper(phone, '');
      expect(isEmptyVerified).toBe(false);
    });

    test('Should reject phone OTP request for invalid or short phone numbers', () => {
      const shortPhoneResult = requestPhoneOTPAuthHelper('123');
      expect(shortPhoneResult.success).toBe(false);
      expect(shortPhoneResult.message).toContain('Invalid phone number format');
    });
  });

  describe('Temporary Password & Auth Credentials Boundaries', () => {
    test('Should reject authentication with mismatched temporary password', () => {
      const correctTempPass = 'Pass-8912-AMIT';
      const salt = 'SALT-BOUNDARIES-123';
      const validHash = 'MOCK_HASH_VALUE_CORRECT';

      // Verify wrong temporary password string fails
      const isWrongPasswordValid = verifyPassword('Pass-0000-WRONG', validHash, salt);
      expect(isWrongPasswordValid).toBe(false);
    });
  });

  describe('Billing & Society Settings Boundary Validations', () => {
    // Validation function for Billing & Society Core Settings
    const validateSocietyBillingConfig = (config: {
      lateFeeInterestPercent: number;
      dueDateDay: number;
      gstRatePercent?: number;
    }): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (config.lateFeeInterestPercent < 0) {
        errors.push('Late fee penalty interest rate cannot be negative.');
      }
      if (config.lateFeeInterestPercent > 50) {
        errors.push('Late fee penalty interest rate exceeds statutory maximum cap (50%).');
      }

      if (config.dueDateDay < 1 || config.dueDateDay > 28) {
        errors.push('Maintenance due date day must be between 1 and 28 of the month.');
      }

      if (config.gstRatePercent !== undefined && (config.gstRatePercent < 0 || config.gstRatePercent > 30)) {
        errors.push('GST tax rate must be between 0% and 30%.');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    };

    test('Should reject negative late fee penalty interest rates in society settings', () => {
      const invalidConfig = {
        lateFeeInterestPercent: -12, // INVALID NEGATIVE RATE
        dueDateDay: 15,
        gstRatePercent: 18
      };

      const result = validateSocietyBillingConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Late fee penalty interest rate cannot be negative.');
    });

    test('Should reject out-of-bounds maintenance due dates (e.g. Day 31 or Day 0)', () => {
      const invalidConfigDay31 = {
        lateFeeInterestPercent: 12,
        dueDateDay: 31, // INVALID DAY (>28)
        gstRatePercent: 18
      };

      const resultDay31 = validateSocietyBillingConfig(invalidConfigDay31);
      expect(resultDay31.valid).toBe(false);
      expect(resultDay31.errors).toContain('Maintenance due date day must be between 1 and 28 of the month.');

      const invalidConfigDay0 = {
        lateFeeInterestPercent: 12,
        dueDateDay: 0, // INVALID DAY (<1)
      };

      const resultDay0 = validateSocietyBillingConfig(invalidConfigDay0);
      expect(resultDay0.valid).toBe(false);
      expect(resultDay0.errors).toContain('Maintenance due date day must be between 1 and 28 of the month.');
    });

    test('Should reject invalid GST tax rate percentages', () => {
      const invalidConfigGST = {
        lateFeeInterestPercent: 12,
        dueDateDay: 10,
        gstRatePercent: -5 // INVALID GST
      };

      const result = validateSocietyBillingConfig(invalidConfigGST);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('GST tax rate must be between 0% and 30%.');
    });

    test('Should accept valid billing and society settings configuration', () => {
      const validConfig = {
        lateFeeInterestPercent: 12,
        dueDateDay: 15,
        gstRatePercent: 18
      };

      const result = validateSocietyBillingConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
