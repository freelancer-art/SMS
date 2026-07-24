import { isModuleEnabled } from '../../src/hooks/useFeatureToggle';
import { ROLE_PERMISSION_MAP, usePermissions, PermissionKey } from '../../src/hooks/usePermissions';
import { Society, UserAuth, Poll, PollVote, Invoice, Visitor } from '../../src/types';
import { MockDatabaseStore } from '../setup';

describe('07 - Feature Governance & RLS Tests', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('test_disabled_feature_access_blocked: Disable voting module in society settings and assert resident vote submission is denied', () => {
    // Configure Society with 'voting' module explicitly DISABLED
    const societyWithDisabledVoting: Society = {
      id: 'soc_governed_01',
      Name: 'Greenwood Residency',
      BuildingType: 'Housing Society',
      PostalAddress: 'Navi Mumbai',
      Wings: ['A'],
      HasWings: true,
      EnabledModules: {
        gatekeeper: true,
        billing: true,
        helpdesk: true,
        voting: false, // DISABLED FEATURE
        facility_booking: false,
        water_meters: true,
        tenants: true,
        document_vault: true
      }
    };

    dbStore.societies.set(societyWithDisabledVoting.id, societyWithDisabledVoting);

    // 1. Verify Feature Toggle Hook / Service Check
    const votingEnabled = isModuleEnabled('voting', societyWithDisabledVoting);
    expect(votingEnabled).toBe(false);

    // 2. Simulated RLS / API Handler Gatekeeper for Poll Vote Submission
    const submitPollVote = (
      society: Society,
      userAuth: UserAuth,
      pollId: string,
      optionId: string
    ): { status: number; message: string; vote?: PollVote } => {
      // Feature Gate check
      if (!isModuleEnabled('voting', society)) {
        return {
          status: 403,
          message: 'Access Denied: The AGM Voting module is disabled by society discretion.'
        };
      }

      const vote: PollVote = {
        id: `vote_${Date.now()}`,
        PollId: pollId,
        FlatNo: 'A-101',
        VoterName: 'Resident User',
        SelectedOptionId: optionId,
        VotedAt: new Date().toISOString(),
        TxHash: '0x123abc'
      };

      return { status: 200, message: 'Vote recorded', vote };
    };

    const mockResidentAuth: UserAuth = {
      id: 'auth_resident_1',
      EmailOrPhone: 'resident@greenwood.com',
      PasswordHash: 'hash',
      Salt: 'salt',
      RoleId: 'Role-resident',
      SocietyId: societyWithDisabledVoting.id,
      Status: 'Active'
    };

    // Attempt vote submission when feature is disabled
    const response = submitPollVote(societyWithDisabledVoting, mockResidentAuth, 'poll_1', 'opt_yes');

    expect(response.status).toBe(403);
    expect(response.message).toContain('Access Denied');
    expect(response.vote).toBeUndefined();
  });

  test('test_treasurer_vs_secretary_rbac: Verify Treasurer can write Invoices but blocked from Gatekeeper logs, Secretary can create polls/notices but blocked from Invoices', () => {
    // Permission Verification Function simulating Edge Function / Server Route RBAC check
    const checkRolePermission = (roleName: string, requiredPermission: PermissionKey): boolean => {
      if (roleName === 'SOCIETY_ADMIN' || roleName === 'SuperAdmin') return true;
      const granted = ROLE_PERMISSION_MAP[roleName] || [];
      return granted.includes(requiredPermission);
    };

    // 1. TREASURER Role Assertions
    const isTreasurerAllowedInvoiceWrite = checkRolePermission('TREASURER', 'billing:write');
    const isTreasurerAllowedExpenseWrite = checkRolePermission('TREASURER', 'expenses:write');
    const isTreasurerAllowedGatekeeperWrite = checkRolePermission('TREASURER', 'gatekeeper:write');
    const isTreasurerAllowedSettingsWrite = checkRolePermission('TREASURER', 'settings:write');

    expect(isTreasurerAllowedInvoiceWrite).toBe(true);
    expect(isTreasurerAllowedExpenseWrite).toBe(true);
    expect(isTreasurerAllowedGatekeeperWrite).toBe(false); // BLOCKED
    expect(isTreasurerAllowedSettingsWrite).toBe(false); // BLOCKED

    // 2. SECRETARY Role Assertions
    const isSecretaryAllowedVotingWrite = checkRolePermission('SECRETARY', 'voting:write');
    const isSecretaryAllowedNoticesWrite = checkRolePermission('SECRETARY', 'notices:write');
    const isSecretaryAllowedInvoiceWrite = checkRolePermission('SECRETARY', 'billing:write');
    const isSecretaryAllowedCommitteeWrite = checkRolePermission('SECRETARY', 'committee:write');

    expect(isSecretaryAllowedVotingWrite).toBe(true);
    expect(isSecretaryAllowedNoticesWrite).toBe(true);
    expect(isSecretaryAllowedInvoiceWrite).toBe(false); // BLOCKED
    expect(isSecretaryAllowedCommitteeWrite).toBe(false); // BLOCKED

    // 3. Simulated API Endpoint Enforcement
    const executeBillingInvoiceAction = (roleName: string) => {
      if (!checkRolePermission(roleName, 'billing:write')) {
        return { status: 403, error: 'HTTP 403: Insufficient Role Permissions for Financial Billing Write' };
      }
      return { status: 200, data: { invoiceId: 'inv_1001', status: 'Generated' } };
    };

    const executeGatekeeperLogAction = (roleName: string) => {
      if (!checkRolePermission(roleName, 'gatekeeper:write')) {
        return { status: 403, error: 'HTTP 403: Insufficient Role Permissions for Gatekeeper Security Logs' };
      }
      return { status: 200, data: { visitorId: 'vis_5001', status: 'CheckedIn' } };
    };

    // Treasurer attempts actions
    expect(executeBillingInvoiceAction('TREASURER').status).toBe(200);
    expect(executeGatekeeperLogAction('TREASURER').status).toBe(403);

    // Secretary attempts actions
    expect(executeBillingInvoiceAction('SECRETARY').status).toBe(403);
    expect(executeGatekeeperLogAction('SECRETARY').status).toBe(403); // Gatekeeper is for GATE_STAFF / ADMIN
  });
});
