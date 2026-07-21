export interface Tower {
  id: string;
  Name: string;
  Wings: string[];
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
  TotalAmount: number;
  DueDate: string;
  Status: 'Unpaid' | 'Paid';
  IssuedDate: string;
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

