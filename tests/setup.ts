import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment setup for Supabase test environment
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://mock-supabase-housing-saas.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'mock-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export const MOCK_SOCIETY_A = {
  id: 'soc_a_greenwood_101',
  Name: 'Greenwood Residency Co-op',
  BuildingType: 'Housing Society',
  PostalAddress: '123 Park Avenue, Sector 5, Mumbai 400001',
  Wings: ['A', 'B', 'C'],
  HasWings: true,
  StructureType: 'wings' as const,
  BillingMode: 'SqFt Rate' as const,
  RatePerSqFt: 3.5,
  FlatRateAmount: 2000,
  LateFeeType: 'Fixed' as const,
  LateFeeValue: 250,
  DueDateDay: 10,
  GatewayEnabled: true,
  GatewayProvider: 'Razorpay' as const,
  UPI_ID: 'greenwood@upi'
};

export const MOCK_SOCIETY_B = {
  id: 'soc_b_seabreeze_202',
  Name: 'Sea Breeze Towers',
  BuildingType: 'Apartment Complex',
  PostalAddress: '456 Marine Drive, Mumbai 400020',
  Wings: ['Tower-1', 'Tower-2'],
  HasWings: true,
  StructureType: 'towers_wings' as const,
  BillingMode: 'Flat Rate' as const,
  FlatRateAmount: 4500,
  GatewayEnabled: false
};

// Create a Supabase Client instance for testing
export function getTestSupabaseClient(jwtToken?: string): SupabaseClient {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: jwtToken ? {
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    } : undefined
  });
}

// In-Memory Database Store for Mock Mode testing
export class MockDatabaseStore {
  private static instance: MockDatabaseStore;

  public societies: Map<string, any> = new Map();
  public members: Map<string, any> = new Map();
  public invoices: Map<string, any> = new Map();
  public visitors: Map<string, any> = new Map();
  public polls: Map<string, any> = new Map();
  public pollVotes: Map<string, any> = new Map();
  public payments: Map<string, any> = new Map();
  public waterMeters: Map<string, any> = new Map();
  public tenants: Map<string, any> = new Map();
  public facilityBookings: Map<string, any> = new Map();
  public vehicles: Map<string, any> = new Map();
  public assetsAMC: Map<string, any> = new Map();
  public expenses: Map<string, any> = new Map();
  public staff: Map<string, any> = new Map();
  public staffAttendance: Map<string, any> = new Map();
  public nocRequests: Map<string, any> = new Map();
  public inventoryAssets: Map<string, any> = new Map();

  private constructor() {
    this.reset();
  }

  public static getInstance(): MockDatabaseStore {
    if (!MockDatabaseStore.instance) {
      MockDatabaseStore.instance = new MockDatabaseStore();
    }
    return MockDatabaseStore.instance;
  }

  public reset() {
    this.societies.clear();
    this.members.clear();
    this.invoices.clear();
    this.visitors.clear();
    this.polls.clear();
    this.pollVotes.clear();
    this.payments.clear();
    this.waterMeters.clear();
    this.tenants.clear();
    this.facilityBookings.clear();
    this.vehicles.clear();
    this.assetsAMC.clear();
    this.expenses.clear();
    this.staff.clear();
    this.staffAttendance.clear();
    this.nocRequests.clear();
    this.inventoryAssets.clear();

    // Seed default testing data
    this.societies.set(MOCK_SOCIETY_A.id, { ...MOCK_SOCIETY_A });
    this.societies.set(MOCK_SOCIETY_B.id, { ...MOCK_SOCIETY_B });

    // Seed members for Society A
    const member1 = {
      id: 'mem_a_101',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      OwnerName: 'Rajesh Sharma',
      ContactNo: '+91 98200 12345',
      Email: 'rajesh.sharma@example.com',
      Balance: 0,
      Status: 'Owner',
      Wing: 'A',
      AreaSqFt: 1000
    };
    const member2 = {
      id: 'mem_a_102',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-102',
      OwnerName: 'Priya Verma',
      ContactNo: '+91 98200 54321',
      Email: 'priya.verma@example.com',
      Balance: 3500,
      Status: 'Owner',
      Wing: 'A',
      AreaSqFt: 1200
    };
    this.members.set(member1.id, member1);
    this.members.set(member2.id, member2);

    // Seed members for Society B
    const memberB1 = {
      id: 'mem_b_101',
      SocietyId: MOCK_SOCIETY_B.id,
      FlatNo: 'T1-101',
      OwnerName: 'Amitabh Patel',
      ContactNo: '+91 98200 99999',
      Email: 'amitabh.patel@example.com',
      Balance: 0,
      Status: 'Owner',
      Wing: 'Tower-1',
      AreaSqFt: 1500
    };
    this.members.set(memberB1.id, memberB1);
  }
}

// Global setup hook
beforeEach(() => {
  MockDatabaseStore.getInstance().reset();
});
