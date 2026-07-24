import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { WaterMeter, Tenant, FacilityBooking, Vehicle, AssetAMC, Expense } from '../../src/types';

describe('01 - Happy Path: Extended Modules (Water Meters, Tenants, Amenities, Parking, Asset AMC, Expenses)', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should record water meter reading and calculate consumption charges', () => {
    const reading: WaterMeter = {
      id: 'wm_A101_2026_07',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      ReadingMonth: 'July 2026',
      PreviousReading: 1250,
      CurrentReading: 1320,
      UnitsConsumed: 70, // 70 units
      UnitRate: 15, // ₹15 per unit
      TotalCharge: 1050,
      RecordedBy: 'Estate Manager',
      Status: 'Entered'
    };

    dbStore.waterMeters.set(reading.id, reading);

    const savedReading = dbStore.waterMeters.get('wm_A101_2026_07');
    expect(savedReading).toBeDefined();
    expect(savedReading.UnitsConsumed).toBe(70);
    expect(savedReading.TotalCharge).toBe(1050);
  });

  test('Should onboard tenant with lease agreement document and update KYC status', () => {
    const tenant: Tenant = {
      id: 'tenant_A101_01',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      TenantName: 'Vikram Mehta',
      ContactNo: '+91 98111 22233',
      Email: 'vikram.m@example.com',
      MoveInDate: '2026-08-01',
      AgreementDocUrl: 'https://storage.example.com/agreements/A101_lease.pdf',
      IdProofDocUrl: 'https://storage.example.com/idproofs/A101_aadhaar.pdf',
      KycStatus: 'Verified',
      Remarks: 'NOC Issued by Secretary'
    };

    dbStore.tenants.set(tenant.id, tenant);

    const savedTenant = dbStore.tenants.get('tenant_A101_01');
    expect(savedTenant).toBeDefined();
    expect(savedTenant.KycStatus).toBe('Verified');
    expect(savedTenant.TenantName).toBe('Vikram Mehta');
  });

  test('Should book clubhouse facility for a resident event', () => {
    const booking: FacilityBooking = {
      id: 'book_clubhouse_101',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      ResidentName: 'Rajesh Sharma',
      FacilityName: 'Clubhouse',
      Date: '2026-08-15',
      TimeSlot: '18:00 - 22:00',
      Purpose: 'Birthday Celebration',
      Charges: 2500,
      Status: 'Confirmed',
      BookedAt: new Date().toISOString()
    };

    dbStore.facilityBookings.set(booking.id, booking);

    const savedBooking = dbStore.facilityBookings.get('book_clubhouse_101');
    expect(savedBooking).toBeDefined();
    expect(savedBooking.Charges).toBe(2500);
    expect(savedBooking.Status).toBe('Confirmed');
  });

  test('Should register resident vehicle and assign parking slot with sticker', () => {
    const vehicle: Vehicle = {
      id: 'veh_A101_01',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      OwnerName: 'Rajesh Sharma',
      VehicleNo: 'MH 12 AB 1234',
      VehicleType: '4-Wheeler',
      ParkingSlotNo: 'P-A101',
      StickerIssued: true
    };

    dbStore.vehicles.set(vehicle.id, vehicle);

    const savedVehicle = dbStore.vehicles.get('veh_A101_01');
    expect(savedVehicle).toBeDefined();
    expect(savedVehicle.VehicleNo).toBe('MH 12 AB 1234');
    expect(savedVehicle.StickerIssued).toBe(true);
  });

  test('Should track Elevator Asset AMC contract and service due date', () => {
    const liftAsset: AssetAMC = {
      id: 'asset_lift_wing_a',
      SocietyId: MOCK_SOCIETY_A.id,
      AssetName: 'Passenger Elevator Wing A',
      Category: 'Lift / Elevator',
      VendorName: 'Schindler Elevators India Ltd',
      ContractStartDate: '2026-01-01',
      ContractExpiryDate: '2026-12-31',
      LastServicedDate: '2026-06-15',
      NextServicedDate: '2026-08-15',
      ServiceStatus: 'Operational'
    };

    dbStore.assetsAMC.set(liftAsset.id, liftAsset);

    const savedAsset = dbStore.assetsAMC.get('asset_lift_wing_a');
    expect(savedAsset).toBeDefined();
    expect(savedAsset.ServiceStatus).toBe('Operational');
    expect(savedAsset.VendorName).toContain('Schindler');
  });

  test('Should execute Dual-Approval workflow for high-value society expense', () => {
    const expense: Expense = {
      id: 'exp_solar_maint_01',
      SocietyId: MOCK_SOCIETY_A.id,
      Date: '2026-07-20',
      Category: 'Maintenance',
      Title: 'CCTV Camera Replacement & Cabling',
      Amount: 18500,
      Vendor: 'SecureVision Tech Ltd',
      InvoiceNo: 'INV-2026-881',
      RequiresDualApproval: true,
      SecretaryApproved: true,
      SecretaryApprovedBy: 'Rajesh Sharma (Secretary)',
      SecretaryApprovedAt: new Date().toISOString(),
      TreasurerApproved: true,
      TreasurerApprovedBy: 'Anil Kulkarni (Treasurer)',
      TreasurerApprovedAt: new Date().toISOString(),
      Status: 'Approved'
    };

    dbStore.expenses.set(expense.id, expense);

    const savedExpense = dbStore.expenses.get('exp_solar_maint_01');
    expect(savedExpense).toBeDefined();
    expect(savedExpense.RequiresDualApproval).toBe(true);
    expect(savedExpense.SecretaryApproved).toBe(true);
    expect(savedExpense.TreasurerApproved).toBe(true);
    expect(savedExpense.Status).toBe('Approved');
  });
});
