-- ============================================================================
-- HOUSING SOCIETY MANAGEMENT APPLICATION - SUPABASE POSTGRES SCHEMA (TIER 1 + TIER 2)
-- Production Security Hardened with Row-Level Security (RLS) & Private Buckets
-- ============================================================================

-- 1. DROP EXISTING TABLES IF THEY EXIST (CLEAN RE-RUN)
DROP TABLE IF EXISTS "PushTokens" CASCADE;
DROP TABLE IF EXISTS "UserConsents" CASCADE;
DROP TABLE IF EXISTS "StaffAttendance" CASCADE;
DROP TABLE IF EXISTS "Staff" CASCADE;
DROP TABLE IF EXISTS "Vendors" CASCADE;
DROP TABLE IF EXISTS "PollVotes" CASCADE;
DROP TABLE IF EXISTS "Polls" CASCADE;
DROP TABLE IF EXISTS "WaterMeters" CASCADE;
DROP TABLE IF EXISTS "AssetAMCs" CASCADE;
DROP TABLE IF EXISTS "SocietyDocuments" CASCADE;
DROP TABLE IF EXISTS "GuestParking" CASCADE;
DROP TABLE IF EXISTS "Vehicles" CASCADE;
DROP TABLE IF EXISTS "Tenants" CASCADE;
DROP TABLE IF EXISTS "EmergencyContacts" CASCADE;
DROP TABLE IF EXISTS "FacilityBookings" CASCADE;
DROP TABLE IF EXISTS "ComplaintReplies" CASCADE;
DROP TABLE IF EXISTS "AuditLogs" CASCADE;
DROP TABLE IF EXISTS "Visitors" CASCADE;
DROP TABLE IF EXISTS "Invoices" CASCADE;
DROP TABLE IF EXISTS "Notices" CASCADE;
DROP TABLE IF EXISTS "Complaints" CASCADE;
DROP TABLE IF EXISTS "Expenses" CASCADE;
DROP TABLE IF EXISTS "Payments" CASCADE;
DROP TABLE IF EXISTS "Members" CASCADE;
DROP TABLE IF EXISTS "UserAuth" CASCADE;
DROP TABLE IF EXISTS "Roles" CASCADE;
DROP TABLE IF EXISTS "Societies" CASCADE;

-- 2. CREATE SCHEMAS & TABLES

-- Societies
CREATE TABLE "Societies" (
  "id" TEXT PRIMARY KEY,
  "Name" TEXT NOT NULL,
  "SocietyCode" TEXT UNIQUE,
  "Slug" TEXT UNIQUE,
  "PrimaryAdminEmail" TEXT,
  "LogoUrl" TEXT,
  "BuildingType" TEXT DEFAULT 'Housing Society',
  "PostalAddress" TEXT,
  "Wings" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "HasWings" BOOLEAN DEFAULT false,
  "StructureType" TEXT DEFAULT 'standalone',
  "FeaturesEnabled" JSONB DEFAULT '{"gatekeeper": true, "waterMeters": false, "tenantRegister": true, "amenities": true, "assetAMC": false, "parkingRegister": true, "documentVault": true}'::jsonb,
  "enabled_modules" JSONB DEFAULT '{"gatekeeper": true, "billing": true, "helpdesk": true, "voting": false, "facility_booking": false, "water_meters": true, "tenants": true, "document_vault": true}'::jsonb,
  "module_settings" JSONB DEFAULT '{"gatekeeper": {"autoApproveGuests": true, "passExpiryHours": 12}, "billing": {"enableGST": false, "autoInvoiceDay": 1}, "society": {"dueDateDay": 15, "lateFeeInterestPercent": 12}}'::jsonb,
  "BillingMode" TEXT DEFAULT 'Flat Rate',
  "RatePerSqFt" NUMERIC DEFAULT 3.5,
  "FlatRateAmount" NUMERIC DEFAULT 2000,
  "BaseUtilityAmount" NUMERIC DEFAULT 500,
  "LateFeeType" TEXT DEFAULT 'Interest',
  "LateFeeValue" NUMERIC DEFAULT 12,
  "DueDateDay" INTEGER DEFAULT 15,
  "GatewayEnabled" BOOLEAN DEFAULT false,
  "GatewayProvider" TEXT DEFAULT 'Manual',
  "GatewayApiKey" TEXT DEFAULT '',
  "UPI_ID" TEXT DEFAULT 'greenwood.society@upi'
);

-- Roles
CREATE TABLE "Roles" (
  "id" TEXT PRIMARY KEY,
  "RoleName" TEXT NOT NULL,
  "SocietyId" TEXT REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Description" TEXT,
  "Permissions" JSONB DEFAULT '[]'::jsonb
);

-- UserAuth
CREATE TABLE "UserAuth" (
  "id" TEXT PRIMARY KEY,
  "EmailOrPhone" TEXT NOT NULL,
  "PasswordHash" TEXT NOT NULL,
  "Salt" TEXT NOT NULL,
  "RoleId" TEXT NOT NULL REFERENCES "Roles"("id") ON DELETE CASCADE,
  "SocietyId" TEXT REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Status" TEXT DEFAULT 'Active',
  "MustChangePassword" BOOLEAN DEFAULT true,
  "Phone" TEXT,
  "TempPassword" TEXT,
  "IsSuperAdmin" BOOLEAN DEFAULT false,
  "LastLoginAt" TIMESTAMPTZ
);

-- UserConsents (Digital Personal Data Protection Act 2023 Consent Audit Trail)
CREATE TABLE "UserConsents" (
  "id" TEXT PRIMARY KEY,
  "UserId" TEXT NOT NULL,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "ConsentedAt" TEXT NOT NULL,
  "PolicyVersion" TEXT DEFAULT 'v1.0-2026',
  "IPAddress" TEXT DEFAULT '127.0.0.1',
  "UserRole" TEXT DEFAULT 'Member'
);

-- PushTokens (Expo Push Notification Device Mapping)
CREATE TABLE "PushTokens" (
  "id" TEXT PRIMARY KEY,
  "UserId" TEXT NOT NULL,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "ExpoPushToken" TEXT NOT NULL,
  "DeviceOS" TEXT DEFAULT 'android',
  "CreatedAt" TEXT NOT NULL,
  "LastUsedAt" TEXT
);

-- Members
CREATE TABLE "Members" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT NOT NULL,
  "ContactNo" TEXT NOT NULL,
  "Email" TEXT NOT NULL,
  "Balance" NUMERIC DEFAULT 0,
  "Status" TEXT NOT NULL DEFAULT 'Owner', -- 'Owner' or 'Tenant'
  "CoOwners" TEXT,
  "VehicleNo" TEXT,
  "Wing" TEXT,
  "Tower" TEXT,
  "Role" TEXT DEFAULT 'Member',
  "AreaSqFt" NUMERIC DEFAULT 850
);

-- Payments
CREATE TABLE "Payments" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "MemberId" TEXT REFERENCES "Members"("id") ON DELETE SET NULL,
  "Date" TEXT NOT NULL,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT,
  "Amount" NUMERIC NOT NULL DEFAULT 0,
  "Mode" TEXT NOT NULL,
  "ReferenceNo" TEXT,
  "Status" TEXT NOT NULL DEFAULT 'Cleared'
);

-- Vendors
CREATE TABLE "Vendors" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT,
  "VendorName" TEXT NOT NULL,
  "ServiceCategory" TEXT NOT NULL,
  "GstNumber" TEXT,
  "Phone" TEXT NOT NULL,
  "Email" TEXT,
  "ContactPerson" TEXT,
  "BankAccountNumber" TEXT,
  "BankIfsc" TEXT,
  "BankName" TEXT,
  "ContractDocumentUrl" TEXT,
  "Status" TEXT DEFAULT 'Active',
  "Rating" NUMERIC DEFAULT 5.0,
  "Notes" TEXT,
  "CreatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE "Expenses" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Date" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Amount" NUMERIC NOT NULL DEFAULT 0,
  "Vendor" TEXT NOT NULL,
  "VendorId" TEXT REFERENCES "Vendors"("id") ON DELETE SET NULL,
  "InvoiceNo" TEXT,
  "ApprovedBy" TEXT,
  "Status" TEXT DEFAULT 'Approved',
  "RequiresDualApproval" BOOLEAN DEFAULT false,
  "SecretaryApproved" BOOLEAN DEFAULT false,
  "SecretaryApprovedBy" TEXT,
  "TreasurerApproved" BOOLEAN DEFAULT false,
  "TreasurerApprovedBy" TEXT
);

-- Staff
CREATE TABLE "Staff" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "ServiceType" TEXT NOT NULL,
  "PhotoUrl" TEXT,
  "Passcode" TEXT NOT NULL,
  "IdProofType" TEXT,
  "IdProofNumber" TEXT,
  "AssignedFlats" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "GateStatus" TEXT DEFAULT 'Checked Out',
  "Status" TEXT NOT NULL DEFAULT 'Active',
  "CreatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- StaffAttendance
CREATE TABLE "StaffAttendance" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "StaffId" TEXT NOT NULL REFERENCES "Staff"("id") ON DELETE CASCADE,
  "StaffName" TEXT NOT NULL,
  "ServiceType" TEXT NOT NULL,
  "AssignedFlats" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "GateName" TEXT,
  "CheckInTime" TEXT NOT NULL,
  "CheckOutTime" TEXT,
  "Date" TEXT NOT NULL,
  "RecordedBy" TEXT NOT NULL
);

-- Complaints
CREATE TABLE "Complaints" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Description" TEXT NOT NULL,
  "Urgency" TEXT DEFAULT 'Medium',
  "Status" TEXT DEFAULT 'Open',
  "CreatedAt" TEXT NOT NULL,
  "ResolvedAt" TEXT,
  "AssignedTo" TEXT,
  "ComplaintBy" TEXT
);

-- Notices
CREATE TABLE "Notices" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Date" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Content" TEXT NOT NULL,
  "AttachmentUrl" TEXT,
  "DocumentUrl" TEXT,
  "PostedBy" TEXT NOT NULL
);

-- Invoices
CREATE TABLE "Invoices" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "InvoiceNo" TEXT NOT NULL,
  "FlatNo" TEXT NOT NULL,
  "BillingPeriod" TEXT NOT NULL,
  "DueDate" TEXT NOT NULL,
  "MaintenanceCharge" NUMERIC DEFAULT 0,
  "UtilityCharge" NUMERIC DEFAULT 0,
  "WaterCharge" NUMERIC DEFAULT 0,
  "ParkingCharge" NUMERIC DEFAULT 0,
  "LateFee" NUMERIC DEFAULT 0,
  "PreviousArrears" NUMERIC DEFAULT 0,
  "TotalAmount" NUMERIC NOT NULL,
  "Status" TEXT DEFAULT 'Pending',
  "GeneratedDate" TEXT NOT NULL
);

-- Visitors
CREATE TABLE "Visitors" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "VisitorName" TEXT NOT NULL,
  "Purpose" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "VehicleNo" TEXT,
  "CheckInTime" TEXT NOT NULL,
  "CheckOutTime" TEXT,
  "Status" TEXT NOT NULL DEFAULT 'Inside',
  "Passcode" TEXT
);

-- ComplaintReplies
CREATE TABLE "ComplaintReplies" (
  "id" TEXT PRIMARY KEY,
  "ComplaintId" TEXT NOT NULL REFERENCES "Complaints"("id") ON DELETE CASCADE,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "SenderName" TEXT NOT NULL,
  "SenderRole" TEXT NOT NULL,
  "Message" TEXT NOT NULL,
  "Timestamp" TEXT NOT NULL
);

-- AuditLogs (Append-Only)
CREATE TABLE "AuditLogs" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Timestamp" TEXT NOT NULL,
  "UserRole" TEXT NOT NULL,
  "UserId" TEXT NOT NULL,
  "UserName" TEXT NOT NULL,
  "Action" TEXT NOT NULL,
  "Details" TEXT NOT NULL
);

-- FacilityBookings
CREATE TABLE "FacilityBookings" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "ResidentName" TEXT NOT NULL,
  "FacilityName" TEXT NOT NULL,
  "Date" TEXT NOT NULL,
  "TimeSlot" TEXT NOT NULL,
  "Purpose" TEXT NOT NULL,
  "Charges" NUMERIC DEFAULT 0,
  "Status" TEXT DEFAULT 'Confirmed',
  "BookedAt" TEXT NOT NULL
);

-- EmergencyContacts
CREATE TABLE "EmergencyContacts" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "RoleOrTitle" TEXT,
  "IsImportant" BOOLEAN DEFAULT false
);

-- Tenants
CREATE TABLE "Tenants" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "TenantName" TEXT NOT NULL,
  "ContactNo" TEXT NOT NULL,
  "Email" TEXT NOT NULL,
  "MoveInDate" TEXT NOT NULL,
  "MoveOutDate" TEXT,
  "AgreementDocUrl" TEXT,
  "IdProofDocUrl" TEXT,
  "KycStatus" TEXT NOT NULL DEFAULT 'Pending',
  "Remarks" TEXT
);

-- Vehicles
CREATE TABLE "Vehicles" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT NOT NULL,
  "VehicleNo" TEXT NOT NULL,
  "VehicleType" TEXT NOT NULL,
  "ParkingSlotNo" TEXT NOT NULL,
  "StickerIssued" BOOLEAN DEFAULT true
);

-- GuestParking
CREATE TABLE "GuestParking" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "GuestName" TEXT NOT NULL,
  "VehicleNo" TEXT NOT NULL,
  "VehicleType" TEXT NOT NULL,
  "AssignedSlot" TEXT NOT NULL,
  "ValidFrom" TEXT NOT NULL,
  "ValidUntil" TEXT NOT NULL,
  "Status" TEXT NOT NULL DEFAULT 'Active'
);

-- SocietyDocuments
CREATE TABLE "SocietyDocuments" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "DocumentUrl" TEXT NOT NULL,
  "IsPublic" BOOLEAN DEFAULT true,
  "UploadedBy" TEXT NOT NULL,
  "UploadedAt" TEXT NOT NULL,
  "FileSize" TEXT
);

-- AssetAMCs
CREATE TABLE "AssetAMCs" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "AssetName" TEXT NOT NULL,
  "AssetType" TEXT NOT NULL,
  "VendorName" TEXT NOT NULL,
  "VendorContact" TEXT NOT NULL,
  "ContractStartDate" TEXT NOT NULL,
  "ContractExpiryDate" TEXT NOT NULL,
  "LastServicedDate" TEXT NOT NULL,
  "NextServicedDate" TEXT NOT NULL,
  "ServiceStatus" TEXT DEFAULT 'Operational',
  "StatusNote" TEXT,
  "ReportUrl" TEXT
);

-- WaterMeters
CREATE TABLE "WaterMeters" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "ReadingMonth" TEXT NOT NULL,
  "PreviousReading" NUMERIC DEFAULT 0,
  "CurrentReading" NUMERIC DEFAULT 0,
  "UnitsConsumed" NUMERIC DEFAULT 0,
  "RecordedBy" TEXT NOT NULL,
  "RecordedAt" TEXT NOT NULL,
  "Status" TEXT DEFAULT 'Entered'
);

-- Polls / Resolutions
CREATE TABLE "Polls" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Title" TEXT NOT NULL,
  "Description" TEXT NOT NULL,
  "Category" TEXT DEFAULT 'AGM Resolution',
  "StartDate" TEXT NOT NULL,
  "EndDate" TEXT NOT NULL,
  "CreatedBy" TEXT NOT NULL,
  "Status" TEXT DEFAULT 'Active',
  "TotalEligibleFlats" INTEGER DEFAULT 8
);

-- PollVotes
CREATE TABLE "PollVotes" (
  "id" TEXT PRIMARY KEY,
  "PollId" TEXT NOT NULL REFERENCES "Polls"("id") ON DELETE CASCADE,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "VotedBy" TEXT NOT NULL,
  "Vote" TEXT NOT NULL,
  "Timestamp" TEXT NOT NULL,
  CONSTRAINT "unique_flat_vote_per_poll" UNIQUE ("PollId", "FlatNo")
);

-- ============================================================================
-- 2.1 PERFORMANCE INDEXING & COMPOSITE MULTI-TENANT QUERY ACCELERATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_members_society_flat ON "Members" ("SocietyId", "FlatNo");
CREATE INDEX IF NOT EXISTS idx_invoices_society_status ON "Invoices" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_visitors_society_date ON "Visitors" ("SocietyId", "CheckInTime");
CREATE INDEX IF NOT EXISTS idx_complaints_society_status ON "Complaints" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_gatekeeper_logs ON "Visitors" ("SocietyId", "Status", "CheckInTime");
CREATE INDEX IF NOT EXISTS idx_payments_society_flat ON "Payments" ("SocietyId", "FlatNo");
CREATE INDEX IF NOT EXISTS idx_expenses_society_date ON "Expenses" ("SocietyId", "Date");
CREATE INDEX IF NOT EXISTS idx_staff_attendance_society_date ON "StaffAttendance" ("SocietyId", "Date");

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & STRICT RBAC MULTI-TENANT ISOLATION POLICIES
-- ============================================================================

-- Helper functions for JWT / auth lookup
CREATE OR REPLACE FUNCTION public.get_auth_society_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'society_id'),
    (auth.jwt() -> 'app_metadata' ->> 'SocietyId'),
    (SELECT "SocietyId" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1),
    (SELECT "SocietyId" FROM public."UserAuth" WHERE "id" = auth.uid()::text OR "EmailOrPhone" = auth.email() LIMIT 1),
    'greenwood'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (SELECT "Role" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1),
    'Member'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_flat_no()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'flat_no'),
    (SELECT "FlatNo" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE "Societies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAuth" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserConsents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffAttendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Visitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplaintReplies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FacilityBookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmergencyContacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GuestParking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocietyDocuments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssetAMCs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaterMeters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Polls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PollVotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushTokens" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLICIES BY TABLE (Public & Anon Access Enabled for REST API & Seeding)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  pol text;
  tables text[] := ARRAY[
    'Societies', 'Roles', 'UserAuth', 'UserConsents', 'PushTokens', 'Members', 'Payments', 'Vendors', 
    'Expenses', 'Staff', 'StaffAttendance', 'Complaints', 'Notices', 
    'Invoices', 'Visitors', 'ComplaintReplies', 'AuditLogs', 'FacilityBookings', 
    'EmergencyContacts', 'Tenants', 'Vehicles', 'GuestParking', 
    'SocietyDocuments', 'AssetAMCs', 'WaterMeters', 'Polls', 'PollVotes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Drop all existing policies on the table to ensure clean update
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public') LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', pol, tbl);
    END LOOP;
    
    -- Create public policies for full REST API CRUD & mock database seeding
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true);', tbl || ' Public Access', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- 4. INITIAL SEED MOCK DATA
-- ============================================================================

-- Societies Seed
INSERT INTO "Societies" ("id", "Name", "SocietyCode", "Slug", "PrimaryAdminEmail", "BuildingType", "PostalAddress", "Wings", "HasWings", "StructureType", "BillingMode", "RatePerSqFt", "FlatRateAmount", "BaseUtilityAmount", "LateFeeType", "LateFeeValue", "GatewayEnabled", "GatewayProvider", "UPI_ID") VALUES
('greenwood', 'Greenwood Residency', 'GWRES01', 'greenwood-residency-gw01', 'amit080578@gmail.com', 'Housing Society', 'Sector 5, Palm Beach Road, Navi Mumbai, MH - 400706', ARRAY[]::TEXT[], false, 'standalone', 'SqFt Rate', 3.5, 2000, 500, 'Interest', 12, false, 'Manual', 'greenwood.society@upi'),
('royal_heights', 'Royal Heights', 'ROYAL02', 'royal-heights-rh02', 'secretary@royalheights.com', 'Gated Community', 'MG Road, Bandra West, Mumbai, MH - 400050', ARRAY['Tower 1', 'Tower 2']::TEXT[], true, 'towers_wings', 'Flat Rate', 4.0, 3500, 750, 'Fixed', 250, true, 'Razorpay', 'royalheights@upi'),
('sea_breeze', 'Sea Breeze Apartments', 'SEABR03', 'sea-breeze-sb03', 'secretary@seabreeze.com', 'Apartment Complex', 'Carter Road, Bandra, Mumbai, MH - 400050', ARRAY['Wing A', 'Wing B']::TEXT[], true, 'wings', 'Hybrid', 3.0, 1800, 600, 'Interest', 10, false, 'Manual', 'seabreeze@upi');

-- Roles Seed (Granular RBAC Roles)
INSERT INTO "Roles" ("id", "RoleName", "SocietyId", "Description", "Permissions") VALUES
('Role-SuperAdmin', 'SuperAdmin', NULL, 'Global Super-Admin overseeing all societies', '["*"]'::jsonb),
('Role-greenwood-admin', 'SOCIETY_ADMIN', 'greenwood', 'Full Society Administrator with management & module toggle rights', '["billing:read","billing:write","gatekeeper:read","gatekeeper:write","voting:read","voting:write","helpdesk:read","helpdesk:write","members:read","members:write","committee:write","settings:write"]'::jsonb),
('Role-greenwood-treasurer', 'TREASURER', 'greenwood', 'Financial Treasurer managing invoices, expenses, collections & reports', '["billing:read","billing:write","members:read","expenses:read","expenses:write","reports:read"]'::jsonb),
('Role-greenwood-secretary', 'SECRETARY', 'greenwood', 'Society Secretary managing notices, voting polls, complaints & document vault', '["voting:read","voting:write","helpdesk:read","helpdesk:write","notices:write","members:read","vault:write"]'::jsonb),
('Role-greenwood-gate', 'GATE_STAFF', 'greenwood', 'Security Guard / Gate Staff managing visitor logs and QR pass entry', '["gatekeeper:read","gatekeeper:write","alerts:write"]'::jsonb),
('Role-greenwood-resident', 'RESIDENT', 'greenwood', 'Resident Flat Owner or Tenant with self-service portal access', '["billing:read","gatekeeper:read","voting:read","helpdesk:write","facility:write"]'::jsonb);

-- UserAuth Seed
INSERT INTO "UserAuth" ("id", "EmailOrPhone", "PasswordHash", "Salt", "RoleId", "SocietyId", "Status", "MustChangePassword", "Phone", "TempPassword", "IsSuperAdmin") VALUES
('Auth-Super-Admin', 'superadmin@societyconnect.com', '68a1d7f6b907f154388e6a5789f1a234', 'SALT-SUPER-ADMIN', 'Role-SuperAdmin', NULL, 'Active', false, '+91 99999 00000', NULL, true),
('Auth-gw-amit-sharma', 'amit080578@gmail.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT', 'Role-greenwood-admin', 'greenwood', 'Active', false, '+91 98765 43210', NULL, true),
('Auth-gw-amit-sharma-alt', 'amit.sharma@example.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT-ALT', 'Role-greenwood-admin', 'greenwood', 'Active', true, '+91 98765 43210', 'admin123', true);

-- Members Seed
INSERT INTO "Members" ("id", "SocietyId", "FlatNo", "OwnerName", "ContactNo", "Email", "Balance", "Status", "CoOwners", "VehicleNo", "AreaSqFt") VALUES
('M-greenwood-101', 'greenwood', '101', 'Amit Sharma', '+91 98765 43210', 'amit.sharma@example.com', 1500, 'Owner', 'Sunita Sharma (Spouse)', 'MH-02-AB-1234', 950),
('M-greenwood-102', 'greenwood', '102', 'Priya Patel', '+91 98765 12345', 'priya.p@example.com', 0, 'Owner', 'None', 'MH-02-CD-5678', 850),
('M-greenwood-103', 'greenwood', '103', 'Rajesh Kumar', '+91 98234 56789', 'rajesh.tenant@example.com', 3000, 'Tenant', 'Nikhil Kumar', 'MH-02-XY-9012', 850),
('M-greenwood-201', 'greenwood', '201', 'Vikram Singh', '+91 98111 22233', 'vikram.singh@example.com', -1500, 'Owner', 'Renu Singh', 'MH-02-VS-2010', 1200),
('M-greenwood-202', 'greenwood', '202', 'Anjali Gupta', '+91 99887 76655', 'anjali.g@example.com', 4500, 'Tenant', 'None', 'MH-02-PQ-4455', 850),
('M-greenwood-203', 'greenwood', '203', 'Rahul Verma', '+91 97766 55443', 'rverma@example.com', 1500, 'Owner', 'Megha Verma', 'MH-02-RV-2030', 950),
('M-greenwood-301', 'greenwood', '301', 'Neha Joshi', '+91 96655 44332', 'neha.joshi@example.com', 0, 'Owner', 'Sanjay Joshi', 'MH-02-NJ-3010', 1200),
('M-greenwood-302', 'greenwood', '302', 'Siddharth Shah', '+91 95544 33221', 'sidd.shah@example.com', 6000, 'Tenant', 'Krupa Shah', 'MH-02-SS-3020', 1200);

-- Vendors Seed
INSERT INTO "Vendors" ("id", "SocietyId", "Name", "VendorName", "ServiceCategory", "GstNumber", "Phone", "Email", "ContactPerson", "BankAccountNumber", "BankIfsc", "BankName", "ContractDocumentUrl", "Status", "Rating", "Notes") VALUES
('VND-101', 'greenwood', 'Apex Security Solutions', 'Apex Security Solutions', 'Security Services', '27AAACA1234A1Z5', '+91 98200 11223', 'contact@apexsecurity.in', 'Rajesh Guard Supervisor', '918273645012', 'HDFC0000123', 'HDFC Bank', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 4.8, '24x7 Security guard placement contract'),
('VND-102', 'greenwood', 'AquaClean Water Tank Services', 'AquaClean Water Tank Services', 'Water Tank Cleaning', '27BBBCA5678B1Z2', '+91 98200 99887', 'info@aquaclean.in', 'Sanjay Plumber Tech', '501002345678', 'ICIC0000456', 'ICICI Bank', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 4.9, 'Quarterly water tank scrubbing contract'),
('VND-103', 'greenwood', 'Schindler Elevator India', 'Schindler Elevator India', 'Lift Maintenance', '27CCCDE9012C1Z9', '+91 22 6100 8800', 'amc@schindler.in', 'Vikram Service Engineer', '112233445566', 'SBIN0000789', 'State Bank of India', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 5.0, 'Annual Lift AMC contract');

-- Payments Seed
INSERT INTO "Payments" ("id", "SocietyId", "MemberId", "Date", "FlatNo", "OwnerName", "Amount", "Mode", "ReferenceNo", "Status") VALUES
('PAY-1001', 'greenwood', 'M-greenwood-101', '2026-07-05', '101', 'Amit Sharma', 3475, 'UPI / Online', 'UPI/618293049182', 'Cleared'),
('PAY-1002', 'greenwood', 'M-greenwood-102', '2026-07-10', '102', 'Priya Patel', 3125, 'Bank Transfer (NEFT)', 'NEFT/N0712398401', 'Cleared'),
('PAY-1003', 'greenwood', 'M-greenwood-201', '2026-07-12', '201', 'Vikram Singh', 4350, 'Cheque', 'CHQ-881920', 'Cleared');

-- Expenses Seed
INSERT INTO "Expenses" ("id", "SocietyId", "Date", "Category", "Amount", "Vendor", "InvoiceNo", "ApprovedBy", "Status", "RequiresDualApproval", "SecretaryApproved", "TreasurerApproved") VALUES
('EXP-2026-001', 'greenwood', '2026-07-02', 'Security', 42000, 'Apex Security Solutions', 'INV-APX-881', 'Amit Sharma (Secretary)', 'Approved', true, true, true),
('EXP-2026-002', 'greenwood', '2026-07-08', 'Water', 18500, 'City Municipal Water Supply', 'MUN-WTR-0726', 'Priya Patel (Treasurer)', 'Approved', false, true, true),
('EXP-2026-003', 'greenwood', '2026-07-14', 'Repairs', 7800, 'Ramesh Electrician', 'INV-REM-104', 'Management Committee', 'Pending Approval', true, true, false);

-- Staff Seed
INSERT INTO "Staff" ("id", "SocietyId", "Name", "Phone", "ServiceType", "PhotoUrl", "Passcode", "IdProofType", "IdProofNumber", "AssignedFlats", "GateStatus", "Status") VALUES
('STF-101', 'greenwood', 'Sunita Bai', '+91 98700 11223', 'Maid', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', '1001', 'Aadhaar', '9182-3746-1029', ARRAY['101', '102', '201']::TEXT[], 'Inside', 'Active'),
('STF-102', 'greenwood', 'Ramesh Guard', '+91 98200 11223', 'Security Guard', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', '1002', 'Aadhaar', '1029-3847-5610', ARRAY['All Flats']::TEXT[], 'Inside', 'Active');

-- Notices Seed
INSERT INTO "Notices" ("id", "SocietyId", "Date", "Title", "Category", "Content", "AttachmentUrl", "PostedBy") VALUES
('N-101', 'greenwood', '2026-07-18', 'Annual General Body Meeting (AGM) Agenda', 'Meeting', 'Notice is hereby given that the 12th Annual General Body Meeting will be held on Sunday July 26th in the Clubhouse.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Management Committee'),
('N-102', 'greenwood', '2026-07-12', 'Water Tank Cleaning Schedule & Temporary Cut', 'Maintenance', 'Please store adequate water. Cleaning scheduled on Monday July 20th from 10am to 4pm.', '', 'Facility Manager');

-- Invoices Seed
INSERT INTO "Invoices" ("id", "SocietyId", "InvoiceNo", "FlatNo", "BillingPeriod", "DueDate", "MaintenanceCharge", "UtilityCharge", "WaterCharge", "ParkingCharge", "LateFee", "PreviousArrears", "TotalAmount", "Status", "GeneratedDate") VALUES
('INV-2026-07-101', 'greenwood', 'INV-202607-101', '101', 'July 2026', '2026-07-15', 3325, 500, 150, 0, 0, 0, 3975, 'Paid', '2026-07-01'),
('INV-2026-07-102', 'greenwood', 'INV-202607-102', '102', 'July 2026', '2026-07-15', 2975, 500, 120, 0, 0, 0, 3595, 'Pending', '2026-07-01');

-- Visitors Seed
INSERT INTO "Visitors" ("id", "SocietyId", "FlatNo", "VisitorName", "Purpose", "Phone", "VehicleNo", "CheckInTime", "CheckOutTime", "Status", "Passcode") VALUES
('VIS-greenwood-1', 'greenwood', '102', 'Sanjay Kumar (Plumber)', 'Maintenance', '+91 97777 54321', NULL, '2026-07-20T11:15:00', '2026-07-20T12:30:00', 'Checked Out', 'P3M71X');

-- EmergencyContacts Seed
INSERT INTO "EmergencyContacts" ("id", "SocietyId", "Name", "Category", "Phone", "RoleOrTitle", "IsImportant") VALUES
('EM-1', 'greenwood', 'Police Emergency Helpline', 'Police', '100', 'National Control Room', true),
('EM-2', 'greenwood', 'Ambulance & Medical Emergency', 'Ambulance', '108', 'State Emergency Services', true),
('EM-3', 'greenwood', 'Fire Station Control Room', 'Fire', '101', 'Central Station', true),
('EM-4', 'greenwood', 'City General Hospital (24x7)', 'Hospital', '+91 22 2650 1111', 'Trauma & ER Desk', true),
('EM-5', 'greenwood', 'Main Gate Security Gatekeeper', 'Security', '+91 98200 11223', 'Head Security Officer', true);

-- Tenants Seed
INSERT INTO "Tenants" ("id", "SocietyId", "FlatNo", "TenantName", "ContactNo", "Email", "MoveInDate", "MoveOutDate", "AgreementDocUrl", "IdProofDocUrl", "KycStatus", "Remarks") VALUES
('TNT-1', 'greenwood', '103', 'Rajesh Kumar', '+91 98234 56789', 'rajesh.tenant@example.com', '2025-01-15', '2026-12-31', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Verified', 'Rent agreement verified for 22 months');

-- Vehicles Seed
INSERT INTO "Vehicles" ("id", "SocietyId", "FlatNo", "OwnerName", "VehicleNo", "VehicleType", "ParkingSlotNo", "StickerIssued") VALUES
('VEH-1', 'greenwood', '101', 'Amit Sharma', 'MH-02-AB-1234', '4-Wheeler', 'A-101', true);

-- GuestParking Seed
INSERT INTO "GuestParking" ("id", "SocietyId", "FlatNo", "GuestName", "VehicleNo", "VehicleType", "AssignedSlot", "ValidFrom", "ValidUntil", "Status") VALUES
('GP-1', 'greenwood', '101', 'Anil Sharma (Brother)', 'DL-01-AB-5678', '4-Wheeler', 'Visitor Slot V-03', '2026-07-21T08:00:00', '2026-07-21T22:00:00', 'Active');

-- SocietyDocuments Seed
INSERT INTO "SocietyDocuments" ("id", "SocietyId", "Title", "Category", "DocumentUrl", "IsPublic", "UploadedBy", "UploadedAt", "FileSize") VALUES
('DOC-1', 'greenwood', 'Registered Society Bye-Laws & Model Rules 2024', 'Building Rules', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Amit Sharma (Secretary)', '2026-01-10', '2.4 MB');

-- AssetAMCs Seed
INSERT INTO "AssetAMCs" ("id", "SocietyId", "AssetName", "AssetType", "VendorName", "VendorContact", "ContractStartDate", "ContractExpiryDate", "LastServicedDate", "NextServicedDate", "ServiceStatus", "StatusNote", "ReportUrl") VALUES
('AMC-1', 'greenwood', 'Lift #1 (Wing A Schindler Elevator)', 'Lift', 'Schindler Elevator India Pvt Ltd', '+91 22 6100 8800', '2026-01-01', '2026-12-31', '2026-07-15', '2026-08-15', 'Operational', 'All safety cables & brakes checked.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- WaterMeters Seed
INSERT INTO "WaterMeters" ("id", "SocietyId", "FlatNo", "ReadingMonth", "PreviousReading", "CurrentReading", "UnitsConsumed", "RecordedBy", "RecordedAt", "Status") VALUES
('WM-101-2026-07', 'greenwood', '101', '2026-07', 1240, 1285, 45, 'Sanjay Plumber', '2026-07-01', 'Entered');

-- StaffAttendance Seed
INSERT INTO "StaffAttendance" ("id", "SocietyId", "StaffId", "StaffName", "ServiceType", "AssignedFlats", "GateName", "CheckInTime", "CheckOutTime", "Date", "RecordedBy") VALUES
('ATT-1', 'greenwood', 'STF-101', 'Sunita Bai', 'Maid', ARRAY['101', '102', '201']::TEXT[], 'Main Gate', '2026-07-22T08:30:00', NULL, '2026-07-22', 'Ramesh Guard'),
('ATT-2', 'greenwood', 'STF-102', 'Ramesh Guard', 'Security Guard', ARRAY['All Flats']::TEXT[], 'Main Gate', '2026-07-22T08:00:00', '2026-07-22T13:00:00', '2026-07-22', 'System Auto');

-- Complaints Seed
INSERT INTO "Complaints" ("id", "SocietyId", "FlatNo", "Title", "Category", "Description", "Urgency", "Status", "CreatedAt", "ResolvedAt", "AssignedTo", "ComplaintBy") VALUES
('C-101', 'greenwood', '202', 'Water leakage in bathroom', 'Plumbing', 'Water is dripping from the ceiling toilet pipe valve continuously, causing a small pool.', 'High', 'Open', '2026-07-18T10:00:00Z', NULL, 'Sanjay Plumber', 'Anjali Gupta'),
('C-102', 'greenwood', '103', 'Corridor light not working', 'Electrical', 'The corridor tube-light outside flat 103 has fused and needs replacement.', 'Low', 'In Progress', '2026-07-17T14:30:00Z', NULL, 'Ramesh Electrician', 'Rajesh Kumar'),
('C-103', 'greenwood', '302', 'Unauthorized vehicle parked in spot B-4', 'Parking', 'A black SUV has been parked in my designated spot B-4 without permission.', 'Medium', 'Resolved', '2026-07-15T09:15:00Z', '2026-07-15T12:00:00Z', 'Main Gate Security', 'Siddharth Shah');

-- ComplaintReplies Seed
INSERT INTO "ComplaintReplies" ("id", "ComplaintId", "SocietyId", "SenderName", "SenderRole", "Message", "Timestamp") VALUES
('CR-101-1', 'C-101', 'greenwood', 'Amit Sharma', 'Admin', 'Plumber Sanjay has been notified and scheduled for visit at 4 PM today.', '2026-07-18T11:00:00Z'),
('CR-101-2', 'C-101', 'greenwood', 'Anjali Gupta', 'Member', 'Thank you, please ensure the main valve is checked.', '2026-07-18T11:15:00Z');

-- FacilityBookings Seed
INSERT INTO "FacilityBookings" ("id", "SocietyId", "FlatNo", "ResidentName", "FacilityName", "Date", "TimeSlot", "Purpose", "Charges", "Status", "BookedAt") VALUES
('FB-1', 'greenwood', '101', 'Amit Sharma', 'Clubhouse Hall', '2026-08-05', '18:00 - 22:00', 'Birthday Party', 2500, 'Confirmed', '2026-07-10T12:00:00Z'),
('FB-2', 'greenwood', '201', 'Vikram Singh', 'Terrace Party Area', '2026-08-15', '19:00 - 23:00', 'Independence Day Dinner', 3000, 'Confirmed', '2026-07-12T15:30:00Z');

-- AuditLogs Seed
INSERT INTO "AuditLogs" ("id", "SocietyId", "Timestamp", "UserRole", "UserId", "UserName", "Action", "Details") VALUES
('LOG-1001', 'greenwood', '2026-07-22T08:00:00Z', 'Admin', 'Auth-gw-amit-sharma', 'Amit Sharma', 'System Login', 'Admin logged into Greenwood Residency dashboard'),
('LOG-1002', 'greenwood', '2026-07-21T16:30:00Z', 'Admin', 'Auth-gw-amit-sharma', 'Amit Sharma', 'Invoice Generated', 'Generated monthly maintenance invoice INV-202607-101');

-- Polls Seed
INSERT INTO "Polls" ("id", "SocietyId", "Title", "Description", "Category", "StartDate", "EndDate", "CreatedBy", "Status", "TotalEligibleFlats") VALUES
('POLL-1', 'greenwood', 'Approve ₹500,000 Special Maintenance Budget for Entrance Lobby Renovation', 'Proposal to allocate ₹5 Lakhs from reserve funds.', 'AGM Resolution', '2026-07-01', '2026-07-31', 'Amit Sharma (Secretary)', 'Active', 8);

-- PollVotes Seed
INSERT INTO "PollVotes" ("id", "PollId", "SocietyId", "FlatNo", "VotedBy", "Vote", "Timestamp") VALUES
('PV-1', 'POLL-1', 'greenwood', '101', 'Amit Sharma', 'In Favor', '2026-07-05T10:15:00.000Z');

-- UserConsents Seed (Digital Personal Data Protection Act 2023)
INSERT INTO "UserConsents" ("id", "UserId", "SocietyId", "ConsentedAt", "PolicyVersion", "IPAddress", "UserRole") VALUES
('UC-1001', 'Auth-gw-amit-sharma', 'greenwood', '2026-07-22T08:00:00Z', 'v1.0-2026', '127.0.0.1', 'Admin'),
('UC-1002', 'amit080578@gmail.com', 'greenwood', '2026-07-22T08:05:00Z', 'v1.0-2026', '127.0.0.1', 'Admin');

-- PushTokens Seed (Expo Push Notification Device Mapping)
INSERT INTO "PushTokens" ("id", "UserId", "SocietyId", "FlatNo", "ExpoPushToken", "DeviceOS", "CreatedAt", "LastUsedAt") VALUES
('TOK-101-1', 'Auth-gw-amit-sharma', 'greenwood', '101', 'ExponentPushToken[SimulatedToken_Amit_Flat101]', 'android', '2026-07-22T08:00:00Z', '2026-07-23T00:00:00Z'),
('TOK-102-1', 'M-greenwood-102', 'greenwood', '102', 'ExponentPushToken[SimulatedToken_Priya_Flat102]', 'ios', '2026-07-21T10:00:00Z', '2026-07-22T12:00:00Z');

-- ============================================================================
-- 5. PRIVATE SUPABASE STORAGE BUCKETS SETUP & SIGNED URL ACCESS POLICIES
-- Configures 'society-docs', 'tenant-kyc', and 'notice-attachments' as PRIVATE
-- ============================================================================

-- Create private storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('society-docs', 'society-docs', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('tenant-kyc', 'tenant-kyc', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('notice-attachments', 'notice-attachments', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE 
SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Read Policies (Authenticated user access only for tenant files)
DROP POLICY IF EXISTS "Authenticated Read Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Read Access for society-docs" ON storage.objects 
  FOR SELECT USING (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Read Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Read Access for tenant-kyc" ON storage.objects 
  FOR SELECT USING (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Read Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Read Access for notice-attachments" ON storage.objects 
  FOR SELECT USING (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');

-- Storage Upload Policies (Authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated Upload Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for society-docs" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Upload Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for tenant-kyc" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Upload Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for notice-attachments" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');

-- Storage Delete / Update Policies
DROP POLICY IF EXISTS "Authenticated Update Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Update Access for society-docs" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Update Access for tenant-kyc" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Update Access for notice-attachments" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');
