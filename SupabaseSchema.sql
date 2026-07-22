-- ============================================================================
-- HOUSING SOCIETY MANAGEMENT APPLICATION - SUPABASE POSTGRES SCHEMA (TIER 1 + TIER 2)
-- Complete DDL with CASCADE drops, RLS policies, and realistic seed data
-- ============================================================================

-- 1. DROP EXISTING TABLES IF THEY EXIST (CLEAN RE-RUN)
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
  "BuildingType" TEXT DEFAULT 'Housing Society',
  "PostalAddress" TEXT,
  "Wings" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "HasWings" BOOLEAN DEFAULT false,
  "StructureType" TEXT DEFAULT 'standalone',
  "FeaturesEnabled" JSONB DEFAULT '{"gatekeeper": true, "waterMeters": false, "tenantRegister": true, "amenities": true, "assetAMC": false, "parkingRegister": true, "documentVault": true}'::jsonb,
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
  "Description" TEXT
);

-- UserAuth
CREATE TABLE "UserAuth" (
  "id" TEXT PRIMARY KEY,
  "EmailOrPhone" TEXT NOT NULL,
  "PasswordHash" TEXT NOT NULL,
  "Salt" TEXT NOT NULL,
  "RoleId" TEXT NOT NULL REFERENCES "Roles"("id") ON DELETE CASCADE,
  "SocietyId" TEXT REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Status" TEXT DEFAULT 'Active'
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

-- Expenses
CREATE TABLE "Expenses" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Date" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Amount" NUMERIC NOT NULL DEFAULT 0,
  "Vendor" TEXT NOT NULL,
  "InvoiceNo" TEXT,
  "ApprovedBy" TEXT
);

-- Complaints
CREATE TABLE "Complaints" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "MemberId" TEXT REFERENCES "Members"("id") ON DELETE SET NULL,
  "FlatNo" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Description" TEXT NOT NULL,
  "Date" TEXT NOT NULL,
  "Status" TEXT NOT NULL DEFAULT 'Open',
  "Urgency" TEXT NOT NULL DEFAULT 'Medium'
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
  "AttachmentName" TEXT,
  "AttachmentSize" TEXT,
  "PostedBy" TEXT NOT NULL,
  "DocumentUrl" TEXT,
  "UploadedBy" TEXT
);

-- Invoices
CREATE TABLE "Invoices" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "BillMonth" TEXT NOT NULL,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT NOT NULL,
  "BaseAmount" NUMERIC DEFAULT 0,
  "WaterCharges" NUMERIC DEFAULT 0,
  "SecurityCharges" NUMERIC DEFAULT 0,
  "ParkingCharges" NUMERIC DEFAULT 0,
  "LateFeeCharges" NUMERIC DEFAULT 0,
  "TotalAmount" NUMERIC DEFAULT 0,
  "DueDate" TEXT NOT NULL,
  "Status" TEXT NOT NULL DEFAULT 'Unpaid',
  "IssuedDate" TEXT NOT NULL
);

-- Visitors
CREATE TABLE "Visitors" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "VisitorName" TEXT NOT NULL,
  "Purpose" TEXT NOT NULL,
  "ContactNo" TEXT NOT NULL,
  "VehicleNo" TEXT,
  "CheckInTime" TEXT NOT NULL,
  "CheckOutTime" TEXT,
  "Status" TEXT NOT NULL DEFAULT 'Pending Approval',
  "HostApprovedBy" TEXT,
  "AccessToken" TEXT,
  "TokenExpiresAt" TEXT
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

-- AuditLogs
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

-- EmergencyContacts (Tier 1)
CREATE TABLE "EmergencyContacts" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "RoleOrTitle" TEXT,
  "IsImportant" BOOLEAN DEFAULT false
);

-- Tenants (Tier 1)
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

-- Vehicles (Tier 1)
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

-- GuestParking (Tier 1)
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

-- SocietyDocuments (Tier 2)
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

-- AssetAMCs (Tier 2)
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

-- WaterMeters (Tier 2)
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
  "Vote" TEXT NOT NULL, -- 'In Favor', 'Against', 'Abstain'
  "Timestamp" TEXT NOT NULL,
  CONSTRAINT "unique_flat_vote_per_poll" UNIQUE ("PollId", "FlatNo")
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) WITH PUBLIC SANDBOX ACCESS POLICIES

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Sandbox Policy" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Public Sandbox Policy" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- 4. INITIAL SEED MOCK DATA

-- Societies Seed
INSERT INTO "Societies" ("id", "Name", "BuildingType", "PostalAddress", "Wings", "HasWings", "StructureType", "BillingMode", "RatePerSqFt", "FlatRateAmount", "BaseUtilityAmount", "LateFeeType", "LateFeeValue", "GatewayEnabled", "GatewayProvider", "UPI_ID") VALUES
('greenwood', 'Greenwood Residency', 'Housing Society', 'Sector 5, Palm Beach Road, Navi Mumbai, MH - 400706', ARRAY[]::TEXT[], false, 'standalone', 'SqFt Rate', 3.5, 2000, 500, 'Interest', 12, false, 'Manual', 'greenwood.society@upi'),
('royal_heights', 'Royal Heights', 'Gated Community', 'MG Road, Bandra West, Mumbai, MH - 400050', ARRAY['Tower 1', 'Tower 2']::TEXT[], true, 'towers_wings', 'Flat Rate', 4.0, 3500, 750, 'Fixed', 250, true, 'Razorpay', 'royalheights@upi'),
('sea_breeze', 'Sea Breeze Apartments', 'Apartment Complex', 'Carter Road, Bandra, Mumbai, MH - 400050', ARRAY['Wing A', 'Wing B']::TEXT[], true, 'wings', 'Hybrid', 3.0, 1800, 600, 'Interest', 10, false, 'Manual', 'seabreeze@upi');

-- Roles Seed
INSERT INTO "Roles" ("id", "RoleName", "SocietyId", "Description") VALUES
('Role-SuperAdmin', 'SuperAdmin', NULL, 'Global Super-Admin overseeing all societies'),
('Role-greenwood-admin', 'Admin', 'greenwood', 'Primary Admin Secretary for Greenwood Residency'),
('Role-greenwood-committee', 'Committee Member', 'greenwood', 'Elected Committee Member for Greenwood Residency'),
('Role-greenwood-member', 'Member', 'greenwood', 'Standard Flat Owner or Tenant');

-- UserAuth Seed
INSERT INTO "UserAuth" ("id", "EmailOrPhone", "PasswordHash", "Salt", "RoleId", "SocietyId", "Status") VALUES
('Auth-Super-Admin', 'superadmin@societyconnect.com', '68a1d7f6b907f154388e6a5789f1a234', 'SALT-SUPER-ADMIN', 'Role-SuperAdmin', NULL, 'Active'),
('Auth-gw-amit-sharma', 'amit080578@gmail.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT', 'Role-greenwood-admin', 'greenwood', 'Active'),
('Auth-gw-amit-sharma-alt', 'amit.sharma@example.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT-ALT', 'Role-greenwood-admin', 'greenwood', 'Active');

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

-- Payments Seed
INSERT INTO "Payments" ("id", "SocietyId", "MemberId", "Date", "FlatNo", "OwnerName", "Amount", "Mode", "ReferenceNo", "Status") VALUES
('P-greenwood-0', 'greenwood', 'M-greenwood-101', '2026-07-15', '101', 'Amit Sharma', 1500, 'UPI', 'UPI92837498112', 'Cleared'),
('P-greenwood-1', 'greenwood', 'M-greenwood-201', '2026-07-14', '201', 'Vikram Singh', 3000, 'Bank Transfer', 'NEFT-TXN12038910', 'Cleared'),
('P-greenwood-2', 'greenwood', 'M-greenwood-301', '2026-07-10', '301', 'Neha Joshi', 1500, 'UPI', 'UPI83748291038', 'Cleared');

-- Expenses Seed
INSERT INTO "Expenses" ("id", "SocietyId", "Date", "Category", "Amount", "Vendor", "InvoiceNo", "ApprovedBy") VALUES
('E-greenwood-0', 'greenwood', '2026-07-16', 'Security', 12000, 'Apex Guard Services', 'INV-2026-102', 'Society Committee'),
('E-greenwood-1', 'greenwood', '2026-07-14', 'Electricity', 4520, 'MSEDCL Electric', 'ELEC-JUL-9923', 'Secretary'),
('E-greenwood-2', 'greenwood', '2026-07-12', 'Water', 3200, 'AquaFlow Tankers', 'WT-4028', 'Treasurer');

-- Complaints Seed
INSERT INTO "Complaints" ("id", "SocietyId", "FlatNo", "Category", "Title", "Description", "Date", "Status", "Urgency") VALUES
('C-greenwood-0', 'greenwood', '2022', 'Plumbing', 'Water leakage in bathroom', 'Water is dripping from ceiling toilet valve.', '2026-07-18', 'Open', 'High'),
('C-greenwood-1', 'greenwood', '103', 'Electrical', 'Corridor light not working', 'The corridor tube-light outside 103 has fused.', '2026-07-17', 'In Progress', 'Low');

-- Notices Seed
INSERT INTO "Notices" ("id", "SocietyId", "Date", "Title", "Category", "Content", "AttachmentUrl", "PostedBy") VALUES
('N-greenwood-0', 'greenwood', '2026-07-18', 'Annual General Body Meeting (AGM) Agenda', 'Meeting', 'All members are requested to attend the AGM on Sunday, July 26th at 10:00 AM.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Management Committee'),
('N-greenwood-1', 'greenwood', '2026-07-12', 'Overhead Water Tank Cleaning Schedule', 'Maintenance', 'Water supply will be suspended on Monday, July 20th from 10:00 AM to 4:00 PM.', '', 'Facility Manager');

-- Invoices Seed
INSERT INTO "Invoices" ("id", "SocietyId", "BillMonth", "FlatNo", "OwnerName", "BaseAmount", "WaterCharges", "SecurityCharges", "ParkingCharges", "TotalAmount", "DueDate", "Status", "IssuedDate") VALUES
('INV-greenwood-0', 'greenwood', 'July 2026', '101', 'Amit Sharma', 2000, 300, 200, 100, 2600, '2026-07-31', 'Unpaid', '2026-07-01'),
('INV-greenwood-1', 'greenwood', 'July 2026', '102', 'Priya Patel', 2000, 300, 200, 0, 2500, '2026-07-31', 'Paid', '2026-07-01');

-- Visitors Seed
INSERT INTO "Visitors" ("id", "SocietyId", "FlatNo", "VisitorName", "Purpose", "ContactNo", "VehicleNo", "CheckInTime", "Status", "AccessToken") VALUES
('VIS-greenwood-0', 'greenwood', '101', 'Rajesh (Zomato)', 'Delivery', '+91 98888 12345', 'MH-02-ZZ-9988', '2026-07-21T01:10:00', 'Pending Approval', 'A8B92K'),
('VIS-greenwood-1', 'greenwood', '102', 'Sanjay Kumar (Plumber)', 'Maintenance', '+91 97777 54321', NULL, '2026-07-20T11:15:00', 'Checked Out', 'P3M71X');

-- EmergencyContacts Seed (Tier 1)
INSERT INTO "EmergencyContacts" ("id", "SocietyId", "Name", "Category", "Phone", "RoleOrTitle", "IsImportant") VALUES
('EM-1', 'greenwood', 'Police Emergency Helpline', 'Police', '100', 'National Control Room', true),
('EM-2', 'greenwood', 'Ambulance & Medical Emergency', 'Ambulance', '108', 'State Emergency Services', true),
('EM-3', 'greenwood', 'Fire Station Control Room', 'Fire', '101', 'Central Station', true),
('EM-4', 'greenwood', 'City General Hospital (24x7)', 'Hospital', '+91 22 2650 1111', 'Trauma & ER Desk', true),
('EM-5', 'greenwood', 'Main Gate Security Gatekeeper', 'Security', '+91 98200 11223', 'Head Security Officer', true),
('EM-6', 'greenwood', 'Ramesh Electricity Service', 'Electrician', '+91 98201 44556', 'On-call Electrician', false),
('EM-7', 'greenwood', 'QuickFix Plumbing Specialist', 'Plumber', '+91 98202 77889', 'Licensed Plumber', false),
('EM-8', 'greenwood', 'Amit Sharma (Secretary)', 'Committee', '+91 98765 43210', 'Society Secretary', true),
('EM-9', 'greenwood', 'Priya Patel (Treasurer)', 'Committee', '+91 98765 12345', 'Society Treasurer', false);

-- Tenants Seed (Tier 1)
INSERT INTO "Tenants" ("id", "SocietyId", "FlatNo", "TenantName", "ContactNo", "Email", "MoveInDate", "MoveOutDate", "AgreementDocUrl", "IdProofDocUrl", "KycStatus", "Remarks") VALUES
('TNT-1', 'greenwood', '103', 'Rajesh Kumar', '+91 98234 56789', 'rajesh.tenant@example.com', '2025-01-15', '2026-12-31', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Verified', 'Rent agreement verified for 22 months'),
('TNT-2', 'greenwood', '202', 'Anjali Gupta', '+91 99887 76655', 'anjali.g@example.com', '2025-06-01', NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Pending', 'Submitted police verification form pending secretary signoff'),
('TNT-3', 'greenwood', '302', 'Siddharth Shah', '+91 95544 33221', 'sidd.shah@example.com', '2026-02-10', NULL, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Verified', 'Police verification copy on file');

-- Vehicles Seed (Tier 1)
INSERT INTO "Vehicles" ("id", "SocietyId", "FlatNo", "OwnerName", "VehicleNo", "VehicleType", "ParkingSlotNo", "StickerIssued") VALUES
('VEH-1', 'greenwood', '101', 'Amit Sharma', 'MH-02-AB-1234', '4-Wheeler', 'A-101', true),
('VEH-2', 'greenwood', '101', 'Sunita Sharma', 'MH-02-SC-8899', '2-Wheeler', 'A-101-B', true),
('VEH-3', 'greenwood', '102', 'Priya Patel', 'MH-02-CD-5678', '4-Wheeler', 'B-204', true),
('VEH-4', 'greenwood', '103', 'Rajesh Kumar', 'MH-02-XY-9012', '2-Wheeler', 'S-12', true),
('VEH-5', 'greenwood', '201', 'Vikram Singh', 'MH-02-VS-2010', '4-Wheeler', 'C-301', true);

-- GuestParking Seed (Tier 1)
INSERT INTO "GuestParking" ("id", "SocietyId", "FlatNo", "GuestName", "VehicleNo", "VehicleType", "AssignedSlot", "ValidFrom", "ValidUntil", "Status") VALUES
('GP-1', 'greenwood', '101', 'Anil Sharma (Brother)', 'DL-01-AB-5678', '4-Wheeler', 'Visitor Slot V-03', '2026-07-21T08:00:00', '2026-07-21T22:00:00', 'Active'),
('GP-2', 'greenwood', '201', 'Renu Singh Guest', 'MH-12-KL-8899', '4-Wheeler', 'Visitor Slot V-01', '2026-07-20T10:00:00', '2026-07-20T20:00:00', 'Expired');

-- SocietyDocuments Seed (Tier 2)
INSERT INTO "SocietyDocuments" ("id", "SocietyId", "Title", "Category", "DocumentUrl", "IsPublic", "UploadedBy", "UploadedAt", "FileSize") VALUES
('DOC-1', 'greenwood', 'Registered Society Bye-Laws & Model Rules 2024', 'Building Rules', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Amit Sharma (Secretary)', '2026-01-10', '2.4 MB'),
('DOC-2', 'greenwood', 'AGM 2025-26 Official Minutes of Meeting & Resolution', 'AGM Minutes', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Amit Sharma (Secretary)', '2026-06-30', '1.1 MB'),
('DOC-3', 'greenwood', 'Annual Financial Audit Report FY 2025-26', 'Financial Audits', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Priya Patel (Treasurer)', '2026-05-15', '3.8 MB'),
('DOC-4', 'greenwood', 'Conveyance Deed & Land Registration Certificate', 'Legal Documents', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', false, 'Management Committee', '2025-08-20', '5.2 MB'),
('DOC-5', 'greenwood', 'Monsoon Waste Management & Garbage Segregation Circular', 'General Circulars', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Amit Sharma (Secretary)', '2026-07-01', '450 KB');

-- AssetAMCs Seed (Tier 2)
INSERT INTO "AssetAMCs" ("id", "SocietyId", "AssetName", "AssetType", "VendorName", "VendorContact", "ContractStartDate", "ContractExpiryDate", "LastServicedDate", "NextServicedDate", "ServiceStatus", "StatusNote", "ReportUrl") VALUES
('AMC-1', 'greenwood', 'Lift #1 (Wing A Schindler Elevator)', 'Lift', 'Schindler Elevator India Pvt Ltd', '+91 22 6100 8800', '2026-01-01', '2026-12-31', '2026-07-15', '2026-08-15', 'Operational', 'All safety cables & brakes checked. All Lifts Operational.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('AMC-2', 'greenwood', 'Lift #2 (Wing B OTIS Elevator)', 'Lift', 'OTIS Elevators Pvt Ltd', '+91 22 2850 4433', '2026-04-01', '2027-03-31', '2026-06-20', '2026-07-25', 'Operational', 'Regular quarterly lubrication complete.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('AMC-3', 'greenwood', 'Overhead & Underground Water Tank System', 'Water Tank', 'AquaClean Professional Tank Hygiene', '+91 98200 99887', '2026-01-01', '2026-12-31', '2026-07-10', '2026-10-10', 'Operational', 'Deep scrubbing & UV disinfection completed on July 10. Next scheduled Oct 2026.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('AMC-4', 'greenwood', 'Diesel Generator (Backup DG Set 125 KVA)', 'Generator', 'Cummins India Power Systems', '+91 98201 11223', '2025-11-01', '2026-10-31', '2026-05-18', '2026-08-18', 'Operational', 'Fuel filter changed. Engine health 98%.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- WaterMeters Seed (Tier 2)
INSERT INTO "WaterMeters" ("id", "SocietyId", "FlatNo", "ReadingMonth", "PreviousReading", "CurrentReading", "UnitsConsumed", "RecordedBy", "RecordedAt", "Status") VALUES
('WM-101-2026-07', 'greenwood', '101', '2026-07', 1240, 1285, 45, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-102-2026-07', 'greenwood', '102', '2026-07', 980, 1018, 38, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-103-2026-07', 'greenwood', '103', '2026-07', 1150, 1202, 52, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-201-2026-07', 'greenwood', '201', '2026-07', 1400, 1442, 42, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-202-2026-07', 'greenwood', '202', '2026-07', 890, 925, 35, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-203-2026-07', 'greenwood', '203', '2026-07', 1310, 1358, 48, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-301-2026-07', 'greenwood', '301', '2026-07', 1050, 1088, 38, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-302-2026-07', 'greenwood', '302', '2026-07', 1600, 1665, 65, 'Sanjay Plumber', '2026-07-01', 'Entered'),
('WM-101-2026-06', 'greenwood', '101', '2026-06', 1198, 1240, 42, 'Sanjay Plumber', '2026-06-01', 'Billed'),
('WM-102-2026-06', 'greenwood', '102', '2026-06', 945, 980, 35, 'Sanjay Plumber', '2026-06-01', 'Billed'),
('WM-103-2026-06', 'greenwood', '103', '2026-06', 1100, 1150, 50, 'Sanjay Plumber', '2026-06-01', 'Billed'),
('WM-101-2026-05', 'greenwood', '101', '2026-05', 1150, 1198, 48, 'Sanjay Plumber', '2026-05-01', 'Billed');

-- Polls / Resolutions Seed
INSERT INTO "Polls" ("id", "SocietyId", "Title", "Description", "Category", "StartDate", "EndDate", "CreatedBy", "Status", "TotalEligibleFlats") VALUES
('POLL-1', 'greenwood', 'Approve ₹500,000 Special Maintenance Budget for Entrance Lobby Renovation', 'Proposal to allocate ₹5 Lakhs from reserve funds for marble flooring, LED lighting, and digital access gate upgrade.', 'AGM Resolution', '2026-07-01', '2026-07-31', 'Amit Sharma (Secretary)', 'Active', 8),
('POLL-2', 'greenwood', 'Mandatory Electric Vehicle (EV) Charging Infrastructure Bylaws', 'Approve installation of 4 shared EV fast-charging stations in visitor parking with sub-meter billing per unit consumed.', 'Rule Change', '2026-07-10', '2026-08-10', 'Management Committee', 'Active', 8);

-- PollVotes Seed
INSERT INTO "PollVotes" ("id", "PollId", "SocietyId", "FlatNo", "VotedBy", "Vote", "Timestamp") VALUES
('PV-1', 'POLL-1', 'greenwood', '101', 'Amit Sharma', 'In Favor', '2026-07-05T10:15:00.000Z'),
('PV-2', 'POLL-1', 'greenwood', '102', 'Priya Patel', 'In Favor', '2026-07-06T14:20:00.000Z'),
('PV-3', 'POLL-1', 'greenwood', '201', 'Vikram Singh', 'Against', '2026-07-07T09:30:00.000Z'),
('PV-4', 'POLL-1', 'greenwood', '301', 'Neha Joshi', 'In Favor', '2026-07-08T16:45:00.000Z'),
('PV-5', 'POLL-2', 'greenwood', '101', 'Amit Sharma', 'In Favor', '2026-07-12T11:00:00.000Z'),
('PV-6', 'POLL-2', 'greenwood', '201', 'Vikram Singh', 'Abstain', '2026-07-13T15:10:00.000Z');

-- ============================================================================
-- 5. SUPABASE STORAGE BUCKETS SETUP & PUBLIC RLS ACCESS POLICIES
-- Creates public buckets for 'society-docs', 'tenant-kyc', and 'notice-attachments'
-- ============================================================================

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('society-docs', 'society-docs', true, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('tenant-kyc', 'tenant-kyc', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('notice-attachments', 'notice-attachments', true, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Public Read Policies
CREATE POLICY "Public Read Access for society-docs" ON storage.objects 
  FOR SELECT USING (bucket_id = 'society-docs');

CREATE POLICY "Public Read Access for tenant-kyc" ON storage.objects 
  FOR SELECT USING (bucket_id = 'tenant-kyc');

CREATE POLICY "Public Read Access for notice-attachments" ON storage.objects 
  FOR SELECT USING (bucket_id = 'notice-attachments');

-- Storage Upload Policies (Public / Authenticated users can insert files)
CREATE POLICY "Public Upload Access for society-docs" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'society-docs');

CREATE POLICY "Public Upload Access for tenant-kyc" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'tenant-kyc');

CREATE POLICY "Public Upload Access for notice-attachments" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'notice-attachments');

-- Storage Delete / Update Policies
CREATE POLICY "Public Update Access for society-docs" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'society-docs');

CREATE POLICY "Public Update Access for tenant-kyc" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'tenant-kyc');

CREATE POLICY "Public Update Access for notice-attachments" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'notice-attachments');


