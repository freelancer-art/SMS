import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Visitor } from '../../src/types';

describe('01 - Happy Path: Gatekeeper & Visitor Security Pass', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should generate pre-approved visitor pass with valid access token and expiration', () => {
    const futureExpiration = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours from now

    const newPass: Visitor = {
      id: 'vis_pass_1001',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VisitorName: 'Ramesh Plumber',
      Purpose: 'Maintenance',
      ContactNo: '+91 98765 11223',
      VehicleNo: 'MH-02-AB-1234',
      CheckInTime: new Date().toISOString(),
      Status: 'Pre-Approved',
      HostApprovedBy: 'Rajesh Sharma',
      AccessToken: 'PASS-884920',
      TokenExpiresAt: futureExpiration
    };

    dbStore.visitors.set(newPass.id, newPass);

    const savedPass = dbStore.visitors.get('vis_pass_1001');
    expect(savedPass).toBeDefined();
    expect(savedPass.Status).toBe('Pre-Approved');
    expect(savedPass.AccessToken).toBe('PASS-884920');
    expect(new Date(savedPass.TokenExpiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  test('Should verify pass at gate and check in visitor successfully', () => {
    // Visitor arrives at gate
    const visitorId = 'vis_pass_1001';
    const pass = {
      id: visitorId,
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VisitorName: 'Ramesh Plumber',
      Purpose: 'Maintenance' as const,
      ContactNo: '+91 98765 11223',
      CheckInTime: new Date().toISOString(),
      Status: 'Pre-Approved' as const,
      AccessToken: 'PASS-884920',
      TokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
    };
    dbStore.visitors.set(visitorId, pass);

    // Gatekeeper validates token
    const scannedToken = 'PASS-884920';
    const foundVisitor = Array.from(dbStore.visitors.values()).find(
      v => v.AccessToken === scannedToken && v.SocietyId === MOCK_SOCIETY_A.id
    );

    expect(foundVisitor).toBeDefined();
    expect(new Date(foundVisitor.TokenExpiresAt).getTime()).toBeGreaterThan(Date.now());

    // Update status to Checked In
    foundVisitor.Status = 'Checked In';
    foundVisitor.CheckInTime = new Date().toISOString();
    dbStore.visitors.set(visitorId, foundVisitor);

    const updatedVisitor = dbStore.visitors.get(visitorId);
    expect(updatedVisitor.Status).toBe('Checked In');
    expect(updatedVisitor.CheckInTime).toBeDefined();
  });

  test('Should record visitor checkout when leaving premises', () => {
    const visitorId = 'vis_pass_1001';
    const inHouseVisitor: Visitor = {
      id: visitorId,
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VisitorName: 'Ramesh Plumber',
      Purpose: 'Maintenance',
      ContactNo: '+91 98765 11223',
      CheckInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      Status: 'Checked In'
    };
    dbStore.visitors.set(visitorId, inHouseVisitor);

    // Check out mutation
    const record = dbStore.visitors.get(visitorId);
    record.Status = 'Checked Out';
    record.CheckOutTime = new Date().toISOString();
    dbStore.visitors.set(visitorId, record);

    const checkedOutVisitor = dbStore.visitors.get(visitorId);
    expect(checkedOutVisitor.Status).toBe('Checked Out');
    expect(checkedOutVisitor.CheckOutTime).toBeDefined();
  });
});
