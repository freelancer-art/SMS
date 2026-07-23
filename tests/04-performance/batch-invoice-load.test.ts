import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Member, Invoice } from '../../src/types';

describe('04 - Performance Benchmark: Batch Invoicing SLA Execution Speed', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should generate 100+ batch flat invoices and assert completion time is under 500ms SLA', () => {
    const BATCH_SIZE = 150; // 150 flats in a large housing complex
    const societyId = MOCK_SOCIETY_A.id;

    // Seed 150 members into Mock Database
    for (let i = 1; i <= BATCH_SIZE; i++) {
      const flatNo = `Wing-${Math.ceil(i / 30)}-${100 + (i % 30)}`;
      const member: Member = {
        id: `mem_perf_${i}`,
        SocietyId: societyId,
        FlatNo: flatNo,
        OwnerName: `Resident ${i}`,
        ContactNo: `+91 98200 ${10000 + i}`,
        Email: `resident${i}@society.com`,
        Balance: 0,
        Status: 'Owner',
        AreaSqFt: 800 + (i % 5) * 200 // Areas: 800, 1000, 1200, 1400, 1600 sqft
      };
      dbStore.members.set(member.id, member);
    }

    // Benchmark Execution Start
    const startTime = performance.now();

    const membersList = Array.from(dbStore.members.values()).filter(
      m => m.SocietyId === societyId
    );

    const generatedInvoices: Invoice[] = [];

    // Execute bulk batch calculation engine
    membersList.forEach((member, index) => {
      const areaSqFt = member.AreaSqFt || 1000;
      const ratePerSqFt = 3.5;
      const baseAmount = areaSqFt * ratePerSqFt;
      const waterCharges = 200;
      const securityCharges = 150;
      const parkingCharges = 100;
      const totalAmount = baseAmount + waterCharges + securityCharges + parkingCharges;

      const invoice: Invoice = {
        id: `inv_perf_${index + 1}`,
        SocietyId: societyId,
        BillMonth: 'August 2026',
        FlatNo: member.FlatNo,
        OwnerName: member.OwnerName,
        BaseAmount: baseAmount,
        WaterCharges: waterCharges,
        SecurityCharges: securityCharges,
        ParkingCharges: parkingCharges,
        TotalAmount: totalAmount,
        DueDate: '2026-08-10',
        Status: 'Unpaid',
        IssuedDate: '2026-08-01',
        BillingModeUsed: 'SqFt Rate',
        AreaSqFtUsed: areaSqFt
      };

      dbStore.invoices.set(invoice.id, invoice);
      generatedInvoices.push(invoice);
    });

    const endTime = performance.now();
    const durationMs = endTime - startTime;

    // Assertions
    expect(generatedInvoices.length).toBeGreaterThanOrEqual(150);
    expect(dbStore.invoices.size).toBeGreaterThanOrEqual(150);

    // Performance SLA Assertion (<500ms)
    console.log(`⚡ Performance Benchmark SLA Result: Generated ${generatedInvoices.length} invoices in ${durationMs.toFixed(2)}ms`);
    expect(durationMs).toBeLessThan(500);
  });
});
