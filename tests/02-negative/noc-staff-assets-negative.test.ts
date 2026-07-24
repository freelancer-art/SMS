import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';

describe('02 - Negative Test Suite: NOC Clearance, Staff Entry, and Asset Restrictions', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should block NOC approval if flat has unpaid maintenance dues', () => {
    // Member Priya Verma in A-102 has balance ₹3,500
    const member102 = dbStore.members.get('mem_a_102');
    expect(member102.Balance).toBeGreaterThan(0);

    const validateNocClearance = (flatNo: string): { allowed: boolean; reason?: string } => {
      const member = Array.from(dbStore.members.values()).find(
        m => m.SocietyId === MOCK_SOCIETY_A.id && m.FlatNo === flatNo
      );

      if (!member) {
        return { allowed: false, reason: 'Flat record not found in society directory.' };
      }

      if (member.Balance > 0) {
        return {
          allowed: false,
          reason: `NOC Approval Denied: Flat ${flatNo} has pending maintenance balance of ₹${member.Balance.toLocaleString('en-IN')}. Please clear dues before requesting NOC.`
        };
      }

      return { allowed: true };
    };

    const resultA102 = validateNocClearance('A-102');
    expect(resultA102.allowed).toBe(false);
    expect(resultA102.reason).toContain('pending maintenance balance of ₹3,500');

    // Flat A-101 with 0 balance should pass
    const resultA101 = validateNocClearance('A-101');
    expect(resultA101.allowed).toBe(true);
  });

  test('Should reject staff gate check-in with invalid passcode or terminated status', () => {
    const staffMember = {
      id: 'staff_terminated_99',
      SocietyId: MOCK_SOCIETY_A.id,
      Name: 'Ramesh Kumar',
      Category: 'Driver',
      Passcode: '1234',
      Status: 'Terminated' as const
    };

    dbStore.staff.set(staffMember.id, staffMember);

    const attemptStaffCheckIn = (staffId: string, enteredPasscode: string): { success: boolean; error?: string } => {
      const staff = dbStore.staff.get(staffId);
      if (!staff) {
        return { success: false, error: 'Staff member not found in registry.' };
      }

      if (staff.Status !== 'Active') {
        return { success: false, error: `Access Blocked: Staff account status is '${staff.Status}'. Entry denied.` };
      }

      if (staff.Passcode !== enteredPasscode) {
        return { success: false, error: 'Access Denied: Invalid 4-digit passcode.' };
      }

      return { success: true };
    };

    // Test invalid passcode
    const invalidPassResult = attemptStaffCheckIn('staff_terminated_99', '9999');
    expect(invalidPassResult.success).toBe(false);

    // Test terminated staff
    const terminatedResult = attemptStaffCheckIn('staff_terminated_99', '1234');
    expect(terminatedResult.success).toBe(false);
    expect(terminatedResult.error).toContain("Staff account status is 'Terminated'");
  });

  test('Should reject duplicate asset tag or negative purchase cost for society inventory', () => {
    const existingAsset = {
      id: 'asset_01',
      SocietyId: MOCK_SOCIETY_A.id,
      AssetTag: 'AST-PUMP-01',
      AssetName: 'Submersible Water Pump',
      PurchaseCost: 45000
    };

    dbStore.inventoryAssets.set(existingAsset.id, existingAsset);

    const createAssetRecord = (tag: string, name: string, cost: number) => {
      if (cost <= 0) {
        throw new Error('Validation Error: Asset purchase cost must be a positive number greater than ₹0.');
      }

      const duplicateTag = Array.from(dbStore.inventoryAssets.values()).find(
        a => a.SocietyId === MOCK_SOCIETY_A.id && a.AssetTag === tag
      );

      if (duplicateTag) {
        throw new Error(`Conflict Error: Asset tag '${tag}' is already assigned to '${duplicateTag.AssetName}'.`);
      }
    };

    expect(() => createAssetRecord('AST-PUMP-02', 'New Pump', -500)).toThrow(
      'Validation Error: Asset purchase cost must be a positive number greater than ₹0.'
    );

    expect(() => createAssetRecord('AST-PUMP-01', 'Duplicate Tag Asset', 50000)).toThrow(
      "Conflict Error: Asset tag 'AST-PUMP-01' is already assigned to 'Submersible Water Pump'."
    );
  });
});
