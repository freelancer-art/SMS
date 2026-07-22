import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingDown, 
  AlertTriangle, 
  Megaphone, 
  Plus, 
  Lock, 
  Search, 
  ChevronRight, 
  X,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Wifi,
  Battery,
  Signal,
  BarChart3,
  Settings,
  Pencil,
  Bell,
  Building2,
  MapPin,
  Layers,
  Car,
  Save,
  MessageSquare,
  Send,
  ShieldCheck,
  Home,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Member, Payment, Expense, Complaint, Notice, Society, AuditLog, Invoice, Visitor, ComplaintReply, Role, UserAuth } from '../types';
import { hashPassword, generateSalt, generateVisitorAccessToken } from '../utils/security';
import FacilityBookingManager from './FacilityBookingManager';

interface MobileSimulatorProps {
  members: Member[];
  allMembers?: Member[];
  payments: Payment[];
  expenses: Expense[];
  complaints: Complaint[];
  notices: Notice[];
  invoices?: Invoice[];
  visitors?: Visitor[];
  complaintReplies?: ComplaintReply[];
  auditLogs?: AuditLog[];
  roles?: Role[];
  userAuths?: UserAuth[];
  onUpdateRoles?: (roles: Role[]) => void;
  onUpdateUserAuths?: (auths: UserAuth[]) => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddComplaint: (complaint: Omit<Complaint, 'id'>) => void;
  onUpdateComplaint: (id: string, nextStatus: 'Open' | 'In Progress' | 'Resolved', autoNotice?: { title: string; category: string; content: string }) => void;
  onRefresh: () => Promise<void>;
  scriptUrl: string;
  societyName: string;
  hasWings: boolean;
  wingsList: string[];
  postalAddress: string;
  buildingType: string;
  onUpdateSocietySettings: (
    name: string, 
    wingsEnabled: boolean, 
    wings: string[], 
    postalAddress: string, 
    buildingType: string,
    structureType?: 'standalone' | 'wings' | 'towers_wings',
    towers?: any[]
  ) => void;
  onSaveOrUpdateMember: (member: Member) => void;
  onAddNotice?: (notice: { 
    title: string; 
    category: string; 
    content: string; 
    attachmentUrl?: string; 
    attachmentName?: string; 
    attachmentSize?: string;
    documentUrl?: string;
    uploadedBy?: string;
  }) => void;
  onAddInvoice?: (invoice: Omit<Invoice, 'id'>) => void;
  onAddVisitor?: (visitor: Omit<Visitor, 'id'>) => void;
  onUpdateVisitor?: (id: string, status: Visitor['Status'], hostApprovedBy?: string) => void;
  onAddComplaintReply?: (reply: Omit<ComplaintReply, 'id'>) => void;
  lastSynced?: string;
  societies?: Society[];
  activeSocietyId?: string;
  onChangeActiveSociety?: (id: string) => void;
  onCreateSociety?: (name: string, type: string, address: string, wings: string[], wingsEnabled: boolean) => void;
  onAddDues?: (flatNo: string, amount: number, desc: string) => void;
  onAddAuditLog?: (action: string, details: string) => void;
}

export default function MobileSimulator({
  members: rawMembers,
  allMembers: rawAllMembers = [],
  payments: rawPayments,
  expenses: rawExpenses,
  complaints: rawComplaints,
  notices: rawNotices,
  invoices: rawInvoices = [],
  visitors: rawVisitors = [],
  complaintReplies: rawComplaintReplies = [],
  auditLogs = [],
  roles: rawRoles = [],
  userAuths: rawUserAuths = [],
  onUpdateRoles,
  onUpdateUserAuths,
  onAddPayment,
  onAddExpense,
  onAddComplaint,
  onUpdateComplaint,
  onRefresh,
  scriptUrl,
  societyName,
  hasWings,
  wingsList,
  postalAddress,
  buildingType,
  onUpdateSocietySettings,
  onSaveOrUpdateMember,
  onAddNotice,
  onAddInvoice,
  onAddVisitor,
  onUpdateVisitor,
  onAddComplaintReply,
  lastSynced,
  societies = [],
  activeSocietyId = 'greenwood',
  onChangeActiveSociety,
  onCreateSociety,
  onAddDues,
  onAddAuditLog
}: MobileSimulatorProps) {
  const members = Array.isArray(rawMembers) ? rawMembers : [];
  const allMembers = Array.isArray(rawAllMembers) ? rawAllMembers : [];
  const payments = Array.isArray(rawPayments) ? rawPayments : [];
  const expenses = Array.isArray(rawExpenses) ? rawExpenses : [];
  const complaints = Array.isArray(rawComplaints) ? rawComplaints : [];
  const notices = Array.isArray(rawNotices) ? rawNotices : [];
  const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];
  const visitors = Array.isArray(rawVisitors) ? rawVisitors : [];
  const roles = Array.isArray(rawRoles) ? rawRoles : [];
  const userAuths = Array.isArray(rawUserAuths) ? rawUserAuths : [];
  const complaintReplies = Array.isArray(rawComplaintReplies) ? rawComplaintReplies : [];
  
  // Login & RBAC State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('society_sim_logged') === 'true';
  });
  const [userRole, setUserRole] = useState<'Admin' | 'Member'>(() => {
    return (localStorage.getItem('society_sim_role') as 'Admin' | 'Member') || 'Admin';
  });
  const [loggedInMemberFlat, setLoggedInMemberFlat] = useState<string>(() => {
    return localStorage.getItem('society_sim_member_flat') || '';
  });

  const activeResidentMember = members.find(m => m.FlatNo === loggedInMemberFlat) || {
    FlatNo: loggedInMemberFlat,
    OwnerName: 'Resident',
    Balance: 0,
    Status: 'Owner' as const
  };

  // Automatically clear credential textboxes when logged out
  useEffect(() => {
    if (!isLoggedIn) {
      setLoginEmailOrPhone('');
      setLoginPasscode('');
      setPassword('');
    }
  }, [isLoggedIn]);



  const [loginRole, setLoginRole] = useState<'Admin' | 'Member'>('Admin');
  const [selectedMemberFlat, setSelectedMemberFlat] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(() => {
    const saved = localStorage.getItem('society_sim_zoom');
    return saved ? parseFloat(saved) : 0.8;
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      // Treat viewports narrower than 1024px as real mobile devices for full-screen view
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Clear selected flat if society switches
    setSelectedMemberFlat('');
  }, [activeSocietyId]);

  const activeSocietyObj = societies?.find(s => s.id === activeSocietyId);
  const activeStructureType = activeSocietyObj?.StructureType || (hasWings ? 'wings' : 'standalone');
  const activeTowers = activeSocietyObj?.Towers || [];

  const handleZoomChange = (scale: number) => {
    setZoomScale(scale);
    localStorage.setItem('society_sim_zoom', String(scale));
  };

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Credentials-based login states
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState(() => {
    return localStorage.getItem('society_sim_logged_email_or_phone') || '';
  });
  const [loginPasscode, setLoginPasscode] = useState('');
  const [matchedProperties, setMatchedProperties] = useState<Member[]>([]);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(() => {
    return localStorage.getItem('society_sim_logged_email') || '';
  });
  const [loggedInUserContact, setLoggedInUserContact] = useState(() => {
    return localStorage.getItem('society_sim_logged_contact') || '';
  });

  // OTP-Based Verification & Multi-Factor Simulation States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [pendingAuthMatches, setPendingAuthMatches] = useState<Member[]>([]);
  const [smsBanner, setSmsBanner] = useState<string | null>(null);
  const [mfaLogs, setMfaLogs] = useState<any[]>([]);

  // Custom persistent passcodes & Password Reset States
  const [customPasscodes, setCustomPasscodes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('society_sim_custom_passcodes');
    return saved ? JSON.parse(saved) : {};
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotRole, setForgotRole] = useState<'Admin' | 'Member'>('Member');
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // SMS Banner auto-hide
  useEffect(() => {
    if (smsBanner) {
      const timer = setTimeout(() => {
        setSmsBanner(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [smsBanner]);

  // Tab State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'members' | 'payments' | 'expenses' | 'complaints' | 'notices' | 'amenities'>('dashboard');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [complaintFilter, setComplaintFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  // Detail Modal States
  const [activeMemberDetail, setActiveMemberDetail] = useState<Member | null>(null);
  const [activeComplaintDetail, setActiveComplaintDetail] = useState<Complaint | null>(null);
  const [activeNoticeDetail, setActiveNoticeDetail] = useState<Notice | null>(null);

  // Form Modal States
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  // Visitor Simulator States
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [newVisName, setNewVisName] = useState('');
  const [newVisPurpose, setNewVisPurpose] = useState('Delivery');
  const [newVisContact, setNewVisContact] = useState('');
  const [newVisVehicle, setNewVisVehicle] = useState('');
  const [newVisFlatNo, setNewVisFlatNo] = useState('');

  // Automated Billing Engine States
  const [billingMonth, setBillingMonth] = useState('July 2026');
  const [billBase, setBillBase] = useState('2000');
  const [billWater, setBillWater] = useState('300');
  const [billSecurity, setBillSecurity] = useState('200');
  const [billParking, setBillParking] = useState('100');
  const [showBillingEngine, setShowBillingEngine] = useState(false);

  // Automated Notice states when resolving complaint
  const [autoNoticeEnabled, setAutoNoticeEnabled] = useState(false);
  const [autoNoticeType, setAutoNoticeType] = useState<'society' | 'member'>('society');
  const [autoNoticeTitle, setAutoNoticeTitle] = useState('');
  const [autoNoticeContent, setAutoNoticeContent] = useState('');

  // Broadcast Notice Modal States
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'General' | 'Maintenance' | 'Meeting' | 'Event' | 'Security'>('General');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeFileUrl, setNewNoticeFileUrl] = useState('');
  const [newNoticeFileName, setNewNoticeFileName] = useState('');
  const [newNoticeFileSize, setNewNoticeFileSize] = useState('');

  // Circular Preview Modal States
  const [previewingNotice, setPreviewingNotice] = useState<Notice | null>(null);
  const [viewerZoom, setViewerZoom] = useState(100);

  // Custom states for Audit log view and Member dues UPI pay modal
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showMemberPayModal, setShowMemberPayModal] = useState(false);
  const [memberPayAmount, setMemberPayAmount] = useState('');
  const [memberPayMode, setMemberPayMode] = useState<'UPI' | 'Card' | 'Netbanking'>('UPI');

  // Inline Member Edit States
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editVehicle, setEditVehicle] = useState('');

  // Form Field States
  const [payFlatNo, setPayFlatNo] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque'>('UPI');
  const [payRef, setPayRef] = useState('');

  const [expCategory, setExpCategory] = useState<'Maintenance' | 'Security' | 'Water' | 'Electricity' | 'Repairs' | 'Gardening' | 'Salary' | 'Others'>('Maintenance');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expInvoice, setExpInvoice] = useState('');

  const [compFlatNo, setCompFlatNo] = useState('');
  const [compCategory, setCompCategory] = useState<'Plumbing' | 'Electrical' | 'Security' | 'Cleanliness' | 'Parking' | 'Noisy Neighbor' | 'Others'>('Plumbing');
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compUrgency, setCompUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Society settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSocietyName, setTempSocietyName] = useState(societyName || '');
  const [tempHasWings, setTempHasWings] = useState(hasWings || false);
  const [tempWingsList, setTempWingsList] = useState((wingsList || []).join(', '));
  const [tempPostalAddress, setTempPostalAddress] = useState(postalAddress || '');
  const [tempBuildingType, setTempBuildingType] = useState(buildingType || 'Housing Society');
  const [tempStructureType, setTempStructureType] = useState<'standalone' | 'wings' | 'towers_wings'>('standalone');
  const [tempTowers, setTempTowers] = useState<any[]>([]);

  // Sync temp values when societyName/hasWings/wingsList changes from outside
  const wingsListStr = (wingsList || []).join(',');
  useEffect(() => {
    setTempSocietyName(societyName || '');
    setTempHasWings(hasWings || false);
    setTempWingsList((wingsList || []).join(', '));
    setTempPostalAddress(postalAddress || '');
    setTempBuildingType(buildingType || 'Housing Society');
  }, [societyName, hasWings, wingsListStr, postalAddress, buildingType]);

  // Member form state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memFlatNo, setMemFlatNo] = useState('');
  const [memOwnerName, setMemOwnerName] = useState('');
  const [memContactNo, setMemContactNo] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memBalance, setMemBalance] = useState('');
  const [memStatus, setMemStatus] = useState<'Owner' | 'Tenant'>('Owner');
  const [memCoOwners, setMemCoOwners] = useState('');
  const [memVehicleNo, setMemVehicleNo] = useState('');
  const [memWing, setMemWing] = useState('');
  const [memTower, setMemTower] = useState('');
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');

  // Sync / Loader status
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [replyText, setReplyText] = useState('');

  const handleSendReply = () => {
    if (!replyText.trim() || !activeComplaintDetail) return;

    let senderName = 'Resident Member';
    let senderRole: 'Admin' | 'Member' = 'Member';

    if (userRole === 'Admin') {
      senderName = 'Committee Admin (Secretary)';
      senderRole = 'Admin';
    } else {
      const activeMember = members.find(m => m.FlatNo === loggedInMemberFlat);
      senderName = activeMember ? `${activeMember.OwnerName} (Flat ${activeMember.FlatNo})` : `Flat ${loggedInMemberFlat}`;
      senderRole = 'Member';
    }

    if (onAddComplaintReply) {
      onAddComplaintReply({
        ComplaintId: activeComplaintDetail.id,
        SocietyId: activeSocietyId,
        SenderName: senderName,
        SenderRole: senderRole,
        Message: replyText.trim(),
        Timestamp: new Date().toISOString()
      });
      setReplyText('');
      triggerToast('Response posted successfully!');
    }
  };



  const normalizePhone = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
  };

  const isEmail = (val: string) => {
    return val.includes('@');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (loginRole === 'Admin') {
      const adminEmailInput = loginEmailOrPhone.trim().toLowerCase();
      if (!adminEmailInput) {
        setPasswordError('Please enter Admin Email');
        return;
      }
      if (!password) {
        setPasswordError('Please enter Security Gate Code');
        return;
      }

      const customAdminPass = customPasscodes[adminEmailInput];
      const validPass = customAdminPass || 'admin123';

      if (password === validPass) {
        const adminMember = allMembers.find(m => 
          m.Email && m.Email.trim().toLowerCase() === adminEmailInput && m.Role === 'Admin'
        );

        let targetSocietyId = (adminMember && adminMember.SocietyId) ? adminMember.SocietyId : null;

        // Fallback: Intelligent parsing for admin emails if no explicit database entry exists
        if (!targetSocietyId) {
          if (adminEmailInput.includes('greenwood') || adminEmailInput.includes('greewood')) {
            targetSocietyId = 'greenwood';
          } else if (adminEmailInput.includes('royalheights') || adminEmailInput.includes('royal_heights') || adminEmailInput.includes('royal')) {
            targetSocietyId = 'royal_heights';
          } else if (adminEmailInput.includes('seabreeze') || adminEmailInput.includes('sea_breeze') || adminEmailInput.includes('breeze')) {
            targetSocietyId = 'sea_breeze';
          }
        }

        setIsLoggedIn(true);
        setUserRole('Admin');
        setLoggedInMemberFlat('');
        localStorage.setItem('society_sim_logged', 'true');
        localStorage.setItem('society_sim_role', 'Admin');
        localStorage.setItem('society_sim_member_flat', '');
        localStorage.setItem('society_sim_logged_email_or_phone', adminEmailInput);
        
        if (targetSocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(targetSocietyId);
          localStorage.setItem('active_society_id', targetSocietyId);
          triggerToast(`Authorized as Admin for ${societies.find(s => s.id === targetSocietyId)?.Name || 'Society'}`);
        } else {
          triggerToast('Authorized as Committee Admin');
        }
        setPasswordError('');
      } else {
        setPasswordError(`Invalid Security Code. Please check or use "Forgot Code" if you reset it.`);
      }
    } else {
      const inputVal = loginEmailOrPhone.trim().toLowerCase();
      const inputPass = loginPasscode.trim();
      
      if (!inputVal) {
        setPasswordError('Please enter your registered Email or Contact Number');
        return;
      }
      if (!inputPass) {
        setPasswordError('Please enter your password / registered Contact Number');
        return;
      }

      const matches = allMembers.filter(m => {
        const inputLower = inputVal.trim().toLowerCase();
        if (isEmail(inputVal)) {
          return m.Email && m.Email.trim().toLowerCase() === inputLower;
        } else if (m.OwnerName && m.OwnerName.toLowerCase().includes(inputLower)) {
          return true;
        } else {
          const mPhoneClean = m.ContactNo ? normalizePhone(m.ContactNo) : '';
          const inputPhoneClean = normalizePhone(inputVal);
          return mPhoneClean && inputPhoneClean && mPhoneClean === inputPhoneClean;
        }
      });

      if (matches.length === 0) {
        setPasswordError('Credentials not registered. Please contact your society committee.');
        return;
      }

      const verifiedMatches = matches.filter(m => {
        const key = m.Email ? m.Email.trim().toLowerCase() : (m.ContactNo ? normalizePhone(m.ContactNo) : '');
        const customPass = key ? customPasscodes[key] : null;
        if (customPass && inputPass === customPass) {
          return true;
        }
        if (inputPass === '1234' || inputPass === 'member123') {
          return true;
        }
        const mPhoneClean = m.ContactNo ? normalizePhone(m.ContactNo) : '';
        const passPhoneClean = normalizePhone(inputPass);
        return mPhoneClean && passPhoneClean && mPhoneClean === passPhoneClean;
      });

      if (verifiedMatches.length === 0) {
        setPasswordError('Incorrect passcode. Enter your custom passcode or registered Contact Number.');
        return;
      }

      setLoggedInUserEmail(verifiedMatches[0].Email || '');
      setLoggedInUserContact(verifiedMatches[0].ContactNo || '');
      localStorage.setItem('society_sim_logged_email', verifiedMatches[0].Email || '');
      localStorage.setItem('society_sim_logged_contact', verifiedMatches[0].ContactNo || '');
      localStorage.setItem('society_sim_logged_email_or_phone', inputVal);

      if (mfaEnabled) {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        setActiveOtpCode(code);
        setPendingAuthMatches(verifiedMatches);
        setUserOtpInput('');
        setShowOtpOverlay(true);
        setSmsBanner(`💬 GreenSecurID: Your login OTP is [ ${code} ]. Valid for 5 mins.`);
        
        const newLog = {
          id: `MFA-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'MFA Initiated',
          details: `Simulated OTP generated and sent to SMS container. Code: ${code}`,
          status: 'Pending'
        };
        setMfaLogs(prev => [newLog, ...prev]);
        triggerToast('Simulated OTP Sent!');
        return;
      }

      if (verifiedMatches.length === 1) {
        const singleUser = verifiedMatches[0];
        setIsLoggedIn(true);
        setUserRole('Member');
        setLoggedInMemberFlat(singleUser.FlatNo);
        localStorage.setItem('society_sim_logged', 'true');
        localStorage.setItem('society_sim_role', 'Member');
        localStorage.setItem('society_sim_member_flat', singleUser.FlatNo);
        
        if (singleUser.SocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(singleUser.SocietyId);
          localStorage.setItem('active_society_id', singleUser.SocietyId);
        }
        
        setPasswordError('');
        triggerToast(`Signed in to Flat ${singleUser.FlatNo}`);
      } else {
        setMatchedProperties(verifiedMatches);
        setShowPropertySelector(true);
        setPasswordError('');
      }
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtpInput.trim() === activeOtpCode) {
      const newLog = {
        id: `MFA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'MFA Verified',
        details: 'Correct OTP entered. Granted secure session access.',
        status: 'Success'
      };
      setMfaLogs(prev => [newLog, ...prev]);
      
      setShowOtpOverlay(false);
      setUserOtpInput('');
      
      if (pendingAuthMatches.length === 1) {
        const singleUser = pendingAuthMatches[0];
        setIsLoggedIn(true);
        setUserRole('Member');
        setLoggedInMemberFlat(singleUser.FlatNo);
        localStorage.setItem('society_sim_logged', 'true');
        localStorage.setItem('society_sim_role', 'Member');
        localStorage.setItem('society_sim_member_flat', singleUser.FlatNo);
        
        if (singleUser.SocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(singleUser.SocietyId);
          localStorage.setItem('active_society_id', singleUser.SocietyId);
        }
        
        setPasswordError('');
        triggerToast(`Signed in securely to Flat ${singleUser.FlatNo}`);
      } else if (pendingAuthMatches.length > 1) {
        setMatchedProperties(pendingAuthMatches);
        setShowPropertySelector(true);
        setPasswordError('');
      }
    } else {
      const newLog = {
        id: `MFA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'MFA Failure',
        details: `Incorrect OTP entered: "${userOtpInput}". Expected: ${activeOtpCode}`,
        status: 'Blocked'
      };
      setMfaLogs(prev => [newLog, ...prev]);
      triggerToast('Invalid OTP! Access Denied.');
    }
  };

  const handleSelectProperty = (property: Member) => {
    setIsLoggedIn(true);
    setUserRole('Member');
    setLoggedInMemberFlat(property.FlatNo);
    localStorage.setItem('society_sim_logged', 'true');
    localStorage.setItem('society_sim_role', 'Member');
    localStorage.setItem('society_sim_member_flat', property.FlatNo);
    
    if (property.SocietyId && onChangeActiveSociety) {
      onChangeActiveSociety(property.SocietyId);
      localStorage.setItem('active_society_id', property.SocietyId);
    }
    
    setShowPropertySelector(false);
    triggerToast(`Entered Flat ${property.FlatNo} at ${societies.find(s => s.id === property.SocietyId)?.Name || 'Society'}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('Admin');
    setLoggedInMemberFlat('');
    setLoggedInUserEmail('');
    setLoggedInUserContact('');
    setMatchedProperties([]);
    setShowPropertySelector(false);
    setLoginEmailOrPhone('');
    setLoginPasscode('');
    setPassword('');
    localStorage.removeItem('society_sim_logged');
    localStorage.removeItem('society_sim_role');
    localStorage.removeItem('society_sim_member_flat');
    localStorage.removeItem('society_sim_logged_email');
    localStorage.removeItem('society_sim_logged_contact');
    localStorage.removeItem('society_sim_logged_email_or_phone');
    setSearchQuery('');
    triggerToast('Logged out of system');
  };

  const handleManualRefresh = async () => {
    setSyncing(true);
    await onRefresh();
    setSyncing(false);
    triggerToast(scriptUrl ? 'Synced with Database!' : 'Mock Sandbox refreshed');
  };

  // Society settings submit
  const handleSaveSocietySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const wings = tempWingsList.split(',').map(w => w.trim()).filter(w => w !== '');
    onUpdateSocietySettings(tempSocietyName, tempHasWings, wings, tempPostalAddress, tempBuildingType, tempStructureType, tempTowers);
    setShowSettingsModal(false);
    triggerToast('Society settings updated!');
  };

  // Member form actions
  const handleOpenAddMember = () => {
    setIsEditingMember(false);
    setMemFlatNo('');
    setMemOwnerName('');
    setMemContactNo('');
    setMemEmail('');
    setMemBalance('0');
    setMemStatus('Owner');
    setMemCoOwners('');
    setMemVehicleNo('');
    setMemWing(wingsList[0] || '');
    setMemTower(activeTowers[0]?.Name || '');
    setShowMemberForm(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setIsEditingMember(true);
    setMemFlatNo(member.FlatNo);
    setMemOwnerName(member.OwnerName);
    setMemContactNo(member.ContactNo);
    setMemEmail(member.Email);
    setMemBalance(String(member.Balance));
    setMemStatus(member.Status);
    setMemCoOwners(member.CoOwners || '');
    setMemVehicleNo(member.VehicleNo || '');
    setMemWing(member.Wing || wingsList[0] || '');
    setMemTower(member.Tower || activeTowers[0]?.Name || '');
    setShowMemberForm(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memFlatNo.trim() || !memOwnerName.trim()) {
      triggerToast('Flat No and Owner Name are required');
      return;
    }

    const member: Member = {
      FlatNo: memFlatNo.trim(),
      OwnerName: memOwnerName.trim(),
      ContactNo: memContactNo.trim(),
      Email: memEmail.trim(),
      Balance: parseFloat(memBalance) || 0,
      Status: memStatus,
      CoOwners: memCoOwners.trim(),
      VehicleNo: memVehicleNo.trim(),
      Wing: activeStructureType === 'standalone' ? '' : memWing,
      Tower: activeStructureType === 'towers_wings' ? memTower : undefined
    };

    onSaveOrUpdateMember(member);
    setShowMemberForm(false);
    triggerToast(isEditingMember ? 'Member updated successfully!' : 'Member added successfully!');
  };

  // Submit payment form
  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFlatNo || !payAmount) {
      alert('Please fill in Flat Number and Amount.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    onAddPayment({
      Date: today,
      FlatNo: payFlatNo,
      Amount: parseFloat(payAmount),
      Mode: payMode,
      ReferenceNo: payRef,
      Status: 'Cleared'
    });
    
    setShowPaymentForm(false);
    setPayFlatNo('');
    setPayAmount('');
    setPayRef('');
    triggerToast(`Payment logged for Flat ${payFlatNo}`);
  };

  // Submit expense form
  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expVendor) {
      alert('Please fill in Amount and Vendor.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    onAddExpense({
      Date: today,
      Category: expCategory,
      Amount: parseFloat(expAmount),
      Vendor: expVendor,
      InvoiceNo: expInvoice,
      ApprovedBy: 'Committee'
    });
    
    setShowExpenseForm(false);
    setExpAmount('');
    setExpVendor('');
    setExpInvoice('');
    triggerToast(`Expense added: ₹${expAmount}`);
  };

  // Submit complaint form
  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFlatNo || !compTitle || !compDesc) {
      alert('Please fill in Flat, Title, and Description.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    onAddComplaint({
      FlatNo: compFlatNo,
      Category: compCategory,
      Title: compTitle,
      Description: compDesc,
      Date: today,
      Status: 'Open',
      Urgency: compUrgency
    });

    setShowComplaintForm(false);
    setCompFlatNo('');
    setCompTitle('');
    setCompDesc('');
    triggerToast('Complaint registered successfully');
  };

  // Filter lists
  const filteredMembers = (userRole === 'Member'
    ? (Array.isArray(members) ? members : []).filter(m => m.FlatNo === loggedInMemberFlat)
    : (Array.isArray(members) ? members : [])
  ).filter(m => {
    if (!m) return false;
    // 1. Wing filter
    if (hasWings && selectedWingFilter !== 'All') {
      if (m.Wing !== selectedWingFilter) return false;
    }
    // 2. Search query
    const q = searchQuery.toLowerCase();
    const flatNoStr = String(m.FlatNo || '');
    const ownerNameStr = String(m.OwnerName || '');
    const wingStr = String(m.Wing || '');
    return (
      flatNoStr.toLowerCase().includes(q) || 
      ownerNameStr.toLowerCase().includes(q) ||
      wingStr.toLowerCase().includes(q)
    );
  });

  const filteredComplaints = (userRole === 'Member'
    ? complaints.filter(c => c.FlatNo === loggedInMemberFlat)
    : complaints
  ).filter(c => {
    if (complaintFilter === 'All') return true;
    return c.Status === complaintFilter;
  });

  const filteredPayments = userRole === 'Member'
    ? payments.filter(p => p.FlatNo === loggedInMemberFlat)
    : payments;

  // Helper to safely extract year and month from raw date values (handles non-strings, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.)
  const getYearAndMonth = (rawDate: any) => {
    if (!rawDate) return null;
    const dateStr = String(rawDate).trim();
    // Try to match YYYY-MM-DD or similar
    let parts = dateStr.split('T')[0].split(/[-/]/);
    if (parts.length >= 3) {
      // Check if first part is 4 digits (year, e.g., YYYY-MM-DD)
      if (parts[0].length === 4) {
        return { year: parts[0], monthStr: parts[1] };
      }
      // Check if last part is 4 digits (year, e.g., DD/MM/YYYY or MM/DD/YYYY)
      if (parts[2].length === 4) {
        return { year: parts[2], monthStr: parts[1] };
      }
    }
    // Fallback simple split by '-' or '/'
    const simpleParts = dateStr.split(/[-/]/);
    if (simpleParts.length >= 2) {
      return { year: simpleParts[0], monthStr: simpleParts[1] };
    }
    return null;
  };

  // ------------------ DASHBOARD CALCULATIONS ------------------
  const totalIncome = (Array.isArray(payments) ? payments : []).reduce((sum, p) => sum + (p ? parseFloat(String(p.Amount || 0)) || 0 : 0), 0);
  const totalExpenses = (Array.isArray(expenses) ? expenses : []).reduce((sum, e) => sum + (e ? parseFloat(String(e.Amount || 0)) || 0 : 0), 0);
  const netReserve = totalIncome - totalExpenses;
  const totalPendingDues = (Array.isArray(members) ? members : []).reduce((sum, m) => {
    if (!m) return sum;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return sum + (bal > 0 ? bal : 0);
  }, 0);

  const totalPrepaidDues = (Array.isArray(members) ? members : []).reduce((sum, m) => {
    if (!m) return sum;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return sum + (bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const clearedCount = (Array.isArray(members) ? members : []).filter(m => {
    if (!m) return false;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return bal <= 0;
  }).length;

  const pendingCount = (Array.isArray(members) ? members : []).filter(m => {
    if (!m) return false;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return bal > 0;
  }).length;

  // Helper to group payments/expenses by month
  const getMonthlyChartData = () => {
    const monthlyDataMap: { [key: string]: { month: string; rawMonth: string; income: number; expenses: number } } = {};
    
    // helper to convert month number to short name
    const getMonthName = (monthStr: string) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const idx = parseInt(monthStr, 10) - 1;
      return months[idx] || monthStr;
    };

    (Array.isArray(payments) ? payments : []).forEach(p => {
      if (!p) return;
      const dateInfo = getYearAndMonth(p.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: `${monthName} ${String(year || '').slice(2)}`, rawMonth: key, income: 0, expenses: 0 };
      }
      monthlyDataMap[key].income += parseFloat(String(p.Amount || 0)) || 0;
    });

    (Array.isArray(expenses) ? expenses : []).forEach(e => {
      if (!e) return;
      const dateInfo = getYearAndMonth(e.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: `${monthName} ${String(year || '').slice(2)}`, rawMonth: key, income: 0, expenses: 0 };
      }
      monthlyDataMap[key].expenses += parseFloat(String(e.Amount || 0)) || 0;
    });

    // Sort chronologically
    return Object.keys(monthlyDataMap)
      .sort()
      .map(key => monthlyDataMap[key]);
  };

  const monthlyChartData = getMonthlyChartData();

  // Category breakdown for expenses
  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    (Array.isArray(expenses) ? expenses : []).forEach(e => {
      if (!e) return;
      const cat = e.Category || 'Others';
      breakdown[cat] = (breakdown[cat] || 0) + (parseFloat(String(e.Amount || 0)) || 0);
    });
    return Object.keys(breakdown).map(cat => ({
      name: cat,
      value: breakdown[cat]
    })).sort((a, b) => b.value - a.value);
  };

  const categoryData = getCategoryBreakdown();
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#64748b'];

  // Helper to group payments vs dues by month
  const getPaymentsVsDuesData = () => {
    const monthsMap: { [key: string]: { month: string; rawMonth: string; collected: number; outstanding: number } } = {};
    
    const getMonthName = (monthStr: string) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const idx = parseInt(monthStr, 10) - 1;
      return months[idx] || monthStr;
    };

    (Array.isArray(payments) ? payments : []).forEach(p => {
      if (!p) return;
      const dateInfo = getYearAndMonth(p.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthsMap[key]) {
        monthsMap[key] = { month: `${monthName} ${String(year || '').slice(2)}`, rawMonth: key, collected: 0, outstanding: totalPendingDues };
      }
      monthsMap[key].collected += parseFloat(String(p.Amount || 0)) || 0;
    });

    // Make sure we have at least one entry even if payments are empty
    if (Object.keys(monthsMap).length === 0) {
      const curDate = new Date();
      const monthName = getMonthName(String(curDate.getMonth() + 1).padStart(2, '0'));
      const key = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = { month: `${monthName} ${String(curDate.getFullYear()).slice(2)}`, rawMonth: key, collected: 0, outstanding: totalPendingDues };
    }

    return Object.keys(monthsMap).sort().map(key => monthsMap[key]);
  };

  const paymentsVsDuesData = getPaymentsVsDuesData();

  return (
    <div className={`flex flex-col items-center ${isMobile ? 'w-full h-full min-h-screen bg-slate-50' : 'gap-2'}`}>
      {/* Zoom Controls */}
      {!isMobile && (
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-bold shadow-md select-none z-50">
          <span>Zoom:</span>
          {[0.6, 0.7, 0.8, 0.9, 1.0].map(s => (
            <button
              key={s}
              onClick={() => handleZoomChange(s)}
              className={`px-2 py-0.5 rounded transition-all ${zoomScale === s ? 'bg-purple-600 text-white shadow-sm font-black' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              {s * 100}%
            </button>
          ))}
        </div>
      )}

      <div 
        className={isMobile ? "w-full h-full min-h-screen flex flex-col" : "relative mx-auto transition-all duration-200"}
        style={isMobile ? {} : { 
          height: `${844 * zoomScale}px`, 
          width: `${390 * zoomScale}px`,
          marginBottom: `${16 * zoomScale}px` 
        }}
      >
        <div 
          className={isMobile ? "w-full h-full flex flex-col" : "absolute left-0 top-0 w-[390px] h-[844px] origin-top-left transition-all duration-200"}
          style={isMobile ? {} : { transform: `scale(${zoomScale})` }}
        >
          {/* 3D phone case frame */}
          <div className={isMobile ? "w-full h-full flex flex-col justify-between overflow-hidden" : "relative w-[390px] h-[844px] bg-slate-900 rounded-[50px] p-[10px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-slate-750 flex flex-col justify-between overflow-hidden"}>
            {/* Notch / Speaker bar */}
            {!isMobile && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-40 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center gap-1.5 px-3">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-800/80 rounded-full border border-slate-700"></div>
              </div>
            )}

            {/* Side physical buttons */}
            {!isMobile && (
              <>
                <div className="absolute -left-1.5 top-28 w-1 h-12 bg-slate-800 rounded-r-md"></div>
                <div className="absolute -left-1.5 top-44 w-1 h-12 bg-slate-800 rounded-r-md"></div>
                <div className="absolute -right-1.5 top-36 w-1 h-16 bg-slate-800 rounded-l-md"></div>
              </>
            )}

            {/* Dynamic Display screen */}
            <div className={isMobile ? "w-full h-full flex-1 bg-slate-100 flex flex-col relative select-none" : "w-full h-full bg-slate-100 rounded-[40px] overflow-hidden flex flex-col relative border border-slate-950/20 select-none"}>
              {/* Status Bar */}
              {!isMobile && (
                <div className="h-11 bg-white px-6 pt-5 flex justify-between items-center text-xs font-semibold text-slate-800 z-40">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4 rotate-0" />
                  </div>
                </div>
              )}

          {/* Simulated SMS Push Banner */}
          {smsBanner && (
            <div className="absolute top-10 left-3 right-3 bg-slate-900/95 text-slate-100 rounded-2xl p-3 text-xs shadow-2xl z-50 border border-purple-500/50 flex flex-col gap-1">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  💬 MESSAGES • NOW
                </span>
                <span className="text-[8px] text-slate-400">GreenSecurID SMS Gateway</span>
              </div>
              <p className="text-[11px] font-bold leading-relaxed text-white">{smsBanner}</p>
              <div className="text-[8px] text-purple-300 font-mono mt-1 text-right italic">
                Click code or copy to verify below
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-14 left-4 right-4 bg-purple-600 text-white rounded-xl py-2 px-3 text-xs font-semibold text-center shadow-lg z-50 flex items-center justify-center gap-1.5 border border-purple-500 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              {toastMessage}
            </div>
          )}

          {/* =============================================================== */}
          {/* =================== LOCKED SECURITY SCREEN ===================== */}
          {/* =============================================================== */}
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col bg-purple-900 text-white p-6 justify-between relative overflow-y-auto">
              {/* Wallpaper element */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-800/80 via-purple-900 to-slate-950 z-0"></div>

              <div className="z-10 flex-1 flex flex-col justify-between space-y-6">
                <div className="text-center pt-2">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-full border border-purple-400/20 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-7 h-7 text-purple-300 animate-pulse" />
                  </div>
                  <h1 className="text-xl font-extrabold tracking-tight">Society Connect</h1>
                  <p className="text-[10px] text-purple-300 mt-0.5 font-medium">Smart Resident & Committee Portal</p>
                </div>

                {showOtpOverlay ? (
                  /* --- STEP 3: OTP SMS VERIFICATION --- */
                  <div className="space-y-4 animate-fadeIn my-auto text-center z-10">
                    <div>
                      <h2 className="text-sm font-extrabold text-purple-200 flex items-center justify-center gap-1.5">
                        <span>🛡️ SMS OTP Verification</span>
                        <span className="text-[7.5px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black border border-purple-400/10">MFA Sim</span>
                      </h2>
                      <p className="text-[10px] text-purple-300 mt-1 leading-relaxed">
                        A secure 4-digit verification code has been dispatched to your mobile. Enter it below to authorize this session:
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="relative max-w-[150px] mx-auto">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="••••"
                          value={userOtpInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setUserOtpInput(val);
                          }}
                          className="w-full text-center bg-white text-slate-900 border-2 border-purple-400 placeholder-slate-300 py-2.5 rounded-2xl text-xl font-black tracking-[0.5em] focus:ring-4 focus:ring-purple-500/30 focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOtpOverlay(false);
                            setUserOtpInput('');
                            setLoginEmailOrPhone('');
                            setLoginPasscode('');
                            setPassword('');
                            triggerToast('Login Cancelled');
                          }}
                          className="flex-1 py-2 bg-slate-950/40 hover:bg-slate-950/60 border border-purple-400/20 text-purple-200 rounded-xl text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
                        >
                          Verify Code
                        </button>
                      </div>
                    </form>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newCode = String(Math.floor(1000 + Math.random() * 9000));
                          setActiveOtpCode(newCode);
                          setUserOtpInput('');
                          setSmsBanner(`💬 GreenSecurID: Your new login OTP is [ ${newCode} ]. Valid for 5 mins.`);
                          
                          const newLog = {
                            id: `MFA-${Date.now()}`,
                            timestamp: new Date().toLocaleTimeString(),
                            action: 'MFA Resent',
                            details: `Simulated OTP regenerated. New Code: ${newCode}`,
                            status: 'Pending'
                          };
                          setMfaLogs(prev => [newLog, ...prev]);
                          triggerToast('New OTP Dispatched!');
                        }}
                        className="text-[10px] text-purple-300 hover:text-white underline font-bold"
                      >
                        🔄 Resend OTP Code
                      </button>
                    </div>

                    {/* Security Terminal Widget */}
                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-purple-500/20 text-left space-y-1.5 font-mono text-[8px] max-h-[140px] overflow-y-auto mt-4">
                      <p className="text-purple-400 font-extrabold uppercase border-b border-purple-500/10 pb-1 flex justify-between">
                        <span>🛡️ SECURITY TERMINAL LOGS</span>
                        <span className="text-[7px] text-emerald-400 animate-pulse">● SECURE GATEWAY</span>
                      </p>
                      {mfaLogs.length > 0 ? (
                        mfaLogs.map((log) => (
                          <div key={log.id} className="border-b border-white/5 pb-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-purple-300">[{log.timestamp}] {log.action}</span>
                              <span className={log.status === 'Success' ? 'text-emerald-400' : (log.status === 'Blocked' ? 'text-rose-400' : 'text-amber-400')}>{log.status}</span>
                            </div>
                            <p className="text-slate-400 text-[7.5px] mt-0.5 leading-tight">{log.details}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">No security events logged yet.</p>
                      )}
                    </div>
                  </div>
                ) : showPropertySelector ? (
                  /* --- STEP 2: SELECT MULTIPLE PROPERTY/FLAT --- */
                  <div className="space-y-4 animate-fadeIn my-auto">
                    <div className="text-center">
                      <h2 className="text-sm font-bold text-purple-200">Multiple Properties Found</h2>
                      <p className="text-[10px] text-purple-300 mt-1">We found more than one active unit registered to your account. Select which portal to enter:</p>
                    </div>

                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {matchedProperties.map((prop, idx) => {
                        const soc = societies.find(s => s.id === prop.SocietyId);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectProperty(prop)}
                            className="w-full bg-slate-950/50 border border-purple-400/20 hover:border-purple-400/60 p-3 rounded-xl flex flex-col gap-1.5 text-left transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xs font-black text-white truncate max-w-[180px]">
                                {soc ? soc.Name : prop.SocietyId}
                              </span>
                              <span className="text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-400/10">
                                {prop.Status}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[10px] text-purple-200 font-bold">
                              <span className="bg-purple-900/50 px-1.5 py-0.5 rounded text-white">Flat {prop.FlatNo}</span>
                              {prop.Wing && <span className="bg-slate-900/60 px-1.5 py-0.5 rounded text-purple-300">{prop.Wing}</span>}
                              <span className="text-[9px] text-purple-300 truncate max-w-[130px] ml-auto">
                                {prop.OwnerName}
                              </span>
                            </div>

                            {soc?.PostalAddress && (
                              <div className="text-[9px] text-purple-300/60 flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{soc.PostalAddress}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPropertySelector(false);
                        setMatchedProperties([]);
                        setPasswordError('');
                        setLoginEmailOrPhone('');
                        setLoginPasscode('');
                        setPassword('');
                      }}
                      className="w-full bg-purple-800/40 hover:bg-purple-800/60 border border-purple-400/20 text-purple-200 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                ) : showForgotPassword ? (
                  /* --- FORGOT PASSWORD / ACCESS CODE RESET --- */
                  <div className="space-y-4 my-auto pt-2 animate-fadeIn text-slate-200">
                    <div className="flex items-center gap-2 text-purple-300 border-b border-purple-800/30 pb-2 mb-2">
                      <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-xs font-black">Passcode Reset Engine</span>
                    </div>

                    {!forgotOtpSent ? (
                      /* Step A: Request OTP */
                      <div className="space-y-3">
                        <p className="text-[10px] text-purple-200 leading-normal">
                          Provide your registered Email or Contact Number. The Security Engine will generate a secure verification session.
                        </p>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">Select Account Role</label>
                          <div className="grid grid-cols-2 p-1 bg-slate-950/40 border border-purple-400/20 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setForgotRole('Admin')}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                forgotRole === 'Admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-300 hover:text-white'
                              }`}
                            >
                              Committee Admin
                            </button>
                            <button
                              type="button"
                              onClick={() => setForgotRole('Member')}
                              className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                forgotRole === 'Member' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-300 hover:text-white'
                              }`}
                            >
                              Resident Member
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">Registered Email or Phone</label>
                          <input
                            type="text"
                            placeholder="e.g. admin@society.com or +91..."
                            value={forgotEmailOrPhone}
                            onChange={(e) => {
                              setForgotEmailOrPhone(e.target.value);
                              setForgotError('');
                            }}
                            className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 px-3 py-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        {forgotError && (
                          <p className="text-rose-400 text-[10px] font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                            {forgotError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const inputVal = forgotEmailOrPhone.trim().toLowerCase();
                            if (!inputVal) {
                              setForgotError('Please enter your registered identifier.');
                              return;
                            }

                            let found = false;
                            if (forgotRole === 'Admin') {
                              if (inputVal.includes('greenwood') || inputVal.includes('greewood') || inputVal.includes('seabreeze') || inputVal.includes('sea_breeze') || inputVal.includes('royal_heights') || allMembers.some(m => m.Email?.toLowerCase() === inputVal && m.Role === 'Admin')) {
                                found = true;
                              }
                            } else {
                              found = allMembers.some(m => {
                                const emailMatch = m.Email && m.Email.toLowerCase() === inputVal;
                                const mPhoneClean = m.ContactNo ? normalizePhone(m.ContactNo) : '';
                                const inputPhoneClean = normalizePhone(inputVal);
                                return emailMatch || (mPhoneClean && inputPhoneClean && mPhoneClean === inputPhoneClean);
                              });
                            }

                            if (!found) {
                              setForgotError('This identifier is not registered in our secure database.');
                              return;
                            }

                            const code = String(Math.floor(1000 + Math.random() * 9000));
                            setForgotOtpCode(code);
                            setForgotOtpSent(true);
                            setForgotOtpInput('');
                            setNewPasscode('');
                            setForgotError('');
                            setSmsBanner(`💬 GreenSecurID: Reset OTP is [ ${code} ] for authorization reset. Valid for 10 mins.`);
                            triggerToast('Security Reset OTP Sent!');
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-2.5 rounded-xl text-xs shadow cursor-pointer text-center"
                        >
                          Send Verification OTP
                        </button>
                      </div>
                    ) : !forgotSuccess ? (
                      /* Step B: Verify OTP & Enter New Password */
                      <div className="space-y-3">
                        <p className="text-[10px] text-purple-200 leading-normal">
                          An OTP has been dispatched. Confirm the code and set your new passcode.
                        </p>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">4-Digit Security OTP</label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 1234"
                            value={forgotOtpInput}
                            onChange={(e) => setForgotOtpInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center bg-white border border-purple-300 text-slate-900 placeholder-slate-300 py-2 rounded-xl text-sm font-black tracking-widest focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">New Access Passcode</label>
                          <input
                            type="password"
                            placeholder="Enter new passcode"
                            value={newPasscode}
                            onChange={(e) => setNewPasscode(e.target.value)}
                            className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none"
                          />
                        </div>

                        {forgotError && (
                          <p className="text-rose-400 text-[10px] font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                            {forgotError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (forgotOtpInput !== forgotOtpCode) {
                              setForgotError('Invalid Security Verification OTP.');
                              return;
                            }
                            if (!newPasscode.trim()) {
                              setForgotError('Please enter a valid non-empty new passcode.');
                              return;
                            }

                            const targetKey = forgotEmailOrPhone.trim().toLowerCase();
                            const updated = { ...customPasscodes, [targetKey]: newPasscode.trim() };
                            setCustomPasscodes(updated);
                            localStorage.setItem('society_sim_custom_passcodes', JSON.stringify(updated));

                            setForgotSuccess(true);
                            setForgotError('');
                            triggerToast('Credentials updated successfully!');
                            setTimeout(() => {
                              setShowForgotPassword(false);
                              setForgotOtpSent(false);
                              setForgotSuccess(false);
                              setLoginEmailOrPhone(forgotEmailOrPhone);
                              if (forgotRole === 'Admin') {
                                setPassword(newPasscode);
                              } else {
                                setLoginPasscode(newPasscode);
                              }
                            }, 2000);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow cursor-pointer text-center"
                        >
                          Verify OTP & Reset Passcode
                        </button>
                      </div>
                    ) : (
                      /* Step C: Success Confirmation */
                      <div className="text-center py-6 space-y-3 animate-fadeIn">
                        <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">Reset Successful!</h4>
                          <p className="text-[10px] text-slate-300 mt-1">
                            Your secure passcode has been updated inside the sandbox.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotOtpSent(false);
                        setForgotSuccess(false);
                        setForgotError('');
                      }}
                      className="w-full text-center text-purple-300 hover:text-white text-[10px] font-bold underline cursor-pointer mt-1 block"
                    >
                      ← Return to Sign In Screen
                    </button>
                  </div>
                ) : (
                  /* --- STEP 1: LOGIN FORM --- */
                  <form onSubmit={handleLogin} className="space-y-4 my-auto pt-2">
                    {/* Role Switcher */}
                    <div className="grid grid-cols-2 p-1 bg-slate-950/40 border border-purple-400/20 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginRole('Admin');
                          setPasswordError('');
                          setLoginEmailOrPhone('');
                          setLoginPasscode('');
                          setPassword('');
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          loginRole === 'Admin'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-purple-300 hover:text-white'
                        }`}
                      >
                        Committee Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginRole('Member');
                          setPasswordError('');
                          setLoginEmailOrPhone('');
                          setLoginPasscode('');
                          setPassword('');
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          loginRole === 'Member'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-purple-300 hover:text-white'
                        }`}
                      >
                        Resident Member
                      </button>
                    </div>

                    {loginRole === 'Admin' ? (
                      /* Admin Form Fields */
                      <div className="space-y-3 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">Registered Admin Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="e.g. admin@greenwood.com"
                              value={loginEmailOrPhone}
                              onChange={(e) => {
                                setLoginEmailOrPhone(e.target.value);
                                setPasswordError('');
                              }}
                              className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                            />
                            <Mail className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">Admin Security Password</label>
                            <button
                              type="button"
                              onClick={() => {
                                setForgotRole('Admin');
                                setForgotEmailOrPhone(loginEmailOrPhone);
                                setShowForgotPassword(true);
                              }}
                              className="text-[9px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Enter your security password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError('');
                              }}
                              className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs text-center focus:ring-2 focus:ring-purple-500 focus:outline-none tracking-wider transition-all"
                            />
                            <Lock className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Resident Form Fields */
                      <div className="space-y-3 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">Registered Email or Contact No</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Email or +91 xxxxx xxxxx"
                              value={loginEmailOrPhone}
                              onChange={(e) => {
                                setLoginEmailOrPhone(e.target.value);
                                setPasswordError('');
                              }}
                              className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold transition-all"
                            />
                            <User className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">Personal Login Passcode</label>
                            <button
                              type="button"
                              onClick={() => {
                                setForgotRole('Member');
                                setForgotEmailOrPhone(loginEmailOrPhone);
                                setShowForgotPassword(true);
                              }}
                              className="text-[9px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
                            >
                              Forgot Passcode?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Enter your registered contact number"
                              value={loginPasscode}
                              onChange={(e) => {
                                setLoginPasscode(e.target.value);
                                setPasswordError('');
                              }}
                              className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs text-center focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                            />
                            <Lock className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                          </div>
                          <span className="text-[8px] text-purple-300/70 block leading-tight pt-1">
                            🔐 <strong>Security Info:</strong> By default, enter your registered contact number or passcode to instantly login.
                          </span>

                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-purple-400/25 mt-2.5">
                            <div className="flex items-center gap-1.5 text-left">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <div>
                                <span className="text-[9px] font-black text-white block">Multi-Factor SMS OTP</span>
                                <span className="text-[7.5px] text-purple-300 block">Simulate secure SMS passcode validation</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={mfaEnabled} 
                                onChange={(e) => setMfaEnabled(e.target.checked)} 
                                className="sr-only peer" 
                              />
                              <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[3px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {passwordError && (
                      <p className="text-rose-400 text-[10px] font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{passwordError}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-slate-100 text-purple-900 font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-purple-800" />
                      <span>{loginRole === 'Admin' ? 'Authorize Admin Sign In' : 'Resident Portal Sign In'}</span>
                    </button>
                  </form>
                )}

                <div className="text-center pb-2">
                  <div className="text-[9px] text-purple-300/40 font-mono">
                    Unified Portal Security Guard Active
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ===============================================================
            // ==================== MAIN SIMULATED APP =======================
            // ===============================================================
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
              {/* Header Bar */}
              <div className="bg-white px-3 py-2.5 border-b border-slate-150 flex justify-between items-center shadow-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="relative inline-block max-w-full">
                    <div className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-200/60 rounded-lg px-2 py-1 max-w-[170px] truncate whitespace-nowrap flex items-center gap-1 select-none" title={societyName}>
                      🏢 {societyName}
                    </div>
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 whitespace-nowrap truncate max-w-[170px]">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      {hasWings ? `${wingsList.length} Wings • ${buildingType}` : `${userRole === 'Admin' ? 'Admin Portal' : 'Member Portal'} • ${buildingType}`}
                    </p>
                    {lastSynced && (
                      <p className="text-[8px] text-purple-600/90 font-bold tracking-tight">Last synced: {lastSynced}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {userRole === 'Admin' && (
                    <button 
                      onClick={() => setShowAuditLogsModal(true)}
                      className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-full transition-colors relative flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="Admin Audit Logs"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    </button>
                  )}
                  {userRole === 'Admin' && (
                    <button 
                      onClick={() => {
                        setTempSocietyName(societyName);
                        setTempHasWings(hasWings);
                        setTempWingsList(wingsList.join(', '));
                        setTempPostalAddress(postalAddress);
                        setTempBuildingType(buildingType);
                        setTempStructureType(activeStructureType);
                        setTempTowers(JSON.parse(JSON.stringify(activeTowers)));
                        setShowSettingsModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="Society & Wings Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={handleManualRefresh}
                    disabled={syncing}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                    title="Pull-to-Refresh from Database"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-purple-600' : ''}`} />
                  </button>
                  {/* Property Switcher for Multi-Flat Users */}
                  {userRole === 'Member' && (() => {
                    const normLoggedEmail = loggedInUserEmail.trim().toLowerCase();
                    const myMatchingFlats = allMembers.filter(m => {
                      const emailMatch = m.Email && normLoggedEmail && m.Email.trim().toLowerCase() === normLoggedEmail;
                      const phoneMatch = m.ContactNo && loggedInUserContact && normalizePhone(m.ContactNo) === normalizePhone(loggedInUserContact);
                      return emailMatch || phoneMatch;
                    });
                    if (myMatchingFlats.length > 1) {
                      return (
                        <div className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg px-2 py-1 shadow-2xs">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0 animate-pulse" />
                          <select
                            value={`${activeSocietyId}:${loggedInMemberFlat}`}
                            onChange={(e) => {
                              const [socId, flatNo] = e.target.value.split(':');
                              setLoggedInMemberFlat(flatNo);
                              localStorage.setItem('society_sim_member_flat', flatNo);
                              if (onChangeActiveSociety && socId) {
                                onChangeActiveSociety(socId);
                                localStorage.setItem('active_society_id', socId);
                              }
                              triggerToast(`Switched active unit to Flat ${flatNo} (${societies?.find(s => s.id === socId)?.Name || socId})`);
                            }}
                            className="bg-transparent border-none text-[10px] font-black focus:outline-none cursor-pointer text-purple-700 py-0.5"
                          >
                            {myMatchingFlats.map((prop, idx) => {
                              const soc = societies?.find(s => s.id === prop.SocietyId);
                              return (
                                <option key={idx} value={`${prop.SocietyId}:${prop.FlatNo}`} className="text-slate-800 bg-white font-sans font-bold">
                                  {soc ? soc.Name : prop.SocietyId} • Flat {prop.FlatNo}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 border border-rose-200/50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold px-2 py-1 shadow-2xs"
                    title="Lock Application"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Loader overlay for database sync */}
              {syncing && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-600 mt-2">Syncing with Database...</span>
                </div>
              )}

              {/* Tab Workspace Panel */}
              <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
                
                {/* ----------------- TABS: DASHBOARD ----------------- */}
                {currentTab === 'dashboard' && (
                  <div className="space-y-3 pb-4 animate-fade-in">
                    {/* Society Profile Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white p-3 py-2.5 rounded-xl shadow-sm border border-purple-950/20 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] pointer-events-none">
                        <Building2 className="w-24 h-24 text-purple-400" />
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[7.5px] font-black uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-400/10 tracking-wider">
                              {buildingType}
                            </span>
                            {hasWings && (
                              <span className="text-[7.5px] font-black uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/10 tracking-wider">
                                {wingsList.length} Wings
                              </span>
                            )}
                          </div>
                          <h2 className="text-xs font-black mt-1 tracking-tight text-white truncate" title={societyName}>{societyName}</h2>
                        </div>
                        <Building2 className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-purple-800/20 space-y-1 text-[9px] text-purple-200">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-purple-300 flex-shrink-0 mt-0.5" />
                          <p className="font-semibold leading-normal text-purple-200/90 truncate" title={postalAddress}>{postalAddress}</p>
                        </div>
                        {hasWings && (
                          <div className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-purple-300 flex-shrink-0" />
                            <p className="font-semibold text-purple-200/90 truncate">
                              Blocks: <span className="font-mono font-bold text-white">{wingsList.join(', ')}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {userRole === 'Member' ? (
                      /* RESIDENT MEMBER DASHBOARD */
                      <>
                        {/* Resident Dues Status Banner */}
                        {(() => {
                          const currentMember = members.find(m => m.FlatNo === loggedInMemberFlat) || {
                            FlatNo: loggedInMemberFlat,
                            OwnerName: 'Resident',
                            Balance: 0,
                            Status: 'Owner'
                          };
                          const bal = currentMember.Balance;
                          return (
                            <div className={`p-4 rounded-2xl border text-slate-800 shadow-sm relative overflow-hidden ${
                              bal > 0 
                                ? 'bg-rose-50 border-rose-100 text-rose-950' 
                                : (bal < 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800')
                            }`}>
                              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">YOUR RESIDENT UNIT ACCOUNT</p>
                              <div className="flex justify-between items-end mt-2">
                                <div>
                                  <h3 className="text-sm font-extrabold text-slate-800">Flat {loggedInMemberFlat}</h3>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Primary Owner: <strong className="text-slate-700">{currentMember.OwnerName}</strong></p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-lg font-black block ${bal > 0 ? 'text-rose-600' : (bal < 0 ? 'text-emerald-600' : 'text-slate-600')}`}>
                                    {bal > 0 ? `₹${bal.toLocaleString()}` : (bal < 0 ? `-₹${Math.abs(bal).toLocaleString()}` : 'Clear')}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Dues</span>
                                </div>
                              </div>

                              {/* Multi-Flat quick swapper inside active society */}
                              {(() => {
                                const normLoggedEmail = loggedInUserEmail.trim().toLowerCase();
                                const myFlatsInActiveSociety = allMembers.filter(m => {
                                  if (m.SocietyId !== activeSocietyId) return false;
                                  const emailMatch = m.Email && normLoggedEmail && m.Email.trim().toLowerCase() === normLoggedEmail;
                                  const phoneMatch = m.ContactNo && loggedInUserContact && normalizePhone(m.ContactNo) === normalizePhone(loggedInUserContact);
                                  return emailMatch || phoneMatch;
                                });
                                if (myFlatsInActiveSociety.length > 1) {
                                  return (
                                    <div className="mt-3 pt-3 border-t border-slate-150/80 flex flex-col gap-1.5">
                                      <p className="text-[8px] text-slate-500 font-black tracking-wide uppercase flex items-center gap-1">
                                        <Home className="w-3 h-3 text-purple-600" />
                                        <span>Your Flats in this Society (Click to Switch):</span>
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {myFlatsInActiveSociety.map((f) => (
                                          <button
                                            key={f.FlatNo}
                                            onClick={() => {
                                              setLoggedInMemberFlat(f.FlatNo);
                                              localStorage.setItem('society_sim_member_flat', f.FlatNo);
                                              triggerToast(`Active View: Flat ${f.FlatNo}`);
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                              f.FlatNo === loggedInMemberFlat
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100/50'
                                            }`}
                                          >
                                            Flat {f.FlatNo}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {bal > 0 ? (
                                <div className="mt-3.5 pt-3.5 border-t border-rose-100 flex gap-2">
                                  <button
                                    onClick={() => {
                                      setMemberPayAmount(String(bal));
                                      setShowMemberPayModal(true);
                                    }}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-[10px] text-center shadow-xs transition-colors cursor-pointer"
                                  >
                                    💳 Pay Outstanding Dues
                                  </button>
                                  <button
                                    onClick={() => setCurrentTab('amenities')}
                                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-[10px] text-center shadow-xs transition-colors cursor-pointer"
                                  >
                                    📅 Book Amenity
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex gap-2">
                                  <button
                                    onClick={() => setCurrentTab('amenities')}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-[10px] text-center shadow-xs transition-colors cursor-pointer"
                                  >
                                    📅 Book Clubhouse & Shared Amenities
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Multiple Properties Switcher / List */}
                        {(() => {
                          const normLoggedEmail = loggedInUserEmail.trim().toLowerCase();
                          const myMatchingFlats = allMembers.filter(m => {
                            const emailMatch = m.Email && normLoggedEmail && m.Email.trim().toLowerCase() === normLoggedEmail;
                            const phoneMatch = m.ContactNo && loggedInUserContact && normalizePhone(m.ContactNo) === normalizePhone(loggedInUserContact);
                            return emailMatch || phoneMatch;
                          });

                          if (myMatchingFlats.length > 1) {
                            return (
                              <div id="multi-property-dashboard-card" className="bg-purple-50/50 border border-purple-200 p-3 rounded-2xl shadow-2xs space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-purple-850 uppercase tracking-wider flex items-center gap-1">
                                    🔑 My Registered Properties ({myMatchingFlats.length})
                                  </span>
                                  <span className="text-[7.5px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                                    Multi-Property Owner
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-tight">
                                  You own multiple units in our managed societies. Tap any property below to switch your active view:
                                </p>
                                <div className="grid grid-cols-1 gap-1.5 mt-1">
                                  {myMatchingFlats.map((prop, idx) => {
                                    const soc = societies.find(s => s.id === prop.SocietyId);
                                    const isActive = prop.SocietyId === activeSocietyId && prop.FlatNo === loggedInMemberFlat;
                                    return (
                                      <button
                                        key={idx}
                                        id={`dashboard-prop-switch-${idx}`}
                                        onClick={() => handleSelectProperty(prop)}
                                        className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between text-[10px] cursor-pointer ${
                                          isActive
                                            ? 'bg-purple-600 border-purple-700 text-white font-extrabold shadow-sm'
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                                        }`}
                                      >
                                        <div className="min-w-0 flex-1 pr-2">
                                          <div className="flex items-center gap-1">
                                            <span className="font-extrabold truncate max-w-[140px]">{soc ? soc.Name : prop.SocietyId}</span>
                                            {isActive && (
                                              <span className="text-[8px] bg-white text-purple-700 px-1 py-0.5 rounded font-black uppercase leading-none shrink-0 scale-90">
                                                Active
                                              </span>
                                            )}
                                          </div>
                                          <div className={`text-[8px] ${isActive ? 'text-purple-200' : 'text-slate-500'} mt-0.5`}>
                                            Flat {prop.FlatNo} {prop.Tower ? `• ${prop.Tower} - ${prop.Wing}` : (prop.Wing ? `• ${prop.Wing}` : '')}
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className={`font-mono text-[9px] font-bold ${isActive ? 'text-white' : (prop.Balance > 0 ? 'text-rose-600' : 'text-emerald-600')}`}>
                                            {prop.Balance > 0 ? `Dues: ₹${prop.Balance.toLocaleString()}` : 'Paid'}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Recent Notices Bulletin for member */}
                        <div className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs space-y-2">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LATEST BULLETINS</span>
                            <button onClick={() => setCurrentTab('notices')} className="text-[9px] font-bold text-purple-600 hover:underline">View All</button>
                          </div>
                          <div className="space-y-1.5">
                            {notices.slice(0, 3).map((notice) => (
                              <div 
                                key={notice.id}
                                onClick={() => setActiveNoticeDetail(notice)}
                                className="p-2 bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 rounded-xl cursor-pointer transition-all flex justify-between items-center text-[10px]"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="p-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex-shrink-0">
                                    <Megaphone className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <h5 className="font-extrabold text-slate-800 truncate">{notice.Title}</h5>
                                    <span className="text-[8px] text-slate-400 font-bold">{notice.Date} • {notice.Category}</span>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            ))}
                            {notices.length === 0 && (
                              <p className="text-center text-[10px] text-slate-400 py-3">No active announcements</p>
                            )}
                          </div>
                        </div>

                        {/* Helpdesk Ticket Shortcut */}
                        <div className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs space-y-2">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">YOUR HELPDESK ISSUES</span>
                            <button onClick={() => setCurrentTab('complaints')} className="text-[9px] font-bold text-purple-600 hover:underline">View History</button>
                          </div>
                          <div className="space-y-1.5">
                            {complaints.filter(c => c.FlatNo === loggedInMemberFlat).slice(0, 2).map((comp) => (
                              <div 
                                key={comp.id}
                                onClick={() => setActiveComplaintDetail(comp)}
                                className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:border-purple-200 cursor-pointer transition-colors flex justify-between items-center text-[10px]"
                              >
                                <div>
                                  <h5 className="font-extrabold text-slate-800 line-clamp-1">{comp.Title}</h5>
                                  <span className="text-[8px] text-slate-400 font-bold">Priority: {comp.Urgency} • status: {comp.Status}</span>
                                </div>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                                  comp.Status === 'Resolved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : (comp.Status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                                }`}>
                                  {comp.Status}
                                </span>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setCompFlatNo(loggedInMemberFlat);
                                setShowComplaintForm(true);
                              }}
                              className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-100 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> File New Helpdesk complaint
                            </button>
                          </div>
                        </div>

                        {/* Resident Gatekeeper & Visitor Management Simulator */}
                        <div id="visitor-manager-resident-card" className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs space-y-2">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              Gatekeeper Visitor Logs
                            </span>
                            <button
                              onClick={() => {
                                setNewVisName('');
                                setNewVisContact('');
                                setNewVisVehicle('');
                                setNewVisPurpose('Delivery');
                                setShowAddVisitorModal(true);
                              }}
                              className="text-[9px] font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Pre-Approve Guest
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {/* Pending Approvals (High Visibility Alerts) */}
                            {visitors.filter(v => v.FlatNo === loggedInMemberFlat && v.Status === 'Pending Approval' && v.SocietyId === activeSocietyId).map(v => (
                              <div key={v.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-1.5 animate-pulse shadow-sm">
                                <div className="flex justify-between items-start text-[10px]">
                                  <div className="min-w-0 flex-1">
                                    <span className="bg-amber-150 text-amber-900 border border-amber-200 font-extrabold text-[7.5px] px-1.5 py-0.5 rounded uppercase tracking-wide inline-block leading-none">
                                      🔔 Gate Authorization Request
                                    </span>
                                    <h5 className="font-extrabold text-slate-900 mt-1.5 truncate">{v.VisitorName}</h5>
                                    <p className="text-[8.5px] text-slate-600 mt-0.5">Purpose: <strong className="text-slate-800">{v.Purpose}</strong> {v.VehicleNo ? `• Vehicle: ${v.VehicleNo}` : ''}</p>
                                  </div>
                                  <span className="text-[7.5px] text-slate-400 font-mono shrink-0">
                                    {new Date(v.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 mt-1">
                                  <button
                                    onClick={() => {
                                      if (onUpdateVisitor) {
                                        onUpdateVisitor(v.id, 'Approved', members.find(m => m.FlatNo === loggedInMemberFlat)?.OwnerName || 'Resident');
                                        triggerToast('Visitor access APPROVED at the gate!');
                                      }
                                    }}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[9px] transition-colors cursor-pointer text-center"
                                  >
                                    Approve Entry
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onUpdateVisitor) {
                                        onUpdateVisitor(v.id, 'Denied', members.find(m => m.FlatNo === loggedInMemberFlat)?.OwnerName || 'Resident');
                                        triggerToast('Visitor access DENIED!');
                                      }
                                    }}
                                    className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[9px] transition-colors cursor-pointer text-center"
                                  >
                                    Deny Entry
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Normal Logs List */}
                            <div className="space-y-1">
                              {(() => {
                                const myVisitors = visitors.filter(v => v.FlatNo === loggedInMemberFlat && v.Status !== 'Pending Approval' && v.SocietyId === activeSocietyId);
                                const pendingCount = visitors.filter(v => v.FlatNo === loggedInMemberFlat && v.Status === 'Pending Approval' && v.SocietyId === activeSocietyId).length;
                                if (myVisitors.length === 0 && pendingCount === 0) {
                                  return (
                                    <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">No active visitor logs or pre-approvals</p>
                                  );
                                }
                                return myVisitors.slice(0, 3).map(v => (
                                  <div key={v.id} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-[10px]">
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="font-extrabold text-slate-800 truncate">{v.VisitorName}</h5>
                                        {v.AccessToken && (
                                          <span className="text-[7.5px] bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                            🔑 {v.AccessToken}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[8px] text-slate-400 mt-0.5 font-semibold">
                                        {v.Purpose} • {v.CheckOutTime ? `Checked Out: ${new Date(v.CheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `In: ${new Date(v.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                      </p>
                                    </div>
                                    <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                      v.Status === 'Approved'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : v.Status === 'Pre-Approved'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                        : v.Status === 'Checked Out'
                                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                      {v.Status}
                                    </span>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* COMMITTEE ADMIN DASHBOARD */
                      <>
                        {/* Broadcast Notice Quick Action */}
                        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl text-white shadow-xs flex items-center justify-between">
                          <div className="max-w-[190px]">
                            <span className="text-[7px] font-black tracking-widest bg-white/20 px-1.5 py-0.5 rounded-full uppercase">Quick Action</span>
                            <h4 className="text-[10px] font-black mt-1">Broadcast Notice</h4>
                            <p className="text-[7.5px] text-purple-100 font-medium mt-0.5 leading-snug">Announce general meetings, maintenance schedules, or security alerts.</p>
                          </div>
                          <button
                            onClick={() => {
                              setNewNoticeTitle('');
                              setNewNoticeContent('');
                              setNewNoticeCategory('General');
                              setIsBroadcastModalOpen(true);
                            }}
                            id="dashboard-broadcast-notice-btn"
                            className="bg-white text-indigo-600 hover:bg-slate-50 active:scale-95 px-2.5 py-1.5 rounded-xl text-[8.5px] font-extrabold transition-all flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <Megaphone className="w-3 h-3 text-indigo-500 animate-pulse" />
                            <span>Post Notice</span>
                          </button>
                        </div>

                        {/* Financial Summary Cards */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="bg-emerald-50 border border-emerald-100/50 p-2 rounded-xl text-center shadow-2xs">
                            <span className="text-[8px] text-emerald-600 uppercase font-extrabold tracking-wider block">Total Income</span>
                            <span className="text-[11px] font-black text-emerald-800">₹{totalIncome.toLocaleString()}</span>
                          </div>
                          <div className="bg-rose-50 border border-rose-100/50 p-2 rounded-xl text-center shadow-2xs">
                            <span className="text-[8px] text-rose-600 uppercase font-extrabold tracking-wider block">Total Expenses</span>
                            <span className="text-[11px] font-black text-rose-800">₹{totalExpenses.toLocaleString()}</span>
                          </div>
                          <div className={`p-2 rounded-xl text-center shadow-2xs border ${
                            netReserve >= 0 
                              ? 'bg-purple-50 border-purple-100/50 text-purple-800' 
                              : 'bg-amber-50 border-amber-100/50 text-amber-800'
                          }`}>
                            <span className="text-[8px] uppercase font-extrabold tracking-wider block">Cash on Hand</span>
                            <span className="text-[11px] font-black">₹{netReserve.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Chart Container */}
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                          <div className="flex justify-between items-center mb-1.5 px-0.5">
                            <div>
                              <h4 className="text-[10px] font-extrabold text-slate-700">Financial Performance</h4>
                              <p className="text-[8px] text-slate-400 font-semibold">Monthly Income vs. Outflow breakdown</p>
                            </div>
                            <span className="text-[7px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full border border-purple-100/50 uppercase">Live Trend</span>
                          </div>
                          
                          <div className="w-full h-[140px] text-[8px] -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={monthlyChartData}
                                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#64748b" 
                                  fontSize={8}
                                  tickLine={false} 
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="#64748b" 
                                  fontSize={8}
                                  tickLine={false} 
                                  axisLine={false}
                                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000) + 'k' : val}`}
                                />
                                <Tooltip 
                                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '9px', padding: '4px 8px' }}
                                  labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Expenses" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Overdue Balances Breakdown Visualization */}
                        {members.some(m => m.Balance > 0) && (
                          <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                            <div className="flex justify-between items-center mb-1.5 px-0.5">
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-700">Top Unpaid Balances Breakdown</h4>
                                <p className="text-[8px] text-slate-400 font-semibold">Highest outstanding dues currently pending recovery</p>
                              </div>
                              <span className="text-[7px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full border border-rose-100 uppercase">Attention</span>
                            </div>
                            
                            <div className="w-full h-[120px] text-[8px] -ml-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  layout="vertical"
                                  data={members
                                    .filter(m => m.Balance > 0)
                                    .sort((a, b) => b.Balance - a.Balance)
                                    .slice(0, 5)
                                    .map(m => ({
                                      unit: `Flat ${m.FlatNo}`,
                                      dues: m.Balance
                                    }))}
                                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                  <XAxis type="number" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
                                  <YAxis dataKey="unit" type="category" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
                                  <Tooltip
                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Outstanding']}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '9px', padding: '4px 8px' }}
                                  />
                                  <Bar dataKey="dues" fill="#f43f5e" radius={[0, 3, 3, 0]} barSize={10} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Dues Clearance & Distribution Visual Summary */}
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                          <div className="flex justify-between items-center mb-1.5 px-0.5">
                            <div>
                              <h4 className="text-[10px] font-extrabold text-slate-700">Dues Collection & Clearance Summary</h4>
                              <p className="text-[8px] text-slate-400 font-semibold">Cleared vs. Outstanding billing distribution</p>
                            </div>
                            <span className="text-[7px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full border border-indigo-100/50 uppercase">Distribution</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 items-center">
                            {/* Outstanding Dues Visual Summary Block */}
                            <div className="space-y-1.5">
                              <div className="bg-rose-50 border border-rose-100 p-1.5 rounded-xl">
                                <span className="text-[7px] text-rose-500 uppercase font-black tracking-wider block">Outstanding Dues</span>
                                <span className="text-[11px] font-black text-rose-600">₹{totalPendingDues.toLocaleString()}</span>
                                <span className="text-[6.5px] text-slate-400 font-semibold block mt-0.5">Total due from {pendingCount} flats</span>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-xl">
                                <span className="text-[7px] text-emerald-600 uppercase font-black tracking-wider block">Prepaid Credits</span>
                                <span className="text-[11px] font-black text-emerald-600">₹{totalPrepaidDues.toLocaleString()}</span>
                                <span className="text-[6.5px] text-slate-400 font-semibold block mt-0.5 font-sans">Advance payments</span>
                              </div>
                            </div>

                            {/* Recharts Pie Chart */}
                            <div className="relative flex flex-col items-center justify-center h-[90px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Cleared', value: clearedCount || 1, color: '#10b981' },
                                      { name: 'Pending', value: pendingCount || 0, color: '#f43f5e' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={20}
                                    outerRadius={35}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f43f5e" />
                                  </Pie>
                                  <Tooltip
                                    formatter={(value: any, name: any) => [`${value} Flats`, name]}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '8px', padding: '2px 6px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                              {/* Inner Label for Percent */}
                              <div className="absolute text-center">
                                <span className="text-[10px] font-black text-slate-700">
                                  {members.length > 0 ? ((clearedCount / members.length) * 100).toFixed(0) : '0'}%
                                </span>
                                <span className="text-[6px] text-slate-400 font-extrabold uppercase block leading-none">Cleared</span>
                              </div>
                            </div>
                          </div>

                          {/* Legend / Stats line */}
                          <div className="flex items-center justify-around border-t border-slate-100 pt-2 mt-1.5 text-[8px] font-extrabold">
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              <span>Cleared: {clearedCount} flats</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                              <span>Pending: {pendingCount} flats</span>
                            </div>
                          </div>
                        </div>

                        {/* Expense Categories Breakdown */}
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                          <h4 className="text-[10px] font-extrabold text-slate-700 mb-1.5 px-0.5">Expense Categories Breakdown</h4>
                          <div className="space-y-1 max-h-[115px] overflow-y-auto pr-0.5 scrollbar-thin">
                            {categoryData.length > 0 ? (
                              categoryData.map((cat, i) => {
                                const percent = ((cat.value / totalExpenses) * 100).toFixed(0);
                                return (
                                  <div key={cat.name} className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                      <span className="font-semibold text-slate-600">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-800">₹{cat.value.toLocaleString()}</span>
                                      <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold">{percent}%</span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-center text-[10px] text-slate-400 py-3">No expenses recorded yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Upcoming Dues (Members with negative balance) */}
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                          <div className="flex justify-between items-center mb-1.5 px-0.5">
                            <div>
                              <h4 className="text-[10px] font-extrabold text-slate-700">Upcoming Dues (Advance Credits)</h4>
                              <p className="text-[8px] text-slate-400 font-semibold">Members with prepaid balances or advance credits</p>
                            </div>
                            <span className="text-[7px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100/50 uppercase">Prepaid</span>
                          </div>
                          <div className="space-y-1 max-h-[115px] overflow-y-auto pr-0.5 scrollbar-thin">
                            {(() => {
                              const creditMembers = (Array.isArray(members) ? members : []).filter(m => {
                                if (!m) return false;
                                const bal = parseFloat(String(m.Balance || 0)) || 0;
                                return bal < 0;
                              });
                              return creditMembers.length > 0 ? (
                                creditMembers.map((m) => {
                                  const bal = parseFloat(String(m.Balance || 0)) || 0;
                                  return (
                                    <div key={m.FlatNo} className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 flex items-center justify-center font-bold text-[9px]">
                                          {m.FlatNo}
                                        </span>
                                        <span className="font-semibold text-slate-600">{m.OwnerName}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-emerald-600">₹{Math.abs(bal).toLocaleString()}</span>
                                        <span className="text-[7px] text-slate-400 font-medium block">Credit Balance</span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-center text-[10px] text-slate-400 py-3">No members with advance credits currently.</p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Automated Billing & Maintenance Invoicing Engine */}
                        <div id="admin-billing-engine-card" className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs space-y-3">
                          <div className="flex justify-between items-center px-0.5">
                            <div>
                              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                <span className="p-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">⚡</span>
                                Automated Billing Invoicing Engine
                              </h4>
                              <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Generate monthly recurring maintenance bills for all resident units</p>
                            </div>
                            <span className="text-[7.5px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                              Live Run
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-2 text-[10px]">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="font-extrabold text-slate-600 block">Billing Month</label>
                                <select
                                  value={billingMonth}
                                  onChange={(e) => setBillingMonth(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                >
                                  <option value="July 2026">July 2026</option>
                                  <option value="August 2026">August 2026</option>
                                  <option value="September 2026">September 2026</option>
                                  <option value="October 2026">October 2026</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="font-extrabold text-slate-600 block">Base Maintenance (₹)</label>
                                <input
                                  type="number"
                                  value={billBase}
                                  onChange={(e) => setBillBase(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-bold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Water Dues (₹)</label>
                                <input
                                  type="number"
                                  value={billWater}
                                  onChange={(e) => setBillWater(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-medium text-[9.5px]"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Security Dues (₹)</label>
                                <input
                                  type="number"
                                  value={billSecurity}
                                  onChange={(e) => setBillSecurity(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-medium text-[9.5px]"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Parking/Utility (₹)</label>
                                <input
                                  type="number"
                                  value={billParking}
                                  onChange={(e) => setBillParking(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-medium text-[9.5px]"
                                />
                              </div>
                            </div>

                            {/* Live Invoice Breakdown Calculations */}
                            {(() => {
                              const baseVal = parseInt(billBase) || 0;
                              const waterVal = parseInt(billWater) || 0;
                              const secVal = parseInt(billSecurity) || 0;
                              const parkVal = parseInt(billParking) || 0;
                              const totalPerUnit = baseVal + waterVal + secVal + parkVal;
                              const estimatedTotalCollection = totalPerUnit * (members.length || 0);

                              return (
                                <div className="bg-indigo-50/55 p-2 rounded-lg border border-indigo-100 flex justify-between items-center text-[9px] mt-1 text-indigo-950 font-semibold">
                                  <div>
                                    <span className="block">Dues / Unit: <strong>₹{totalPerUnit.toLocaleString()}</strong></span>
                                    <span className="text-[7.5px] text-slate-500 font-normal font-sans">Base + Water + Security + Util</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block text-indigo-700 font-sans">Total Run Collection: <strong>₹{estimatedTotalCollection.toLocaleString()}</strong></span>
                                    <span className="text-[7.5px] text-slate-500 font-normal">For {members.length} Active Flats</span>
                                  </div>
                                </div>
                              );
                            })()}

                            <button
                              type="button"
                              onClick={() => {
                                const baseVal = parseInt(billBase) || 0;
                                const waterVal = parseInt(billWater) || 0;
                                const secVal = parseInt(billSecurity) || 0;
                                const parkVal = parseInt(billParking) || 0;
                                const totalPerUnit = baseVal + waterVal + secVal + parkVal;

                                if (totalPerUnit <= 0) {
                                  triggerToast('Please set a valid invoice total amount!');
                                  return;
                                }

                                if (onAddInvoice) {
                                  let count = 0;
                                  members.forEach(m => {
                                    onAddInvoice({
                                      SocietyId: activeSocietyId,
                                      FlatNo: m.FlatNo,
                                      OwnerName: m.OwnerName,
                                      BillMonth: billingMonth,
                                      BaseAmount: baseVal,
                                      WaterCharges: waterVal,
                                      SecurityCharges: secVal,
                                      ParkingCharges: parkVal,
                                      TotalAmount: totalPerUnit,
                                      DueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                      Status: 'Unpaid',
                                      IssuedDate: new Date().toISOString().split('T')[0]
                                    });
                                    count++;
                                  });

                                  if (onAddNotice) {
                                    onAddNotice({
                                      title: `${billingMonth} Maintenance Dues Invoiced`,
                                      category: 'Maintenance',
                                      content: `Automated maintenance invoices for ${billingMonth} have been successfully generated and sent to all units.\n\nTotal Due Per Unit: ₹${totalPerUnit.toLocaleString()}\n• Base Rate: ₹${baseVal}\n• Water Charges: ₹${waterVal}\n• Security Guard Dues: ₹${secVal}\n• Parking/Utility: ₹${parkVal}\n\nPlease clear your pending dues within 15 days of invoice date to avoid late payment fee penalties. Thank you.`
                                    });
                                  }

                                  triggerToast(`Successfully generated ${count} invoices for ${billingMonth}!`);
                                } else {
                                  triggerToast('Billing service unavailable');
                                }
                              }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer text-center text-[10px]"
                            >
                              ⚡ Execute Automated Invoicing Run
                            </button>
                          </div>
                        </div>

                        {/* Gatekeeper & Visitor Management Simulator */}
                        <div id="admin-gatekeeper-simulator-card" className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs space-y-3">
                          <div className="flex justify-between items-center px-0.5">
                            <div>
                              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                Simulated Gatekeeper Console
                              </h4>
                              <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Simulate check-ins at the security cabin</p>
                            </div>
                            <span className="text-[7px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                              Active Terminal
                            </span>
                          </div>

                          {/* Quick Check-in form */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[10px] space-y-2">
                            <h5 className="font-black text-slate-700 text-[9px] uppercase tracking-wider mb-1">New Gate Check-In Entry</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Visitor Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Rajesh Kumar"
                                  value={newVisName}
                                  onChange={(e) => setNewVisName(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                />
                              </div>

                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Target Flat Unit</label>
                                <select
                                  value={newVisFlatNo}
                                  onChange={(e) => setNewVisFlatNo(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                >
                                  <option value="">-- Choose Flat --</option>
                                  {members.map(m => (
                                    <option key={m.id} value={m.FlatNo}>Flat {m.FlatNo} ({m.OwnerName})</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="space-y-0.5">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Purpose</label>
                                <select
                                  value={newVisPurpose}
                                  onChange={(e) => setNewVisPurpose(e.target.value)}
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                >
                                  <option value="Delivery">Delivery</option>
                                  <option value="Guest">Guest</option>
                                  <option value="Cab">Uber / Ola</option>
                                  <option value="Services">Services</option>
                                  <option value="Maintenance">Maintenance</option>
                                </select>
                              </div>

                              <div className="space-y-0.5 col-span-2">
                                <label className="font-bold text-slate-500 text-[8.5px] block">Contact No & Vehicle No</label>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder="Contact (optional)"
                                    value={newVisContact}
                                    onChange={(e) => setNewVisContact(e.target.value)}
                                    className="flex-1 bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans text-[9px]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="MH-12-XX-0000"
                                    value={newVisVehicle}
                                    onChange={(e) => setNewVisVehicle(e.target.value)}
                                    className="w-[85px] bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-mono text-[9px]"
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!newVisName.trim()) {
                                  triggerToast('Visitor Name is required!');
                                  return;
                                }
                                if (!newVisFlatNo) {
                                  triggerToast('Please select a target Flat No!');
                                  return;
                                }

                                if (onAddVisitor) {
                                  onAddVisitor({
                                    VisitorName: newVisName.trim(),
                                    Purpose: newVisPurpose,
                                    ContactNo: newVisContact.trim() || 'Not Provided',
                                    FlatNo: newVisFlatNo,
                                    VehicleNo: newVisVehicle.trim() || undefined,
                                    Status: 'Pending Approval',
                                    CheckInTime: new Date().toISOString(),
                                    SocietyId: activeSocietyId
                                  });

                                  triggerToast(`Logged check-in entry for ${newVisName.trim()} (Flat ${newVisFlatNo})!`);
                                  setNewVisName('');
                                  setNewVisContact('');
                                  setNewVisVehicle('');
                                } else {
                                  triggerToast('Visitor service unavailable');
                                }
                              }}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer text-center text-[9.5px]"
                            >
                              🔔 Register Entry & Alert Resident Host
                            </button>
                          </div>

                          {/* Visitor live status listings */}
                          <div className="space-y-1.5">
                            <h5 className="font-black text-slate-700 text-[9px] uppercase tracking-wider px-0.5">Live Visitors on Site</h5>
                            <div className="space-y-1">
                              {(() => {
                                const activeVisitors = visitors.filter(v => v.SocietyId === activeSocietyId);
                                if (activeVisitors.length === 0) {
                                  return (
                                    <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">No visitor logs recorded yet</p>
                                  );
                                }
                                return activeVisitors.slice(0, 4).map(v => (
                                  <div key={v.id} className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-[10px]">
                                    <div className="min-w-0 flex-1 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="font-extrabold text-slate-800 truncate max-w-[120px]">{v.VisitorName}</h5>
                                        <span className="text-[7.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black font-sans uppercase">
                                          Flat {v.FlatNo}
                                        </span>
                                      </div>
                                      <p className="text-[8px] text-slate-400 mt-0.5">
                                        Purpose: <strong>{v.Purpose}</strong> {v.CheckOutTime ? `• Out: ${new Date(v.CheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `• In: ${new Date(v.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right flex items-center gap-1.5">
                                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                                        v.Status === 'Approved'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                          : v.Status === 'Pending Approval'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                                          : v.Status === 'Checked Out'
                                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                                      }`}>
                                        {v.Status === 'Pending Approval' ? 'Awaiting Host' : v.Status}
                                      </span>

                                      {/* Checkout Action if status is Approved */}
                                      {v.Status === 'Approved' && onUpdateVisitor && (
                                        <button
                                          onClick={() => {
                                            onUpdateVisitor(v.id, 'Checked Out');
                                            triggerToast('Visitor checked out successfully!');
                                          }}
                                          className="text-[8px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold cursor-pointer"
                                        >
                                          Check Out
                                        </button>
                                      )}

                                      {/* Admin Override if status is Pending */}
                                      {v.Status === 'Pending Approval' && onUpdateVisitor && (
                                        <div className="flex gap-0.5">
                                          <button
                                            onClick={() => {
                                              onUpdateVisitor(v.id, 'Approved', 'Admin Override');
                                              triggerToast('Admin Force-Approved entry!');
                                            }}
                                            className="text-[7.5px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black cursor-pointer leading-none"
                                            title="Admin Approve Override"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={() => {
                                              onUpdateVisitor(v.id, 'Denied', 'Admin Override');
                                              triggerToast('Admin Force-Denied entry!');
                                            }}
                                            className="text-[7.5px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black cursor-pointer leading-none"
                                            title="Admin Deny Override"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* ----------------- TABS: MEMBERS ----------------- */}
                {currentTab === 'members' && (
                  <div className="space-y-2.5">
                    {/* Search Field with Add Member Button */}
                    <div className="flex gap-1.5 items-center">
                      <div className="relative flex-1 flex items-center">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                        <input
                          type="text"
                          placeholder="Search flats, owner names..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8.5 pr-3 py-1.5 focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-800 shadow-xs"
                        />
                      </div>
                      <button 
                        onClick={handleOpenAddMember}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-1 text-[11px] font-bold shadow-sm transition-all flex-shrink-0 active:scale-95"
                        title="Add Member"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Horizontal scrollable wings filter */}
                    {hasWings && (
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                        {['All', ...wingsList].map(wing => (
                          <button
                            key={wing}
                            onClick={() => setSelectedWingFilter(wing)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border whitespace-nowrap cursor-pointer ${
                              selectedWingFilter === wing
                                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {wing === 'All' ? 'All Wings' : `Wing ${wing}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Members list */}
                    <div className="space-y-3">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => {
                          const isEditing = editingMemberId === member.id;
                          return (
                            <div 
                              key={member.id || member.FlatNo}
                              className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs flex flex-col gap-2.5 transition-all duration-200"
                            >
                              {/* Card Header: Flat, Status, Actions */}
                              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex flex-col items-center justify-center font-bold text-xs border border-purple-100/50 leading-none shadow-3xs flex-shrink-0">
                                    {member.Tower ? (
                                      <>
                                        <span className="text-[6.5px] text-purple-600 uppercase tracking-wider font-extrabold mb-0.5 truncate max-w-[34px]" title={`${member.Tower} - Wing ${member.Wing}`}>{member.Tower}-{member.Wing}</span>
                                        <span className="text-[10px] font-extrabold">{member.FlatNo}</span>
                                      </>
                                    ) : hasWings && member.Wing ? (
                                      <>
                                        <span className="text-[7px] text-purple-500 uppercase tracking-widest font-black mb-0.5">{member.Wing}</span>
                                        <span className="text-[10px] font-extrabold">{member.FlatNo}</span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] font-extrabold">{member.FlatNo}</span>
                                    )}
                                  </div>
                                  <div>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 p-1 rounded font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="Owner Name"
                                      />
                                    ) : (
                                      <h4 className="text-xs font-black text-slate-800">{member.OwnerName}</h4>
                                    )}
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[8px] bg-slate-100 border border-slate-200/50 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                                        {member.Status || 'Owner'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Edit / Save Actions */}
                                {userRole === 'Admin' && (
                                  <div className="flex items-center gap-1">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            if (!editName.trim()) {
                                              triggerToast('Owner Name is required');
                                              return;
                                            }
                                            onSaveOrUpdateMember({
                                              ...member,
                                              OwnerName: editName,
                                              ContactNo: editPhone,
                                              Email: editEmail,
                                              Balance: editBalance,
                                              VehicleNo: editVehicle
                                            });
                                            triggerToast('Member details updated!');
                                            setEditingMemberId(null);
                                          }}
                                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-100 cursor-pointer"
                                          title="Save changes"
                                        >
                                          <Save className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingMemberId(null)}
                                          className="p-1.5 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                                          title="Cancel"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingMemberId(member.id);
                                          setEditName(member.OwnerName || '');
                                          setEditPhone(member.ContactNo || '');
                                          setEditEmail(member.Email || '');
                                          setEditBalance(member.Balance || 0);
                                          setEditVehicle(member.VehicleNo || '');
                                        }}
                                        className="p-1.5 bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-700 rounded-lg border border-slate-100 cursor-pointer transition-colors"
                                        title="Edit Resident"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Card Body Details: Contact Info, Dues, Vehicle */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                                {/* Left Side: Contact Information */}
                                <div className="space-y-1 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                                  <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider block">Contact Info</span>
                                  {isEditing ? (
                                    <div className="space-y-1.5">
                                      <input
                                        type="text"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-1 rounded text-[9px] text-slate-700"
                                        placeholder="Phone Number"
                                      />
                                      <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-1 rounded text-[9px] text-slate-700"
                                        placeholder="Email Address"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-1 text-slate-600 font-medium">
                                      <div className="flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span className="truncate">{member.ContactNo || 'Not registered'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span className="truncate">{member.Email || 'No email saved'}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side: Dues & Vehicle Info */}
                                <div className="space-y-1.5">
                                  {/* Dues Status Block */}
                                  <div className={`p-1.5 rounded-xl border ${
                                    member.Balance > 0 
                                      ? 'bg-rose-50 border-rose-100/50 text-rose-700' 
                                      : 'bg-emerald-50 border-emerald-100/50 text-emerald-700'
                                  }`}>
                                    <span className="text-[7px] uppercase font-bold tracking-wider block">Maintenance Dues</span>
                                    {isEditing ? (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] font-bold">₹</span>
                                        <input
                                          type="number"
                                          value={editBalance}
                                          onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                                          className="w-full bg-white border border-slate-200 p-0.5 rounded text-[9px] text-slate-800"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-baseline mt-0.5">
                                        <span className="text-xs font-black">
                                          {member.Balance > 0 ? `₹${member.Balance.toLocaleString()}` : (member.Balance < 0 ? `-₹${Math.abs(member.Balance).toLocaleString()}` : 'No Dues')}
                                        </span>
                                        <span className="text-[6.5px] uppercase font-black tracking-wider opacity-70">
                                          {member.Balance > 0 ? 'Pending' : (member.Balance < 0 ? 'Prepaid' : 'Cleared')}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Registered Vehicle Block */}
                                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-150">
                                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Vehicle License</span>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editVehicle}
                                        onChange={(e) => setEditVehicle(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-1 rounded text-[9px] text-slate-700"
                                        placeholder="e.g. MH-12-AB-1234"
                                      />
                                    ) : member.VehicleNo ? (
                                      /* Professional license plate style tag */
                                      <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-slate-800 border-2 border-slate-800 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase font-mono shadow-3xs">
                                        <Car className="w-2.5 h-2.5 text-slate-700" />
                                        <span>{member.VehicleNo}</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-[8px] font-semibold italic">No vehicle listed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No member records found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ----------------- TABS: PAYMENTS ----------------- */}
                {currentTab === 'payments' && (
                  <div className="space-y-2.5 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payments Ledger</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Autosynced</span>
                    </div>

                    {/* Collection vs Dues bar chart */}
                    {paymentsVsDuesData.length > 0 && (
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                        <div className="flex justify-between items-center mb-1 px-0.5">
                          <div>
                            <h4 className="text-[10px] font-extrabold text-slate-700">Collections vs Outstanding Dues</h4>
                            <p className="text-[8px] text-slate-400 font-semibold">Monthly collections compared with current total unpaid dues</p>
                          </div>
                        </div>
                        <div className="w-full h-[120px] text-[8px] -ml-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={paymentsVsDuesData}
                              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="month" 
                                stroke="#64748b" 
                                fontSize={8}
                                tickLine={false} 
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#64748b" 
                                fontSize={8}
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => `₹${val >= 1000 ? (val/1000) + 'k' : val}`}
                              />
                              <Tooltip 
                                formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '9px', padding: '4px 8px' }}
                                labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                              />
                              <Bar dataKey="collected" fill="#10b981" radius={[3, 3, 0, 0]} name="Collected" />
                              <Bar dataKey="outstanding" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Outstanding" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Issued Invoices Section */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 mt-2">Issued Maintenance Invoices</h4>
                      {(() => {
                        const filteredInvoices = invoices.filter(inv => {
                          const socMatch = inv.SocietyId === activeSocietyId;
                          if (!socMatch) return false;
                          if (userRole === 'Member') {
                            return inv.FlatNo === loggedInMemberFlat;
                          }
                          return true;
                        });

                        if (filteredInvoices.length === 0) {
                          return (
                            <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                              No maintenance bills have been issued for this society yet.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                            {filteredInvoices.map((inv) => (
                              <div key={inv.id} className="bg-slate-50 hover:bg-slate-100/50 p-2.5 rounded-xl border border-slate-150 flex justify-between items-center text-[10px] transition-colors">
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-extrabold text-slate-800">Bill cycle: {inv.BillMonth}</h5>
                                    <span className="text-[7.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black font-sans uppercase">
                                      Flat {inv.FlatNo}
                                    </span>
                                  </div>
                                  <p className="text-[8px] text-slate-400 mt-0.5">
                                    Base: ₹{inv.BaseAmount} • Water: ₹{inv.WaterCharges} • Sec: ₹{inv.SecurityCharges} • Util: ₹{inv.ParkingCharges}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right flex items-center gap-1.5">
                                  <div>
                                    <span className="text-[11px] font-black block text-slate-800">₹{inv.TotalAmount}</span>
                                    <span className={`text-[7px] font-black px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                                      inv.Status === 'Paid' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {inv.Status}
                                    </span>
                                  </div>

                                  {inv.Status === 'Unpaid' && userRole === 'Member' && (
                                    <button
                                      onClick={() => {
                                        setMemberPayAmount(String(inv.TotalAmount));
                                        setShowMemberPayModal(true);
                                      }}
                                      className="text-[8.5px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Pay
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 mt-2">Cleared Payments History</h4>

                    <div className="space-y-2">
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((pmt, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-100">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">Flat {pmt.FlatNo}</h4>
                                <span className="text-[9px] text-slate-400 font-semibold">{pmt.Mode} • {pmt.Date}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-extrabold text-emerald-600">+₹{pmt.Amount}</span>
                              <span className="block text-[8px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-sm mt-0.5 text-center">Cleared</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                          <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No payments recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Floating Add Payment Button */}
                    <button 
                      onClick={() => {
                        setPayFlatNo('');
                        setShowPaymentForm(true);
                      }}
                      className="absolute right-2 bottom-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition-all z-40"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* ----------------- TABS: EXPENSES ----------------- */}
                {currentTab === 'expenses' && (
                  <div className="space-y-2.5 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Debit Outflows</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">Approved</span>
                    </div>

                    <div className="space-y-2">
                      {expenses.length > 0 ? (
                        expenses.map((exp, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-rose-100/80 text-rose-700 flex items-center justify-center border border-rose-100">
                                <TrendingDown className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{exp.Category}</h4>
                                <span className="text-[9px] text-slate-400 font-semibold">To: {exp.Vendor} • {exp.Date}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-extrabold text-rose-600">-₹{exp.Amount}</span>
                              <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded-sm mt-0.5 text-center">Receipt</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                          <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No expenses recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Floating Add Expense Button */}
                    <button 
                      onClick={() => setShowExpenseForm(true)}
                      className="absolute right-2 bottom-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition-all z-40"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* ----------------- TABS: COMPLAINTS ----------------- */}
                {currentTab === 'complaints' && (
                  <div className="space-y-2.5 relative">
                    {/* Complaints Header with Alert Bell */}
                    <div className="flex justify-between items-center px-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Complaints Board</span>
                      <div className="relative p-1 bg-amber-50 rounded-full border border-amber-200 text-amber-700 flex items-center justify-center" title={`${complaints.filter(c => c.Status === 'Open').length} Open Complaints`}>
                        <Bell className="w-3.5 h-3.5" />
                        {complaints.filter(c => c.Status === 'Open').length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse">
                            {complaints.filter(c => c.Status === 'Open').length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Complaint filter chips */}
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                      {['All', 'Open', 'In Progress', 'Resolved'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setComplaintFilter(filter as any)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                            complaintFilter === filter
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Complaints list */}
                    <div className="space-y-2">
                      {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((comp) => (
                          <div 
                            key={comp.id}
                            onClick={() => setActiveComplaintDetail(comp)}
                            className="bg-white p-3 rounded-xl border border-slate-150 hover:border-purple-200 shadow-xs cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                comp.Urgency === 'High' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                  : (comp.Urgency === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100')
                              }`}>
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{comp.Title}</h4>
                                <span className="text-[9px] text-slate-400 font-semibold">Flat {comp.FlatNo} • {comp.Date}</span>
                              </div>
                            </div>

                            <div>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                comp.Status === 'Resolved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : (comp.Status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                              }`}>
                                {comp.Status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No complaints registered</p>
                        </div>
                      )}
                    </div>

                    {/* Floating Add Complaint Button */}
                    <button 
                      onClick={() => setShowComplaintForm(true)}
                      className="absolute right-2 bottom-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition-all z-40"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* ----------------- TABS: NOTICES ----------------- */}
                {currentTab === 'notices' && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Bulletins</span>
                      {(userRole === 'Admin' || userRole === 'Committee Member') && (
                        <button
                          onClick={() => {
                            setNewNoticeTitle('');
                            setNewNoticeContent('');
                            setNewNoticeCategory('General');
                            setNewNoticeFileName('');
                            setNewNoticeFileUrl('');
                            setNewNoticeFileSize('');
                            setIsBroadcastModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black tracking-wide transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Draft / Upload Notice</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {notices.length > 0 ? (
                        notices.map((notice) => (
                          <div 
                            key={notice.id}
                            onClick={() => setActiveNoticeDetail(notice)}
                            className="bg-white p-3 rounded-xl border border-slate-150 hover:border-purple-200 cursor-pointer shadow-xs transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                                <Megaphone className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{notice.Title}</h4>
                                <span className="text-[9px] text-slate-400 font-semibold">{notice.Category} • {notice.Date}</span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                          <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No active notice files found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentTab === 'amenities' && (
                  <FacilityBookingManager
                    societyId={activeSocietyId}
                    loggedInMemberFlat={loggedInMemberFlat}
                    loggedInMemberName={activeResidentMember.OwnerName}
                    members={members}
                    onAddDues={onAddDues || (() => {})}
                    onAddAuditLog={onAddAuditLog || (() => {})}
                  />
                )}
              </div>

              {/* Bottom Navigation Tabs */}
              <div className="h-[56px] bg-white border-t border-slate-200 flex items-center justify-around px-1 py-1 z-30">
                <button 
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'dashboard' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[8px]">Dashboard</span>
                </button>

                {userRole === 'Admin' ? (
                  <>
                    <button 
                      onClick={() => { setCurrentTab('members'); setSearchQuery(''); }}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'members' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-[8px]">Members</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('payments')}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'payments' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[8px]">Payments</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('expenses')}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'expenses' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-[8px]">Expenses</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setCurrentTab('payments')}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'payments' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[8px]">My Ledger</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('amenities')}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'amenities' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-[8px]">Amenities</span>
                    </button>
                  </>
                )}

                <button 
                  onClick={() => { setCurrentTab('complaints'); setComplaintFilter('All'); }}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'complaints' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[8px]">Alerts</span>
                </button>

                <button 
                  onClick={() => setCurrentTab('notices')}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${currentTab === 'notices' ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span className="text-[8px]">Notices</span>
                </button>
              </div>

              {/* Home Indicator Gesture Bar */}
              <div className="h-4 bg-white flex justify-center items-center">
                <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ======================= DETAIL PANELS ======================== */}
          {/* ============================================================== */}

          {/* Member Profile Drawer */}
          {activeMemberDetail && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl max-h-[85%] p-5 space-y-4 overflow-y-auto animate-slide-up shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold uppercase border border-purple-100">
                      {hasWings && activeMemberDetail.Wing ? `Wing ${activeMemberDetail.Wing} • Flat ${activeMemberDetail.FlatNo}` : `Flat ${activeMemberDetail.FlatNo}`}
                    </span>
                    <h2 className="text-base font-bold text-slate-800 mt-2">{activeMemberDetail.OwnerName}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        handleOpenEditMember(activeMemberDetail);
                        setActiveMemberDetail(null);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer"
                      title="Edit Member Info"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveMemberDetail(null)}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {hasWings && activeMemberDetail.Wing && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                      <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold">Society Wing Block</p>
                        <p className="text-slate-700 font-semibold">Wing {activeMemberDetail.Wing}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-semibold">Phone Contact</p>
                      <p className="text-slate-700 font-medium">{activeMemberDetail.ContactNo}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-semibold">Email Address</p>
                      <p className="text-slate-700 font-medium break-all">{activeMemberDetail.Email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold">Maintenance Dues Balance</p>
                        <p className={`font-bold ${activeMemberDetail.Balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {activeMemberDetail.Balance > 0 ? `₹${activeMemberDetail.Balance} Pending` : `₹${Math.abs(activeMemberDetail.Balance)} Prepaid / Clear`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeMemberDetail.CoOwners && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold">Co-Owners / Family</p>
                        <p className="text-slate-700 font-medium">{activeMemberDetail.CoOwners}</p>
                      </div>
                    </div>
                  )}

                  {activeMemberDetail.VehicleNo && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                      <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold">Registered Vehicle No</p>
                        <p className="text-slate-700 font-medium font-mono">{activeMemberDetail.VehicleNo}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setPayFlatNo(activeMemberDetail.FlatNo);
                    setActiveMemberDetail(null);
                    setShowPaymentForm(true);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Log Maintenance Payment
                </button>
              </div>
            </div>
          )}

          {/* Complaint Detail Screen */}
          {activeComplaintDetail && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl max-h-[85%] p-5 space-y-4 overflow-y-auto animate-slide-up shadow-2xl text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-bold uppercase tracking-wider border border-rose-100">
                      {activeComplaintDetail.Category}
                    </span>
                    <h2 className="text-sm font-bold text-slate-800 mt-2">{activeComplaintDetail.Title}</h2>
                    <p className="text-[10px] text-slate-400 mt-1">Ticket: {activeComplaintDetail.id} • Date: {activeComplaintDetail.Date}</p>
                  </div>
                  <button 
                    onClick={() => setActiveComplaintDetail(null)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Description</p>
                  <p className="text-slate-700 leading-relaxed mt-1">{activeComplaintDetail.Description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Reporter Unit</span>
                    <span className="font-bold text-slate-700">Flat {activeComplaintDetail.FlatNo}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Priority</span>
                    <span className={`font-bold ${activeComplaintDetail.Urgency === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{activeComplaintDetail.Urgency}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Update Status</span>
                  <div className="flex gap-1.5">
                    {(['Open', 'In Progress'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          onUpdateComplaint(activeComplaintDetail.id, status);
                          setActiveComplaintDetail({ ...activeComplaintDetail, Status: status });
                          setAutoNoticeEnabled(false);
                          triggerToast(`Status updated to ${status}`);
                        }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                          activeComplaintDetail.Status === status
                            ? (status === 'In Progress' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-rose-100 border-rose-300 text-rose-800')
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (activeComplaintDetail.Status !== 'Resolved') {
                          setAutoNoticeEnabled(true);
                          setAutoNoticeTitle(`Resolved: ${activeComplaintDetail.Title}`);
                          setAutoNoticeContent(`The complaint #${activeComplaintDetail.id} regarding ${activeComplaintDetail.Category} ("${activeComplaintDetail.Title}") reported by Flat ${activeComplaintDetail.FlatNo} has been successfully resolved.\n\nResolution Details: Resolved by Committee Admin successfully.`);
                        }
                        setActiveComplaintDetail({ ...activeComplaintDetail, Status: 'Resolved' });
                      }}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                        activeComplaintDetail.Status === 'Resolved'
                          ? 'bg-green-100 border-green-300 text-green-800 font-black'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>

                  {activeComplaintDetail.Status === 'Resolved' && (
                    <div className="mt-3 p-3 bg-green-50/70 rounded-xl border border-green-100 space-y-2.5 animate-fadeIn text-xs">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-green-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                          Automated Notice Generator
                        </p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={autoNoticeEnabled}
                            onChange={(e) => {
                              setAutoNoticeEnabled(e.target.checked);
                              if (e.target.checked && !autoNoticeTitle) {
                                setAutoNoticeTitle(`Resolved: ${activeComplaintDetail.Title}`);
                                setAutoNoticeContent(`The complaint #${activeComplaintDetail.id} regarding ${activeComplaintDetail.Category} ("${activeComplaintDetail.Title}") reported by Flat ${activeComplaintDetail.FlatNo} has been successfully resolved.\n\nResolution Details: Resolved by Committee Admin successfully.`);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      {autoNoticeEnabled ? (
                        <div className="space-y-2 text-[10px]">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600">Notice Scope / Audience</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setAutoNoticeType('society')}
                                className={`flex-1 py-1 rounded border text-center font-bold text-[9px] ${
                                  autoNoticeType === 'society' 
                                    ? 'bg-purple-100 border-purple-400 text-purple-700' 
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                Whole Society
                              </button>
                              <button
                                type="button"
                                onClick={() => setAutoNoticeType('member')}
                                className={`flex-1 py-1 rounded border text-center font-bold text-[9px] ${
                                  autoNoticeType === 'member' 
                                    ? 'bg-purple-100 border-purple-400 text-purple-700' 
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                Resident Member Only
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">Notice Title</label>
                            <input
                              type="text"
                              value={autoNoticeTitle}
                              onChange={(e) => setAutoNoticeTitle(e.target.value)}
                              className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">Notice Content Bulletin</label>
                            <textarea
                              value={autoNoticeContent}
                              onChange={(e) => setAutoNoticeContent(e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none font-sans leading-relaxed"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onUpdateComplaint(
                                activeComplaintDetail.id, 
                                'Resolved', 
                                {
                                  title: autoNoticeTitle,
                                  category: activeComplaintDetail.Category,
                                  content: autoNoticeContent + `\n\nScope: ${autoNoticeType === 'society' ? 'All Society Members' : `Confidential for Unit ${activeComplaintDetail.FlatNo}`}`
                                }
                              );
                              triggerToast('Notice published successfully!');
                              setActiveComplaintDetail(null);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded transition-all shadow-xs cursor-pointer text-center block"
                          >
                            Publish Notice & Resolve Ticket
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateComplaint(activeComplaintDetail.id, 'Resolved');
                            triggerToast('Resolved without bulletin notice');
                            setActiveComplaintDetail(null);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded transition-all shadow-xs cursor-pointer text-center block text-[10px]"
                        >
                          Confirm Silent Resolution
                        </button>
                      )}
                    </div>
                  )}

                  {/* --- CONVERSATION THREAD --- */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center gap-1.5 mb-3">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Interactive Discussion</h3>
                      <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                        {complaintReplies.filter(r => r.ComplaintId === activeComplaintDetail.id).length} Replies
                      </span>
                    </div>

                    {/* Messages Bubble Stack */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto mb-3 pr-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {(() => {
                        const replies = complaintReplies.filter(r => r.ComplaintId === activeComplaintDetail.id);
                        if (replies.length === 0) {
                          return (
                            <div className="text-center py-4 text-slate-400">
                              <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-20 text-slate-400" />
                              <p className="text-[9px]">No official comments or discussion on this alert yet. Use the input below to start the conversation.</p>
                            </div>
                          );
                        }
                        return replies.map(r => {
                          const isAdmin = r.SenderRole === 'Admin';
                          return (
                            <div
                              key={r.id}
                              className={`flex flex-col max-w-[90%] rounded-xl p-2 text-[10px] leading-relaxed shadow-2xs transition-all ${
                                isAdmin
                                  ? 'bg-purple-50 border border-purple-100/55 ml-auto text-purple-950'
                                  : 'bg-white border border-slate-200 mr-auto text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 justify-between">
                                <span className="font-extrabold text-slate-700 truncate">{r.SenderName}</span>
                                <span className={`text-[7px] px-1 rounded-full uppercase font-black ${
                                  isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {r.SenderRole}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">{r.Message}</p>
                              <span className="text-[6.5px] text-slate-400 mt-1 self-end">
                                {new Date(r.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Message Input Box */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type a message or response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSendReply();
                          }
                        }}
                        className="flex-1 bg-white border border-slate-300 px-2 py-1 rounded-lg text-[10px] focus:outline-none focus:border-purple-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleSendReply}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notice Detail Screen */}
          {activeNoticeDetail && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl max-h-[85%] p-5 space-y-4 overflow-y-auto animate-slide-up shadow-2xl text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                      {activeNoticeDetail.Category} Notice
                    </span>
                    <h2 className="text-sm font-bold text-slate-800 mt-2">{activeNoticeDetail.Title}</h2>
                    <p className="text-[10px] text-slate-400 mt-1">Posted on {activeNoticeDetail.Date} by {activeNoticeDetail.PostedBy}</p>
                  </div>
                  <button 
                    onClick={() => setActiveNoticeDetail(null)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-slate-700 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {activeNoticeDetail.Content}
                </div>

                {activeNoticeDetail.AttachmentUrl && (
                  <div className="space-y-2 pt-1 text-left">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Attached Memo Circular</span>
                    <div className="p-3 bg-purple-50/50 border border-purple-100/70 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex flex-col items-center justify-center font-bold relative overflow-hidden shrink-0">
                          <span className="text-[7px] opacity-75 uppercase">FILE</span>
                          <span className="text-[10px] font-black -mt-0.5">
                            {activeNoticeDetail.AttachmentName ? activeNoticeDetail.AttachmentName.split('.').pop()?.toUpperCase() : 'PDF'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-[10px] truncate">
                            {activeNoticeDetail.AttachmentName || 'Official_Circular_Notice.pdf'}
                          </p>
                          <p className="text-[8.5px] text-slate-400 font-bold">
                            {activeNoticeDetail.AttachmentSize || '1.2 MB'} • Verified Document
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setPreviewingNotice(activeNoticeDetail);
                          }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
                        >
                          <span>Preview Circular</span>
                        </button>
                      </div>
                    </div>

                    <a
                      href={activeNoticeDetail.AttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-200 text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Download External Copy
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Immersive Circular Document Previewer Modal */}
          {previewingNotice && (
            <div className="absolute inset-0 bg-slate-900/90 z-55 flex flex-col text-xs">
              {/* Header bar */}
              <div className="px-4 py-3 bg-slate-800 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-[10px] truncate leading-normal text-slate-200">
                      {previewingNotice.AttachmentName || 'Official_Circular.pdf'}
                    </h3>
                    <p className="text-[8px] text-slate-400 font-medium">Digital Verification Seal Active</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded-md">
                    <button 
                      onClick={() => setViewerZoom(Math.max(50, viewerZoom - 25))}
                      className="text-white hover:text-purple-300 font-black text-[11px] cursor-pointer px-1 active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-[9px] font-bold font-mono text-purple-200">{viewerZoom}%</span>
                    <button 
                      onClick={() => setViewerZoom(Math.min(200, viewerZoom + 25))}
                      className="text-white hover:text-purple-300 font-black text-[11px] cursor-pointer px-1 active:scale-90"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setPreviewingNotice(null)}
                    className="p-1 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View area */}
              <div className="flex-1 overflow-auto bg-slate-950/80 p-4 flex justify-center items-start">
                <div 
                  style={{ transform: `scale(${viewerZoom / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-[340px] bg-white text-slate-800 p-6 rounded-lg shadow-2xl space-y-4 relative border border-slate-200 transition-all shrink-0 my-2"
                >
                  {/* Letterhead */}
                  <div className="border-b-2 border-double border-slate-400 pb-3 text-center space-y-1 relative">
                    <div className="absolute right-0 top-0 w-8 h-8 rounded-full border border-slate-350 flex items-center justify-center text-[6px] text-slate-400 font-bold border-dashed uppercase rotate-12">
                      Official
                    </div>
                    <span className="text-[8px] uppercase tracking-widest font-black text-purple-600 block">Co-operative Housing Society</span>
                    <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-tight">{societyName || 'Greenwood Residency'}</h1>
                    <p className="text-[7.5px] text-slate-500 font-semibold leading-normal">{postalAddress || '12-A, Link Road, Mumbai'}</p>
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono font-bold pt-1">
                      <span>REF: CHS/NOT/2026/{previewingNotice.id}</span>
                      <span>DATE: {previewingNotice.Date}</span>
                    </div>
                  </div>

                  {/* Circular Title */}
                  <div className="text-center space-y-1 pt-1">
                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-wide underline decoration-slate-400 underline-offset-4">
                      {previewingNotice.Title}
                    </h2>
                    <span className="text-[8px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block mx-auto w-max">
                      {previewingNotice.Category}
                    </span>
                  </div>

                  {/* Circular Content Memo Body */}
                  <div className="text-[9.5px] leading-relaxed text-slate-700 space-y-2.5 font-sans font-medium text-justify">
                    <p className="font-bold">Dear Members/Residents,</p>
                    <p className="whitespace-pre-wrap">{previewingNotice.Content}</p>
                    <p className="pt-2 leading-relaxed">
                      We solicit the active co-operation and compliance of all residents to ensure the smooth administration and maintenance of our society property.
                    </p>
                  </div>

                  {/* Tables / Rules mock detail block if Category is Maintenance or Meeting */}
                  {(previewingNotice.Category === 'Maintenance' || previewingNotice.Category === 'Meeting') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 pt-1 text-[8px] space-y-1 text-left">
                      <span className="font-extrabold text-slate-500 uppercase tracking-wider block">Reference Schedule / Agenda</span>
                      <div className="grid grid-cols-3 border-b border-slate-200 pb-1 font-extrabold text-slate-600">
                        <span>Item</span>
                        <span>Timings</span>
                        <span className="text-right">Action Req.</span>
                      </div>
                      <div className="grid grid-cols-3 text-slate-500 font-semibold">
                        <span>01. Session Brief</span>
                        <span>10:00 AM - 11:30 AM</span>
                        <span className="text-right">Attendance</span>
                      </div>
                      <div className="grid grid-cols-3 text-slate-500 font-semibold">
                        <span>02. Resolution Vote</span>
                        <span>11:30 AM - 12:45 PM</span>
                        <span className="text-right">Mandatory Vote</span>
                      </div>
                    </div>
                  )}

                  {/* Sign-off Seal & Signatures */}
                  <div className="border-t border-slate-200 pt-4 flex justify-between items-end relative min-h-[55px] text-left">
                    {/* Simulated Seal */}
                    <div className="absolute left-[30%] bottom-1.5 w-12 h-12 rounded-full border-2 border-blue-400/30 flex flex-col items-center justify-center font-bold text-[6px] text-blue-500/40 uppercase rotate-[-15deg] pointer-events-none select-none">
                      <span className="tracking-widest">SOCIETY</span>
                      <span>★ SEAL ★</span>
                      <span>MUMBAI</span>
                    </div>

                    <div className="text-left">
                      <div className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider font-bold">Verified digital signature</div>
                      <div className="font-mono italic text-[11px] font-bold text-slate-500 select-none tracking-widest leading-none mt-1 select-none">S. K. Mehta</div>
                      <p className="text-[8px] font-black text-slate-800 leading-normal">Shreejit K. Mehta</p>
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase leading-none">Honorary Secretary</p>
                    </div>

                    <div className="text-right">
                      <div className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider font-bold">Authorized Sign-off</div>
                      <div className="font-mono italic text-[11px] font-bold text-indigo-500 select-none tracking-widest leading-none mt-1 select-none">A. Sharma</div>
                      <p className="text-[8px] font-black text-slate-800 leading-normal">Amit Sharma</p>
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase leading-none">Managing Committee Chair</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ========================= FORM POPUPS ======================== */}
          {/* ============================================================== */}

          {/* Log Payment Modal Popup */}
          {showPaymentForm && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Log Member Payment</h3>
                <button onClick={() => setShowPaymentForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitPayment} className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Flat Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 203"
                    value={payFlatNo}
                    onChange={(e) => setPayFlatNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Amount Paid (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Mode of Transfer</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['UPI', 'Bank Transfer', 'Cash', 'Cheque'] as const).map(mode => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPayMode(mode)}
                        className={`py-1.5 rounded-lg border text-center transition-all ${
                          payMode === mode 
                            ? 'bg-purple-100 border-purple-400 text-purple-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Reference / Transaction ID</label>
                  <input
                    type="text"
                    placeholder="UPI txn code or Cheque no."
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow"
                >
                  Confirm Payment Receipt
                </button>
              </form>
            </div>
          )}

          {/* Add Expense Modal Popup */}
          {showExpenseForm && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Add Society Expense</h3>
                <button onClick={() => setShowExpenseForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitExpense} className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {['Maintenance', 'Security', 'Water', 'Electricity', 'Repairs', 'Gardening', 'Salary', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Amount Outflow (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 8500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Vendor / Payee</label>
                  <input
                    type="text"
                    required
                    placeholder="Company or Service provider"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Invoice / Receipt Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-14"
                    value={expInvoice}
                    onChange={(e) => setExpInvoice(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow"
                >
                  Submit Expense Record
                </button>
              </form>
            </div>
          )}

          {/* Add Complaint Modal Popup */}
          {showComplaintForm && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">File Helpdesk Complaint</h3>
                <button onClick={() => setShowComplaintForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitComplaint} className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Reporter Flat</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102"
                    value={compFlatNo}
                    onChange={(e) => setCompFlatNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Category</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Noisy Neighbor', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Subject / Issue Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary"
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Detailed Description</label>
                  <textarea
                    required
                    placeholder="Explain when the problem started and details..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Priority Urgency</label>
                  <div className="flex gap-2">
                    {(['Low', 'Medium', 'High'] as const).map(urg => (
                      <button
                        type="button"
                        key={urg}
                        onClick={() => setCompUrgency(urg)}
                        className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                          compUrgency === urg 
                            ? 'bg-purple-100 border-purple-400 text-purple-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        {urg}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow"
                >
                  Register Complaint
                </button>
              </form>
            </div>
          )}

          {/* Pre-Approve Guest Modal Popup */}
          {showAddVisitorModal && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Pre-Approve Incoming Guest</h3>
                <button onClick={() => setShowAddVisitorModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newVisName.trim()) {
                    triggerToast('Guest Name is required!');
                    return;
                  }

                  if (onAddVisitor) {
                    const token = generateVisitorAccessToken();
                    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                    onAddVisitor({
                      VisitorName: newVisName.trim(),
                      Purpose: newVisPurpose,
                      ContactNo: newVisContact.trim() || 'Pre-Approved',
                      FlatNo: loggedInMemberFlat,
                      VehicleNo: newVisVehicle.trim() || undefined,
                      Status: 'Pre-Approved',
                      CheckInTime: new Date().toISOString(),
                      SocietyId: activeSocietyId,
                      AccessToken: token,
                      TokenExpiresAt: expiresAt
                    });

                    triggerToast(`Pre-approved guest ${newVisName.trim()} with token ${token}!`);
                    setShowAddVisitorModal(false);
                    setNewVisName('');
                    setNewVisContact('');
                    setNewVisVehicle('');
                  } else {
                    triggerToast('Visitor service unavailable');
                  }
                }}
                className="flex-1 p-4 space-y-4 overflow-y-auto"
              >
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-950 font-medium">
                  🏠 Pre-authorizing entry for <strong>Unit {loggedInMemberFlat}</strong>.
                  The security gatekeeper will see this pre-approval instantly!
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Guest / Visitor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil / My Brother"
                    value={newVisName}
                    onChange={(e) => setNewVisName(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Purpose of Entry</label>
                  <select
                    value={newVisPurpose}
                    onChange={(e) => setNewVisPurpose(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Guest">Guest / Relative</option>
                    <option value="Delivery">Delivery Executive</option>
                    <option value="Services">Home Maid / Services</option>
                    <option value="Maintenance">Maintenance Contractor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Contact Phone No (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newVisContact}
                    onChange={(e) => setNewVisContact(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Expected Vehicle No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MH-12-ZZ-9999"
                    value={newVisVehicle}
                    onChange={(e) => setNewVisVehicle(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow cursor-pointer transition-colors"
                >
                  ✨ Issue Gate Pre-Approval Pass
                </button>
              </form>
            </div>
          )}

          {/* Broadcast Notice Modal Popup */}
          {isBroadcastModalOpen && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-700">Broadcast Committee Notice</h3>
                </div>
                <button onClick={() => setIsBroadcastModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
                    triggerToast('Title and content are required!');
                    return;
                  }
                  if (onAddNotice) {
                    onAddNotice({
                      title: newNoticeTitle,
                      category: newNoticeCategory,
                      content: newNoticeContent,
                      attachmentUrl: newNoticeFileUrl,
                      attachmentName: newNoticeFileName,
                      attachmentSize: newNoticeFileSize,
                      documentUrl: newNoticeFileUrl,
                      uploadedBy: userRole === 'Admin' ? 'Admin Secretary' : 'Committee Member'
                    });
                    triggerToast('Notice broadcast successfully!');
                    setIsBroadcastModalOpen(false);
                    setNewNoticeTitle('');
                    setNewNoticeContent('');
                    setNewNoticeCategory('General');
                    setNewNoticeFileName('');
                    setNewNoticeFileUrl('');
                    setNewNoticeFileSize('');
                  } else {
                    triggerToast('Notice service unavailable');
                  }
                }} 
                className="flex-1 p-4 space-y-4 overflow-y-auto"
              >
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Notice Category</label>
                  <select
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  >
                    {['General', 'Maintenance', 'Meeting', 'Event', 'Security'].map(cat => (
                      <option key={cat} value={cat}>{cat} Notice</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Notice Title / Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Annual General Body Meeting (AGM)"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Announcement Content</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide the detailed notice, schedules, notes, or instructions for the society residents..."
                    value={newNoticeContent}
                    onChange={(e) => setNewNoticeContent(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Simulated Attachment Dropzone */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-600 block flex items-center justify-between">
                    <span>Circular Attachment (Optional)</span>
                    {newNoticeFileName && (
                      <span className="text-[9px] text-green-600 font-extrabold uppercase">✔ File Attached</span>
                    )}
                  </label>

                  {newNoticeFileName ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                          {newNoticeFileName.split('.').pop()?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-[10px] truncate">{newNoticeFileName}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{newNoticeFileSize}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNoticeFileName('');
                          setNewNoticeFileUrl('');
                          setNewNoticeFileSize('');
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove attachment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          // Simulating drop file
                          setNewNoticeFileName('Uploaded_Circular_Notice.pdf');
                          setNewNoticeFileSize('1.2 MB');
                          setNewNoticeFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                          triggerToast('Document "Uploaded_Circular_Notice.pdf" successfully attached!');
                        }}
                        className="border border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/10 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-slate-50"
                        onClick={() => {
                          // Allow choosing from templates
                          setNewNoticeFileName('AGM_Meeting_Agenda_Circular.pdf');
                          setNewNoticeFileSize('820 KB');
                          setNewNoticeFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                          triggerToast('Document "AGM_Meeting_Agenda_Circular.pdf" successfully attached!');
                        }}
                      >
                        <Megaphone className="w-6 h-6 text-slate-400 shrink-0" />
                        <p className="font-bold text-slate-600 text-[10px]">Drag & drop circular document, or click to browse</p>
                        <p className="text-[8px] text-slate-400 font-semibold">Supports PDF, DOCX, JPG (Max 5MB)</p>
                      </div>

                      {/* Standard Template Quick Select */}
                      <div className="flex flex-col gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Or attach official templates:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: 'Water_Billing_Revision.pdf', size: '1.4 MB' },
                            { name: 'AGM_Notice_Agenda.pdf', size: '920 KB' },
                            { name: 'Monsoon_Safety_Circular.pdf', size: '1.1 MB' },
                            { name: 'Rules_and_Regulations.docx', size: '680 KB' }
                          ].map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNewNoticeFileName(tmpl.name);
                                setNewNoticeFileSize(tmpl.size);
                                setNewNoticeFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                                triggerToast(`Attached "${tmpl.name}" template!`);
                              }}
                              className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg p-1.5 text-left text-[9px] font-bold text-slate-700 truncate cursor-pointer transition-all flex items-center gap-1.5 shadow-3xs"
                            >
                              <div className="w-4 h-4 rounded bg-slate-150 text-slate-500 flex items-center justify-center font-black text-[7px] shrink-0">
                                {tmpl.name.split('.').pop()?.toUpperCase()}
                              </div>
                              <span className="truncate">{tmpl.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition-all border border-slate-200"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold transition-all shadow"
                  >
                    Post Notice
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Society & Wings Settings Modal Popup */}
          {showSettingsModal && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Society Settings</h3>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* EDIT ACTIVE SOCIETY FORM */}
              <form onSubmit={handleSaveSocietySettings} className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Society Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Residency"
                    value={tempSocietyName}
                    onChange={(e) => setTempSocietyName(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Building / Property Type</label>
                  <select
                    value={tempBuildingType}
                    onChange={(e) => setTempBuildingType(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-slate-800"
                  >
                    <option value="Housing Society">Housing Society</option>
                    <option value="Apartment Complex">Apartment Complex</option>
                    <option value="Gated Community">Gated Community</option>
                    <option value="Residential Co-operative">Residential Co-operative</option>
                    <option value="Commercial Complex">Commercial Complex</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Postal Address</label>
                  <textarea
                    required
                    placeholder="e.g. 123 Greenwood Road, Sector 5, Mumbai, MH - 400001"
                    value={tempPostalAddress}
                    onChange={(e) => setTempPostalAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium resize-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Structural Topology (Real-Time Layout)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTempStructureType('standalone');
                        setTempHasWings(false);
                      }}
                      className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                        tempStructureType === 'standalone'
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      🏢 Standalone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempStructureType('wings');
                        setTempHasWings(true);
                      }}
                      className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                        tempStructureType === 'wings'
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      🧱 Winged Block
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempStructureType('towers_wings');
                        setTempHasWings(true);
                        if (tempTowers.length === 0) {
                          setTempTowers([
                            { Name: 'Tower 1', Wings: ['A', 'B'] },
                            { Name: 'Tower 2', Wings: ['C', 'D'] }
                          ]);
                        }
                      }}
                      className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                        tempStructureType === 'towers_wings'
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      🏰 Towers & Wings
                    </button>
                  </div>
                </div>

                {tempStructureType === 'wings' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="font-bold text-slate-600 block">Define Wing Names</label>
                    <input
                      type="text"
                      placeholder="e.g. A, B, C, D"
                      value={tempWingsList}
                      onChange={(e) => setTempWingsList(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-slate-800"
                    />
                    <p className="text-[9px] text-slate-400">Separate wings using commas (e.g., A, B, C or Wing A, Wing B).</p>
                  </div>
                )}

                {tempStructureType === 'towers_wings' && (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
                    <div className="flex justify-between items-center border-b pb-1.5 border-slate-200">
                      <span className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1">🏢 Towers & Wings Setup</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextNum = tempTowers.length + 1;
                          setTempTowers([...tempTowers, { Name: `Tower ${nextNum}`, Wings: ['A', 'B'] }]);
                        }}
                        className="text-[9px] bg-purple-600 hover:bg-purple-700 text-white font-black px-2 py-1 rounded cursor-pointer transition-all"
                      >
                        ➕ Add Tower
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {tempTowers.map((tower, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-3xs space-y-1.5 relative">
                          <button
                            type="button"
                            onClick={() => {
                              setTempTowers(tempTowers.filter((_, tIdx) => tIdx !== idx));
                            }}
                            className="absolute top-1.5 right-2 text-rose-500 hover:text-rose-700 font-bold text-sm"
                          >
                            ✕
                          </button>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 text-[9px] shrink-0">Tower Name:</span>
                            <input
                              type="text"
                              value={tower.Name}
                              onChange={(e) => {
                                const updated = [...tempTowers];
                                updated[idx].Name = e.target.value;
                                setTempTowers(updated);
                              }}
                              className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 text-[10px]"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 text-[9px] shrink-0">Wings in Tower:</span>
                            <input
                              type="text"
                              value={tower.Wings.join(', ')}
                              onChange={(e) => {
                                const updated = [...tempTowers];
                                updated[idx].Wings = e.target.value.split(',').map(w => w.trim()).filter(w => w !== '');
                                setTempTowers(updated);
                              }}
                              placeholder="e.g. A, B"
                              className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 text-[10px] flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow cursor-pointer transition-all"
                >
                  Save Society Configurations
                </button>
              </form>
            </div>
          )}

          {/* Add / Modify Member Modal Popup */}
          {showMemberForm && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">{isEditingMember ? 'Modify Member Info' : 'Add New Member'}</h3>
                <button onClick={() => setShowMemberForm(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block text-xs">Flat/Unit No.</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 101, 302"
                        value={memFlatNo}
                        onChange={(e) => setMemFlatNo(e.target.value)}
                        disabled={isEditingMember}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                      />
                    </div>

                    {activeStructureType === 'towers_wings' ? (
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block text-xs">Tower</label>
                        <select
                          value={memTower}
                          onChange={(e) => {
                            const newTow = e.target.value;
                            setMemTower(newTow);
                            const tObj = activeTowers.find(t => t.Name === newTow);
                            if (tObj && tObj.Wings.length > 0) {
                              setMemWing(tObj.Wings[0]);
                            }
                          }}
                          className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                        >
                          {activeTowers.map(tower => (
                            <option key={tower.Name} value={tower.Name}>{tower.Name}</option>
                          ))}
                        </select>
                      </div>
                    ) : activeStructureType === 'wings' ? (
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block text-xs">Wing Block</label>
                        <select
                          value={memWing}
                          onChange={(e) => setMemWing(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                        >
                          {wingsList.map(wing => (
                            <option key={wing} value={wing}>Wing {wing}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-50">
                        <label className="font-semibold text-slate-600 block text-xs">Wing/Tower</label>
                        <input
                          type="text"
                          disabled
                          placeholder="Standalone (No Subdivisions)"
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-not-allowed text-xs text-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {activeStructureType === 'towers_wings' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="font-semibold text-slate-600 block text-xs">Wing in {memTower}</label>
                      <select
                        value={memWing}
                        onChange={(e) => setMemWing(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                      >
                        {(activeTowers.find(t => t.Name === memTower)?.Wings || []).map(wing => (
                          <option key={wing} value={wing}>Wing {wing}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Primary Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={memOwnerName}
                    onChange={(e) => setMemOwnerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 block">Occupancy Status</label>
                    <select
                      value={memStatus}
                      onChange={(e) => setMemStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Tenant">Tenant</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 block">Dues Balance (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={memBalance}
                      onChange={(e) => setMemBalance(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Phone Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={memContactNo}
                    onChange={(e) => setMemContactNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.c@example.com"
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Co-Owners / Family Residents</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Chandra (Spouse)"
                    value={memCoOwners}
                    onChange={(e) => setMemCoOwners(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Registered Vehicle No.</label>
                  <input
                    type="text"
                    placeholder="e.g. MH-02-AB-1234"
                    value={memVehicleNo}
                    onChange={(e) => setMemVehicleNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow cursor-pointer transition-all"
                >
                  {isEditingMember ? 'Update Member Profile' : 'Register New Member'}
                </button>
              </form>
            </div>
          )}

          {/* Admin Audit Logs Modal Popup */}
          {showAuditLogsModal && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold">Security Audit Trail</h3>
                </div>
                <button onClick={() => setShowAuditLogsModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                <div className="p-3 bg-purple-50 text-purple-900 rounded-xl border border-purple-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Internal Activity Ledger</span>
                  <p className="text-[9px] text-purple-700">All administrative operations such as financial updates, balance revisions, and member modifications are securely locked for transparency.</p>
                </div>

                <div className="space-y-2">
                  {auditLogs && auditLogs.length > 0 ? (
                    [...auditLogs].reverse().map((log) => (
                      <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5 hover:border-purple-200 transition-colors">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                          <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            {log.Action || 'Operation'}
                          </span>
                          <span className="font-mono">{new Date(log.Timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 text-xs font-medium leading-relaxed">
                          {log.Details}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[9px] font-semibold text-slate-500">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          <span>Authorized by:</span>
                          <span className="font-mono text-purple-700 bg-purple-50/50 px-1 rounded-sm">{log.UserName || 'admin'} ({log.UserRole})</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-250">
                      <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold">Pristine Audit Ledger</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No administrative operations logged yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Member Simulated UPI Payment Gateway Modal */}
          {showMemberPayModal && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl p-5 space-y-4 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-bold uppercase tracking-wider border border-rose-100">
                      SECURE CHECKOUT SANDBOX
                    </span>
                    <h2 className="text-sm font-bold text-slate-800 mt-2">Dues Payment Gateway</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Simulated Sandbox Environment • Unit {loggedInMemberFlat}</p>
                  </div>
                  <button 
                    onClick={() => setShowMemberPayModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <p className="text-[9px] text-slate-400 uppercase font-black">AMOUNT TO BE PAID</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₹{parseFloat(memberPayAmount).toLocaleString()}</p>
                  <p className="text-[9px] text-purple-600 font-bold mt-1">Maintenance & Services Dues</p>
                </div>

                {/* Simulated Payment Methods */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-slate-400">SELECT SIMULATED INSTRUMENT</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMemberPayMode('UPI')}
                      className={`py-2 rounded-lg border text-center font-bold transition-all text-[10px] ${
                        memberPayMode === 'UPI' 
                          ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-2xs' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      📱 Instant UPI Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberPayMode('Card')}
                      className={`py-2 rounded-lg border text-center font-bold transition-all text-[10px] ${
                        memberPayMode === 'Card' 
                          ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-2xs' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      💳 Mock Credit Card
                    </button>
                  </div>
                </div>

                {memberPayMode === 'UPI' ? (
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/60 flex flex-col items-center gap-2 animate-fadeIn">
                    <div className="w-24 h-24 bg-white p-1 rounded-lg border border-purple-100 flex items-center justify-center relative shadow-sm">
                      <div className="absolute inset-0 bg-slate-100/50 flex flex-col justify-center items-center text-center p-1">
                        <span className="text-[16px]">📱</span>
                        <span className="text-[8px] font-bold text-slate-500 mt-0.5">MOCK QR</span>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-500 text-center font-bold uppercase tracking-wider">UPI ID: greenwood@sbbi • Greenwood Residency Committee</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-slate-400">Card Number (Mock)</label>
                      <input
                        type="text"
                        disabled
                        value="••••  ••••  ••••  9245"
                        className="w-full bg-slate-100 border border-slate-200 p-1.5 rounded text-[10px] font-mono font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const amount = parseFloat(memberPayAmount);
                    if (isNaN(amount) || amount <= 0) {
                      triggerToast('Invalid amount to pay');
                      return;
                    }
                    onAddPayment({
                      Date: new Date().toISOString().split('T')[0],
                      FlatNo: loggedInMemberFlat,
                      Amount: amount,
                      Mode: memberPayMode === 'UPI' ? 'UPI' : 'Bank Transfer',
                      ReferenceNo: `${memberPayMode === 'UPI' ? 'UPI' : 'BANK'}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                      Status: 'Cleared'
                    });
                    setShowMemberPayModal(false);
                    triggerToast(`Simulated payment of ₹${amount} successful!`);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-[0.98]"
                >
                  🚀 Approve Simulated Sandbox Transfer
                </button>

                <p className="text-[8px] text-slate-400 text-center italic">
                  Note: This transaction is completely simulated within the Sandbox sandbox and no real funds are moved.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
