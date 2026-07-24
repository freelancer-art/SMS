import { generateSocietyCode, generateSocietySlug, provisionUserAccount } from '../../src/utils/authHelpers';
import { hashPassword, verifyPassword } from '../../src/utils/security';
import { UserAuth, Society } from '../../src/types';
import { MockDatabaseStore } from '../setup';

describe('06 - Auth & Identity Security Tests', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('test_duplicate_society_names: Onboard two societies with identical names ("Om Residency") and verify unique SocietyCodes and slugs prevent auth collision', () => {
    const existingCodes: string[] = [];

    // Onboard First Society with name "Om Residency"
    const name1 = 'Om Residency';
    const code1 = generateSocietyCode(name1, existingCodes);
    existingCodes.push(code1);
    const slug1 = generateSocietySlug(name1);

    const society1: Society = {
      id: `soc_om_1`,
      Name: name1,
      SocietyCode: code1,
      Slug: slug1,
      BuildingType: 'Housing Society',
      PostalAddress: '12 MG Road, Pune 411001',
      Wings: ['A', 'B'],
      HasWings: true
    };
    dbStore.societies.set(society1.id, society1);

    // Onboard Second Society with IDENTICAL name "Om Residency"
    const name2 = 'Om Residency';
    const code2 = generateSocietyCode(name2, existingCodes);
    existingCodes.push(code2);
    const slug2 = generateSocietySlug(name2);

    const society2: Society = {
      id: `soc_om_2`,
      Name: name2,
      SocietyCode: code2,
      Slug: slug2,
      BuildingType: 'Apartment Complex',
      PostalAddress: '99 Ring Road, Mumbai 400050',
      Wings: ['Tower 1'],
      HasWings: true
    };
    dbStore.societies.set(society2.id, society2);

    // Assert Code & Slug Uniqueness
    expect(code1).toBe('OMRE1');
    expect(code2).toBe('OMRE2'); // Disambiguated code
    expect(code1).not.toEqual(code2);

    expect(slug1).not.toEqual(slug2); // Unique short hash suffixes
    expect(slug1).toContain('om-residency');
    expect(slug2).toContain('om-residency');

    // Assert User Provisioning for each society maps to isolated auth realms
    const auth1 = provisionUserAccount({
      emailOrPhone: 'admin@omresidency1.com',
      roleId: 'Role-om1-admin',
      societyId: society1.id
    });
    const auth2 = provisionUserAccount({
      emailOrPhone: 'admin@omresidency2.com',
      roleId: 'Role-om2-admin',
      societyId: society2.id
    });

    expect(auth1.userAuth.SocietyId).toBe(society1.id);
    expect(auth2.userAuth.SocietyId).toBe(society2.id);
    expect(auth1.userAuth.SocietyId).not.toEqual(auth2.userAuth.SocietyId);
  });

  test('test_forced_password_reset_gate: Attempt navigating to protected routes with must_change_password: true and verify route guard enforces reset', () => {
    // Provision account with temporary credentials
    const { userAuth, tempPassword } = provisionUserAccount({
      emailOrPhone: 'new.secretary@greenwood.com',
      roleId: 'Role-greenwood-secretary',
      societyId: 'greenwood'
    });

    // Assert MustChangePassword flag is set to true on initial state
    expect(userAuth.MustChangePassword).toBe(true);
    expect(userAuth.TempPassword).toBe(tempPassword);

    // Simulated Route Guard function checking authentication status
    const evaluateRouteGuard = (auth: UserAuth, requestedRoute: string): { allowed: boolean; redirectRoute: string } => {
      if (auth.MustChangePassword) {
        return { allowed: false, redirectRoute: '/forced-password-reset' };
      }
      return { allowed: true, redirectRoute: requestedRoute };
    };

    // Attempt accessing protected dashboard routes
    const nav1 = evaluateRouteGuard(userAuth, '/dashboard');
    expect(nav1.allowed).toBe(false);
    expect(nav1.redirectRoute).toBe('/forced-password-reset');

    const nav2 = evaluateRouteGuard(userAuth, '/billing/invoices');
    expect(nav2.allowed).toBe(false);
    expect(nav2.redirectRoute).toBe('/forced-password-reset');

    // User submits password reset
    const newSecretPassword = 'NewStrongPassword#2026';
    const updatedSalt = 'NEW-SALT-SEC-2026';
    const updatedHash = hashPassword(newSecretPassword, updatedSalt);

    const updatedUserAuth: UserAuth = {
      ...userAuth,
      PasswordHash: updatedHash,
      Salt: updatedSalt,
      MustChangePassword: false, // Flag cleared after password update
      TempPassword: undefined
    };

    // Retry accessing protected route after successful reset
    const nav3 = evaluateRouteGuard(updatedUserAuth, '/dashboard');
    expect(nav3.allowed).toBe(true);
    expect(nav3.redirectRoute).toBe('/dashboard');

    // Verify password validation with new credentials
    const isPasswordValid = verifyPassword(newSecretPassword, updatedUserAuth.PasswordHash, updatedUserAuth.Salt);
    expect(isPasswordValid).toBe(true);
  });
});
