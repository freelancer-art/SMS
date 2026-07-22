export interface Tower {
  id: string;
  Name: string;
  Wings: string[];
}

export interface FeatureFlags {
  gatekeeper: boolean;
  waterMeters: boolean;
  tenantRegister: boolean;
  amenities: boolean;
  assetAMC: boolean;
  parkingRegister: boolean;
  documentVault: boolean;
}

export interface Society {
  id: string;
  Name: string;
  BuildingType: string;
  PostalAddress: string;
  Wings: string[];
  HasWings: boolean;
  StructureType?: 'standalone' | 'wings' | 'towers_wings';
  Towers?: Tower[];
  FeaturesEnabled?: FeatureFlags;
  // Billing Calculation Engine Settings
  BillingMode?: 'Flat Rate' | 'SqFt Rate' | 'Hybrid';
  RatePerSqFt?: number;
  FlatRateAmount?: number;
  BaseUtilityAmount?: number;
  LateFeeType?: 'Interest' | 'Fixed';
  LateFeeValue?: number;
  DueDateDay?: number;
  // Payment Gateway Provision Settings
  GatewayEnabled?: boolean;
  GatewayProvider?: 'Razorpay' | 'Cashfree' | 'Manual';
  GatewayApiKey?: string;
  UPI_ID?: string;
}

export interface Member {
  id?: string;
  SocietyId?: string;
  FlatNo: string;
  OwnerName: string;
  ContactNo: string;
  Email: string;
  Balance: number; // Positive means dues outstanding, negative/zero means advance or clear
  Status: 'Owner' | 'Tenant';
  CoOwners?: string;
  VehicleNo?: string;
  Wing?: string;
  Tower?: string;
  Role?: 'Member' | 'Admin';
  AreaSqFt?: number; // Carpet or Built-up area in SqFt for billing
}

export interface AuditLog {
  id: string;
  SocietyId: string;
  Timestamp: string;
  UserRole: string;
  UserId: string;
  UserName: string;
  Action: string;
  Details: string;
}

export interface Payment {
  id?: string;
  SocietyId?: string;
  MemberId?: string;
  Date: string;
  FlatNo: string;
  OwnerName?: string;
  Amount: number;
  Mode: 'Cash' | 'Cheque' | 'UPI' | 'Bank Transfer';
  ReferenceNo?: string;
  Status: 'Pending' | 'Cleared';
}

export interface Expense {
  id?: string;
  SocietyId?: string;
  Date: string;
  Category: 'Maintenance' | 'Security' | 'Water' | 'Electricity' | 'Repairs' | 'Gardening' | 'Salary' | 'Others';
  Amount: number;
  Vendor: string;
  InvoiceNo?: string;
  ApprovedBy?: string;
}

export interface Complaint {
  id: string;
  SocietyId?: string;
  MemberId?: string;
  FlatNo: string;
  Category: 'Plumbing' | 'Electrical' | 'Security' | 'Cleanliness' | 'Parking' | 'Noisy Neighbor' | 'Others';
  Title: string;
  Description: string;
  Date: string;
  Status: 'Open' | 'In Progress' | 'Resolved';
  Urgency: 'Low' | 'Medium' | 'High';
}

export interface Notice {
  id: string;
  SocietyId?: string;
  Date: string;
  Title: string;
  Category: 'Meeting' | 'Maintenance' | 'Celebration' | 'Rules' | 'General' | 'Security';
  Content: string;
  AttachmentUrl?: string;
  AttachmentName?: string;
  AttachmentSize?: string;
  PostedBy: string;
  DocumentUrl?: string; // Enhanced schema tracking
  UploadedBy?: string;  // Enhanced schema tracking
}

export interface Invoice {
  id: string;
  SocietyId: string;
  BillMonth: string;
  FlatNo: string;
  OwnerName: string;
  BaseAmount: number;
  WaterCharges: number;
  SecurityCharges: number;
  ParkingCharges: number;
  LateFeeCharges?: number;
  TotalAmount: number;
  DueDate: string;
  Status: 'Unpaid' | 'Paid';
  IssuedDate: string;
  BillingModeUsed?: string;
  AreaSqFtUsed?: number;
}

export interface Visitor {
  id: string;
  SocietyId: string;
  FlatNo: string;
  VisitorName: string;
  Purpose: 'Delivery' | 'Guest' | 'Maintenance' | 'Cab' | 'Other' | 'Services';
  ContactNo: string;
  VehicleNo?: string;
  CheckInTime: string;
  CheckOutTime?: string;
  Status: 'Pending Approval' | 'Approved' | 'Denied' | 'Checked In' | 'Checked Out' | 'Pre-Approved';
  HostApprovedBy?: string;
  AccessToken?: string;     // Randomized secure visitor access token
  TokenExpiresAt?: string;  // Expiration timestamp for token
}

export interface Role {
  id: string;
  RoleName: 'SuperAdmin' | 'Admin' | 'Committee Member' | 'Member';
  SocietyId?: string; // Associated society ID or null for SuperAdmin
  Description?: string;
}

export interface UserAuth {
  id: string;
  EmailOrPhone: string;
  PasswordHash: string; // Securely hashed credentials (simulated/real pbkdf2 or custom SHA-256)
  Salt: string;
  RoleId: string; // Foreign key to Roles.id
  SocietyId?: string; // Foreign key to Societies.id
  Status: 'Active' | 'Suspended';
}

export interface ComplaintReply {
  id: string;
  ComplaintId: string;
  SocietyId: string;
  SenderName: string;
  SenderRole: 'Admin' | 'Member';
  Message: string;
  Timestamp: string;
}

export interface FacilityBooking {
  id: string;
  SocietyId: string;
  FlatNo: string;
  ResidentName: string;
  FacilityName: 'Clubhouse' | 'Swimming Pool' | 'Tennis Court' | 'Banquet Hall' | 'Gym';
  Date: string;
  TimeSlot: string;
  Purpose: string;
  Charges: number;
  Status: 'Confirmed' | 'Completed' | 'Cancelled';
  BookedAt: string;
}

export interface EmergencyContact {
  id: string;
  SocietyId: string;
  Name: string;
  Category: 'Police' | 'Ambulance' | 'Fire' | 'Hospital' | 'Security' | 'Electrician' | 'Plumber' | 'Committee' | 'Other';
  Phone: string;
  RoleOrTitle?: string;
  IsImportant?: boolean;
}

export interface Tenant {
  id: string;
  SocietyId: string;
  FlatNo: string;
  TenantName: string;
  ContactNo: string;
  Email: string;
  MoveInDate: string;
  MoveOutDate?: string;
  AgreementDocUrl?: string;
  IdProofDocUrl?: string;
  IdProofUrl?: string;
  KycStatus: 'Pending' | 'Verified' | 'Rejected';
  Remarks?: string;
}

export interface Vehicle {
  id: string;
  SocietyId: string;
  FlatNo: string;
  OwnerName: string;
  VehicleNo: string;
  VehicleType: '2-Wheeler' | '4-Wheeler' | 'Other';
  ParkingSlotNo: string;
  SlotNo?: string;
  StickerIssued?: boolean;
}

export interface GuestParking {
  id: string;
  SocietyId: string;
  FlatNo: string;
  GuestName: string;
  VehicleNo: string;
  GuestVehicleNo?: string;
  VehicleType: '2-Wheeler' | '4-Wheeler';
  AssignedSlot: string;
  ValidFrom: string;
  ValidUntil: string;
  Status: 'Active' | 'Expired' | 'Completed';
}

export interface SocietyDocument {
  id: string;
  SocietyId: string;
  Title: string;
  Category: 'Legal Documents' | 'AGM Minutes' | 'Financial Audits' | 'Building Rules' | 'Circulars' | 'General Circulars' | string;
  DocumentUrl: string;
  IsPublic: boolean; // true = all residents, false = committee only
  UploadedBy: string;
  UploadedAt?: string;
  UploadDate?: string;
  FileName?: string;
  FileSize?: string;
  Notes?: string;
}

export interface AssetAMC {
  id: string;
  SocietyId: string;
  AssetName: string;
  AssetType?: 'Lift' | 'Water Tank' | 'Generator' | 'Fire System' | 'Gym Equipment' | 'Other' | string;
  Category?: 'Lift / Elevator' | 'Diesel Generator' | 'Water Pump' | 'Fire Safety System' | 'CCTV & Gate' | string;
  VendorName: string;
  VendorContact?: string;
  TechnicianName?: string;
  TechnicianContact?: string;
  ContractStartDate: string;
  ContractExpiryDate: string;
  LastServicedDate?: string;
  NextServicedDate?: string;
  NextServiceDueDate?: string;
  ServiceStatus?: 'Operational' | 'Under Servicing' | 'Servicing Due' | 'Out of Order' | string;
  Status?: 'Operational' | 'Under Maintenance' | 'Service Scheduled' | string;
  StatusNote?: string;
  Remarks?: string;
  ReportUrl?: string;
}

export interface WaterMeter {
  id: string;
  SocietyId: string;
  FlatNo: string;
  ReadingMonth: string; // e.g. '2026-07' or 'July 2026'
  PreviousReading: number;
  CurrentReading: number;
  UnitsConsumed?: number; // Auto-calculated (CurrentReading - PreviousReading)
  ConsumedUnits?: number;
  UnitRate?: number;
  TotalCharge?: number;
  MeterSerialNo?: string;
  ReadingDate?: string;
  RecordedBy?: string;
  RecordedAt?: string;
  Status?: 'Entered' | 'Billed' | string;
}

export interface Poll {
  id: string;
  SocietyId: string;
  Title: string;
  Description: string;
  Category?: 'AGM Resolution' | 'Budget Approval' | 'Rule Change' | 'Maintenance Upgrade' | 'General' | string;
  StartDate: string;
  EndDate: string;
  CreatedBy: string;
  Status: 'Active' | 'Closed' | 'Draft' | string;
  TotalEligibleFlats?: number;
}

export interface PollVote {
  id: string;
  PollId: string;
  SocietyId: string;
  FlatNo: string;
  VotedBy: string;
  Vote: 'In Favor' | 'Against' | 'Abstain';
  Timestamp: string;
}


