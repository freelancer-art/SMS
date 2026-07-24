import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Users, Search, CheckCircle2, ChevronRight, Award, Lock, Shield, UserX, AlertCircle } from 'lucide-react';
import { Member, Role, UserAuth, GranularRoleName } from '../types';
import { ROLE_PERMISSION_MAP, getRoleNameFromAuth } from '../hooks/usePermissions';

interface CommitteeManagementProps {
  members: Member[];
  userAuths: UserAuth[];
  roles: Role[];
  societyName: string;
  onUpdateUserRole: (memberEmailOrPhone: string, newRoleName: GranularRoleName) => void;
  theme?: 'light' | 'dark';
}

const GRANULAR_ROLE_OPTIONS: { name: GranularRoleName; title: string; desc: string; badgeColor: string; icon: string }[] = [
  {
    name: 'SOCIETY_ADMIN',
    title: 'Society Administrator',
    desc: 'Full administrative rights across all modules, feature toggles, committee management, and financial settings.',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: '👑'
  },
  {
    name: 'TREASURER',
    title: 'Financial Treasurer',
    desc: 'Manages batch invoicing, payment approvals, expenses, financial ledgers, and audit reports. Cannot edit gatekeeper or system settings.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: '💼'
  },
  {
    name: 'SECRETARY',
    title: 'Society Secretary',
    desc: 'Oversees announcements, AGM voting polls, complaints helpdesk, tenant approvals, and document vault.',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: '📜'
  },
  {
    name: 'GATE_STAFF',
    title: 'Security & Gate Staff',
    desc: 'Authorized to check in/out visitors, scan QR passes, and trigger emergency guard panic alerts.',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: '🛡️'
  },
  {
    name: 'RESIDENT',
    title: 'Resident Member',
    desc: 'Standard resident flat owner or tenant access (view invoices, pay online, pre-approve guests, raise tickets, vote).',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    icon: '🏠'
  }
];

export default function CommitteeManagement({
  members,
  userAuths,
  roles,
  societyName,
  onUpdateUserRole,
  theme = 'light'
}: CommitteeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [targetRole, setTargetRole] = useState<GranularRoleName>('RESIDENT');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Helper to get current role for a member
  const getMemberRoleName = (member: Member): GranularRoleName => {
    const identifier = member.Email ? member.Email.toLowerCase() : member.ContactNo ? member.ContactNo : '';
    const auth = userAuths.find(u => u.EmailOrPhone.toLowerCase() === identifier.toLowerCase());
    if (auth) {
      return getRoleNameFromAuth(auth, roles) as GranularRoleName;
    }
    if (member.Role === 'Admin') return 'SOCIETY_ADMIN';
    return 'RESIDENT';
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.OwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.FlatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.Email && m.Email.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentRole = getMemberRoleName(m);
    const matchesRole = selectedRoleFilter === 'ALL' || currentRole === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const handleSaveRole = () => {
    if (!editingMember) return;
    const identifier = editingMember.Email || editingMember.ContactNo;
    onUpdateUserRole(identifier, targetRole);

    setSuccessMsg(`Assigned role ${targetRole} to ${editingMember.OwnerName} (Flat ${editingMember.FlatNo})`);
    setTimeout(() => setSuccessMsg(null), 3000);
    setEditingMember(null);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-sm space-y-6 text-left`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              Committee Member RBAC & Sub-Admin Rights
            </h2>
            <p className="text-xs text-slate-400">
              Assign granular roles ({societyName}) to committee members, treasurers, secretaries, and security staff.
            </p>
          </div>
        </div>

        {/* Committee Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
            👑 Admins: {members.filter(m => getMemberRoleName(m) === 'SOCIETY_ADMIN').length}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            💼 Treasurers: {members.filter(m => getMemberRoleName(m) === 'TREASURER').length}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            📜 Secretaries: {members.filter(m => getMemberRoleName(m) === 'SECRETARY').length}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Definitions Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GRANULAR_ROLE_OPTIONS.map((r) => (
          <div
            key={r.name}
            className={`p-3.5 rounded-xl border transition-all ${
              isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold flex items-center gap-1.5">
                <span>{r.icon}</span> {r.title}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${r.badgeColor}`}>
                {r.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search member name or flat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-extrabold text-slate-400 shrink-0">Filter Role:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">All Roles ({members.length})</option>
            <option value="SOCIETY_ADMIN">SOCIETY_ADMIN</option>
            <option value="TREASURER">TREASURER</option>
            <option value="SECRETARY">SECRETARY</option>
            <option value="GATE_STAFF">GATE_STAFF</option>
            <option value="RESIDENT">RESIDENT</option>
          </select>
        </div>
      </div>

      {/* Members & Committee Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b uppercase font-extrabold text-[10px] tracking-wider ${
              isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <tr>
                <th className="p-3 px-4">Flat No</th>
                <th className="p-3 px-4">Resident Name</th>
                <th className="p-3 px-4">Contact Info</th>
                <th className="p-3 px-4">Current Committee Role</th>
                <th className="p-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
              {filteredMembers.map((m) => {
                const currentRole = getMemberRoleName(m);
                const roleMeta = GRANULAR_ROLE_OPTIONS.find(r => r.name === currentRole) || GRANULAR_ROLE_OPTIONS[4];

                return (
                  <tr key={m.id || m.FlatNo} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-3 px-4 font-mono font-black text-purple-600 dark:text-purple-400">
                      {m.FlatNo}
                    </td>
                    <td className="p-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {m.OwnerName}
                      {m.Status === 'Tenant' && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-extrabold">Tenant</span>
                      )}
                    </td>
                    <td className="p-3 px-4 text-slate-400 font-medium">
                      {m.Email ? m.Email : m.ContactNo}
                    </td>
                    <td className="p-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${roleMeta.badgeColor}`}>
                        <span>{roleMeta.icon}</span>
                        <span>{roleMeta.title}</span>
                      </span>
                    </td>
                    <td className="p-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingMember(m);
                          setTargetRole(currentRole);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Assign Committee Role</h3>
                <p className="text-xs text-slate-400">
                  {editingMember.OwnerName} • Flat {editingMember.FlatNo}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-extrabold uppercase text-slate-400">Select Committee Role:</label>
              <div className="space-y-2">
                {GRANULAR_ROLE_OPTIONS.map((roleOpt) => {
                  const isSelected = targetRole === roleOpt.name;
                  return (
                    <div
                      key={roleOpt.name}
                      onClick={() => setTargetRole(roleOpt.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                          : isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="committeeRole"
                        checked={isSelected}
                        onChange={() => setTargetRole(roleOpt.name)}
                        className="mt-1 accent-purple-600 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{roleOpt.icon} {roleOpt.title}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${roleOpt.badgeColor}`}>
                            {roleOpt.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{roleOpt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Save Role Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
