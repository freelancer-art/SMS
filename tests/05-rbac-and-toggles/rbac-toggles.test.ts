import { isModuleEnabled, DEFAULT_ENABLED_MODULES } from '../../src/hooks/useFeatureToggle';
import { ROLE_PERMISSION_MAP, getRoleNameFromAuth } from '../../src/hooks/usePermissions';
import { Society, UserAuth, Role } from '../../src/types';

describe('05 - Tenant Discretion Feature Toggles & Committee RBAC', () => {
  const mockSociety: Society = {
    id: 'greenwood',
    Name: 'Greenwood Residency',
    BuildingType: 'Housing Society',
    PostalAddress: 'Navi Mumbai',
    Wings: [],
    HasWings: false,
    EnabledModules: {
      gatekeeper: true,
      billing: true,
      helpdesk: true,
      voting: false,
      facility_booking: false,
      water_meters: true,
      tenants: true,
      document_vault: true
    }
  };

  test('Should accurately evaluate module enablement based on tenant discretion JSONB', () => {
    expect(isModuleEnabled('gatekeeper', mockSociety)).toBe(true);
    expect(isModuleEnabled('billing', mockSociety)).toBe(true);
    expect(isModuleEnabled('voting', mockSociety)).toBe(false);
    expect(isModuleEnabled('facility_booking', mockSociety)).toBe(false);
  });

  test('Should grant SOCIETY_ADMIN full permissions across all modules', () => {
    const adminPermissions = ROLE_PERMISSION_MAP['SOCIETY_ADMIN'];
    expect(adminPermissions).toContain('billing:write');
    expect(adminPermissions).toContain('gatekeeper:write');
    expect(adminPermissions).toContain('committee:write');
    expect(adminPermissions).toContain('settings:write');
  });

  test('Should restrict TREASURER from managing gatekeeper staff or settings', () => {
    const treasurerPermissions = ROLE_PERMISSION_MAP['TREASURER'];
    expect(treasurerPermissions).toContain('billing:write');
    expect(treasurerPermissions).toContain('expenses:write');
    expect(treasurerPermissions).not.toContain('gatekeeper:write');
    expect(treasurerPermissions).not.toContain('settings:write');
  });

  test('Should restrict SECRETARY from modifying financial billing settings', () => {
    const secretaryPermissions = ROLE_PERMISSION_MAP['SECRETARY'];
    expect(secretaryPermissions).toContain('voting:write');
    expect(secretaryPermissions).toContain('notices:write');
    expect(secretaryPermissions).toContain('helpdesk:write');
    expect(secretaryPermissions).not.toContain('billing:write');
  });

  test('Should restrict GATE_STAFF to gatekeeper security and panic alert logs only', () => {
    const gatePermissions = ROLE_PERMISSION_MAP['GATE_STAFF'];
    expect(gatePermissions).toContain('gatekeeper:read');
    expect(gatePermissions).toContain('gatekeeper:write');
    expect(gatePermissions).toContain('alerts:write');
    expect(gatePermissions).not.toContain('billing:write');
    expect(gatePermissions).not.toContain('voting:write');
  });
});
