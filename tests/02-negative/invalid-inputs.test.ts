import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';

describe('02 - Negative Test Suite: Invalid Inputs & Constraint Validation', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should reject malformed CSV import missing required column headers or values', () => {
    const malformedCsv = `FlatNo,ContactNo
,9820000000
A-201,12345`; // Missing OwnerName, invalid format

    const processCsv = (csv: string) => {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const required = ['FlatNo', 'OwnerName', 'ContactNo'];
      const missing = required.filter(r => !headers.includes(r));

      if (missing.length > 0) {
        throw new Error(`Invalid CSV Schema: Missing mandatory column(s): ${missing.join(', ')}`);
      }
    };

    expect(() => processCsv(malformedCsv)).toThrow('Invalid CSV Schema: Missing mandatory column(s): OwnerName');
  });

  test('Should reject invalid phone number format', () => {
    const validatePhoneNumber = (phone: string) => {
      // Indian mobile phone regex (+91 XXXXX XXXXX or 10 digits starting with 6-9)
      const cleaned = phone.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

      if (!phoneRegex.test(cleaned)) {
        throw new Error('Validation Error: Phone number must be a valid 10-digit Indian mobile number with optional +91 prefix.');
      }
      return true;
    };

    const invalidPhoneNumbers = ['12345', 'ABC-98200', '+1 555-0199', '0000000000'];

    invalidPhoneNumbers.forEach(badPhone => {
      expect(() => validatePhoneNumber(badPhone)).toThrow('Validation Error: Phone number must be a valid 10-digit Indian mobile number with optional +91 prefix.');
    });

    // Valid phone numbers should pass
    expect(validatePhoneNumber('+91 98200 12345')).toBe(true);
    expect(validatePhoneNumber('9820012345')).toBe(true);
  });

  test('Should reject duplicate flat entry registration within same society', () => {
    const addFlatMember = (flatNo: string, ownerName: string) => {
      // Check if flat already exists in society
      const existing = Array.from(dbStore.members.values()).find(
        m => m.SocietyId === MOCK_SOCIETY_A.id && m.FlatNo.toLowerCase() === flatNo.toLowerCase()
      );

      if (existing) {
        throw new Error(`Duplicate Entry Error: Flat '${flatNo}' is already registered under ${existing.OwnerName} in this society.`);
      }

      const id = `mem_new_${Date.now()}`;
      dbStore.members.set(id, {
        id,
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: flatNo,
        OwnerName: ownerName,
        ContactNo: '+91 98200 98200',
        Email: 'test@example.com',
        Balance: 0,
        Status: 'Owner'
      });
    };

    // A-101 already exists in MOCK_SOCIETY_A setup
    expect(() => addFlatMember('A-101', 'Duplicate User')).toThrow(
      "Duplicate Entry Error: Flat 'A-101' is already registered under Rajesh Sharma in this society."
    );

    // Case-insensitive duplicate check
    expect(() => addFlatMember('a-101', 'Duplicate User Case')).toThrow(
      "Duplicate Entry Error: Flat 'a-101' is already registered under Rajesh Sharma in this society."
    );

    // Unregistered flat should pass
    expect(() => addFlatMember('C-909', 'New Owner')).not.toThrow();
  });
});
