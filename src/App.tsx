import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Sparkles, 
  HelpCircle, 
  Github, 
  Database, 
  ArrowRight,
  RefreshCw,
  Cpu,
  Sun,
  Moon,
  Cloud,
  X,
  Key,
  Check,
  ShieldCheck,
  Mail,
  Lock,
  Smartphone
} from 'lucide-react';
import { Member, Payment, Expense, Complaint, Notice, Society, AuditLog, Invoice, Visitor, ComplaintReply, Role, UserAuth, EmergencyContact, Tenant, Vehicle, GuestParking, SocietyDocument, AssetAMC, WaterMeter, FeatureFlags, Poll, PollVote, Staff, StaffAttendance, Vendor, UserConsent, PushToken, GranularRoleName } from './types';
import { 
  MULTI_TENANT_MEMBERS, 
  MULTI_TENANT_PAYMENTS, 
  MULTI_TENANT_EXPENSES, 
  MULTI_TENANT_COMPLAINTS, 
  MULTI_TENANT_NOTICES,
  MULTI_TENANT_INVOICES,
  MULTI_TENANT_VISITORS,
  MULTI_TENANT_COMPLAINT_REPLIES,
  MULTI_TENANT_ROLES,
  MULTI_TENANT_USER_AUTHS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_TENANTS,
  INITIAL_VEHICLES,
  INITIAL_GUEST_PARKINGS,
  INITIAL_SOCIETY_DOCUMENTS,
  INITIAL_ASSET_AMCS,
  INITIAL_WATER_METERS,
  INITIAL_POLLS,
  INITIAL_POLL_VOTES,
  INITIAL_STAFF,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_VENDORS,
  INITIAL_USER_CONSENTS,
  INITIAL_PUSH_TOKENS
} from './data/mockData';
import { hashPassword, generateSalt, generateVisitorAccessToken } from './utils/security';
import CommitteeManagement from './components/CommitteeManagement';
import SocietyModuleSettings from './components/SocietyModuleSettings';
import ForcedPasswordResetModal from './components/ForcedPasswordResetModal';
import CredentialDeliveryLogModal from './components/CredentialDeliveryLogModal';
import { provisionUserAccount, dispatchWelcomeNotification, generateTempPassword } from './utils/authHelpers';
import { crashReporter } from './utils/logger';
import MobileSimulator from './components/MobileSimulator';
import ExpoDeveloperHub from './components/ExpoDeveloperHub';
import OnboardingWizard from './components/OnboardingWizard';

const DEFAULT_SOCIETIES: Society[] = [
  {
    id: 'greenwood',
    Name: 'Greenwood Residency',
    SocietyCode: 'GWRES01',
    Slug: 'greenwood-residency-gw01',
    PrimaryAdminEmail: 'amit080578@gmail.com',
    BuildingType: 'Housing Society',
    PostalAddress: '123 Greenwood Road, Sector 5, Mumbai, MH - 400001',
    Wings: [],
    HasWings: false,
    StructureType: 'standalone'
  },
  {
    id: 'royal_heights',
    Name: 'Royal Heights Complex',
    SocietyCode: 'ROYAL02',
    Slug: 'royal-heights-rh02',
    PrimaryAdminEmail: 'secretary@royalheights.com',
    BuildingType: 'Apartment Complex',
    PostalAddress: 'Plot 45-47, Palm Beach Road, Sanpada, Navi Mumbai, MH - 400705',
    Wings: ['Tower 1 - Wing A', 'Tower 1 - Wing B', 'Tower 2 - Wing A', 'Tower 2 - Wing B'],
    HasWings: true,
    StructureType: 'towers_wings',
    Towers: [
      { id: 't1', Name: 'Tower 1', Wings: ['Wing A', 'Wing B'] },
      { id: 't2', Name: 'Tower 2', Wings: ['Wing A', 'Wing B'] }
    ]
  },
  {
    id: 'sea_breeze',
    Name: 'Sea Breeze Co-op Society',
    SocietyCode: 'SEABR03',
    Slug: 'sea-breeze-sb03',
    PrimaryAdminEmail: 'secretary@seabreeze.com',
    BuildingType: 'Residential Co-operative',
    PostalAddress: 'Beach Road, Juhu, Mumbai, MH - 400049',
    Wings: ['Wing A', 'Wing B'],
    HasWings: true,
    StructureType: 'wings'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AL-mock-1',
    SocietyId: 'greenwood',
    Timestamp: '2026-07-18T10:15:30.000Z',
    UserRole: 'Admin',
    UserId: 'admin-gate',
    UserName: 'Committee Admin',
    Action: 'Configure Society',
    Details: "Updated society wings configuration: wings set to ['A', 'B', 'C']"
  },
  {
    id: 'AL-mock-2',
    SocietyId: 'greenwood',
    Timestamp: '2026-07-17T14:22:15.000Z',
    UserRole: 'Admin',
    UserId: 'admin-gate',
    UserName: 'Committee Admin',
    Action: 'Modify Member',
    Details: 'Updated profile contact for Unit 102 (Priya Patel)'
  },
  {
    id: 'AL-mock-3',
    SocietyId: 'greenwood',
    Timestamp: '2026-07-15T09:41:00.000Z',
    UserRole: 'Admin',
    UserId: 'admin-gate',
    UserName: 'Committee Admin',
    Action: 'Log Payment',
    Details: 'Recorded payment of ₹1500 for Unit 101 via UPI (Ref: UPI92837498112)'
  }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Supabase Connection States
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (process as any).env?.VITE_SUPABASE_URL;
    return envUrl || localStorage.getItem('society_supabase_url') || '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => {
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (process as any).env?.VITE_SUPABASE_ANON_KEY;
    return envKey || localStorage.getItem('society_supabase_anon_key') || '';
  });
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [cloudSyncUrlInput, setCloudSyncUrlInput] = useState('');
  const [cloudSyncKeyInput, setCloudSyncKeyInput] = useState('');
  const [cloudSyncStatusMsg, setCloudSyncStatusMsg] = useState<string | null>(null);

  // Multi-Society States
  const [societies, setSocieties] = useState<Society[]>(() => {
    const saved = localStorage.getItem('society_list_all');
    return saved ? JSON.parse(saved) : DEFAULT_SOCIETIES;
  });
  const [activeSocietyId, setActiveSocietyId] = useState<string>(() => {
    return localStorage.getItem('active_society_id') || 'greenwood';
  });

  // Super-Admin Society Register & RBAC States
  const [showRegisterSociety, setShowRegisterSociety] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showCredentialDeliveryLog, setShowCredentialDeliveryLog] = useState(false);
  const [showCommitteeManagementModal, setShowCommitteeManagementModal] = useState(false);
  const [showSocietySettingsModal, setShowSocietySettingsModal] = useState(false);
  const [currentSimUserEmail, setCurrentSimUserEmail] = useState<string>(() => {
    return localStorage.getItem('society_sim_logged_email') || 'amit080578@gmail.com';
  });
  const [newSocName, setNewSocName] = useState('');
  const [newSocType, setNewSocType] = useState('Housing Society');
  const [newSocAddress, setNewSocAddress] = useState('');
  const [newSocHasWings, setNewSocHasWings] = useState(true);
  const [newSocWingsList, setNewSocWingsList] = useState('A, B, C');

  // Derived active society properties
  const activeSociety = societies.find(s => s.id === activeSocietyId) || societies[0] || DEFAULT_SOCIETIES[0];
  const societyName = activeSociety.Name;
  const hasWings = activeSociety.HasWings;
  const wingsList = activeSociety.Wings;
  const postalAddress = activeSociety.PostalAddress;
  const buildingType = activeSociety.BuildingType;

  // Database States (Store ALL elements; we filter them dynamically)
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [complaintReplies, setComplaintReplies] = useState<ComplaintReply[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userAuths, setUserAuths] = useState<UserAuth[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [guestParkings, setGuestParkings] = useState<GuestParking[]>([]);
  const [societyDocuments, setSocietyDocuments] = useState<SocietyDocument[]>([]);
  const [assetAMCs, setAssetAMCs] = useState<AssetAMC[]>([]);
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffAttendanceList, setStaffAttendanceList] = useState<StaffAttendance[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [userConsents, setUserConsents] = useState<UserConsent[]>([]);
  const [pushTokens, setPushTokens] = useState<PushToken[]>([]);
  const [lastSynced, setLastSynced] = useState<string>(() => localStorage.getItem('society_last_synced') || '');

  const updateUserConsentsState = (list: UserConsent[]) => {
    setUserConsents(list);
    localStorage.setItem('society_user_consents', JSON.stringify(list));
  };

  const updatePushTokensState = (list: PushToken[]) => {
    setPushTokens(list);
    localStorage.setItem('society_push_tokens', JSON.stringify(list));
  };

  // Initialize production crash logger
  useEffect(() => {
    crashReporter.init(activeSocietyId);
  }, [activeSocietyId]);

  // Init Data from LocalStorage or Fallbacks
  useEffect(() => {
    const localMembers = localStorage.getItem('society_members');
    const localPayments = localStorage.getItem('society_payments');
    const localExpenses = localStorage.getItem('society_expenses');
    const localComplaints = localStorage.getItem('society_complaints');
    const localNotices = localStorage.getItem('society_notices');
    const localAuditLogs = localStorage.getItem('society_audit_logs');
    const localInvoices = localStorage.getItem('society_invoices');
    const localVisitors = localStorage.getItem('society_visitors');
    const localReplies = localStorage.getItem('society_complaint_replies');
    const savedUrl = localStorage.getItem('society_supabase_url') || 'https://czirnbiybxydsdzbimyw.supabase.co';
    const savedKey = localStorage.getItem('society_supabase_anon_key') || '';

    // Safe parser helper
    const getSafeList = (localValue: string | null, fallback: any[]) => {
      if (!localValue) return fallback;
      try {
        const parsed = JSON.parse(localValue);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (e) {
        return fallback;
      }
    };

    const localSocs = localStorage.getItem('society_list_all');
    const parsedSocs = getSafeList(localSocs, DEFAULT_SOCIETIES);
    let updatedSocs = [...parsedSocs];
    let socsUpdated = false;

    const hasOnboarded = localStorage.getItem('society_onboarded_v2') !== null;
    if (!hasOnboarded && (!localSocs || JSON.parse(localSocs || '[]').length === 0)) {
      setShowOnboardingWizard(true);
    }

    // Ensure Greenwood Residency has HasWings: false, Wings: []
    updatedSocs = updatedSocs.map(s => {
      if (s.id === 'greenwood' && (s.HasWings || s.Wings.length > 0)) {
        socsUpdated = true;
        return { ...s, HasWings: false, Wings: [] };
      }
      return s;
    });

    // Ensure default societies exist
    DEFAULT_SOCIETIES.forEach(ds => {
      const exists = updatedSocs.some(s => s.id === ds.id);
      if (!exists) {
        updatedSocs.push(ds);
        socsUpdated = true;
      }
    });

    if (socsUpdated) {
      localStorage.setItem('society_list_all', JSON.stringify(updatedSocs));
    }
    setSocieties(updatedSocs);

    const initialMembers = getSafeList(localMembers, MULTI_TENANT_MEMBERS);
    let updatedMembers = [...initialMembers];
    let membersUpdated = false;
    MULTI_TENANT_MEMBERS.forEach(mockM => {
      const exists = updatedMembers.some(m => m.SocietyId === mockM.SocietyId && m.FlatNo === mockM.FlatNo);
      if (!exists) {
        updatedMembers.push(mockM);
        membersUpdated = true;
      }
    });
    if (membersUpdated) {
      localStorage.setItem('society_members', JSON.stringify(updatedMembers));
    }

    setMembers(updatedMembers);
    setPayments(getSafeList(localPayments, MULTI_TENANT_PAYMENTS));
    setExpenses(getSafeList(localExpenses, MULTI_TENANT_EXPENSES));
    setComplaints(getSafeList(localComplaints, MULTI_TENANT_COMPLAINTS));
    setNotices(getSafeList(localNotices, MULTI_TENANT_NOTICES));
    setAuditLogs(getSafeList(localAuditLogs, DEFAULT_AUDIT_LOGS));
    setInvoices(getSafeList(localInvoices, MULTI_TENANT_INVOICES));
    setVisitors(getSafeList(localVisitors, MULTI_TENANT_VISITORS));
    setComplaintReplies(getSafeList(localReplies, MULTI_TENANT_COMPLAINT_REPLIES));

    // Initialize Roles and UserAuth tables in LocalStorage / State
    const localRoles = localStorage.getItem('society_roles');
    const localUserAuths = localStorage.getItem('society_user_auths');
    const localEmergencyContacts = localStorage.getItem('society_emergency_contacts');
    const localTenants = localStorage.getItem('society_tenants');
    const localVehicles = localStorage.getItem('society_vehicles');
    const localGuestParkings = localStorage.getItem('society_guest_parkings');
    const localDocuments = localStorage.getItem('society_documents');
    const localAMCs = localStorage.getItem('society_asset_amcs');
    const localMeters = localStorage.getItem('society_water_meters');
    const localPolls = localStorage.getItem('society_polls');
    const localPollVotes = localStorage.getItem('society_poll_votes');
    const localStaff = localStorage.getItem('society_staff');
    const localStaffAttendance = localStorage.getItem('society_staff_attendance');
    const localVendors = localStorage.getItem('society_vendors');
    const localConsents = localStorage.getItem('society_user_consents');
    const localTokens = localStorage.getItem('society_push_tokens');
    
    const parsedRoles = getSafeList(localRoles, MULTI_TENANT_ROLES);
    let parsedAuths = getSafeList(localUserAuths, MULTI_TENANT_USER_AUTHS);

    // Compute PasswordHash dynamically for default mock passwords if empty
    parsedAuths = parsedAuths.map((auth: any) => {
      if (!auth.PasswordHash) {
        const plainPass = auth.EmailOrPhone === 'superadmin@societyconnect.com' ? 'superadmin' : 'admin123';
        auth.PasswordHash = hashPassword(plainPass, auth.Salt);
      }
      return auth;
    });

    setRoles(parsedRoles);
    setUserAuths(parsedAuths);
    localStorage.setItem('society_roles', JSON.stringify(parsedRoles));
    localStorage.setItem('society_user_auths', JSON.stringify(parsedAuths));

    const parsedEmergencyContacts = getSafeList(localEmergencyContacts, INITIAL_EMERGENCY_CONTACTS);
    const parsedTenants = getSafeList(localTenants, INITIAL_TENANTS);
    const parsedVehicles = getSafeList(localVehicles, INITIAL_VEHICLES);
    const parsedGuestParkings = getSafeList(localGuestParkings, INITIAL_GUEST_PARKINGS);
    const parsedDocuments = getSafeList(localDocuments, INITIAL_SOCIETY_DOCUMENTS);
    const parsedAMCs = getSafeList(localAMCs, INITIAL_ASSET_AMCS);
    const parsedMeters = getSafeList(localMeters, INITIAL_WATER_METERS);
    const parsedPolls = getSafeList(localPolls, INITIAL_POLLS);
    const parsedPollVotes = getSafeList(localPollVotes, INITIAL_POLL_VOTES);
    const parsedStaff = getSafeList(localStaff, INITIAL_STAFF);
    const parsedStaffAttendance = getSafeList(localStaffAttendance, INITIAL_STAFF_ATTENDANCE);
    const parsedVendors = getSafeList(localVendors, INITIAL_VENDORS);
    const parsedConsents = getSafeList(localConsents, INITIAL_USER_CONSENTS);
    const parsedPushTokens = getSafeList(localTokens, INITIAL_PUSH_TOKENS);

    setEmergencyContacts(parsedEmergencyContacts);
    setTenants(parsedTenants);
    setVehicles(parsedVehicles);
    setGuestParkings(parsedGuestParkings);
    setSocietyDocuments(parsedDocuments);
    setAssetAMCs(parsedAMCs);
    setWaterMeters(parsedMeters);
    setPolls(parsedPolls);
    setPollVotes(parsedPollVotes);
    setStaffList(parsedStaff);
    setStaffAttendanceList(parsedStaffAttendance);
    setVendorList(parsedVendors);
    setUserConsents(parsedConsents);
    setPushTokens(parsedPushTokens);

    localStorage.setItem('society_emergency_contacts', JSON.stringify(parsedEmergencyContacts));
    localStorage.setItem('society_tenants', JSON.stringify(parsedTenants));
    localStorage.setItem('society_vehicles', JSON.stringify(parsedVehicles));
    localStorage.setItem('society_guest_parkings', JSON.stringify(parsedGuestParkings));
    localStorage.setItem('society_documents', JSON.stringify(parsedDocuments));
    localStorage.setItem('society_asset_amcs', JSON.stringify(parsedAMCs));
    localStorage.setItem('society_water_meters', JSON.stringify(parsedMeters));
    localStorage.setItem('society_polls', JSON.stringify(parsedPolls));
    localStorage.setItem('society_poll_votes', JSON.stringify(parsedPollVotes));
    localStorage.setItem('society_staff', JSON.stringify(parsedStaff));
    localStorage.setItem('society_staff_attendance', JSON.stringify(parsedStaffAttendance));
    localStorage.setItem('society_vendors', JSON.stringify(parsedVendors));

    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseAnonKey(savedKey);
      syncWithSupabase(savedUrl, savedKey, true);
    }
  }, []);

  // Caching TTL & Background Sync Settings
  const lastSyncTimestampRef = useRef<number>(0);
  const CACHE_TTL_MS = 30000; // 30 seconds caching window to avoid redundant fetches on tab switching

  // Auto-sync on window focus / tab switching if cache TTL expired
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && supabaseUrl && supabaseAnonKey) {
        const now = Date.now();
        if (now - lastSyncTimestampRef.current > CACHE_TTL_MS) {
          syncWithSupabase(supabaseUrl, supabaseAnonKey, false);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [supabaseUrl, supabaseAnonKey]);

  // Save changes to local storage when database state updates
  const updateMembersState = (newMembers: Member[]) => {
    lastSyncTimestampRef.current = Date.now();
    setMembers(newMembers);
    localStorage.setItem('society_members', JSON.stringify(newMembers));
  };

  const updatePaymentsState = (newPayments: Payment[]) => {
    lastSyncTimestampRef.current = Date.now();
    setPayments(newPayments);
    localStorage.setItem('society_payments', JSON.stringify(newPayments));
  };

  const updateExpensesState = (newExpenses: Expense[]) => {
    lastSyncTimestampRef.current = Date.now();
    setExpenses(newExpenses);
    localStorage.setItem('society_expenses', JSON.stringify(newExpenses));
  };

  const updateComplaintsState = (newComplaints: Complaint[]) => {
    lastSyncTimestampRef.current = Date.now();
    setComplaints(newComplaints);
    localStorage.setItem('society_complaints', JSON.stringify(newComplaints));
  };

  const updateVisitorsState = (newVisitors: Visitor[]) => {
    lastSyncTimestampRef.current = Date.now();
    setVisitors(newVisitors);
    localStorage.setItem('society_visitors', JSON.stringify(newVisitors));
  };

  const updateInvoicesState = (newInvoices: Invoice[]) => {
    lastSyncTimestampRef.current = Date.now();
    setInvoices(newInvoices);
    localStorage.setItem('society_invoices', JSON.stringify(newInvoices));
  };

  const updateComplaintRepliesState = (newReplies: ComplaintReply[]) => {
    setComplaintReplies(newReplies);
    localStorage.setItem('society_complaint_replies', JSON.stringify(newReplies));
  };

  const updateRolesState = (newRoles: Role[]) => {
    setRoles(newRoles);
    localStorage.setItem('society_roles', JSON.stringify(newRoles));
  };

  const updateUserAuthsState = (newUserAuths: UserAuth[]) => {
    setUserAuths(newUserAuths);
    localStorage.setItem('society_user_auths', JSON.stringify(newUserAuths));
  };

  const updateEmergencyContactsState = (newList: EmergencyContact[]) => {
    setEmergencyContacts(newList);
    localStorage.setItem('society_emergency_contacts', JSON.stringify(newList));
  };

  const updateTenantsState = (newList: Tenant[]) => {
    setTenants(newList);
    localStorage.setItem('society_tenants', JSON.stringify(newList));
  };

  const updateVehiclesState = (newList: Vehicle[]) => {
    setVehicles(newList);
    localStorage.setItem('society_vehicles', JSON.stringify(newList));
  };

  const updateGuestParkingsState = (newList: GuestParking[]) => {
    setGuestParkings(newList);
    localStorage.setItem('society_guest_parkings', JSON.stringify(newList));
  };

  const updateSocietyDocumentsState = (newList: SocietyDocument[]) => {
    setSocietyDocuments(newList);
    localStorage.setItem('society_documents', JSON.stringify(newList));
  };

  const updateAssetAMCsState = (newList: AssetAMC[]) => {
    setAssetAMCs(newList);
    localStorage.setItem('society_asset_amcs', JSON.stringify(newList));
  };

  const updateWaterMetersState = (newList: WaterMeter[]) => {
    setWaterMeters(newList);
    localStorage.setItem('society_water_meters', JSON.stringify(newList));
  };

  const updatePollsState = (newList: Poll[]) => {
    setPolls(newList);
    localStorage.setItem('society_polls', JSON.stringify(newList));
  };

  const updatePollVotesState = (newList: PollVote[]) => {
    setPollVotes(newList);
    localStorage.setItem('society_poll_votes', JSON.stringify(newList));
  };

  const updateStaffState = (newStaff: Staff[]) => {
    setStaffList(newStaff);
    localStorage.setItem('society_staff', JSON.stringify(newStaff));
  };

  const updateStaffAttendanceState = (newAtt: StaffAttendance[]) => {
    setStaffAttendanceList(newAtt);
    localStorage.setItem('society_staff_attendance', JSON.stringify(newAtt));
  };

  const updateVendorState = (newVendors: Vendor[]) => {
    setVendorList(newVendors);
    localStorage.setItem('society_vendors', JSON.stringify(newVendors));
  };

  const handleAddPoll = async (newPoll: Omit<Poll, 'id'>) => {
    const poll: Poll = {
      ...newPoll,
      id: `POLL-${Date.now()}`
    };
    const nextPolls = [poll, ...polls];
    updatePollsState(nextPolls);
    handleAddAuditLog('Create Resolution Poll', `Created AGM resolution: ${poll.Title}`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Polls`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(poll)
        });
      } catch (err) {
        console.error('Failed to post Poll to Supabase:', err);
      }
    }
  };

  const handleCastVote = async (newVote: Omit<PollVote, 'id'>) => {
    const vote: PollVote = {
      ...newVote,
      id: `PV-${Date.now()}`
    };
    // Replace vote if flat already voted on this poll, else append
    const existingIdx = pollVotes.findIndex(v => v.PollId === vote.PollId && v.FlatNo === vote.FlatNo);
    let nextVotes: PollVote[];
    if (existingIdx >= 0) {
      nextVotes = [...pollVotes];
      nextVotes[existingIdx] = vote;
    } else {
      nextVotes = [...pollVotes, vote];
    }
    updatePollVotesState(nextVotes);
    handleAddAuditLog('Cast Resolution Vote', `Flat ${vote.FlatNo} voted '${vote.Vote}' on poll ${vote.PollId}`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/PollVotes`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(vote)
        });
      } catch (err) {
        console.error('Failed to post PollVote to Supabase:', err);
      }
    }
  };

  // Connect & Save Supabase Credentials
  const handleSetSupabaseCredentials = (url: string, anonKey: string) => {
    setSupabaseUrl(url);
    setSupabaseAnonKey(anonKey);
    localStorage.setItem('society_supabase_url', url);
    localStorage.setItem('society_supabase_anon_key', anonKey);
    // Fetch fresh data from newly connected Supabase database
    if (url && anonKey) {
      syncWithSupabase(url, anonKey);
    }
  };

  // SEED & Reset Supabase with starting mock data
  const pushMockDataToSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Supabase credentials are required.' };
    }
    try {
      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      };

      const clearAndInsert = async (tableName: string, rows: any[], idField: string) => {
        if (!rows || rows.length === 0) return;

        // Normalize object keys: PostgREST requires all objects in an array insert to have identical keys.
        // We find the union of all keys and fill missing ones with null.
        const allKeys = Array.from(new Set(rows.flatMap(obj => Object.keys(obj))));
        const normalizedRows = rows.map(obj => {
          const normalized: any = {};
          for (const key of allKeys) {
            normalized[key] = obj[key] !== undefined ? obj[key] : null;
          }
          return normalized;
        });

        // Attempt to delete existing data first
        const deleteRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}?${idField}=neq.0`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        
        if (!deleteRes.ok) {
          const errText = await deleteRes.text();
          let msg = '';
          try { msg = JSON.parse(errText).message; } catch(e) { msg = errText; }
          console.warn(`DELETE failed for ${tableName}:`, msg);
          
          if (deleteRes.status === 404) {
            throw new Error(`Table "${tableName}" does not exist in your Supabase database. Please copy the updated script from the "SupabaseSchema.sql" tab and run it in your Supabase SQL Editor.`);
          }
        }

        // Insert fresh rows with automatic column-stripping retry if remote schema lacks columns
        let currentPayload = normalizedRows;
        let attempts = 0;
        let strippedCols: string[] = [];

        while (attempts < 15) {
          attempts++;
          const insertRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(currentPayload)
          });
          
          if (insertRes.ok) {
            if (strippedCols.length > 0) {
              console.log(`Successfully seeded '${tableName}' after omitting column(s) missing from remote schema: ${strippedCols.join(', ')}.`);
            }
            return;
          }

          const errText = await insertRes.text();
          let msg = '';
          try { msg = JSON.parse(errText).message || JSON.parse(errText).hint || errText; } catch(e) { msg = errText; }
          console.warn(`POST failed for ${tableName} (attempt ${attempts}):`, msg);
          
          if (insertRes.status === 404) {
            throw new Error(`Table "${tableName}" does not exist in your Supabase database. Please copy the updated script from the "SupabaseSchema.sql" tab and run it in your Supabase SQL Editor.`);
          }

          if (msg.includes("row-level security policy") || msg.includes("RLS") || msg.includes("violates row-level security")) {
            throw new Error(`Failed to seed "${tableName}": Row-Level Security (RLS) policy blocked client data insertion/deletion. Please copy the updated script from the "SupabaseSchema.sql" tab and run it in your Supabase SQL Editor to update permissions.`);
          }

          // Check if error is due to a missing column in Supabase schema cache
          if (msg.includes("Could not find the") && msg.includes("column of")) {
            const match = msg.match(/Could not find the '([^']+)' column/);
            if (match && match[1]) {
              const missingCol = match[1];
              if (!strippedCols.includes(missingCol)) {
                strippedCols.push(missingCol);
              }
              console.warn(`Column '${missingCol}' missing in remote Supabase table '${tableName}'. Stripping column and retrying...`);
              currentPayload = currentPayload.map(row => {
                const copy = { ...row };
                delete copy[missingCol];
                return copy;
              });
              continue;
            }
          }

          throw new Error(`Failed to seed "${tableName}": ${msg}`);
        }
      };

      // Seed Societies metadata table
      const formattedSocieties = societies.map(s => ({
        id: s.id,
        Name: s.Name,
        BuildingType: s.BuildingType,
        PostalAddress: s.PostalAddress,
        Wings: Array.isArray(s.Wings) ? s.Wings : (s.Wings ? String(s.Wings).split(',').map(w => w.trim()).filter(Boolean) : []),
        HasWings: s.HasWings
      }));
      await clearAndInsert('Societies', formattedSocieties, 'id');

      // Seed Roles and UserAuth tables
      await clearAndInsert('Roles', MULTI_TENANT_ROLES, 'id');
      const formattedAuths = MULTI_TENANT_USER_AUTHS.map(auth => {
        const plain = auth.EmailOrPhone === 'superadmin@societyconnect.com' ? 'superadmin' : 'admin123';
        const hash = auth.PasswordHash || hashPassword(plain, auth.Salt);
        return {
          id: auth.id,
          EmailOrPhone: auth.EmailOrPhone,
          PasswordHash: hash,
          Salt: auth.Salt,
          RoleId: auth.RoleId,
          SocietyId: auth.SocietyId || null,
          Status: auth.Status
        };
      });
      await clearAndInsert('UserAuth', formattedAuths, 'id');

      // Seed parent tables before child tables (Vendors before Expenses, Members before Payments, etc.)
      await clearAndInsert('Members', MULTI_TENANT_MEMBERS, 'id');

      const formattedVendors = INITIAL_VENDORS.map(v => ({
        ...v,
        VendorName: v.VendorName || v.Name || 'Unknown Vendor',
        Name: v.Name || v.VendorName || 'Unknown Vendor'
      }));
      await clearAndInsert('Vendors', formattedVendors, 'id');

      await clearAndInsert('Staff', INITIAL_STAFF, 'id');
      await clearAndInsert('Polls', INITIAL_POLLS, 'id');

      const formattedComplaints = MULTI_TENANT_COMPLAINTS.map(c => ({
        ...c,
        CreatedAt: (c as any).CreatedAt || (c as any).Date || new Date().toISOString()
      }));
      await clearAndInsert('Complaints', formattedComplaints, 'id');

      // Seed child/dependent tables
      await clearAndInsert('Payments', MULTI_TENANT_PAYMENTS, 'id');
      await clearAndInsert('Expenses', MULTI_TENANT_EXPENSES, 'id');
      await clearAndInsert('Notices', MULTI_TENANT_NOTICES, 'id');

      const formattedInvoices = MULTI_TENANT_INVOICES.map((inv, idx) => ({
        ...inv,
        InvoiceNo: (inv as any).InvoiceNo || inv.id || `INV-${inv.SocietyId}-${idx + 100}`,
        BillingPeriod: (inv as any).BillingPeriod || (inv as any).BillMonth || 'July 2026',
        GeneratedDate: (inv as any).GeneratedDate || (inv as any).IssuedDate || new Date().toISOString().split('T')[0],
        DueDate: inv.DueDate || new Date().toISOString().split('T')[0],
        MaintenanceCharge: (inv as any).MaintenanceCharge ?? (inv as any).BaseAmount ?? 2000,
        UtilityCharge: (inv as any).UtilityCharge ?? (inv as any).SecurityCharges ?? 0,
        WaterCharge: (inv as any).WaterCharge ?? (inv as any).WaterCharges ?? 0,
        ParkingCharge: (inv as any).ParkingCharge ?? (inv as any).ParkingCharges ?? 0,
        LateFee: (inv as any).LateFee ?? (inv as any).LateFeeCharges ?? 0,
        PreviousArrears: (inv as any).PreviousArrears ?? 0,
        TotalAmount: inv.TotalAmount ?? 2000,
        Status: inv.Status || 'Unpaid'
      }));
      await clearAndInsert('Invoices', formattedInvoices, 'id');

      const formattedVisitors = MULTI_TENANT_VISITORS.map(v => ({
        ...v,
        Phone: (v as any).Phone || (v as any).ContactNo || '+91 99999 99999',
        VisitorName: v.VisitorName || 'Guest Visitor',
        Purpose: v.Purpose || 'Guest',
        CheckInTime: v.CheckInTime || new Date().toISOString(),
        Status: v.Status || 'Approved'
      }));
      await clearAndInsert('Visitors', formattedVisitors, 'id');

      const formattedComplaintReplies = MULTI_TENANT_COMPLAINT_REPLIES.map(r => {
        const complaintExists = formattedComplaints.some(c => c.id === r.ComplaintId);
        return {
          ...r,
          ComplaintId: complaintExists ? r.ComplaintId : (formattedComplaints[0]?.id || 'C-101')
        };
      });
      await clearAndInsert('ComplaintReplies', formattedComplaintReplies, 'id');

      // Seed Tier 1 tables
      await clearAndInsert('EmergencyContacts', INITIAL_EMERGENCY_CONTACTS, 'id');

      const formattedTenants = INITIAL_TENANTS.map(t => ({
        ...t,
        Email: t.Email || `${t.TenantName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        ContactNo: t.ContactNo || '+91 99999 99999'
      }));
      await clearAndInsert('Tenants', formattedTenants, 'id');
      await clearAndInsert('Vehicles', INITIAL_VEHICLES, 'id');
      await clearAndInsert('GuestParking', INITIAL_GUEST_PARKINGS, 'id');

      // Seed Tier 2 tables
      await clearAndInsert('SocietyDocuments', INITIAL_SOCIETY_DOCUMENTS, 'id');
      await clearAndInsert('AssetAMCs', INITIAL_ASSET_AMCS, 'id');
      await clearAndInsert('WaterMeters', INITIAL_WATER_METERS, 'id');

      // Seed child tables referencing Staff & Polls
      const formattedStaffAttendance = INITIAL_STAFF_ATTENDANCE.map(sa => ({
        ...sa,
        RecordedBy: (sa as any).RecordedBy || (sa as any).GatekeeperName || 'Main Gate Security'
      }));
      await clearAndInsert('StaffAttendance', formattedStaffAttendance, 'id');

      const formattedPollVotes = INITIAL_POLL_VOTES.map(pv => ({
        ...pv,
        VotedBy: (pv as any).VotedBy || 'Member',
        Vote: (pv as any).Vote || 'In Favor',
        VotedAt: (pv as any).VotedAt || (pv as any).Timestamp || new Date().toISOString()
      }));
      await clearAndInsert('PollVotes', formattedPollVotes, 'id');

      // Seed UserConsents (DPDP Act 2023)
      await clearAndInsert('UserConsents', INITIAL_USER_CONSENTS, 'id');

      // Seed settings (for backwards compatibility)
      const settingsRows = [
        { Key: 'societyName', Value: societyName },
        { Key: 'hasWings', Value: String(hasWings) },
        { Key: 'wingsList', Value: wingsList.join(', ') },
        { Key: 'postalAddress', Value: postalAddress },
        { Key: 'buildingType', Value: buildingType }
      ];

      try {
        for (const s of settingsRows) {
          await fetch(`${supabaseUrl}/rest/v1/Settings?Key=eq.${s.Key}`, {
            method: 'DELETE',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`
            }
          });
        }
        const setRes = await fetch(`${supabaseUrl}/rest/v1/Settings`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(settingsRows)
        });
        if (!setRes.ok && setRes.status === 404) {
          throw new Error('Table "Settings" does not exist.');
        }
      } catch (settingsErr: any) {
        console.warn('Failed to seed Settings table:', settingsErr.message);
      }

      // After resetting, trigger a full pull to sync local state
      await syncWithSupabase(supabaseUrl, supabaseAnonKey);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to reset Supabase with mock data:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  // FETCH Data from real Supabase PostgREST API
  const syncWithSupabase = async (targetUrl = supabaseUrl, targetKey = supabaseAnonKey, force = false) => {
    const cleanUrl = (targetUrl || '').trim();
    const cleanKey = (targetKey || '').trim();
    if (!cleanUrl || !cleanKey) return;

    // Caching layer: skip redundant network queries if fetched within TTL window (unless force = true)
    const now = Date.now();
    if (!force && lastSyncTimestampRef.current > 0 && (now - lastSyncTimestampRef.current < CACHE_TTL_MS)) {
      console.log('Using active client state cache (TTL active)');
      return;
    }
    lastSyncTimestampRef.current = now;

    try {
      const getHeaders = {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json'
      };

      const safeFetchJson = async (tableName: string, selectCols: string = '*') => {
        try {
          const url = `${cleanUrl}/rest/v1/${tableName}?select=${selectCols}`;
          const response = await fetch(url, { headers: getHeaders });
          if (!response.ok) {
            console.warn(`Fetch returned status ${response.status} for table ${tableName}`);
            return null;
          }
          return await response.json();
        } catch (e) {
          console.warn(`Failed to fetch table ${tableName}:`, e);
          return null;
        }
      };

      // 0. Fetch Societies
      const societiesData = await safeFetchJson('Societies', 'id,Name,BuildingType,PostalAddress,Wings,HasWings,StructureType,Towers');
      if (Array.isArray(societiesData) && societiesData.length > 0) {
        let formattedSocs: Society[] = societiesData.map(s => ({
          id: String(s.id),
          Name: s.Name || 'Unnamed Society',
          BuildingType: s.BuildingType || 'Housing Society',
          PostalAddress: s.PostalAddress || '',
          Wings: s.Wings ? (Array.isArray(s.Wings) ? s.Wings : String(s.Wings).split(',').map((w: string) => w.trim()).filter((w: string) => w !== '')) : [],
          HasWings: s.HasWings === true || s.HasWings === 'true',
          StructureType: s.StructureType || (s.HasWings ? 'wings' : 'standalone'),
          Towers: s.Towers ? (typeof s.Towers === 'string' ? JSON.parse(s.Towers) : s.Towers) : undefined
        }));

        // Always force Greenwood to be wing-less
        formattedSocs = formattedSocs.map(s => {
          if (s.id === 'greenwood') {
            return { ...s, HasWings: false, Wings: [], StructureType: 'standalone' };
          }
          return s;
        });

        // Merge any default societies that might be missing in the fetched results
        DEFAULT_SOCIETIES.forEach(ds => {
          const exists = formattedSocs.some(s => s.id === ds.id);
          if (!exists) {
            formattedSocs.push(ds);
          }
        });

        setSocieties(formattedSocs);
        localStorage.setItem('society_list_all', JSON.stringify(formattedSocs));
      }

      // 1. Fetch Members with optimized projection
      const membersData = await safeFetchJson('Members', 'id,SocietyId,FlatNo,OwnerName,ContactNo,Email,Balance,Status,CoOwners,VehicleNo,Wing');
      if (Array.isArray(membersData) && membersData.length > 0) {
        const formatted: Member[] = membersData
          .filter(m => m && m.FlatNo)
          .map(m => ({
            id: m.id || `M-greenwood-${m.FlatNo}`,
            SocietyId: m.SocietyId || 'greenwood',
            FlatNo: String(m.FlatNo || ''),
            OwnerName: String(m.OwnerName || ''),
            ContactNo: String(m.ContactNo || ''),
            Email: String(m.Email || ''),
            Balance: parseFloat(String(m.Balance || 0)) || 0,
            Status: m.Status === 'Tenant' ? 'Tenant' : 'Owner',
            CoOwners: m.CoOwners || '',
            VehicleNo: m.VehicleNo || '',
            Wing: m.Wing || ''
          }));

        // Merge default multi-tenant members if they are missing in the database list
        const mergedMembers = [...formatted];
        MULTI_TENANT_MEMBERS.forEach(mockM => {
          const exists = mergedMembers.some(m => m.SocietyId === mockM.SocietyId && m.FlatNo === mockM.FlatNo);
          if (!exists) {
            mergedMembers.push(mockM);
          }
        });

        updateMembersState(mergedMembers);
      }

      // 2. Fetch Payments with optimized projection
      const paymentsData = await safeFetchJson('Payments', 'id,SocietyId,MemberId,Date,FlatNo,OwnerName,Amount,Mode,ReferenceNo,Status');
      if (Array.isArray(paymentsData)) {
        const formatted: Payment[] = paymentsData
          .filter(p => p && p.FlatNo)
          .map((p, idx) => ({
            id: p.id || `P-${idx}-${p.FlatNo}`,
            SocietyId: p.SocietyId || 'greenwood',
            MemberId: p.MemberId || '',
            Date: p.Date || '',
            FlatNo: String(p.FlatNo || ''),
            OwnerName: p.OwnerName || '',
            Amount: parseFloat(String(p.Amount || 0)) || 0,
            Mode: p.Mode || 'UPI',
            ReferenceNo: p.ReferenceNo || '',
            Status: p.Status || 'Cleared'
          })).sort((a,b) => b.Date.localeCompare(a.Date));
        updatePaymentsState(formatted);
      }

      // 3. Fetch Expenses with optimized projection
      const expensesData = await safeFetchJson('Expenses', 'id,SocietyId,Date,Category,Amount,Vendor,InvoiceNo,ApprovedBy,Status,RequiresDualApproval,SecretaryApproved,SecretaryApprovedBy,TreasurerApproved,TreasurerApprovedBy,VendorId');
      if (Array.isArray(expensesData)) {
        const formatted: Expense[] = expensesData
          .filter(e => e && e.Amount)
          .map((e, idx) => ({
            id: e.id || `E-${idx}`,
            SocietyId: e.SocietyId || 'greenwood',
            Date: e.Date || '',
            Category: e.Category || 'Others',
            Amount: parseFloat(String(e.Amount || 0)) || 0,
            Vendor: e.Vendor || '',
            InvoiceNo: e.InvoiceNo || '',
            ApprovedBy: e.ApprovedBy || 'Committee',
            Status: e.Status || 'Approved',
            RequiresDualApproval: e.RequiresDualApproval === true || e.RequiresDualApproval === 'true',
            SecretaryApproved: e.SecretaryApproved === true || e.SecretaryApproved === 'true',
            SecretaryApprovedBy: e.SecretaryApprovedBy || undefined,
            TreasurerApproved: e.TreasurerApproved === true || e.TreasurerApproved === 'true',
            TreasurerApprovedBy: e.TreasurerApprovedBy || undefined,
            VendorId: e.VendorId || undefined
          })).sort((a,b) => b.Date.localeCompare(a.Date));
        updateExpensesState(formatted);
      }

      // 4. Fetch Complaints with optimized projection
      const complaintsData = await safeFetchJson('Complaints', 'id,SocietyId,MemberId,FlatNo,Category,Title,Description,Date,Status,Urgency');
      if (Array.isArray(complaintsData)) {
        const formatted: Complaint[] = complaintsData
          .filter(c => c && c.id)
          .map(c => ({
            id: String(c.id || ''),
            SocietyId: c.SocietyId || 'greenwood',
            MemberId: c.MemberId || '',
            FlatNo: String(c.FlatNo || ''),
            Category: c.Category || 'Others',
            Title: c.Title || '',
            Description: c.Description || '',
            Date: c.Date || '',
            Status: c.Status || 'Open',
            Urgency: c.Urgency || 'Medium'
          })).sort((a,b) => b.Date.localeCompare(a.Date));
        updateComplaintsState(formatted);
      }

      // 5. Fetch Notices with optimized projection
      const noticesData = await safeFetchJson('Notices', 'id,SocietyId,Date,Title,Category,Content,AttachmentUrl,PostedBy');
      if (Array.isArray(noticesData)) {
        const formatted: Notice[] = noticesData
          .filter(n => n && n.id)
          .map(n => ({
            id: String(n.id || ''),
            SocietyId: n.SocietyId || 'greenwood',
            Date: n.Date || '',
            Title: n.Title || '',
            Category: n.Category || 'General',
            Content: n.Content || '',
            AttachmentUrl: n.AttachmentUrl || '',
            PostedBy: n.PostedBy || 'Management'
          })).sort((a,b) => b.Date.localeCompare(a.Date));
        setNotices(formatted);
        localStorage.setItem('society_notices', JSON.stringify(formatted));
      }

      // 6. Fetch AuditLogs with optimized projection
      const auditLogsData = await safeFetchJson('AuditLogs', 'id,SocietyId,Timestamp,UserRole,UserId,UserName,Action,Details');
      if (Array.isArray(auditLogsData)) {
        const formatted: AuditLog[] = auditLogsData
          .filter(al => al && al.id)
          .map(al => ({
            id: String(al.id || ''),
            SocietyId: al.SocietyId || 'greenwood',
            Timestamp: al.Timestamp || '',
            UserRole: al.UserRole || 'Admin',
            UserId: al.UserId || '',
            UserName: al.UserName || '',
            Action: al.Action || '',
            Details: al.Details || ''
          })).sort((a,b) => b.Timestamp.localeCompare(a.Timestamp));
        setAuditLogs(formatted);
        localStorage.setItem('society_audit_logs', JSON.stringify(formatted));
      }

      // 7. Fetch Invoices with optimized projection
      const invoicesData = await safeFetchJson('Invoices', 'id,SocietyId,BillMonth,FlatNo,OwnerName,BaseAmount,WaterCharges,SecurityCharges,ParkingCharges,TotalAmount,DueDate,Status,IssuedDate');
      if (Array.isArray(invoicesData)) {
        const formatted: Invoice[] = invoicesData
          .filter(i => i && i.id)
          .map(i => ({
            id: String(i.id),
            SocietyId: i.SocietyId || 'greenwood',
            BillMonth: i.BillMonth || '',
            FlatNo: String(i.FlatNo || ''),
            OwnerName: i.OwnerName || '',
            BaseAmount: parseFloat(String(i.BaseAmount || 0)) || 0,
            WaterCharges: parseFloat(String(i.WaterCharges || 0)) || 0,
            SecurityCharges: parseFloat(String(i.SecurityCharges || 0)) || 0,
            ParkingCharges: parseFloat(String(i.ParkingCharges || 0)) || 0,
            TotalAmount: parseFloat(String(i.TotalAmount || 0)) || 0,
            DueDate: i.DueDate || '',
            Status: (i.Status === 'Paid' ? 'Paid' : 'Unpaid') as 'Paid' | 'Unpaid',
            IssuedDate: i.IssuedDate || ''
          })).sort((a,b) => b.IssuedDate.localeCompare(a.IssuedDate));
        updateInvoicesState(formatted);
      }

      // 8. Fetch Visitors with optimized projection
      const visitorsData = await safeFetchJson('Visitors', 'id,SocietyId,FlatNo,VisitorName,Purpose,ContactNo,VehicleNo,CheckInTime,CheckOutTime,Status,HostApprovedBy');
      if (Array.isArray(visitorsData)) {
        const formatted: Visitor[] = visitorsData
          .filter(v => v && v.id)
          .map(v => ({
            id: String(v.id),
            SocietyId: v.SocietyId || 'greenwood',
            FlatNo: String(v.FlatNo || ''),
            VisitorName: v.VisitorName || '',
            Purpose: v.Purpose || 'Delivery',
            ContactNo: v.ContactNo || '',
            VehicleNo: v.VehicleNo || '',
            CheckInTime: v.CheckInTime || '',
            CheckOutTime: v.CheckOutTime || undefined,
            Status: v.Status || 'Pending Approval',
            HostApprovedBy: v.HostApprovedBy || undefined
          })).sort((a,b) => b.CheckInTime.localeCompare(a.CheckInTime));
        updateVisitorsState(formatted);
      }

      // 9. Fetch ComplaintReplies
      const complaintRepliesData = await safeFetchJson('ComplaintReplies', 'id,ComplaintId,SocietyId,SenderName,SenderRole,Message,Timestamp');
      if (Array.isArray(complaintRepliesData)) {
        const formatted: ComplaintReply[] = complaintRepliesData
          .filter(r => r && r.id)
          .map(r => ({
            id: String(r.id),
            ComplaintId: r.ComplaintId || '',
            SocietyId: r.SocietyId || 'greenwood',
            SenderName: r.SenderName || '',
            SenderRole: (r.SenderRole === 'Admin' ? 'Admin' : 'Member') as 'Admin' | 'Member',
            Message: r.Message || '',
            Timestamp: r.Timestamp || ''
          })).sort((a,b) => a.Timestamp.localeCompare(b.Timestamp));
        updateComplaintRepliesState(formatted);
      }

      // 10. Fetch Roles
      const rolesData = await safeFetchJson('Roles', 'id,RoleName,SocietyId,Description');
      if (Array.isArray(rolesData) && rolesData.length > 0) {
        const formatted: Role[] = rolesData.map(r => ({
          id: String(r.id),
          RoleName: r.RoleName as any,
          SocietyId: r.SocietyId || undefined,
          Description: r.Description || ''
        }));
        updateRolesState(formatted);
      }

      // 11. Fetch UserAuth
      const userAuthData = await safeFetchJson('UserAuth', 'id,EmailOrPhone,PasswordHash,Salt,RoleId,SocietyId,Status');
      if (Array.isArray(userAuthData) && userAuthData.length > 0) {
        const formatted: UserAuth[] = userAuthData.map(ua => ({
          id: String(ua.id),
          EmailOrPhone: String(ua.EmailOrPhone),
          PasswordHash: String(ua.PasswordHash),
          Salt: String(ua.Salt),
          RoleId: String(ua.RoleId),
          SocietyId: ua.SocietyId || undefined,
          Status: ua.Status as any || 'Active'
        }));
        updateUserAuthsState(formatted);
      }

      // 12. Fetch EmergencyContacts (Tier 1)
      const ecData = await safeFetchJson('EmergencyContacts', 'id,SocietyId,Name,Category,Phone,RoleOrTitle,IsImportant');
      if (Array.isArray(ecData)) {
        const formatted: EmergencyContact[] = ecData.map(ec => ({
          id: String(ec.id),
          SocietyId: ec.SocietyId || 'greenwood',
          Name: ec.Name || '',
          Category: ec.Category || 'Other',
          Phone: ec.Phone || '',
          RoleOrTitle: ec.RoleOrTitle || '',
          IsImportant: ec.IsImportant === true || ec.IsImportant === 'true'
        }));
        updateEmergencyContactsState(formatted);
      }

      // 13. Fetch Tenants (Tier 1)
      const tenantsData = await safeFetchJson('Tenants', 'id,SocietyId,FlatNo,TenantName,ContactNo,Email,MoveInDate,MoveOutDate,AgreementDocUrl,IdProofDocUrl,KycStatus,Remarks');
      if (Array.isArray(tenantsData)) {
        const formatted: Tenant[] = tenantsData.map(t => ({
          id: String(t.id),
          SocietyId: t.SocietyId || 'greenwood',
          FlatNo: String(t.FlatNo || ''),
          TenantName: t.TenantName || '',
          ContactNo: t.ContactNo || '',
          Email: t.Email || '',
          MoveInDate: t.MoveInDate || '',
          MoveOutDate: t.MoveOutDate || undefined,
          AgreementDocUrl: t.AgreementDocUrl || undefined,
          IdProofDocUrl: t.IdProofDocUrl || undefined,
          KycStatus: t.KycStatus || 'Pending',
          Remarks: t.Remarks || ''
        }));
        updateTenantsState(formatted);
      }

      // 14. Fetch Vehicles (Tier 1)
      const vehiclesData = await safeFetchJson('Vehicles', 'id,SocietyId,FlatNo,OwnerName,VehicleNo,VehicleType,ParkingSlotNo,StickerIssued');
      if (Array.isArray(vehiclesData)) {
        const formatted: Vehicle[] = vehiclesData.map(v => ({
          id: String(v.id),
          SocietyId: v.SocietyId || 'greenwood',
          FlatNo: String(v.FlatNo || ''),
          OwnerName: v.OwnerName || '',
          VehicleNo: v.VehicleNo || '',
          VehicleType: v.VehicleType || '4-Wheeler',
          ParkingSlotNo: v.ParkingSlotNo || '',
          StickerIssued: v.StickerIssued === true || v.StickerIssued === 'true'
        }));
        updateVehiclesState(formatted);
      }

      // 15. Fetch GuestParking (Tier 1)
      const gpData = await safeFetchJson('GuestParking', 'id,SocietyId,FlatNo,GuestName,VehicleNo,VehicleType,AssignedSlot,ValidFrom,ValidUntil,Status');
      if (Array.isArray(gpData)) {
        const formatted: GuestParking[] = gpData.map(gp => ({
          id: String(gp.id),
          SocietyId: gp.SocietyId || 'greenwood',
          FlatNo: String(gp.FlatNo || ''),
          GuestName: gp.GuestName || '',
          VehicleNo: gp.VehicleNo || '',
          VehicleType: gp.VehicleType || '4-Wheeler',
          AssignedSlot: gp.AssignedSlot || '',
          ValidFrom: gp.ValidFrom || '',
          ValidUntil: gp.ValidUntil || '',
          Status: gp.Status || 'Active'
        }));
        updateGuestParkingsState(formatted);
      }

      // 16. Fetch SocietyDocuments (Tier 2)
      const docsData = await safeFetchJson('SocietyDocuments', 'id,SocietyId,Title,Category,DocumentUrl,IsPublic,UploadedBy,UploadedAt,FileSize');
      if (Array.isArray(docsData)) {
        const formatted: SocietyDocument[] = docsData.map(d => ({
          id: String(d.id),
          SocietyId: d.SocietyId || 'greenwood',
          Title: d.Title || '',
          Category: d.Category || 'General Circulars',
          DocumentUrl: d.DocumentUrl || '',
          IsPublic: d.IsPublic === true || d.IsPublic === 'true',
          UploadedBy: d.UploadedBy || 'Admin',
          UploadedAt: d.UploadedAt || new Date().toISOString().split('T')[0],
          FileSize: d.FileSize || '1 MB'
        })).sort((a,b) => b.UploadedAt.localeCompare(a.UploadedAt));
        updateSocietyDocumentsState(formatted);
      }

      // 17. Fetch AssetAMCs (Tier 2)
      const amcData = await safeFetchJson('AssetAMCs', 'id,SocietyId,AssetName,AssetType,VendorName,VendorContact,ContractStartDate,ContractExpiryDate,LastServicedDate,NextServicedDate,ServiceStatus,StatusNote,ReportUrl');
      if (Array.isArray(amcData)) {
        const formatted: AssetAMC[] = amcData.map(a => ({
          id: String(a.id),
          SocietyId: a.SocietyId || 'greenwood',
          AssetName: a.AssetName || '',
          AssetType: a.AssetType || 'Lift',
          VendorName: a.VendorName || '',
          VendorContact: a.VendorContact || '',
          ContractStartDate: a.ContractStartDate || '',
          ContractExpiryDate: a.ContractExpiryDate || '',
          LastServicedDate: a.LastServicedDate || '',
          NextServicedDate: a.NextServicedDate || '',
          ServiceStatus: a.ServiceStatus || 'Operational',
          StatusNote: a.StatusNote || '',
          ReportUrl: a.ReportUrl || undefined
        }));
        updateAssetAMCsState(formatted);
      }

      // 18. Fetch WaterMeters (Tier 2)
      const wmData = await safeFetchJson('WaterMeters', 'id,SocietyId,FlatNo,ReadingMonth,PreviousReading,CurrentReading,UnitsConsumed,RecordedBy,RecordedAt,Status');
      if (Array.isArray(wmData)) {
        const formatted: WaterMeter[] = wmData.map(w => ({
          id: String(w.id),
          SocietyId: w.SocietyId || 'greenwood',
          FlatNo: String(w.FlatNo || ''),
          ReadingMonth: w.ReadingMonth || '',
          PreviousReading: parseFloat(String(w.PreviousReading || 0)) || 0,
          CurrentReading: parseFloat(String(w.CurrentReading || 0)) || 0,
          UnitsConsumed: parseFloat(String(w.UnitsConsumed || 0)) || 0,
          RecordedBy: w.RecordedBy || 'Plumber',
          RecordedAt: w.RecordedAt || new Date().toISOString().split('T')[0],
          Status: w.Status || 'Entered'
        })).sort((a,b) => b.ReadingMonth.localeCompare(a.ReadingMonth));
        updateWaterMetersState(formatted);
      }

      // 19. Fetch Polls & Resolutions
      const pollsData = await safeFetchJson('Polls', 'id,SocietyId,Title,Description,Category,StartDate,EndDate,Status,CreatedBy');
      if (Array.isArray(pollsData) && pollsData.length > 0) {
        const formatted: Poll[] = pollsData.map(p => ({
          id: String(p.id),
          SocietyId: p.SocietyId || 'greenwood',
          Title: p.Title || '',
          Description: p.Description || '',
          Category: p.Category || 'AGM Resolution',
          StartDate: p.StartDate || '',
          EndDate: p.EndDate || '',
          Status: p.Status || 'Active',
          CreatedBy: p.CreatedBy || 'Secretary'
        })).sort((a,b) => b.StartDate.localeCompare(a.StartDate));
        updatePollsState(formatted);
      }

      // 20. Fetch PollVotes
      const pollVotesData = await safeFetchJson('PollVotes', 'id,PollId,SocietyId,FlatNo,VotedBy,Vote,Timestamp,VotedAt');
      if (Array.isArray(pollVotesData)) {
        const formatted: PollVote[] = pollVotesData.map(v => ({
          id: String(v.id),
          PollId: String(v.PollId || ''),
          SocietyId: v.SocietyId || 'greenwood',
          FlatNo: String(v.FlatNo || ''),
          VotedBy: v.VotedBy || '',
          Vote: v.Vote || 'Abstain',
          Timestamp: v.Timestamp || v.VotedAt || new Date().toISOString()
        }));
        updatePollVotesState(formatted);
      }

      // 21. Fetch UserConsents (DPDP Act 2023)
      const userConsentsData = await safeFetchJson('UserConsents', 'id,UserId,SocietyId,ConsentedAt,PolicyVersion,IPAddress,UserRole');
      if (Array.isArray(userConsentsData)) {
        const formatted: UserConsent[] = userConsentsData.map(uc => ({
          id: String(uc.id),
          UserId: String(uc.UserId || ''),
          SocietyId: uc.SocietyId || 'greenwood',
          ConsentedAt: uc.ConsentedAt || '',
          PolicyVersion: uc.PolicyVersion || 'v1.0-2026',
          IPAddress: uc.IPAddress || '127.0.0.1',
          UserRole: uc.UserRole || 'Member'
        }));
        updateUserConsentsState(formatted);
      }

      // 22. Fetch PushTokens
      const pushTokensData = await safeFetchJson('PushTokens', 'id,UserId,SocietyId,FlatNo,ExpoPushToken,DeviceOS,CreatedAt,LastUsedAt');
      if (Array.isArray(pushTokensData)) {
        const formatted: PushToken[] = pushTokensData.map(pt => ({
          id: String(pt.id),
          UserId: String(pt.UserId || ''),
          SocietyId: pt.SocietyId || 'greenwood',
          FlatNo: String(pt.FlatNo || ''),
          ExpoPushToken: pt.ExpoPushToken || '',
          DeviceOS: pt.DeviceOS || 'android',
          CreatedAt: pt.CreatedAt || new Date().toISOString(),
          LastUsedAt: pt.LastUsedAt || new Date().toISOString()
        }));
        updatePushTokensState(formatted);
      }

      const timeString = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      setLastSynced(timeString);
      localStorage.setItem('society_last_synced', timeString);

    } catch (err) {
      console.warn('Failed to pull data from connected Supabase safely:', err);
    }
  };

  // Log admin actions helper
  const handleAddAuditLog = async (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `AL-${Date.now()}`,
      SocietyId: activeSocietyId,
      Timestamp: new Date().toISOString(),
      UserRole: 'Admin',
      UserId: 'admin-gate',
      UserName: 'Committee Admin',
      Action: action,
      Details: details
    };
    const nextLogs = [newLog, ...auditLogs];
    setAuditLogs(nextLogs);
    localStorage.setItem('society_audit_logs', JSON.stringify(nextLogs));

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/AuditLogs`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newLog)
        });
      } catch (err) {
        console.warn('Failed to post audit log to Supabase:', err);
      }
    }
  };

  // POST data trigger to Supabase
  const handleAddPayment = async (newPmt: Omit<Payment, 'id'>) => {
    // 1. Add locally first for instant reactive state
    const targetMember = members.find(m => m.FlatNo === newPmt.FlatNo && m.SocietyId === activeSocietyId);
    const ownerName = targetMember ? targetMember.OwnerName : 'Unknown';
    const memberId = targetMember ? targetMember.id : '';
    
    const loggedPayment: Payment = {
      ...newPmt,
      id: `P-${Date.now()}`,
      SocietyId: activeSocietyId,
      MemberId: memberId,
      OwnerName: ownerName
    };

    const nextPayments = [loggedPayment, ...payments];
    updatePaymentsState(nextPayments);

    // Update local member dues balance
    const nextMembers = members.map(m => {
      if (m.FlatNo === newPmt.FlatNo && m.SocietyId === activeSocietyId) {
        return { ...m, Balance: m.Balance - newPmt.Amount };
      }
      return m;
    });
    updateMembersState(nextMembers);

    // Log action
    handleAddAuditLog('Log Payment', `Recorded payment of ₹${newPmt.Amount} for Unit ${newPmt.FlatNo} via ${newPmt.Mode}`);

    // 2. Post to Supabase if connected
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Payments`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: loggedPayment.id,
            SocietyId: activeSocietyId,
            MemberId: memberId,
            Date: loggedPayment.Date,
            FlatNo: loggedPayment.FlatNo,
            OwnerName: ownerName,
            Amount: loggedPayment.Amount,
            Mode: loggedPayment.Mode,
            ReferenceNo: loggedPayment.ReferenceNo,
            Status: 'Cleared'
          })
        });

        // Update member outstanding dues in Supabase also
        if (targetMember) {
          const queryParam = targetMember.id ? `id=eq.${targetMember.id}` : `FlatNo=eq.${targetMember.FlatNo}&SocietyId=eq.${activeSocietyId}`;
          await fetch(`${supabaseUrl}/rest/v1/Members?${queryParam}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Balance: targetMember.Balance - loggedPayment.Amount
            })
          });
        }
      } catch (err) {
        console.error('Failed to post payment row to Supabase:', err);
      }
    }
  };

  const handleAddExpense = async (newExp: Omit<Expense, 'id'>) => {
    const isDualRequired = newExp.Amount > 5000;
    const loggedExpense: Expense = {
      ...newExp,
      id: `E-${Date.now()}`,
      SocietyId: activeSocietyId,
      RequiresDualApproval: isDualRequired,
      Status: isDualRequired ? 'Pending Approval' : 'Approved',
      ApprovedBy: isDualRequired ? 'Pending Dual Signoff (Secretary & Treasurer)' : (newExp.ApprovedBy || 'Committee'),
      SecretaryApproved: !isDualRequired,
      TreasurerApproved: !isDualRequired
    };

    const nextExpenses = [loggedExpense, ...expenses];
    updateExpensesState(nextExpenses);

    // Log action
    handleAddAuditLog('Log Expense', `Recorded expense of ₹${newExp.Amount} for '${newExp.Category}' paid to ${newExp.Vendor}. Dual Approval Required: ${isDualRequired ? 'YES' : 'NO'}`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Expenses`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: loggedExpense.id,
            SocietyId: activeSocietyId,
            Date: loggedExpense.Date,
            Category: loggedExpense.Category,
            Amount: loggedExpense.Amount,
            Vendor: loggedExpense.Vendor,
            InvoiceNo: loggedExpense.InvoiceNo,
            ApprovedBy: loggedExpense.ApprovedBy,
            Status: loggedExpense.Status,
            RequiresDualApproval: loggedExpense.RequiresDualApproval,
            SecretaryApproved: loggedExpense.SecretaryApproved,
            TreasurerApproved: loggedExpense.TreasurerApproved
          })
        });
      } catch (err) {
        console.error('Failed to post expense row to Supabase:', err);
      }
    }
  };

  // Staff Handlers
  const handleAddStaff = async (staff: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...staff,
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      SocietyId: activeSocietyId,
      Passcode: staff.Passcode || `${Math.floor(1000 + Math.random() * 9000)}`,
      GateStatus: staff.GateStatus || 'Checked Out',
      IdVerificationStatus: staff.IdVerificationStatus || 'Pending'
    };
    const updated = [newStaff, ...staffList];
    updateStaffState(updated);
    handleAddAuditLog('Register Domestic Staff', `Registered staff ${staff.Name} (${staff.ServiceType}) assigned to Flats: ${staff.AssignedFlats.join(', ')}`);
  };

  const handleUpdateStaff = async (id: string, staffData: Partial<Staff>) => {
    const updated = staffList.map(s => s.id === id ? { ...s, ...staffData } : s);
    updateStaffState(updated);
    handleAddAuditLog('Update Staff Profile', `Updated staff record for ID: ${id}`);
  };

  const handleDeleteStaff = async (id: string) => {
    const staff = staffList.find(s => s.id === id);
    const updated = staffList.filter(s => s.id !== id);
    updateStaffState(updated);
    handleAddAuditLog('Remove Staff Member', `Removed staff member ${staff?.Name || id}`);
  };

  const handleStaffCheckIn = async (staffId: string, passcode?: string, gatekeeperName: string = 'Main Gate Security') => {
    const staff = staffList.find(s => s.id === staffId || s.Passcode === passcode);
    if (!staff) return;

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const updatedStaff = staffList.map(s => s.id === staff.id ? { ...s, GateStatus: 'Inside' as const, LastCheckIn: nowIso } : s);
    updateStaffState(updatedStaff);

    const newAttendance: StaffAttendance = {
      id: `ATT-${Date.now()}`,
      SocietyId: activeSocietyId,
      StaffId: staff.id,
      StaffName: staff.Name,
      ServiceType: staff.ServiceType,
      CheckInTime: nowIso,
      CheckOutTime: null,
      Date: todayStr,
      PasscodeUsed: passcode || staff.Passcode,
      GatekeeperName: gatekeeperName,
      Status: 'Inside'
    };
    updateStaffAttendanceState([newAttendance, ...staffAttendanceList]);

    handleAddAuditLog('Staff Gate Check-In', `${staff.Name} (${staff.ServiceType}) entered society grounds. Passcode verified.`);
  };

  const handleStaffCheckOut = async (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    const nowIso = new Date().toISOString();

    const updatedStaff = staffList.map(s => s.id === staff.id ? { ...s, GateStatus: 'Checked Out' as const, LastCheckOut: nowIso } : s);
    updateStaffState(updatedStaff);

    const updatedAtt = staffAttendanceList.map(a => {
      if (a.StaffId === staff.id && a.Status === 'Inside') {
        return { ...a, CheckOutTime: nowIso, Status: 'Checked Out' as const };
      }
      return a;
    });
    updateStaffAttendanceState(updatedAtt);

    handleAddAuditLog('Staff Gate Check-Out', `${staff.Name} (${staff.ServiceType}) checked out of society.`);
  };

  // Vendor Handlers
  const handleAddVendor = async (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: `VEND-${Math.floor(100 + Math.random() * 900)}`,
      SocietyId: activeSocietyId
    };
    const updated = [newVendor, ...vendorList];
    updateVendorState(updated);
    handleAddAuditLog('Add Vendor', `Registered vendor '${vendor.Name}' (${vendor.ServiceCategory}) GST: ${vendor.GstNumber}`);
  };

  const handleUpdateVendor = async (id: string, vendorData: Partial<Vendor>) => {
    const updated = vendorList.map(v => v.id === id ? { ...v, ...vendorData } : v);
    updateVendorState(updated);
    handleAddAuditLog('Update Vendor', `Updated record for vendor ID: ${id}`);
  };

  const handleDeleteVendor = async (id: string) => {
    const vendor = vendorList.find(v => v.id === id);
    const updated = vendorList.filter(v => v.id !== id);
    updateVendorState(updated);
    handleAddAuditLog('Delete Vendor', `Deleted vendor '${vendor?.Name || id}'`);
  };

  // Expense Dual Approvals
  const handleApproveExpenseSecretary = async (expenseId: string, secretaryName: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;

    const nowIso = new Date().toISOString();
    const isFullyApproved = exp.TreasurerApproved === true || !exp.RequiresDualApproval;
    const nextStatus = isFullyApproved ? 'Approved' : 'Pending Approval';
    const nextApprovedBy = isFullyApproved ? `Dual Approved (${secretaryName} & ${exp.TreasurerApprovedBy || 'Treasurer'})` : `Approved by Secretary (${secretaryName})`;

    const updatedExpenses = expenses.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          SecretaryApproved: true,
          SecretaryApprovedBy: secretaryName,
          SecretaryApprovedAt: nowIso,
          Status: nextStatus as any,
          ApprovedBy: nextApprovedBy
        };
      }
      return e;
    });

    updateExpensesState(updatedExpenses);
    handleAddAuditLog('Secretary Expense Approval', `Secretary (${secretaryName}) approved expense ${exp.id} of ₹${exp.Amount} paid to ${exp.Vendor}.`);
  };

  const handleApproveExpenseTreasurer = async (expenseId: string, treasurerName: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;

    const nowIso = new Date().toISOString();
    const isFullyApproved = exp.SecretaryApproved === true || !exp.RequiresDualApproval;
    const nextStatus = isFullyApproved ? 'Approved' : 'Pending Approval';
    const nextApprovedBy = isFullyApproved ? `Dual Approved (${exp.SecretaryApprovedBy || 'Secretary'} & ${treasurerName})` : `Approved by Treasurer (${treasurerName})`;

    const updatedExpenses = expenses.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          TreasurerApproved: true,
          TreasurerApprovedBy: treasurerName,
          TreasurerApprovedAt: nowIso,
          Status: nextStatus as any,
          ApprovedBy: nextApprovedBy
        };
      }
      return e;
    });

    updateExpensesState(updatedExpenses);
    handleAddAuditLog('Treasurer Expense Approval', `Treasurer (${treasurerName}) approved expense ${exp.id} of ₹${exp.Amount} paid to ${exp.Vendor}.`);
  };

  const handleRejectExpense = async (expenseId: string, reason?: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;

    const updatedExpenses = expenses.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          Status: 'Rejected' as const,
          ApprovedBy: `Rejected: ${reason || 'Over-budget / Discrepancy'}`
        };
      }
      return e;
    });

    updateExpensesState(updatedExpenses);
    handleAddAuditLog('Reject Expense', `Expense ${exp.id} of ₹${exp.Amount} for ${exp.Vendor} rejected. Reason: ${reason || 'Not specified'}`);
  };

  const handleAddComplaint = async (newComp: Omit<Complaint, 'id'>) => {
    const compId = `C-${Math.floor(100 + Math.random() * 900)}`;
    const loggedComplaint: Complaint = {
      ...newComp,
      id: compId,
      SocietyId: activeSocietyId
    };

    const nextComplaints = [loggedComplaint, ...complaints];
    updateComplaintsState(nextComplaints);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Complaints`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: compId,
            SocietyId: activeSocietyId,
            FlatNo: loggedComplaint.FlatNo,
            Category: loggedComplaint.Category,
            Title: loggedComplaint.Title,
            Description: loggedComplaint.Description,
            Date: loggedComplaint.Date,
            Status: 'Open',
            Urgency: loggedComplaint.Urgency
          })
        });
      } catch (err) {
        console.error('Failed to post complaint row to Supabase:', err);
      }
    }
  };

  const handleUpdateComplaintStatus = async (id: string, nextStatus: 'Open' | 'In Progress' | 'Resolved', autoNotice?: { title: string; category: string; content: string }) => {
    // 1. Update locally
    const nextComplaints = complaints.map(c => {
      if (c.id === id) return { ...c, Status: nextStatus };
      return c;
    });
    updateComplaintsState(nextComplaints);

    // Audit action
    const targetComp = complaints.find(c => c.id === id);
    const flatNoText = targetComp ? ` (Unit ${targetComp.FlatNo})` : '';
    handleAddAuditLog('Update Complaint', `Updated complaint #${id}${flatNoText} status to '${nextStatus}'`);

    // Post notice if requested
    if (autoNotice) {
      const noticeId = `N-${Date.now()}`;
      const newNotice: Notice = {
        id: noticeId,
        SocietyId: activeSocietyId,
        Date: new Date().toISOString().split('T')[0],
        Title: autoNotice.title,
        Category: autoNotice.category as any,
        Content: autoNotice.content,
        PostedBy: 'Society Management'
      };
      const nextNotices = [newNotice, ...notices];
      setNotices(nextNotices);
      localStorage.setItem('society_notices', JSON.stringify(nextNotices));

      if (supabaseUrl && supabaseAnonKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/Notices`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNotice)
          });
        } catch (err) {
          console.error('Failed to post auto notice to Supabase:', err);
        }
      }
    }

    // 2. Post status change to Supabase if connected
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Complaints?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Status: nextStatus
          })
         });
      } catch (err) {
        console.error('Failed to patch complaint status in Supabase:', err);
      }
    }
  };

  const handleUpdateSocietySettings = async (
    name: string, 
    wingsEnabled: boolean, 
    wings: string[], 
    address: string, 
    type: string,
    structureType?: 'standalone' | 'wings' | 'towers_wings',
    towers?: any[],
    features?: FeatureFlags,
    billingAndGateway?: {
      BillingMode?: 'Flat Rate' | 'SqFt Rate' | 'Hybrid';
      RatePerSqFt?: number;
      FlatRateAmount?: number;
      BaseUtilityAmount?: number;
      LateFeeType?: 'Interest' | 'Fixed';
      LateFeeValue?: number;
      DueDateDay?: number;
      GatewayEnabled?: boolean;
      GatewayProvider?: 'Razorpay' | 'Cashfree' | 'Manual';
      GatewayApiKey?: string;
      UPI_ID?: string;
    }
  ) => {
    const updatedSocieties = societies.map(s => {
      if (s.id === activeSocietyId) {
        return {
          ...s,
          Name: name,
          HasWings: wingsEnabled,
          Wings: wings,
          PostalAddress: address,
          BuildingType: type,
          StructureType: structureType || (wingsEnabled ? 'wings' : 'standalone'),
          Towers: towers,
          FeaturesEnabled: features || s.FeaturesEnabled,
          ...(billingAndGateway || {})
        };
      }
      return s;
    });
    setSocieties(updatedSocieties);
    localStorage.setItem('society_list_all', JSON.stringify(updatedSocieties));

    // Audit action
    handleAddAuditLog('Configure Society', `Updated configurations for society '${name}' (${type})`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const targetSoc = updatedSocieties.find(s => s.id === activeSocietyId);
        const payload = {
          id: activeSocietyId,
          Name: name,
          HasWings: wingsEnabled,
          Wings: Array.isArray(wings) ? wings : (wings ? String(wings).split(',').map(w => w.trim()).filter(Boolean) : []),
          PostalAddress: address,
          BuildingType: type,
          StructureType: structureType || (wingsEnabled ? 'wings' : 'standalone'),
          Towers: towers ? JSON.stringify(towers) : null,
          FeaturesEnabled: targetSoc?.FeaturesEnabled || null
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/Societies?id=eq.${activeSocietyId}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const existing = await res.json();
        if (Array.isArray(existing) && existing.length > 0) {
          await fetch(`${supabaseUrl}/rest/v1/Societies?id=eq.${activeSocietyId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(`${supabaseUrl}/rest/v1/Societies`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.error('Failed to post settings update to Supabase:', err);
      }
    }
  };

  const handleAddDues = (flatNo: string, amount: number, desc: string) => {
    const updated = members.map(m => {
      if (m.SocietyId === activeSocietyId && m.FlatNo === flatNo) {
        return { ...m, Balance: m.Balance + amount };
      }
      return m;
    });
    updateMembersState(updated);
  };

  const handleSaveOrUpdateMember = async (updatedMember: Member) => {
    const fullMember: Member = {
      ...updatedMember,
      SocietyId: activeSocietyId,
      id: updatedMember.id || `M-${activeSocietyId}-${updatedMember.FlatNo}`
    };

    const exists = members.some(m => m.FlatNo === fullMember.FlatNo && m.SocietyId === activeSocietyId);
    let nextMembers: Member[];
    if (exists) {
      nextMembers = members.map(m => (m.FlatNo === fullMember.FlatNo && m.SocietyId === activeSocietyId) ? fullMember : m);
    } else {
      nextMembers = [...members, fullMember];
    }
    updateMembersState(nextMembers);

    // Auto-provision UserAuth credential & send Welcome Notification for new member
    const identifier = fullMember.Email ? fullMember.Email.trim().toLowerCase() : fullMember.ContactNo ? fullMember.ContactNo.trim() : null;
    if (identifier) {
      const existingAuth = userAuths.find(u => u.EmailOrPhone.toLowerCase() === identifier.toLowerCase() && (!u.SocietyId || u.SocietyId === activeSocietyId));
      if (!existingAuth) {
        const memberRoleId = `Role-${activeSocietyId}-member`;
        const tempPass = generateTempPassword();
        const { userAuth } = provisionUserAccount({
          emailOrPhone: identifier,
          phone: fullMember.ContactNo,
          roleId: memberRoleId,
          societyId: activeSocietyId,
          tempPassword: tempPass
        });

        const nextAuths = [...userAuths, userAuth];
        updateUserAuthsState(nextAuths);

        dispatchWelcomeNotification({
          recipientName: fullMember.OwnerName,
          recipientEmail: fullMember.Email,
          recipientPhone: fullMember.ContactNo,
          societyName: activeSociety.Name,
          tempPassword: tempPass,
          loginMethod: fullMember.Email ? 'EmailTempPass' : 'PhoneOTP'
        });
      }
    }

    // Audit action
    handleAddAuditLog(exists ? 'Modify Member' : 'Add Member', `${exists ? 'Updated' : 'Created'} resident profile for Flat ${fullMember.FlatNo} (${fullMember.OwnerName}) with dues ₹${fullMember.Balance}`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const queryParam = fullMember.id ? `id=eq.${fullMember.id}` : `FlatNo=eq.${fullMember.FlatNo}&SocietyId=eq.${activeSocietyId}`;
        const res = await fetch(`${supabaseUrl}/rest/v1/Members?${queryParam}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const existing = await res.json();
        if (Array.isArray(existing) && existing.length > 0) {
          // PATCH
          await fetch(`${supabaseUrl}/rest/v1/Members?${queryParam}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullMember)
          });
        } else {
          // POST
          await fetch(`${supabaseUrl}/rest/v1/Members`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullMember)
          });
        }
      } catch (err) {
        console.error('Failed to post member updates to Supabase:', err);
      }
    }
  };

  const handleAddNotice = async (noticeData: { 
    title: string; 
    category: string; 
    content: string; 
    attachmentUrl?: string; 
    attachmentName?: string; 
    attachmentSize?: string;
    documentUrl?: string;
    uploadedBy?: string;
  }) => {
    const noticeId = `N-${Date.now()}`;
    const newNotice: Notice = {
      id: noticeId,
      SocietyId: activeSocietyId,
      Date: new Date().toISOString().split('T')[0],
      Title: noticeData.title,
      Category: noticeData.category as any,
      Content: noticeData.content,
      AttachmentUrl: noticeData.attachmentUrl || noticeData.documentUrl || "",
      AttachmentName: noticeData.attachmentName || "",
      AttachmentSize: noticeData.attachmentSize || "",
      PostedBy: noticeData.uploadedBy || 'Society Management Committee',
      DocumentUrl: noticeData.documentUrl || noticeData.attachmentUrl || "",
      UploadedBy: noticeData.uploadedBy || 'Management Committee'
    };
    const nextNotices = [newNotice, ...notices];
    setNotices(nextNotices);
    localStorage.setItem('society_notices', JSON.stringify(nextNotices));

    // Audit action
    handleAddAuditLog('Publish Notice', `Published notice "${noticeData.title}"`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Notices`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newNotice)
        });
      } catch (err) {
        console.error("Error syncing new notice to Supabase:", err);
      }
    }
  };

  // --- TIER 2 HANDLERS ---
  const handleAddSocietyDocument = async (doc: Omit<SocietyDocument, 'id' | 'SocietyId' | 'UploadedAt'>) => {
    const docId = `DOC-${Date.now()}`;
    const newDoc: SocietyDocument = {
      ...doc,
      id: docId,
      SocietyId: activeSocietyId,
      UploadedAt: new Date().toISOString().split('T')[0]
    };
    const nextDocs = [newDoc, ...societyDocuments];
    updateSocietyDocumentsState(nextDocs);
    handleAddAuditLog('Upload Document', `Uploaded society document "${doc.Title}" (${doc.Category})`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/SocietyDocuments`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newDoc)
        });
      } catch (err) {
        console.error('Failed to post document to Supabase:', err);
      }
    }
  };

  const handleDeleteSocietyDocument = async (id: string) => {
    const target = societyDocuments.find(d => d.id === id);
    const nextDocs = societyDocuments.filter(d => d.id !== id);
    updateSocietyDocumentsState(nextDocs);
    if (target) {
      handleAddAuditLog('Delete Document', `Deleted document "${target.Title}"`);
    }

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/SocietyDocuments?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
      } catch (err) {
        console.error('Failed to delete document from Supabase:', err);
      }
    }
  };

  const handleToggleDocumentVisibility = async (id: string) => {
    const target = societyDocuments.find(d => d.id === id);
    if (!target) return;
    const updatedPublic = !target.IsPublic;
    const nextDocs = societyDocuments.map(d => d.id === id ? { ...d, IsPublic: updatedPublic } : d);
    updateSocietyDocumentsState(nextDocs);
    handleAddAuditLog('Toggle Visibility', `Set document "${target.Title}" visibility to ${updatedPublic ? 'Public' : 'Private (Committee Only)'}`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/SocietyDocuments?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ IsPublic: updatedPublic })
        });
      } catch (err) {
        console.error('Failed to patch document visibility in Supabase:', err);
      }
    }
  };

  const handleAddAssetAMC = async (asset: Omit<AssetAMC, 'id' | 'SocietyId'>) => {
    const amcId = `AMC-${Date.now()}`;
    const newAsset: AssetAMC = {
      ...asset,
      id: amcId,
      SocietyId: activeSocietyId
    };
    const nextAMCs = [newAsset, ...assetAMCs];
    updateAssetAMCsState(nextAMCs);
    handleAddAuditLog('Add Asset AMC', `Added asset AMC record for "${asset.AssetName}" (${asset.VendorName})`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/AssetAMCs`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAsset)
        });
      } catch (err) {
        console.error('Failed to post Asset AMC to Supabase:', err);
      }
    }
  };

  const handleUpdateAssetAMC = async (id: string, updates: Partial<AssetAMC>) => {
    const target = assetAMCs.find(a => a.id === id);
    const nextAMCs = assetAMCs.map(a => a.id === id ? { ...a, ...updates } : a);
    updateAssetAMCsState(nextAMCs);
    if (target) {
      handleAddAuditLog('Update Asset AMC', `Updated AMC servicing status for "${target.AssetName}"`);
    }

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/AssetAMCs?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.error('Failed to patch Asset AMC in Supabase:', err);
      }
    }
  };

  const handleDeleteAssetAMC = async (id: string) => {
    const target = assetAMCs.find(a => a.id === id);
    const nextAMCs = assetAMCs.filter(a => a.id !== id);
    updateAssetAMCsState(nextAMCs);
    if (target) {
      handleAddAuditLog('Delete Asset AMC', `Deleted AMC record for "${target.AssetName}"`);
    }

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/AssetAMCs?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
      } catch (err) {
        console.error('Failed to delete Asset AMC from Supabase:', err);
      }
    }
  };

  const handleAddWaterMeter = async (meter: Omit<WaterMeter, 'id' | 'SocietyId' | 'UnitsConsumed'>) => {
    const units = Math.max(0, meter.CurrentReading - meter.PreviousReading);
    const meterId = `WM-${meter.FlatNo}-${meter.ReadingMonth}`;
    const newMeter: WaterMeter = {
      ...meter,
      id: meterId,
      SocietyId: activeSocietyId,
      UnitsConsumed: units
    };
    const nextMeters = [newMeter, ...waterMeters.filter(w => w.id !== meterId)];
    updateWaterMetersState(nextMeters);
    handleAddAuditLog('Log Water Meter', `Recorded water meter reading for Flat ${meter.FlatNo} (${meter.ReadingMonth}): ${units} units consumed`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/WaterMeters`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(newMeter)
        });
      } catch (err) {
        console.error('Failed to post Water Meter to Supabase:', err);
      }
    }
  };

  const handleBatchAddWaterMeters = async (metersList: Array<Omit<WaterMeter, 'id' | 'SocietyId' | 'UnitsConsumed'>>) => {
    const preparedList: WaterMeter[] = metersList.map(meter => {
      const units = Math.max(0, meter.CurrentReading - meter.PreviousReading);
      const meterId = `WM-${meter.FlatNo}-${meter.ReadingMonth}`;
      return {
        ...meter,
        id: meterId,
        SocietyId: activeSocietyId,
        UnitsConsumed: units
      };
    });

    const updatedMap = new Map(waterMeters.map(w => [w.id, w]));
    preparedList.forEach(m => updatedMap.set(m.id, m));
    const nextMeters = Array.from(updatedMap.values()) as WaterMeter[];
    updateWaterMetersState(nextMeters);
    handleAddAuditLog('Batch Water Meter Entry', `Saved batch water meter readings for ${preparedList.length} flats`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/WaterMeters`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(preparedList)
        });
      } catch (err) {
        console.error('Failed to post batch Water Meters to Supabase:', err);
      }
    }
  };

  const handleCreateSociety = (name: string, type: string, address: string, wings: string[], wingsEnabled: boolean) => {
    const newId = `soc-${Date.now()}`;
    const newSoc: Society = {
      id: newId,
      Name: name,
      BuildingType: type,
      PostalAddress: address,
      Wings: wings,
      HasWings: wingsEnabled
    };
    const nextSocieties = [...societies, newSoc];
    setSocieties(nextSocieties);
    localStorage.setItem('society_list_all', JSON.stringify(nextSocieties));

    // Seed a default starter member so the dashboard isn't completely empty
    const starterMember: Member = {
      id: `M-${newId}-101`,
      SocietyId: newId,
      FlatNo: "101",
      Wing: wingsEnabled && wings.length > 0 ? wings[0] : "",
      OwnerName: "Society Administrator",
      ContactNo: "+91 99999 88888",
      Email: "admin@society.org",
      Balance: 0,
      Status: "Owner"
    };
    const nextMembers = [...members, starterMember];
    updateMembersState(nextMembers);

    setActiveSocietyId(newId);
    localStorage.setItem('active_society_id', newId);

    // Optionally register new society metadata in connected Supabase
    if (supabaseUrl && supabaseAnonKey) {
      fetch(`${supabaseUrl}/rest/v1/Societies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          Name: name,
          BuildingType: type,
          PostalAddress: address,
          Wings: Array.isArray(wings) ? wings : (wings ? String(wings).split(',').map(w => w.trim()).filter(Boolean) : []),
          HasWings: wingsEnabled
        })
      }).catch(err => console.warn('Failed to register new society in Supabase:', err));

      // Register default member to Supabase
      fetch(`${supabaseUrl}/rest/v1/Members`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(starterMember)
      }).catch(err => console.warn('Failed to seed default member in Supabase:', err));
    }
  };

  const handleOnboardingComplete = (newSociety: Society, initialMembers: Member[], adminEmail: string, adminFlat: string) => {
    // 1. Add new society
    const updatedSocieties = [...societies, newSociety];
    setSocieties(updatedSocieties);
    localStorage.setItem('society_list_all', JSON.stringify(updatedSocieties));

    // 2. Create isolated secure roles for the new society
    const adminRoleId = `Role-${newSociety.id}-admin`;
    const committeeRoleId = `Role-${newSociety.id}-committee`;
    const memberRoleId = `Role-${newSociety.id}-member`;

    const newRoles: Role[] = [
      {
        id: adminRoleId,
        RoleName: 'Admin',
        SocietyId: newSociety.id,
        Description: `Primary Admin Secretary for ${newSociety.Name}`
      },
      {
        id: committeeRoleId,
        RoleName: 'Committee Member',
        SocietyId: newSociety.id,
        Description: `Elected Committee Member for ${newSociety.Name}`
      },
      {
        id: memberRoleId,
        RoleName: 'Member',
        SocietyId: newSociety.id,
        Description: `Resident in ${newSociety.Name}`
      }
    ];

    const updatedRoles = [...roles, ...newRoles];
    updateRolesState(updatedRoles);

    // 3. Generate secure hashed credential auth for the assigned Admin
    const adminSalt = generateSalt();
    const adminHash = hashPassword('admin123', adminSalt); // Default secure initial password: admin123
    
    const newAdminAuth: UserAuth = {
      id: `Auth-${newSociety.id}-admin`,
      EmailOrPhone: adminEmail.trim().toLowerCase(),
      PasswordHash: adminHash,
      Salt: adminSalt,
      RoleId: adminRoleId,
      SocietyId: newSociety.id,
      Status: 'Active'
    };

    const updatedUserAuths = [...userAuths, newAdminAuth];
    updateUserAuthsState(updatedUserAuths);

    // 4. Add initial members generated by the wizard
    const updatedMembers = [...members, ...initialMembers];
    updateMembersState(updatedMembers);

    // 5. Mark onboarded
    localStorage.setItem('society_onboarded_v2', 'true');
    localStorage.setItem('active_society_id', newSociety.id);
    setActiveSocietyId(newSociety.id);

    // 6. Set active login to this admin email inside the simulator
    localStorage.setItem('society_sim_logged_email', adminEmail.trim().toLowerCase());
    localStorage.setItem('society_sim_logged_email_or_phone', adminEmail.trim().toLowerCase());

    // 7. Setup first invoice and welcome notice
    const starterNotice: Notice = {
      id: `N-${newSociety.id}-welcome`,
      SocietyId: newSociety.id,
      Date: new Date().toISOString().split('T')[0],
      Title: `Welcome to ${newSociety.Name}!`,
      Category: "General",
      Content: `Welcome to the digital portal of ${newSociety.Name}. Explore our interactive notices, file grievance discussions, make secure dues payments, and pre-approve visitors.`,
      PostedBy: "Managing Committee",
      DocumentUrl: "",
      UploadedBy: "System"
    };
    const updatedNotices = [starterNotice, ...notices];
    setNotices(updatedNotices);
    localStorage.setItem('society_notices', JSON.stringify(updatedNotices));

    setShowOnboardingWizard(false);
  };

  // 1. Add Invoice Handler (Automated Invoicing Engine)
  const handleAddInvoice = async (newInv: Omit<Invoice, 'id'>) => {
    const invId = `INV-${Date.now()}`;
    const loggedInvoice: Invoice = {
      ...newInv,
      id: invId
    };

    const nextInvoices = [loggedInvoice, ...invoices];
    updateInvoicesState(nextInvoices);

    // Update member's balance in state
    const nextMembers = members.map(m => {
      if (m.FlatNo === newInv.FlatNo && m.SocietyId === newInv.SocietyId) {
        return { ...m, Balance: m.Balance + newInv.TotalAmount };
      }
      return m;
    });
    updateMembersState(nextMembers);

    // Log action
    handleAddAuditLog('Issue Invoice', `Issued maintenance invoice of ₹${newInv.TotalAmount} for Flat ${newInv.FlatNo} (${newInv.BillMonth})`);

    // Sync to Supabase
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Invoices`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loggedInvoice)
        });

        // Also update member's balance in Supabase
        const targetMember = members.find(m => m.FlatNo === newInv.FlatNo && m.SocietyId === newInv.SocietyId);
        if (targetMember) {
          const queryParam = targetMember.id ? `id=eq.${targetMember.id}` : `FlatNo=eq.${targetMember.FlatNo}&SocietyId=eq.${newInv.SocietyId}`;
          await fetch(`${supabaseUrl}/rest/v1/Members?${queryParam}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Balance: targetMember.Balance + newInv.TotalAmount
            })
          });
        }
      } catch (err) {
        console.error('Failed to sync new invoice to Supabase:', err);
      }
    }
  };

  // 2. Add Visitor Handler (Gatekeeper Simulator)
  const handleAddVisitor = async (newVis: Omit<Visitor, 'id'>) => {
    const visId = `VIS-${Date.now()}`;
    const token = newVis.AccessToken || generateVisitorAccessToken();
    const expiresAt = newVis.TokenExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const loggedVisitor: Visitor = {
      ...newVis,
      id: visId,
      AccessToken: token,
      TokenExpiresAt: expiresAt
    };

    const nextVisitors = [loggedVisitor, ...visitors];
    updateVisitorsState(nextVisitors);

    // Log action
    handleAddAuditLog('Gate Check-In', `Checked in visitor ${newVis.VisitorName} for Flat ${newVis.FlatNo} (${newVis.Purpose})`);

    // Sync to Supabase
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Visitors`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loggedVisitor)
        });
      } catch (err) {
        console.error('Failed to sync new visitor to Supabase:', err);
      }
    }
  };

  // 3. Update Visitor Status Handler (Gatekeeper approval/checkout)
  const handleUpdateVisitorStatus = async (visitorId: string, status: Visitor['Status'], hostApprovedBy?: string) => {
    const nextVisitors = visitors.map(v => {
      if (v.id === visitorId) {
        const updateObj: Partial<Visitor> = { Status: status };
        if (status === 'Checked Out') {
          updateObj.CheckOutTime = new Date().toISOString();
        }
        if (hostApprovedBy) {
          updateObj.HostApprovedBy = hostApprovedBy;
        }
        return { ...v, ...updateObj };
      }
      return v;
    });
    updateVisitorsState(nextVisitors);

    const targetVis = visitors.find(v => v.id === visitorId);
    const visName = targetVis ? targetVis.VisitorName : 'Visitor';
    const flatNo = targetVis ? targetVis.FlatNo : '';

    // Log action
    handleAddAuditLog('Visitor Status Update', `Updated visitor ${visName} (Flat ${flatNo}) status to ${status}${hostApprovedBy ? ' approved by ' + hostApprovedBy : ''}`);

    // Sync to Supabase
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const updatePayload: any = { Status: status };
        if (status === 'Checked Out') {
          updatePayload.CheckOutTime = new Date().toISOString();
        }
        if (hostApprovedBy) {
          updatePayload.HostApprovedBy = hostApprovedBy;
        }

        await fetch(`${supabaseUrl}/rest/v1/Visitors?id=eq.${visitorId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });
      } catch (err) {
        console.error('Failed to update visitor status in Supabase:', err);
      }
    }
  };

  // 4. Add Complaint Reply Handler (Interactive Discussion Threads)
  const handleAddComplaintReply = async (newReply: Omit<ComplaintReply, 'id'>) => {
    const replyId = `REP-${Date.now()}`;
    const loggedReply: ComplaintReply = {
      ...newReply,
      id: replyId
    };

    const nextReplies = [...complaintReplies, loggedReply];
    updateComplaintRepliesState(nextReplies);

    // Log action
    handleAddAuditLog('Complaint Message', `Posted reply on complaint thread ${newReply.ComplaintId}`);

    // Sync to Supabase
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/ComplaintReplies`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loggedReply)
        });
      } catch (err) {
        console.error('Failed to post complaint reply to Supabase:', err);
      }
    }
  };

  // Tier 1 Handlers: Emergency Contacts
  const handleAddEmergencyContact = async (newContact: Omit<EmergencyContact, 'id'>) => {
    const item: EmergencyContact = { ...newContact, id: `EM-${Date.now()}`, SocietyId: activeSocietyId };
    const updated = [item, ...emergencyContacts];
    updateEmergencyContactsState(updated);
    handleAddAuditLog('Emergency Contact Added', `Added emergency contact ${item.Name} (${item.Phone})`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/EmergencyContacts`, {
          method: 'POST',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) { console.error('Failed to post EmergencyContact to Supabase:', e); }
    }
  };

  const handleUpdateEmergencyContact = async (idOrContact: string | EmergencyContact, contactUpdates?: Partial<EmergencyContact>) => {
    let updated: EmergencyContact;
    if (typeof idOrContact === 'string') {
      const existing = emergencyContacts.find(c => c.id === idOrContact);
      if (!existing) return;
      updated = { ...existing, ...contactUpdates };
    } else {
      updated = idOrContact;
    }
    const list = emergencyContacts.map(c => c.id === updated.id ? updated : c);
    updateEmergencyContactsState(list);
    handleAddAuditLog('Emergency Contact Updated', `Updated emergency contact ${updated.Name}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/EmergencyContacts?id=eq.${updated.id}`, {
          method: 'PATCH',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) { console.error('Failed to patch EmergencyContact:', e); }
    }
  };

  const handleDeleteEmergencyContact = async (id: string) => {
    const list = emergencyContacts.filter(c => c.id !== id);
    updateEmergencyContactsState(list);
    handleAddAuditLog('Emergency Contact Deleted', `Deleted contact ID ${id}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/EmergencyContacts?id=eq.${id}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
        });
      } catch (e) { console.error('Failed to delete EmergencyContact:', e); }
    }
  };

  // Tier 1 Handlers: Tenants & Document KYC
  const handleAddTenant = async (newTenant: Omit<Tenant, 'id' | 'KycStatus'>) => {
    const item: Tenant = { ...newTenant, id: `TNT-${Date.now()}`, KycStatus: 'Pending', SocietyId: activeSocietyId };
    const updated = [item, ...tenants];
    updateTenantsState(updated);
    handleAddAuditLog('Tenant Register Added', `Added tenant ${item.TenantName} for Flat ${item.FlatNo}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Tenants`, {
          method: 'POST',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) { console.error('Failed to post Tenant to Supabase:', e); }
    }
  };

  const handleUpdateTenantKyc = async (id: string, kycStatus: 'Pending' | 'Verified' | 'Rejected', remarks?: string) => {
    const list = tenants.map(t => t.id === id ? { ...t, KycStatus: kycStatus, Remarks: remarks !== undefined ? remarks : t.Remarks } : t);
    updateTenantsState(list);
    handleAddAuditLog('Tenant KYC Updated', `Updated Tenant ID ${id} KYC status to ${kycStatus}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Tenants?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ KycStatus: kycStatus, Remarks: remarks })
        });
      } catch (e) { console.error('Failed to patch Tenant KYC:', e); }
    }
  };

  // Tier 1 Handlers: Vehicles
  const handleAddVehicle = async (newVehicle: Omit<Vehicle, 'id'>) => {
    const item: Vehicle = { ...newVehicle, id: `VEH-${Date.now()}`, SocietyId: activeSocietyId };
    const updated = [item, ...vehicles];
    updateVehiclesState(updated);
    handleAddAuditLog('Vehicle Registered', `Registered vehicle ${item.VehicleNo} (${item.VehicleType}) for Flat ${item.FlatNo}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Vehicles`, {
          method: 'POST',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) { console.error('Failed to post Vehicle to Supabase:', e); }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    const list = vehicles.filter(v => v.id !== id);
    updateVehiclesState(list);
    handleAddAuditLog('Vehicle Deleted', `Removed vehicle ID ${id}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/Vehicles?id=eq.${id}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
        });
      } catch (e) { console.error('Failed to delete Vehicle:', e); }
    }
  };

  // Tier 1 Handlers: Guest Parking
  const handleAddGuestParking = async (newGP: Omit<GuestParking, 'id' | 'Status'>) => {
    const item: GuestParking = { ...newGP, id: `GP-${Date.now()}`, Status: 'Active', SocietyId: activeSocietyId };
    const updated = [item, ...guestParkings];
    updateGuestParkingsState(updated);
    handleAddAuditLog('Guest Parking Issued', `Assigned guest parking slot ${item.AssignedSlot} to vehicle ${item.VehicleNo} (Flat ${item.FlatNo})`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/GuestParking`, {
          method: 'POST',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } catch (e) { console.error('Failed to post GuestParking to Supabase:', e); }
    }
  };

  const handleUpdateGuestParkingStatus = async (id: string, status: 'Active' | 'Expired' | 'Completed') => {
    const list = guestParkings.map(g => g.id === id ? { ...g, Status: status } : g);
    updateGuestParkingsState(list);
    handleAddAuditLog('Guest Parking Status Update', `Updated Guest Parking ID ${id} to ${status}`);
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/GuestParking?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ Status: status })
        });
      } catch (e) { console.error('Failed to patch GuestParking status:', e); }
    }
  };

  // Filter datasets dynamically by active society
  const filteredMembers = members.filter(m => m.SocietyId === activeSocietyId);
  const filteredPayments = payments.filter(p => p.SocietyId === activeSocietyId);
  const filteredExpenses = expenses.filter(e => e.SocietyId === activeSocietyId);
  const filteredComplaints = complaints.filter(c => c.SocietyId === activeSocietyId);
  const filteredNotices = notices.filter(n => n.SocietyId === activeSocietyId);
  const filteredInvoices = invoices.filter(i => i.SocietyId === activeSocietyId);
  const filteredVisitors = visitors.filter(v => v.SocietyId === activeSocietyId);
  const filteredComplaintReplies = complaintReplies.filter(r => r.SocietyId === activeSocietyId);
  const filteredEmergencyContacts = emergencyContacts.filter(e => e.SocietyId === activeSocietyId);
  const filteredTenants = tenants.filter(t => t.SocietyId === activeSocietyId);
  const filteredVehicles = vehicles.filter(v => v.SocietyId === activeSocietyId);
  const filteredGuestParkings = guestParkings.filter(g => g.SocietyId === activeSocietyId);
  const filteredSocietyDocuments = societyDocuments.filter(d => d.SocietyId === activeSocietyId);
  const filteredAssetAMCs = assetAMCs.filter(a => a.SocietyId === activeSocietyId);
  const filteredWaterMeters = waterMeters.filter(w => w.SocietyId === activeSocietyId);

  const handleAddUserConsent = async (consent: Omit<UserConsent, 'id'>) => {
    const newConsent: UserConsent = {
      ...consent,
      id: `UC-${Date.now()}`,
      SocietyId: activeSocietyId,
      ConsentedAt: consent.ConsentedAt || new Date().toISOString(),
      PolicyVersion: consent.PolicyVersion || 'v1.0-2026',
      IPAddress: consent.IPAddress || '127.0.0.1',
      UserRole: consent.UserRole || 'Member'
    };
    const updated = [newConsent, ...userConsents];
    updateUserConsentsState(updated);
    handleAddAuditLog('User Consent Logged (DPDP 2023)', `User ${consent.UserId} accepted Privacy Policy & Terms of Service under DPDP Act 2023`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/UserConsents`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newConsent)
        });
      } catch (err) {
        console.error('Failed to post UserConsent row to Supabase:', err);
      }
    }
  };

  const handleAddPushToken = async (token: Omit<PushToken, 'id'>) => {
    const newToken: PushToken = {
      ...token,
      id: `TOK-${Date.now()}`,
      SocietyId: activeSocietyId,
      CreatedAt: token.CreatedAt || new Date().toISOString(),
      LastUsedAt: new Date().toISOString()
    };
    // Upsert local state: replace existing token for same flat/device if exists
    const filtered = pushTokens.filter(t => !(t.UserId === token.UserId && t.FlatNo === token.FlatNo));
    const updated = [newToken, ...filtered];
    updatePushTokensState(updated);
    handleAddAuditLog('Push Token Registered', `Device token registered for Flat ${token.FlatNo} (${token.DeviceOS})`);

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/PushTokens`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(newToken)
        });
      } catch (err) {
        console.error('Failed to post PushToken row to Supabase:', err);
      }
    }
  };

  // Current user authentication resolution & password update handler
  const currentUserAuth = userAuths.find(u => 
    u.EmailOrPhone.toLowerCase() === currentSimUserEmail.toLowerCase() &&
    (!u.SocietyId || u.SocietyId === activeSocietyId)
  ) || userAuths.find(u => u.EmailOrPhone.toLowerCase() === currentSimUserEmail.toLowerCase());

  const handlePasswordUpdated = (updatedAuth: UserAuth) => {
    const nextAuths = userAuths.map(u => u.id === updatedAuth.id ? updatedAuth : u);
    updateUserAuthsState(nextAuths);
    handleAddAuditLog('Password Reset', `Completed mandatory first-login password reset for account ${updatedAuth.EmailOrPhone}`);

    if (supabaseUrl && supabaseAnonKey) {
      fetch(`${supabaseUrl}/rest/v1/UserAuth?id=eq.${updatedAuth.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PasswordHash: updatedAuth.PasswordHash,
          Salt: updatedAuth.Salt,
          MustChangePassword: false,
          TempPassword: null
        })
      }).catch(err => console.warn('Failed to update password hash in Supabase:', err));
    }
  };

  const handleUpdateUserRole = (identifier: string, newRoleName: GranularRoleName) => {
    let targetRole = roles.find(r => r.RoleName === newRoleName && r.SocietyId === activeSocietyId);
    if (!targetRole) {
      targetRole = {
        id: `Role-${activeSocietyId}-${newRoleName.toLowerCase()}`,
        RoleName: newRoleName as any,
        SocietyId: activeSocietyId,
        Description: `Role ${newRoleName} for ${activeSociety.Name}`
      };
      setRoles(prev => [...prev, targetRole!]);
    }

    const auth = userAuths.find(u => u.EmailOrPhone.toLowerCase() === identifier.toLowerCase());
    if (auth) {
      const nextAuths = userAuths.map(u => u.id === auth.id ? { ...u, RoleId: targetRole!.id } : u);
      updateUserAuthsState(nextAuths);
    }

    const nextMembers = members.map(m => {
      if ((m.Email && m.Email.toLowerCase() === identifier.toLowerCase()) || m.ContactNo === identifier) {
        return { ...m, Role: (newRoleName === 'SOCIETY_ADMIN' || newRoleName === 'Admin') ? 'Admin' as const : 'Member' as const };
      }
      return m;
    });
    updateMembersState(nextMembers);

    handleAddAuditLog('Update Role', `Assigned granular role ${newRoleName} to user/member ${identifier}`);
  };

  const handleSaveModuleCatalogSettings = (updatedSociety: Society) => {
    setSocieties(prev => prev.map(s => s.id === updatedSociety.id ? updatedSociety : s));
    handleAddAuditLog('Update Settings', `Updated feature toggles & module catalog settings for ${updatedSociety.Name}`);

    if (supabaseUrl && supabaseAnonKey) {
      fetch(`${supabaseUrl}/rest/v1/Societies?id=eq.${updatedSociety.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          SocietyCode: updatedSociety.SocietyCode,
          LogoUrl: updatedSociety.LogoUrl,
          DueDateDay: updatedSociety.DueDateDay,
          LateFeeValue: updatedSociety.LateFeeValue,
          enabled_modules: updatedSociety.EnabledModules,
          module_settings: updatedSociety.ModuleSettings,
          FeaturesEnabled: updatedSociety.FeaturesEnabled
        })
      }).catch(err => console.warn('Failed to sync updated society settings to Supabase:', err));
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans overflow-hidden transition-colors duration-300`}>
      {/* Immersive Onboarding Setup Wizard Overlay */}
      {showOnboardingWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <OnboardingWizard 
            onComplete={handleOnboardingComplete} 
            onCancel={() => setShowOnboardingWizard(false)} 
            theme={theme}
          />
        </div>
      )}

      {/* Forced Password Reset Interceptor Modal */}
      {currentUserAuth && currentUserAuth.MustChangePassword && (
        <ForcedPasswordResetModal
          userAuth={currentUserAuth}
          societyName={activeSociety.Name}
          onPasswordUpdated={handlePasswordUpdated}
          theme={theme}
        />
      )}

      {/* Credential Delivery & Welcome Audit Log Modal */}
      <CredentialDeliveryLogModal
        isOpen={showCredentialDeliveryLog}
        onClose={() => setShowCredentialDeliveryLog(false)}
        societyName={activeSociety.Name}
        theme={theme}
      />

      {/* Committee Member RBAC Management Modal */}
      {showCommitteeManagementModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={() => setShowCommitteeManagementModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <CommitteeManagement
              members={filteredMembers}
              userAuths={userAuths}
              roles={roles}
              societyName={activeSociety.Name}
              onUpdateUserRole={handleUpdateUserRole}
              theme={theme}
            />
          </div>
        </div>
      )}

      {/* Configurable Module Catalog & Feature Toggles Modal */}
      {showSocietySettingsModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl relative">
            <button
              onClick={() => setShowSocietySettingsModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <SocietyModuleSettings
              society={activeSociety}
              onUpdateSocietySettings={handleSaveModuleCatalogSettings}
              theme={theme}
            />
          </div>
        </div>
      )}

      {/* Cloud Sync & Supabase Setup Modal */}
      {showCloudSyncModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} rounded-2xl border shadow-2xl p-6 relative space-y-4`}>
            <button
              onClick={() => setShowCloudSyncModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold flex items-center gap-2">
                  Cloud Sync & Supabase Setup
                </h2>
                <p className="text-xs text-slate-400">Paste your Supabase URL & Anon Key to sync database tables across mobile apps.</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSetSupabaseCredentials(cloudSyncUrlInput, cloudSyncKeyInput);
                setCloudSyncStatusMsg('Supabase credentials saved and connected!');
                setTimeout(() => setCloudSyncStatusMsg(null), 3000);
              }}
              className="space-y-3 pt-1"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project.supabase.co"
                  value={cloudSyncUrlInput}
                  onChange={(e) => setCloudSyncUrlInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Supabase Anon API Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="eyJhbGciOi..."
                  value={cloudSyncKeyInput}
                  onChange={(e) => setCloudSyncKeyInput(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              {cloudSyncStatusMsg && (
                <div className="p-2.5 bg-green-950/40 border border-green-500/30 text-green-400 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{cloudSyncStatusMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>Save & Connect Supabase</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await pushMockDataToSupabase();
                    if (res.success) {
                      setCloudSyncStatusMsg('Successfully seeded Supabase database!');
                      setTimeout(() => setCloudSyncStatusMsg(null), 3000);
                    } else {
                      setCloudSyncStatusMsg(`Error: ${res.error || 'Failed to seed database'}`);
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Seed Mock Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Navbar - hidden on mobile viewports */}
      <header className={`hidden lg:flex ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'} border-b px-6 py-4 justify-between items-center z-10 flex-shrink-0 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-md font-extrabold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'} flex items-center gap-2`}>
              Society Connect <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-400 font-bold uppercase tracking-wider">Expo Mobile Preview</span>
            </h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Housing Society Management Portal & Developer Toolkit</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCommitteeManagementModal(true)}
            id="committee-rbac-btn"
            className={`hidden lg:flex items-center gap-1.5 text-xs font-bold ${
              theme === 'dark' 
                ? 'bg-slate-800 text-purple-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-xs'
            } px-3 py-1.5 rounded-lg border transition-all cursor-pointer`}
            title="Manage Committee Roles & RBAC Rights"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Committee RBAC</span>
          </button>

          <button
            onClick={() => setShowSocietySettingsModal(true)}
            id="module-settings-btn"
            className={`hidden lg:flex items-center gap-1.5 text-xs font-bold ${
              theme === 'dark' 
                ? 'bg-slate-800 text-purple-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-xs'
            } px-3 py-1.5 rounded-lg border transition-all cursor-pointer`}
            title="Configure Tenant Feature Toggles & Module Catalog Settings"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Module Settings & Toggles</span>
          </button>

          <button
            onClick={() => setShowCredentialDeliveryLog(true)}
            id="credential-log-btn"
            className={`hidden lg:flex items-center gap-2 text-xs font-bold ${
              theme === 'dark' 
                ? 'bg-slate-800 text-purple-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-xs'
            } px-3 py-1.5 rounded-lg border transition-all cursor-pointer`}
            title="View Dispatched Welcome Credentials & Audit Log"
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Credential Delivery Log</span>
          </button>

          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className={`p-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 shadow-sm'
            } transition-all cursor-pointer flex items-center justify-center`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => {
              setCloudSyncUrlInput(supabaseUrl);
              setCloudSyncKeyInput(supabaseAnonKey);
              setShowCloudSyncModal(true);
            }}
            id="cloud-sync-btn"
            className={`hidden lg:flex items-center gap-2 text-xs font-bold ${
              supabaseAnonKey 
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50' 
                : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/50'
            } px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer shadow-xs`}
            title="Click to configure Cloud Sync & Supabase Credentials"
          >
            <Cloud className="w-3.5 h-3.5 text-purple-400" />
            <span>☁️ Cloud Sync:</span>
            {supabaseAnonKey ? (
              <span className="text-green-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Supabase Connected
              </span>
            ) : (
              <span className="text-purple-300 font-mono flex items-center gap-1">
                <span>Configure Keys</span> <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Left Side: Interactive Mobile App Frame Simulator */}
        <div className={`w-full h-full lg:w-[480px] ${theme === 'dark' ? 'bg-slate-950 border-slate-800/60' : 'bg-slate-100 border-slate-200/80'} flex flex-col justify-start items-center overflow-y-auto p-0 lg:p-6 lg:border-r scrollbar-thin transition-colors duration-300`}>
          <div className="hidden lg:block text-center mb-4 max-w-sm">
            <span className="text-[11px] font-extrabold text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Interactive iOS / Android Emulator
            </span>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
              Select or create societies dynamically. Edit name, wings, address, and status under settings!
            </p>
          </div>

          <MobileSimulator
            members={filteredMembers}
            allMembers={members}
            payments={filteredPayments}
            expenses={filteredExpenses}
            complaints={filteredComplaints}
            notices={filteredNotices}
            invoices={filteredInvoices}
            visitors={filteredVisitors}
            complaintReplies={filteredComplaintReplies}
            emergencyContacts={filteredEmergencyContacts}
            tenants={filteredTenants}
            vehicles={filteredVehicles}
            guestParkings={filteredGuestParkings}
            societyDocuments={filteredSocietyDocuments}
            assetAMCs={filteredAssetAMCs}
            waterMeters={filteredWaterMeters}
            polls={polls.filter(p => p.SocietyId === activeSocietyId)}
            pollVotes={pollVotes.filter(pv => pv.SocietyId === activeSocietyId)}
            staffList={staffList.filter(s => s.SocietyId === activeSocietyId)}
            staffAttendanceList={staffAttendanceList.filter(sa => sa.SocietyId === activeSocietyId)}
            vendorList={vendorList.filter(v => v.SocietyId === activeSocietyId)}
            auditLogs={auditLogs.filter(al => al.SocietyId === activeSocietyId)}
            roles={roles}
            userAuths={userAuths}
            onUpdateRoles={updateRolesState}
            onUpdateUserAuths={updateUserAuthsState}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onStaffCheckIn={handleStaffCheckIn}
            onStaffCheckOut={handleStaffCheckOut}
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            onApproveExpenseSecretary={handleApproveExpenseSecretary}
            onApproveExpenseTreasurer={handleApproveExpenseTreasurer}
            onRejectExpense={handleRejectExpense}
            onAddPayment={handleAddPayment}
            onAddExpense={handleAddExpense}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaint={handleUpdateComplaintStatus}
            onAddNotice={handleAddNotice}
            onAddInvoice={handleAddInvoice}
            onAddVisitor={handleAddVisitor}
            onUpdateVisitor={handleUpdateVisitorStatus}
            onAddComplaintReply={handleAddComplaintReply}
            onAddEmergencyContact={handleAddEmergencyContact}
            onUpdateEmergencyContact={handleUpdateEmergencyContact}
            onDeleteEmergencyContact={handleDeleteEmergencyContact}
            onAddTenant={handleAddTenant}
            onUpdateTenantKyc={handleUpdateTenantKyc}
            onAddVehicle={handleAddVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onAddGuestParking={handleAddGuestParking}
            onUpdateGuestParkingStatus={handleUpdateGuestParkingStatus}
            onAddSocietyDocument={handleAddSocietyDocument}
            onDeleteSocietyDocument={handleDeleteSocietyDocument}
            onToggleDocumentVisibility={handleToggleDocumentVisibility}
            onAddAssetAMC={handleAddAssetAMC}
            onUpdateAssetAMC={handleUpdateAssetAMC}
            onDeleteAssetAMC={handleDeleteAssetAMC}
            onAddWaterMeter={handleAddWaterMeter}
            onBatchAddWaterMeters={handleBatchAddWaterMeters}
            onAddPoll={handleAddPoll}
            onCastVote={handleCastVote}
            onRefresh={async () => syncWithSupabase(supabaseUrl, supabaseAnonKey, true)}
            scriptUrl={supabaseAnonKey ? 'Connected' : ''}
            societyName={societyName}
            hasWings={hasWings}
            wingsList={wingsList}
            postalAddress={postalAddress}
            buildingType={buildingType}
            userConsents={userConsents}
            onAddUserConsent={handleAddUserConsent}
            pushTokens={pushTokens}
            onAddPushToken={handleAddPushToken}
            onUpdateSocietySettings={handleUpdateSocietySettings}
            onSaveOrUpdateMember={handleSaveOrUpdateMember}
            onAddDues={handleAddDues}
            onAddAuditLog={handleAddAuditLog}
            lastSynced={lastSynced}
            societies={societies}
            activeSocietyId={activeSocietyId}
            onChangeActiveSociety={(id) => { setActiveSocietyId(id); localStorage.setItem('active_society_id', id); }}
            onCreateSociety={handleCreateSociety}
            theme={theme}
          />

          <div className={`hidden lg:flex flex-col gap-2.5 text-[11px] ${
            theme === 'dark' ? 'text-slate-500 bg-slate-900/40 border-slate-800/40' : 'text-slate-600 bg-white border-slate-200 shadow-xs'
          } mt-3 p-3 rounded-xl max-w-sm w-full transition-all duration-300`}>
            <div className={`flex items-center justify-between font-bold ${theme === 'dark' ? 'text-slate-400 border-slate-800/60' : 'text-slate-700 border-slate-200'} border-b pb-1.5 mb-1 select-none`}>
              <span>🛠️ Developer Control Panel</span>
              <span className="text-[10px] text-purple-400 uppercase tracking-wider bg-purple-950/40 border border-purple-900/30 px-1.5 py-0.5 rounded">Active Societies</span>
            </div>

            {/* Interactive Fixes & Implementations Tracker */}
            <div className={`p-3 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-900/50 border-purple-900/40' : 'bg-purple-50/40 border-purple-100 shadow-3xs'
            } space-y-2 mb-2`}>
              <div className="flex justify-between items-center border-b pb-1.5 border-purple-100/20">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                  📋 Fixes & Features Tracker
                </span>
                <span className="text-[8px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded uppercase shrink-0 leading-none">
                  All 3 Fixes Live
                </span>
              </div>
              
              <div className="space-y-2">
                {/* Issue 1 */}
                <div className="flex items-start gap-2 text-[10px]">
                  <span className="text-green-500 font-bold shrink-0 mt-0.5">✅</span>
                  <div>
                    <strong className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} block`}>1. Multi-Property Switching (Amit Sharma)</strong>
                    <span className="text-slate-500 block mt-0.5 leading-tight">
                      When logging in as Amit Sharma (email: <code>amit.sharma@example.com</code>, passcode: <code>1234</code>), a "My Registered Properties" section displays on the resident dashboard. Tap to switch active properties dynamically between Greenwood (Flat 101) and Sea Breeze (Flat 301).
                    </span>
                  </div>
                </div>

                {/* Issue 2 */}
                <div className="flex items-start gap-2 text-[10px] border-t pt-2 border-purple-100/10">
                  <span className="text-green-500 font-bold shrink-0 mt-0.5">✅</span>
                  <div>
                    <strong className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} block`}>2. Greenwood Wing-less Configuration</strong>
                    <span className="text-slate-500 block mt-0.5 leading-tight">
                      Force-overrode Greenwood Residency to <code>HasWings: false</code> and empty <code>Wings: []</code>. This completely removes the "Blocks: A, B, C" display from the app, database loading, and sync pipelines.
                    </span>
                  </div>
                </div>

                {/* Issue 3 */}
                <div className="flex items-start gap-2 text-[10px] border-t pt-2 border-purple-100/10">
                  <span className="text-green-500 font-bold shrink-0 mt-0.5">✅</span>
                  <div>
                    <strong className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} block`}>3. Logout Field Sanitation</strong>
                    <span className="text-slate-500 block mt-0.5 leading-tight">
                      Wipes all credentials (username, passcode, admin password) completely from memory and local storage inputs upon tapping "Sign Out" or "Log Out".
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {societies.map(s => {
                const isDemo = s.id === 'greenwood' || s.id === 'royal_heights' || s.id === 'sea_breeze';
                const displayCode = isDemo ? `${s.id} or ${s.id === 'greenwood' ? 'gw100' : s.id === 'royal_heights' ? 'rh200' : 'sb300'}` : s.id;
                return (
                  <div key={s.id} className={`flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800/20' : 'bg-slate-50 border-slate-100'} px-2 py-1.5 rounded font-sans`}>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} truncate max-w-[170px]`}>🏢 {s.Name}</span>
                    <span className="font-mono text-[10px] text-purple-400 bg-purple-950/20 border border-purple-900/20 px-1 py-0.5 rounded select-all cursor-pointer" title="Click to copy code">
                      Code: {displayCode}
                    </span>
                  </div>
                );
              })}
            </div>

            {!showRegisterSociety ? (
              <div className="space-y-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowOnboardingWizard(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-2 rounded text-[10px] shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✨ Launch Interactive Setup Wizard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterSociety(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded text-[10px] border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>➕ Register Society (Basic Form)</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSocName.trim()) return;
                  const wings = newSocWingsList.split(',').map(w => w.trim()).filter(w => w !== '');
                  handleCreateSociety(newSocName.trim(), newSocType, newSocAddress.trim(), wings, newSocHasWings);
                  setNewSocName('');
                  setNewSocAddress('');
                  setNewSocWingsList('A, B, C');
                  setShowRegisterSociety(false);
                }}
                className={`mt-2 p-2.5 rounded-lg border text-[10px] space-y-2 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-400 select-none border-b pb-1 mb-1.5 uppercase tracking-wider text-[9px] flex justify-between items-center">
                  <span>Register Society (Super-Admin)</span>
                  <button
                    type="button"
                    onClick={() => setShowRegisterSociety(false)}
                    className="text-rose-500 hover:text-rose-600 font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">Society / Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Residency"
                    value={newSocName}
                    onChange={(e) => setNewSocName(e.target.value)}
                    className={`w-full p-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">Property Type</label>
                  <select
                    value={newSocType}
                    onChange={(e) => setNewSocType(e.target.value)}
                    className={`w-full p-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="Housing Society">Housing Society</option>
                    <option value="Apartment Complex">Apartment Complex</option>
                    <option value="Gated Community">Gated Community</option>
                    <option value="Residential Co-operative">Residential Co-operative</option>
                    <option value="Commercial Complex">Commercial Complex</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">Postal Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 5, Mumbai, MH - 400001"
                    value={newSocAddress}
                    onChange={(e) => setNewSocAddress(e.target.value)}
                    className={`w-full p-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="devHasWings"
                    checked={newSocHasWings}
                    onChange={(e) => setNewSocHasWings(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="devHasWings" className="font-bold select-none cursor-pointer text-slate-400">Has Wing Blocks?</label>
                </div>

                {newSocHasWings && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="font-bold block">Wing Names (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. A, B, C"
                      value={newSocWingsList}
                      onChange={(e) => setNewSocWingsList(e.target.value)}
                      className={`w-full p-1.5 rounded border font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-1.5 rounded shadow mt-1 cursor-pointer transition-all text-center"
                >
                  🚀 Register & Switch Active
                </button>
              </form>
            )}

            <div className={`flex justify-between items-center text-[10px] ${theme === 'dark' ? 'text-slate-500 border-slate-800/40' : 'text-slate-400 border-slate-200'} border-t pt-2 select-none`}>
              <span>Default Passcode: <strong className={theme === 'dark' ? 'text-slate-400 font-mono' : 'text-slate-600 font-mono'}>admin123</strong> <span className="italic opacity-85">(Resetable in App)</span></span>
              <span>•</span>
              <span>Use 🔄 in App Header to Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side: Expo Developer Code Panel & Setup Guides - Hidden on Mobile */}
        <div className="hidden lg:block flex-1 min-w-0">
          <ExpoDeveloperHub
            onSetSupabase={handleSetSupabaseCredentials}
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            onPushMockData={pushMockDataToSupabase}
            theme={theme}
          />
        </div>

      </main>

      {/* Mini Info Footer - Hidden on Mobile */}
      <footer className={`hidden lg:block ${theme === 'dark' ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-inner'} py-3.5 px-6 border-t text-center text-[11px] font-medium flex-shrink-0 transition-colors duration-300`}>
        Designed for Expo SDK 51 & Supabase REST API Backend • No paid tiers or third-party native modules required.
      </footer>
    </div>
  );
}
