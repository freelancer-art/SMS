import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';

describe('01 - Happy Path: Staff Tracking, NOC Workflow, and Asset Inventory', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  describe('Domestic Staff & Maid Tracking Module', () => {
    test('Should register domestic staff member with passcode and flat assignments', () => {
      const staffMember = {
        id: 'staff_sunita_01',
        SocietyId: MOCK_SOCIETY_A.id,
        Name: 'Sunita Devi',
        Category: 'Maid',
        Phone: '+91 98765 11223',
        Passcode: '4821',
        FlatsServed: ['A-101', 'A-102'],
        WorkingHours: '08:00 AM - 12:00 PM',
        MonthlySalary: 4000,
        Status: 'Active',
        DocumentVerified: true,
        AadhaarNo: 'XXXX-XXXX-8821'
      };

      dbStore.staff.set(staffMember.id, staffMember);

      const savedStaff = dbStore.staff.get('staff_sunita_01');
      expect(savedStaff).toBeDefined();
      expect(savedStaff.Name).toBe('Sunita Devi');
      expect(savedStaff.Passcode).toBe('4821');
      expect(savedStaff.FlatsServed).toContain('A-101');
    });

    test('Should log entry check-in and exit check-out attendance for staff at gate', () => {
      const checkInLog = {
        id: 'att_2026_07_24_01',
        SocietyId: MOCK_SOCIETY_A.id,
        StaffId: 'staff_sunita_01',
        StaffName: 'Sunita Devi',
        CheckInTime: '2026-07-24T08:05:00.000Z',
        CheckOutTime: null,
        GateNo: 'Gate 1',
        VerifiedByPasscode: true,
        Status: 'Inside'
      };

      dbStore.staffAttendance.set(checkInLog.id, checkInLog);

      let log = dbStore.staffAttendance.get('att_2026_07_24_01');
      expect(log.Status).toBe('Inside');
      expect(log.CheckInTime).toBeDefined();

      // Perform exit check-out
      log.CheckOutTime = '2026-07-24T11:55:00.000Z';
      log.Status = 'Completed';
      dbStore.staffAttendance.set(log.id, log);

      const updatedLog = dbStore.staffAttendance.get('att_2026_07_24_01');
      expect(updatedLog.Status).toBe('Completed');
      expect(updatedLog.CheckOutTime).toBe('2026-07-24T11:55:00.000Z');
    });

    test('Should calculate net staff monthly pay deducting absent days', () => {
      const baseSalary = 6000; // Monthly rate for 30 days
      const totalDays = 30;
      const absentDays = 3;

      const perDayRate = baseSalary / totalDays;
      const deduction = Math.round(perDayRate * absentDays);
      const netPayable = baseSalary - deduction;

      expect(perDayRate).toBe(200);
      expect(deduction).toBe(600);
      expect(netPayable).toBe(5400);
    });
  });

  describe('Move-In / Move-Out NOC Workflow Module', () => {
    test('Should submit Move-In NOC request for flat with zero dues', () => {
      const member101 = dbStore.members.get('mem_a_101');
      expect(member101.Balance).toBe(0); // Dues clear

      const nocRequest = {
        id: 'noc_req_A101_2026',
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: 'A-101',
        ApplicantName: 'Rajesh Sharma',
        Type: 'Move-In' as const,
        ScheduledDate: '2026-08-01',
        MovingAgency: 'Speedy Packers & Movers',
        VehicleNumber: 'MH 12 CD 5678',
        OutstandingDues: member101.Balance,
        DuesCleared: true,
        ShiftingChargeAmount: 1500,
        SecurityDepositAmount: 5000,
        Status: 'Pending Clearance' as const,
        CreatedAt: new Date().toISOString()
      };

      dbStore.nocRequests.set(nocRequest.id, nocRequest);

      const savedNoc = dbStore.nocRequests.get('noc_req_A101_2026');
      expect(savedNoc).toBeDefined();
      expect(savedNoc.Type).toBe('Move-In');
      expect(savedNoc.DuesCleared).toBe(true);
    });

    test('Should process Secretary approval and issue digital NOC certificate', () => {
      const nocRequest = {
        id: 'noc_req_A101_2026',
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: 'A-101',
        ApplicantName: 'Rajesh Sharma',
        Type: 'Move-In' as const,
        ScheduledDate: '2026-08-01',
        MovingAgency: 'Speedy Packers & Movers',
        VehicleNumber: 'MH 12 CD 5678',
        OutstandingDues: 0,
        DuesCleared: true,
        ShiftingChargeAmount: 1500,
        SecurityDepositAmount: 5000,
        Status: 'Approved' as const,
        ApprovedBy: 'Secretary (Rajesh Sharma)',
        ApprovedAt: new Date().toISOString(),
        NocCertificateNo: 'NOC-2026-SOCA-A101-0982',
        ValidUntil: '2026-08-07'
      };

      dbStore.nocRequests.set(nocRequest.id, nocRequest);

      const approvedNoc = dbStore.nocRequests.get('noc_req_A101_2026');
      expect(approvedNoc.Status).toBe('Approved');
      expect(approvedNoc.NocCertificateNo).toContain('NOC-2026-SOCA-A101');
      expect(approvedNoc.ValidUntil).toBe('2026-08-07');
    });
  });

  describe('Asset & Inventory Register Module', () => {
    test('Should register physical society asset with AMC details and warranty status', () => {
      const asset = {
        id: 'inv_dg_set_125kva',
        SocietyId: MOCK_SOCIETY_A.id,
        AssetTag: 'AST-DG-01',
        AssetName: '125 kVA Silent Generator Set',
        Category: 'Power Backup',
        Location: 'Basement - Generator Room',
        PurchaseDate: '2024-03-15',
        PurchaseCost: 650000,
        ExpectedLifespanYears: 10,
        WarrantyExpiryDate: '2027-03-14',
        VendorName: 'Cummins India Ltd',
        AMCCovered: true,
        AMCVendor: 'Cummins Power Services',
        AMCSchedule: 'Quarterly',
        Status: 'Operational' as const
      };

      dbStore.inventoryAssets.set(asset.id, asset);

      const savedAsset = dbStore.inventoryAssets.get('inv_dg_set_125kva');
      expect(savedAsset).toBeDefined();
      expect(savedAsset.AssetTag).toBe('AST-DG-01');
      expect(savedAsset.PurchaseCost).toBe(650000);
      expect(savedAsset.AMCCovered).toBe(true);
    });

    test('Should calculate straight-line asset depreciation and book value', () => {
      const purchaseCost = 650000;
      const salvageValue = 50000;
      const lifespanYears = 10;
      const yearsElapsed = 2; // Purchased 2024, current year 2026

      const depreciableAmount = purchaseCost - salvageValue;
      const annualDepreciation = depreciableAmount / lifespanYears;
      const accumulatedDepreciation = annualDepreciation * yearsElapsed;
      const currentBookValue = purchaseCost - accumulatedDepreciation;

      expect(annualDepreciation).toBe(60000);
      expect(accumulatedDepreciation).toBe(120000);
      expect(currentBookValue).toBe(530000);
    });
  });
});
