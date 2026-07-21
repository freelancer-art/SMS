import React, { useState, useEffect } from 'react';
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
  Moon
} from 'lucide-react';
import { Member, Payment, Expense, Complaint, Notice, Society, AuditLog, Invoice, Visitor, ComplaintReply, Role, UserAuth } from './types';
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
  MULTI_TENANT_USER_AUTHS
} from './data/mockData';
import { hashPassword, generateSalt, generateVisitorAccessToken } from './utils/security';
import MobileSimulator from './components/MobileSimulator';
import ExpoDeveloperHub from './components/ExpoDeveloperHub';
import OnboardingWizard from './components/OnboardingWizard';

const DEFAULT_SOCIETIES: Society[] = [
  {
    id: 'greenwood',
    Name: 'Greenwood Residency',
    BuildingType: 'Housing Society',
    PostalAddress: '123 Greenwood Road, Sector 5, Mumbai, MH - 400001',
    Wings: [],
    HasWings: false,
    StructureType: 'standalone'
  },
  {
    id: 'royal_heights',
    Name: 'Royal Heights Complex',
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
    return localStorage.getItem('society_supabase_url') || 'https://czirnbiybxydsdzbimyw.supabase.co';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => {
    return localStorage.getItem('society_supabase_anon_key') || '';
  });

  // Multi-Society States
  const [societies, setSocieties] = useState<Society[]>(() => {
    const saved = localStorage.getItem('society_list_all');
    return saved ? JSON.parse(saved) : DEFAULT_SOCIETIES;
  });
  const [activeSocietyId, setActiveSocietyId] = useState<string>(() => {
    return localStorage.getItem('active_society_id') || 'greenwood';
  });

  // Super-Admin Society Register States
  const [showRegisterSociety, setShowRegisterSociety] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
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
  const [lastSynced, setLastSynced] = useState<string>(() => localStorage.getItem('society_last_synced') || '');

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

    if (savedUrl && savedKey) {
      setSupabaseUrl(savedUrl);
      setSupabaseAnonKey(savedKey);
      syncWithSupabase(savedUrl, savedKey);
    }
  }, []);

  // Save changes to local storage when database state updates
  const updateMembersState = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('society_members', JSON.stringify(newMembers));
  };

  const updatePaymentsState = (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem('society_payments', JSON.stringify(newPayments));
  };

  const updateExpensesState = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem('society_expenses', JSON.stringify(newExpenses));
  };

  const updateComplaintsState = (newComplaints: Complaint[]) => {
    setComplaints(newComplaints);
    localStorage.setItem('society_complaints', JSON.stringify(newComplaints));
  };

  const updateInvoicesState = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem('society_invoices', JSON.stringify(newInvoices));
  };

  const updateVisitorsState = (newVisitors: Visitor[]) => {
    setVisitors(newVisitors);
    localStorage.setItem('society_visitors', JSON.stringify(newVisitors));
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

        // Insert fresh rows
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(normalizedRows)
        });
        
        if (!insertRes.ok) {
          const errText = await insertRes.text();
          let msg = '';
          try { msg = JSON.parse(errText).message; } catch(e) { msg = errText; }
          console.warn(`POST failed for ${tableName}:`, msg);
          
          if (insertRes.status === 404) {
            throw new Error(`Table "${tableName}" does not exist in your Supabase database. Please copy the updated script from the "SupabaseSchema.sql" tab and run it in your Supabase SQL Editor.`);
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
        Wings: s.Wings.join(', '),
        HasWings: s.HasWings
      }));
      await clearAndInsert('Societies', formattedSocieties, 'id');

      await clearAndInsert('Members', MULTI_TENANT_MEMBERS, 'id');
      await clearAndInsert('Payments', MULTI_TENANT_PAYMENTS, 'id');
      await clearAndInsert('Expenses', MULTI_TENANT_EXPENSES, 'id');
      await clearAndInsert('Complaints', MULTI_TENANT_COMPLAINTS, 'id');
      await clearAndInsert('Notices', MULTI_TENANT_NOTICES, 'id');
      await clearAndInsert('Invoices', MULTI_TENANT_INVOICES, 'id');
      await clearAndInsert('Visitors', MULTI_TENANT_VISITORS, 'id');
      await clearAndInsert('ComplaintReplies', MULTI_TENANT_COMPLAINT_REPLIES, 'id');

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
  const syncWithSupabase = async (targetUrl = supabaseUrl, targetKey = supabaseAnonKey) => {
    const cleanUrl = (targetUrl || '').trim();
    const cleanKey = (targetKey || '').trim();
    if (!cleanUrl || !cleanKey) return;

    try {
      const getHeaders = {
        'apikey': cleanKey,
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json'
      };

      const safeFetchJson = async (tableName: string) => {
        try {
          const url = `${cleanUrl}/rest/v1/${tableName}?select=*`;
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
      const societiesData = await safeFetchJson('Societies');
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

      // 1. Fetch Members
      const membersData = await safeFetchJson('Members');
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

      // 2. Fetch Payments
      const paymentsData = await safeFetchJson('Payments');
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

      // 3. Fetch Expenses
      const expensesData = await safeFetchJson('Expenses');
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
            ApprovedBy: e.ApprovedBy || 'Committee'
          })).sort((a,b) => b.Date.localeCompare(a.Date));
        updateExpensesState(formatted);
      }

      // 4. Fetch Complaints
      const complaintsData = await safeFetchJson('Complaints');
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

      // 5. Fetch Notices
      const noticesData = await safeFetchJson('Notices');
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

      // 6. Fetch AuditLogs
      const auditLogsData = await safeFetchJson('AuditLogs');
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

      // 7. Fetch Invoices
      const invoicesData = await safeFetchJson('Invoices');
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

      // 8. Fetch Visitors
      const visitorsData = await safeFetchJson('Visitors');
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
      const complaintRepliesData = await safeFetchJson('ComplaintReplies');
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
      const rolesData = await safeFetchJson('Roles');
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
      const userAuthData = await safeFetchJson('UserAuth');
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
    const loggedExpense: Expense = {
      ...newExp,
      id: `E-${Date.now()}`,
      SocietyId: activeSocietyId
    };

    const nextExpenses = [loggedExpense, ...expenses];
    updateExpensesState(nextExpenses);

    // Log action
    handleAddAuditLog('Log Expense', `Recorded expense of ₹${newExp.Amount} for category '${newExp.Category}' paid to ${newExp.Vendor}`);

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
            ApprovedBy: loggedExpense.ApprovedBy || 'Committee'
          })
        });
      } catch (err) {
        console.error('Failed to post expense row to Supabase:', err);
      }
    }
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
    towers?: any[]
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
          Towers: towers
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
        const payload = {
          id: activeSocietyId,
          Name: name,
          HasWings: wingsEnabled,
          Wings: wings.join(', '),
          PostalAddress: address,
          BuildingType: type,
          StructureType: structureType || (wingsEnabled ? 'wings' : 'standalone'),
          Towers: towers ? JSON.stringify(towers) : null
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
  }) => {
    const noticeId = `N-${Date.now()}`;
    const newNotice: Notice = {
      id: noticeId,
      SocietyId: activeSocietyId,
      Date: new Date().toISOString().split('T')[0],
      Title: noticeData.title,
      Category: noticeData.category as any,
      Content: noticeData.content,
      AttachmentUrl: noticeData.attachmentUrl || "",
      AttachmentName: noticeData.attachmentName || "",
      AttachmentSize: noticeData.attachmentSize || "",
      PostedBy: 'Society Management Committee'
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
      OwnerName: "Default Owner",
      ContactNo: "+91 99999 88888",
      Email: "owner.101@example.com",
      Balance: 1500,
      Status: "Owner"
    };
    const nextMembers = [...members, starterMember];
    updateMembersState(nextMembers);

    // Seed a welcome notice for the new society
    const starterNotice: Notice = {
      id: `N-${newId}-welcome`,
      SocietyId: newId,
      Date: new Date().toISOString().split('T')[0],
      Title: `Welcome to ${name}!`,
      Category: "General",
      Content: `Welcome to the newly set up digital management portal for ${name}. You can configure apartments, record payments, and approve expenses in real-time.`,
      PostedBy: "System Administrator"
    };
    const nextNotices = [starterNotice, ...notices];
    setNotices(nextNotices);
    localStorage.setItem('society_notices', JSON.stringify(nextNotices));

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
          Wings: wings.join(', '),
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

      // Register welcome notice to Supabase
      fetch(`${supabaseUrl}/rest/v1/Notices`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(starterNotice)
      }).catch(err => console.warn('Failed to seed welcome notice in Supabase:', err));
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
    const loggedVisitor: Visitor = {
      ...newVis,
      id: visId
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

  // Filter datasets dynamically by active society
  const filteredMembers = members.filter(m => m.SocietyId === activeSocietyId);
  const filteredPayments = payments.filter(p => p.SocietyId === activeSocietyId);
  const filteredExpenses = expenses.filter(e => e.SocietyId === activeSocietyId);
  const filteredComplaints = complaints.filter(c => c.SocietyId === activeSocietyId);
  const filteredNotices = notices.filter(n => n.SocietyId === activeSocietyId);
  const filteredInvoices = invoices.filter(i => i.SocietyId === activeSocietyId);
  const filteredVisitors = visitors.filter(v => v.SocietyId === activeSocietyId);
  const filteredComplaintReplies = complaintReplies.filter(r => r.SocietyId === activeSocietyId);

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

        <div className="flex items-center gap-3">
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

          <div className={`hidden lg:flex items-center gap-2 text-xs font-semibold ${
            theme === 'dark' 
              ? 'text-slate-400 bg-slate-950/50 border-slate-800/80' 
              : 'text-slate-600 bg-slate-100 border-slate-200 shadow-xs'
          } px-3.5 py-1.5 rounded-full border transition-all duration-300`}>
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Active Storage:</span>
            {supabaseAnonKey ? (
              <span className="text-green-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Supabase Connected
              </span>
            ) : (
              <span className="text-purple-400 font-mono">Simulated LocalStorage Sandbox</span>
            )}
          </div>
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
            auditLogs={auditLogs.filter(al => al.SocietyId === activeSocietyId)}
            roles={roles}
            userAuths={userAuths}
            onUpdateRoles={updateRolesState}
            onUpdateUserAuths={updateUserAuthsState}
            onAddPayment={handleAddPayment}
            onAddExpense={handleAddExpense}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaint={handleUpdateComplaintStatus}
            onAddNotice={handleAddNotice}
            onAddInvoice={handleAddInvoice}
            onAddVisitor={handleAddVisitor}
            onUpdateVisitor={handleUpdateVisitorStatus}
            onAddComplaintReply={handleAddComplaintReply}
            onRefresh={async () => syncWithSupabase()}
            scriptUrl={supabaseAnonKey ? 'Connected' : ''}
            societyName={societyName}
            hasWings={hasWings}
            wingsList={wingsList}
            postalAddress={postalAddress}
            buildingType={buildingType}
            onUpdateSocietySettings={handleUpdateSocietySettings}
            onSaveOrUpdateMember={handleSaveOrUpdateMember}
            onAddDues={handleAddDues}
            onAddAuditLog={handleAddAuditLog}
            lastSynced={lastSynced}
            societies={societies}
            activeSocietyId={activeSocietyId}
            onChangeActiveSociety={(id) => { setActiveSocietyId(id); localStorage.setItem('active_society_id', id); }}
            onCreateSociety={handleCreateSociety}
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
