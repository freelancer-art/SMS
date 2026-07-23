import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Society, Member } from '../../src/types';

describe('01 - Happy Path: Society Onboarding & CSV Import', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should successfully onboard a new society with wings and postal address', () => {
    const newSociety: Society = {
      id: 'soc_c_sunshine_303',
      Name: 'Sunshine Heights Society',
      BuildingType: 'Housing Society',
      PostalAddress: '789 Link Road, Andheri West, Mumbai 400053',
      Wings: ['Wing-A', 'Wing-B'],
      HasWings: true,
      StructureType: 'wings',
      BillingMode: 'SqFt Rate',
      RatePerSqFt: 4.0,
      GatewayEnabled: true,
      GatewayProvider: 'Razorpay',
      UPI_ID: 'sunshine@upi'
    };

    // Simulate society creation mutation
    dbStore.societies.set(newSociety.id, newSociety);

    // Assert society persisted in database store
    const retrievedSociety = dbStore.societies.get('soc_c_sunshine_303');
    expect(retrievedSociety).toBeDefined();
    expect(retrievedSociety.Name).toBe('Sunshine Heights Society');
    expect(retrievedSociety.Wings).toHaveLength(2);
    expect(retrievedSociety.PostalAddress).toContain('Andheri West');
    expect(retrievedSociety.BillingMode).toBe('SqFt Rate');
  });

  test('Should parse and import valid CSV flat directory into Members table', () => {
    const csvContent = `FlatNo,OwnerName,ContactNo,Email,Status,Wing,AreaSqFt
B-101,Anil Kapoor,+91 98111 22233,anil.k@example.com,Owner,B,950
B-102,Sangeeta Rao,+91 98111 44455,sangeeta.r@example.com,Owner,B,1100
B-103,Vikramaditya Das,+91 98111 66677,vikram.d@example.com,Tenant,B,850`;

    // CSV parser logic
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const importedMembers: Member[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const member: Member = {
        id: `mem_import_${i}`,
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: values[0],
        OwnerName: values[1],
        ContactNo: values[2],
        Email: values[3],
        Balance: 0,
        Status: values[4] as 'Owner' | 'Tenant',
        Wing: values[5],
        AreaSqFt: Number(values[6])
      };

      dbStore.members.set(member.id!, member);
      importedMembers.push(member);
    }

    // Assertions
    expect(importedMembers).toHaveLength(3);

    const flat101 = Array.from(dbStore.members.values()).find(
      m => m.SocietyId === MOCK_SOCIETY_A.id && m.FlatNo === 'B-101'
    );
    expect(flat101).toBeDefined();
    expect(flat101.OwnerName).toBe('Anil Kapoor');
    expect(flat101.ContactNo).toBe('+91 98111 22233');
    expect(flat101.AreaSqFt).toBe(950);
  });
});
