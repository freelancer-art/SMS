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
import { Member, Payment, Expense, Complaint, Notice, Society, AuditLog } from './types';
import { 
  MULTI_TENANT_MEMBERS, 
  MULTI_TENANT_PAYMENTS, 
  MULTI_TENANT_EXPENSES, 
  MULTI_TENANT_COMPLAINTS, 
  MULTI_TENANT_NOTICES 
} from './data/mockData';
import MobileSimulator from './components/MobileSimulator';
import ExpoDeveloperHub from './components/ExpoDeveloperHub';

const DEFAULT_SOCIETIES: Society[] = [
  {
    id: 'greenwood',
    Name: 'Greenwood Residency',
    BuildingType: 'Housing Society',
    PostalAddress: '123 Greenwood Road, Sector 5, Mumbai, MH - 400001',
    Wings: ['A', 'B', 'C'],
    HasWings: true
  },
  {
    id: 'royal_heights',
    Name: 'Royal Heights Complex',
    BuildingType: 'Apartment Complex',
    PostalAddress: 'Plot 45-47, Palm Beach Road, Sanpada, Navi Mumbai, MH - 400705',
    Wings: ['Tower 1', 'Tower 2'],
    HasWings: true
  },
  {
    id: 'sea_breeze',
    Name: 'Sea Breeze Co-op Society',
    BuildingType: 'Residential Co-operative',
    PostalAddress: 'Beach Road, Juhu, Mumbai, MH - 400049',
    Wings: ['Wing A', 'Wing B'],
    HasWings: true
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
  const [lastSynced, setLastSynced] = useState<string>(() => localStorage.getItem('society_last_synced') || '');

  // Init Data from LocalStorage or Fallbacks
  useEffect(() => {
    const localMembers = localStorage.getItem('society_members');
    const localPayments = localStorage.getItem('society_payments');
    const localExpenses = localStorage.getItem('society_expenses');
    const localComplaints = localStorage.getItem('society_complaints');
    const localNotices = localStorage.getItem('society_notices');
    const localAuditLogs = localStorage.getItem('society_audit_logs');
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

    setMembers(getSafeList(localMembers, MULTI_TENANT_MEMBERS));
    setPayments(getSafeList(localPayments, MULTI_TENANT_PAYMENTS));
    setExpenses(getSafeList(localExpenses, MULTI_TENANT_EXPENSES));
    setComplaints(getSafeList(localComplaints, MULTI_TENANT_COMPLAINTS));
    setNotices(getSafeList(localNotices, MULTI_TENANT_NOTICES));
    setAuditLogs(getSafeList(localAuditLogs, DEFAULT_AUDIT_LOGS));

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
        const formattedSocs: Society[] = societiesData.map(s => ({
          id: String(s.id),
          Name: s.Name || 'Unnamed Society',
          BuildingType: s.BuildingType || 'Housing Society',
          PostalAddress: s.PostalAddress || '',
          Wings: s.Wings ? String(s.Wings).split(',').map((w: string) => w.trim()).filter((w: string) => w !== '') : [],
          HasWings: s.HasWings === true || s.HasWings === 'true'
        }));
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
        updateMembersState(formatted);
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

  const handleUpdateSocietySettings = async (name: string, wingsEnabled: boolean, wings: string[], address: string, type: string) => {
    const updatedSocieties = societies.map(s => {
      if (s.id === activeSocietyId) {
        return {
          ...s,
          Name: name,
          HasWings: wingsEnabled,
          Wings: wings,
          PostalAddress: address,
          BuildingType: type
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
          BuildingType: type
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

  const handleAddNotice = async (noticeData: { title: string; category: string; content: string }) => {
    const noticeId = `N-${Date.now()}`;
    const newNotice: Notice = {
      id: noticeId,
      SocietyId: activeSocietyId,
      Date: new Date().toISOString().split('T')[0],
      Title: noticeData.title,
      Category: noticeData.category as any,
      Content: noticeData.content,
      PostedBy: 'Society Management'
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

  // Filter datasets dynamically by active society
  const filteredMembers = members.filter(m => m.SocietyId === activeSocietyId);
  const filteredPayments = payments.filter(p => p.SocietyId === activeSocietyId);
  const filteredExpenses = expenses.filter(e => e.SocietyId === activeSocietyId);
  const filteredComplaints = complaints.filter(c => c.SocietyId === activeSocietyId);
  const filteredNotices = notices.filter(n => n.SocietyId === activeSocietyId);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans overflow-hidden transition-colors duration-300`}>
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
            payments={filteredPayments}
            expenses={filteredExpenses}
            complaints={filteredComplaints}
            notices={filteredNotices}
            auditLogs={auditLogs.filter(al => al.SocietyId === activeSocietyId)}
            onAddPayment={handleAddPayment}
            onAddExpense={handleAddExpense}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaint={handleUpdateComplaintStatus}
            onAddNotice={handleAddNotice}
            onRefresh={async () => syncWithSupabase()}
            scriptUrl={supabaseAnonKey ? 'Connected' : ''}
            societyName={societyName}
            hasWings={hasWings}
            wingsList={wingsList}
            postalAddress={postalAddress}
            buildingType={buildingType}
            onUpdateSocietySettings={handleUpdateSocietySettings}
            onSaveOrUpdateMember={handleSaveOrUpdateMember}
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
              <button
                type="button"
                onClick={() => setShowRegisterSociety(true)}
                className="mt-1.5 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 rounded text-[10px] shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>➕ Register New Customer (Society)</span>
              </button>
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
              <span>Gate Passcode: <strong className={theme === 'dark' ? 'text-slate-400 font-mono' : 'text-slate-600 font-mono'}>admin123</strong></span>
              <span>•</span>
              <span>Pull to refresh / load notices</span>
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
