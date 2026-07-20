export interface Society {
  id: string;
  Name: string;
  BuildingType: string;
  PostalAddress: string;
  Wings: string[];
  HasWings: boolean;
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
  PostedBy: string;
}
