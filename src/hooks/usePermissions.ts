import { UserAuth, Role, GranularRoleName } from '../types';

export type PermissionKey =
  | 'billing:read'
  | 'billing:write'
  | 'gatekeeper:read'
  | 'gatekeeper:write'
  | 'voting:read'
  | 'voting:write'
  | 'helpdesk:read'
  | 'helpdesk:write'
  | 'members:read'
  | 'members:write'
  | 'expenses:read'
  | 'expenses:write'
  | 'reports:read'
  | 'committee:write'
  | 'settings:write'
  | 'notices:write'
  | 'vault:write'
  | 'facility:write'
  | 'alerts:write';

export const ROLE_PERMISSION_MAP: Record<string, PermissionKey[]> = {
  SOCIETY_ADMIN: [
    'billing:read',
    'billing:write',
    'gatekeeper:read',
    'gatekeeper:write',
    'voting:read',
    'voting:write',
    'helpdesk:read',
    'helpdesk:write',
    'members:read',
    'members:write',
    'expenses:read',
    'expenses:write',
    'reports:read',
    'committee:write',
    'settings:write',
    'notices:write',
    'vault:write',
    'facility:write',
    'alerts:write'
  ],
  SuperAdmin: [
    'billing:read',
    'billing:write',
    'gatekeeper:read',
    'gatekeeper:write',
    'voting:read',
    'voting:write',
    'helpdesk:read',
    'helpdesk:write',
    'members:read',
    'members:write',
    'expenses:read',
    'expenses:write',
    'reports:read',
    'committee:write',
    'settings:write',
    'notices:write',
    'vault:write',
    'facility:write',
    'alerts:write'
  ],
  Admin: [
    'billing:read',
    'billing:write',
    'gatekeeper:read',
    'gatekeeper:write',
    'voting:read',
    'voting:write',
    'helpdesk:read',
    'helpdesk:write',
    'members:read',
    'members:write',
    'expenses:read',
    'expenses:write',
    'reports:read',
    'committee:write',
    'settings:write',
    'notices:write',
    'vault:write',
    'facility:write',
    'alerts:write'
  ],
  TREASURER: [
    'billing:read',
    'billing:write',
    'members:read',
    'expenses:read',
    'expenses:write',
    'reports:read'
  ],
  SECRETARY: [
    'voting:read',
    'voting:write',
    'helpdesk:read',
    'helpdesk:write',
    'notices:write',
    'members:read',
    'vault:write',
    'facility:write'
  ],
  GATE_STAFF: [
    'gatekeeper:read',
    'gatekeeper:write',
    'alerts:write'
  ],
  RESIDENT: [
    'billing:read',
    'gatekeeper:read',
    'voting:read',
    'helpdesk:write',
    'facility:write'
  ],
  Member: [
    'billing:read',
    'gatekeeper:read',
    'voting:read',
    'helpdesk:write',
    'facility:write'
  ]
};

export function getRoleNameFromAuth(userAuth?: UserAuth | null, roles: Role[] = []): string {
  if (!userAuth) return 'RESIDENT';
  if (userAuth.IsSuperAdmin) return 'SuperAdmin';
  
  const roleObj = roles.find(r => r.id === userAuth.RoleId);
  if (roleObj) return roleObj.RoleName;

  if (userAuth.RoleId.toLowerCase().includes('admin')) return 'SOCIETY_ADMIN';
  if (userAuth.RoleId.toLowerCase().includes('treasurer')) return 'TREASURER';
  if (userAuth.RoleId.toLowerCase().includes('secretary')) return 'SECRETARY';
  if (userAuth.RoleId.toLowerCase().includes('gate')) return 'GATE_STAFF';

  return 'RESIDENT';
}

export function usePermissions(userAuth?: UserAuth | null, roles: Role[] = []) {
  const currentRoleName = getRoleNameFromAuth(userAuth, roles);

  const hasPermission = (permission: PermissionKey): boolean => {
    if (currentRoleName === 'SuperAdmin' || currentRoleName === 'SOCIETY_ADMIN' || currentRoleName === 'Admin') {
      return true;
    }
    const granted = ROLE_PERMISSION_MAP[currentRoleName] || [];
    return granted.includes(permission);
  };

  const isSocietyAdmin = currentRoleName === 'SOCIETY_ADMIN' || currentRoleName === 'Admin' || currentRoleName === 'SuperAdmin';
  const isTreasurer = currentRoleName === 'TREASURER';
  const isSecretary = currentRoleName === 'SECRETARY';
  const isGateStaff = currentRoleName === 'GATE_STAFF';
  const isResident = currentRoleName === 'RESIDENT' || currentRoleName === 'Member';

  return {
    currentRoleName,
    hasPermission,
    isSocietyAdmin,
    isTreasurer,
    isSecretary,
    isGateStaff,
    isResident,
    canManageCommittee: hasPermission('committee:write'),
    canManageSettings: hasPermission('settings:write'),
    canEditBilling: hasPermission('billing:write'),
    canManageGatekeeper: hasPermission('gatekeeper:write'),
    canManageNotices: hasPermission('notices:write'),
    canManageVoting: hasPermission('voting:write')
  };
}
