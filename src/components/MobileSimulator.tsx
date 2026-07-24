import React, { useState, useEffect, useRef } from "react";
import { FileUpload } from "./FileUpload";
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
  BookOpen,
  Sliders,
  Calendar,
  PhoneCall,
  FileText,
  Eye,
  Check,
  Trash2,
  ShieldAlert,
  KeyRound,
  ParkingSquare,
  Wrench,
  Droplets,
  Download,
  EyeOff,
  FolderKanban,
  Printer,
  BellRing,
  AlertOctagon,
  FileSpreadsheet,
  Vote,
  QrCode,
  FileCheck,
  Package,
  WifiOff,
  Upload,
} from "lucide-react";
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
  Legend,
} from "recharts";
import {
  Member,
  Payment,
  Expense,
  Complaint,
  Notice,
  Society,
  AuditLog,
  Invoice,
  Visitor,
  ComplaintReply,
  Role,
  UserAuth,
  EmergencyContact,
  Tenant,
  Vehicle,
  GuestParking,
  SocietyDocument,
  AssetAMC,
  WaterMeter,
  FeatureFlags,
  Poll,
  PollVote,
  Staff,
  StaffAttendance,
  Vendor,
  UserConsent,
  PushToken,
  EmergencyAlert,
  VendorContract,
} from "../types";
import EmergencyAlertBanner from "./EmergencyAlertBanner";
import {
  hashPassword,
  generateSalt,
  generateVisitorAccessToken,
} from "../utils/security";
import { getSignedFileUrl, StorageBucket } from "../utils/supabaseStorage";
import {
  registerForPushNotificationsAsync,
  notifyVisitorCheckIn,
  notifyNoticePublished,
} from "../utils/notifications";
import FacilityBookingManager from "./FacilityBookingManager";
import SetupChecklist from "./SetupChecklist";
import FeatureCatalogModal from "./FeatureCatalogModal";
import HowToHelpDrawer from "./HowToHelpDrawer";
import StaffTrackingModule from "./StaffTrackingModule";
import NocWorkflowModule from "./NocWorkflowModule";
import AssetInventoryModule from "./AssetInventoryModule";
import { FinancialInsightsPanel } from "./FinancialInsightsPanel";
import { MemberCsvImportModal } from "./MemberCsvImportModal";
import { MemberDuesHistoryModal } from "./MemberDuesHistoryModal";
import {
  queueOfflineOperation,
  getPendingOfflineQueue,
  syncOfflineQueue,
} from "../utils/offlineSync";

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
  emergencyContacts?: EmergencyContact[];
  tenants?: Tenant[];
  vehicles?: Vehicle[];
  guestParkings?: GuestParking[];
  societyDocuments?: SocietyDocument[];
  assetAMCs?: AssetAMC[];
  waterMeters?: WaterMeter[];
  polls?: Poll[];
  pollVotes?: PollVote[];
  auditLogs?: AuditLog[];
  roles?: Role[];
  userAuths?: UserAuth[];
  onUpdateRoles?: (roles: Role[]) => void;
  onUpdateUserAuths?: (auths: UserAuth[]) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onAddComplaint: (complaint: Omit<Complaint, "id">) => void;
  onUpdateComplaint: (
    id: string,
    nextStatus: "Open" | "In Progress" | "Resolved",
    autoNotice?: { title: string; category: string; content: string },
  ) => void;
  onAddPoll?: (poll: Omit<Poll, "id">) => void;
  onCastVote?: (vote: Omit<PollVote, "id">) => void;
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
    structureType?: "standalone" | "wings" | "towers_wings",
    towers?: any[],
    features?: FeatureFlags,
    billingAndGateway?: any,
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
  onAddInvoice?: (invoice: Omit<Invoice, "id">) => void;
  onAddVisitor?: (visitor: Omit<Visitor, "id">) => void;
  onUpdateVisitor?: (
    id: string,
    status: Visitor["Status"],
    hostApprovedBy?: string,
  ) => void;
  onAddComplaintReply?: (reply: Omit<ComplaintReply, "id">) => void;
  onAddEmergencyContact?: (contact: Omit<EmergencyContact, "id">) => void;
  onUpdateEmergencyContact?: (
    id: string,
    contact: Partial<EmergencyContact>,
  ) => void;
  onDeleteEmergencyContact?: (id: string) => void;
  onAddTenant?: (tenant: Omit<Tenant, "id">) => void;
  onUpdateTenantKyc?: (
    id: string,
    kycStatus: "Pending" | "Verified" | "Rejected",
    remarks?: string,
  ) => void;
  onAddVehicle?: (vehicle: Omit<Vehicle, "id">) => void;
  onDeleteVehicle?: (id: string) => void;
  onAddGuestParking?: (parking: Omit<GuestParking, "id">) => void;
  onUpdateGuestParkingStatus?: (
    id: string,
    status: "Active" | "Expired" | "Completed",
  ) => void;
  onAddSocietyDocument?: (doc: Omit<SocietyDocument, "id">) => void;
  onDeleteSocietyDocument?: (id: string) => void;
  onToggleDocumentVisibility?: (id: string, isPublic: boolean) => void;
  onAddAssetAMC?: (amc: Omit<AssetAMC, "id">) => void;
  onUpdateAssetAMC?: (id: string, amc: Partial<AssetAMC>) => void;
  onDeleteAssetAMC?: (id: string) => void;
  onAddWaterMeter?: (reading: Omit<WaterMeter, "id">) => void;
  onBatchAddWaterMeters?: (readings: Omit<WaterMeter, "id">[]) => void;
  staffList?: Staff[];
  staffAttendanceList?: StaffAttendance[];
  vendorList?: Vendor[];
  onAddStaff?: (staff: Omit<Staff, "id">) => void;
  onUpdateStaff?: (id: string, staff: Partial<Staff>) => void;
  onDeleteStaff?: (id: string) => void;
  onStaffCheckIn?: (
    staffId: string,
    passcode?: string,
    gatekeeperName?: string,
  ) => void;
  onStaffCheckOut?: (staffId: string) => void;
  onAddVendor?: (vendor: Omit<Vendor, "id">) => void;
  onUpdateVendor?: (id: string, vendor: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onApproveExpenseSecretary?: (
    expenseId: string,
    secretaryName: string,
  ) => void;
  onApproveExpenseTreasurer?: (
    expenseId: string,
    treasurerName: string,
  ) => void;
  onRejectExpense?: (expenseId: string, reason?: string) => void;
  lastSynced?: string;
  societies?: Society[];
  activeSocietyId?: string;
  onChangeActiveSociety?: (id: string) => void;
  onCreateSociety?: (
    name: string,
    type: string,
    address: string,
    wings: string[],
    wingsEnabled: boolean,
  ) => void;
  onAddDues?: (flatNo: string, amount: number, desc: string) => void;
  onAddAuditLog?: (action: string, details: string) => void;
  userConsents?: UserConsent[];
  onAddUserConsent?: (consent: Omit<UserConsent, "id">) => void;
  pushTokens?: PushToken[];
  onAddPushToken?: (token: Omit<PushToken, "id">) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
  emergencyAlerts?: EmergencyAlert[];
  vendorContracts?: VendorContract[];
  onAddEmergencyAlert?: (alert: Omit<EmergencyAlert, "id" | "CreatedAt">) => void;
  onOpenQrScanner?: () => void;
  onOpenVendorContracts?: () => void;
  theme?: "light" | "dark";
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
  emergencyContacts: rawEmergencyContacts = [],
  tenants: rawTenants = [],
  vehicles: rawVehicles = [],
  guestParkings: rawGuestParkings = [],
  societyDocuments: rawSocietyDocuments = [],
  assetAMCs: rawAssetAMCs = [],
  waterMeters: rawWaterMeters = [],
  polls: rawPolls = [],
  pollVotes: rawPollVotes = [],
  staffList: rawStaffList = [],
  staffAttendanceList: rawStaffAttendanceList = [],
  vendorList: rawVendorList = [],
  auditLogs = [],
  roles: rawRoles = [],
  userAuths: rawUserAuths = [],
  onUpdateRoles,
  onUpdateUserAuths,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onStaffCheckIn,
  onStaffCheckOut,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onApproveExpenseSecretary,
  onApproveExpenseTreasurer,
  onRejectExpense,
  onAddPayment,
  onAddExpense,
  onAddComplaint,
  onUpdateComplaint,
  onAddPoll,
  onCastVote,
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
  onAddEmergencyContact,
  onUpdateEmergencyContact,
  onDeleteEmergencyContact,
  onAddTenant,
  onUpdateTenantKyc,
  onAddVehicle,
  onDeleteVehicle,
  onAddGuestParking,
  onUpdateGuestParkingStatus,
  onAddSocietyDocument,
  onDeleteSocietyDocument,
  onToggleDocumentVisibility,
  onAddAssetAMC,
  onUpdateAssetAMC,
  onDeleteAssetAMC,
  onAddWaterMeter,
  onBatchAddWaterMeters,
  lastSynced,
  societies = [],
  activeSocietyId = "greenwood",
  onChangeActiveSociety,
  onCreateSociety,
  onAddDues,
  onAddAuditLog,
  userConsents = [],
  onAddUserConsent,
  pushTokens = [],
  onAddPushToken,
  onPrintInvoice,
  emergencyAlerts = [],
  vendorContracts = [],
  onAddEmergencyAlert,
  onOpenQrScanner,
  onOpenVendorContracts,
  theme = "dark",
}: MobileSimulatorProps) {
  const isDark = theme === "dark";

  // Dynamic Theme UI helper classes
  const cardBgClass = isDark
    ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm"
    : "bg-white border-slate-150 text-slate-800 shadow-xs";

  const subCardBgClass = isDark
    ? "bg-slate-950/70 border-slate-800/80 text-slate-200"
    : "bg-slate-50 border-slate-100 text-slate-800";

  const modalBgClass = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl"
    : "bg-white border-slate-200 text-slate-900 shadow-xl";

  const inputClass = isDark
    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-purple-500 font-sans"
    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-purple-500 font-sans";

  const secondaryBtnClass = isDark
    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-colors cursor-pointer"
    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold transition-colors cursor-pointer";

  const softPurpleBtnClass = isDark
    ? "bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-800/60 font-bold transition-colors cursor-pointer"
    : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 font-bold transition-colors cursor-pointer";

  const getThemeBadge = (
    color:
      | "emerald"
      | "amber"
      | "rose"
      | "purple"
      | "indigo"
      | "cyan"
      | "blue"
      | "teal"
      | "slate",
  ) => {
    if (isDark) {
      switch (color) {
        case "emerald":
          return "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-black";
        case "amber":
          return "bg-amber-950/80 text-amber-300 border border-amber-800/60 font-black";
        case "rose":
          return "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-black";
        case "purple":
          return "bg-purple-950/80 text-purple-300 border border-purple-800/60 font-black";
        case "indigo":
          return "bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-black";
        case "cyan":
          return "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-black";
        case "blue":
          return "bg-blue-950/80 text-blue-300 border border-blue-800/60 font-black";
        case "teal":
          return "bg-teal-950/80 text-teal-300 border border-teal-800/60 font-black";
        case "slate":
        default:
          return "bg-slate-800 text-slate-300 border border-slate-700 font-bold";
      }
    } else {
      switch (color) {
        case "emerald":
          return "bg-emerald-100 text-emerald-800 border border-emerald-200 font-black";
        case "amber":
          return "bg-amber-100 text-amber-800 border border-amber-200 font-black";
        case "rose":
          return "bg-rose-100 text-rose-800 border border-rose-200 font-black";
        case "purple":
          return "bg-purple-100 text-purple-800 border border-purple-200 font-black";
        case "indigo":
          return "bg-indigo-100 text-indigo-800 border border-indigo-200 font-black";
        case "cyan":
          return "bg-cyan-100 text-cyan-800 border border-cyan-200 font-black";
        case "blue":
          return "bg-blue-100 text-blue-800 border border-blue-200 font-black";
        case "teal":
          return "bg-teal-100 text-teal-800 border border-teal-200 font-black";
        case "slate":
        default:
          return "bg-slate-100 text-slate-700 border border-slate-200 font-bold";
      }
    }
  };
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
  const complaintReplies = Array.isArray(rawComplaintReplies)
    ? rawComplaintReplies
    : [];
  const emergencyContacts = Array.isArray(rawEmergencyContacts)
    ? rawEmergencyContacts
    : [];
  const tenants = Array.isArray(rawTenants) ? rawTenants : [];
  const vehicles = Array.isArray(rawVehicles) ? rawVehicles : [];
  const guestParkings = Array.isArray(rawGuestParkings) ? rawGuestParkings : [];
  const societyDocuments = Array.isArray(rawSocietyDocuments)
    ? rawSocietyDocuments
    : [];
  const assetAMCs = Array.isArray(rawAssetAMCs) ? rawAssetAMCs : [];
  const waterMeters = Array.isArray(rawWaterMeters) ? rawWaterMeters : [];

  // Login & RBAC State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("society_sim_logged") === "true";
  });
  const [userRole, setUserRole] = useState<"Admin" | "Member">(() => {
    return (
      (localStorage.getItem("society_sim_role") as "Admin" | "Member") ||
      "Admin"
    );
  });

  // Pagination States for High-Volume Datasets
  const [visitorPage, setVisitorPage] = useState<number>(1);
  const [visitorPageSize] = useState<number>(5);

  const [invoicePage, setInvoicePage] = useState<number>(1);
  const [invoicePageSize] = useState<number>(5);

  const [paymentPage, setPaymentPage] = useState<number>(1);
  const [paymentPageSize] = useState<number>(5);

  const [auditLogPage, setAuditLogPage] = useState<number>(1);
  const [auditLogPageSize] = useState<number>(5);
  const [loggedInMemberFlat, setLoggedInMemberFlat] = useState<string>(() => {
    return localStorage.getItem("society_sim_member_flat") || "";
  });

  const activeResidentMember = members.find(
    (m) => m.FlatNo === loggedInMemberFlat,
  ) || {
    FlatNo: loggedInMemberFlat,
    OwnerName: "Resident",
    Balance: 0,
    Status: "Owner" as const,
  };

  // Automatically clear credential textboxes when logged out
  useEffect(() => {
    if (!isLoggedIn) {
      setLoginEmailOrPhone("");
      setLoginPasscode("");
      setPassword("");
    }
  }, [isLoggedIn]);

  const [loginRole, setLoginRole] = useState<"Admin" | "Member">("Admin");
  const [selectedMemberFlat, setSelectedMemberFlat] = useState<string>("");

  // New Feature States
  const [viewDuesHistoryMember, setViewDuesHistoryMember] = useState<Member | null>(null);
  const [showCsvImportModal, setShowCsvImportModal] = useState<boolean>(false);
  const [autoNotifyResidentOnGateCheckIn, setAutoNotifyResidentOnGateCheckIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("society_auto_notify_visitor");
    return saved !== null ? saved === "true" : true;
  });
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [pendingOfflineOpsCount, setPendingOfflineOpsCount] = useState<number>(0);

  useEffect(() => {
    const checkQueue = async () => {
      const queue = await getPendingOfflineQueue();
      setPendingOfflineOpsCount(queue.length);
    };
    checkQueue();

    const handleOnline = async () => {
      setIsOffline(false);
      triggerToast("🌐 Network connection restored. Syncing IndexedDB offline updates...");
      const res = await syncOfflineQueue(async () => true);
      if (res.syncedCount > 0) {
        triggerToast(`✅ Successfully synchronized ${res.syncedCount} offline updates!`);
      }
      checkQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
      triggerToast("⚡ Network offline. Updates will queue to IndexedDB.");
    };

    const handleQueueUpdated = () => {
      checkQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("society_offline_queue_updated", handleQueueUpdated);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("society_offline_queue_updated", handleQueueUpdated);
    };
  }, []);

  const handleToggleAutoNotifyVisitor = () => {
    const nextVal = !autoNotifyResidentOnGateCheckIn;
    setAutoNotifyResidentOnGateCheckIn(nextVal);
    localStorage.setItem("society_auto_notify_visitor", String(nextVal));
    triggerToast(
      nextVal
        ? "Auto-notify Resident on Gate Check-in ENABLED"
        : "Auto-notify Resident on Gate Check-in DISABLED"
    );
  };
  const [zoomScale, setZoomScale] = useState<number>(() => {
    const saved = localStorage.getItem("society_sim_zoom");
    return saved ? parseFloat(saved) : 0.8;
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      // Treat viewports narrower than 1024px as real mobile devices for full-screen view
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Clear selected flat if society switches
    setSelectedMemberFlat("");
  }, [activeSocietyId]);

  const activeSocietyObj = societies?.find((s) => s.id === activeSocietyId);
  const activeStructureType =
    activeSocietyObj?.StructureType || (hasWings ? "wings" : "standalone");
  const activeTowers = activeSocietyObj?.Towers || [];
  const activeFeatures: FeatureFlags = activeSocietyObj?.FeaturesEnabled || {
    gatekeeper: true,
    waterMeters: false,
    tenantRegister: true,
    amenities: true,
    assetAMC: false,
    parkingRegister: true,
    documentVault: true,
  };

  const enabledModules: Record<string, boolean> = {
    staff_tracking: activeFeatures.staff_tracking ?? true,
    noc_workflow: activeFeatures.noc_workflow ?? true,
    asset_inventory: activeFeatures.asset_inventory ?? true,
    ...(activeSocietyObj?.FeaturesEnabled as unknown as Record<string, boolean> || {}),
  };

  const handleZoomChange = (scale: number) => {
    setZoomScale(scale);
    localStorage.setItem("society_sim_zoom", String(scale));
  };

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Credentials-based login states
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState(() => {
    return localStorage.getItem("society_sim_logged_email_or_phone") || "";
  });
  const [loginPasscode, setLoginPasscode] = useState("");
  const [matchedProperties, setMatchedProperties] = useState<Member[]>([]);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(() => {
    return localStorage.getItem("society_sim_logged_email") || "";
  });
  const [loggedInUserContact, setLoggedInUserContact] = useState(() => {
    return localStorage.getItem("society_sim_logged_contact") || "";
  });

  // OTP-Based Verification & Multi-Factor Simulation States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState("");
  const [userOtpInput, setUserOtpInput] = useState("");
  const [pendingAuthMatches, setPendingAuthMatches] = useState<Member[]>([]);
  const [smsBanner, setSmsBanner] = useState<string | null>(null);
  const [mfaLogs, setMfaLogs] = useState<any[]>([]);

  // Custom persistent passcodes & Password Reset States
  const [customPasscodes, setCustomPasscodes] = useState<
    Record<string, string>
  >(() => {
    const saved = localStorage.getItem("society_sim_custom_passcodes");
    return saved ? JSON.parse(saved) : {};
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotRole, setForgotRole] = useState<"Admin" | "Member">("Member");
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [forgotOtpInput, setForgotOtpInput] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

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
  const [currentTab, setCurrentTab] = useState<
    | "dashboard"
    | "members"
    | "payments"
    | "expenses"
    | "complaints"
    | "notices"
    | "amenities"
    | "emergency"
    | "tenants"
    | "parking"
    | "documents"
    | "amc"
    | "watermeters"
    | "polls"
    | "staff"
    | "vendors"
  >("dashboard");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [complaintFilter, setComplaintFilter] = useState<
    "All" | "Open" | "In Progress" | "Resolved"
  >("All");

  // Tier 1 Feature States
  // Emergency Contacts
  const [showAddEmergencyModal, setShowAddEmergencyModal] = useState(false);
  const [emergencyFilterCategory, setEmergencyFilterCategory] =
    useState<string>("All");
  const [newEmergName, setNewEmergName] = useState("");
  const [newEmergCategory, setNewEmergCategory] =
    useState<EmergencyContact["Category"]>("Police");
  const [newEmergPhone, setNewEmergPhone] = useState("");
  const [newEmergRoleTitle, setNewEmergRoleTitle] = useState("");
  const [editingEmergContact, setEditingEmergContact] =
    useState<EmergencyContact | null>(null);

  // Tenant Register & KYC
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [tenantFilterKyc, setTenantFilterKyc] = useState<
    "All" | "Pending" | "Verified" | "Rejected"
  >("All");
  const [newTenFlatNo, setNewTenFlatNo] = useState("");
  const [newTenName, setNewTenName] = useState("");
  const [newTenPhone, setNewTenPhone] = useState("");
  const [newTenEmail, setNewTenEmail] = useState("");
  const [newTenMoveIn, setNewTenMoveIn] = useState("");
  const [newTenMoveOut, setNewTenMoveOut] = useState("");
  const [newTenAgreementUrl, setNewTenAgreementUrl] = useState("");
  const [newTenIdProofUrl, setNewTenIdProofUrl] = useState("");
  const [activeKycReviewTenant, setActiveKycReviewTenant] =
    useState<Tenant | null>(null);
  const [kycRemarksInput, setKycRemarksInput] = useState("");
  const [viewingDocModal, setViewingDocModal] = useState<{
    title: string;
    url: string;
    label: string;
  } | null>(null);

  // Vehicle & Guest Parking Register
  const [parkingSubTab, setParkingSubTab] = useState<"resident" | "guest">(
    "resident",
  );
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehFlatNo, setNewVehFlatNo] = useState("");
  const [newVehOwnerName, setNewVehOwnerName] = useState("");
  const [newVehNo, setNewVehNo] = useState("");
  const [newVehType, setNewVehType] = useState<
    "2-Wheeler" | "4-Wheeler" | "Other"
  >("4-Wheeler");
  const [newVehSlotNo, setNewVehSlotNo] = useState("");
  const [newVehStickerIssued, setNewVehStickerIssued] = useState(true);

  const [showAddGuestParkingModal, setShowAddGuestParkingModal] =
    useState(false);
  const [newGPassFlatNo, setNewGPassFlatNo] = useState("");
  const [newGPassGuestName, setNewGPassGuestName] = useState("");
  const [newGPassVehNo, setNewGPassVehNo] = useState("");
  const [newGPassVehType, setNewGPassVehType] = useState<
    "2-Wheeler" | "4-Wheeler"
  >("4-Wheeler");
  const [newGPassSlot, setNewGPassSlot] = useState("");
  const [newGPassValidFrom, setNewGPassValidFrom] = useState("");
  const [newGPassValidUntil, setNewGPassValidUntil] = useState("");

  // Tier 2 Feature States
  // 1. Society Document Repository
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docFilterCategory, setDocFilterCategory] = useState<string>("All");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] =
    useState<SocietyDocument["Category"]>("Legal Documents");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocFileName, setNewDocFileName] = useState("");
  const [newDocIsPublic, setNewDocIsPublic] = useState(true);
  const [newDocNotes, setNewDocNotes] = useState("");
  const [previewingSocietyDoc, setPreviewingSocietyDoc] =
    useState<SocietyDocument | null>(null);

  // 2. Lift Maintenance & AMC Register
  const [showAddAmcModal, setShowAddAmcModal] = useState(false);
  const [amcFilterCategory, setAmcFilterCategory] = useState<string>("All");
  const [newAmcAssetName, setNewAmcAssetName] = useState("");
  const [newAmcCategory, setNewAmcCategory] =
    useState<AssetAMC["Category"]>("Lift / Elevator");
  const [newAmcVendorName, setNewAmcVendorName] = useState("");
  const [newAmcTechName, setNewAmcTechName] = useState("");
  const [newAmcTechContact, setNewAmcTechContact] = useState("");
  const [newAmcStartDate, setNewAmcStartDate] = useState("");
  const [newAmcExpiryDate, setNewAmcExpiryDate] = useState("");
  const [newAmcLastServiced, setNewAmcLastServiced] = useState("");
  const [newAmcNextDue, setNewAmcNextDue] = useState("");
  const [newAmcContractValue, setNewAmcContractValue] = useState("50000");
  const [newAmcRemarks, setNewAmcRemarks] = useState("");
  const [newAmcReportUrl, setNewAmcReportUrl] = useState("");
  const [editingAmcItem, setEditingAmcItem] = useState<AssetAMC | null>(null);
  const [showServiceLogModal, setShowServiceLogModal] =
    useState<AssetAMC | null>(null);
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [nextServiceDueDate, setNextServiceDueDate] = useState("");
  const [serviceReportUrl, setServiceReportUrl] = useState("");

  // 3 & 4. Water Meters, Consumption & Water Tank Cleaning Register
  const [waterSubTab, setWaterSubTab] = useState<"meters" | "tanks">("meters");
  const [showBatchWaterMeterModal, setShowBatchWaterMeterModal] =
    useState(false);
  const [waterReadingMonth, setWaterReadingMonth] = useState("July 2026");
  const [batchMeterReadings, setBatchMeterReadings] = useState<
    {
      flatNo: string;
      currentReading: string;
      prevReading: number;
      unitRate: number;
    }[]
  >([]);
  const [showAddTankCleaningModal, setShowAddTankCleaningModal] =
    useState(false);
  const [tankName, setTankName] = useState("Overhead Tank A");
  const [tankCapacity, setTankCapacity] = useState("50,000 Liters");
  const [tankLastCleaned, setTankLastCleaned] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tankNextDue, setTankNextDue] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
  );
  const [tankVendor, setTankVendor] = useState("AquaClean Services");
  const [tankReportUrl, setTankReportUrl] = useState("");

  // 1. Dashboard Urgent Emergency Alert Banner State
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);
  const [showBroadcastAlertModal, setShowBroadcastAlertModal] = useState(false);
  const [activeAlertBanner, setActiveAlertBanner] = useState({
    id: "alert-1",
    title: "🚨 URGENT ANNOUNCEMENT: Overhead Water Tank Deep Cleaning",
    message:
      "Society water tank cleaning in progress. Water supply will be suspended on Thursday from 10:00 AM to 4:00 PM. Please store adequate water in advance.",
    priority: "Emergency",
    timestamp: "Today, 09:00 AM",
  });
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // 2. Real-Time Push Notification Center State
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<
    "all" | "unread"
  >("all");

  // Priority 2 Feature States: Domestic Staff & Gatekeeper Console
  const [staffSubTab, setStaffSubTab] = useState<
    "directory" | "gatekeeper" | "attendance"
  >("directory");
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffServiceFilter, setStaffServiceFilter] = useState<string>("All");
  const [staffNameInput, setStaffNameInput] = useState("");
  const [staffPhoneInput, setStaffPhoneInput] = useState("");
  const [staffServiceTypeInput, setStaffServiceTypeInput] =
    useState<Staff["ServiceType"]>("Maid");
  const [staffPhotoUrlInput, setStaffPhotoUrlInput] = useState("");
  const [staffPasscodeInput, setStaffPasscodeInput] = useState("");
  const [staffAssignedFlatsInput, setStaffAssignedFlatsInput] =
    useState("101, 102");
  const [staffIdStatusInput, setStaffIdStatusInput] = useState<
    "Verified" | "Pending" | "Rejected"
  >("Verified");
  const [gatePasscodeInput, setGatePasscodeInput] = useState("");
  const [gatekeeperNameInput, setGatekeeperNameInput] = useState(
    "Gate 1 Security (Ramesh)",
  );
  const [gateCheckInAlert, setGateCheckInAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Priority 2 Feature States: Vendors & Dual Approval
  const [vendorSubTab, setVendorSubTab] = useState<
    "vendors" | "expenses_approval" | "contracts"
  >("vendors");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [vendorCategoryFilter, setVendorCategoryFilter] =
    useState<string>("All");
  const [vendorNameInput, setVendorNameInput] = useState("");
  const [vendorCategoryInput, setVendorCategoryInput] =
    useState<Vendor["ServiceCategory"]>("Security Agency");
  const [vendorGstInput, setVendorGstInput] = useState("");
  const [vendorContactPersonInput, setVendorContactPersonInput] = useState("");
  const [vendorPhoneInput, setVendorPhoneInput] = useState("");
  const [vendorBankNameInput, setVendorBankNameInput] = useState("HDFC Bank");
  const [vendorAccNoInput, setVendorAccNoInput] = useState("");
  const [vendorIfscInput, setVendorIfscInput] = useState("HDFC0001234");
  const [vendorContractDocUrlInput, setVendorContractDocUrlInput] =
    useState("");
  const [vendorContractEndInput, setVendorContractEndInput] =
    useState("2027-03-31");

  // Expense Dual Approval Filters
  const [expenseApprovalFilter, setExpenseApprovalFilter] = useState<
    "All" | "Pending Approval" | "Approved" | "Rejected"
  >("All");
  const [reviewingDualExpense, setReviewingDualExpense] =
    useState<Expense | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      category: "gate" | "notice" | "payment" | "amenity" | "emergency";
      timestamp: string;
      read: boolean;
      targetTab?:
        | "dashboard"
        | "notices"
        | "payments"
        | "amenities"
        | "emergency"
        | "tenants"
        | "parking";
    }>
  >([
    {
      id: "notif-1",
      title: "🚪 Gate Visitor Check-in",
      message:
        'Visitor "Rajesh Sharma" (MH-12-AB-3456) checked in at Gate 1 for Flat 101.',
      category: "gate",
      timestamp: "10 mins ago",
      read: false,
      targetTab: "dashboard",
    },
    {
      id: "notif-2",
      title: "🚨 Emergency Water Supply Alert",
      message:
        "Water tank deep cleaning on Thursday 10 AM - 4 PM. Water supply will be paused.",
      category: "emergency",
      timestamp: "1 hour ago",
      read: false,
      targetTab: "notices",
    },
    {
      id: "notif-3",
      title: "💳 Monthly Maintenance Invoice Issued",
      message:
        "July 2026 Maintenance Bill for ₹3,500 has been generated and is ready for payment.",
      category: "payment",
      timestamp: "3 hours ago",
      read: false,
      targetTab: "payments",
    },
    {
      id: "notif-4",
      title: "🏊 Amenity Booking Approved",
      message:
        "Clubhouse reservation request for Saturday 6:00 PM - 10:00 PM is APPROVED.",
      category: "amenity",
      timestamp: "1 day ago",
      read: true,
      targetTab: "amenities",
    },
  ]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast("All notifications marked as read!");
  };

  const handleSimulateNewPush = () => {
    const newAlert = {
      id: `notif-${Date.now()}`,
      title: "⚡ Gate Authorization Alert",
      message:
        'Delivery Partner "Aman Verma" (Zomato) is at Gate 1 requesting entry.',
      category: "gate" as const,
      timestamp: "Just now",
      read: false,
      targetTab: "dashboard" as const,
    };
    setNotifications((prev) => [newAlert, ...prev]);
    triggerToast("⚡ Push Alert Received: Zomato Delivery at Gate 1!");
  };

  // 3. One-Click Ledger PDF / Print Statement Modal State
  const [showPrintLedgerModal, setShowPrintLedgerModal] = useState(false);

  // In-App Help & Feature Catalog States
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showFeatureCatalogModal, setShowFeatureCatalogModal] = useState(false);

  const handleDownloadLedgerCSV = (flatNo: string) => {
    const flatInvoices = invoices.filter(
      (inv) => inv.SocietyId === activeSocietyId && inv.FlatNo === flatNo,
    );
    const flatPayments = payments.filter(
      (pmt) => pmt.SocietyId === activeSocietyId && pmt.FlatNo === flatNo,
    );

    let csv = `Society Name,${societyName}\nFlat Number,${flatNo}\nGenerated On,${new Date().toLocaleDateString()}\n\n`;
    csv += `Type,Date/Month,Description,Amount (INR),Mode/Status\n`;

    flatInvoices.forEach((inv) => {
      csv += `Invoice,${inv.BillMonth},Maintenance Bill,${inv.TotalAmount},${inv.Status}\n`;
    });
    flatPayments.forEach((pmt) => {
      csv += `Payment,${pmt.Date},Dues Payment,${pmt.Amount},${pmt.Mode}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Society_Ledger_Flat_${flatNo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(`Ledger CSV statement downloaded for Flat ${flatNo}!`);
  };

  // Detail Modal States
  const [activeMemberDetail, setActiveMemberDetail] = useState<Member | null>(
    null,
  );
  const [activeComplaintDetail, setActiveComplaintDetail] =
    useState<Complaint | null>(null);
  const [activeNoticeDetail, setActiveNoticeDetail] = useState<Notice | null>(
    null,
  );

  // Form Modal States
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  // Visitor Simulator States
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [newVisName, setNewVisName] = useState("");
  const [newVisPurpose, setNewVisPurpose] = useState("Delivery");
  const [newVisContact, setNewVisContact] = useState("");
  const [newVisVehicle, setNewVisVehicle] = useState("");
  const [newVisFlatNo, setNewVisFlatNo] = useState("");

  // Automated Billing Engine States
  const [billingMonth, setBillingMonth] = useState("July 2026");
  const [billBase, setBillBase] = useState("2000");
  const [billWater, setBillWater] = useState("300");
  const [billSecurity, setBillSecurity] = useState("200");
  const [billParking, setBillParking] = useState("100");
  const [showBillingEngine, setShowBillingEngine] = useState(false);

  // Automated Notice states when resolving complaint
  const [autoNoticeEnabled, setAutoNoticeEnabled] = useState(false);
  const [autoNoticeType, setAutoNoticeType] = useState<"society" | "member">(
    "society",
  );
  const [autoNoticeTitle, setAutoNoticeTitle] = useState("");
  const [autoNoticeContent, setAutoNoticeContent] = useState("");

  // Broadcast Notice Modal States
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState<
    "General" | "Maintenance" | "Meeting" | "Event" | "Security"
  >("General");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeFileUrl, setNewNoticeFileUrl] = useState("");
  const [newNoticeFileName, setNewNoticeFileName] = useState("");
  const [newNoticeFileSize, setNewNoticeFileSize] = useState("");

  // Circular Preview Modal States
  const [previewingNotice, setPreviewingNotice] = useState<Notice | null>(null);
  const [viewerZoom, setViewerZoom] = useState(100);

  // Custom states for Audit log view and Member dues UPI pay modal
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showMemberPayModal, setShowMemberPayModal] = useState(false);
  const [memberPayAmount, setMemberPayAmount] = useState("");
  const [memberPayMode, setMemberPayMode] = useState<
    "UPI" | "Card" | "Netbanking"
  >("UPI");

  // Inline Member Edit States
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editVehicle, setEditVehicle] = useState("");

  // Form Field States
  const [payFlatNo, setPayFlatNo] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<
    "UPI" | "Bank Transfer" | "Cash" | "Cheque"
  >("UPI");
  const [payRef, setPayRef] = useState("");

  const [expCategory, setExpCategory] = useState<
    | "Maintenance"
    | "Security"
    | "Water"
    | "Electricity"
    | "Repairs"
    | "Gardening"
    | "Salary"
    | "Others"
  >("Maintenance");
  const [expAmount, setExpAmount] = useState("");
  const [expVendor, setExpVendor] = useState("");
  const [expInvoice, setExpInvoice] = useState("");

  const [compFlatNo, setCompFlatNo] = useState("");
  const [compCategory, setCompCategory] = useState<
    | "Plumbing"
    | "Electrical"
    | "Security"
    | "Cleanliness"
    | "Parking"
    | "Noisy Neighbor"
    | "Others"
  >("Plumbing");
  const [compTitle, setCompTitle] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compUrgency, setCompUrgency] = useState<"Low" | "Medium" | "High">(
    "Medium",
  );

  const staffList = rawStaffList;
  const staffAttendanceList = rawStaffAttendanceList;
  const vendorList = rawVendorList;

  // Society settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSocietyName, setTempSocietyName] = useState(societyName || "");
  const [tempHasWings, setTempHasWings] = useState(hasWings || false);
  const [tempWingsList, setTempWingsList] = useState(
    (wingsList || []).join(", "),
  );
  const [tempPostalAddress, setTempPostalAddress] = useState(
    postalAddress || "",
  );
  const [tempBuildingType, setTempBuildingType] = useState(
    buildingType || "Housing Society",
  );
  const [tempStructureType, setTempStructureType] = useState<
    "standalone" | "wings" | "towers_wings"
  >("standalone");
  const [tempTowers, setTempTowers] = useState<any[]>([]);
  const [tempFeatures, setTempFeatures] =
    useState<FeatureFlags>(activeFeatures);
  const [settingsSubTab, setSettingsSubTab] = useState<
    "general" | "features" | "billing"
  >("general");

  // Financial Core: Billing Engine & Payment Gateway Settings States
  const [tempBillingMode, setTempBillingMode] = useState<
    "Flat Rate" | "SqFt Rate" | "Hybrid"
  >(activeSocietyObj?.BillingMode || "Flat Rate");
  const [tempRatePerSqFt, setTempRatePerSqFt] = useState<number>(
    activeSocietyObj?.RatePerSqFt || 3.5,
  );
  const [tempFlatRateAmount, setTempFlatRateAmount] = useState<number>(
    activeSocietyObj?.FlatRateAmount || 2500,
  );
  const [tempBaseUtilityAmount, setTempBaseUtilityAmount] = useState<number>(
    activeSocietyObj?.BaseUtilityAmount || 300,
  );
  const [tempLateFeeType, setTempLateFeeType] = useState<"Interest" | "Fixed">(
    activeSocietyObj?.LateFeeType || "Fixed",
  );
  const [tempLateFeeValue, setTempLateFeeValue] = useState<number>(
    activeSocietyObj?.LateFeeValue || 200,
  );
  const [tempDueDateDay, setTempDueDateDay] = useState<number>(
    activeSocietyObj?.DueDateDay || 10,
  );
  const [tempGatewayEnabled, setTempGatewayEnabled] = useState<boolean>(
    activeSocietyObj?.GatewayEnabled ?? true,
  );
  const [tempGatewayProvider, setTempGatewayProvider] = useState<
    "Razorpay" | "Cashfree" | "Manual"
  >(activeSocietyObj?.GatewayProvider || "Razorpay");
  const [tempGatewayApiKey, setTempGatewayApiKey] = useState<string>(
    activeSocietyObj?.GatewayApiKey || "rzp_live_demo_key_9876",
  );
  const [tempUPI_ID, setTempUPI_ID] = useState<string>(
    activeSocietyObj?.UPI_ID || "greenwoodresidency@icici",
  );

  // Sync temp values when societyName/hasWings/wingsList changes from outside
  const wingsListStr = (wingsList || []).join(",");
  useEffect(() => {
    setTempSocietyName(societyName || "");
    setTempHasWings(hasWings || false);
    setTempWingsList((wingsList || []).join(", "));
    setTempPostalAddress(postalAddress || "");
    setTempBuildingType(buildingType || "Housing Society");
    if (activeSocietyObj?.FeaturesEnabled) {
      setTempFeatures(activeSocietyObj.FeaturesEnabled);
    }
    if (activeSocietyObj) {
      setTempBillingMode(activeSocietyObj.BillingMode || "Flat Rate");
      setTempRatePerSqFt(activeSocietyObj.RatePerSqFt || 3.5);
      setTempFlatRateAmount(activeSocietyObj.FlatRateAmount || 2500);
      setTempBaseUtilityAmount(activeSocietyObj.BaseUtilityAmount || 300);
      setTempLateFeeType(activeSocietyObj.LateFeeType || "Fixed");
      setTempLateFeeValue(activeSocietyObj.LateFeeValue || 200);
      setTempDueDateDay(activeSocietyObj.DueDateDay || 10);
      setTempGatewayEnabled(activeSocietyObj.GatewayEnabled ?? true);
      setTempGatewayProvider(activeSocietyObj.GatewayProvider || "Razorpay");
      setTempGatewayApiKey(
        activeSocietyObj.GatewayApiKey || "rzp_live_demo_key_9876",
      );
      setTempUPI_ID(activeSocietyObj.UPI_ID || "greenwoodresidency@icici");
    }
  }, [
    societyName,
    hasWings,
    wingsListStr,
    postalAddress,
    buildingType,
    activeSocietyObj,
  ]);

  // Member form state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memFlatNo, setMemFlatNo] = useState("");
  const [memOwnerName, setMemOwnerName] = useState("");
  const [memContactNo, setMemContactNo] = useState("");
  const [memEmail, setMemEmail] = useState("");
  const [memBalance, setMemBalance] = useState("");
  const [memAreaSqFt, setMemAreaSqFt] = useState("850");
  const [memStatus, setMemStatus] = useState<"Owner" | "Tenant">("Owner");
  const [memCoOwners, setMemCoOwners] = useState("");
  const [memVehicleNo, setMemVehicleNo] = useState("");
  const [memWing, setMemWing] = useState("");
  const [memTower, setMemTower] = useState("");
  const [selectedWingFilter, setSelectedWingFilter] = useState("All");

  // Polls & Democratic Resolutions State
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDescription, setNewPollDescription] = useState("");
  const [newPollCategory, setNewPollCategory] = useState<
    | "AGM Resolution"
    | "Maintenance Hike"
    | "Amenity Proposal"
    | "Security Policy"
    | "General Society Vote"
  >("AGM Resolution");
  const [newPollStartDate, setNewPollStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newPollEndDate, setNewPollEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );

  // Payment Gateway SDK Modal Simulation State
  const [showGatewayCheckoutModal, setShowGatewayCheckoutModal] =
    useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutFlatNo, setCheckoutFlatNo] = useState("");
  const [isProcessingGatewayPay, setIsProcessingGatewayPay] = useState(false);

  // Sync / Loader status
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (!replyText.trim() || !activeComplaintDetail) return;

    let senderName = "Resident Member";
    let senderRole: "Admin" | "Member" = "Member";

    if (userRole === "Admin") {
      senderName = "Committee Admin (Secretary)";
      senderRole = "Admin";
    } else {
      const activeMember = members.find((m) => m.FlatNo === loggedInMemberFlat);
      senderName = activeMember
        ? `${activeMember.OwnerName} (Flat ${activeMember.FlatNo})`
        : `Flat ${loggedInMemberFlat}`;
      senderRole = "Member";
    }

    if (onAddComplaintReply) {
      onAddComplaintReply({
        ComplaintId: activeComplaintDetail.id,
        SocietyId: activeSocietyId,
        SenderName: senderName,
        SenderRole: senderRole,
        Message: replyText.trim(),
        Timestamp: new Date().toISOString(),
      });
      setReplyText("");
      triggerToast("Response posted successfully!");
    }
  };

  const normalizePhone = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "");
    return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
  };

  const isEmail = (val: string) => {
    return val.includes("@");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (loginRole === "Admin") {
      const adminEmailInput = loginEmailOrPhone.trim().toLowerCase();
      if (!adminEmailInput) {
        setPasswordError("Please enter Admin Email");
        return;
      }
      if (!password) {
        setPasswordError("Please enter Security Gate Code");
        return;
      }

      const customAdminPass = customPasscodes[adminEmailInput];
      const validPass = customAdminPass || "admin123";

      if (password === validPass) {
        const adminMember = allMembers.find(
          (m) =>
            m.Email &&
            m.Email.trim().toLowerCase() === adminEmailInput &&
            m.Role === "Admin",
        );

        let targetSocietyId =
          adminMember && adminMember.SocietyId ? adminMember.SocietyId : null;

        // Fallback: Intelligent parsing for admin emails if no explicit database entry exists
        if (!targetSocietyId) {
          if (
            adminEmailInput.includes("greenwood") ||
            adminEmailInput.includes("greewood")
          ) {
            targetSocietyId = "greenwood";
          } else if (
            adminEmailInput.includes("royalheights") ||
            adminEmailInput.includes("royal_heights") ||
            adminEmailInput.includes("royal")
          ) {
            targetSocietyId = "royal_heights";
          } else if (
            adminEmailInput.includes("seabreeze") ||
            adminEmailInput.includes("sea_breeze") ||
            adminEmailInput.includes("breeze")
          ) {
            targetSocietyId = "sea_breeze";
          }
        }

        setIsLoggedIn(true);
        setUserRole("Admin");
        setLoggedInMemberFlat("");
        localStorage.setItem("society_sim_logged", "true");
        localStorage.setItem("society_sim_role", "Admin");
        localStorage.setItem("society_sim_member_flat", "");
        localStorage.setItem(
          "society_sim_logged_email_or_phone",
          adminEmailInput,
        );

        if (targetSocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(targetSocietyId);
          localStorage.setItem("active_society_id", targetSocietyId);
          triggerToast(
            `Authorized as Admin for ${societies.find((s) => s.id === targetSocietyId)?.Name || "Society"}`,
          );
        } else {
          triggerToast("Authorized as Committee Admin");
        }
        setPasswordError("");
      } else {
        setPasswordError(
          `Invalid Security Code. Please check or use "Forgot Code" if you reset it.`,
        );
      }
    } else {
      const inputVal = loginEmailOrPhone.trim().toLowerCase();
      const inputPass = loginPasscode.trim();

      if (!inputVal) {
        setPasswordError(
          "Please enter your registered Email or Contact Number",
        );
        return;
      }
      if (!inputPass) {
        setPasswordError(
          "Please enter your password / registered Contact Number",
        );
        return;
      }

      const matches = allMembers.filter((m) => {
        const inputLower = inputVal.trim().toLowerCase();
        if (isEmail(inputVal)) {
          return m.Email && m.Email.trim().toLowerCase() === inputLower;
        } else if (
          m.OwnerName &&
          m.OwnerName.toLowerCase().includes(inputLower)
        ) {
          return true;
        } else {
          const mPhoneClean = m.ContactNo ? normalizePhone(m.ContactNo) : "";
          const inputPhoneClean = normalizePhone(inputVal);
          return (
            mPhoneClean && inputPhoneClean && mPhoneClean === inputPhoneClean
          );
        }
      });

      if (matches.length === 0) {
        setPasswordError(
          "Credentials not registered. Please contact your society committee.",
        );
        return;
      }

      const verifiedMatches = matches.filter((m) => {
        const key = m.Email
          ? m.Email.trim().toLowerCase()
          : m.ContactNo
            ? normalizePhone(m.ContactNo)
            : "";
        const customPass = key ? customPasscodes[key] : null;
        if (customPass && inputPass === customPass) {
          return true;
        }
        if (inputPass === "1234" || inputPass === "member123") {
          return true;
        }
        const mPhoneClean = m.ContactNo ? normalizePhone(m.ContactNo) : "";
        const passPhoneClean = normalizePhone(inputPass);
        return mPhoneClean && passPhoneClean && mPhoneClean === passPhoneClean;
      });

      if (verifiedMatches.length === 0) {
        setPasswordError(
          "Incorrect passcode. Enter your custom passcode or registered Contact Number.",
        );
        return;
      }

      setLoggedInUserEmail(verifiedMatches[0].Email || "");
      setLoggedInUserContact(verifiedMatches[0].ContactNo || "");
      localStorage.setItem(
        "society_sim_logged_email",
        verifiedMatches[0].Email || "",
      );
      localStorage.setItem(
        "society_sim_logged_contact",
        verifiedMatches[0].ContactNo || "",
      );
      localStorage.setItem("society_sim_logged_email_or_phone", inputVal);

      if (mfaEnabled) {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        setActiveOtpCode(code);
        setPendingAuthMatches(verifiedMatches);
        setUserOtpInput("");
        setShowOtpOverlay(true);
        setSmsBanner(
          `💬 GreenSecurID: Your login OTP is [ ${code} ]. Valid for 5 mins.`,
        );

        const newLog = {
          id: `MFA-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: "MFA Initiated",
          details: `Simulated OTP generated and sent to SMS container. Code: ${code}`,
          status: "Pending",
        };
        setMfaLogs((prev) => [newLog, ...prev]);
        triggerToast("Simulated OTP Sent!");
        return;
      }

      if (verifiedMatches.length === 1) {
        const singleUser = verifiedMatches[0];
        setIsLoggedIn(true);
        setUserRole("Member");
        setLoggedInMemberFlat(singleUser.FlatNo);
        localStorage.setItem("society_sim_logged", "true");
        localStorage.setItem("society_sim_role", "Member");
        localStorage.setItem("society_sim_member_flat", singleUser.FlatNo);

        if (singleUser.SocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(singleUser.SocietyId);
          localStorage.setItem("active_society_id", singleUser.SocietyId);
        }

        setPasswordError("");
        triggerToast(`Signed in to Flat ${singleUser.FlatNo}`);
      } else {
        setMatchedProperties(verifiedMatches);
        setShowPropertySelector(true);
        setPasswordError("");
      }
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtpInput.trim() === activeOtpCode) {
      const newLog = {
        id: `MFA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: "MFA Verified",
        details: "Correct OTP entered. Granted secure session access.",
        status: "Success",
      };
      setMfaLogs((prev) => [newLog, ...prev]);

      setShowOtpOverlay(false);
      setUserOtpInput("");

      if (pendingAuthMatches.length === 1) {
        const singleUser = pendingAuthMatches[0];
        setIsLoggedIn(true);
        setUserRole("Member");
        setLoggedInMemberFlat(singleUser.FlatNo);
        localStorage.setItem("society_sim_logged", "true");
        localStorage.setItem("society_sim_role", "Member");
        localStorage.setItem("society_sim_member_flat", singleUser.FlatNo);

        if (singleUser.SocietyId && onChangeActiveSociety) {
          onChangeActiveSociety(singleUser.SocietyId);
          localStorage.setItem("active_society_id", singleUser.SocietyId);
        }

        setPasswordError("");
        triggerToast(`Signed in securely to Flat ${singleUser.FlatNo}`);
      } else if (pendingAuthMatches.length > 1) {
        setMatchedProperties(pendingAuthMatches);
        setShowPropertySelector(true);
        setPasswordError("");
      }
    } else {
      const newLog = {
        id: `MFA-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: "MFA Failure",
        details: `Incorrect OTP entered: "${userOtpInput}". Expected: ${activeOtpCode}`,
        status: "Blocked",
      };
      setMfaLogs((prev) => [newLog, ...prev]);
      triggerToast("Invalid OTP! Access Denied.");
    }
  };

  const handleSelectProperty = (property: Member) => {
    setIsLoggedIn(true);
    setUserRole("Member");
    setLoggedInMemberFlat(property.FlatNo);
    localStorage.setItem("society_sim_logged", "true");
    localStorage.setItem("society_sim_role", "Member");
    localStorage.setItem("society_sim_member_flat", property.FlatNo);

    if (property.SocietyId && onChangeActiveSociety) {
      onChangeActiveSociety(property.SocietyId);
      localStorage.setItem("active_society_id", property.SocietyId);
    }

    setShowPropertySelector(false);
    triggerToast(
      `Entered Flat ${property.FlatNo} at ${societies.find((s) => s.id === property.SocietyId)?.Name || "Society"}`,
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("Admin");
    setLoggedInMemberFlat("");
    setLoggedInUserEmail("");
    setLoggedInUserContact("");
    setMatchedProperties([]);
    setShowPropertySelector(false);
    setLoginEmailOrPhone("");
    setLoginPasscode("");
    setPassword("");
    localStorage.removeItem("society_sim_logged");
    localStorage.removeItem("society_sim_role");
    localStorage.removeItem("society_sim_member_flat");
    localStorage.removeItem("society_sim_logged_email");
    localStorage.removeItem("society_sim_logged_contact");
    localStorage.removeItem("society_sim_logged_email_or_phone");
    setSearchQuery("");
    triggerToast("Logged out of system");
  };

  const handleManualRefresh = async () => {
    setSyncing(true);
    await onRefresh();
    setSyncing(false);
    triggerToast(
      scriptUrl ? "Synced with Database!" : "Mock Sandbox refreshed",
    );
  };

  // Touch Pull-to-Refresh Gesture Handling
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartYRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      touchStartYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    } else {
      setIsPulling(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPulling || !scrollContainerRef.current) return;
    if (scrollContainerRef.current.scrollTop > 0) {
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, 65));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= 40 && !syncing) {
      await handleManualRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  // Society settings submit
  const handleSaveSocietySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const wings = tempWingsList
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w !== "");
    onUpdateSocietySettings(
      tempSocietyName,
      tempHasWings,
      wings,
      tempPostalAddress,
      tempBuildingType,
      tempStructureType,
      tempTowers,
      tempFeatures,
      {
        BillingMode: tempBillingMode,
        RatePerSqFt: tempRatePerSqFt,
        FlatRateAmount: tempFlatRateAmount,
        BaseUtilityAmount: tempBaseUtilityAmount,
        LateFeeType: tempLateFeeType,
        LateFeeValue: tempLateFeeValue,
        DueDateDay: tempDueDateDay,
        GatewayEnabled: tempGatewayEnabled,
        GatewayProvider: tempGatewayProvider,
        GatewayApiKey: tempGatewayApiKey,
        UPI_ID: tempUPI_ID,
      },
    );
    setShowSettingsModal(false);
    triggerToast("Society Financial Core & Settings updated!");
  };

  // Member form actions
  const handleOpenAddMember = () => {
    setIsEditingMember(false);
    setMemFlatNo("");
    setMemOwnerName("");
    setMemContactNo("");
    setMemEmail("");
    setMemBalance("0");
    setMemAreaSqFt("850");
    setMemStatus("Owner");
    setMemCoOwners("");
    setMemVehicleNo("");
    setMemWing(wingsList[0] || "");
    setMemTower(activeTowers[0]?.Name || "");
    setShowMemberForm(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setIsEditingMember(true);
    setMemFlatNo(member.FlatNo);
    setMemOwnerName(member.OwnerName);
    setMemContactNo(member.ContactNo);
    setMemEmail(member.Email);
    setMemBalance(String(member.Balance));
    setMemAreaSqFt(String(member.AreaSqFt || 850));
    setMemStatus(member.Status);
    setMemCoOwners(member.CoOwners || "");
    setMemVehicleNo(member.VehicleNo || "");
    setMemWing(member.Wing || wingsList[0] || "");
    setMemTower(member.Tower || activeTowers[0]?.Name || "");
    setShowMemberForm(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memFlatNo.trim() || !memOwnerName.trim()) {
      triggerToast("Flat No and Owner Name are required");
      return;
    }

    const member: Member = {
      FlatNo: memFlatNo.trim(),
      OwnerName: memOwnerName.trim(),
      ContactNo: memContactNo.trim(),
      Email: memEmail.trim(),
      Balance: parseFloat(memBalance) || 0,
      AreaSqFt: parseFloat(memAreaSqFt) || 850,
      Status: memStatus,
      CoOwners: memCoOwners.trim(),
      VehicleNo: memVehicleNo.trim(),
      Wing: activeStructureType === "standalone" ? "" : memWing,
      Tower: activeStructureType === "towers_wings" ? memTower : undefined,
    };

    onSaveOrUpdateMember(member);
    setShowMemberForm(false);
    triggerToast(
      isEditingMember
        ? "Member updated successfully!"
        : "Member added successfully!",
    );
  };

  // Submit payment form
  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFlatNo || !payAmount) {
      alert("Please fill in Flat Number and Amount.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    onAddPayment({
      Date: today,
      FlatNo: payFlatNo,
      Amount: parseFloat(payAmount),
      Mode: payMode,
      ReferenceNo: payRef,
      Status: "Cleared",
    });

    setShowPaymentForm(false);
    setPayFlatNo("");
    setPayAmount("");
    setPayRef("");
    triggerToast(`Payment logged for Flat ${payFlatNo}`);
  };

  // Submit expense form
  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expVendor) {
      alert("Please fill in Amount and Vendor.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    onAddExpense({
      Date: today,
      Category: expCategory,
      Amount: parseFloat(expAmount),
      Vendor: expVendor,
      InvoiceNo: expInvoice,
      ApprovedBy: "Committee",
    });

    setShowExpenseForm(false);
    setExpAmount("");
    setExpVendor("");
    setExpInvoice("");
    triggerToast(`Expense added: ₹${expAmount}`);
  };

  // Submit complaint form
  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFlatNo || !compTitle || !compDesc) {
      alert("Please fill in Flat, Title, and Description.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    onAddComplaint({
      FlatNo: compFlatNo,
      Category: compCategory,
      Title: compTitle,
      Description: compDesc,
      Date: today,
      Status: "Open",
      Urgency: compUrgency,
    });

    setShowComplaintForm(false);
    setCompFlatNo("");
    setCompTitle("");
    setCompDesc("");
    triggerToast("Complaint registered successfully");
  };

  // Filter lists
  const filteredMembers = (
    userRole === "Member"
      ? (Array.isArray(members) ? members : []).filter(
          (m) => m.FlatNo === loggedInMemberFlat,
        )
      : Array.isArray(members)
        ? members
        : []
  ).filter((m) => {
    if (!m) return false;
    // 1. Wing filter
    if (hasWings && selectedWingFilter !== "All") {
      if (m.Wing !== selectedWingFilter) return false;
    }
    // 2. Search query
    const q = searchQuery.toLowerCase();
    const flatNoStr = String(m.FlatNo || "");
    const ownerNameStr = String(m.OwnerName || "");
    const wingStr = String(m.Wing || "");
    return (
      flatNoStr.toLowerCase().includes(q) ||
      ownerNameStr.toLowerCase().includes(q) ||
      wingStr.toLowerCase().includes(q)
    );
  });

  const filteredComplaints = (
    userRole === "Member"
      ? complaints.filter((c) => c.FlatNo === loggedInMemberFlat)
      : complaints
  ).filter((c) => {
    if (complaintFilter === "All") return true;
    return c.Status === complaintFilter;
  });

  const filteredPayments =
    userRole === "Member"
      ? payments.filter((p) => p.FlatNo === loggedInMemberFlat)
      : payments;

  // Helper to safely extract year and month from raw date values (handles non-strings, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.)
  const getYearAndMonth = (rawDate: any) => {
    if (!rawDate) return null;
    const dateStr = String(rawDate).trim();
    // Try to match YYYY-MM-DD or similar
    let parts = dateStr.split("T")[0].split(/[-/]/);
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
  const totalIncome = (Array.isArray(payments) ? payments : []).reduce(
    (sum, p) => sum + (p ? parseFloat(String(p.Amount || 0)) || 0 : 0),
    0,
  );
  const totalExpenses = (Array.isArray(expenses) ? expenses : []).reduce(
    (sum, e) => sum + (e ? parseFloat(String(e.Amount || 0)) || 0 : 0),
    0,
  );
  const netReserve = totalIncome - totalExpenses;
  const totalPendingDues = (Array.isArray(members) ? members : []).reduce(
    (sum, m) => {
      if (!m) return sum;
      const bal = parseFloat(String(m.Balance || 0)) || 0;
      return sum + (bal > 0 ? bal : 0);
    },
    0,
  );

  const totalPrepaidDues = (Array.isArray(members) ? members : []).reduce(
    (sum, m) => {
      if (!m) return sum;
      const bal = parseFloat(String(m.Balance || 0)) || 0;
      return sum + (bal < 0 ? Math.abs(bal) : 0);
    },
    0,
  );

  const clearedCount = (Array.isArray(members) ? members : []).filter((m) => {
    if (!m) return false;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return bal <= 0;
  }).length;

  const pendingCount = (Array.isArray(members) ? members : []).filter((m) => {
    if (!m) return false;
    const bal = parseFloat(String(m.Balance || 0)) || 0;
    return bal > 0;
  }).length;

  // Helper to group payments/expenses by month
  const getMonthlyChartData = () => {
    const monthlyDataMap: {
      [key: string]: {
        month: string;
        rawMonth: string;
        income: number;
        expenses: number;
      };
    } = {};

    // helper to convert month number to short name
    const getMonthName = (monthStr: string) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const idx = parseInt(monthStr, 10) - 1;
      return months[idx] || monthStr;
    };

    (Array.isArray(payments) ? payments : []).forEach((p) => {
      if (!p) return;
      const dateInfo = getYearAndMonth(p.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          month: `${monthName} ${String(year || "").slice(2)}`,
          rawMonth: key,
          income: 0,
          expenses: 0,
        };
      }
      monthlyDataMap[key].income += parseFloat(String(p.Amount || 0)) || 0;
    });

    (Array.isArray(expenses) ? expenses : []).forEach((e) => {
      if (!e) return;
      const dateInfo = getYearAndMonth(e.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          month: `${monthName} ${String(year || "").slice(2)}`,
          rawMonth: key,
          income: 0,
          expenses: 0,
        };
      }
      monthlyDataMap[key].expenses += parseFloat(String(e.Amount || 0)) || 0;
    });

    // Sort chronologically
    return Object.keys(monthlyDataMap)
      .sort()
      .map((key) => monthlyDataMap[key]);
  };

  const monthlyChartData = getMonthlyChartData();

  // Category breakdown for expenses
  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    (Array.isArray(expenses) ? expenses : []).forEach((e) => {
      if (!e) return;
      const cat = e.Category || "Others";
      breakdown[cat] =
        (breakdown[cat] || 0) + (parseFloat(String(e.Amount || 0)) || 0);
    });
    return Object.keys(breakdown)
      .map((cat) => ({
        name: cat,
        value: breakdown[cat],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryData = getCategoryBreakdown();
  const COLORS = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
    "#64748b",
  ];

  // Helper to group payments vs dues by month
  const getPaymentsVsDuesData = () => {
    const monthsMap: {
      [key: string]: {
        month: string;
        rawMonth: string;
        collected: number;
        outstanding: number;
      };
    } = {};

    const getMonthName = (monthStr: string) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const idx = parseInt(monthStr, 10) - 1;
      return months[idx] || monthStr;
    };

    (Array.isArray(payments) ? payments : []).forEach((p) => {
      if (!p) return;
      const dateInfo = getYearAndMonth(p.Date);
      if (!dateInfo) return;
      const { year, monthStr } = dateInfo;
      const key = `${year}-${monthStr}`;
      const monthName = getMonthName(monthStr);
      if (!monthsMap[key]) {
        monthsMap[key] = {
          month: `${monthName} ${String(year || "").slice(2)}`,
          rawMonth: key,
          collected: 0,
          outstanding: totalPendingDues,
        };
      }
      monthsMap[key].collected += parseFloat(String(p.Amount || 0)) || 0;
    });

    // Make sure we have at least one entry even if payments are empty
    if (Object.keys(monthsMap).length === 0) {
      const curDate = new Date();
      const monthName = getMonthName(
        String(curDate.getMonth() + 1).padStart(2, "0"),
      );
      const key = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, "0")}`;
      monthsMap[key] = {
        month: `${monthName} ${String(curDate.getFullYear()).slice(2)}`,
        rawMonth: key,
        collected: 0,
        outstanding: totalPendingDues,
      };
    }

    return Object.keys(monthsMap)
      .sort()
      .map((key) => monthsMap[key]);
  };

  const paymentsVsDuesData = getPaymentsVsDuesData();

  return (
    <div
      className={`flex flex-col items-center ${isMobile ? "w-full h-full min-h-screen bg-slate-50" : "gap-2"}`}
    >
      {/* Zoom Controls */}
      {!isMobile && (
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-bold shadow-md select-none z-50">
          <span>Zoom:</span>
          {[0.6, 0.7, 0.8, 0.9, 1.0].map((s) => (
            <button
              key={s}
              onClick={() => handleZoomChange(s)}
              className={`px-2 py-0.5 rounded transition-all ${zoomScale === s ? "bg-purple-600 text-white shadow-sm font-black" : "hover:bg-slate-800 text-slate-300"}`}
            >
              {s * 100}%
            </button>
          ))}
        </div>
      )}

      <div
        className={
          isMobile
            ? "w-full h-full min-h-screen flex flex-col"
            : "relative mx-auto transition-all duration-200"
        }
        style={
          isMobile
            ? {}
            : {
                height: `${844 * zoomScale}px`,
                width: `${390 * zoomScale}px`,
                marginBottom: `${16 * zoomScale}px`,
              }
        }
      >
        <div
          className={
            isMobile
              ? "w-full h-full flex flex-col"
              : "absolute left-0 top-0 w-[390px] h-[844px] origin-top-left transition-all duration-200"
          }
          style={isMobile ? {} : { transform: `scale(${zoomScale})` }}
        >
          {/* 3D phone case frame */}
          <div
            className={
              isMobile
                ? "w-full h-full flex flex-col justify-between overflow-hidden"
                : "relative w-[390px] h-[844px] bg-slate-900 rounded-[50px] p-[10px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-slate-750 flex flex-col justify-between overflow-hidden"
            }
          >
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
            <div
              className={
                isMobile
                  ? `w-full h-full flex-1 flex flex-col relative select-none ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"}`
                  : `w-full h-full rounded-[40px] overflow-hidden flex flex-col relative border select-none ${isDark ? "bg-slate-950 text-slate-100 border-slate-800" : "bg-slate-100 text-slate-800 border-slate-950/20"}`
              }
            >
              {/* Status Bar */}
              {!isMobile && (
                <div
                  className={`h-11 px-6 pt-5 flex justify-between items-center text-xs font-semibold z-40 transition-colors ${isDark ? "bg-slate-900 text-slate-300" : "bg-white text-slate-800"}`}
                >
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
                    <span className="text-[8px] text-slate-400">
                      GreenSecurID SMS Gateway
                    </span>
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed text-white">
                    {smsBanner}
                  </p>
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
                      <h1 className="text-xl font-extrabold tracking-tight">
                        Society Connect
                      </h1>
                      <p className="text-[10px] text-purple-300 mt-0.5 font-medium">
                        Smart Resident & Committee Portal
                      </p>
                    </div>

                    {showOtpOverlay ? (
                      /* --- STEP 3: OTP SMS VERIFICATION --- */
                      <div className="space-y-4 animate-fadeIn my-auto text-center z-10">
                        <div>
                          <h2 className="text-sm font-extrabold text-purple-200 flex items-center justify-center gap-1.5">
                            <span>🛡️ SMS OTP Verification</span>
                            <span className="text-[7.5px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black border border-purple-400/10">
                              MFA Sim
                            </span>
                          </h2>
                          <p className="text-[10px] text-purple-300 mt-1 leading-relaxed">
                            A secure 4-digit verification code has been
                            dispatched to your mobile. Enter it below to
                            authorize this session:
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
                                const val = e.target.value.replace(/\D/g, "");
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
                                setUserOtpInput("");
                                setLoginEmailOrPhone("");
                                setLoginPasscode("");
                                setPassword("");
                                triggerToast("Login Cancelled");
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
                              const newCode = String(
                                Math.floor(1000 + Math.random() * 9000),
                              );
                              setActiveOtpCode(newCode);
                              setUserOtpInput("");
                              setSmsBanner(
                                `💬 GreenSecurID: Your new login OTP is [ ${newCode} ]. Valid for 5 mins.`,
                              );

                              const newLog = {
                                id: `MFA-${Date.now()}`,
                                timestamp: new Date().toLocaleTimeString(),
                                action: "MFA Resent",
                                details: `Simulated OTP regenerated. New Code: ${newCode}`,
                                status: "Pending",
                              };
                              setMfaLogs((prev) => [newLog, ...prev]);
                              triggerToast("New OTP Dispatched!");
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
                            <span className="text-[7px] text-emerald-400 animate-pulse">
                              ● SECURE GATEWAY
                            </span>
                          </p>
                          {mfaLogs.length > 0 ? (
                            mfaLogs.map((log) => (
                              <div
                                key={log.id}
                                className="border-b border-white/5 pb-1"
                              >
                                <div className="flex justify-between font-bold">
                                  <span className="text-purple-300">
                                    [{log.timestamp}] {log.action}
                                  </span>
                                  <span
                                    className={
                                      log.status === "Success"
                                        ? "text-emerald-400"
                                        : log.status === "Blocked"
                                          ? "text-rose-400"
                                          : "text-amber-400"
                                    }
                                  >
                                    {log.status}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[7.5px] mt-0.5 leading-tight">
                                  {log.details}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500">
                              No security events logged yet.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : showPropertySelector ? (
                      /* --- STEP 2: SELECT MULTIPLE PROPERTY/FLAT --- */
                      <div className="space-y-4 animate-fadeIn my-auto">
                        <div className="text-center">
                          <h2 className="text-sm font-bold text-purple-200">
                            Multiple Properties Found
                          </h2>
                          <p className="text-[10px] text-purple-300 mt-1">
                            We found more than one active unit registered to
                            your account. Select which portal to enter:
                          </p>
                        </div>

                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                          {matchedProperties.map((prop, idx) => {
                            const soc = societies.find(
                              (s) => s.id === prop.SocietyId,
                            );
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
                                  <span className="bg-purple-900/50 px-1.5 py-0.5 rounded text-white">
                                    Flat {prop.FlatNo}
                                  </span>
                                  {prop.Wing && (
                                    <span className="bg-slate-900/60 px-1.5 py-0.5 rounded text-purple-300">
                                      {prop.Wing}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-purple-300 truncate max-w-[130px] ml-auto">
                                    {prop.OwnerName}
                                  </span>
                                </div>

                                {soc?.PostalAddress && (
                                  <div className="text-[9px] text-purple-300/60 flex items-center gap-1 truncate">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">
                                      {soc.PostalAddress}
                                    </span>
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
                            setPasswordError("");
                            setLoginEmailOrPhone("");
                            setLoginPasscode("");
                            setPassword("");
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
                          <span className="text-xs font-black">
                            Passcode Reset Engine
                          </span>
                        </div>

                        {!forgotOtpSent ? (
                          /* Step A: Request OTP */
                          <div className="space-y-3">
                            <p className="text-[10px] text-purple-200 leading-normal">
                              Provide your registered Email or Contact Number.
                              The Security Engine will generate a secure
                              verification session.
                            </p>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                Select Account Role
                              </label>
                              <div className="grid grid-cols-2 p-1 bg-slate-950/40 border border-purple-400/20 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setForgotRole("Admin")}
                                  className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                    forgotRole === "Admin"
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "text-purple-300 hover:text-white"
                                  }`}
                                >
                                  Committee Admin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForgotRole("Member")}
                                  className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                    forgotRole === "Member"
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "text-purple-300 hover:text-white"
                                  }`}
                                >
                                  Resident Member
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                Registered Email or Phone
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. admin@society.com or +91..."
                                value={forgotEmailOrPhone}
                                onChange={(e) => {
                                  setForgotEmailOrPhone(e.target.value);
                                  setForgotError("");
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
                                const inputVal = forgotEmailOrPhone
                                  .trim()
                                  .toLowerCase();
                                if (!inputVal) {
                                  setForgotError(
                                    "Please enter your registered identifier.",
                                  );
                                  return;
                                }

                                let found = false;
                                if (forgotRole === "Admin") {
                                  if (
                                    inputVal.includes("greenwood") ||
                                    inputVal.includes("greewood") ||
                                    inputVal.includes("seabreeze") ||
                                    inputVal.includes("sea_breeze") ||
                                    inputVal.includes("royal_heights") ||
                                    allMembers.some(
                                      (m) =>
                                        m.Email?.toLowerCase() === inputVal &&
                                        m.Role === "Admin",
                                    )
                                  ) {
                                    found = true;
                                  }
                                } else {
                                  found = allMembers.some((m) => {
                                    const emailMatch =
                                      m.Email &&
                                      m.Email.toLowerCase() === inputVal;
                                    const mPhoneClean = m.ContactNo
                                      ? normalizePhone(m.ContactNo)
                                      : "";
                                    const inputPhoneClean =
                                      normalizePhone(inputVal);
                                    return (
                                      emailMatch ||
                                      (mPhoneClean &&
                                        inputPhoneClean &&
                                        mPhoneClean === inputPhoneClean)
                                    );
                                  });
                                }

                                if (!found) {
                                  setForgotError(
                                    "This identifier is not registered in our secure database.",
                                  );
                                  return;
                                }

                                const code = String(
                                  Math.floor(1000 + Math.random() * 9000),
                                );
                                setForgotOtpCode(code);
                                setForgotOtpSent(true);
                                setForgotOtpInput("");
                                setNewPasscode("");
                                setForgotError("");
                                setSmsBanner(
                                  `💬 GreenSecurID: Reset OTP is [ ${code} ] for authorization reset. Valid for 10 mins.`,
                                );
                                triggerToast("Security Reset OTP Sent!");
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
                              An OTP has been dispatched. Confirm the code and
                              set your new passcode.
                            </p>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                4-Digit Security OTP
                              </label>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="e.g. 1234"
                                value={forgotOtpInput}
                                onChange={(e) =>
                                  setForgotOtpInput(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                                className="w-full text-center bg-white border border-purple-300 text-slate-900 placeholder-slate-300 py-2 rounded-xl text-sm font-black tracking-widest focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                New Access Passcode
                              </label>
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
                                  setForgotError(
                                    "Invalid Security Verification OTP.",
                                  );
                                  return;
                                }
                                if (!newPasscode.trim()) {
                                  setForgotError(
                                    "Please enter a valid non-empty new passcode.",
                                  );
                                  return;
                                }

                                const targetKey = forgotEmailOrPhone
                                  .trim()
                                  .toLowerCase();
                                const updated = {
                                  ...customPasscodes,
                                  [targetKey]: newPasscode.trim(),
                                };
                                setCustomPasscodes(updated);
                                localStorage.setItem(
                                  "society_sim_custom_passcodes",
                                  JSON.stringify(updated),
                                );

                                setForgotSuccess(true);
                                setForgotError("");
                                triggerToast(
                                  "Credentials updated successfully!",
                                );
                                setTimeout(() => {
                                  setShowForgotPassword(false);
                                  setForgotOtpSent(false);
                                  setForgotSuccess(false);
                                  setLoginEmailOrPhone(forgotEmailOrPhone);
                                  if (forgotRole === "Admin") {
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
                              <h4 className="text-xs font-black text-white">
                                Reset Successful!
                              </h4>
                              <p className="text-[10px] text-slate-300 mt-1">
                                Your secure passcode has been updated inside the
                                sandbox.
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
                            setForgotError("");
                          }}
                          className="w-full text-center text-purple-300 hover:text-white text-[10px] font-bold underline cursor-pointer mt-1 block"
                        >
                          ← Return to Sign In Screen
                        </button>
                      </div>
                    ) : (
                      /* --- STEP 1: LOGIN FORM --- */
                      <form
                        onSubmit={handleLogin}
                        className="space-y-4 my-auto pt-2"
                      >
                        {/* Role Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-slate-950/40 border border-purple-400/20 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginRole("Admin");
                              setPasswordError("");
                              setLoginEmailOrPhone("");
                              setLoginPasscode("");
                              setPassword("");
                            }}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              loginRole === "Admin"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "text-purple-300 hover:text-white"
                            }`}
                          >
                            Committee Admin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginRole("Member");
                              setPasswordError("");
                              setLoginEmailOrPhone("");
                              setLoginPasscode("");
                              setPassword("");
                            }}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              loginRole === "Member"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "text-purple-300 hover:text-white"
                            }`}
                          >
                            Resident Member
                          </button>
                        </div>

                        {loginRole === "Admin" ? (
                          /* Admin Form Fields */
                          <div className="space-y-3 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                Registered Admin Email
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  placeholder="e.g. admin@greenwood.com"
                                  value={loginEmailOrPhone}
                                  onChange={(e) => {
                                    setLoginEmailOrPhone(e.target.value);
                                    setPasswordError("");
                                  }}
                                  className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                />
                                <Mail className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                  Admin Security Password
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForgotRole("Admin");
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
                                    setPasswordError("");
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
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                Registered Email or Contact No
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Email or +91 xxxxx xxxxx"
                                  value={loginEmailOrPhone}
                                  onChange={(e) => {
                                    setLoginEmailOrPhone(e.target.value);
                                    setPasswordError("");
                                  }}
                                  className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold transition-all"
                                />
                                <User className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 block">
                                  Personal Login Passcode
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForgotRole("Member");
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
                                    setPasswordError("");
                                  }}
                                  className="w-full bg-white border border-purple-300 text-slate-900 placeholder-slate-400 pl-8 pr-3 py-2.5 rounded-xl text-xs text-center focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                />
                                <Lock className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 top-3" />
                              </div>
                              <span className="text-[8px] text-purple-300/70 block leading-tight pt-1">
                                🔐 <strong>Security Info:</strong> By default,
                                enter your registered contact number or passcode
                                to instantly login.
                              </span>

                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-purple-400/25 mt-2.5">
                                <div className="flex items-center gap-1.5 text-left">
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <div>
                                    <span className="text-[9px] font-black text-white block">
                                      Multi-Factor SMS OTP
                                    </span>
                                    <span className="text-[7.5px] text-purple-300 block">
                                      Simulate secure SMS passcode validation
                                    </span>
                                  </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={mfaEnabled}
                                    onChange={(e) =>
                                      setMfaEnabled(e.target.checked)
                                    }
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
                          <span>
                            {loginRole === "Admin"
                              ? "Authorize Admin Sign In"
                              : "Resident Portal Sign In"}
                          </span>
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
                <div
                  className={`flex-1 flex flex-col min-h-0 relative transition-colors ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
                >
                  {/* Header Bar */}
                  <div
                    className={`px-3 py-2.5 border-b flex justify-between items-center shadow-xs transition-colors ${
                      isDark
                        ? "bg-slate-900/90 border-slate-800 text-slate-100"
                        : "bg-white border-slate-150 text-slate-900"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="relative inline-block max-w-full">
                        <div
                          className={`text-xs font-black rounded-lg px-2 py-1 max-w-[170px] truncate whitespace-nowrap flex items-center gap-1 select-none ${
                            isDark
                              ? "text-purple-300 bg-purple-950/70 border border-purple-800/60"
                              : "text-purple-700 bg-purple-50 border border-purple-200/60"
                          }`}
                          title={societyName}
                        >
                          🏢 {societyName}
                        </div>
                      </div>
                      <div className="flex flex-col mt-0.5">
                        <p
                          className={`text-[9px] font-bold flex items-center gap-1 whitespace-nowrap truncate max-w-[170px] ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          {hasWings
                            ? `${wingsList.length} Wings • ${buildingType}`
                            : `${userRole === "Admin" ? "Admin Portal" : "Member Portal"} • ${buildingType}`}
                        </p>
                        {lastSynced && (
                          <p
                            className={`text-[8px] font-bold tracking-tight ${isDark ? "text-purple-400" : "text-purple-600/90"}`}
                          >
                            Last synced: {lastSynced}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Help & Knowledge Base Drawer Button */}
                      <button
                        onClick={() => setShowHelpDrawer(true)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                          isDark
                            ? "bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 shadow-xs"
                            : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-3xs"
                        }`}
                        title="In-App Knowledge Base & How-To Guides"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="hidden sm:inline">Help & Guides</span>
                      </button>

                      {/* Feature Catalog & Module Toggles Button (Admin) */}
                      {userRole === "Admin" && (
                        <button
                          onClick={() => setShowFeatureCatalogModal(true)}
                          className={`p-1.5 rounded-full transition-colors relative flex items-center justify-center min-w-[32px] min-h-[32px] cursor-pointer ${
                            isDark
                              ? "hover:bg-slate-800 text-purple-300"
                              : "hover:bg-purple-50 text-purple-600"
                          }`}
                          title="Module Settings & Feature Catalog"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}

                      {/* Real-time Notification Bell */}
                      <button
                        onClick={() => setShowNotificationsModal(true)}
                        className={`p-1.5 rounded-full transition-colors relative flex items-center justify-center min-w-[32px] min-h-[32px] cursor-pointer ${
                          isDark
                            ? "hover:bg-slate-800 text-purple-300"
                            : "hover:bg-purple-50 text-purple-600"
                        }`}
                        title="Real-time Notification Center"
                      >
                        <Bell className="w-4 h-4" />
                        {unreadNotifCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white dark:border-slate-900 shadow-2xs">
                            {unreadNotifCount}
                          </span>
                        )}
                      </button>

                      {userRole === "Admin" && (
                        <button
                          onClick={() => setShowAuditLogsModal(true)}
                          className={`p-1.5 rounded-full transition-colors relative flex items-center justify-center min-w-[32px] min-h-[32px] ${
                            isDark
                              ? "hover:bg-slate-800 text-purple-400"
                              : "hover:bg-purple-50 text-purple-600"
                          }`}
                          title="Admin Audit Logs"
                        >
                          <Clock className="w-4 h-4" />
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        </button>
                      )}
                      {userRole === "Admin" && (
                        <button
                          onClick={() => {
                            setTempSocietyName(societyName);
                            setTempHasWings(hasWings);
                            setTempWingsList(wingsList.join(", "));
                            setTempPostalAddress(postalAddress);
                            setTempBuildingType(buildingType);
                            setTempStructureType(activeStructureType);
                            setTempTowers(
                              JSON.parse(JSON.stringify(activeTowers)),
                            );
                            setTempFeatures(activeFeatures);
                            setShowSettingsModal(true);
                          }}
                          className={`p-1.5 rounded-full transition-colors flex items-center justify-center min-w-[32px] min-h-[32px] ${
                            isDark
                              ? "hover:bg-slate-800 text-slate-400"
                              : "hover:bg-slate-100 text-slate-500"
                          }`}
                          title="Society & Wings Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={handleManualRefresh}
                        disabled={syncing}
                        className={`p-1.5 rounded-full transition-colors flex items-center justify-center min-w-[32px] min-h-[32px] ${
                          isDark
                            ? "hover:bg-slate-800 text-slate-400"
                            : "hover:bg-slate-100 text-slate-500"
                        }`}
                        title="Pull-to-Refresh from Database"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${syncing ? "animate-spin text-purple-600" : ""}`}
                        />
                      </button>
                      {/* Property Switcher for Multi-Flat Users */}
                      {userRole === "Member" &&
                        (() => {
                          const normLoggedEmail = loggedInUserEmail
                            .trim()
                            .toLowerCase();
                          const myMatchingFlats = allMembers.filter((m) => {
                            const emailMatch =
                              m.Email &&
                              normLoggedEmail &&
                              m.Email.trim().toLowerCase() === normLoggedEmail;
                            const phoneMatch =
                              m.ContactNo &&
                              loggedInUserContact &&
                              normalizePhone(m.ContactNo) ===
                                normalizePhone(loggedInUserContact);
                            return emailMatch || phoneMatch;
                          });
                          if (myMatchingFlats.length > 1) {
                            return (
                              <div
                                className={`flex items-center gap-1 border rounded-lg px-2 py-1 shadow-2xs ${
                                  isDark
                                    ? "bg-purple-950/70 border-purple-800/60 text-purple-300"
                                    : "bg-purple-50 border-purple-200 text-purple-800"
                                }`}
                              >
                                <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
                                <select
                                  value={`${activeSocietyId}:${loggedInMemberFlat}`}
                                  onChange={(e) => {
                                    const [socId, flatNo] =
                                      e.target.value.split(":");
                                    setLoggedInMemberFlat(flatNo);
                                    localStorage.setItem(
                                      "society_sim_member_flat",
                                      flatNo,
                                    );
                                    if (onChangeActiveSociety && socId) {
                                      onChangeActiveSociety(socId);
                                      localStorage.setItem(
                                        "active_society_id",
                                        socId,
                                      );
                                    }
                                    triggerToast(
                                      `Switched active unit to Flat ${flatNo} (${societies?.find((s) => s.id === socId)?.Name || socId})`,
                                    );
                                  }}
                                  className={`bg-transparent border-none text-[10px] font-black focus:outline-none cursor-pointer py-0.5 ${
                                    isDark
                                      ? "text-purple-300"
                                      : "text-purple-700"
                                  }`}
                                >
                                  {myMatchingFlats.map((prop, idx) => {
                                    const soc = societies?.find(
                                      (s) => s.id === prop.SocietyId,
                                    );
                                    return (
                                      <option
                                        key={idx}
                                        value={`${prop.SocietyId}:${prop.FlatNo}`}
                                        className={`font-sans font-bold ${
                                          isDark
                                            ? "text-slate-100 bg-slate-900"
                                            : "text-slate-800 bg-white"
                                        }`}
                                      >
                                        {soc ? soc.Name : prop.SocietyId} • Flat{" "}
                                        {prop.FlatNo}
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
                        className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold px-2 py-1 shadow-2xs ${
                          isDark
                            ? "hover:bg-rose-950/60 text-rose-300 border border-rose-800/60"
                            : "hover:bg-rose-50 text-rose-600 border border-rose-200/50"
                        }`}
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
                      <span className="text-xs font-bold text-slate-600 mt-2">
                        Syncing with Database...
                      </span>
                    </div>
                  )}

                  {/* Tab Workspace Panel */}
                  <div
                    ref={scrollContainerRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="flex-1 overflow-y-auto px-3 py-2 min-h-0 relative"
                  >
                    {pullDistance > 0 && (
                      <div
                        style={{ height: `${pullDistance}px` }}
                        className="overflow-hidden transition-all duration-75 flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-300 border-b border-purple-500/20 text-[10px] font-extrabold gap-1.5 rounded-lg mb-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${pullDistance >= 40 || syncing ? 'animate-spin' : ''}`} />
                        <span>{pullDistance >= 40 ? 'Release to refresh database...' : 'Pull down to refresh'}</span>
                      </div>
                    )}

                    {/* IndexedDB Offline Sync Status Banner */}
                    {(isOffline || pendingOfflineOpsCount > 0) && (
                      <div className="bg-amber-500 text-slate-900 px-3 py-1.5 font-bold text-[10px] flex items-center justify-between shadow-xs rounded-xl mb-2">
                        <div className="flex items-center gap-1.5">
                          <WifiOff className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {isOffline ? "⚡ Offline Mode" : "Online"} — {pendingOfflineOpsCount} queued updates in IndexedDB
                          </span>
                        </div>
                        <button
                          onClick={async () => {
                            triggerToast("Syncing IndexedDB offline queue...");
                            const res = await syncOfflineQueue(async () => true);
                            setPendingOfflineOpsCount(0);
                            triggerToast(`Synced ${res.syncedCount} offline operations!`);
                          }}
                          className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-extrabold hover:bg-slate-800 transition-all cursor-pointer shadow-3xs"
                        >
                          Sync Now
                        </button>
                      </div>
                    )}

                    {/* ----------------- TABS: DASHBOARD ----------------- */}
                    {currentTab === "dashboard" && (
                      <div className="space-y-3 pb-4 animate-fade-in">
                        {/* Emergency Alert Banner */}
                        <EmergencyAlertBanner
                          alerts={emergencyAlerts.filter(a => !a.SocietyId || a.SocietyId === activeSocietyId)}
                        />
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
                              <h2
                                className="text-xs font-black mt-1 tracking-tight text-white truncate"
                                title={societyName}
                              >
                                {societyName}
                              </h2>
                            </div>
                            <Building2 className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                          </div>

                          <div className="mt-1.5 pt-1.5 border-t border-purple-800/20 space-y-1 text-[9px] text-purple-200">
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-purple-300 flex-shrink-0 mt-0.5" />
                              <p
                                className="font-semibold leading-normal text-purple-200/90 truncate"
                                title={postalAddress}
                              >
                                {postalAddress}
                              </p>
                            </div>
                            {hasWings && (
                              <div className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-purple-300 flex-shrink-0" />
                                <p className="font-semibold text-purple-200/90 truncate">
                                  Blocks:{" "}
                                  <span className="font-mono font-bold text-white">
                                    {wingsList.join(", ")}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* High-Priority Dashboard Urgent Emergency Alert Banner */}
                        {!alertBannerDismissed && activeAlertBanner && (
                          <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white p-3 rounded-2xl shadow-md border border-rose-400/30 relative overflow-hidden">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                  <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div>
                                  <span className="text-[7.5px] font-black uppercase tracking-widest bg-black/30 px-1.5 py-0.5 rounded text-amber-200">
                                    {activeAlertBanner.priority} ALERT
                                  </span>
                                  <h4 className="text-[11px] font-extrabold text-white leading-tight mt-0.5">
                                    {activeAlertBanner.title}
                                  </h4>
                                </div>
                              </div>
                              <button
                                onClick={() => setAlertBannerDismissed(true)}
                                className="p-1 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                                title="Dismiss Banner"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[9.5px] text-white/95 leading-relaxed font-medium mt-2 bg-black/20 p-2 rounded-xl">
                              {activeAlertBanner.message}
                            </p>

                            <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-white/20 text-[8.5px]">
                              <span className="text-white/80 font-bold">
                                {activeAlertBanner.timestamp}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setCurrentTab("notices")}
                                  className="bg-white text-rose-700 hover:bg-rose-50 font-extrabold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-3xs"
                                >
                                  View Notices →
                                </button>
                                {userRole === "Admin" && (
                                  <button
                                    onClick={() => {
                                      setBroadcastTitle(
                                        activeAlertBanner.title,
                                      );
                                      setBroadcastMessage(
                                        activeAlertBanner.message,
                                      );
                                      setShowBroadcastAlertModal(true);
                                    }}
                                    className="bg-black/30 hover:bg-black/40 text-white font-extrabold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {userRole === "Member" ? (
                          /* RESIDENT MEMBER DASHBOARD */
                          <>
                            {/* Resident Dues Status Banner */}
                            {(() => {
                              const currentMember = members.find(
                                (m) => m.FlatNo === loggedInMemberFlat,
                              ) || {
                                FlatNo: loggedInMemberFlat,
                                OwnerName: "Resident",
                                Balance: 0,
                                Status: "Owner",
                              };
                              const bal = currentMember.Balance;
                              return (
                                <div
                                  className={`p-4 rounded-2xl border text-slate-800 shadow-sm relative overflow-hidden ${
                                    bal > 0
                                      ? "bg-rose-50 border-rose-100 text-rose-950"
                                      : bal < 0
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-950"
                                        : "bg-slate-50 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                    YOUR RESIDENT UNIT ACCOUNT
                                  </p>
                                  <div className="flex justify-between items-end mt-2">
                                    <div>
                                      <h3 className="text-sm font-extrabold text-slate-800">
                                        Flat {loggedInMemberFlat}
                                      </h3>
                                      <p className="text-[10px] text-slate-500 mt-0.5">
                                        Primary Owner:{" "}
                                        <strong className="text-slate-700">
                                          {currentMember.OwnerName}
                                        </strong>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`text-lg font-black block ${bal > 0 ? "text-rose-600" : bal < 0 ? "text-emerald-600" : "text-slate-600"}`}
                                      >
                                        {bal > 0
                                          ? `₹${bal.toLocaleString()}`
                                          : bal < 0
                                            ? `-₹${Math.abs(bal).toLocaleString()}`
                                            : "Clear"}
                                      </span>
                                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">
                                        Outstanding Dues
                                      </span>
                                    </div>
                                  </div>

                                  {/* Multi-Flat quick swapper inside active society */}
                                  {(() => {
                                    const normLoggedEmail = loggedInUserEmail
                                      .trim()
                                      .toLowerCase();
                                    const myFlatsInActiveSociety =
                                      allMembers.filter((m) => {
                                        if (m.SocietyId !== activeSocietyId)
                                          return false;
                                        const emailMatch =
                                          m.Email &&
                                          normLoggedEmail &&
                                          m.Email.trim().toLowerCase() ===
                                            normLoggedEmail;
                                        const phoneMatch =
                                          m.ContactNo &&
                                          loggedInUserContact &&
                                          normalizePhone(m.ContactNo) ===
                                            normalizePhone(loggedInUserContact);
                                        return emailMatch || phoneMatch;
                                      });
                                    if (myFlatsInActiveSociety.length > 1) {
                                      return (
                                        <div className="mt-3 pt-3 border-t border-slate-150/80 flex flex-col gap-1.5">
                                          <p className="text-[8px] text-slate-500 font-black tracking-wide uppercase flex items-center gap-1">
                                            <Home className="w-3 h-3 text-purple-600" />
                                            <span>
                                              Your Flats in this Society (Click
                                              to Switch):
                                            </span>
                                          </p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {myFlatsInActiveSociety.map((f) => (
                                              <button
                                                key={f.FlatNo}
                                                onClick={() => {
                                                  setLoggedInMemberFlat(
                                                    f.FlatNo,
                                                  );
                                                  localStorage.setItem(
                                                    "society_sim_member_flat",
                                                    f.FlatNo,
                                                  );
                                                  triggerToast(
                                                    `Active View: Flat ${f.FlatNo}`,
                                                  );
                                                }}
                                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                                  f.FlatNo ===
                                                  loggedInMemberFlat
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                                    : "bg-white text-purple-700 border-purple-200 hover:bg-purple-100/50"
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
                                        onClick={() =>
                                          setCurrentTab("amenities")
                                        }
                                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-[10px] text-center shadow-xs transition-colors cursor-pointer"
                                      >
                                        📅 Book Amenity
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex gap-2">
                                      <button
                                        onClick={() =>
                                          setCurrentTab("amenities")
                                        }
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-[10px] text-center shadow-xs transition-colors cursor-pointer"
                                      >
                                        📅 Book Clubhouse & Shared Amenities
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Quick Access Tier 1 & Tier 2 Features Tile Grid */}
                            <div
                              className={`p-3 rounded-2xl border space-y-2 transition-colors ${cardBgClass}`}
                            >
                              <div className="flex justify-between items-center px-0.5">
                                <span
                                  className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-400"}`}
                                >
                                  QUICK SOCIETY SERVICES
                                </span>
                                <span
                                  className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                    isDark
                                      ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  Tiers 1 & 2 Active
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                {/* Emergency Contacts Tile */}
                                <button
                                  onClick={() => setCurrentTab("emergency")}
                                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                    isDark
                                      ? "bg-rose-950/40 hover:bg-rose-900/60 border-rose-900/50"
                                      : "bg-rose-50/70 hover:bg-rose-100/80 border-rose-200/80"
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                    <PhoneCall className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5
                                      className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                    >
                                      SOS & Emergency
                                    </h5>
                                    <p
                                      className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-rose-300" : "text-rose-700"}`}
                                    >
                                      Helplines & Committee
                                    </p>
                                  </div>
                                </button>

                                {/* Tenant Register Tile */}
                                {activeFeatures.tenantRegister !== false && (
                                  <button
                                    onClick={() => setCurrentTab("tenants")}
                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                      isDark
                                        ? "bg-amber-950/40 hover:bg-amber-900/60 border-amber-900/50"
                                        : "bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/80"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                      <KeyRound className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5
                                        className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                      >
                                        Tenant Register
                                      </h5>
                                      <p
                                        className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-amber-300" : "text-amber-800"}`}
                                      >
                                        Agreement & KYC
                                      </p>
                                    </div>
                                  </button>
                                )}

                                {/* Parking & Vehicles Tile */}
                                {activeFeatures.parkingRegister !== false && (
                                  <button
                                    onClick={() => setCurrentTab("parking")}
                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                      isDark
                                        ? "bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-900/50"
                                        : "bg-indigo-50/70 hover:bg-indigo-100/80 border-indigo-200/80"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                      <Car className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5
                                        className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                      >
                                        Vehicles & Parking
                                      </h5>
                                      <p
                                        className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}
                                      >
                                        Plates & Guest Passes
                                      </p>
                                    </div>
                                  </button>
                                )}

                                {/* Central Document Repository Tile */}
                                {activeFeatures.documentVault !== false && (
                                  <button
                                    onClick={() => setCurrentTab("documents")}
                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                      isDark
                                        ? "bg-blue-950/40 hover:bg-blue-900/60 border-blue-900/50"
                                        : "bg-blue-50/70 hover:bg-blue-100/80 border-blue-200/80"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5
                                        className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                      >
                                        Document Vault
                                      </h5>
                                      <p
                                        className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-blue-300" : "text-blue-700"}`}
                                      >
                                        AGMs, Audits & Rules
                                      </p>
                                    </div>
                                  </button>
                                )}

                                {/* Lift & AMC Register Tile */}
                                {activeFeatures.assetAMC !== false && (
                                  <button
                                    onClick={() => setCurrentTab("amc")}
                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                      isDark
                                        ? "bg-teal-950/40 hover:bg-teal-900/60 border-teal-900/50"
                                        : "bg-teal-50/70 hover:bg-teal-100/80 border-teal-200/80"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                      <Wrench className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5
                                        className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                      >
                                        AMC & Lifts
                                      </h5>
                                      <p
                                        className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-teal-300" : "text-teal-700"}`}
                                      >
                                        Servicing & Vendor AMC
                                      </p>
                                    </div>
                                  </button>
                                )}

                                {/* Water Meter & Tank Cleaning Tile */}
                                {activeFeatures.waterMeters !== false && (
                                  <button
                                    onClick={() => setCurrentTab("watermeters")}
                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                      isDark
                                        ? "bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-900/50"
                                        : "bg-cyan-50/70 hover:bg-cyan-100/80 border-cyan-200/80"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                      <Droplets className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5
                                        className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                      >
                                        Water Maintenance
                                      </h5>
                                      <p
                                        className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-cyan-300" : "text-cyan-700"}`}
                                      >
                                        Meters & Tank Cleaning
                                      </p>
                                    </div>
                                  </button>
                                )}

                                {/* Domestic Staff & Gatekeeper Tile */}
                                <button
                                  onClick={() => setCurrentTab("staff")}
                                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                    isDark
                                      ? "bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-900/50"
                                      : "bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200/80"
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                    <Users className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5
                                      className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                    >
                                      Domestic Staff & Gate
                                    </h5>
                                    <p
                                      className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}
                                    >
                                      Maids, Passcode & Check-In
                                    </p>
                                  </div>
                                </button>

                                {/* Vendor & Dual Approval Expense Tile */}
                                <button
                                  onClick={() => setCurrentTab("vendors")}
                                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 group border ${
                                    isDark
                                      ? "bg-purple-950/40 hover:bg-purple-900/60 border-purple-900/50"
                                      : "bg-purple-50/70 hover:bg-purple-100/80 border-purple-200/80"
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5
                                      className={`font-extrabold text-[10px] leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
                                    >
                                      Vendors & Dual Approval
                                    </h5>
                                    <p
                                      className={`text-[8px] font-semibold truncate mt-0.5 ${isDark ? "text-purple-300" : "text-purple-700"}`}
                                    >
                                      GST, Contracts & Sec/Treas
                                    </p>
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* Multiple Properties Switcher / List */}
                            {(() => {
                              const normLoggedEmail = loggedInUserEmail
                                .trim()
                                .toLowerCase();
                              const myMatchingFlats = allMembers.filter((m) => {
                                const emailMatch =
                                  m.Email &&
                                  normLoggedEmail &&
                                  m.Email.trim().toLowerCase() ===
                                    normLoggedEmail;
                                const phoneMatch =
                                  m.ContactNo &&
                                  loggedInUserContact &&
                                  normalizePhone(m.ContactNo) ===
                                    normalizePhone(loggedInUserContact);
                                return emailMatch || phoneMatch;
                              });

                              if (myMatchingFlats.length > 1) {
                                return (
                                  <div
                                    id="multi-property-dashboard-card"
                                    className="bg-purple-50/50 border border-purple-200 p-3 rounded-2xl shadow-2xs space-y-2"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black text-purple-850 uppercase tracking-wider flex items-center gap-1">
                                        🔑 My Registered Properties (
                                        {myMatchingFlats.length})
                                      </span>
                                      <span className="text-[7.5px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                                        Multi-Property Owner
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-tight">
                                      You own multiple units in our managed
                                      societies. Tap any property below to
                                      switch your active view:
                                    </p>
                                    <div className="grid grid-cols-1 gap-1.5 mt-1">
                                      {myMatchingFlats.map((prop, idx) => {
                                        const soc = societies.find(
                                          (s) => s.id === prop.SocietyId,
                                        );
                                        const isActive =
                                          prop.SocietyId === activeSocietyId &&
                                          prop.FlatNo === loggedInMemberFlat;
                                        return (
                                          <button
                                            key={idx}
                                            id={`dashboard-prop-switch-${idx}`}
                                            onClick={() =>
                                              handleSelectProperty(prop)
                                            }
                                            className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between text-[10px] cursor-pointer ${
                                              isActive
                                                ? "bg-purple-600 border-purple-700 text-white font-extrabold shadow-sm"
                                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                                            }`}
                                          >
                                            <div className="min-w-0 flex-1 pr-2">
                                              <div className="flex items-center gap-1">
                                                <span className="font-extrabold truncate max-w-[140px]">
                                                  {soc
                                                    ? soc.Name
                                                    : prop.SocietyId}
                                                </span>
                                                {isActive && (
                                                  <span className="text-[8px] bg-white text-purple-700 px-1 py-0.5 rounded font-black uppercase leading-none shrink-0 scale-90">
                                                    Active
                                                  </span>
                                                )}
                                              </div>
                                              <div
                                                className={`text-[8px] ${isActive ? "text-purple-200" : "text-slate-500"} mt-0.5`}
                                              >
                                                Flat {prop.FlatNo}{" "}
                                                {prop.Tower
                                                  ? `• ${prop.Tower} - ${prop.Wing}`
                                                  : prop.Wing
                                                    ? `• ${prop.Wing}`
                                                    : ""}
                                              </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <span
                                                className={`font-mono text-[9px] font-bold ${isActive ? "text-white" : prop.Balance > 0 ? "text-rose-600" : "text-emerald-600"}`}
                                              >
                                                {prop.Balance > 0
                                                  ? `Dues: ₹${prop.Balance.toLocaleString()}`
                                                  : "Paid"}
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
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  LATEST BULLETINS
                                </span>
                                <button
                                  onClick={() => setCurrentTab("notices")}
                                  className="text-[9px] font-bold text-purple-600 hover:underline"
                                >
                                  View All
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {notices.slice(0, 3).map((notice) => (
                                  <div
                                    key={notice.id}
                                    onClick={() =>
                                      setActiveNoticeDetail(notice)
                                    }
                                    className="p-2 bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 rounded-xl cursor-pointer transition-all flex justify-between items-center text-[10px]"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="p-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex-shrink-0">
                                        <Megaphone className="w-3.5 h-3.5" />
                                      </span>
                                      <div className="min-w-0">
                                        <h5 className="font-extrabold text-slate-800 truncate">
                                          {notice.Title}
                                        </h5>
                                        <span className="text-[8px] text-slate-400 font-bold">
                                          {notice.Date} • {notice.Category}
                                        </span>
                                      </div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  </div>
                                ))}
                                {notices.length === 0 && (
                                  <p className="text-center text-[10px] text-slate-400 py-3">
                                    No active announcements
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Helpdesk Ticket Shortcut */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs space-y-2">
                              <div className="flex justify-between items-center px-0.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  YOUR HELPDESK ISSUES
                                </span>
                                <button
                                  onClick={() => setCurrentTab("complaints")}
                                  className="text-[9px] font-bold text-purple-600 hover:underline"
                                >
                                  View History
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {complaints
                                  .filter(
                                    (c) => c.FlatNo === loggedInMemberFlat,
                                  )
                                  .slice(0, 2)
                                  .map((comp) => (
                                    <div
                                      key={comp.id}
                                      onClick={() =>
                                        setActiveComplaintDetail(comp)
                                      }
                                      className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:border-purple-200 cursor-pointer transition-colors flex justify-between items-center text-[10px]"
                                    >
                                      <div>
                                        <h5 className="font-extrabold text-slate-800 line-clamp-1">
                                          {comp.Title}
                                        </h5>
                                        <span className="text-[8px] text-slate-400 font-bold">
                                          Priority: {comp.Urgency} • status:{" "}
                                          {comp.Status}
                                        </span>
                                      </div>
                                      <span
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                                          comp.Status === "Resolved"
                                            ? "bg-green-100 text-green-800"
                                            : comp.Status === "In Progress"
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-rose-100 text-rose-800"
                                        }`}
                                      >
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
                                  <Plus className="w-3.5 h-3.5" /> File New
                                  Helpdesk complaint
                                </button>
                              </div>
                            </div>

                            {/* Resident Gatekeeper & Visitor Management Simulator */}
                            {activeFeatures.gatekeeper !== false && (
                              <div
                                id="visitor-manager-resident-card"
                                className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs space-y-2"
                              >
                                <div className="flex justify-between items-center px-0.5">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                    Gatekeeper Visitor Logs
                                  </span>
                                  <button
                                    onClick={() => {
                                      setNewVisName("");
                                      setNewVisContact("");
                                      setNewVisVehicle("");
                                      setNewVisPurpose("Delivery");
                                      setShowAddVisitorModal(true);
                                    }}
                                    className="text-[9px] font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Pre-Approve
                                    Guest
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {/* Pending Approvals (High Visibility Alerts) */}
                                  {visitors
                                    .filter(
                                      (v) =>
                                        v.FlatNo === loggedInMemberFlat &&
                                        v.Status === "Pending Approval" &&
                                        v.SocietyId === activeSocietyId,
                                    )
                                    .map((v) => (
                                      <div
                                        key={v.id}
                                        className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-1.5 animate-pulse shadow-sm"
                                      >
                                        <div className="flex justify-between items-start text-[10px]">
                                          <div className="min-w-0 flex-1">
                                            <span className="bg-amber-150 text-amber-900 border border-amber-200 font-extrabold text-[7.5px] px-1.5 py-0.5 rounded uppercase tracking-wide inline-block leading-none">
                                              🔔 Gate Authorization Request
                                            </span>
                                            <h5 className="font-extrabold text-slate-900 mt-1.5 truncate">
                                              {v.VisitorName}
                                            </h5>
                                            <p className="text-[8.5px] text-slate-600 mt-0.5">
                                              Purpose:{" "}
                                              <strong className="text-slate-800">
                                                {v.Purpose}
                                              </strong>{" "}
                                              {v.VehicleNo
                                                ? `• Vehicle: ${v.VehicleNo}`
                                                : ""}
                                            </p>
                                          </div>
                                          <span className="text-[7.5px] text-slate-400 font-mono shrink-0">
                                            {new Date(
                                              v.CheckInTime,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex gap-1.5 mt-1">
                                          <button
                                            onClick={() => {
                                              if (onUpdateVisitor) {
                                                onUpdateVisitor(
                                                  v.id,
                                                  "Approved",
                                                  members.find(
                                                    (m) =>
                                                      m.FlatNo ===
                                                      loggedInMemberFlat,
                                                  )?.OwnerName || "Resident",
                                                );
                                                triggerToast(
                                                  "Visitor access APPROVED at the gate!",
                                                );
                                              }
                                            }}
                                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[9px] transition-colors cursor-pointer text-center"
                                          >
                                            Approve Entry
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (onUpdateVisitor) {
                                                onUpdateVisitor(
                                                  v.id,
                                                  "Denied",
                                                  members.find(
                                                    (m) =>
                                                      m.FlatNo ===
                                                      loggedInMemberFlat,
                                                  )?.OwnerName || "Resident",
                                                );
                                                triggerToast(
                                                  "Visitor access DENIED!",
                                                );
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
                                      const myVisitors = visitors.filter(
                                        (v) =>
                                          v.FlatNo === loggedInMemberFlat &&
                                          v.Status !== "Pending Approval" &&
                                          v.SocietyId === activeSocietyId,
                                      );
                                      const pendingCount = visitors.filter(
                                        (v) =>
                                          v.FlatNo === loggedInMemberFlat &&
                                          v.Status === "Pending Approval" &&
                                          v.SocietyId === activeSocietyId,
                                      ).length;
                                      if (
                                        myVisitors.length === 0 &&
                                        pendingCount === 0
                                      ) {
                                        return (
                                          <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            No active visitor logs or
                                            pre-approvals
                                          </p>
                                        );
                                      }
                                      return myVisitors.slice(0, 3).map((v) => (
                                        <div
                                          key={v.id}
                                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-[10px]"
                                        >
                                          <div className="min-w-0 pr-2">
                                            <div className="flex items-center gap-1.5">
                                              <h5 className="font-extrabold text-slate-800 truncate">
                                                {v.VisitorName}
                                              </h5>
                                              {v.AccessToken && (
                                                <span className="text-[7.5px] bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                                  🔑 {v.AccessToken}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[8px] text-slate-400 mt-0.5 font-semibold">
                                              {v.Purpose} •{" "}
                                              {v.CheckOutTime
                                                ? `Checked Out: ${new Date(v.CheckOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                                : `In: ${new Date(v.CheckInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                                            </p>
                                          </div>
                                          <span
                                            className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                              v.Status === "Approved"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : v.Status === "Pre-Approved"
                                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                                  : v.Status === "Checked Out"
                                                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                            }`}
                                          >
                                            {v.Status}
                                          </span>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* COMMITTEE ADMIN DASHBOARD */
                          <>
                            {/* Broadcast Notice Quick Action */}
                            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl text-white shadow-xs flex items-center justify-between">
                              <div className="max-w-[190px]">
                                <span className="text-[7px] font-black tracking-widest bg-white/20 px-1.5 py-0.5 rounded-full uppercase">
                                  Quick Action
                                </span>
                                <h4 className="text-[10px] font-black mt-1">
                                  Broadcast Notice
                                </h4>
                                <p className="text-[7.5px] text-purple-100 font-medium mt-0.5 leading-snug">
                                  Announce general meetings, maintenance
                                  schedules, or security alerts.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setNewNoticeTitle("");
                                  setNewNoticeContent("");
                                  setNewNoticeCategory("General");
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
                                <span className="text-[8px] text-emerald-600 uppercase font-extrabold tracking-wider block">
                                  Total Income
                                </span>
                                <span className="text-[11px] font-black text-emerald-800">
                                  ₹{totalIncome.toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-rose-50 border border-rose-100/50 p-2 rounded-xl text-center shadow-2xs">
                                <span className="text-[8px] text-rose-600 uppercase font-extrabold tracking-wider block">
                                  Total Expenses
                                </span>
                                <span className="text-[11px] font-black text-rose-800">
                                  ₹{totalExpenses.toLocaleString()}
                                </span>
                              </div>
                              <div
                                className={`p-2 rounded-xl text-center shadow-2xs border ${
                                  netReserve >= 0
                                    ? "bg-purple-50 border-purple-100/50 text-purple-800"
                                    : "bg-amber-50 border-amber-100/50 text-amber-800"
                                }`}
                              >
                                <span className="text-[8px] uppercase font-extrabold tracking-wider block">
                                  Cash on Hand
                                </span>
                                <span className="text-[11px] font-black">
                                  ₹{netReserve.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Chart Container */}
                            <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                              <div className="flex justify-between items-center mb-1.5 px-0.5">
                                <div>
                                  <h4 className="text-[10px] font-extrabold text-slate-700">
                                    Financial Performance
                                  </h4>
                                  <p className="text-[8px] text-slate-400 font-semibold">
                                    Monthly Income vs. Outflow breakdown
                                  </p>
                                </div>
                                <span className="text-[7px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full border border-purple-100/50 uppercase">
                                  Live Trend
                                </span>
                              </div>

                              <div className="w-full h-[140px] text-[8px] -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={monthlyChartData}
                                    margin={{
                                      top: 5,
                                      right: 5,
                                      left: -25,
                                      bottom: 5,
                                    }}
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      vertical={false}
                                      stroke="#f1f5f9"
                                    />
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
                                      tickFormatter={(val) =>
                                        `₹${val >= 1000 ? val / 1000 + "k" : val}`
                                      }
                                    />
                                    <Tooltip
                                      formatter={(value: any) => [
                                        `₹${value.toLocaleString()}`,
                                        "",
                                      ]}
                                      contentStyle={{
                                        backgroundColor: "#1e293b",
                                        borderRadius: "8px",
                                        border: "none",
                                        color: "#fff",
                                        fontSize: "9px",
                                        padding: "4px 8px",
                                      }}
                                      labelStyle={{
                                        fontWeight: "bold",
                                        color: "#cbd5e1",
                                      }}
                                    />
                                    <Bar
                                      dataKey="income"
                                      fill="#10b981"
                                      radius={[3, 3, 0, 0]}
                                      name="Income"
                                    />
                                    <Bar
                                      dataKey="expenses"
                                      fill="#f43f5e"
                                      radius={[3, 3, 0, 0]}
                                      name="Expenses"
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Overdue Balances Breakdown Visualization */}
                            {members.some((m) => m.Balance > 0) && (
                              <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                                <div className="flex justify-between items-center mb-1.5 px-0.5">
                                  <div>
                                    <h4 className="text-[10px] font-extrabold text-slate-700">
                                      Top Unpaid Balances Breakdown
                                    </h4>
                                    <p className="text-[8px] text-slate-400 font-semibold">
                                      Highest outstanding dues currently pending
                                      recovery
                                    </p>
                                  </div>
                                  <span className="text-[7px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full border border-rose-100 uppercase">
                                    Attention
                                  </span>
                                </div>

                                <div className="w-full h-[120px] text-[8px] -ml-2">
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <BarChart
                                      layout="vertical"
                                      data={members
                                        .filter((m) => m.Balance > 0)
                                        .sort((a, b) => b.Balance - a.Balance)
                                        .slice(0, 5)
                                        .map((m) => ({
                                          unit: `Flat ${m.FlatNo}`,
                                          dues: m.Balance,
                                        }))}
                                      margin={{
                                        top: 5,
                                        right: 10,
                                        left: -15,
                                        bottom: 5,
                                      }}
                                    >
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke="#f1f5f9"
                                      />
                                      <XAxis
                                        type="number"
                                        stroke="#64748b"
                                        fontSize={8}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <YAxis
                                        dataKey="unit"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={8}
                                        tickLine={false}
                                        axisLine={false}
                                      />
                                      <Tooltip
                                        formatter={(value: any) => [
                                          `₹${value.toLocaleString()}`,
                                          "Outstanding",
                                        ]}
                                        contentStyle={{
                                          backgroundColor: "#1e293b",
                                          borderRadius: "8px",
                                          border: "none",
                                          color: "#fff",
                                          fontSize: "9px",
                                          padding: "4px 8px",
                                        }}
                                      />
                                      <Bar
                                        dataKey="dues"
                                        fill="#f43f5e"
                                        radius={[0, 3, 3, 0]}
                                        barSize={10}
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}

                            {/* Dues Clearance & Distribution Visual Summary */}
                            <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                              <div className="flex justify-between items-center mb-1.5 px-0.5">
                                <div>
                                  <h4 className="text-[10px] font-extrabold text-slate-700">
                                    Dues Collection & Clearance Summary
                                  </h4>
                                  <p className="text-[8px] text-slate-400 font-semibold">
                                    Cleared vs. Outstanding billing distribution
                                  </p>
                                </div>
                                <span className="text-[7px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full border border-indigo-100/50 uppercase">
                                  Distribution
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 items-center">
                                {/* Outstanding Dues Visual Summary Block */}
                                <div className="space-y-1.5">
                                  <div className="bg-rose-50 border border-rose-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] text-rose-500 uppercase font-black tracking-wider block">
                                      Outstanding Dues
                                    </span>
                                    <span className="text-[11px] font-black text-rose-600">
                                      ₹{totalPendingDues.toLocaleString()}
                                    </span>
                                    <span className="text-[6.5px] text-slate-400 font-semibold block mt-0.5">
                                      Total due from {pendingCount} flats
                                    </span>
                                  </div>
                                  <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-xl">
                                    <span className="text-[7px] text-emerald-600 uppercase font-black tracking-wider block">
                                      Prepaid Credits
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-600">
                                      ₹{totalPrepaidDues.toLocaleString()}
                                    </span>
                                    <span className="text-[6.5px] text-slate-400 font-semibold block mt-0.5 font-sans">
                                      Advance payments
                                    </span>
                                  </div>
                                </div>

                                {/* Recharts Pie Chart */}
                                <div className="relative flex flex-col items-center justify-center h-[90px] w-full">
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <PieChart>
                                      <Pie
                                        data={[
                                          {
                                            name: "Cleared",
                                            value: clearedCount || 1,
                                            color: "#10b981",
                                          },
                                          {
                                            name: "Pending",
                                            value: pendingCount || 0,
                                            color: "#f43f5e",
                                          },
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
                                        formatter={(value: any, name: any) => [
                                          `${value} Flats`,
                                          name,
                                        ]}
                                        contentStyle={{
                                          backgroundColor: "#1e293b",
                                          borderRadius: "6px",
                                          border: "none",
                                          color: "#fff",
                                          fontSize: "8px",
                                          padding: "2px 6px",
                                        }}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                  {/* Inner Label for Percent */}
                                  <div className="absolute text-center">
                                    <span className="text-[10px] font-black text-slate-700">
                                      {members.length > 0
                                        ? (
                                            (clearedCount / members.length) *
                                            100
                                          ).toFixed(0)
                                        : "0"}
                                      %
                                    </span>
                                    <span className="text-[6px] text-slate-400 font-extrabold uppercase block leading-none">
                                      Cleared
                                    </span>
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
                              <h4 className="text-[10px] font-extrabold text-slate-700 mb-1.5 px-0.5">
                                Expense Categories Breakdown
                              </h4>
                              <div className="space-y-1 max-h-[115px] overflow-y-auto pr-0.5 scrollbar-thin">
                                {categoryData.length > 0 ? (
                                  categoryData.map((cat, i) => {
                                    const percent = (
                                      (cat.value / totalExpenses) *
                                      100
                                    ).toFixed(0);
                                    return (
                                      <div
                                        key={cat.name}
                                        className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                              backgroundColor:
                                                COLORS[i % COLORS.length],
                                            }}
                                          ></span>
                                          <span className="font-semibold text-slate-600">
                                            {cat.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-800">
                                            ₹{cat.value.toLocaleString()}
                                          </span>
                                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold">
                                            {percent}%
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-center text-[10px] text-slate-400 py-3">
                                    No expenses recorded yet.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Upcoming Dues (Members with negative balance) */}
                            <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                              <div className="flex justify-between items-center mb-1.5 px-0.5">
                                <div>
                                  <h4 className="text-[10px] font-extrabold text-slate-700">
                                    Upcoming Dues (Advance Credits)
                                  </h4>
                                  <p className="text-[8px] text-slate-400 font-semibold">
                                    Members with prepaid balances or advance
                                    credits
                                  </p>
                                </div>
                                <span className="text-[7px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100/50 uppercase">
                                  Prepaid
                                </span>
                              </div>
                              <div className="space-y-1 max-h-[115px] overflow-y-auto pr-0.5 scrollbar-thin">
                                {(() => {
                                  const creditMembers = (
                                    Array.isArray(members) ? members : []
                                  ).filter((m) => {
                                    if (!m) return false;
                                    const bal =
                                      parseFloat(String(m.Balance || 0)) || 0;
                                    return bal < 0;
                                  });
                                  return creditMembers.length > 0 ? (
                                    creditMembers.map((m) => {
                                      const bal =
                                        parseFloat(String(m.Balance || 0)) || 0;
                                      return (
                                        <div
                                          key={m.FlatNo}
                                          className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 flex items-center justify-center font-bold text-[9px]">
                                              {m.FlatNo}
                                            </span>
                                            <span className="font-semibold text-slate-600">
                                              {m.OwnerName}
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-bold text-emerald-600">
                                              ₹{Math.abs(bal).toLocaleString()}
                                            </span>
                                            <span className="text-[7px] text-slate-400 font-medium block">
                                              Credit Balance
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-center text-[10px] text-slate-400 py-3">
                                      No members with advance credits currently.
                                    </p>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Automated Billing & Maintenance Invoicing Engine */}
                            <div
                              id="admin-billing-engine-card"
                              className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs space-y-3"
                            >
                              <div className="flex justify-between items-center px-0.5">
                                <div>
                                  <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <span className="p-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                      ⚡
                                    </span>
                                    Automated Billing Invoicing Engine
                                  </h4>
                                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
                                    Generate monthly recurring maintenance bills
                                    for all resident units
                                  </p>
                                </div>
                                <span className="text-[7.5px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                                  Live Run
                                </span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-2 text-[10px]">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="font-extrabold text-slate-600 block">
                                      Billing Month
                                    </label>
                                    <select
                                      value={billingMonth}
                                      onChange={(e) =>
                                        setBillingMonth(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                    >
                                      <option value="July 2026">
                                        July 2026
                                      </option>
                                      <option value="August 2026">
                                        August 2026
                                      </option>
                                      <option value="September 2026">
                                        September 2026
                                      </option>
                                      <option value="October 2026">
                                        October 2026
                                      </option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-extrabold text-slate-600 block">
                                      Base Maintenance (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={billBase}
                                      onChange={(e) =>
                                        setBillBase(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-bold"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Water Dues (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={billWater}
                                      onChange={(e) =>
                                        setBillWater(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-medium text-[9.5px]"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Security Dues (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={billSecurity}
                                      onChange={(e) =>
                                        setBillSecurity(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans font-medium text-[9.5px]"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Parking/Utility (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={billParking}
                                      onChange={(e) =>
                                        setBillParking(e.target.value)
                                      }
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
                                  const totalPerUnit =
                                    baseVal + waterVal + secVal + parkVal;
                                  const estimatedTotalCollection =
                                    totalPerUnit * (members.length || 0);

                                  return (
                                    <div className="bg-indigo-50/55 p-2 rounded-lg border border-indigo-100 flex justify-between items-center text-[9px] mt-1 text-indigo-950 font-semibold">
                                      <div>
                                        <span className="block">
                                          Dues / Unit:{" "}
                                          <strong>
                                            ₹{totalPerUnit.toLocaleString()}
                                          </strong>
                                        </span>
                                        <span className="text-[7.5px] text-slate-500 font-normal font-sans">
                                          Base + Water + Security + Util
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span className="block text-indigo-700 font-sans">
                                          Total Run Collection:{" "}
                                          <strong>
                                            ₹
                                            {estimatedTotalCollection.toLocaleString()}
                                          </strong>
                                        </span>
                                        <span className="text-[7.5px] text-slate-500 font-normal">
                                          For {members.length} Active Flats
                                        </span>
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
                                    const totalPerUnit =
                                      baseVal + waterVal + secVal + parkVal;

                                    if (totalPerUnit <= 0) {
                                      triggerToast(
                                        "Please set a valid invoice total amount!",
                                      );
                                      return;
                                    }

                                    if (onAddInvoice) {
                                      let count = 0;
                                      members.forEach((m) => {
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
                                          DueDate: new Date(
                                            Date.now() +
                                              15 * 24 * 60 * 60 * 1000,
                                          )
                                            .toISOString()
                                            .split("T")[0],
                                          Status: "Unpaid",
                                          IssuedDate: new Date()
                                            .toISOString()
                                            .split("T")[0],
                                        });
                                        count++;
                                      });

                                      if (onAddNotice) {
                                        onAddNotice({
                                          title: `${billingMonth} Maintenance Dues Invoiced`,
                                          category: "Maintenance",
                                          content: `Automated maintenance invoices for ${billingMonth} have been successfully generated and sent to all units.\n\nTotal Due Per Unit: ₹${totalPerUnit.toLocaleString()}\n• Base Rate: ₹${baseVal}\n• Water Charges: ₹${waterVal}\n• Security Guard Dues: ₹${secVal}\n• Parking/Utility: ₹${parkVal}\n\nPlease clear your pending dues within 15 days of invoice date to avoid late payment fee penalties. Thank you.`,
                                        });
                                      }

                                      triggerToast(
                                        `Successfully generated ${count} invoices for ${billingMonth}!`,
                                      );
                                    } else {
                                      triggerToast(
                                        "Billing service unavailable",
                                      );
                                    }
                                  }}
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer text-center text-[10px]"
                                >
                                  ⚡ Execute Automated Invoicing Run
                                </button>
                              </div>
                            </div>

                            {/* Gatekeeper & Visitor Management Simulator */}
                            <div
                              id="admin-gatekeeper-simulator-card"
                              className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs space-y-3"
                            >
                              <div className="flex justify-between items-center px-0.5">
                                <div>
                                  <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                    Simulated Gatekeeper Console
                                  </h4>
                                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
                                    Simulate check-ins at the security cabin
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {onOpenQrScanner && (
                                    <button
                                      type="button"
                                      onClick={onOpenQrScanner}
                                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[8.5px] font-black tracking-wide flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                    >
                                      <QrCode className="w-3 h-3" />
                                      <span>QR Scanner</span>
                                    </button>
                                  )}
                                  <span className="text-[7px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                                    Active Terminal
                                  </span>
                                </div>
                              </div>

                              {/* Resident Auto-Notification Toggle */}
                              <div className="flex justify-between items-center p-2 rounded-xl bg-indigo-50/80 border border-indigo-150">
                                <div className="flex items-center gap-1.5">
                                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                  <div>
                                    <span className="text-[9.5px] font-extrabold text-slate-800 block">
                                      Auto-notify Resident on Gate Check-in
                                    </span>
                                    <span className="text-[8px] text-slate-500 block">
                                      Push instant toast alert and in-app notice to host flat
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleToggleAutoNotifyVisitor}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                    autoNotifyResidentOnGateCheckIn ? "bg-indigo-600" : "bg-slate-300"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                      autoNotifyResidentOnGateCheckIn ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Quick Check-in form */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[10px] space-y-2">
                                <h5 className="font-black text-slate-700 text-[9px] uppercase tracking-wider mb-1">
                                  New Gate Check-In Entry
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Visitor Name
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Rajesh Kumar"
                                      value={newVisName}
                                      onChange={(e) =>
                                        setNewVisName(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                    />
                                  </div>

                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Target Flat Unit
                                    </label>
                                    <select
                                      value={newVisFlatNo}
                                      onChange={(e) =>
                                        setNewVisFlatNo(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                    >
                                      <option value="">
                                        -- Choose Flat --
                                      </option>
                                      {members.map((m) => (
                                        <option key={m.id} value={m.FlatNo}>
                                          Flat {m.FlatNo} ({m.OwnerName})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                  <div className="space-y-0.5">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Purpose
                                    </label>
                                    <select
                                      value={newVisPurpose}
                                      onChange={(e) =>
                                        setNewVisPurpose(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none focus:border-indigo-500 font-sans"
                                    >
                                      <option value="Delivery">Delivery</option>
                                      <option value="Guest">Guest</option>
                                      <option value="Cab">Uber / Ola</option>
                                      <option value="Services">Services</option>
                                      <option value="Maintenance">
                                        Maintenance
                                      </option>
                                    </select>
                                  </div>

                                  <div className="space-y-0.5 col-span-2">
                                    <label className="font-bold text-slate-500 text-[8.5px] block">
                                      Contact No & Vehicle No
                                    </label>
                                    <div className="flex gap-1">
                                      <input
                                        type="text"
                                        placeholder="Contact (optional)"
                                        value={newVisContact}
                                        onChange={(e) =>
                                          setNewVisContact(e.target.value)
                                        }
                                        className="flex-1 bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-sans text-[9px]"
                                      />
                                      <input
                                        type="text"
                                        placeholder="MH-12-XX-0000"
                                        value={newVisVehicle}
                                        onChange={(e) =>
                                          setNewVisVehicle(e.target.value)
                                        }
                                        className="w-[85px] bg-white border border-slate-300 p-1 rounded focus:outline-none focus:border-indigo-500 font-mono text-[9px]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newVisName.trim()) {
                                      triggerToast("Visitor Name is required!");
                                      return;
                                    }
                                    if (!newVisFlatNo) {
                                      triggerToast(
                                        "Please select a target Flat No!",
                                      );
                                      return;
                                    }

                                    if (onAddVisitor) {
                                      onAddVisitor({
                                        VisitorName: newVisName.trim(),
                                        Purpose: newVisPurpose,
                                        ContactNo:
                                          newVisContact.trim() ||
                                          "Not Provided",
                                        FlatNo: newVisFlatNo,
                                        VehicleNo:
                                          newVisVehicle.trim() || undefined,
                                        Status: "Pending Approval",
                                        CheckInTime: new Date().toISOString(),
                                        SocietyId: activeSocietyId,
                                      });

                                      triggerToast(
                                        `Logged check-in entry for ${newVisName.trim()} (Flat ${newVisFlatNo})!`,
                                      );
                                      setNewVisName("");
                                      setNewVisContact("");
                                      setNewVisVehicle("");
                                    } else {
                                      triggerToast(
                                        "Visitor service unavailable",
                                      );
                                    }
                                  }}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer text-center text-[9.5px]"
                                >
                                  🔔 Register Entry & Alert Resident Host
                                </button>
                              </div>

                              {/* Visitor live status listings */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-0.5">
                                  <h5 className="font-black text-slate-700 text-[9px] uppercase tracking-wider">
                                    Live Visitors on Site
                                  </h5>
                                  {visitors.filter((v) => v.SocietyId === activeSocietyId).length > 0 && (
                                    <span className="text-[8px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded-full">
                                      Total: {visitors.filter((v) => v.SocietyId === activeSocietyId).length}
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {(() => {
                                    const activeVisitors = visitors.filter(
                                      (v) => v.SocietyId === activeSocietyId,
                                    );
                                    if (activeVisitors.length === 0) {
                                      return (
                                        <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                          No visitor logs recorded yet
                                        </p>
                                      );
                                    }
                                    const totalVisitorPages = Math.max(1, Math.ceil(activeVisitors.length / visitorPageSize));
                                    const paginatedVisitors = activeVisitors.slice((visitorPage - 1) * visitorPageSize, visitorPage * visitorPageSize);

                                    return (
                                      <>
                                        {paginatedVisitors.map((v) => (
                                          <div
                                            key={v.id}
                                            className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-[10px]"
                                          >
                                            <div className="min-w-0 flex-1 pr-2">
                                              <div className="flex items-center gap-1.5">
                                                <h5 className="font-extrabold text-slate-800 truncate max-w-[120px]">
                                                  {v.VisitorName}
                                                </h5>
                                                <span className="text-[7.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black font-sans uppercase">
                                                  Flat {v.FlatNo}
                                                </span>
                                              </div>
                                              <p className="text-[8px] text-slate-400 mt-0.5">
                                                Purpose:{" "}
                                                <strong>{v.Purpose}</strong>{" "}
                                                {v.CheckOutTime
                                                  ? `• Out: ${new Date(v.CheckOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                                  : `• In: ${new Date(v.CheckInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                                              </p>
                                            </div>
                                            <div className="shrink-0 text-right flex items-center gap-1.5">
                                              <span
                                                className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                                                  v.Status === "Approved"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : v.Status ===
                                                        "Pending Approval"
                                                      ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                                                      : v.Status === "Checked Out"
                                                        ? "bg-slate-100 text-slate-500 border border-slate-200"
                                                        : "bg-rose-50 text-rose-700 border border-rose-100"
                                                }`}
                                              >
                                                {v.Status === "Pending Approval"
                                                  ? "Awaiting Host"
                                                  : v.Status}
                                              </span>

                                              {/* Checkout Action if status is Approved */}
                                              {v.Status === "Approved" &&
                                                onUpdateVisitor && (
                                                  <button
                                                    onClick={() => {
                                                      onUpdateVisitor(
                                                        v.id,
                                                        "Checked Out",
                                                      );
                                                      triggerToast(
                                                        "Visitor checked out successfully!",
                                                      );
                                                    }}
                                                    className="text-[8px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold cursor-pointer"
                                                  >
                                                    Check Out
                                                  </button>
                                                )}

                                              {/* Admin Override if status is Pending */}
                                              {v.Status === "Pending Approval" &&
                                                onUpdateVisitor && (
                                                  <div className="flex gap-0.5">
                                                    <button
                                                      onClick={() => {
                                                        onUpdateVisitor(
                                                          v.id,
                                                          "Approved",
                                                          "Admin Override",
                                                        );
                                                        triggerToast(
                                                          "Admin Force-Approved entry!",
                                                        );
                                                      }}
                                                      className="text-[7.5px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black cursor-pointer leading-none"
                                                      title="Admin Approve Override"
                                                    >
                                                      ✓
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        onUpdateVisitor(
                                                          v.id,
                                                          "Denied",
                                                          "Admin Override",
                                                        );
                                                        triggerToast(
                                                          "Admin Force-Denied entry!",
                                                        );
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
                                        ))}
                                        {activeVisitors.length > visitorPageSize && (
                                          <div className="flex justify-between items-center bg-slate-100/90 px-2.5 py-1.5 rounded-xl text-[8.5px] font-bold text-slate-600 mt-1.5 border border-slate-200">
                                            <span>Showing {(visitorPage - 1) * visitorPageSize + 1}-{Math.min(visitorPage * visitorPageSize, activeVisitors.length)} of {activeVisitors.length}</span>
                                            <div className="flex items-center gap-1.5">
                                              <button
                                                disabled={visitorPage === 1}
                                                onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
                                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                              >
                                                Prev
                                              </button>
                                              <span className="font-mono">{visitorPage}/{totalVisitorPages}</span>
                                              <button
                                                disabled={visitorPage >= totalVisitorPages}
                                                onClick={() => setVisitorPage(p => Math.min(totalVisitorPages, p + 1))}
                                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                              >
                                                Next
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ----------------- TABS: MEMBERS ----------------- */}
                    {currentTab === "members" && (
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
                            onClick={() => setShowCsvImportModal(true)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center gap-1 text-[11px] font-bold shadow-3xs transition-all flex-shrink-0 cursor-pointer active:scale-95"
                            title="Bulk import members from CSV spreadsheet"
                          >
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Bulk Import</span>
                          </button>
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
                            {["All", ...wingsList].map((wing) => (
                              <button
                                key={wing}
                                onClick={() => setSelectedWingFilter(wing)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border whitespace-nowrap cursor-pointer ${
                                  selectedWingFilter === wing
                                    ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                {wing === "All" ? "All Wings" : `Wing ${wing}`}
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
                                            <span
                                              className="text-[6.5px] text-purple-600 uppercase tracking-wider font-extrabold mb-0.5 truncate max-w-[34px]"
                                              title={`${member.Tower} - Wing ${member.Wing}`}
                                            >
                                              {member.Tower}-{member.Wing}
                                            </span>
                                            <span className="text-[10px] font-extrabold">
                                              {member.FlatNo}
                                            </span>
                                          </>
                                        ) : hasWings && member.Wing ? (
                                          <>
                                            <span className="text-[7px] text-purple-500 uppercase tracking-widest font-black mb-0.5">
                                              {member.Wing}
                                            </span>
                                            <span className="text-[10px] font-extrabold">
                                              {member.FlatNo}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-extrabold">
                                            {member.FlatNo}
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) =>
                                              setEditName(e.target.value)
                                            }
                                            className="bg-slate-50 border border-slate-200 p-1 rounded font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Owner Name"
                                          />
                                        ) : (
                                          <h4 className="text-xs font-black text-slate-800">
                                            {member.OwnerName}
                                          </h4>
                                        )}
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <span className="text-[8px] bg-slate-100 border border-slate-200/50 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                                            {member.Status || "Owner"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Edit / Save Actions */}
                                    {userRole === "Admin" && (
                                      <div className="flex items-center gap-1">
                                        {isEditing ? (
                                          <>
                                            <button
                                              onClick={() => {
                                                if (!editName.trim()) {
                                                  triggerToast(
                                                    "Owner Name is required",
                                                  );
                                                  return;
                                                }
                                                onSaveOrUpdateMember({
                                                  ...member,
                                                  OwnerName: editName,
                                                  ContactNo: editPhone,
                                                  Email: editEmail,
                                                  Balance: editBalance,
                                                  VehicleNo: editVehicle,
                                                });
                                                triggerToast(
                                                  "Member details updated!",
                                                );
                                                setEditingMemberId(null);
                                              }}
                                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-100 cursor-pointer"
                                              title="Save changes"
                                            >
                                              <Save className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingMemberId(null)
                                              }
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
                                              setEditName(
                                                member.OwnerName || "",
                                              );
                                              setEditPhone(
                                                member.ContactNo || "",
                                              );
                                              setEditEmail(member.Email || "");
                                              setEditBalance(
                                                member.Balance || 0,
                                              );
                                              setEditVehicle(
                                                member.VehicleNo || "",
                                              );
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
                                      <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider block">
                                        Contact Info
                                      </span>
                                      {isEditing ? (
                                        <div className="space-y-1.5">
                                          <input
                                            type="text"
                                            value={editPhone}
                                            onChange={(e) =>
                                              setEditPhone(e.target.value)
                                            }
                                            className="w-full bg-white border border-slate-200 p-1 rounded text-[9px] text-slate-700"
                                            placeholder="Phone Number"
                                          />
                                          <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) =>
                                              setEditEmail(e.target.value)
                                            }
                                            className="w-full bg-white border border-slate-200 p-1 rounded text-[9px] text-slate-700"
                                            placeholder="Email Address"
                                          />
                                        </div>
                                      ) : (
                                        <div className="space-y-1 text-slate-600 font-medium">
                                          <div className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            <span className="truncate">
                                              {member.ContactNo ||
                                                "Not registered"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-slate-400" />
                                            <span className="truncate">
                                              {member.Email || "No email saved"}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Right Side: Dues & Vehicle Info */}
                                    <div className="space-y-1.5">
                                      {/* Dues Status Block */}
                                      <div
                                        className={`p-1.5 rounded-xl border ${
                                          member.Balance > 0
                                            ? "bg-rose-50 border-rose-100/50 text-rose-700"
                                            : "bg-emerald-50 border-emerald-100/50 text-emerald-700"
                                        }`}
                                      >
                                        <span className="text-[7px] uppercase font-bold tracking-wider block">
                                          Maintenance Dues
                                        </span>
                                        {isEditing ? (
                                          <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[9px] font-bold">
                                              ₹
                                            </span>
                                            <input
                                              type="number"
                                              value={editBalance}
                                              onChange={(e) =>
                                                setEditBalance(
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                )
                                              }
                                              className="w-full bg-white border border-slate-200 p-0.5 rounded text-[9px] text-slate-800"
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex justify-between items-baseline mt-0.5">
                                            <span className="text-xs font-black">
                                              {member.Balance > 0
                                                ? `₹${member.Balance.toLocaleString()}`
                                                : member.Balance < 0
                                                  ? `-₹${Math.abs(member.Balance).toLocaleString()}`
                                                  : "No Dues"}
                                            </span>
                                            <span className="text-[6.5px] uppercase font-black tracking-wider opacity-70">
                                              {member.Balance > 0
                                                ? "Pending"
                                                : member.Balance < 0
                                                  ? "Prepaid"
                                                  : "Cleared"}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Registered Vehicle Block */}
                                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-150">
                                        <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                                          Vehicle License
                                        </span>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editVehicle}
                                            onChange={(e) =>
                                              setEditVehicle(e.target.value)
                                            }
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
                                          <span className="text-slate-400 text-[8px] font-semibold italic">
                                            No vehicle listed
                                          </span>
                                        )}
                                      </div>

                                      {/* Dues History Button */}
                                      <button
                                        type="button"
                                        onClick={() => setViewDuesHistoryMember(member)}
                                        className="w-full py-1 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-3xs active:scale-95"
                                        title="View complete invoice & payment ledger history for this flat"
                                      >
                                        <FileText className="w-3 h-3 text-purple-600" />
                                        <span>View Dues History</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">
                                No member records found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TABS: PAYMENTS ----------------- */}
                    {currentTab === "payments" && (
                      <div className="space-y-2.5 relative">
                        <div className="flex justify-between items-center flex-wrap gap-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Payments Ledger
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowPrintLedgerModal(true)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-3xs active:scale-95 ${
                                isDark
                                  ? "bg-purple-950/90 hover:bg-purple-900 text-purple-300 border border-purple-800/80"
                                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                              }`}
                              title="Generate & Print Official Ledger Receipt Statement"
                            >
                              <Printer className="w-3 h-3 text-purple-500 shrink-0" />
                              <span>Print Statement (PDF)</span>
                            </button>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Autosynced
                            </span>
                          </div>
                        </div>

                        {/* Collection vs Dues bar chart */}
                        {paymentsVsDuesData.length > 0 && (
                          <div className="bg-white p-2.5 rounded-2xl border border-slate-150 shadow-xs">
                            <div className="flex justify-between items-center mb-1 px-0.5">
                              <div>
                                <h4 className="text-[10px] font-extrabold text-slate-700">
                                  Collections vs Outstanding Dues
                                </h4>
                                <p className="text-[8px] text-slate-400 font-semibold">
                                  Monthly collections compared with current
                                  total unpaid dues
                                </p>
                              </div>
                            </div>
                            <div className="w-full h-[120px] text-[8px] -ml-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={paymentsVsDuesData}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: -25,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                  />
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
                                    tickFormatter={(val) =>
                                      `₹${val >= 1000 ? val / 1000 + "k" : val}`
                                    }
                                  />
                                  <Tooltip
                                    formatter={(value: any) => [
                                      `₹${value.toLocaleString()}`,
                                      "",
                                    ]}
                                    contentStyle={{
                                      backgroundColor: "#1e293b",
                                      borderRadius: "8px",
                                      border: "none",
                                      color: "#fff",
                                      fontSize: "9px",
                                      padding: "4px 8px",
                                    }}
                                    labelStyle={{
                                      fontWeight: "bold",
                                      color: "#cbd5e1",
                                    }}
                                  />
                                  <Bar
                                    dataKey="collected"
                                    fill="#10b981"
                                    radius={[3, 3, 0, 0]}
                                    name="Collected"
                                  />
                                  <Bar
                                    dataKey="outstanding"
                                    fill="#f43f5e"
                                    radius={[3, 3, 0, 0]}
                                    name="Outstanding"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Issued Invoices Section */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 mt-2">
                            Issued Maintenance Invoices
                          </h4>
                          {(() => {
                            const filteredInvoices = invoices.filter((inv) => {
                              const socMatch =
                                inv.SocietyId === activeSocietyId;
                              if (!socMatch) return false;
                              if (userRole === "Member") {
                                return inv.FlatNo === loggedInMemberFlat;
                              }
                              return true;
                            });

                            if (filteredInvoices.length === 0) {
                              return (
                                <p className="text-center text-[9px] text-slate-400 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                  No maintenance bills have been issued for this
                                  society yet.
                                </p>
                              );
                            }

                            const totalInvoicePages = Math.max(1, Math.ceil(filteredInvoices.length / invoicePageSize));
                            const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize);

                            return (
                              <div className="space-y-1.5 pr-0.5">
                                {paginatedInvoices.map((inv) => (
                                  <div
                                    key={inv.id}
                                    className="bg-slate-50 hover:bg-slate-100/50 p-2.5 rounded-xl border border-slate-150 flex justify-between items-center text-[10px] transition-colors"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="font-extrabold text-slate-800">
                                          Bill cycle: {inv.BillMonth}
                                        </h5>
                                        <span className="text-[7.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black font-sans uppercase">
                                          Flat {inv.FlatNo}
                                        </span>
                                      </div>
                                      <p className="text-[8px] text-slate-400 mt-0.5">
                                        Base: ₹{inv.BaseAmount} • Water: ₹
                                        {inv.WaterCharges} • Sec: ₹
                                        {inv.SecurityCharges} • Util: ₹
                                        {inv.ParkingCharges}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right flex items-center gap-1.5">
                                      <div>
                                        <span className="text-[11px] font-black block text-slate-800">
                                          ₹{inv.TotalAmount}
                                        </span>
                                        <span
                                          className={`text-[7px] font-black px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                                            inv.Status === "Paid"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-rose-100 text-rose-800"
                                          }`}
                                        >
                                          {inv.Status}
                                        </span>
                                      </div>

                                       {onPrintInvoice && (
                                        <button
                                          type="button"
                                          onClick={() => onPrintInvoice(inv)}
                                          title="Print / Download Tax Invoice & Official Receipt"
                                          className="p-1 bg-slate-200 hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {inv.Status === "Unpaid" &&
                                        userRole === "Member" && (
                                          <button
                                            onClick={() => {
                                              setMemberPayAmount(
                                                String(inv.TotalAmount),
                                              );
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
                                {filteredInvoices.length > invoicePageSize && (
                                  <div className="flex justify-between items-center bg-slate-100/90 px-2.5 py-1.5 rounded-xl text-[8.5px] font-bold text-slate-600 mt-1 border border-slate-200">
                                    <span>Showing {(invoicePage - 1) * invoicePageSize + 1}-{Math.min(invoicePage * invoicePageSize, filteredInvoices.length)} of {filteredInvoices.length}</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        disabled={invoicePage === 1}
                                        onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
                                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                      >
                                        Prev
                                      </button>
                                      <span className="font-mono">{invoicePage}/{totalInvoicePages}</span>
                                      <button
                                        disabled={invoicePage >= totalInvoicePages}
                                        onClick={() => setInvoicePage(p => Math.min(totalInvoicePages, p + 1))}
                                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                      >
                                        Next
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 mt-2">
                          Cleared Payments History
                        </h4>

                        <div className="space-y-2">
                          {(() => {
                            if (filteredPayments.length === 0) {
                              return (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">
                                    No payments recorded
                                  </p>
                                </div>
                              );
                            }
                            const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / paymentPageSize));
                            const paginatedPayments = filteredPayments.slice((paymentPage - 1) * paymentPageSize, paymentPage * paymentPageSize);

                            return (
                              <>
                                {paginatedPayments.map((pmt, i) => (
                                  <div
                                    key={i}
                                    className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-100">
                                        <CreditCard className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-slate-800">
                                          Flat {pmt.FlatNo}
                                        </h4>
                                        <span className="text-[9px] text-slate-400 font-semibold">
                                          {pmt.Mode} • {pmt.Date}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-xs font-extrabold text-emerald-600">
                                        +₹{pmt.Amount}
                                      </span>
                                      <span className="block text-[8px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-sm mt-0.5 text-center">
                                        Cleared
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {filteredPayments.length > paymentPageSize && (
                                  <div className="flex justify-between items-center bg-slate-100/90 px-2.5 py-1.5 rounded-xl text-[8.5px] font-bold text-slate-600 mt-1 border border-slate-200">
                                    <span>Showing {(paymentPage - 1) * paymentPageSize + 1}-{Math.min(paymentPage * paymentPageSize, filteredPayments.length)} of {filteredPayments.length}</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        disabled={paymentPage === 1}
                                        onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                      >
                                        Prev
                                      </button>
                                      <span className="font-mono">{paymentPage}/{totalPaymentPages}</span>
                                      <button
                                        disabled={paymentPage >= totalPaymentPages}
                                        onClick={() => setPaymentPage(p => Math.min(totalPaymentPages, p + 1))}
                                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                      >
                                        Next
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Floating Add Payment Button */}
                        <button
                          onClick={() => {
                            setPayFlatNo("");
                            setShowPaymentForm(true);
                          }}
                          className="absolute right-2 bottom-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-md transition-all z-40"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* ----------------- TABS: EXPENSES ----------------- */}
                    {currentTab === "expenses" && (
                      <div className="space-y-2.5 relative">
                        {/* Financial Insights Dashboard Panel */}
                        <FinancialInsightsPanel expenses={expenses} invoices={invoices} isDark={isDark} />

                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Debit Outflows
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                            Approved
                          </span>
                        </div>

                        <div className="space-y-2">
                          {expenses.length > 0 ? (
                            expenses.map((exp, i) => (
                              <div
                                key={i}
                                className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-rose-100/80 text-rose-700 flex items-center justify-center border border-rose-100">
                                    <TrendingDown className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800">
                                      {exp.Category}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 font-semibold">
                                      To: {exp.Vendor} • {exp.Date}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-xs font-extrabold text-rose-600">
                                    -₹{exp.Amount}
                                  </span>
                                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded-sm mt-0.5 text-center">
                                    Receipt
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">
                                No expenses recorded
                              </p>
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
                    {currentTab === "complaints" && (
                      <div className="space-y-2.5 relative">
                        {/* Complaints Header with Alert Bell */}
                        <div className="flex justify-between items-center px-0.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Complaints Board
                          </span>
                          <div
                            className="relative p-1 bg-amber-50 rounded-full border border-amber-200 text-amber-700 flex items-center justify-center"
                            title={`${complaints.filter((c) => c.Status === "Open").length} Open Complaints`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            {complaints.filter((c) => c.Status === "Open")
                              .length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse">
                                {
                                  complaints.filter((c) => c.Status === "Open")
                                    .length
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Complaint filter chips */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          {["All", "Open", "In Progress", "Resolved"].map(
                            (filter) => (
                              <button
                                key={filter}
                                onClick={() =>
                                  setComplaintFilter(filter as any)
                                }
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                                  complaintFilter === filter
                                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {filter}
                              </button>
                            ),
                          )}
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
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                      comp.Urgency === "High"
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : comp.Urgency === "Medium"
                                          ? "bg-amber-50 text-amber-600 border-amber-100"
                                          : "bg-green-50 text-green-600 border-green-100"
                                    }`}
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                                      {comp.Title}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 font-semibold">
                                      Flat {comp.FlatNo} • {comp.Date}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <span
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                      comp.Status === "Resolved"
                                        ? "bg-green-100 text-green-800"
                                        : comp.Status === "In Progress"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {comp.Status}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <SetupChecklist
                              society={activeSocietyObj || {
                                id: activeSocietyId,
                                Name: societyName,
                                PostalAddress: postalAddress,
                                HasWings: hasWings,
                                Wings: wingsList,
                                BuildingType: buildingType as any,
                                FeaturesEnabled: activeFeatures
                              }}
                              members={allMembers}
                              onOpenSocietySettings={() => {
                                setTempSocietyName(societyName);
                                setTempHasWings(hasWings);
                                setTempWingsList(wingsList.join(", "));
                                setTempPostalAddress(postalAddress);
                                setTempBuildingType(buildingType);
                                setTempStructureType(activeStructureType);
                                setTempTowers(JSON.parse(JSON.stringify(activeTowers)));
                                setTempFeatures(activeFeatures);
                                setShowSettingsModal(true);
                              }}
                              onOpenAddMember={() => setCurrentTab("members")}
                              onOpenBillingRules={() => setShowBillingEngine(true)}
                              onOpenSecuritySetup={() => setCurrentTab("staff")}
                              onOpenFeatureCatalog={() => setShowFeatureCatalogModal(true)}
                              theme={theme}
                            />
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
                    {currentTab === "notices" && (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Active Bulletins
                          </span>
                          {(userRole === "Admin" ||
                            userRole === "Committee Member") && (
                            <button
                              onClick={() => {
                                setNewNoticeTitle("");
                                setNewNoticeContent("");
                                setNewNoticeCategory("General");
                                setNewNoticeFileName("");
                                setNewNoticeFileUrl("");
                                setNewNoticeFileSize("");
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
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                                      {notice.Title}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 font-semibold">
                                      {notice.Category} • {notice.Date}
                                    </span>
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                              <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">
                                No active notice files found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentTab === "amenities" && (
                      <FacilityBookingManager
                        societyId={activeSocietyId}
                        loggedInMemberFlat={loggedInMemberFlat}
                        loggedInMemberName={activeResidentMember.OwnerName}
                        members={members}
                        onAddDues={onAddDues || (() => {})}
                        onAddAuditLog={onAddAuditLog || (() => {})}
                      />
                    )}

                    {/* ----------------- TABS: EMERGENCY CONTACTS ----------------- */}
                    {currentTab === "emergency" && (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                              Emergency Calls & SOS Hub
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Instant tap-to-call helplines & committee desk
                            </p>
                          </div>
                          {(userRole === "Admin" ||
                            userRole === "Committee Member") && (
                            <button
                              onClick={() => {
                                setNewEmergName("");
                                setNewEmergCategory("Police");
                                setNewEmergPhone("");
                                setNewEmergRoleTitle("");
                                setEditingEmergContact(null);
                                setShowAddEmergencyModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-black tracking-wide transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Helpline</span>
                            </button>
                          )}
                        </div>

                        {/* Category Filter Chips */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          {[
                            "All",
                            "Police",
                            "Ambulance",
                            "Fire",
                            "Hospital",
                            "Security",
                            "Electrician",
                            "Plumber",
                            "Committee",
                          ].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setEmergencyFilterCategory(cat)}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all whitespace-nowrap ${
                                emergencyFilterCategory === cat
                                  ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Contacts Grid / List */}
                        <div className="space-y-2">
                          {(() => {
                            const filtered = emergencyContacts.filter((c) => {
                              if (
                                c.SocietyId &&
                                c.SocietyId !== activeSocietyId
                              )
                                return false;
                              if (
                                emergencyFilterCategory !== "All" &&
                                c.Category !== emergencyFilterCategory
                              )
                                return false;
                              return true;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                  <PhoneCall className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">
                                    No emergency contacts listed
                                  </p>
                                </div>
                              );
                            }

                            return filtered.map((c) => {
                              const isCommittee = c.Category === "Committee";
                              return (
                                <div
                                  key={c.id}
                                  className="bg-white p-3 rounded-2xl border border-slate-150 shadow-2xs flex items-center justify-between hover:border-rose-200 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                        c.IsImportant
                                          ? "bg-rose-100 text-rose-700 border-rose-200"
                                          : isCommittee
                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                      }`}
                                    >
                                      <PhoneCall className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-black text-slate-800 truncate">
                                          {c.Name}
                                        </h4>
                                        {c.IsImportant && (
                                          <span className="text-[7px] bg-rose-600 text-white px-1 py-0.2 rounded font-black uppercase tracking-wider shrink-0">
                                            SOS
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-semibold truncate">
                                        {c.RoleOrTitle || c.Category} •{" "}
                                        {c.Category}
                                      </p>
                                      <span className="text-[10px] font-mono font-bold text-slate-700 block mt-0.5">
                                        {c.Phone}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <a
                                      href={`tel:${c.Phone}`}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>Call</span>
                                    </a>
                                    {(userRole === "Admin" ||
                                      userRole === "Committee Member") && (
                                      <button
                                        onClick={() => {
                                          setEditingEmergContact(c);
                                          setNewEmergName(c.Name);
                                          setNewEmergCategory(c.Category);
                                          setNewEmergPhone(c.Phone);
                                          setNewEmergRoleTitle(
                                            c.RoleOrTitle || "",
                                          );
                                          setShowAddEmergencyModal(true);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TABS: TENANT REGISTER & KYC ----------------- */}
                    {currentTab === "tenants" && (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                              <KeyRound className="w-4 h-4 text-amber-600" />
                              Tenant KYC & Rental Register
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Flat mappings, Police verification & Lease
                              agreements
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setNewTenFlatNo(
                                userRole === "Member" ? loggedInMemberFlat : "",
                              );
                              setNewTenName("");
                              setNewTenPhone("");
                              setNewTenEmail("");
                              setNewTenMoveIn("");
                              setNewTenMoveOut("");
                              setNewTenAgreementUrl("");
                              setNewTenIdProofUrl("");
                              setShowAddTenantModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[9px] font-black tracking-wide transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Register Tenant</span>
                          </button>
                        </div>

                        {/* Stats Banner */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                          <div className="text-center">
                            <span className="text-[8px] uppercase text-slate-400 font-extrabold block">
                              Total Tenants
                            </span>
                            <span className="text-sm font-black text-slate-800">
                              {
                                tenants.filter(
                                  (t) =>
                                    !t.SocietyId ||
                                    t.SocietyId === activeSocietyId,
                                ).length
                              }
                            </span>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <span className="text-[8px] uppercase text-emerald-600 font-extrabold block">
                              Verified KYC
                            </span>
                            <span className="text-sm font-black text-emerald-700">
                              {
                                tenants.filter(
                                  (t) =>
                                    (!t.SocietyId ||
                                      t.SocietyId === activeSocietyId) &&
                                    t.KycStatus === "Verified",
                                ).length
                              }
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[8px] uppercase text-amber-600 font-extrabold block">
                              Pending Approval
                            </span>
                            <span className="text-sm font-black text-amber-700">
                              {
                                tenants.filter(
                                  (t) =>
                                    (!t.SocietyId ||
                                      t.SocietyId === activeSocietyId) &&
                                    t.KycStatus === "Pending",
                                ).length
                              }
                            </span>
                          </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          {["All", "Pending", "Verified", "Rejected"].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  setTenantFilterKyc(status as any)
                                }
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all ${
                                  tenantFilterKyc === status
                                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {status}
                              </button>
                            ),
                          )}
                        </div>

                        {/* Tenant Cards */}
                        <div className="space-y-2.5">
                          {(() => {
                            const filtered = tenants.filter((t) => {
                              if (
                                t.SocietyId &&
                                t.SocietyId !== activeSocietyId
                              )
                                return false;
                              if (
                                userRole === "Member" &&
                                t.FlatNo !== loggedInMemberFlat
                              )
                                return false;
                              if (
                                tenantFilterKyc !== "All" &&
                                t.KycStatus !== tenantFilterKyc
                              )
                                return false;
                              return true;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                  <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                  <p className="text-xs font-semibold">
                                    No tenant records found
                                  </p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">
                                    Use "Register Tenant" above to add rental
                                    details
                                  </p>
                                </div>
                              );
                            }

                            return filtered.map((t) => (
                              <div
                                key={t.id}
                                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-amber-300 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[9px] font-bold">
                                      Flat {t.FlatNo}
                                    </span>
                                    <h4 className="text-xs font-black text-slate-800 mt-1">
                                      {t.TenantName}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 font-semibold">
                                      {t.ContactNo} • {t.Email || "No Email"}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                        t.KycStatus === "Verified"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : t.KycStatus === "Rejected"
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                                      }`}
                                    >
                                      {t.KycStatus === "Verified" && (
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                      )}
                                      {t.KycStatus === "Pending" && (
                                        <Clock className="w-2.5 h-2.5" />
                                      )}
                                      {t.KycStatus === "Rejected" && (
                                        <AlertCircle className="w-2.5 h-2.5" />
                                      )}
                                      <span>KYC {t.KycStatus}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Move In / Out Dates */}
                                <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  <div>
                                    <span className="text-slate-400 block font-bold uppercase text-[7px]">
                                      Move-In Date
                                    </span>
                                    <span className="font-semibold text-slate-700">
                                      {t.MoveInDate || "Not specified"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-bold uppercase text-[7px]">
                                      Lease / Move-Out
                                    </span>
                                    <span className="font-semibold text-slate-700">
                                      {t.MoveOutDate || "Ongoing"}
                                    </span>
                                  </div>
                                </div>

                                {/* Documents Attachment Action Buttons */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {t.AgreementDocUrl ? (
                                    <button
                                      onClick={async () => {
                                        const signedUrl =
                                          await getSignedFileUrl(
                                            "tenant-kyc",
                                            t.AgreementDocUrl!,
                                          );
                                        setViewingDocModal({
                                          title: `Rental Agreement (${t.TenantName})`,
                                          url: signedUrl,
                                          label: `Flat ${t.FlatNo}`,
                                        });
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <FileText className="w-3 h-3 text-purple-600" />
                                      <span>Agreement PDF</span>
                                    </button>
                                  ) : (
                                    <span className="text-[8px] text-slate-400 italic">
                                      No Agreement attached
                                    </span>
                                  )}

                                  {t.IdProofUrl ? (
                                    <button
                                      onClick={async () => {
                                        const signedUrl =
                                          await getSignedFileUrl(
                                            "tenant-kyc",
                                            t.IdProofUrl!,
                                          );
                                        setViewingDocModal({
                                          title: `Police Verification / ID Proof (${t.TenantName})`,
                                          url: signedUrl,
                                          label: `Flat ${t.FlatNo}`,
                                        });
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      <span>Police Verification Proof</span>
                                    </button>
                                  ) : (
                                    <span className="text-[8px] text-slate-400 italic">
                                      No ID Proof attached
                                    </span>
                                  )}
                                </div>

                                {/* Remarks if rejected */}
                                {t.KycStatus === "Rejected" && t.Remarks && (
                                  <div className="p-2 bg-rose-50 text-rose-800 text-[9px] rounded-lg border border-rose-100">
                                    <strong>Rejection Reason:</strong>{" "}
                                    {t.Remarks}
                                  </div>
                                )}

                                {/* Admin Review Button */}
                                {(userRole === "Admin" ||
                                  userRole === "Committee Member") && (
                                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                                    <button
                                      onClick={() => {
                                        setActiveKycReviewTenant(t);
                                        setKycRemarksInput(t.Remarks || "");
                                      }}
                                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[9px] font-bold cursor-pointer transition-colors border border-purple-200 flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Review & Audit KYC</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TABS: PARKING & VEHICLES REGISTER ----------------- */}
                    {currentTab === "parking" && (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                              <Car className="w-4 h-4 text-indigo-600" />
                              Vehicle & Guest Parking Register
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              License plates, slot allocations & visitor parking
                              passes
                            </p>
                          </div>
                        </div>

                        {/* Sub-tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => setParkingSubTab("resident")}
                            className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all text-center ${
                              parkingSubTab === "resident"
                                ? "bg-white text-indigo-700 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            🚘 Resident Vehicles (
                            {
                              vehicles.filter(
                                (v) =>
                                  !v.SocietyId ||
                                  v.SocietyId === activeSocietyId,
                              ).length
                            }
                            )
                          </button>
                          <button
                            onClick={() => setParkingSubTab("guest")}
                            className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-all text-center ${
                              parkingSubTab === "guest"
                                ? "bg-white text-indigo-700 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            🎫 Guest Parking Passes (
                            {
                              guestParkings.filter(
                                (g) =>
                                  (!g.SocietyId ||
                                    g.SocietyId === activeSocietyId) &&
                                  g.Status === "Active",
                              ).length
                            }
                            )
                          </button>
                        </div>

                        {/* SUB-TAB 1: RESIDENT VEHICLES */}
                        {parkingSubTab === "resident" && (
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                REGISTERED FLATS FLEET
                              </span>
                              <button
                                onClick={() => {
                                  setNewVehFlatNo(
                                    userRole === "Member"
                                      ? loggedInMemberFlat
                                      : "",
                                  );
                                  setNewVehOwnerName(
                                    activeResidentMember.OwnerName || "",
                                  );
                                  setNewVehNo("");
                                  setNewVehType("4-Wheeler");
                                  setNewVehSlotNo("");
                                  setNewVehStickerIssued(true);
                                  setShowAddVehicleModal(true);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black tracking-wide transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Vehicle</span>
                              </button>
                            </div>

                            {/* Vehicles List */}
                            <div className="space-y-2">
                              {(() => {
                                const filtered = vehicles.filter((v) => {
                                  if (
                                    v.SocietyId &&
                                    v.SocietyId !== activeSocietyId
                                  )
                                    return false;
                                  if (
                                    userRole === "Member" &&
                                    v.FlatNo !== loggedInMemberFlat
                                  )
                                    return false;
                                  if (searchQuery) {
                                    const q = searchQuery.toLowerCase();
                                    return (
                                      v.VehicleNo.toLowerCase().includes(q) ||
                                      v.FlatNo.toLowerCase().includes(q) ||
                                      v.OwnerName.toLowerCase().includes(q)
                                    );
                                  }
                                  return true;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                      <Car className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-semibold">
                                        No resident vehicles registered
                                      </p>
                                    </div>
                                  );
                                }

                                return filtered.map((v) => (
                                  <div
                                    key={v.id}
                                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-indigo-300 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Metallic Plate Tag */}
                                      <div className="inline-flex items-center gap-1 bg-yellow-50 text-slate-900 border-2 border-slate-800 rounded px-2 py-1 text-[10px] font-black font-mono shadow-3xs uppercase shrink-0">
                                        <Car className="w-3 h-3 text-slate-700" />
                                        <span>{v.VehicleNo}</span>
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-black text-slate-800">
                                            Flat {v.FlatNo}
                                          </span>
                                          <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                            {v.VehicleType}
                                          </span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-semibold truncate">
                                          {v.OwnerName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          {v.SlotNo && (
                                            <span className="text-[8px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                              Slot: {v.SlotNo}
                                            </span>
                                          )}
                                          {v.StickerIssued && (
                                            <span className="text-[7px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                                              STICKER ISSUED
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {(userRole === "Admin" ||
                                      userRole === "Committee Member") &&
                                      onDeleteVehicle && (
                                        <button
                                          onClick={() => {
                                            if (
                                              confirm(
                                                `Remove vehicle ${v.VehicleNo}?`,
                                              )
                                            ) {
                                              onDeleteVehicle(v.id);
                                              triggerToast(
                                                `Removed vehicle ${v.VehicleNo}`,
                                              );
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                          title="Delete Vehicle"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 2: GUEST PARKING PASSES */}
                        {parkingSubTab === "guest" && (
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                VISITOR PARKING PERMITS
                              </span>
                              <button
                                onClick={() => {
                                  setNewGPassFlatNo(
                                    userRole === "Member"
                                      ? loggedInMemberFlat
                                      : "",
                                  );
                                  setNewGPassGuestName("");
                                  setNewGPassVehNo("");
                                  setNewGPassVehType("4-Wheeler");
                                  setNewGPassSlot("Visitor Slot V-01");
                                  setNewGPassValidFrom(
                                    new Date().toISOString().split("T")[0],
                                  );
                                  setNewGPassValidUntil(
                                    new Date(Date.now() + 86400000)
                                      .toISOString()
                                      .split("T")[0],
                                  );
                                  setShowAddGuestParkingModal(true);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black tracking-wide transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Issue Guest Pass</span>
                              </button>
                            </div>

                            {/* Guest Passes List */}
                            <div className="space-y-2">
                              {(() => {
                                const filtered = guestParkings.filter((g) => {
                                  if (
                                    g.SocietyId &&
                                    g.SocietyId !== activeSocietyId
                                  )
                                    return false;
                                  if (
                                    userRole === "Member" &&
                                    g.FlatNo !== loggedInMemberFlat
                                  )
                                    return false;
                                  return true;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                      <ParkingSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-semibold">
                                        No active guest parking passes
                                      </p>
                                    </div>
                                  );
                                }

                                return filtered.map((g) => (
                                  <div
                                    key={g.id}
                                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-black uppercase">
                                          Slot {g.AssignedSlot}
                                        </span>
                                        <h4 className="text-xs font-black text-slate-800 mt-1">
                                          {g.GuestName}
                                        </h4>
                                        <p className="text-[9px] text-slate-400 font-semibold">
                                          Host Flat {g.FlatNo} •{" "}
                                          {g.GuestVehicleNo}
                                        </p>
                                      </div>

                                      <div className="text-right">
                                        <span
                                          className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                            g.Status === "Active"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : "bg-slate-100 text-slate-600 border-slate-200"
                                          }`}
                                        >
                                          {g.Status}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[8px] text-slate-500 font-semibold">
                                      <span>
                                        Valid: {g.ValidFrom} to {g.ValidUntil}
                                      </span>
                                      {g.Status === "Active" &&
                                        onUpdateGuestParkingStatus && (
                                          <button
                                            onClick={() => {
                                              onUpdateGuestParkingStatus(
                                                g.id,
                                                "Completed",
                                              );
                                              triggerToast(
                                                `Guest pass completed & slot vacated`,
                                              );
                                            }}
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold cursor-pointer transition-colors"
                                          >
                                            Vacate Slot
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----------------- TABS: DOCUMENTS REPOSITORY (TIER 2) ----------------- */}
                    {currentTab === "documents" && (
                      <div className="space-y-3 relative pb-10">
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />{" "}
                              Society Document Vault
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Centralized circulars, AGM minutes & legal records
                            </p>
                          </div>
                          {userRole === "Admin" && (
                            <button
                              onClick={() => {
                                setNewDocTitle("");
                                setNewDocFileName("");
                                setNewDocUrl("");
                                setNewDocNotes("");
                                setNewDocIsPublic(true);
                                setShowAddDocModal(true);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-[9.5px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Upload Doc
                            </button>
                          )}
                        </div>

                        {/* Category Filter Chips */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                          {[
                            "All",
                            "Legal Documents",
                            "AGM Minutes",
                            "Financial Audits",
                            "Building Rules",
                            "Circulars",
                          ].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setDocFilterCategory(cat)}
                              className={`px-2.5 py-1 text-[9px] font-extrabold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                                docFilterCategory === cat
                                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Document List */}
                        <div className="space-y-2">
                          {(() => {
                            const filteredDocs = societyDocuments.filter(
                              (d) => {
                                if (
                                  d.SocietyId &&
                                  activeSocietyId &&
                                  d.SocietyId !== activeSocietyId
                                )
                                  return false;
                                if (
                                  docFilterCategory !== "All" &&
                                  d.Category !== docFilterCategory
                                )
                                  return false;
                                if (userRole === "Member" && !d.IsPublic)
                                  return false;
                                return true;
                              },
                            );

                            if (filteredDocs.length === 0) {
                              return (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-250 text-slate-400 space-y-2">
                                  <FolderKanban className="w-9 h-9 mx-auto text-slate-300" />
                                  <p className="text-xs font-bold">
                                    No documents found
                                  </p>
                                  <p className="text-[9px] text-slate-400">
                                    Select another category or upload new
                                    records
                                  </p>
                                </div>
                              );
                            }

                            return filteredDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                                        {doc.Title}
                                      </h4>
                                      <p className="text-[8.5px] text-slate-400 font-semibold mt-0.5">
                                        {doc.Category} • Uploaded{" "}
                                        {doc.UploadDate}{" "}
                                        {doc.UploadedBy
                                          ? `by ${doc.UploadedBy}`
                                          : ""}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 border ${
                                      doc.IsPublic
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    {doc.IsPublic
                                      ? "Public Access"
                                      : "Committee Only"}
                                  </span>
                                </div>

                                {doc.Notes && (
                                  <p className="text-[9px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    {doc.Notes}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px]">
                                  <span className="text-slate-400 font-mono font-medium">
                                    {doc.FileName || "Document.pdf"} (
                                    {doc.FileSize || "1.2 MB"})
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    {userRole === "Admin" &&
                                      onToggleDocumentVisibility && (
                                        <button
                                          onClick={() => {
                                            onToggleDocumentVisibility(
                                              doc.id,
                                              !doc.IsPublic,
                                            );
                                            triggerToast(
                                              `Document set to ${!doc.IsPublic ? "Public" : "Private"}`,
                                            );
                                          }}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[8.5px] flex items-center gap-1 transition-colors cursor-pointer"
                                          title="Toggle Public/Private"
                                        >
                                          {doc.IsPublic ? (
                                            <EyeOff className="w-3 h-3 text-amber-600" />
                                          ) : (
                                            <Eye className="w-3 h-3 text-emerald-600" />
                                          )}
                                          {doc.IsPublic
                                            ? "Make Private"
                                            : "Make Public"}
                                        </button>
                                      )}

                                    <button
                                      onClick={async () => {
                                        const signedUrl = await getSignedFileUrl(
                                          "society-docs",
                                          doc.DocumentUrl,
                                        );
                                        setPreviewingSocietyDoc({
                                          ...doc,
                                          DocumentUrl: signedUrl,
                                        });
                                      }}
                                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[8.5px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" /> Preview
                                    </button>

                                    {userRole === "Admin" &&
                                      onDeleteSocietyDocument && (
                                        <button
                                          onClick={() => {
                                            if (
                                              confirm(
                                                `Delete document "${doc.Title}"?`,
                                              )
                                            ) {
                                              onDeleteSocietyDocument(doc.id);
                                              triggerToast(`Document deleted`);
                                            }
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                          title="Delete document"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TABS: LIFT & AMC REGISTER (TIER 2) ----------------- */}
                    {currentTab === "amc" && (
                      <div className="space-y-3 relative pb-10">
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-teal-600" />{" "}
                              Lift Maintenance & AMC Register
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Technician contacts, expiry alerts & servicing
                              history
                            </p>
                          </div>
                          {userRole === "Admin" && (
                            <button
                              onClick={() => {
                                setNewAmcAssetName("");
                                setNewAmcVendorName("");
                                setNewAmcTechName("");
                                setNewAmcTechContact("");
                                setNewAmcStartDate(
                                  new Date().toISOString().split("T")[0],
                                );
                                setNewAmcExpiryDate(
                                  new Date(Date.now() + 365 * 86400000)
                                    .toISOString()
                                    .split("T")[0],
                                );
                                setNewAmcNextDue(
                                  new Date(Date.now() + 90 * 86400000)
                                    .toISOString()
                                    .split("T")[0],
                                );
                                setShowAddAmcModal(true);
                              }}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-lg text-[9.5px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> New AMC
                            </button>
                          )}
                        </div>

                        {/* Filter Category Chips */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                          {[
                            "All",
                            "Lift / Elevator",
                            "Diesel Generator",
                            "Water Pump",
                            "Fire Safety System",
                            "CCTV & Gate",
                          ].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setAmcFilterCategory(cat)}
                              className={`px-2.5 py-1 text-[9px] font-extrabold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                                amcFilterCategory === cat
                                  ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* AMC Cards List */}
                        <div className="space-y-2.5">
                          {(() => {
                            const filteredAmcs = assetAMCs.filter((a) => {
                              if (
                                a.SocietyId &&
                                activeSocietyId &&
                                a.SocietyId !== activeSocietyId
                              )
                                return false;
                              if (
                                amcFilterCategory !== "All" &&
                                a.Category !== amcFilterCategory
                              )
                                return false;
                              return true;
                            });

                            if (filteredAmcs.length === 0) {
                              return (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-250 text-slate-400 space-y-2">
                                  <Wrench className="w-9 h-9 mx-auto text-slate-300" />
                                  <p className="text-xs font-bold">
                                    No AMC Contracts Found
                                  </p>
                                  <p className="text-[9px] text-slate-400">
                                    Add maintenance contracts for lifts,
                                    generators, and pumps
                                  </p>
                                </div>
                              );
                            }

                            return filteredAmcs.map((item) => {
                              // Expiry logic check (within 60 days)
                              const today = new Date();
                              const expDate = new Date(item.ContractExpiryDate);
                              const daysToExpiry = Math.ceil(
                                (expDate.getTime() - today.getTime()) /
                                  (1000 * 3600 * 24),
                              );
                              const isExpiringSoon =
                                daysToExpiry <= 60 && daysToExpiry >= 0;
                              const isExpired = daysToExpiry < 0;

                              return (
                                <div
                                  key={item.id}
                                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-teal-300 transition-colors"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-black text-slate-900">
                                          {item.AssetName}
                                        </h4>
                                        <span className="text-[8px] bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                          {item.Category}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                                        AMC Vendor:{" "}
                                        <span className="font-bold text-slate-700">
                                          {item.VendorName}
                                        </span>
                                      </p>
                                    </div>

                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                        item.Status === "Operational"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : item.Status === "Under Maintenance"
                                            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {item.Status}
                                    </span>
                                  </div>

                                  {/* AMC Expiration Alert Badge if <= 60 days */}
                                  {(isExpiringSoon || isExpired) && (
                                    <div
                                      className={`p-2 rounded-xl text-[9px] font-bold flex items-center gap-1.5 border ${
                                        isExpired
                                          ? "bg-rose-50 text-rose-800 border-rose-200"
                                          : "bg-amber-50 text-amber-800 border-amber-200"
                                      }`}
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>
                                        {isExpired
                                          ? `⚠️ AMC Contract Expired on ${item.ContractExpiryDate}!`
                                          : `⚠️ AMC Expires in ${daysToExpiry} days (${item.ContractExpiryDate}). Renew Contract.`}
                                      </span>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <div>
                                      <span className="text-slate-400 block font-semibold">
                                        Contract Validity
                                      </span>
                                      <span className="font-bold text-slate-700">
                                        {item.ContractStartDate} to{" "}
                                        {item.ContractExpiryDate}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block font-semibold">
                                        Next Service Due
                                      </span>
                                      <span className="font-bold text-teal-700">
                                        {item.NextServiceDueDate ||
                                          "As per schedule"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Technician Details & Direct Tap-to-Call */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px]">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <div className="min-w-0">
                                        <span className="font-bold text-slate-800 truncate block">
                                          {item.TechnicianName}
                                        </span>
                                        <span className="text-slate-400 text-[8px] font-mono">
                                          {item.TechnicianContact}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <a
                                        href={`tel:${item.TechnicianContact}`}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[8.5px] flex items-center gap-1 shadow-2xs transition-colors"
                                      >
                                        <PhoneCall className="w-3 h-3" /> Call
                                        Tech
                                      </a>

                                      {userRole === "Admin" && (
                                        <button
                                          onClick={() => {
                                            setShowServiceLogModal(item);
                                            setServiceNotes(item.Remarks || "");
                                          }}
                                          className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold rounded-lg text-[8.5px] border border-teal-200 transition-colors cursor-pointer"
                                        >
                                          Log Service
                                        </button>
                                      )}

                                      {userRole === "Admin" &&
                                        onDeleteAssetAMC && (
                                          <button
                                            onClick={() => {
                                              if (
                                                confirm(
                                                  `Delete AMC entry for "${item.AssetName}"?`,
                                                )
                                              ) {
                                                onDeleteAssetAMC(item.id);
                                                triggerToast(
                                                  `AMC entry removed`,
                                                );
                                              }
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TABS: WATER METERS & TANK CLEANING (TIER 2) ----------------- */}
                    {currentTab === "watermeters" && (
                      <div className="space-y-3 relative pb-10">
                        <div className="flex justify-between items-center px-0.5">
                          <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Droplets className="w-3.5 h-3.5 text-cyan-600" />{" "}
                              Water Infrastructure Register
                            </h3>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Flat meters, consumption graphs & quarterly tank
                              logs
                            </p>
                          </div>
                        </div>

                        {/* Sub Tab Switcher: Water Meters vs Water Tank Cleaning */}
                        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl gap-1">
                          <button
                            onClick={() => setWaterSubTab("meters")}
                            className={`py-1.5 text-[9.5px] font-black rounded-lg transition-all cursor-pointer ${
                              waterSubTab === "meters"
                                ? "bg-white text-cyan-700 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            💧 Meter Consumption
                          </button>
                          <button
                            onClick={() => setWaterSubTab("tanks")}
                            className={`py-1.5 text-[9.5px] font-black rounded-lg transition-all cursor-pointer ${
                              waterSubTab === "tanks"
                                ? "bg-white text-cyan-700 shadow-2xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            🛢️ Tank Cleaning Log
                          </button>
                        </div>

                        {/* SUB-TAB 1: WATER METER READINGS & CONSUMPTION */}
                        {waterSubTab === "meters" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                              <div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Billing Period
                                </span>
                                <select
                                  value={waterReadingMonth}
                                  onChange={(e) =>
                                    setWaterReadingMonth(e.target.value)
                                  }
                                  className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                                >
                                  <option value="July 2026">July 2026</option>
                                  <option value="June 2026">June 2026</option>
                                  <option value="May 2026">May 2026</option>
                                </select>
                              </div>

                              {userRole === "Admin" && (
                                <button
                                  onClick={() => {
                                    // Initialize batch inputs from current members list
                                    const initial = members.map((m) => {
                                      const existing = waterMeters.find(
                                        (wm) =>
                                          wm.FlatNo === m.FlatNo &&
                                          wm.ReadingMonth === waterReadingMonth,
                                      );
                                      return {
                                        flatNo: m.FlatNo,
                                        currentReading: existing
                                          ? String(existing.CurrentReading)
                                          : String(
                                              (existing?.PreviousReading ||
                                                120) + 15,
                                            ),
                                        prevReading: existing
                                          ? existing.PreviousReading
                                          : 120,
                                        unitRate: existing
                                          ? existing.UnitRate
                                          : 12,
                                      };
                                    });
                                    setBatchMeterReadings(initial);
                                    setShowBatchWaterMeterModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-[9.5px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Batch Monthly
                                  Entry
                                </button>
                              )}
                            </div>

                            {/* Consumption Summary Stats */}
                            {(() => {
                              const currentMeters = waterMeters.filter((wm) => {
                                if (
                                  wm.SocietyId &&
                                  activeSocietyId &&
                                  wm.SocietyId !== activeSocietyId
                                )
                                  return false;
                                return wm.ReadingMonth === waterReadingMonth;
                              });

                              const totalConsumption = currentMeters.reduce(
                                (acc, curr) => acc + (curr.ConsumedUnits || 0),
                                0,
                              );
                              const totalCharges = currentMeters.reduce(
                                (acc, curr) => acc + (curr.TotalCharge || 0),
                                0,
                              );
                              const avgPerFlat =
                                currentMeters.length > 0
                                  ? Math.round(
                                      totalConsumption / currentMeters.length,
                                    )
                                  : 0;

                              return (
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-cyan-50/80 p-2.5 rounded-2xl border border-cyan-150 text-center">
                                    <span className="text-[8px] font-bold text-cyan-800 uppercase block">
                                      Total Consumed
                                    </span>
                                    <span className="text-xs font-black text-cyan-900 mt-0.5 block">
                                      {totalConsumption} Units
                                    </span>
                                  </div>
                                  <div className="bg-blue-50/80 p-2.5 rounded-2xl border border-blue-150 text-center">
                                    <span className="text-[8px] font-bold text-blue-800 uppercase block">
                                      Avg / Flat
                                    </span>
                                    <span className="text-xs font-black text-blue-900 mt-0.5 block">
                                      {avgPerFlat} Units
                                    </span>
                                  </div>
                                  <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-150 text-center">
                                    <span className="text-[8px] font-bold text-emerald-800 uppercase block">
                                      Est. Charges
                                    </span>
                                    <span className="text-xs font-black text-emerald-900 mt-0.5 block">
                                      ₹{totalCharges.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Recharts Bar Chart: Water Consumption Comparison */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Flat Consumption Chart (Units)
                              </span>
                              <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={waterMeters
                                      .filter(
                                        (wm) =>
                                          (!wm.SocietyId ||
                                            wm.SocietyId === activeSocietyId) &&
                                          wm.ReadingMonth === waterReadingMonth,
                                      )
                                      .map((wm) => ({
                                        Flat: `Flat ${wm.FlatNo}`,
                                        Units: wm.ConsumedUnits || 0,
                                      }))}
                                    margin={{
                                      top: 10,
                                      right: 10,
                                      left: -20,
                                      bottom: 0,
                                    }}
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      vertical={false}
                                      stroke="#f1f5f9"
                                    />
                                    <XAxis
                                      dataKey="Flat"
                                      tick={{ fontSize: 9 }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis
                                      tick={{ fontSize: 9 }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#0f172a",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "10px",
                                      }}
                                    />
                                    <Bar
                                      dataKey="Units"
                                      fill="#06b6d4"
                                      radius={[6, 6, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Individual Flat Meter Cards */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-0.5">
                                Flat Water Meter Breakdown
                              </span>
                              {(() => {
                                const filteredMeters = waterMeters.filter(
                                  (wm) => {
                                    if (
                                      wm.SocietyId &&
                                      activeSocietyId &&
                                      wm.SocietyId !== activeSocietyId
                                    )
                                      return false;
                                    if (wm.ReadingMonth !== waterReadingMonth)
                                      return false;
                                    if (
                                      userRole === "Member" &&
                                      loggedInMemberFlat &&
                                      wm.FlatNo !== loggedInMemberFlat
                                    )
                                      return false;
                                    return true;
                                  },
                                );

                                if (filteredMeters.length === 0) {
                                  return (
                                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-250 text-slate-400">
                                      <p className="text-xs font-bold">
                                        No readings recorded for{" "}
                                        {waterReadingMonth}
                                      </p>
                                    </div>
                                  );
                                }

                                return filteredMeters.map((wm) => (
                                  <div
                                    key={wm.id}
                                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-black text-slate-800">
                                          Flat {wm.FlatNo}
                                        </h4>
                                        <span className="text-[8px] font-mono text-slate-400">
                                          MTR: {wm.MeterSerialNo}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                                        Readings:{" "}
                                        <span className="font-semibold text-slate-700">
                                          {wm.PreviousReading} →{" "}
                                          {wm.CurrentReading}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-xs font-black text-cyan-700 block">
                                        {wm.ConsumedUnits} Units
                                      </span>
                                      <span className="text-[8.5px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                        ₹{wm.TotalCharge} (@ ₹{wm.UnitRate}
                                        /unit)
                                      </span>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 2: WATER TANK CLEANING LOG */}
                        {waterSubTab === "tanks" && (
                          <div className="space-y-3">
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3.5 rounded-2xl text-white shadow-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-cyan-200">
                                    QUARTERLY & BI-ANNUAL HYGIENE
                                  </span>
                                  <h4 className="text-sm font-black mt-0.5">
                                    Water Tank Maintenance Schedule
                                  </h4>
                                </div>
                                {userRole === "Admin" && (
                                  <button
                                    onClick={() => {
                                      setTankName("Overhead Tank A");
                                      setTankCapacity("50,000 Liters");
                                      setTankVendor("AquaClean Services");
                                      setTankLastCleaned(
                                        new Date().toISOString().split("T")[0],
                                      );
                                      setTankNextDue(
                                        new Date(Date.now() + 90 * 86400000)
                                          .toISOString()
                                          .split("T")[0],
                                      );
                                      setShowAddTankCleaningModal(true);
                                    }}
                                    className="px-2.5 py-1 bg-white text-cyan-800 hover:bg-cyan-50 text-[9px] font-black rounded-lg shadow-2xs transition-colors cursor-pointer"
                                  >
                                    + Log Cleaning
                                  </button>
                                )}
                              </div>
                              <p className="text-[9.5px] text-cyan-100 leading-relaxed">
                                Maintain clean overhead tanks and underground
                                sumps according to municipal health regulations.
                              </p>
                            </div>

                            {/* Tank Records List */}
                            <div className="space-y-2.5">
                              {[
                                {
                                  name: "Overhead Tank - Wing A & B",
                                  type: "Overhead Tank",
                                  capacity: "50,000 Liters",
                                  last: "2026-06-15",
                                  next: "2026-09-15",
                                  vendor: "AquaClean Tech",
                                  status: "Cleaned",
                                },
                                {
                                  name: "Overhead Tank - Wing C & D",
                                  type: "Overhead Tank",
                                  capacity: "50,000 Liters",
                                  last: "2026-06-15",
                                  next: "2026-09-15",
                                  vendor: "AquaClean Tech",
                                  status: "Cleaned",
                                },
                                {
                                  name: "Underground Main Sump A",
                                  type: "Underground Sump",
                                  capacity: "1,20,000 Liters",
                                  last: "2026-04-10",
                                  next: "2026-07-30",
                                  vendor: "HydroCare Services",
                                  status: "Due Soon",
                                },
                              ].map((tank, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-xs font-black text-slate-900">
                                        {tank.name}
                                      </h4>
                                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                        Capacity: {tank.capacity} • Vendor:{" "}
                                        {tank.vendor}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                        tank.status === "Cleaned"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                      }`}
                                    >
                                      {tank.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <div>
                                      <span className="text-slate-400 font-semibold block">
                                        Last Serviced Date
                                      </span>
                                      <span className="font-bold text-slate-700">
                                        {tank.last}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-semibold block">
                                        Next Due Date
                                      </span>
                                      <span className="font-bold text-cyan-700">
                                        {tank.next}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Admin Action: Broadcast Cleaning Notice to Bulletin */}
                                  {userRole === "Admin" && onAddNotice && (
                                    <button
                                      onClick={() => {
                                        onAddNotice({
                                          title: `Water Tank Cleaning Scheduled: ${tank.name}`,
                                          category: "Maintenance",
                                          content: `Dear Residents, quarterly water tank cleaning for ${tank.name} is scheduled for ${tank.next}. Water supply may be restricted between 10 AM and 2 PM. Please store sufficient water.`,
                                          uploadedBy:
                                            "Secretary / Management Committee",
                                        });
                                        triggerToast(
                                          `Cleaning notice broadcasted to residents!`,
                                        );
                                      }}
                                      className="w-full py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold rounded-xl text-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Megaphone className="w-3 h-3 text-cyan-600" />{" "}
                                      Broadcast Notice to Bulletin Board
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: POLLS & DEMOCRATIC RESOLUTIONS */}
                    {currentTab === "polls" && (
                      <div className="space-y-3 animate-fade-in">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-3.5 rounded-2xl text-white shadow-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-200">
                                DEMOCRATIC GOVERNANCE & E-VOTING
                              </span>
                              <h3 className="text-sm font-black mt-0.5">
                                AGM Polls & Resolutions
                              </h3>
                            </div>
                            {userRole === "Admin" && (
                              <button
                                onClick={() => {
                                  setNewPollTitle("");
                                  setNewPollDescription("");
                                  setNewPollCategory("AGM Resolution");
                                  setNewPollStartDate(
                                    new Date().toISOString().split("T")[0],
                                  );
                                  setNewPollEndDate(
                                    new Date(Date.now() + 7 * 86400000)
                                      .toISOString()
                                      .split("T")[0],
                                  );
                                  setShowCreatePollModal(true);
                                }}
                                className="px-2.5 py-1 bg-white text-amber-800 hover:bg-amber-50 text-[9px] font-black rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3 text-amber-700" />
                                <span>Create Poll</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[9.5px] text-amber-100 leading-relaxed">
                            Cast securely recorded e-votes on major society
                            motions, maintenance fee revisions, and AGM
                            resolutions.
                          </p>
                        </div>

                        {/* Poll List */}
                        <div className="space-y-3">
                          {rawPolls.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 text-slate-400">
                              <Vote className="w-8 h-8 mx-auto text-amber-500 mb-2 opacity-60" />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                No active polls or resolutions
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">
                                Society elections and motions will appear here
                              </p>
                            </div>
                          ) : (
                            rawPolls.map((poll) => {
                              const votesForPoll = rawPollVotes.filter(
                                (v) => v.PollId === poll.id,
                              );
                              const totalVotes = votesForPoll.length;
                              const yesVotes = votesForPoll.filter(
                                (v) => v.SelectedOption === "Yes",
                              ).length;
                              const noVotes = votesForPoll.filter(
                                (v) => v.SelectedOption === "No",
                              ).length;
                              const abstainVotes = votesForPoll.filter(
                                (v) => v.SelectedOption === "Abstain",
                              ).length;

                              const yesPct =
                                totalVotes > 0
                                  ? Math.round((yesVotes / totalVotes) * 100)
                                  : 0;
                              const noPct =
                                totalVotes > 0
                                  ? Math.round((noVotes / totalVotes) * 100)
                                  : 0;
                              const abstainPct =
                                totalVotes > 0
                                  ? Math.round(
                                      (abstainVotes / totalVotes) * 100,
                                    )
                                  : 0;

                              const userVote = votesForPoll.find(
                                (v) =>
                                  userRole === "Member" &&
                                  loggedInMemberFlat &&
                                  v.FlatNo === loggedInMemberFlat,
                              );

                              const isClosed =
                                poll.Status === "Closed" ||
                                new Date(poll.EndDate) < new Date();

                              return (
                                <div
                                  key={poll.id}
                                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <span className="text-[8px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                                        {poll.Category}
                                      </span>
                                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1.5 leading-snug">
                                        {poll.Title}
                                      </h4>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 border ${
                                        !isClosed
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                      }`}
                                    >
                                      {!isClosed ? "● Voting Active" : "Closed"}
                                    </span>
                                  </div>

                                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800">
                                    {poll.Description}
                                  </p>

                                  <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-semibold px-0.5">
                                    <span>
                                      Voting Window: {poll.StartDate} to{" "}
                                      {poll.EndDate}
                                    </span>
                                    <span>
                                      Quorum: {totalVotes} / {rawMembers.length}{" "}
                                      Flats Voted
                                    </span>
                                  </div>

                                  {/* Interactive Voting Controls */}
                                  {!userVote && !isClosed ? (
                                    <div className="space-y-1.5 pt-1 border-t border-slate-150 dark:border-slate-800">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Cast Your E-Vote:
                                      </span>
                                      <div className="grid grid-cols-3 gap-2">
                                        <button
                                          onClick={() => {
                                            if (onCastVote) {
                                              onCastVote({
                                                SocietyId: activeSocietyId,
                                                PollId: poll.id,
                                                FlatNo:
                                                  loggedInMemberFlat || "101",
                                                MemberName:
                                                  loggedInUserEmail ||
                                                  "Resident",
                                                SelectedOption: "Yes",
                                                VotedAt:
                                                  new Date().toISOString(),
                                              });
                                              triggerToast(
                                                'e-Vote "YES" recorded successfully!',
                                              );
                                            }
                                          }}
                                          className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <span>👍 Yes</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            if (onCastVote) {
                                              onCastVote({
                                                SocietyId: activeSocietyId,
                                                PollId: poll.id,
                                                FlatNo:
                                                  loggedInMemberFlat || "101",
                                                MemberName:
                                                  loggedInUserEmail ||
                                                  "Resident",
                                                SelectedOption: "No",
                                                VotedAt:
                                                  new Date().toISOString(),
                                              });
                                              triggerToast(
                                                'e-Vote "NO" recorded successfully!',
                                              );
                                            }
                                          }}
                                          className="py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <span>👎 No</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            if (onCastVote) {
                                              onCastVote({
                                                SocietyId: activeSocietyId,
                                                PollId: poll.id,
                                                FlatNo:
                                                  loggedInMemberFlat || "101",
                                                MemberName:
                                                  loggedInUserEmail ||
                                                  "Resident",
                                                SelectedOption: "Abstain",
                                                VotedAt:
                                                  new Date().toISOString(),
                                              });
                                              triggerToast(
                                                'e-Vote "ABSTAIN" recorded successfully!',
                                              );
                                            }
                                          }}
                                          className="py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-black text-[10px] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <span>😶 Abstain</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    userVote && (
                                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[9px]">
                                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                                          Your Vote Choice:{" "}
                                          <strong className="uppercase">
                                            {userVote.SelectedOption}
                                          </strong>
                                        </span>
                                        <span className="text-[8px] text-emerald-600 font-mono">
                                          Verified Ballot
                                        </span>
                                      </div>
                                    )
                                  )}

                                  {/* Live Results Percentage Meter */}
                                  <div className="space-y-1.5 pt-2 border-t border-slate-150 dark:border-slate-800">
                                    <span className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider block">
                                      Live Election Results ({totalVotes} Votes
                                      Cast)
                                    </span>

                                    {/* Yes Bar */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[8.5px] font-bold text-slate-700 dark:text-slate-300">
                                        <span>Yes ({yesVotes})</span>
                                        <span>{yesPct}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-emerald-500 h-full transition-all duration-500"
                                          style={{ width: `${yesPct}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* No Bar */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[8.5px] font-bold text-slate-700 dark:text-slate-300">
                                        <span>No ({noVotes})</span>
                                        <span>{noPct}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-rose-500 h-full transition-all duration-500"
                                          style={{ width: `${noPct}%` }}
                                        ></div>
                                      </div>
                                    </div>

                                    {/* Abstain Bar */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[8.5px] font-bold text-slate-700 dark:text-slate-300">
                                        <span>Abstain ({abstainVotes})</span>
                                        <span>{abstainPct}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-slate-400 h-full transition-all duration-500"
                                          style={{ width: `${abstainPct}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* ----------------- TAB: DOMESTIC STAFF & GATEKEEPER CONSOLE ----------------- */}
                    {currentTab === "staff" && (
                      <div className="space-y-3 animate-fade-in">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-3.5 rounded-2xl text-white shadow-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-200">
                                GATE SECURITY & RESIDENT ALERT SYSTEM
                              </span>
                              <h3 className="text-sm font-black mt-0.5">
                                Staff & Domestic Help Directory
                              </h3>
                            </div>
                            <button
                              onClick={() => {
                                setStaffNameInput("");
                                setStaffPhoneInput("");
                                setStaffServiceTypeInput("Maid");
                                setStaffPhotoUrlInput("");
                                setStaffPasscodeInput(
                                  Math.floor(
                                    1000 + Math.random() * 9000,
                                  ).toString(),
                                );
                                setStaffAssignedFlatsInput(
                                  userRole === "Member"
                                    ? loggedInMemberFlat
                                    : "101, 102",
                                );
                                setStaffIdStatusInput("Verified");
                                setShowAddStaffModal(true);
                              }}
                              className="px-2.5 py-1 bg-white text-emerald-800 hover:bg-emerald-50 text-[9px] font-black rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 text-emerald-700" />
                              <span>+ Register Staff</span>
                            </button>
                          </div>
                          <p className="text-[9.5px] text-emerald-100 leading-relaxed">
                            Track maids, cooks, drivers, cleaners & security.
                            Gatekeepers enter 4-digit passcodes to trigger
                            instant resident entry alerts.
                          </p>

                          {/* Sub-tab Switcher */}
                          <div className="flex bg-black/20 p-1 rounded-xl border border-white/15">
                            <button
                              onClick={() => setStaffSubTab("directory")}
                              className={`flex-1 py-1 text-[9.5px] font-extrabold rounded-lg transition-all text-center ${
                                staffSubTab === "directory"
                                  ? "bg-white text-emerald-900 shadow-2xs"
                                  : "text-emerald-100 hover:text-white"
                              }`}
                            >
                              👥 Staff Directory (
                              {
                                staffList.filter(
                                  (s) =>
                                    !s.SocietyId ||
                                    s.SocietyId === activeSocietyId,
                                ).length
                              }
                              )
                            </button>
                            <button
                              onClick={() => setStaffSubTab("gatekeeper")}
                              className={`flex-1 py-1 text-[9.5px] font-extrabold rounded-lg transition-all text-center ${
                                staffSubTab === "gatekeeper"
                                  ? "bg-white text-emerald-900 shadow-2xs"
                                  : "text-emerald-100 hover:text-white"
                              }`}
                            >
                              🔑 Gatekeeper Console
                            </button>
                            <button
                              onClick={() => setStaffSubTab("attendance")}
                              className={`flex-1 py-1 text-[9.5px] font-extrabold rounded-lg transition-all text-center ${
                                staffSubTab === "attendance"
                                  ? "bg-white text-emerald-900 shadow-2xs"
                                  : "text-emerald-100 hover:text-white"
                              }`}
                            >
                              ⏱️ Today's Log (
                              {
                                staffAttendanceList.filter(
                                  (a) => a.CheckOutTime === null,
                                ).length
                              }{" "}
                              Inside)
                            </button>
                          </div>
                        </div>

                        {/* SUB-TAB 1: STAFF DIRECTORY */}
                        {staffSubTab === "directory" && (
                          <div className="space-y-3">
                            {/* Service Type Filter */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                              {[
                                "All",
                                "Maid",
                                "Cook",
                                "Driver",
                                "Cleaner",
                                "Security Guard",
                                "Gardener",
                              ].map((srv) => (
                                <button
                                  key={srv}
                                  onClick={() => setStaffServiceFilter(srv)}
                                  className={`px-2.5 py-1 text-[9.5px] font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                                    staffServiceFilter === srv
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {srv}
                                </button>
                              ))}
                            </div>

                            {/* Staff Cards List */}
                            <div className="space-y-2.5">
                              {(() => {
                                const filtered = staffList.filter((s) => {
                                  if (
                                    s.SocietyId &&
                                    s.SocietyId !== activeSocietyId
                                  )
                                    return false;
                                  if (
                                    staffServiceFilter !== "All" &&
                                    s.ServiceType !== staffServiceFilter
                                  )
                                    return false;
                                  if (searchQuery) {
                                    const q = searchQuery.toLowerCase();
                                    return (
                                      s.Name.toLowerCase().includes(q) ||
                                      s.Phone.toLowerCase().includes(q) ||
                                      s.AssignedFlats.some((f) =>
                                        f.toLowerCase().includes(q),
                                      )
                                    );
                                  }
                                  return true;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-semibold">
                                        No domestic staff registered
                                      </p>
                                      <p className="text-[9px] text-slate-400 mt-0.5">
                                        Click "+ Register Staff" above to add
                                        maids, drivers or cleaners
                                      </p>
                                    </div>
                                  );
                                }

                                return filtered.map((staff) => {
                                  const activeAttendance =
                                    staffAttendanceList.find(
                                      (a) =>
                                        a.StaffId === staff.id &&
                                        a.CheckOutTime === null,
                                    );
                                  const isCheckedIn = !!activeAttendance;

                                  return (
                                    <div
                                      key={staff.id}
                                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-emerald-300 transition-colors"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2.5">
                                          <div className="relative">
                                            {staff.PhotoUrl ? (
                                              <img
                                                src={staff.PhotoUrl}
                                                alt={staff.Name}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs"
                                              />
                                            ) : (
                                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
                                                {staff.Name.substring(
                                                  0,
                                                  2,
                                                ).toUpperCase()}
                                              </div>
                                            )}
                                            <span
                                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                                              title={
                                                isCheckedIn
                                                  ? "Currently Inside Society"
                                                  : "Not Checked In"
                                              }
                                            />
                                          </div>

                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <h4 className="text-xs font-black text-slate-900">
                                                {staff.Name}
                                              </h4>
                                              <span
                                                className={`px-1.5 py-0.2 text-[7.5px] font-mono font-bold rounded uppercase ${
                                                  staff.IdVerificationStatus ===
                                                  "Verified"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-amber-100 text-amber-800"
                                                }`}
                                              >
                                                KYC {staff.IdVerificationStatus}
                                              </span>
                                            </div>
                                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                              {staff.ServiceType} • Phone:{" "}
                                              {staff.Phone}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block">
                                            Passcode
                                          </span>
                                          <span className="font-mono font-black text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block mt-0.5">
                                            🔑 {staff.Passcode}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Assigned Flats & Gate Check-in Status */}
                                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 text-[9px]">
                                        <div>
                                          <span className="text-slate-400 font-bold uppercase text-[7.5px] block">
                                            Assigned Resident Flats
                                          </span>
                                          <div className="flex flex-wrap gap-1 mt-0.5">
                                            {staff.AssignedFlats.map((flat) => (
                                              <span
                                                key={flat}
                                                className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.2 rounded text-[8px]"
                                              >
                                                Flat {flat}
                                              </span>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                              isCheckedIn
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                            }`}
                                          >
                                            {isCheckedIn
                                              ? "🟢 Inside Society"
                                              : "⚪ Outside"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Direct Gate Check-In/Check-Out Action Button */}
                                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                        <span className="text-[8.5px] text-slate-400 font-medium">
                                          {isCheckedIn
                                            ? `Checked in at ${activeAttendance.CheckInTime}`
                                            : "Passcode available for Gatekeeper"}
                                        </span>

                                        {isCheckedIn ? (
                                          <button
                                            onClick={() => {
                                              if (onStaffCheckOut) {
                                                onStaffCheckOut(staff.id);
                                                triggerToast(
                                                  `Checked out ${staff.Name}`,
                                                );
                                              }
                                            }}
                                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[9px] font-bold border border-rose-200 cursor-pointer"
                                          >
                                            Check Out Staff
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              if (onStaffCheckIn) {
                                                onStaffCheckIn(
                                                  staff.Passcode,
                                                  "Main Gate 1",
                                                );
                                                triggerToast(
                                                  `Checked in ${staff.Name} & sent alert to Flat ${staff.AssignedFlats.join(", ")}`,
                                                );
                                              }
                                            }}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black shadow-3xs cursor-pointer"
                                          >
                                            Check In at Gate
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 2: GATEKEEPER CONSOLE */}
                        {staffSubTab === "gatekeeper" && (
                          <div className="space-y-3">
                            {/* Security Guard Gate Passcode Input Box */}
                            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 p-4 rounded-2xl text-white shadow-md border border-emerald-800/40 space-y-3">
                              <div className="flex justify-between items-center border-b border-emerald-800/40 pb-2">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                  <div>
                                    <h4 className="font-extrabold text-xs text-white">
                                      Main Gate Passcode Terminal
                                    </h4>
                                    <p className="text-[8.5px] text-emerald-300">
                                      {gatekeeperNameInput}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-extrabold">
                                  LIVE CONSOLE
                                </span>
                              </div>

                              {/* Keypad / Passcode Entry Form */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!gatePasscodeInput.trim()) {
                                    setGateCheckInAlert({
                                      type: "error",
                                      message:
                                        "Please enter 4-digit staff passcode!",
                                    });
                                    return;
                                  }

                                  const match = staffList.find(
                                    (s) =>
                                      s.Passcode === gatePasscodeInput.trim() &&
                                      (!s.SocietyId ||
                                        s.SocietyId === activeSocietyId),
                                  );
                                  if (!match) {
                                    setGateCheckInAlert({
                                      type: "error",
                                      message: `❌ Invalid Passcode (${gatePasscodeInput})! Staff not found in society database.`,
                                    });
                                    return;
                                  }

                                  const activeAttendance =
                                    staffAttendanceList.find(
                                      (a) =>
                                        a.StaffId === match.id &&
                                        a.CheckOutTime === null,
                                    );
                                  if (activeAttendance) {
                                    if (onStaffCheckOut)
                                      onStaffCheckOut(match.id);
                                    setGateCheckInAlert({
                                      type: "success",
                                      message: `🔴 CHECK-OUT: ${match.Name} (${match.ServiceType}) has exited the society.`,
                                    });
                                  } else {
                                    if (onStaffCheckIn)
                                      onStaffCheckIn(
                                        match.Passcode,
                                        gatekeeperNameInput,
                                      );
                                    setGateCheckInAlert({
                                      type: "success",
                                      message: `🟢 CHECK-IN SUCCESS: ${match.Name} (${match.ServiceType}) checked in! Alert broadcasted to Flat(s) ${match.AssignedFlats.join(", ")}.`,
                                    });
                                  }
                                  setGatePasscodeInput("");
                                }}
                                className="space-y-3"
                              >
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-emerald-200 uppercase tracking-wider block">
                                    Enter Staff 4-Digit Passcode
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      maxLength={6}
                                      placeholder="e.g. 1001 or 1002"
                                      value={gatePasscodeInput}
                                      onChange={(e) =>
                                        setGatePasscodeInput(e.target.value)
                                      }
                                      className="flex-1 bg-slate-800/80 border border-emerald-600/50 p-2.5 rounded-xl text-center font-mono text-lg font-black tracking-widest text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                                    >
                                      <span>Submit Passcode</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Alert Banner Result */}
                                {gateCheckInAlert && (
                                  <div
                                    className={`p-3 rounded-xl text-xs font-bold border ${
                                      gateCheckInAlert.type === "success"
                                        ? "bg-emerald-950/80 text-emerald-200 border-emerald-500"
                                        : "bg-rose-950/80 text-rose-200 border-rose-500"
                                    }`}
                                  >
                                    {gateCheckInAlert.message}
                                  </div>
                                )}

                                {/* Quick Passcode Quick-Buttons for Demo Testing */}
                                <div>
                                  <span className="text-[8px] font-extrabold uppercase text-slate-400 block mb-1">
                                    Quick Select Demo Staff Passcodes
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {staffList.slice(0, 4).map((s) => (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() =>
                                          setGatePasscodeInput(s.Passcode)
                                        }
                                        className="px-2 py-1 bg-slate-800 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-[9px] font-mono font-bold cursor-pointer"
                                      >
                                        {s.Name.split(" ")[0]} ({s.Passcode})
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </form>
                            </div>

                            {/* Recent Gatekeeper Events History */}
                            <div>
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                                Gatekeeper Terminal History
                              </h4>
                              <div className="space-y-1.5">
                                {staffAttendanceList.length === 0 ? (
                                  <p className="text-center py-6 text-[10px] text-slate-400 font-medium bg-white rounded-xl border border-dashed border-slate-200">
                                    No gatekeeper check-in activity recorded
                                    today.
                                  </p>
                                ) : (
                                  staffAttendanceList.slice(0, 5).map((att) => (
                                    <div
                                      key={att.id}
                                      className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs flex justify-between items-center text-[9.5px]"
                                    >
                                      <div>
                                        <span className="font-extrabold text-slate-900">
                                          {att.StaffName}
                                        </span>
                                        <span className="text-[8px] text-slate-400 block">
                                          Flat(s):{" "}
                                          {att.AssignedFlats.join(", ")} • Gate:{" "}
                                          {att.GateName}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${att.CheckOutTime ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-800 animate-pulse"}`}
                                        >
                                          {att.CheckOutTime
                                            ? `Out: ${att.CheckOutTime}`
                                            : `In: ${att.CheckInTime}`}
                                        </span>
                                        <span className="text-[7.5px] text-slate-400 block mt-0.5">
                                          {att.Date}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 3: ATTENDANCE LOGS */}
                        {staffSubTab === "attendance" && (
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Real-Time Daily Attendance Register
                            </h4>
                            <div className="space-y-2">
                              {staffAttendanceList.map((att) => (
                                <div
                                  key={att.id}
                                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center text-[10px]"
                                >
                                  <div>
                                    <h5 className="font-black text-slate-900">
                                      {att.StaffName}
                                    </h5>
                                    <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">
                                      Assigned: Flat{" "}
                                      {att.AssignedFlats.join(", ")} •{" "}
                                      {att.GateName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`font-mono font-extrabold px-2 py-0.5 rounded ${att.CheckOutTime ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-800"}`}
                                    >
                                      {att.CheckInTime} →{" "}
                                      {att.CheckOutTime || "Present"}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                                      {att.Date}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ----------------- TAB: VENDORS & DUAL-APPROVAL EXPENSE WORKFLOW ----------------- */}
                    {currentTab === "vendors" && (
                      <div className="space-y-3 animate-fade-in">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-3.5 rounded-2xl text-white shadow-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-purple-200">
                                FINANCIAL CONTROLS & GST REGISTER
                              </span>
                              <h3 className="text-sm font-black mt-0.5">
                                Vendors & Dual Approval
                              </h3>
                            </div>
                            {userRole === "Admin" && (
                              <button
                                onClick={() => {
                                  setVendorNameInput("");
                                  setVendorGstInput("");
                                  setVendorCategoryInput("Security Agency");
                                  setVendorContactPersonInput("");
                                  setVendorPhoneInput("");
                                  setVendorAccNoInput("");
                                  setVendorContractDocUrlInput("");
                                  setShowAddVendorModal(true);
                                }}
                                className="px-2.5 py-1 bg-white text-purple-900 hover:bg-purple-50 text-[9px] font-black rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3 text-purple-700" />
                                <span>+ Onboard Vendor</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[9.5px] text-purple-100 leading-relaxed">
                            Store vendor GST numbers, bank details & contract
                            PDFs. Expenses &gt; ₹5,000 strictly enforce Dual
                            Approval (Secretary &amp; Treasurer sign-off).
                          </p>

                          {/* Sub-tab Switcher */}
                          <div className="flex bg-black/20 p-1 rounded-xl border border-white/15">
                            <button
                              onClick={() => setVendorSubTab("vendors")}
                              className={`flex-1 py-1 text-[9.5px] font-extrabold rounded-lg transition-all text-center ${
                                vendorSubTab === "vendors"
                                  ? "bg-white text-purple-950 shadow-2xs"
                                  : "text-purple-100 hover:text-white"
                              }`}
                            >
                              🏛️ Vendors (
                              {
                                vendorList.filter(
                                  (v) =>
                                    !v.SocietyId ||
                                    v.SocietyId === activeSocietyId,
                                ).length
                              }
                              )
                            </button>
                            <button
                              onClick={() =>
                                setVendorSubTab("expenses_approval")
                              }
                              className={`flex-1 py-1 text-[9.5px] font-extrabold rounded-lg transition-all text-center ${
                                vendorSubTab === "expenses_approval"
                                  ? "bg-white text-purple-950 shadow-2xs"
                                  : "text-purple-100 hover:text-white"
                              }`}
                            >
                              ✍️ Dual Approval (
                              {
                                expenses.filter(
                                  (e) =>
                                    e.RequiresDualApproval &&
                                    e.Status === "Pending Approval",
                                ).length
                              }
                              )
                            </button>
                          </div>
                        </div>

                        {/* SUB-TAB 1: VENDOR DIRECTORY */}
                        {vendorSubTab === "vendors" && (
                          <div className="space-y-3">
                            {/* Category Filter Pills */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                              {[
                                "All",
                                "Security Agency",
                                "Housekeeping",
                                "Elevator AMC",
                                "Water Vendor",
                                "Electrician",
                                "Gardening",
                              ].map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setVendorCategoryFilter(cat)}
                                  className={`px-2.5 py-1 text-[9.5px] font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                                    vendorCategoryFilter === cat
                                      ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>

                            {/* Vendors List */}
                            <div className="space-y-2.5">
                              {(() => {
                                const filtered = vendorList.filter((v) => {
                                  if (
                                    v.SocietyId &&
                                    v.SocietyId !== activeSocietyId
                                  )
                                    return false;
                                  if (
                                    vendorCategoryFilter !== "All" &&
                                    v.ServiceCategory !== vendorCategoryFilter
                                  )
                                    return false;
                                  if (searchQuery) {
                                    const q = searchQuery.toLowerCase();
                                    return (
                                      v.VendorName.toLowerCase().includes(q) ||
                                      v.GstNumber.toLowerCase().includes(q) ||
                                      v.ContactPerson.toLowerCase().includes(q)
                                    );
                                  }
                                  return true;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                      <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-semibold">
                                        No vendor profiles found
                                      </p>
                                      <p className="text-[9px] text-slate-400 mt-0.5">
                                        Click "+ Onboard Vendor" above to
                                        register contractors & GST details
                                      </p>
                                    </div>
                                  );
                                }

                                return filtered.map((v) => (
                                  <div
                                    key={v.id}
                                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-purple-300 transition-colors"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <h4 className="text-xs font-black text-slate-900">
                                            {v.VendorName}
                                          </h4>
                                          <span className="text-[8px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                                            {v.ServiceCategory}
                                          </span>
                                        </div>
                                        <p className="text-[9px] font-mono text-slate-500 font-bold mt-0.5">
                                          GST:{" "}
                                          <span className="text-slate-800">
                                            {v.GstNumber || "URP / Exempt"}
                                          </span>
                                        </p>
                                      </div>

                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                          v.Status === "Active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                      >
                                        {v.Status}
                                      </span>
                                    </div>

                                    {/* Bank Account & Contact Person Details */}
                                    <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                      <div>
                                        <span className="text-slate-400 font-bold uppercase text-[7.5px] block">
                                          Contact Representative
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                          {v.ContactPerson} ({v.Phone})
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 font-bold uppercase text-[7.5px] block">
                                          Bank Account for NEFT/RTGS
                                        </span>
                                        <span className="font-mono font-semibold text-slate-800">
                                          {v.BankName} • {v.AccountNumber}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Contract Document Attachment & Actions */}
                                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                      <div className="flex items-center gap-1 text-[8.5px] text-slate-400">
                                        <Calendar className="w-3 h-3 text-purple-600" />
                                        <span>
                                          Contract valid until:{" "}
                                          <strong className="text-slate-700">
                                            {v.ContractEndDate || "Ongoing"}
                                          </strong>
                                        </span>
                                      </div>

                                      {v.ContractDocUrl && (
                                        <button
                                          onClick={async () => {
                                            const signedUrl =
                                              await getSignedFileUrl(
                                                "society-docs",
                                                v.ContractDocUrl!,
                                              );
                                            setViewingDocModal({
                                              title: `Vendor Contract (${v.VendorName})`,
                                              url: signedUrl,
                                              label: `GST: ${v.GstNumber}`,
                                            });
                                          }}
                                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[8.5px] rounded-lg border border-purple-200 cursor-pointer flex items-center gap-1"
                                        >
                                          <FileText className="w-3 h-3" />
                                          <span>View Agreement PDF</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 2: DUAL-APPROVAL EXPENSES WORKSPACE */}
                        {vendorSubTab === "expenses_approval" && (
                          <div className="space-y-3">
                            {/* Dual Approval Rule Banner */}
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[9.5px] leading-relaxed flex items-start gap-2 shadow-3xs">
                              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-extrabold block text-amber-950">
                                  Society Governance Rule (&gt; ₹5,000 Expense)
                                </strong>
                                Expenses over ₹5,000 require dual sign-off from
                                both Secretary AND Treasurer before payment
                                disbursal.
                              </div>
                            </div>

                            {/* Approval Status Filter */}
                            <div className="flex gap-1.5">
                              {[
                                "All",
                                "Pending Approval",
                                "Approved",
                                "Rejected",
                              ].map((st) => (
                                <button
                                  key={st}
                                  onClick={() =>
                                    setExpenseApprovalFilter(st as any)
                                  }
                                  className={`flex-1 py-1 text-[9px] font-extrabold rounded-xl border transition-colors cursor-pointer text-center ${
                                    expenseApprovalFilter === st
                                      ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>

                            {/* Dual Approval Expense Cards List */}
                            <div className="space-y-2.5">
                              {(() => {
                                const filtered = expenses.filter((e) => {
                                  if (
                                    e.SocietyId &&
                                    e.SocietyId !== activeSocietyId
                                  )
                                    return false;
                                  if (!e.RequiresDualApproval) return false;
                                  if (
                                    expenseApprovalFilter !== "All" &&
                                    e.Status !== expenseApprovalFilter
                                  )
                                    return false;
                                  return true;
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-250 text-slate-400">
                                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                      <p className="text-xs font-semibold">
                                        No high-value expenses pending dual
                                        sign-off
                                      </p>
                                    </div>
                                  );
                                }

                                return filtered.map((exp) => (
                                  <div
                                    key={exp.id}
                                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                                          {exp.Category} • GST Invoice
                                        </span>
                                        <h4 className="text-xs font-black text-slate-900 mt-1">
                                          {exp.Title || exp.Category}
                                        </h4>
                                        <p className="text-[8.5px] text-slate-400 font-medium">
                                          Vendor:{" "}
                                          {exp.VendorName ||
                                            exp.Vendor ||
                                            "Society Contractor"}{" "}
                                          • Date: {exp.Date}
                                        </p>
                                      </div>

                                      <div className="text-right">
                                        <span className="font-black text-sm text-slate-900 block">
                                          ₹{exp.Amount.toLocaleString()}
                                        </span>
                                        <span
                                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border inline-block mt-0.5 ${
                                            exp.Status === "Approved"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : exp.Status === "Rejected"
                                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                                : "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                                          }`}
                                        >
                                          {exp.Status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Secretary & Treasurer Dual Approval Status Grid */}
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[9px]">
                                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                                        <span className="text-[7.5px] font-bold uppercase text-slate-400 block">
                                          Secretary Sign-off
                                        </span>
                                        <span
                                          className={`font-black text-[9.5px] block mt-0.5 ${exp.SecretaryApproved || exp.ApprovedBySecretary ? "text-emerald-700" : "text-amber-600"}`}
                                        >
                                          {exp.SecretaryApproved ||
                                          exp.ApprovedBySecretary
                                            ? "✅ Approved"
                                            : "⏳ Pending"}
                                        </span>
                                      </div>

                                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                                        <span className="text-[7.5px] font-bold uppercase text-slate-400 block">
                                          Treasurer Sign-off
                                        </span>
                                        <span
                                          className={`font-black text-[9.5px] block mt-0.5 ${exp.TreasurerApproved || exp.ApprovedByTreasurer ? "text-emerald-700" : "text-amber-600"}`}
                                        >
                                          {exp.TreasurerApproved ||
                                          exp.ApprovedByTreasurer
                                            ? "✅ Approved"
                                            : "⏳ Pending"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Admin / Committee Sign-Off Controls */}
                                    {userRole === "Admin" &&
                                      exp.Status === "Pending Approval" && (
                                        <div className="flex gap-2 pt-1">
                                          {!(
                                            exp.SecretaryApproved ||
                                            exp.ApprovedBySecretary
                                          ) && (
                                            <button
                                              onClick={() => {
                                                if (
                                                  onApproveExpenseSecretary &&
                                                  exp.id
                                                )
                                                  onApproveExpenseSecretary(
                                                    exp.id,
                                                    "Secretary Admin",
                                                  );
                                                triggerToast(
                                                  "Approved as Society Secretary!",
                                                );
                                              }}
                                              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black cursor-pointer shadow-3xs"
                                            >
                                              Approve (Secretary)
                                            </button>
                                          )}

                                          {!(
                                            exp.TreasurerApproved ||
                                            exp.ApprovedByTreasurer
                                          ) && (
                                            <button
                                              onClick={() => {
                                                if (
                                                  onApproveExpenseTreasurer &&
                                                  exp.id
                                                )
                                                  onApproveExpenseTreasurer(
                                                    exp.id,
                                                    "Treasurer Admin",
                                                  );
                                                triggerToast(
                                                  "Approved as Society Treasurer!",
                                                );
                                              }}
                                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black cursor-pointer shadow-3xs"
                                            >
                                              Approve (Treasurer)
                                            </button>
                                          )}

                                          <button
                                            onClick={() => {
                                              setReviewingDualExpense(exp);
                                              setRejectionReasonInput("");
                                            }}
                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[9px] font-bold border border-rose-200 cursor-pointer"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ----------------- TAB: STAFF & MAID TRACKING ----------------- */}
                  {currentTab === "staff_tracking" && (
                    <div className="space-y-3 animate-fade-in">
                      <StaffTrackingModule
                        enabledModules={enabledModules}
                        staffList={staffList}
                        staffAttendanceList={staffAttendanceList}
                        onAddStaff={onAddStaff}
                        onCheckIn={onStaffCheckIn}
                        onCheckOut={onStaffCheckOut}
                        isDark={isDark}
                      />
                    </div>
                  )}

                  {/* ----------------- TAB: MOVE-IN / MOVE-OUT NOC WORKFLOW ----------------- */}
                  {currentTab === "noc" && (
                    <div className="space-y-3 animate-fade-in">
                      <NocWorkflowModule
                        activeSocietyId={activeSocietyId}
                        userRole={userRole}
                        userEmail={loggedInUserEmail}
                        loggedInMemberFlat={loggedInMemberFlat}
                        members={members}
                        enabledModules={enabledModules}
                        isDark={isDark}
                        societyName={activeSocietyObj?.Name || "Society"}
                      />
                    </div>
                  )}

                  {/* ----------------- TAB: ASSET & INVENTORY REGISTER ----------------- */}
                  {currentTab === "assets" && (
                    <div className="space-y-3 animate-fade-in">
                      <AssetInventoryModule
                        activeSocietyId={activeSocietyId}
                        userRole={userRole}
                        enabledModules={enabledModules}
                        isDark={isDark}
                        societyName={activeSocietyObj?.Name || "Society"}
                      />
                    </div>
                  )}

                  {/* Bottom Navigation Tabs */}
                  <div
                    className={`h-[56px] border-t flex items-center gap-1 overflow-x-auto px-1 py-1 z-30 scrollbar-none transition-colors ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    <button
                      onClick={() => setCurrentTab("dashboard")}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "dashboard"
                          ? isDark
                            ? "text-purple-400 font-extrabold"
                            : "text-purple-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">Home</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab("emergency")}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "emergency"
                          ? isDark
                            ? "text-rose-400 font-extrabold"
                            : "text-rose-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">
                        SOS / Help
                      </span>
                    </button>

                    {activeFeatures.tenantRegister !== false && (
                      <button
                        onClick={() => setCurrentTab("tenants")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "tenants"
                            ? isDark
                              ? "text-amber-400 font-extrabold"
                              : "text-amber-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          Tenants
                        </span>
                      </button>
                    )}

                    {activeFeatures.parkingRegister !== false && (
                      <button
                        onClick={() => setCurrentTab("parking")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "parking"
                            ? isDark
                              ? "text-indigo-400 font-extrabold"
                              : "text-indigo-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Car className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          Parking
                        </span>
                      </button>
                    )}

                    {activeFeatures.documentVault !== false && (
                      <button
                        onClick={() => setCurrentTab("documents")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "documents"
                            ? isDark
                              ? "text-blue-400 font-extrabold"
                              : "text-blue-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          Docs
                        </span>
                      </button>
                    )}

                    {activeFeatures.assetAMC !== false && (
                      <button
                        onClick={() => setCurrentTab("amc")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "amc"
                            ? isDark
                              ? "text-teal-400 font-extrabold"
                              : "text-teal-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          AMC
                        </span>
                      </button>
                    )}

                    {activeFeatures.waterMeters !== false && (
                      <button
                        onClick={() => setCurrentTab("watermeters")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "watermeters"
                            ? isDark
                              ? "text-cyan-400 font-extrabold"
                              : "text-cyan-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Droplets className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          Water
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentTab("staff")}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "staff"
                          ? isDark
                            ? "text-emerald-400 font-extrabold"
                            : "text-emerald-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">
                        Staff
                      </span>
                    </button>

                    <button
                      onClick={() => setCurrentTab("vendors")}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "vendors"
                          ? isDark
                            ? "text-purple-400 font-extrabold"
                            : "text-purple-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">
                        Vendors
                      </span>
                    </button>

                    {enabledModules.noc_workflow !== false && (
                      <button
                        onClick={() => setCurrentTab("noc")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "noc"
                            ? isDark
                              ? "text-blue-400 font-extrabold"
                              : "text-blue-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <FileCheck className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          NOC
                        </span>
                      </button>
                    )}

                    {enabledModules.asset_inventory !== false && (
                      <button
                        onClick={() => setCurrentTab("assets")}
                        className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                          currentTab === "assets"
                            ? isDark
                              ? "text-amber-400 font-extrabold"
                              : "text-amber-600 font-extrabold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span className="text-[8px] whitespace-nowrap">
                          Assets
                        </span>
                      </button>
                    )}

                    {userRole === "Admin" ? (
                      <>
                        <button
                          onClick={() => {
                            setCurrentTab("members");
                            setSearchQuery("");
                          }}
                          className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                            currentTab === "members"
                              ? isDark
                                ? "text-purple-400 font-extrabold"
                                : "text-purple-600 font-extrabold"
                              : isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-[8px] whitespace-nowrap">
                            Members
                          </span>
                        </button>

                        <button
                          onClick={() => setCurrentTab("payments")}
                          className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                            currentTab === "payments"
                              ? isDark
                                ? "text-purple-400 font-extrabold"
                                : "text-purple-600 font-extrabold"
                              : isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-[8px] whitespace-nowrap">
                            Payments
                          </span>
                        </button>

                        <button
                          onClick={() => setCurrentTab("expenses")}
                          className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                            currentTab === "expenses"
                              ? isDark
                                ? "text-purple-400 font-extrabold"
                                : "text-purple-600 font-extrabold"
                              : isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-[8px] whitespace-nowrap">
                            Expenses
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setCurrentTab("payments")}
                          className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                            currentTab === "payments"
                              ? isDark
                                ? "text-purple-400 font-extrabold"
                                : "text-purple-600 font-extrabold"
                              : isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-[8px] whitespace-nowrap">
                            My Ledger
                          </span>
                        </button>

                        <button
                          onClick={() => setCurrentTab("amenities")}
                          className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                            currentTab === "amenities"
                              ? isDark
                                ? "text-purple-400 font-extrabold"
                                : "text-purple-600 font-extrabold"
                              : isDark
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span className="text-[8px] whitespace-nowrap">
                            Amenities
                          </span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setCurrentTab("complaints");
                        setComplaintFilter("All");
                      }}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "complaints"
                          ? isDark
                            ? "text-purple-400 font-extrabold"
                            : "text-purple-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">
                        Alerts
                      </span>
                    </button>

                    <button
                      onClick={() => setCurrentTab("notices")}
                      className={`flex flex-col items-center gap-0.5 min-w-[52px] py-1 cursor-pointer transition-colors ${
                        currentTab === "notices"
                          ? isDark
                            ? "text-purple-400 font-extrabold"
                            : "text-purple-600 font-extrabold"
                          : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span className="text-[8px] whitespace-nowrap">
                        Notices
                      </span>
                    </button>
                  </div>

                  {/* Home Indicator Gesture Bar */}
                  <div
                    className={`h-4 flex justify-center items-center ${isDark ? "bg-slate-900" : "bg-white"}`}
                  >
                    <div
                      className={`w-28 h-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
                    ></div>
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
                          {hasWings && activeMemberDetail.Wing
                            ? `Wing ${activeMemberDetail.Wing} • Flat ${activeMemberDetail.FlatNo}`
                            : `Flat ${activeMemberDetail.FlatNo}`}
                        </span>
                        <h2 className="text-base font-bold text-slate-800 mt-2">
                          {activeMemberDetail.OwnerName}
                        </h2>
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
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Society Wing Block
                            </p>
                            <p className="text-slate-700 font-semibold">
                              Wing {activeMemberDetail.Wing}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            Phone Contact
                          </p>
                          <p className="text-slate-700 font-medium">
                            {activeMemberDetail.ContactNo}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            Email Address
                          </p>
                          <p className="text-slate-700 font-medium break-all">
                            {activeMemberDetail.Email}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Maintenance Dues Balance
                            </p>
                            <p
                              className={`font-bold ${activeMemberDetail.Balance > 0 ? "text-rose-600" : "text-emerald-600"}`}
                            >
                              {activeMemberDetail.Balance > 0
                                ? `₹${activeMemberDetail.Balance} Pending`
                                : `₹${Math.abs(activeMemberDetail.Balance)} Prepaid / Clear`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {activeMemberDetail.CoOwners && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Co-Owners / Family
                            </p>
                            <p className="text-slate-700 font-medium">
                              {activeMemberDetail.CoOwners}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeMemberDetail.VehicleNo && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-3">
                          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              Registered Vehicle No
                            </p>
                            <p className="text-slate-700 font-medium font-mono">
                              {activeMemberDetail.VehicleNo}
                            </p>
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
                        <h2 className="text-sm font-bold text-slate-800 mt-2">
                          {activeComplaintDetail.Title}
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Ticket: {activeComplaintDetail.id} • Date:{" "}
                          {activeComplaintDetail.Date}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveComplaintDetail(null)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">
                        Description
                      </p>
                      <p className="text-slate-700 leading-relaxed mt-1">
                        {activeComplaintDetail.Description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                          Reporter Unit
                        </span>
                        <span className="font-bold text-slate-700">
                          Flat {activeComplaintDetail.FlatNo}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                          Priority
                        </span>
                        <span
                          className={`font-bold ${activeComplaintDetail.Urgency === "High" ? "text-rose-600" : "text-amber-600"}`}
                        >
                          {activeComplaintDetail.Urgency}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Update Status
                      </span>
                      <div className="flex gap-1.5">
                        {(["Open", "In Progress"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              onUpdateComplaint(
                                activeComplaintDetail.id,
                                status,
                              );
                              setActiveComplaintDetail({
                                ...activeComplaintDetail,
                                Status: status,
                              });
                              setAutoNoticeEnabled(false);
                              triggerToast(`Status updated to ${status}`);
                            }}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                              activeComplaintDetail.Status === status
                                ? status === "In Progress"
                                  ? "bg-amber-100 border-amber-300 text-amber-800"
                                  : "bg-rose-100 border-rose-300 text-rose-800"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {status}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            if (activeComplaintDetail.Status !== "Resolved") {
                              setAutoNoticeEnabled(true);
                              setAutoNoticeTitle(
                                `Resolved: ${activeComplaintDetail.Title}`,
                              );
                              setAutoNoticeContent(
                                `The complaint #${activeComplaintDetail.id} regarding ${activeComplaintDetail.Category} ("${activeComplaintDetail.Title}") reported by Flat ${activeComplaintDetail.FlatNo} has been successfully resolved.\n\nResolution Details: Resolved by Committee Admin successfully.`,
                              );
                            }
                            setActiveComplaintDetail({
                              ...activeComplaintDetail,
                              Status: "Resolved",
                            });
                          }}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                            activeComplaintDetail.Status === "Resolved"
                              ? "bg-green-100 border-green-300 text-green-800 font-black"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Resolved
                        </button>
                      </div>

                      {activeComplaintDetail.Status === "Resolved" && (
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
                                    setAutoNoticeTitle(
                                      `Resolved: ${activeComplaintDetail.Title}`,
                                    );
                                    setAutoNoticeContent(
                                      `The complaint #${activeComplaintDetail.id} regarding ${activeComplaintDetail.Category} ("${activeComplaintDetail.Title}") reported by Flat ${activeComplaintDetail.FlatNo} has been successfully resolved.\n\nResolution Details: Resolved by Committee Admin successfully.`,
                                    );
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
                                <label className="font-bold text-slate-600">
                                  Notice Scope / Audience
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setAutoNoticeType("society")}
                                    className={`flex-1 py-1 rounded border text-center font-bold text-[9px] ${
                                      autoNoticeType === "society"
                                        ? "bg-purple-100 border-purple-400 text-purple-700"
                                        : "bg-white border-slate-200 text-slate-500"
                                    }`}
                                  >
                                    Whole Society
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAutoNoticeType("member")}
                                    className={`flex-1 py-1 rounded border text-center font-bold text-[9px] ${
                                      autoNoticeType === "member"
                                        ? "bg-purple-100 border-purple-400 text-purple-700"
                                        : "bg-white border-slate-200 text-slate-500"
                                    }`}
                                  >
                                    Resident Member Only
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-600 block">
                                  Notice Title
                                </label>
                                <input
                                  type="text"
                                  value={autoNoticeTitle}
                                  onChange={(e) =>
                                    setAutoNoticeTitle(e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-bold text-slate-600 block">
                                  Notice Content Bulletin
                                </label>
                                <textarea
                                  value={autoNoticeContent}
                                  onChange={(e) =>
                                    setAutoNoticeContent(e.target.value)
                                  }
                                  rows={3}
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-none font-sans leading-relaxed"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateComplaint(
                                    activeComplaintDetail.id,
                                    "Resolved",
                                    {
                                      title: autoNoticeTitle,
                                      category: activeComplaintDetail.Category,
                                      content:
                                        autoNoticeContent +
                                        `\n\nScope: ${autoNoticeType === "society" ? "All Society Members" : `Confidential for Unit ${activeComplaintDetail.FlatNo}`}`,
                                    },
                                  );
                                  triggerToast(
                                    "Notice published successfully!",
                                  );
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
                                onUpdateComplaint(
                                  activeComplaintDetail.id,
                                  "Resolved",
                                );
                                triggerToast(
                                  "Resolved without bulletin notice",
                                );
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
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            Interactive Discussion
                          </h3>
                          <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                            {
                              complaintReplies.filter(
                                (r) =>
                                  r.ComplaintId === activeComplaintDetail.id,
                              ).length
                            }{" "}
                            Replies
                          </span>
                        </div>

                        {/* Messages Bubble Stack */}
                        <div className="space-y-2 max-h-[160px] overflow-y-auto mb-3 pr-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {(() => {
                            const replies = complaintReplies.filter(
                              (r) => r.ComplaintId === activeComplaintDetail.id,
                            );
                            if (replies.length === 0) {
                              return (
                                <div className="text-center py-4 text-slate-400">
                                  <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-20 text-slate-400" />
                                  <p className="text-[9px]">
                                    No official comments or discussion on this
                                    alert yet. Use the input below to start the
                                    conversation.
                                  </p>
                                </div>
                              );
                            }
                            return replies.map((r) => {
                              const isAdmin = r.SenderRole === "Admin";
                              return (
                                <div
                                  key={r.id}
                                  className={`flex flex-col max-w-[90%] rounded-xl p-2 text-[10px] leading-relaxed shadow-2xs transition-all ${
                                    isAdmin
                                      ? "bg-purple-50 border border-purple-100/55 ml-auto text-purple-950"
                                      : "bg-white border border-slate-200 mr-auto text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1 justify-between">
                                    <span className="font-extrabold text-slate-700 truncate">
                                      {r.SenderName}
                                    </span>
                                    <span
                                      className={`text-[7px] px-1 rounded-full uppercase font-black ${
                                        isAdmin
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {r.SenderRole}
                                    </span>
                                  </div>
                                  <p className="whitespace-pre-wrap">
                                    {r.Message}
                                  </p>
                                  <span className="text-[6.5px] text-slate-400 mt-1 self-end">
                                    {new Date(r.Timestamp).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
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
                              if (e.key === "Enter") {
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
                        <h2 className="text-sm font-bold text-slate-800 mt-2">
                          {activeNoticeDetail.Title}
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Posted on {activeNoticeDetail.Date} by{" "}
                          {activeNoticeDetail.PostedBy}
                        </p>
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
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">
                          Attached Memo Circular
                        </span>
                        <div className="p-3 bg-purple-50/50 border border-purple-100/70 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex flex-col items-center justify-center font-bold relative overflow-hidden shrink-0">
                              <span className="text-[7px] opacity-75 uppercase">
                                FILE
                              </span>
                              <span className="text-[10px] font-black -mt-0.5">
                                {activeNoticeDetail.AttachmentName
                                  ? activeNoticeDetail.AttachmentName.split(".")
                                      .pop()
                                      ?.toUpperCase()
                                  : "PDF"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-800 text-[10px] truncate">
                                {activeNoticeDetail.AttachmentName ||
                                  "Official_Circular_Notice.pdf"}
                              </p>
                              <p className="text-[8.5px] text-slate-400 font-bold">
                                {activeNoticeDetail.AttachmentSize || "1.2 MB"}{" "}
                                • Verified Document
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
                          {previewingNotice.AttachmentName ||
                            "Official_Circular.pdf"}
                        </h3>
                        <p className="text-[8px] text-slate-400 font-medium">
                          Digital Verification Seal Active
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded-md">
                        <button
                          onClick={() =>
                            setViewerZoom(Math.max(50, viewerZoom - 25))
                          }
                          className="text-white hover:text-purple-300 font-black text-[11px] cursor-pointer px-1 active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-[9px] font-bold font-mono text-purple-200">
                          {viewerZoom}%
                        </span>
                        <button
                          onClick={() =>
                            setViewerZoom(Math.min(200, viewerZoom + 25))
                          }
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
                      style={{
                        transform: `scale(${viewerZoom / 100})`,
                        transformOrigin: "top center",
                      }}
                      className="w-full max-w-[340px] bg-white text-slate-800 p-6 rounded-lg shadow-2xl space-y-4 relative border border-slate-200 transition-all shrink-0 my-2"
                    >
                      {/* Letterhead */}
                      <div className="border-b-2 border-double border-slate-400 pb-3 text-center space-y-1 relative">
                        <div className="absolute right-0 top-0 w-8 h-8 rounded-full border border-slate-350 flex items-center justify-center text-[6px] text-slate-400 font-bold border-dashed uppercase rotate-12">
                          Official
                        </div>
                        <span className="text-[8px] uppercase tracking-widest font-black text-purple-600 block">
                          Co-operative Housing Society
                        </span>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-tight">
                          {societyName || "Greenwood Residency"}
                        </h1>
                        <p className="text-[7.5px] text-slate-500 font-semibold leading-normal">
                          {postalAddress || "12-A, Link Road, Mumbai"}
                        </p>
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
                        <p className="whitespace-pre-wrap">
                          {previewingNotice.Content}
                        </p>
                        <p className="pt-2 leading-relaxed">
                          We solicit the active co-operation and compliance of
                          all residents to ensure the smooth administration and
                          maintenance of our society property.
                        </p>
                      </div>

                      {/* Tables / Rules mock detail block if Category is Maintenance or Meeting */}
                      {(previewingNotice.Category === "Maintenance" ||
                        previewingNotice.Category === "Meeting") && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 pt-1 text-[8px] space-y-1 text-left">
                          <span className="font-extrabold text-slate-500 uppercase tracking-wider block">
                            Reference Schedule / Agenda
                          </span>
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
                          <div className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                            Verified digital signature
                          </div>
                          <div className="font-mono italic text-[11px] font-bold text-slate-500 select-none tracking-widest leading-none mt-1 select-none">
                            S. K. Mehta
                          </div>
                          <p className="text-[8px] font-black text-slate-800 leading-normal">
                            Shreejit K. Mehta
                          </p>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase leading-none">
                            Honorary Secretary
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                            Authorized Sign-off
                          </div>
                          <div className="font-mono italic text-[11px] font-bold text-indigo-500 select-none tracking-widest leading-none mt-1 select-none">
                            A. Sharma
                          </div>
                          <p className="text-[8px] font-black text-slate-800 leading-normal">
                            Amit Sharma
                          </p>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase leading-none">
                            Managing Committee Chair
                          </p>
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
                    <h3 className="font-bold text-slate-700">
                      Log Member Payment
                    </h3>
                    <button
                      onClick={() => setShowPaymentForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={submitPayment}
                    className="flex-1 p-4 space-y-3 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Flat Number
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Amount Paid (₹)
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Mode of Transfer
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          ["UPI", "Bank Transfer", "Cash", "Cheque"] as const
                        ).map((mode) => (
                          <button
                            type="button"
                            key={mode}
                            onClick={() => setPayMode(mode)}
                            className={`py-1.5 rounded-lg border text-center transition-all ${
                              payMode === mode
                                ? "bg-purple-100 border-purple-400 text-purple-700 font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Reference / Transaction ID
                      </label>
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
                    <h3 className="font-bold text-slate-700">
                      Add Society Expense
                    </h3>
                    <button
                      onClick={() => setShowExpenseForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={submitExpense}
                    className="flex-1 p-4 space-y-3 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Category
                      </label>
                      <select
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {[
                          "Maintenance",
                          "Security",
                          "Water",
                          "Electricity",
                          "Repairs",
                          "Gardening",
                          "Salary",
                          "Others",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Amount Outflow (₹)
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Vendor / Payee
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Invoice / Receipt Number
                      </label>
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
                    <h3 className="font-bold text-slate-700">
                      File Helpdesk Complaint
                    </h3>
                    <button
                      onClick={() => setShowComplaintForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={submitComplaint}
                    className="flex-1 p-4 space-y-3 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Reporter Flat
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Category
                      </label>
                      <select
                        value={compCategory}
                        onChange={(e) => setCompCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {[
                          "Plumbing",
                          "Electrical",
                          "Security",
                          "Cleanliness",
                          "Parking",
                          "Noisy Neighbor",
                          "Others",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Subject / Issue Title
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Detailed Description
                      </label>
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
                      <label className="font-semibold text-slate-600 block">
                        Priority Urgency
                      </label>
                      <div className="flex gap-2">
                        {(["Low", "Medium", "High"] as const).map((urg) => (
                          <button
                            type="button"
                            key={urg}
                            onClick={() => setCompUrgency(urg)}
                            className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${
                              compUrgency === urg
                                ? "bg-purple-100 border-purple-400 text-purple-700 font-bold"
                                : "bg-white border-slate-200 text-slate-500"
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
                    <h3 className="font-bold text-slate-700">
                      Pre-Approve Incoming Guest
                    </h3>
                    <button
                      onClick={() => setShowAddVisitorModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newVisName.trim()) {
                        triggerToast("Guest Name is required!");
                        return;
                      }

                      if (onAddVisitor) {
                        const token = generateVisitorAccessToken();
                        const expiresAt = new Date(
                          Date.now() + 24 * 60 * 60 * 1000,
                        ).toISOString();

                        onAddVisitor({
                          VisitorName: newVisName.trim(),
                          Purpose: newVisPurpose,
                          ContactNo: newVisContact.trim() || "Pre-Approved",
                          FlatNo: loggedInMemberFlat,
                          VehicleNo: newVisVehicle.trim() || undefined,
                          Status: "Pre-Approved",
                          CheckInTime: new Date().toISOString(),
                          SocietyId: activeSocietyId,
                          AccessToken: token,
                          TokenExpiresAt: expiresAt,
                        });

                        notifyVisitorCheckIn(
                          pushTokens,
                          activeSocietyId,
                          loggedInMemberFlat,
                          newVisName.trim(),
                          newVisPurpose,
                        );

                        triggerToast(
                          `Pre-approved guest ${newVisName.trim()} (📲 Push alert sent to device)!`,
                        );
                        setShowAddVisitorModal(false);
                        setNewVisName("");
                        setNewVisContact("");
                        setNewVisVehicle("");
                      } else {
                        triggerToast("Visitor service unavailable");
                      }
                    }}
                    className="flex-1 p-4 space-y-4 overflow-y-auto"
                  >
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-950 font-medium">
                      🏠 Pre-authorizing entry for{" "}
                      <strong>Unit {loggedInMemberFlat}</strong>. The security
                      gatekeeper will see this pre-approval instantly!
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Guest / Visitor Name *
                      </label>
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
                      <label className="font-bold text-slate-600 block">
                        Purpose of Entry
                      </label>
                      <select
                        value={newVisPurpose}
                        onChange={(e) => setNewVisPurpose(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Guest">Guest / Relative</option>
                        <option value="Delivery">Delivery Executive</option>
                        <option value="Services">Home Maid / Services</option>
                        <option value="Maintenance">
                          Maintenance Contractor
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Contact Phone No (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={newVisContact}
                        onChange={(e) => setNewVisContact(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Expected Vehicle No (Optional)
                      </label>
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
                      <h3 className="font-bold text-slate-700">
                        Broadcast Committee Notice
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsBroadcastModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
                        triggerToast("Title and content are required!");
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
                          uploadedBy:
                            userRole === "Admin"
                              ? "Admin Secretary"
                              : "Committee Member",
                        });

                        notifyNoticePublished(
                          pushTokens,
                          activeSocietyId,
                          newNoticeTitle,
                          newNoticeCategory,
                        );

                        triggerToast(
                          "Notice broadcasted & Expo push notifications sent!",
                        );
                        setIsBroadcastModalOpen(false);
                        setNewNoticeTitle("");
                        setNewNoticeContent("");
                        setNewNoticeCategory("General");
                        setNewNoticeFileName("");
                        setNewNoticeFileUrl("");
                        setNewNoticeFileSize("");
                      } else {
                        triggerToast("Notice service unavailable");
                      }
                    }}
                    className="flex-1 p-4 space-y-4 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Notice Category
                      </label>
                      <select
                        value={newNoticeCategory}
                        onChange={(e) =>
                          setNewNoticeCategory(e.target.value as any)
                        }
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                      >
                        {[
                          "General",
                          "Maintenance",
                          "Meeting",
                          "Event",
                          "Security",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat} Notice
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Notice Title / Subject
                      </label>
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
                      <label className="font-bold text-slate-600 block">
                        Announcement Content
                      </label>
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
                          <span className="text-[9px] text-green-600 font-extrabold uppercase">
                            ✔ File Attached
                          </span>
                        )}
                      </label>

                      {newNoticeFileName ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                              {newNoticeFileName
                                .split(".")
                                .pop()
                                ?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-800 text-[10px] truncate">
                                {newNoticeFileName}
                              </p>
                              <p className="text-[9px] text-slate-400 font-semibold">
                                {newNoticeFileSize}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewNoticeFileName("");
                              setNewNoticeFileUrl("");
                              setNewNoticeFileSize("");
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileUpload
                            label="Attach Notice Circular / PDF Document"
                            bucket="notice-attachments"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            currentUrl={newNoticeFileUrl}
                            currentFileName={newNoticeFileName}
                            onUploadSuccess={(res) => {
                              setNewNoticeFileUrl(res.url);
                              setNewNoticeFileName(res.fileName);
                              setNewNoticeFileSize(res.fileSize);
                              triggerToast(
                                `Circular PDF "${res.fileName}" uploaded to 'notice-attachments' bucket!`,
                              );
                            }}
                            onClear={() => {
                              setNewNoticeFileUrl("");
                              setNewNoticeFileName("");
                              setNewNoticeFileSize("");
                            }}
                            isDark={isDark}
                          />

                          {/* Standard Template Quick Select */}
                          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                              Or attach official templates:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                {
                                  name: "Water_Billing_Revision.pdf",
                                  size: "1.4 MB",
                                },
                                {
                                  name: "AGM_Notice_Agenda.pdf",
                                  size: "920 KB",
                                },
                                {
                                  name: "Monsoon_Safety_Circular.pdf",
                                  size: "1.1 MB",
                                },
                                {
                                  name: "Rules_and_Regulations.docx",
                                  size: "680 KB",
                                },
                              ].map((tmpl, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setNewNoticeFileName(tmpl.name);
                                    setNewNoticeFileSize(tmpl.size);
                                    setNewNoticeFileUrl(
                                      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                                    );
                                    triggerToast(
                                      `Attached "${tmpl.name}" template!`,
                                    );
                                  }}
                                  className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg p-1.5 text-left text-[9px] font-bold text-slate-700 truncate cursor-pointer transition-all flex items-center gap-1.5 shadow-3xs"
                                >
                                  <div className="w-4 h-4 rounded bg-slate-150 text-slate-500 flex items-center justify-center font-black text-[7px] shrink-0">
                                    {tmpl.name.split(".").pop()?.toUpperCase()}
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
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Admin Society Settings
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Configure society rules, active modules & financials
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowSettingsModal(false);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Settings Modal Tab Bar */}
                  <div className="flex border-b border-slate-200 bg-slate-100/80 p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("general")}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        settingsSubTab === "general"
                          ? "bg-white text-purple-700 shadow-3xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>🏢 General Info</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("features")}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        settingsSubTab === "features"
                          ? "bg-white text-purple-700 shadow-3xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>⚙️ Feature Config</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab("billing")}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        settingsSubTab === "billing"
                          ? "bg-white text-purple-700 shadow-3xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>💳 Billing & Gateways</span>
                    </button>
                  </div>

                  {/* EDIT ACTIVE SOCIETY FORM */}
                  <form
                    onSubmit={handleSaveSocietySettings}
                    className="flex-1 p-4 space-y-4 overflow-y-auto"
                  >
                    {/* TAB 1: GENERAL & TOPOLOGY */}
                    {settingsSubTab === "general" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 block">
                            Society Name
                          </label>
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
                          <label className="font-bold text-slate-600 block">
                            Building / Property Type
                          </label>
                          <select
                            value={tempBuildingType}
                            onChange={(e) => setTempBuildingType(e.target.value)}
                            className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-slate-800"
                          >
                            <option value="Housing Society">Housing Society</option>
                            <option value="Apartment Complex">
                              Apartment Complex
                            </option>
                            <option value="Gated Community">Gated Community</option>
                            <option value="Residential Co-operative">
                              Residential Co-operative
                            </option>
                            <option value="Commercial Complex">
                              Commercial Complex
                            </option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 block">
                            Postal Address
                          </label>
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
                          <label className="font-bold text-slate-600 block">
                            Structural Topology (Real-Time Layout)
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setTempStructureType("standalone");
                                setTempHasWings(false);
                              }}
                              className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                                tempStructureType === "standalone"
                                  ? "bg-purple-100 border-purple-400 text-purple-700"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              🏢 Standalone
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTempStructureType("wings");
                                setTempHasWings(true);
                              }}
                              className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                                tempStructureType === "wings"
                                  ? "bg-purple-100 border-purple-400 text-purple-700"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              🧱 Winged Block
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTempStructureType("towers_wings");
                                setTempHasWings(true);
                                if (tempTowers.length === 0) {
                                  setTempTowers([
                                    { Name: "Tower 1", Wings: ["A", "B"] },
                                    { Name: "Tower 2", Wings: ["C", "D"] },
                                  ]);
                                }
                              }}
                              className={`py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                                tempStructureType === "towers_wings"
                                  ? "bg-purple-100 border-purple-400 text-purple-700"
                                  : "bg-white border-slate-200 text-slate-500"
                              }`}
                            >
                              🏰 Towers & Wings
                            </button>
                          </div>
                        </div>

                        {tempStructureType === "wings" && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <label className="font-bold text-slate-600 block">
                              Define Wing Names
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. A, B, C, D"
                              value={tempWingsList}
                              onChange={(e) => setTempWingsList(e.target.value)}
                              className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-slate-800"
                            />
                            <p className="text-[9px] text-slate-400">
                              Separate wings using commas (e.g., A, B, C or Wing A,
                              Wing B).
                            </p>
                          </div>
                        )}

                        {tempStructureType === "towers_wings" && (
                          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
                            <div className="flex justify-between items-center border-b pb-1.5 border-slate-200">
                              <span className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                                🏢 Towers & Wings Setup
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextNum = tempTowers.length + 1;
                                  setTempTowers([
                                    ...tempTowers,
                                    { Name: `Tower ${nextNum}`, Wings: ["A", "B"] },
                                  ]);
                                }}
                                className="text-[9px] bg-purple-600 hover:bg-purple-700 text-white font-black px-2 py-1 rounded cursor-pointer transition-all"
                              >
                                ➕ Add Tower
                              </button>
                            </div>

                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {tempTowers.map((tower, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-3xs space-y-1.5 relative"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempTowers(
                                        tempTowers.filter(
                                          (_, tIdx) => tIdx !== idx,
                                        ),
                                      );
                                    }}
                                    className="absolute top-1.5 right-2 text-rose-500 hover:text-rose-700 font-bold text-sm"
                                  >
                                    ✕
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-500 text-[9px] shrink-0">
                                      Tower Name:
                                    </span>
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
                                    <span className="font-bold text-slate-500 text-[9px] shrink-0">
                                      Wings in Tower:
                                    </span>
                                    <input
                                      type="text"
                                      value={tower.Wings.join(", ")}
                                      onChange={(e) => {
                                        const updated = [...tempTowers];
                                        updated[idx].Wings = e.target.value
                                          .split(",")
                                          .map((w) => w.trim())
                                          .filter((w) => w !== "");
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
                      </div>
                    )}

                    {/* TAB 2: FEATURE CONFIGURATION */}
                    {settingsSubTab === "features" && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                          <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-purple-600" />
                            <span>Feature Activation & Module Control</span>
                          </h4>
                          <p className="text-[10px] text-purple-700 leading-normal font-medium">
                            Enable or disable optional society modules. Toggling features on/off dynamically updates navigation tabs and permissions across all resident & admin views in real time.
                          </p>
                        </div>

                        <div className="space-y-2">
                          {[
                            {
                              id: "gatekeeper",
                              label: "Gatekeeper & Visitor Scanner",
                              icon: "🚪",
                              desc: "Pre-approve guests, OTP check-in & gatekeeper entry logs",
                            },
                            {
                              id: "waterMeters",
                              label: "Water Meters & Tank Maintenance",
                              icon: "💧",
                              desc: "Individual flat water meter readings & tank cleaning schedule",
                            },
                            {
                              id: "tenantRegister",
                              label: "Tenant Register & KYC",
                              icon: "🔑",
                              desc: "Lease agreement uploads, ID verification & police NOC tracking",
                            },
                            {
                              id: "amenities",
                              label: "Clubhouse & Amenity Booking",
                              icon: "📅",
                              desc: "Facility slot reservations, party hall bookings & payment logs",
                            },
                            {
                              id: "assetAMC",
                              label: "Asset & Lift AMC Register",
                              icon: "🛠️",
                              desc: "Equipment maintenance contracts, service bills & expiry alerts",
                            },
                            {
                              id: "parkingRegister",
                              label: "Vehicle & Parking Slot Register",
                              icon: "🚗",
                              desc: "Resident vehicle slots, stickers & guest parking passes",
                            },
                            {
                              id: "documentVault",
                              label: "Document Vault & Repository",
                              icon: "📂",
                              desc: "AGM minutes, audit statements, legal deeds & bylaws",
                            },
                          ].map((feat) => {
                            const key = feat.id as keyof FeatureFlags;
                            const isEnabled = tempFeatures[key] !== false;
                            return (
                              <div
                                key={feat.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isEnabled
                                    ? "bg-purple-50/40 border-purple-200 shadow-3xs"
                                    : "bg-slate-50 border-slate-200 opacity-75"
                                } flex items-center justify-between gap-3`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className="text-lg shrink-0 mt-0.5">
                                    {feat.icon}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-extrabold text-slate-800 text-xs">
                                        {feat.label}
                                      </h5>
                                      <span
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                          isEnabled
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : "bg-slate-200 text-slate-600 border border-slate-300"
                                        }`}
                                      >
                                        {isEnabled ? "ACTIVE" : "DISABLED"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                                      {feat.desc}
                                    </p>
                                  </div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      setTempFeatures({
                                        ...tempFeatures,
                                        [key]: e.target.checked,
                                      });
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: BILLING & PAYMENT GATEWAYS */}
                    {settingsSubTab === "billing" && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* FINANCIAL CORE & BILLING ENGINE SETTINGS */}
                        <div className="space-y-2 p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                          <div className="flex justify-between items-center border-b pb-1.5 border-indigo-200/80">
                            <span className="font-extrabold text-indigo-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                              💳 Billing Rules & Fines Engine
                            </span>
                            <span className="text-[8px] bg-indigo-200/80 text-indigo-800 font-bold px-1.5 py-0.5 rounded uppercase">
                              Financial Core
                            </span>
                          </div>

                          <div className="space-y-2 pt-1">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 text-[9.5px] block">
                                Billing Calculation Mode
                              </label>
                              <select
                                value={tempBillingMode}
                                onChange={(e) =>
                                  setTempBillingMode(e.target.value as any)
                                }
                                className="w-full bg-white border border-slate-300 p-2 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 text-[10px]"
                              >
                                <option value="FlatRate">
                                  Mode 1: Flat Rate (Fixed per unit)
                                </option>
                                <option value="SqFtRate">
                                  Mode 2: SqFt Rate (AreaSqFt × RatePerSqFt)
                                </option>
                                <option value="Hybrid">
                                  Mode 3: Hybrid (Base Flat Rate + SqFt Component)
                                </option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="font-semibold text-slate-600 block text-[9px]">
                                  Rate Per SqFt (₹)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={tempRatePerSqFt}
                                  onChange={(e) =>
                                    setTempRatePerSqFt(Number(e.target.value))
                                  }
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded-lg font-mono font-bold text-slate-800 text-[10px]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-semibold text-slate-600 block text-[9px]">
                                  Default Base Rate (₹)
                                </label>
                                <input
                                  type="number"
                                  value={tempFlatRateAmount}
                                  onChange={(e) =>
                                    setTempFlatRateAmount(Number(e.target.value))
                                  }
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded-lg font-mono font-bold text-slate-800 text-[10px]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-150">
                              <div className="space-y-1">
                                <label className="font-semibold text-slate-600 block text-[9px]">
                                  Late Penalty Type
                                </label>
                                <select
                                  value={tempLateFeeType}
                                  onChange={(e) =>
                                    setTempLateFeeType(e.target.value as any)
                                  }
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-[10px] font-bold"
                                >
                                  <option value="Fixed">
                                    Fixed Fine Amount (₹)
                                  </option>
                                  <option value="Interest">
                                    Simple Interest (%/mo)
                                  </option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="font-semibold text-slate-600 block text-[9px]">
                                  Penalty Value (
                                  {tempLateFeeType === "Fixed" ? "₹" : "%"})
                                </label>
                                <input
                                  type="number"
                                  value={tempLateFeeValue}
                                  onChange={(e) =>
                                    setTempLateFeeValue(Number(e.target.value))
                                  }
                                  className="w-full bg-white border border-slate-300 p-1.5 rounded-lg font-mono font-bold text-slate-800 text-[10px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PAYMENT GATEWAY PROVISIONING (ABSTRACTION LAYER) */}
                        <div className="space-y-2 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                          <div className="flex justify-between items-center border-b pb-1.5 border-emerald-200/80">
                            <span className="font-extrabold text-emerald-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                              🌐 Payment Gateway Integration
                            </span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tempGatewayEnabled}
                                onChange={(e) =>
                                  setTempGatewayEnabled(e.target.checked)
                                }
                                className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-[9px] font-bold text-emerald-800">
                                Enable Checkout
                              </span>
                            </label>
                          </div>

                          {tempGatewayEnabled && (
                            <div className="space-y-2 pt-1 animate-fadeIn">
                              <div className="space-y-1">
                                <label className="font-bold text-slate-700 text-[9.5px] block">
                                  Gateway Provider
                                </label>
                                <select
                                  value={tempGatewayProvider}
                                  onChange={(e) =>
                                    setTempGatewayProvider(e.target.value as any)
                                  }
                                  className="w-full bg-white border border-slate-300 p-2 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 text-[10px]"
                                >
                                  <option value="Razorpay">
                                    Razorpay Checkout SDK
                                  </option>
                                  <option value="Cashfree">
                                    Cashfree Payments Web SDK
                                  </option>
                                  <option value="Manual">
                                    Manual Bank Transfer / QR Code Only
                                  </option>
                                </select>
                              </div>

                              {tempGatewayProvider !== "Manual" && (
                                <div className="space-y-1">
                                  <label className="font-semibold text-slate-600 block text-[9px]">
                                    Production/Sandbox API Key
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={
                                      tempGatewayProvider === "Razorpay"
                                        ? "rzp_live_xxxxxxxx"
                                        : "cf_live_xxxxxxxx"
                                    }
                                    value={tempGatewayApiKey}
                                    onChange={(e) =>
                                      setTempGatewayApiKey(e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg font-mono text-[10px] text-slate-800"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold mt-4 shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      id="save-society-config-btn"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Society Configurations</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Create Poll Modal Overlay */}
              {showCreatePollModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-amber-600" />
                        <h3 className="font-extrabold text-xs">
                          Create AGM Motion / Poll
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowCreatePollModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (onAddPoll) {
                          onAddPoll({
                            SocietyId: activeSocietyId,
                            Title: newPollTitle,
                            Description: newPollDescription,
                            Category: newPollCategory,
                            StartDate: newPollStartDate,
                            EndDate: newPollEndDate,
                            Status: "Active",
                            CreatedBy: loggedInUserEmail || "Admin",
                          });
                          setShowCreatePollModal(false);
                          triggerToast(
                            "AGM Poll resolution published for e-voting!",
                          );
                        }
                      }}
                      className="space-y-2.5 text-xs"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px] block">
                          Motion / Resolution Category
                        </label>
                        <select
                          value={newPollCategory}
                          onChange={(e) =>
                            setNewPollCategory(e.target.value as any)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs font-bold"
                        >
                          <option value="AGM Resolution">AGM Resolution</option>
                          <option value="Maintenance Hike">
                            Maintenance Hike Proposal
                          </option>
                          <option value="Amenity Proposal">
                            Amenity Proposal
                          </option>
                          <option value="Security Policy">
                            Security Policy Vote
                          </option>
                          <option value="General Society Vote">
                            General Society Vote
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px] block">
                          Motion Headline / Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Approval for Solar Panel Installation on Wing B Roof"
                          value={newPollTitle}
                          onChange={(e) => setNewPollTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px] block">
                          Resolution Details & Rationale
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Detail the budget, background, and options for voters..."
                          value={newPollDescription}
                          onChange={(e) =>
                            setNewPollDescription(e.target.value)
                          }
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[9px] block">
                            Start Date
                          </label>
                          <input
                            type="date"
                            required
                            value={newPollStartDate}
                            onChange={(e) =>
                              setNewPollStartDate(e.target.value)
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl text-[10px] font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[9px] block">
                            End Date
                          </label>
                          <input
                            type="date"
                            required
                            value={newPollEndDate}
                            onChange={(e) => setNewPollEndDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl text-[10px] font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreatePollModal(false)}
                          className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow cursor-pointer"
                        >
                          Publish Resolution
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add / Modify Member Modal Popup */}
              {showMemberForm && (
                <div className="absolute inset-0 bg-white z-50 flex flex-col text-xs">
                  <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">
                      {isEditingMember
                        ? "Modify Member Info"
                        : "Add New Member"}
                    </h3>
                    <button
                      onClick={() => setShowMemberForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveMember}
                    className="flex-1 p-4 space-y-3 overflow-y-auto"
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block text-xs">
                            Flat/Unit No.
                          </label>
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

                        {activeStructureType === "towers_wings" ? (
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-600 block text-xs">
                              Tower
                            </label>
                            <select
                              value={memTower}
                              onChange={(e) => {
                                const newTow = e.target.value;
                                setMemTower(newTow);
                                const tObj = activeTowers.find(
                                  (t) => t.Name === newTow,
                                );
                                if (tObj && tObj.Wings.length > 0) {
                                  setMemWing(tObj.Wings[0]);
                                }
                              }}
                              className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                            >
                              {activeTowers.map((tower) => (
                                <option key={tower.Name} value={tower.Name}>
                                  {tower.Name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : activeStructureType === "wings" ? (
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-600 block text-xs">
                              Wing Block
                            </label>
                            <select
                              value={memWing}
                              onChange={(e) => setMemWing(e.target.value)}
                              className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                            >
                              {wingsList.map((wing) => (
                                <option key={wing} value={wing}>
                                  Wing {wing}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-1 opacity-50">
                            <label className="font-semibold text-slate-600 block text-xs">
                              Wing/Tower
                            </label>
                            <input
                              type="text"
                              disabled
                              placeholder="Standalone (No Subdivisions)"
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-not-allowed text-xs text-slate-400"
                            />
                          </div>
                        )}
                      </div>

                      {activeStructureType === "towers_wings" && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="font-semibold text-slate-600 block text-xs">
                            Wing in {memTower}
                          </label>
                          <select
                            value={memWing}
                            onChange={(e) => setMemWing(e.target.value)}
                            className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          >
                            {(
                              activeTowers.find((t) => t.Name === memTower)
                                ?.Wings || []
                            ).map((wing) => (
                              <option key={wing} value={wing}>
                                Wing {wing}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Primary Owner Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra"
                        value={memOwnerName}
                        onChange={(e) => setMemOwnerName(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block text-[10px]">
                          Occupancy Status
                        </label>
                        <select
                          value={memStatus}
                          onChange={(e) => setMemStatus(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none text-[10px]"
                        >
                          <option value="Owner">Owner</option>
                          <option value="Tenant">Tenant</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block text-[10px]">
                          Area (SqFt)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 850"
                          value={memAreaSqFt}
                          onChange={(e) => setMemAreaSqFt(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono font-bold text-[10px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block text-[10px]">
                          Dues Balance (₹)
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 1500"
                          value={memBalance}
                          onChange={(e) => setMemBalance(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-[10px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Phone Contact Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={memContactNo}
                        onChange={(e) => setMemContactNo(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh.c@example.com"
                        value={memEmail}
                        onChange={(e) => setMemEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Co-Owners / Family Residents
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sunita Chandra (Spouse)"
                        value={memCoOwners}
                        onChange={(e) => setMemCoOwners(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Registered Vehicle No.
                      </label>
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
                      {isEditingMember
                        ? "Update Member Profile"
                        : "Register New Member"}
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
                    <button
                      onClick={() => setShowAuditLogsModal(false)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                    <div className="p-3 bg-purple-50 text-purple-900 rounded-xl border border-purple-100 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        Internal Activity Ledger
                      </span>
                      <p className="text-[9px] text-purple-700">
                        All administrative operations such as financial updates,
                        balance revisions, and member modifications are securely
                        locked for transparency.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {(() => {
                        const activeAuditLogs = [...(auditLogs || [])]
                          .filter((log) => !log.SocietyId || log.SocietyId === activeSocietyId)
                          .reverse();

                        if (activeAuditLogs.length === 0) {
                          return (
                            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-250">
                              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                              <p className="text-xs font-semibold">
                                Pristine Audit Ledger
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                No administrative operations logged yet
                              </p>
                            </div>
                          );
                        }

                        const totalAuditPages = Math.max(1, Math.ceil(activeAuditLogs.length / auditLogPageSize));
                        const paginatedAuditLogs = activeAuditLogs.slice((auditLogPage - 1) * auditLogPageSize, auditLogPage * auditLogPageSize);

                        return (
                          <>
                            {paginatedAuditLogs.map((log) => (
                              <div
                                key={log.id}
                                className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5 hover:border-purple-200 transition-colors"
                              >
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                  <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                                    {log.Action || "Operation"}
                                  </span>
                                  <span className="font-mono">
                                    {new Date(log.Timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-xs font-medium leading-relaxed">
                                  {log.Details}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[9px] font-semibold text-slate-500">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                  <span>Authorized by:</span>
                                  <span className="font-mono text-purple-700 bg-purple-50/50 px-1 rounded-sm">
                                    {log.UserName || "admin"} ({log.UserRole})
                                  </span>
                                </div>
                              </div>
                            ))}
                            {activeAuditLogs.length > auditLogPageSize && (
                              <div className="flex justify-between items-center bg-slate-100 px-3 py-2 rounded-xl text-[9px] font-bold text-slate-600 border border-slate-200 mt-2">
                                <span>Showing {(auditLogPage - 1) * auditLogPageSize + 1}-{Math.min(auditLogPage * auditLogPageSize, activeAuditLogs.length)} of {activeAuditLogs.length}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={auditLogPage === 1}
                                    onClick={() => setAuditLogPage(p => Math.max(1, p - 1))}
                                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                  >
                                    Prev
                                  </button>
                                  <span className="font-mono">{auditLogPage}/{totalAuditPages}</span>
                                  <button
                                    disabled={auditLogPage >= totalAuditPages}
                                    onClick={() => setAuditLogPage(p => Math.min(totalAuditPages, p + 1))}
                                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 font-extrabold shadow-xs cursor-pointer"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
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
                        <h2 className="text-sm font-bold text-slate-800 mt-2">
                          Dues Payment Gateway
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Simulated Sandbox Environment • Unit{" "}
                          {loggedInMemberFlat}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMemberPayModal(false)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-black">
                        AMOUNT TO BE PAID
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        ₹{parseFloat(memberPayAmount).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-purple-600 font-bold mt-1">
                        Maintenance & Services Dues
                      </p>
                    </div>

                    {/* Simulated Payment Methods */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400">
                        SELECT SIMULATED INSTRUMENT
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMemberPayMode("UPI")}
                          className={`py-2 rounded-lg border text-center font-bold transition-all text-[10px] ${
                            memberPayMode === "UPI"
                              ? "bg-purple-50 border-purple-400 text-purple-700 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          📱 Instant UPI Sandbox
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberPayMode("Card")}
                          className={`py-2 rounded-lg border text-center font-bold transition-all text-[10px] ${
                            memberPayMode === "Card"
                              ? "bg-purple-50 border-purple-400 text-purple-700 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          💳 Mock Credit Card
                        </button>
                      </div>
                    </div>

                    {memberPayMode === "UPI" ? (
                      <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/60 flex flex-col items-center gap-2 animate-fadeIn">
                        <div className="w-24 h-24 bg-white p-1 rounded-lg border border-purple-100 flex items-center justify-center relative shadow-sm">
                          <div className="absolute inset-0 bg-slate-100/50 flex flex-col justify-center items-center text-center p-1">
                            <span className="text-[16px]">📱</span>
                            <span className="text-[8px] font-bold text-slate-500 mt-0.5">
                              MOCK QR
                            </span>
                          </div>
                        </div>
                        <p className="text-[8px] text-slate-500 text-center font-bold uppercase tracking-wider">
                          UPI ID: greenwood@sbbi • Greenwood Residency Committee
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-slate-400">
                            Card Number (Mock)
                          </label>
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
                          triggerToast("Invalid amount to pay");
                          return;
                        }
                        onAddPayment({
                          Date: new Date().toISOString().split("T")[0],
                          FlatNo: loggedInMemberFlat,
                          Amount: amount,
                          Mode:
                            memberPayMode === "UPI" ? "UPI" : "Bank Transfer",
                          ReferenceNo: `${memberPayMode === "UPI" ? "UPI" : "BANK"}-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                          Status: "Cleared",
                        });
                        setShowMemberPayModal(false);
                        triggerToast(
                          `Simulated payment of ₹${amount} successful!`,
                        );
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md active:scale-[0.98]"
                    >
                      🚀 Approve Simulated Sandbox Transfer
                    </button>

                    <p className="text-[8px] text-slate-400 text-center italic">
                      Note: This transaction is completely simulated within the
                      Sandbox sandbox and no real funds are moved.
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ======================= TIER 1 MODALS ======================== */}
              {/* ============================================================== */}

              {/* 1. Add / Edit Emergency Contact Modal */}
              {showAddEmergencyModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <h3 className="font-extrabold text-slate-800">
                          {editingEmergContact
                            ? "Edit Emergency Contact"
                            : "Add New Emergency Helpline"}
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddEmergencyModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newEmergName.trim() || !newEmergPhone.trim()) {
                          triggerToast(
                            "Please provide contact name and phone number",
                          );
                          return;
                        }
                        if (editingEmergContact && onUpdateEmergencyContact) {
                          onUpdateEmergencyContact(editingEmergContact.id, {
                            Name: newEmergName.trim(),
                            Category: newEmergCategory,
                            Phone: newEmergPhone.trim(),
                            RoleOrTitle: newEmergRoleTitle.trim(),
                          });
                          triggerToast("Updated emergency contact");
                        } else if (onAddEmergencyContact) {
                          onAddEmergencyContact({
                            SocietyId: activeSocietyId,
                            Name: newEmergName.trim(),
                            Category: newEmergCategory,
                            Phone: newEmergPhone.trim(),
                            RoleOrTitle: newEmergRoleTitle.trim(),
                            IsImportant:
                              newEmergCategory === "Police" ||
                              newEmergCategory === "Ambulance" ||
                              newEmergCategory === "Fire",
                          });
                          triggerToast("Added emergency contact");
                        }
                        setShowAddEmergencyModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Contact / Service Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. City Police Control Room, Society Gate Security"
                          value={newEmergName}
                          onChange={(e) => setNewEmergName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Category
                          </label>
                          <select
                            value={newEmergCategory}
                            onChange={(e) =>
                              setNewEmergCategory(e.target.value as any)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold"
                          >
                            <option value="Police">Police</option>
                            <option value="Ambulance">Ambulance</option>
                            <option value="Fire">Fire</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Security">Security</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Committee">Committee</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 100 or +91 9820012345"
                            value={newEmergPhone}
                            onChange={(e) => setNewEmergPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Role / Designation (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Society Secretary, Senior Inspector, Main Gate Desk"
                          value={newEmergRoleTitle}
                          onChange={(e) => setNewEmergRoleTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                      >
                        {editingEmergContact
                          ? "Save Contact Updates"
                          : "Publish Helpline Contact"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* 2. Register Tenant Modal */}
              {showAddTenantModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-amber-600" />
                        <h3 className="font-extrabold text-slate-800">
                          Register Tenant Mapping
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddTenantModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !newTenFlatNo.trim() ||
                          !newTenName.trim() ||
                          !newTenPhone.trim()
                        ) {
                          triggerToast(
                            "Please fill required flat, tenant name and phone number",
                          );
                          return;
                        }
                        if (onAddTenant) {
                          onAddTenant({
                            SocietyId: activeSocietyId,
                            FlatNo: newTenFlatNo.trim(),
                            TenantName: newTenName.trim(),
                            ContactNo: newTenPhone.trim(),
                            Email: newTenEmail.trim(),
                            MoveInDate:
                              newTenMoveIn ||
                              new Date().toISOString().split("T")[0],
                            MoveOutDate: newTenMoveOut,
                            AgreementDocUrl:
                              newTenAgreementUrl ||
                              "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",
                            IdProofUrl:
                              newTenIdProofUrl ||
                              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                            KycStatus: "Pending",
                            Remarks: "Awaiting committee verification",
                          });
                          triggerToast(
                            `Tenant registered for Flat ${newTenFlatNo.trim()}! KYC Pending.`,
                          );
                        }
                        setShowAddTenantModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Flat Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 101"
                            value={newTenFlatNo}
                            onChange={(e) => setNewTenFlatNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs uppercase font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Tenant Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rajesh Kumar"
                            value={newTenName}
                            onChange={(e) => setNewTenName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9820011223"
                            value={newTenPhone}
                            onChange={(e) => setNewTenPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Tenant Email
                          </label>
                          <input
                            type="email"
                            placeholder="tenant@email.com"
                            value={newTenEmail}
                            onChange={(e) => setNewTenEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Move-In Date
                          </label>
                          <input
                            type="date"
                            value={newTenMoveIn}
                            onChange={(e) => setNewTenMoveIn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Lease Expiry Date
                          </label>
                          <input
                            type="date"
                            value={newTenMoveOut}
                            onChange={(e) => setNewTenMoveOut(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-black uppercase text-amber-800 block">
                          KYC Attachments & Verification Documents
                        </span>

                        <FileUpload
                          label="Upload Rental Lease Agreement PDF"
                          bucket="tenant-kyc"
                          accept=".pdf,.doc,.docx,image/*"
                          currentUrl={newTenAgreementUrl}
                          onUploadSuccess={(res) => {
                            setNewTenAgreementUrl(res.url);
                            triggerToast(
                              `Lease Agreement uploaded to 'tenant-kyc' bucket!`,
                            );
                          }}
                          onClear={() => setNewTenAgreementUrl("")}
                          isDark={isDark}
                        />

                        <FileUpload
                          label="Upload Police Verification / ID Proof"
                          bucket="tenant-kyc"
                          accept=".pdf,.jpg,.jpeg,.png"
                          currentUrl={newTenIdProofUrl}
                          onUploadSuccess={(res) => {
                            setNewTenIdProofUrl(res.url);
                            triggerToast(
                              `Tenant ID Proof uploaded to 'tenant-kyc' bucket!`,
                            );
                          }}
                          onClear={() => setNewTenIdProofUrl("")}
                          isDark={isDark}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                      >
                        Submit Tenant & KYC Records
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* 3. Review Tenant KYC Modal (Admin) */}
              {activeKycReviewTenant && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          KYC AUDIT DESK
                        </span>
                        <h3 className="font-extrabold text-slate-800 mt-1">
                          Flat {activeKycReviewTenant.FlatNo} -{" "}
                          {activeKycReviewTenant.TenantName}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveKycReviewTenant(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tenant Phone:</span>
                        <strong className="text-slate-700">
                          {activeKycReviewTenant.ContactNo}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Move-In Date:</span>
                        <strong className="text-slate-700">
                          {activeKycReviewTenant.MoveInDate}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Current KYC Status:
                        </span>
                        <strong className="text-amber-700 uppercase font-black">
                          {activeKycReviewTenant.KycStatus}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">
                        Auditor / Committee Remarks
                      </label>
                      <textarea
                        value={kycRemarksInput}
                        onChange={(e) => setKycRemarksInput(e.target.value)}
                        rows={2}
                        placeholder="Provide audit notes or reasons if rejecting..."
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateTenantKyc) {
                            onUpdateTenantKyc(
                              activeKycReviewTenant.id,
                              "Verified",
                              kycRemarksInput || "Verified by Committee",
                            );
                            triggerToast(
                              `KYC Verified for Flat ${activeKycReviewTenant.FlatNo}!`,
                            );
                          }
                          setActiveKycReviewTenant(null);
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-center"
                      >
                        ✓ Verify & Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateTenantKyc) {
                            onUpdateTenantKyc(
                              activeKycReviewTenant.id,
                              "Rejected",
                              kycRemarksInput ||
                                "Missing police verification proof",
                            );
                            triggerToast(
                              `KYC Marked Rejected for Flat ${activeKycReviewTenant.FlatNo}`,
                            );
                          }
                          setActiveKycReviewTenant(null);
                        }}
                        className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-center"
                      >
                        ✕ Reject KYC
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Document Viewer Modal */}
              {viewingDocModal && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex flex-col">
                  <div className="p-3 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-xs">
                        {viewingDocModal.title}
                      </h4>
                      <p className="text-[9px] text-slate-400">
                        {viewingDocModal.label}
                      </p>
                    </div>
                    <button
                      onClick={() => setViewingDocModal(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-center items-center text-center space-y-3 overflow-y-auto">
                    <div className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-2xl text-slate-800 space-y-3 text-xs">
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black text-sm">
                          {viewingDocModal.title}
                        </h5>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Encrypted Security Record • Verified
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 text-[9px] text-slate-600 leading-relaxed text-left">
                        <p>
                          📄 <strong>Document Summary:</strong> Official KYC
                          submission registered in society cloud vault.
                        </p>
                        <p className="mt-1 font-mono text-[8px] text-slate-400 break-all">
                          {viewingDocModal.url}
                        </p>
                      </div>

                      <a
                        href={viewingDocModal.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2 px-3 rounded-xl block text-center shadow transition-all cursor-pointer text-[10px]"
                      >
                        Open Full Document File
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Add Resident Vehicle Modal */}
              {showAddVehicleModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-extrabold text-slate-800">
                          Register Resident Vehicle
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddVehicleModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newVehFlatNo.trim() || !newVehNo.trim()) {
                          triggerToast(
                            "Please provide flat no and license plate number",
                          );
                          return;
                        }
                        if (onAddVehicle) {
                          onAddVehicle({
                            SocietyId: activeSocietyId,
                            FlatNo: newVehFlatNo.trim(),
                            OwnerName:
                              newVehOwnerName.trim() ||
                              activeResidentMember.OwnerName,
                            VehicleNo: newVehNo.trim().toUpperCase(),
                            VehicleType: newVehType,
                            ParkingSlotNo:
                              newVehSlotNo.trim() ||
                              `Slot ${newVehFlatNo.trim()}`,
                            SlotNo:
                              newVehSlotNo.trim() ||
                              `Slot ${newVehFlatNo.trim()}`,
                            StickerIssued: newVehStickerIssued,
                          });
                          triggerToast(
                            `Registered vehicle ${newVehNo.trim().toUpperCase()}!`,
                          );
                        }
                        setShowAddVehicleModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Flat Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 101"
                            value={newVehFlatNo}
                            onChange={(e) => setNewVehFlatNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs uppercase font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Owner / Resident Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={newVehOwnerName}
                            onChange={(e) => setNewVehOwnerName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            License Plate Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MH-02-AB-1234"
                            value={newVehNo}
                            onChange={(e) => setNewVehNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono uppercase font-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Vehicle Category
                          </label>
                          <select
                            value={newVehType}
                            onChange={(e) =>
                              setNewVehType(e.target.value as any)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold"
                          >
                            <option value="4-Wheeler">4-Wheeler (Car)</option>
                            <option value="2-Wheeler">
                              2-Wheeler (Bike/Scooter)
                            </option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Assigned Parking Slot
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Slot A-101"
                            value={newVehSlotNo}
                            onChange={(e) => setNewVehSlotNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1 flex flex-col justify-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newVehStickerIssued}
                              onChange={(e) =>
                                setNewVehStickerIssued(e.target.checked)
                              }
                              className="rounded text-indigo-600"
                            />
                            <span className="font-extrabold text-slate-700 text-[10px]">
                              Issue Gate Sticker Tag
                            </span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                      >
                        Save Vehicle Registration
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* 6. Issue Guest Parking Pass Modal */}
              {showAddGuestParkingModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-5 space-y-3.5 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ParkingSquare className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-extrabold text-slate-800">
                          Issue Visitor Parking Permit
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddGuestParkingModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !newGPassFlatNo.trim() ||
                          !newGPassGuestName.trim() ||
                          !newGPassVehNo.trim()
                        ) {
                          triggerToast(
                            "Please fill host flat, guest name, and vehicle number",
                          );
                          return;
                        }
                        if (onAddGuestParking) {
                          onAddGuestParking({
                            SocietyId: activeSocietyId,
                            FlatNo: newGPassFlatNo.trim(),
                            GuestName: newGPassGuestName.trim(),
                            VehicleNo: newGPassVehNo.trim().toUpperCase(),
                            GuestVehicleNo: newGPassVehNo.trim().toUpperCase(),
                            VehicleType: newGPassVehType,
                            AssignedSlot:
                              newGPassSlot.trim() || "Visitor Slot V-01",
                            ValidFrom:
                              newGPassValidFrom ||
                              new Date().toISOString().split("T")[0],
                            ValidUntil:
                              newGPassValidUntil ||
                              new Date(Date.now() + 86400000)
                                .toISOString()
                                .split("T")[0],
                            Status: "Active",
                          });
                          triggerToast(
                            `Issued visitor permit for ${newGPassGuestName.trim()}`,
                          );
                        }
                        setShowAddGuestParkingModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Host Flat Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 101"
                            value={newGPassFlatNo}
                            onChange={(e) => setNewGPassFlatNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs uppercase font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Visitor / Guest Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Vikram Malhotra"
                            value={newGPassGuestName}
                            onChange={(e) =>
                              setNewGPassGuestName(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Guest Vehicle Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MH-12-CD-5678"
                            value={newGPassVehNo}
                            onChange={(e) => setNewGPassVehNo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono uppercase font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Assigned Visitor Slot
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Visitor Slot V-03"
                            value={newGPassSlot}
                            onChange={(e) => setNewGPassSlot(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Valid From Date
                          </label>
                          <input
                            type="date"
                            value={newGPassValidFrom}
                            onChange={(e) =>
                              setNewGPassValidFrom(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Valid Until Date
                          </label>
                          <input
                            type="date"
                            value={newGPassValidUntil}
                            onChange={(e) =>
                              setNewGPassValidUntil(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                      >
                        Issue Visitor Permit
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: UPLOAD SOCIETY DOCUMENT ----------------- */}
              {showAddDocModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 space-y-3 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          Upload Central Society Document
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddDocModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newDocTitle.trim()) {
                          triggerToast("Please enter document title");
                          return;
                        }
                        if (onAddSocietyDocument) {
                          onAddSocietyDocument({
                            SocietyId: activeSocietyId,
                            Title: newDocTitle.trim(),
                            Category: newDocCategory,
                            DocumentUrl: newDocUrl || "#",
                            FileName:
                              newDocFileName ||
                              `${newDocTitle.replace(/\s+/g, "_")}.pdf`,
                            FileSize: "1.8 MB",
                            IsPublic: newDocIsPublic,
                            UploadDate: new Date().toISOString().split("T")[0],
                            UploadedBy:
                              userRole === "Admin"
                                ? "Management Committee"
                                : "Resident",
                            Notes: newDocNotes.trim(),
                          });
                          setShowAddDocModal(false);
                          triggerToast(
                            `Document "${newDocTitle}" uploaded successfully!`,
                          );
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Document Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Annual Audit Report 2025-26"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Folder Category
                        </label>
                        <select
                          value={newDocCategory}
                          onChange={(e) =>
                            setNewDocCategory(e.target.value as any)
                          }
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-medium"
                        >
                          <option value="Legal Documents">
                            Legal Documents & Registration
                          </option>
                          <option value="AGM Minutes">
                            AGM & Committee Minutes
                          </option>
                          <option value="Financial Audits">
                            Financial Audits & Balance Sheets
                          </option>
                          <option value="Building Rules">
                            Building Bye-laws & Rules
                          </option>
                          <option value="Circulars">
                            General Circulars & Notices
                          </option>
                        </select>
                      </div>

                      <FileUpload
                        label="Upload Society Document File"
                        bucket="society-docs"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        currentUrl={newDocUrl}
                        currentFileName={newDocFileName}
                        onUploadSuccess={(res) => {
                          setNewDocUrl(res.url);
                          setNewDocFileName(res.fileName);
                          triggerToast(
                            `Society Document uploaded to 'society-docs' bucket!`,
                          );
                        }}
                        onClear={() => {
                          setNewDocUrl("");
                          setNewDocFileName("");
                        }}
                        isDark={isDark}
                      />

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Notes / Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Add brief summary or index points..."
                          value={newDocNotes}
                          onChange={(e) => setNewDocNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      {/* Public vs Private toggle checkbox */}
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-blue-900 block text-[10px]">
                            Public Document Access
                          </span>
                          <span className="text-[8.5px] text-blue-700">
                            Allow all society residents to view and download
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={newDocIsPublic}
                          onChange={(e) => setNewDocIsPublic(e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer"
                      >
                        Upload to Document Vault
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: DOCUMENT PREVIEW MODAL ----------------- */}
              {previewingSocietyDoc && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex flex-col justify-center p-3">
                  <div className="bg-white rounded-2xl p-4 space-y-3 animate-fadeIn shadow-2xl text-xs max-h-[85%] overflow-y-auto relative">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[8px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                          {previewingSocietyDoc.Category}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm mt-1">
                          {previewingSocietyDoc.Title}
                        </h3>
                        <p className="text-[8.5px] text-slate-400 font-semibold">
                          Uploaded {previewingSocietyDoc.UploadDate}{" "}
                          {previewingSocietyDoc.UploadedBy
                            ? `by ${previewingSocietyDoc.UploadedBy}`
                            : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setPreviewingSocietyDoc(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Stamped Document Preview Area */}
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center relative overflow-hidden space-y-3">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-25deg]">
                        <span className="text-3xl font-black text-slate-900 border-4 border-slate-900 px-4 py-2 uppercase">
                          OFFICIAL SOCIETY RECORD
                        </span>
                      </div>

                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xs">
                        <FileText className="w-6 h-6" />
                      </div>

                      <p className="text-xs font-bold text-slate-800">
                        {previewingSocietyDoc.FileName || "Document.pdf"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        {previewingSocietyDoc.Notes ||
                          "Official society document archived in digital vault."}
                      </p>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-left space-y-1.5 text-[9px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">
                            Access Privilege:
                          </span>
                          <span className="font-bold text-emerald-700">
                            {previewingSocietyDoc.IsPublic
                              ? "Public Resident Access"
                              : "Committee Only"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">
                            Document Hash / ID:
                          </span>
                          <span className="font-mono text-slate-600">
                            {previewingSocietyDoc.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          triggerToast(
                            `Downloading ${previewingSocietyDoc.FileName || "Document.pdf"}...`,
                          );
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download File
                      </button>
                      <button
                        onClick={() => setPreviewingSocietyDoc(null)}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: ADD AMC CONTRACT ----------------- */}
              {showAddAmcModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 space-y-3 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-teal-600" />
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          Register AMC Maintenance Contract
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddAmcModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !newAmcAssetName.trim() ||
                          !newAmcVendorName.trim()
                        ) {
                          triggerToast(
                            "Please provide asset name and vendor name",
                          );
                          return;
                        }
                        if (onAddAssetAMC) {
                          onAddAssetAMC({
                            SocietyId: activeSocietyId,
                            AssetName: newAmcAssetName.trim(),
                            Category: newAmcCategory,
                            VendorName: newAmcVendorName.trim(),
                            TechnicianName:
                              newAmcTechName.trim() || "Service Desk",
                            TechnicianContact:
                              newAmcTechContact.trim() || "+91 98765 00000",
                            ContractStartDate: newAmcStartDate,
                            ContractExpiryDate: newAmcExpiryDate,
                            NextServiceDueDate: newAmcNextDue,
                            Status: "Operational",
                            Remarks: newAmcRemarks.trim(),
                          });
                          setShowAddAmcModal(false);
                          triggerToast(
                            `AMC for "${newAmcAssetName}" registered!`,
                          );
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Equipment / Asset Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Passenger Elevator 1 - Wing A"
                          value={newAmcAssetName}
                          onChange={(e) => setNewAmcAssetName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Category
                          </label>
                          <select
                            value={newAmcCategory}
                            onChange={(e) =>
                              setNewAmcCategory(e.target.value as any)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-medium"
                          >
                            <option value="Lift / Elevator">
                              Lift / Elevator
                            </option>
                            <option value="Diesel Generator">
                              Diesel Generator
                            </option>
                            <option value="Water Pump">
                              Water Pump & Hydro System
                            </option>
                            <option value="Fire Safety System">
                              Fire Safety & Extinguishers
                            </option>
                            <option value="CCTV & Gate">
                              CCTV & Gate Boom Barrier
                            </option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            AMC Vendor Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Otis Elevators India"
                            value={newAmcVendorName}
                            onChange={(e) =>
                              setNewAmcVendorName(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Technician Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rajesh Kumar"
                            value={newAmcTechName}
                            onChange={(e) => setNewAmcTechName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Technician Phone
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +91 98765 43210"
                            value={newAmcTechContact}
                            onChange={(e) =>
                              setNewAmcTechContact(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Contract Start Date
                          </label>
                          <input
                            type="date"
                            value={newAmcStartDate}
                            onChange={(e) => setNewAmcStartDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Contract Expiry Date
                          </label>
                          <input
                            type="date"
                            value={newAmcExpiryDate}
                            onChange={(e) =>
                              setNewAmcExpiryDate(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-teal-700"
                          />
                        </div>
                      </div>

                      <FileUpload
                        label="Upload AMC Agreement / Equipment Spec PDF"
                        bucket="society-docs"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        currentUrl={newAmcReportUrl}
                        onUploadSuccess={(res) => {
                          setNewAmcReportUrl(res.url);
                          triggerToast(
                            `AMC Agreement uploaded to 'society-docs' bucket!`,
                          );
                        }}
                        onClear={() => setNewAmcReportUrl("")}
                        isDark={isDark}
                      />
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: LOG ROUTINE SERVICING ----------------- */}
              {showServiceLogModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 space-y-3 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          Log Servicing: {showServiceLogModal.AssetName}
                        </h3>
                        <p className="text-[8.5px] text-slate-400 font-semibold">
                          AMC Vendor: {showServiceLogModal.VendorName}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowServiceLogModal(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (onUpdateAssetAMC) {
                          onUpdateAssetAMC(showServiceLogModal.id, {
                            LastServicedDate: serviceDate,
                            NextServiceDueDate:
                              nextServiceDueDate ||
                              new Date(Date.now() + 90 * 86400000)
                                .toISOString()
                                .split("T")[0],
                            Remarks: serviceNotes.trim(),
                            Status: "Operational",
                          });
                          setShowServiceLogModal(null);
                          triggerToast(`Routine servicing recorded!`);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Service Date
                          </label>
                          <input
                            type="date"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Next Due Date
                          </label>
                          <input
                            type="date"
                            value={
                              nextServiceDueDate ||
                              new Date(Date.now() + 90 * 86400000)
                                .toISOString()
                                .split("T")[0]
                            }
                            onChange={(e) =>
                              setNextServiceDueDate(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-teal-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Technician Inspection Notes
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="e.g. Replaced lift brake pads, lubricated pulleys, motor alignment verified OK."
                          value={serviceNotes}
                          onChange={(e) => setServiceNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <FileUpload
                        label="Upload Servicing Bill / Inspection Report PDF"
                        bucket="society-docs"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        currentUrl={serviceReportUrl}
                        onUploadSuccess={(res) => {
                          setServiceReportUrl(res.url);
                          triggerToast(
                            `Servicing Bill uploaded to 'society-docs' bucket!`,
                          );
                        }}
                        onClear={() => setServiceReportUrl("")}
                        isDark={isDark}
                      />

                      <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer"
                      >
                        Complete Service Log Entry
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: BATCH WATER METER READINGS ----------------- */}
              {showBatchWaterMeterModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 space-y-3 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          Batch Water Meter Entry
                        </h3>
                        <p className="text-[8.5px] text-slate-400 font-semibold">
                          Billing Period: {waterReadingMonth}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBatchWaterMeterModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-xl text-[8.5px] text-cyan-900">
                      ⚡ Input current reading for each flat. Consumed units and
                      estimated charges (₹12/unit) are computed automatically.
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {batchMeterReadings.map((row, idx) => {
                        const curr = parseFloat(row.currentReading) || 0;
                        const consumed = Math.max(0, curr - row.prevReading);
                        const charge = consumed * row.unitRate;

                        return (
                          <div
                            key={row.flatNo}
                            className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="w-16">
                              <span className="font-extrabold text-slate-800 text-xs block">
                                Flat {row.flatNo}
                              </span>
                              <span className="text-[8px] text-slate-400 font-semibold">
                                Prev: {row.prevReading}
                              </span>
                            </div>

                            <div className="flex-1">
                              <input
                                type="number"
                                value={row.currentReading}
                                onChange={(e) => {
                                  const updated = [...batchMeterReadings];
                                  updated[idx].currentReading = e.target.value;
                                  setBatchMeterReadings(updated);
                                }}
                                placeholder="Current Mtr"
                                className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-bold text-cyan-800"
                              />
                            </div>

                            <div className="w-24 text-right">
                              <span className="text-xs font-black text-cyan-700 block">
                                {consumed} Units
                              </span>
                              <span className="text-[8px] font-bold text-emerald-600">
                                ₹{charge}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onBatchAddWaterMeters) {
                          const records: Omit<WaterMeter, "id">[] =
                            batchMeterReadings.map((r) => {
                              const curr =
                                parseFloat(r.currentReading) || r.prevReading;
                              const consumed = Math.max(
                                0,
                                curr - r.prevReading,
                              );
                              return {
                                SocietyId: activeSocietyId,
                                FlatNo: r.flatNo,
                                ReadingMonth: waterReadingMonth,
                                PreviousReading: r.prevReading,
                                CurrentReading: curr,
                                ConsumedUnits: consumed,
                                UnitRate: r.unitRate,
                                TotalCharge: consumed * r.unitRate,
                                ReadingDate: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                MeterSerialNo: `WM-${r.flatNo}`,
                              };
                            });
                          onBatchAddWaterMeters(records);
                          setShowBatchWaterMeterModal(false);
                          triggerToast(
                            `Batch water meter readings saved for ${waterReadingMonth}!`,
                          );
                        }
                      }}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                    >
                      Save All Flat Meter Readings
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- TIER 2 MODAL: LOG TANK CLEANING ----------------- */}
              {showAddTankCleaningModal && (
                <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
                  <div className="bg-white rounded-t-3xl p-4 space-y-3 animate-slide-up shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-600" />
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          Log Water Tank Maintenance
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddTankCleaningModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setShowAddTankCleaningModal(false);
                        triggerToast(
                          `Tank cleaning schedule logged for ${tankName}!`,
                        );
                      }}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block">
                          Tank Identifier
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Overhead Tank - Wing A & B"
                          value={tankName}
                          onChange={(e) => setTankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Tank Capacity
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 50,000 Liters"
                            value={tankCapacity}
                            onChange={(e) => setTankCapacity(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Cleaning Vendor
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. AquaClean Services"
                            value={tankVendor}
                            onChange={(e) => setTankVendor(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Cleaning Date
                          </label>
                          <input
                            type="date"
                            value={tankLastCleaned}
                            onChange={(e) => setTankLastCleaned(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block">
                            Next Due Date
                          </label>
                          <input
                            type="date"
                            value={tankNextDue}
                            onChange={(e) => setTankNextDue(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-cyan-700"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-2.5 rounded-xl shadow cursor-pointer mt-2"
                      >
                        Save Tank Maintenance Log
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: REAL-TIME PUSH NOTIFICATIONS CENTER ----------------- */}
              {showNotificationsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
                  <div
                    className={`w-full max-w-sm rounded-3xl p-4 shadow-2xl border transition-all ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-slate-100"
                        : "bg-white border-slate-150 text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <BellRing className="w-4 h-4 animate-bounce" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs">
                            Notification Center
                          </h3>
                          <p className="text-[9px] text-slate-400 font-medium">
                            Real-time alerts & gate notifications
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotificationsModal(false)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center my-3 gap-1.5">
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                          onClick={() => setNotificationFilter("all")}
                          className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                            notificationFilter === "all"
                              ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          All ({notifications.length})
                        </button>
                        <button
                          onClick={() => setNotificationFilter("unread")}
                          className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer ${
                            notificationFilter === "unread"
                              ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Unread ({unreadNotifCount})
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {unreadNotifCount > 0 && (
                          <button
                            onClick={handleMarkAllNotifsRead}
                            className="text-[8.5px] font-extrabold text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={handleSimulateNewPush}
                          className="text-[8.5px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer flex items-center gap-0.5"
                          title="Simulate incoming real-time push alert"
                        >
                          <span>⚡ Test Push</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {notifications
                        .filter((n) => notificationFilter === "all" || !n.read)
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n.id === notif.id ? { ...n, read: true } : n,
                                ),
                              );
                              if (notif.targetTab)
                                setCurrentTab(notif.targetTab);
                              setShowNotificationsModal(false);
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative ${
                              notif.read
                                ? "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800 text-slate-500"
                                : "bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800 shadow-3xs text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {!notif.read && (
                              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                            )}
                            <div className="pr-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded font-mono ${
                                    notif.category === "emergency"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
                                      : notif.category === "gate"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                                        : notif.category === "payment"
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                                  }`}
                                >
                                  {notif.category}
                                </span>
                                <span className="text-[8px] text-slate-400 font-semibold">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-[11px] mt-1 text-slate-800 dark:text-slate-100">
                                {notif.title}
                              </h4>
                              <p className="text-[9.5px] text-slate-600 dark:text-slate-300 mt-0.5 leading-tight">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      {notifications.filter(
                        (n) => notificationFilter === "all" || !n.read,
                      ).length === 0 && (
                        <p className="text-center py-8 text-[10px] text-slate-400 font-semibold">
                          No notifications found.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/50 text-center">
                      <span className="text-[8.5px] text-slate-400 font-medium">
                        Click any notification to navigate directly to its
                        section
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: BROADCAST EMERGENCY ALERT BANNER ----------------- */}
              {showBroadcastAlertModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 w-full max-w-sm shadow-2xl border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-150 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                          <ShieldAlert className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs">
                            Broadcast Urgent Notice
                          </h3>
                          <p className="text-[9px] text-slate-400">
                            High-contrast alert banner on Resident Dashboard
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowBroadcastAlertModal(false)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!broadcastTitle || !broadcastMessage) {
                          triggerToast(
                            "Please provide both title and description!",
                          );
                          return;
                        }
                        setActiveAlertBanner({
                          id: `alert-${Date.now()}`,
                          title: broadcastTitle,
                          message: broadcastMessage,
                          priority: "Emergency",
                          timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                        });
                        setAlertBannerDismissed(false);
                        setShowBroadcastAlertModal(false);
                        triggerToast(
                          "📢 Emergency Alert published to Resident Dashboard!",
                        );
                      }}
                      className="space-y-3 mt-3"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Alert Headline
                        </label>
                        <input
                          type="text"
                          required
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder="e.g. 🚨 Emergency Water Outage Notice"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Alert Description & Action
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          placeholder="Provide concise operational instructions for all residents..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[9px] text-amber-800 dark:text-amber-200 font-medium leading-tight">
                        ⚡ This urgent notice will be pinned at the top of the
                        Resident Home feed until dismissed.
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowBroadcastAlertModal(false)}
                          className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow cursor-pointer"
                        >
                          Publish Notice Banner
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: ONE-CLICK LEDGER STATEMENT PDF/PRINT EXPORT ----------------- */}
              {showPrintLedgerModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 w-full max-w-sm shadow-2xl border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-150 dark:border-slate-800 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs">
                            Official Ledger Statement
                          </h3>
                          <p className="text-[9px] text-slate-400">
                            Printable payment receipts & ledger report
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPrintLedgerModal(false)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-0.5 scrollbar-thin">
                      {/* Printable Official Receipt Canvas */}
                      <div
                        id="printable-ledger-statement"
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-[9.5px]"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-2">
                          <div>
                            <h2 className="font-black text-xs text-purple-700 dark:text-purple-300 uppercase tracking-tight">
                              {societyName}
                            </h2>
                            <p className="text-[8px] text-slate-400 font-medium">
                              {postalAddress}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[7.5px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded uppercase">
                              Flat {loggedInMemberFlat}
                            </span>
                            <p className="text-[7.5px] text-slate-400 mt-0.5">
                              {new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Resident Account Details */}
                        <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-150 dark:border-slate-800">
                          <div>
                            <span className="text-[7px] text-slate-400 uppercase font-bold block">
                              Primary Resident
                            </span>
                            <p className="font-extrabold text-[10px] text-slate-800 dark:text-slate-100">
                              {members.find(
                                (m) => m.FlatNo === loggedInMemberFlat,
                              )?.OwnerName || "Resident Owner"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-slate-400 uppercase font-bold block">
                              Net Ledger Balance
                            </span>
                            <p
                              className={`font-black text-[10px] ${
                                (members.find(
                                  (m) => m.FlatNo === loggedInMemberFlat,
                                )?.Balance || 0) > 0
                                  ? "text-rose-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              ₹
                              {(
                                members.find(
                                  (m) => m.FlatNo === loggedInMemberFlat,
                                )?.Balance || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Statement Invoices Table */}
                        <div>
                          <h4 className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                            Invoices & Maintenance Charges
                          </h4>
                          <div className="space-y-1">
                            {invoices
                              .filter(
                                (inv) =>
                                  inv.SocietyId === activeSocietyId &&
                                  (userRole === "Admin" ||
                                    inv.FlatNo === loggedInMemberFlat),
                              )
                              .slice(0, 4)
                              .map((inv) => (
                                <div
                                  key={inv.id}
                                  className="flex justify-between items-center bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[8.5px]"
                                >
                                  <div>
                                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                      {inv.BillMonth} Bill
                                    </span>
                                    <span className="text-[7px] text-slate-400 block font-medium">
                                      Flat {inv.FlatNo}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold block">
                                      ₹{inv.TotalAmount}
                                    </span>
                                    <span
                                      className={`text-[6.5px] font-black uppercase ${inv.Status === "Paid" ? "text-emerald-600" : "text-rose-600"}`}
                                    >
                                      {inv.Status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Payments Receipts Table */}
                        <div>
                          <h4 className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                            Cleared Payment Receipts
                          </h4>
                          <div className="space-y-1">
                            {payments
                              .filter(
                                (pmt) =>
                                  pmt.SocietyId === activeSocietyId &&
                                  (userRole === "Admin" ||
                                    pmt.FlatNo === loggedInMemberFlat),
                              )
                              .slice(0, 4)
                              .map((pmt, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50 text-[8.5px]"
                                >
                                  <div>
                                    <span className="font-extrabold text-emerald-800 dark:text-emerald-200">
                                      Receipt #{1001 + i}
                                    </span>
                                    <span className="text-[7px] text-slate-400 block font-medium">
                                      {pmt.Mode} • {pmt.Date}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-emerald-600">
                                      +₹{pmt.Amount}
                                    </span>
                                    <span className="text-[6.5px] font-bold text-emerald-700 block uppercase">
                                      Cleared
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="text-center pt-1 border-t border-slate-200 dark:border-slate-700 text-[7px] text-slate-400 italic">
                          Computer generated statement for {societyName}. No
                          physical signature required.
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-150 dark:border-slate-800 shrink-0">
                      <button
                        onClick={() =>
                          handleDownloadLedgerCSV(loggedInMemberFlat)
                        }
                        className="flex-1 py-2 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CSV Export</span>
                      </button>
                      <button
                        onClick={() => {
                          window.print();
                          triggerToast("Print dialog launched!");
                        }}
                        className="flex-1 py-2 text-[10px] font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: REGISTER NEW DOMESTIC STAFF ----------------- */}
              {showAddStaffModal && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 animate-fade-in">
                  <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Register Domestic Staff
                          </h3>
                          <p className="text-[8.5px] text-slate-400">
                            Add maid, driver, cook or security personnel
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddStaffModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!staffNameInput || !staffPhoneInput) {
                          triggerToast(
                            "Please enter Staff Name & Phone Number!",
                          );
                          return;
                        }
                        const assignedList = staffAssignedFlatsInput
                          .split(",")
                          .map((f) => f.trim())
                          .filter(Boolean);
                        if (onAddStaff) {
                          onAddStaff({
                            SocietyId: activeSocietyId,
                            Name: staffNameInput,
                            Phone: staffPhoneInput,
                            ServiceType: staffServiceTypeInput as any,
                            PhotoUrl: staffPhotoUrlInput || undefined,
                            Passcode:
                              staffPasscodeInput ||
                              Math.floor(
                                1000 + Math.random() * 9000,
                              ).toString(),
                            AssignedFlats:
                              assignedList.length > 0
                                ? assignedList
                                : [loggedInMemberFlat],
                            IdVerificationStatus: staffIdStatusInput as any,
                            Status: "Active",
                          });
                          triggerToast(
                            `Registered staff member ${staffNameInput}! Passcode: ${staffPasscodeInput}`,
                          );
                        }
                        setShowAddStaffModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Staff Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sita Devi / Ramesh Kumar"
                          value={staffNameInput}
                          onChange={(e) => setStaffNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Phone Number *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210"
                            value={staffPhoneInput}
                            onChange={(e) => setStaffPhoneInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-semibold"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Service Type
                          </label>
                          <select
                            value={staffServiceTypeInput}
                            onChange={(e) =>
                              setStaffServiceTypeInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          >
                            <option value="Maid">Maid / Housekeeping</option>
                            <option value="Cook">Cook / Chef</option>
                            <option value="Driver">Driver</option>
                            <option value="Cleaner">Car / Floor Cleaner</option>
                            <option value="Security Guard">
                              Security Guard
                            </option>
                            <option value="Gardener">Gardener</option>
                            <option value="Other">Other Helper</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Gate Check-In Passcode (4-Digits)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={staffPasscodeInput}
                            onChange={(e) =>
                              setStaffPasscodeInput(e.target.value)
                            }
                            className="flex-1 bg-purple-50 border border-purple-200 p-2 rounded-xl text-xs font-mono font-extrabold text-purple-900"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setStaffPasscodeInput(
                                Math.floor(
                                  1000 + Math.random() * 9000,
                                ).toString(),
                              )
                            }
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-[9px]"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Assigned Flats (Comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 101, 102, 204"
                          value={staffAssignedFlatsInput}
                          onChange={(e) =>
                            setStaffAssignedFlatsInput(e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            ID Verification Status
                          </label>
                          <select
                            value={staffIdStatusInput}
                            onChange={(e) =>
                              setStaffIdStatusInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          >
                            <option value="Verified">Aadhaar Verified</option>
                            <option value="Pending">KYC Pending</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Photo URL (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={staffPhotoUrlInput}
                            onChange={(e) =>
                              setStaffPhotoUrlInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-xs mt-2"
                      >
                        Save &amp; Generate Gate Passcode
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: ONBOARD NEW VENDOR ----------------- */}
              {showAddVendorModal && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 animate-fade-in">
                  <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl text-xs max-h-[90%] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Onboard Vendor Contractor
                          </h3>
                          <p className="text-[8.5px] text-slate-400">
                            GST Registration, Bank Account & Agreement Documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddVendorModal(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!vendorNameInput || !vendorPhoneInput) {
                          triggerToast(
                            "Please enter Vendor Name & Contact Phone!",
                          );
                          return;
                        }
                        if (onAddVendor) {
                          onAddVendor({
                            SocietyId: activeSocietyId,
                            VendorName: vendorNameInput,
                            GstNumber: vendorGstInput || "URP/Exempt",
                            ServiceCategory: vendorCategoryInput,
                            ContactPerson:
                              vendorContactPersonInput || vendorNameInput,
                            Phone: vendorPhoneInput,
                            AccountNumber: vendorAccNoInput || "SBIN000100293",
                            BankName: "State Bank of India",
                            IfscCode: "SBIN0001002",
                            ContractDocUrl:
                              vendorContractDocUrlInput || undefined,
                            Status: "Active",
                          });
                          triggerToast(`Vendor onboarded: ${vendorNameInput}!`);
                        }
                        setShowAddVendorModal(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Vendor Agency / Company Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Security Solutions Pvt Ltd"
                          value={vendorNameInput}
                          onChange={(e) => setVendorNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            GSTIN Number
                          </label>
                          <input
                            type="text"
                            placeholder="27AAAAA0000A1Z5"
                            value={vendorGstInput}
                            onChange={(e) => setVendorGstInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-semibold uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Service Category
                          </label>
                          <select
                            value={vendorCategoryInput}
                            onChange={(e) =>
                              setVendorCategoryInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          >
                            <option value="Security Agency">
                              Security Guard Agency
                            </option>
                            <option value="Housekeeping">
                              Housekeeping Services
                            </option>
                            <option value="Elevator AMC">
                              Elevator AMC (OTIS/KONE)
                            </option>
                            <option value="Water Vendor">
                              Water Tanker Supplier
                            </option>
                            <option value="Electrician">
                              Electrical Maintenance
                            </option>
                            <option value="Gardening">
                              Landscape & Gardening
                            </option>
                            <option value="Plumbing">Plumbing Services</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Vikram Malhotra"
                            value={vendorContactPersonInput}
                            onChange={(e) =>
                              setVendorContactPersonInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-600 block text-[9.5px]">
                            Phone Number *
                          </label>
                          <input
                            type="text"
                            placeholder="9820011223"
                            value={vendorPhoneInput}
                            onChange={(e) =>
                              setVendorPhoneInput(e.target.value)
                            }
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Vendor Bank Account (NEFT/RTGS)
                        </label>
                        <input
                          type="text"
                          placeholder="Account Number (e.g. 9182309120931)"
                          value={vendorAccNoInput}
                          onChange={(e) => setVendorAccNoInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600 block text-[9.5px]">
                          Contract Agreement Document URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={vendorContractDocUrlInput}
                          onChange={(e) =>
                            setVendorContractDocUrlInput(e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl shadow cursor-pointer text-xs mt-2"
                      >
                        Onboard Vendor &amp; Enable Dual Sign-Off
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- MODAL: REJECT DUAL APPROVAL EXPENSE ----------------- */}
              {reviewingDualExpense && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-3 animate-fade-in">
                  <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl text-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-rose-600" />
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Reject Expense Voucher
                          </h3>
                          <p className="text-[8.5px] text-slate-400">
                            Provide official reason for withholding dual
                            approval
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewingDualExpense(null)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 space-y-1">
                      <h4 className="font-black text-rose-950">
                        {reviewingDualExpense.Title}
                      </h4>
                      <p className="text-[9px] font-mono text-rose-800">
                        Amount: ₹{reviewingDualExpense.Amount.toLocaleString()}{" "}
                        • Vendor: {reviewingDualExpense.VendorName || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block text-[9.5px]">
                        Rejection Reason / Audit Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Missing vendor GST invoice copy, or amount exceeds sanctioned budget limit..."
                        value={rejectionReasonInput}
                        onChange={(e) =>
                          setRejectionReasonInput(e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setReviewingDualExpense(null)}
                        className="flex-1 py-2 bg-slate-100 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onRejectExpense) {
                            onRejectExpense(
                              reviewingDualExpense.id,
                              rejectionReasonInput ||
                                "Rejected by committee member during dual approval review",
                            );
                            triggerToast("Expense voucher rejected");
                          }
                          setReviewingDualExpense(null);
                        }}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* How-To & Help Knowledge Base Drawer */}
              <HowToHelpDrawer
                isOpen={showHelpDrawer}
                onClose={() => setShowHelpDrawer(false)}
                theme={theme}
              />

              {/* Feature Catalog & Module Settings Modal */}
              {showFeatureCatalogModal && (
                <FeatureCatalogModal
                  society={activeSocietyObj || {
                    id: activeSocietyId,
                    Name: societyName,
                    PostalAddress: postalAddress,
                    HasWings: hasWings,
                    Wings: wingsList,
                    BuildingType: buildingType as any,
                    FeaturesEnabled: activeFeatures
                  }}
                  onUpdateFeatures={(nextFeatures) => {
                    if (onUpdateSocietySettings) {
                      onUpdateSocietySettings(
                        societyName,
                        hasWings,
                        wingsList,
                        postalAddress,
                        buildingType,
                        activeStructureType,
                        activeTowers,
                        nextFeatures
                      );
                    }
                    triggerToast("Module Settings updated successfully!");
                  }}
                  onClose={() => setShowFeatureCatalogModal(false)}
                  theme={theme}
                />
              )}

              {/* Member CSV Bulk Import Modal */}
              <MemberCsvImportModal
                isOpen={showCsvImportModal}
                onClose={() => setShowCsvImportModal(false)}
                onImportMembers={(newMembers) => {
                  if (onSaveOrUpdateMember) {
                    newMembers.forEach((m) => onSaveOrUpdateMember(m));
                    triggerToast(`Imported ${newMembers.length} residents successfully!`);
                  }
                }}
                existingMembers={members}
                activeSocietyId={activeSocietyId}
                wingsList={wingsList}
                isDark={isDark}
              />

              {/* Member Dues & Payments Ledger History Modal */}
              <MemberDuesHistoryModal
                member={viewDuesHistoryMember}
                invoices={invoices}
                payments={payments}
                isOpen={!!viewDuesHistoryMember}
                onClose={() => setViewDuesHistoryMember(null)}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
