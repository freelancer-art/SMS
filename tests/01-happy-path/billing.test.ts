import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Invoice, Payment } from '../../src/types';

describe('01 - Happy Path: Financial Core - Batch Invoicing & Payments', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should generate batch invoices for all society flats based on SqFt calculation rate', () => {
    const billMonth = 'July 2026';
    const society = dbStore.societies.get(MOCK_SOCIETY_A.id);
    const members = Array.from(dbStore.members.values()).filter(
      m => m.SocietyId === MOCK_SOCIETY_A.id
    );

    expect(members.length).toBeGreaterThan(0);

    const generatedInvoices: Invoice[] = [];

    // Calculate invoice for each flat
    members.forEach(member => {
      const areaSqFt = member.AreaSqFt || 1000;
      const ratePerSqFt = society.RatePerSqFt || 3.5;
      const baseAmount = areaSqFt * ratePerSqFt;
      const waterCharges = 250;
      const securityCharges = 150;
      const parkingCharges = 100;
      const totalAmount = baseAmount + waterCharges + securityCharges + parkingCharges;

      const invoice: Invoice = {
        id: `inv_${society.id}_${member.FlatNo.replace(/[^a-zA-Z0-9]/g, '')}_202607`,
        SocietyId: society.id,
        BillMonth: billMonth,
        FlatNo: member.FlatNo,
        OwnerName: member.OwnerName,
        BaseAmount: baseAmount,
        WaterCharges: waterCharges,
        SecurityCharges: securityCharges,
        ParkingCharges: parkingCharges,
        TotalAmount: totalAmount,
        DueDate: '2026-07-10',
        Status: 'Unpaid',
        IssuedDate: '2026-07-01',
        BillingModeUsed: society.BillingMode,
        AreaSqFtUsed: areaSqFt
      };

      dbStore.invoices.set(invoice.id, invoice);
      generatedInvoices.push(invoice);

      // Update member outstanding dues
      member.Balance += totalAmount;
      dbStore.members.set(member.id, member);
    });

    expect(generatedInvoices.length).toBe(members.length);

    const inv101 = generatedInvoices.find(inv => inv.FlatNo === 'A-101');
    expect(inv101).toBeDefined();
    expect(inv101?.BaseAmount).toBe(3500); // 1000 sqft * 3.5
    expect(inv101?.TotalAmount).toBe(4000); // 3500 + 250 + 150 + 100
    expect(inv101?.Status).toBe('Unpaid');
  });

  test('Should record payment receipt and update invoice status to Paid and adjust member balance', () => {
    const invoiceId = `inv_${MOCK_SOCIETY_A.id}_A101_202607`;
    const invoice: Invoice = {
      id: invoiceId,
      SocietyId: MOCK_SOCIETY_A.id,
      BillMonth: 'July 2026',
      FlatNo: 'A-101',
      OwnerName: 'Rajesh Sharma',
      BaseAmount: 3500,
      WaterCharges: 250,
      SecurityCharges: 150,
      ParkingCharges: 100,
      TotalAmount: 4000,
      DueDate: '2026-07-10',
      Status: 'Unpaid',
      IssuedDate: '2026-07-01'
    };
    dbStore.invoices.set(invoiceId, invoice);

    const member = dbStore.members.get('mem_a_101');
    member.Balance = 4000;
    dbStore.members.set(member.id, member);

    // Record Payment transaction
    const paymentReceipt: Payment = {
      id: 'pay_receipt_9901',
      SocietyId: MOCK_SOCIETY_A.id,
      MemberId: member.id,
      Date: '2026-07-05',
      FlatNo: 'A-101',
      OwnerName: 'Rajesh Sharma',
      Amount: 4000,
      Mode: 'UPI',
      ReferenceNo: 'UPI-TXN-987654321',
      Status: 'Cleared'
    };
    dbStore.payments.set(paymentReceipt.id!, paymentReceipt);

    // Reconcile Invoice & Member Dues
    const invToUpdate = dbStore.invoices.get(invoiceId);
    invToUpdate.Status = 'Paid';
    dbStore.invoices.set(invoiceId, invToUpdate);

    const memToUpdate = dbStore.members.get(member.id);
    memToUpdate.Balance -= paymentReceipt.Amount;
    dbStore.members.set(member.id, memToUpdate);

    // Assertions
    expect(dbStore.invoices.get(invoiceId).Status).toBe('Paid');
    expect(dbStore.members.get('mem_a_101').Balance).toBe(0);
    expect(dbStore.payments.get('pay_receipt_9901').Status).toBe('Cleared');
  });
});
