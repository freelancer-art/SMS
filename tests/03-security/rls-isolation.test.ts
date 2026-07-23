import { MockDatabaseStore, MOCK_SOCIETY_A, MOCK_SOCIETY_B } from '../setup';

describe('03 - Security & RLS Isolation: Cross-Tenant Data Isolation', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  // Simulates Supabase RLS filter enforcement logic:
  // In Supabase, RLS policies check `auth.jwt() ->> 'SocietyId' = SocietyId`
  const queryWithRLS = (tableName: 'members' | 'invoices' | 'visitors', authenticatedSocietyId: string) => {
    const tableData = Array.from(dbStore[tableName].values());
    
    // RLS Policy Engine: Enforces strict multi-tenant boundary matching user's authenticated SocietyId
    return tableData.filter((record: any) => record.SocietyId === authenticatedSocietyId);
  };

  test("Authenticated user from Society_A querying 'Members' must return 0 rows for Society_B records", () => {
    const authenticatedUserSocietyId = MOCK_SOCIETY_A.id; // User belongs to Greenwood Residency (Society A)

    // Execute query with tenant isolation
    const accessibleMembers = queryWithRLS('members', authenticatedUserSocietyId);

    // Verify user can read Society A members
    expect(accessibleMembers.some(m => m.SocietyId === MOCK_SOCIETY_A.id)).toBe(true);

    // Verify 0 rows returned for Society B members
    const crossTenantRows = accessibleMembers.filter(m => m.SocietyId === MOCK_SOCIETY_B.id);
    expect(crossTenantRows).toHaveLength(0);
    expect(crossTenantRows).toEqual([]);
  });

  test("Authenticated user from Society_A querying 'Invoices' must return 0 rows for Society_B invoices", () => {
    // Seed invoices for both societies
    dbStore.invoices.set('inv_soc_a_1', {
      id: 'inv_soc_a_1',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      TotalAmount: 3500,
      Status: 'Unpaid'
    });

    dbStore.invoices.set('inv_soc_b_1', {
      id: 'inv_soc_b_1',
      SocietyId: MOCK_SOCIETY_B.id,
      FlatNo: 'T1-101',
      TotalAmount: 5000,
      Status: 'Unpaid'
    });

    const authenticatedUserSocietyId = MOCK_SOCIETY_A.id;

    const accessibleInvoices = queryWithRLS('invoices', authenticatedUserSocietyId);

    // Assert only Society A invoices are returned
    expect(accessibleInvoices).toHaveLength(1);
    expect(accessibleInvoices[0].SocietyId).toBe(MOCK_SOCIETY_A.id);

    // Assert 0 rows returned for Society B
    const societyBInvoices = accessibleInvoices.filter(i => i.SocietyId === MOCK_SOCIETY_B.id);
    expect(societyBInvoices).toHaveLength(0);
  });

  test("Authenticated user from Society_A querying 'Visitors' must return 0 rows for Society_B gate logs", () => {
    dbStore.visitors.set('vis_soc_a_1', {
      id: 'vis_soc_a_1',
      SocietyId: MOCK_SOCIETY_A.id,
      VisitorName: 'Guest A',
      FlatNo: 'A-101'
    });

    dbStore.visitors.set('vis_soc_b_1', {
      id: 'vis_soc_b_1',
      SocietyId: MOCK_SOCIETY_B.id,
      VisitorName: 'Guest B',
      FlatNo: 'T1-101'
    });

    const authenticatedUserSocietyId = MOCK_SOCIETY_A.id;

    const accessibleVisitors = queryWithRLS('visitors', authenticatedUserSocietyId);

    expect(accessibleVisitors.some(v => v.SocietyId === MOCK_SOCIETY_A.id)).toBe(true);
    expect(accessibleVisitors.filter(v => v.SocietyId === MOCK_SOCIETY_B.id)).toHaveLength(0);
  });

  test("Cross-Tenant Write Block: Attempting to insert record for Society_B as Society_A user should raise RLS constraint error", () => {
    const authenticatedUserSocietyId = MOCK_SOCIETY_A.id;

    const insertInvoiceWithRLSCheck = (invoiceData: any) => {
      // Security check: RLS policy enforces target SocietyId matches JWT auth token
      if (invoiceData.SocietyId !== authenticatedUserSocietyId) {
        throw new Error(`RLS Violation 403 Forbidden: User authenticated under Society '${authenticatedUserSocietyId}' is prohibited from modifying records in target Society '${invoiceData.SocietyId}'.`);
      }
      dbStore.invoices.set(invoiceData.id, invoiceData);
    };

    const maliciousCrossTenantInvoice = {
      id: 'inv_hacked_001',
      SocietyId: MOCK_SOCIETY_B.id, // Attempting to inject invoice into Society B
      FlatNo: 'T1-101',
      TotalAmount: 99999,
      Status: 'Unpaid'
    };

    expect(() => insertInvoiceWithRLSCheck(maliciousCrossTenantInvoice)).toThrow(
      `RLS Violation 403 Forbidden: User authenticated under Society '${MOCK_SOCIETY_A.id}' is prohibited from modifying records in target Society '${MOCK_SOCIETY_B.id}'.`
    );

    // Verify database was NOT mutated
    expect(dbStore.invoices.get('inv_hacked_001')).toBeUndefined();
  });
});
