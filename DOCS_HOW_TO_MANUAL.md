# Smart Co-op Housing Society SaaS Platform — Master Operational Manual & SOP
*Official Standard Operating Procedure (SOP), System Architecture, and Administration Guide*

---

## 📋 Table of Contents
1. [System Overview & Multi-Tenant Discretion Paradigm](#1-system-overview--multi-tenant-discretion-paradigm)
2. [Phase 1: Society Onboarding & Disambiguation](#phase-1-society-onboarding--disambiguation)
3. [Phase 2: Committee Governance & Granular RBAC Permissions](#phase-2-committee-governance--granular-rbac-permissions)
4. [Phase 3: Module Settings Catalog & Tenant Discretion Toggles](#phase-3-module-settings-catalog--tenant-discretion-toggles)
5. [Phase 4: Master Configurable Items Reference Matrix](#phase-4-master-configurable-items-reference-matrix)
6. [Phase 5: Daily & Monthly Operational Workflows](#phase-5-daily--monthly-operational-workflows)
7. [Phase 6: Automated Test Suites & Security Boundaries](#phase-6-automated-test-suites--security-boundaries)
8. [Phase 7: Comprehensive Troubleshooting & Error Resolution Matrix](#phase-7-comprehensive-troubleshooting--error-resolution-matrix)

---

## 1. System Overview & Multi-Tenant Discretion Paradigm

The Smart Co-op Housing Society SaaS Platform is a multi-tenant enterprise management system built for residential housing societies, apartment complexes, and commercial gated communities. 

### Core Architectural Pillars
- **Strict Multi-Tenant Isolation**: Row-Level Security (RLS) policies in PostgreSQL enforce tenant boundary safety across all queries and operations (`SocietyId` partition key).
- **Discretionary Module Catalog**: Tenant societies can toggle features ON/OFF individually via JSONB configuration settings (`enabled_modules` and `module_settings`).
- **Granular Role-Based Access Control (RBAC)**: Distinct permissions mapped across 7 standard committee and operational roles.
- **Forced First-Time Credential Reset**: Mandatory password change gate (`MustChangePassword: true`) for newly provisioned accounts.

---

## Phase 1: Society Onboarding & Disambiguation

### 1.1 Registering a New Society
To onboard a new residential or commercial complex, the Managing Committee or Super-Admin completes the initial onboarding wizard:

1. **Access Onboarding Wizard**: Click **"Register New Customer (Society)"** in the top workspace toolbar or login screen.
2. **Input Core Metadata**:
   - **Society Name**: Registered legal title (e.g. *Om Residency Co-Operative Housing Society Ltd.*).
   - **GSTIN & PAN**: 15-character statutory GST identification number (e.g. `27AAACG1234H1Z5`).
   - **Postal Address & Pin Code**: Official physical location (e.g. *Plot 12, Sector 15, Navi Mumbai 400705*).
   - **Registration Number**: District registrar code (e.g. `MUM/HSG/12345/2021`).
3. **Configure Structural Layout**:
   - **Standalone Building**: Single block without wings.
   - **Wings / Blocks**: Multi-wing configuration (e.g. *Wing A, Wing B, Wing C*).
   - **Towers & Wings**: High-rise complex with multiple towers (e.g. *Tower 1 — Wing A, Tower 2 — Wing B*).

### 1.2 Automated Duplicate Disambiguation Engine
To prevent credential routing collisions when onboarded societies share identical names (e.g. two separate complexes named *"Om Residency"* in different cities):

1. **Unique SocietyCode Generation**:
   - Formed by taking the first 4 uppercase characters of the name plus a sequence counter.
   - *First "Om Residency"* ➔ `OMRE1`
   - *Second "Om Residency"* ➔ `OMRE2`
2. **URL Slug Hashing**:
   - Converts the society name to a URL-safe kebab string appended with a 6-character short hash.
   - *First "Om Residency"* ➔ `om-residency-a1b2c3`
   - *Second "Om Residency"* ➔ `om-residency-x9y8z7`
3. **Primary Admin Account Provisioning**:
   - Automatically provisions a default `SOCIETY_ADMIN` account assigned to the primary contact email.
   - Flagged with `MustChangePassword: true` and issued a secure temporary password.

---

## Phase 2: Committee Governance & Granular RBAC Permissions

The platform enforces Role-Based Access Control across 7 standard role definitions stored in the `Roles` database table:

### Role Permissions Matrix

| Role | Primary Responsibility | Granted Permission Keys |
| :--- | :--- | :--- |
| **SOCIETY_ADMIN** | Managing Committee Administrator | `["*"]` (Full administrative override rights) |
| **PRESIDENT** | Society Chief Executive | `["voting:write", "notices:write", "helpdesk:write", "committee:read"]` |
| **SECRETARY** | Operational Administrative Head | `["voting:write", "notices:write", "helpdesk:write", "amenities:write", "tenants:write"]` |
| **TREASURER** | Financial & Accounting Head | `["billing:read", "billing:write", "expenses:write", "audit:read"]` |
| **AUDITOR** | Independent Compliance Inspector | `["billing:read", "expenses:read", "audit:read"]` (Read-only financial access) |
| **GATE_STAFF** | Main Gate Security Guard | `["gatekeeper:read", "gatekeeper:write", "alerts:write"]` |
| **RESIDENT** | Flat Owner or Registered Tenant | `["self:read", "billing:pay", "helpdesk:file", "voting:cast"]` |

### Modifying Committee Role Assignments
1. Open **Committee RBAC Console** (`#committee-rbac-btn`) in the Admin Console.
2. Select the target committee member or user auth account.
3. Choose the target granular role (`SOCIETY_ADMIN`, `TREASURER`, `SECRETARY`, `GATE_STAFF`, etc.).
4. Click **Assign Role** — RBAC rights update instantly and are synced to Supabase.

---

## Phase 3: Module Settings Catalog & Tenant Discretion Toggles

Societies can toggle features ON or OFF dynamically based on their specific infrastructure requirements.

### Module Catalog Reference (`enabled_modules` JSONB)

```json
{
  "gatekeeper": true,
  "billing": true,
  "helpdesk": true,
  "voting": true,
  "facility_booking": true,
  "water_meters": true,
  "tenants": true,
  "document_vault": true
}
```

### Module Configuration Settings (`module_settings` JSONB)

```json
{
  "gatekeeper": {
    "autoApproveGuests": true,
    "passExpiryHours": 12
  },
  "billing": {
    "enableGST": true,
    "autoInvoiceDay": 1
  },
  "society": {
    "dueDateDay": 15,
    "lateFeeInterestPercent": 12
  }
}
```

---

## Phase 4: Master Configurable Items Reference Matrix

| Area / Module | Field Name | Expected Format / Example | Data Type & Range | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Society Metadata** | `Name` | `Greenwood Residency Co-Op Housing Society Ltd.` | String (3–120 chars) | Legal society title. Auto-generates unique `SocietyCode` & URL slug. |
| **Society Metadata** | `GSTIN` | `27AAACG1234H1Z5` | String (15-char Regex) | 15-character statutory GST identification number. Must match standard regex. |
| **Society Metadata** | `BuildingType` | `Housing Society` \| `Apartment Complex` | Enum | Architectural designation used in invoice letterheads. |
| **Financial Engine** | `BillingMode` | `Flat Rate` \| `SqFt Rate` \| `Hybrid` | Enum | Calculation model for batch invoice generation. |
| **Financial Engine** | `RatePerSqFt` | `3.50` | Numeric (> 0) | Rate multiplied by flat SqFt area when `BillingMode` is `SqFt Rate`. |
| **Financial Engine** | `FlatRateAmount` | `2500` | Numeric (> 0) | Fixed maintenance charge per unit when `BillingMode` is `Flat Rate`. |
| **Financial Engine** | `DueDateDay` | `15` | Integer (1–28) | Cutoff day of the month for maintenance payments. Must be between 1 and 28. |
| **Financial Engine** | `LateFeeInterestPercent` | `12` | Numeric (0–50%) | Annual interest rate charged on overdue maintenance balances. |
| **Water Metering** | `ratePerUnit` | `15.00` | Numeric (> 0) | Rate in ₹ per unit of water consumed. |
| **Water Metering** | `tier1Limit` | `5000` | Integer (> 0) | Monthly liter limit before higher tariff tier applies. |
| **Gatekeeper** | `passExpiryHours` | `12` | Integer (1–72) | Duration in hours before pre-approved visitor QR code expires. |
| **Gatekeeper** | `gatePasscode` | `admin123` | String (Min 6 chars) | Administrative passcode for gate guard kiosk terminals. |
| **Facility Booking**| `maxAdvanceDays` | `30` | Integer (1–90) | Maximum days in advance a resident can reserve an amenity slot. |
| **AGM Voting** | `enforceOneVotePerFlat` | `true` | Boolean | Strictly enforces 1 ballot per flat number as per Bye-Law 114. |

---

## Phase 5: Daily & Monthly Operational Workflows

### 5.1 Automated Monthly Batch Invoicing
1. Navigate to **Financials ➔ Invoices ➔ Generate Batch Invoices**.
2. Select Billing Month & Year (e.g. *August 2026*).
3. The system calculates dues for each unit:
   $$\text{Total Invoice} = \text{Base Maintenance} + \text{Water Meter Usage} + \text{Parking Fees} + \text{Arrears} - \text{Advance Credits}$$
4. Click **Publish & Broadcast Invoices** — dispatches instant push notifications and emails with direct payment links to all residents.

### 5.2 Gatekeeper Visitor Entry Workflow
1. Guard accesses **Gatekeeper Kiosk** using security guard credentials.
2. Enters Visitor Name, Mobile Number, Vehicle Number, Purpose, and Target Flat.
3. System dispatches real-time **Expo Push Notification** to the resident's smartphone.
4. Resident taps **Approve** ➔ Kiosk displays green *"Entry Granted"* notification.
5. For pre-approved visitors, the guard scans the guest's 6-digit OTP or QR code for 1-tap entry.

---

## Phase 6: Automated Test Suites & Security Boundaries

The platform features an automated E2E test suite built with **Jest**, **Playwright**, and **Supabase CLI**:

### Running the Test Suite
```bash
# Run all Jest automated test suites
npm run test:all

# Run E2E Playwright tests
npm run test:e2e

# Run Supabase RLS security verification
npm run test:security
```

### Key Automated Test Coverage
- **`01-happy-path/`**: Batch invoicing, visitor passes, AGM voting, water metering, amenity booking, dual-approval expenses.
- **`02-negative/`**: Expired visitor tokens, duplicate flat registration, malformed CSV uploads.
- **`03-security/`**: Cross-tenant RLS isolation checks.
- **`04-performance/`**: Batch invoicing SLA benchmark (<500ms for 100+ flats).
- **`05-rbac-and-toggles/`**: Role permission enforcement and feature toggle evaluation.
- **`06-auth-and-identity/`**: `test_duplicate_society_names` and `test_forced_password_reset_gate`.
- **`07-governance-and-rls/`**: `test_disabled_feature_access_blocked` and `test_treasurer_vs_secretary_rbac`.
- **`08-negative-and-boundaries/`**: Invalid OTPs, expired passwords, negative penalty interest rates, invalid due dates.

---

## Phase 7: Comprehensive Troubleshooting & Error Resolution Matrix

| Error Message | Root Cause | Step-by-Step Resolution Procedure |
| :--- | :--- | :--- |
| **`"Resident unable to log in / Phone number not found"`** | Resident phone number missing or improperly formatted without country code. | 1. Open **Resident Directory**.<br>2. Search flat number.<br>3. Verify phone format (`+91 XXXXX XXXXX`).<br>4. Click **Resend Login Invite**. |
| **`"Duplicate flat entry error during CSV import"`** | CSV file contains duplicate flat entries or flat already registered under another wing. | 1. Open CSV file in Excel/Google Sheets.<br>2. Run **Remove Duplicates** on `FlatNo` column.<br>3. Re-upload clean CSV file. |
| **`"Maintenance due date day must be between 1 and 28"`** | Due date set to 29, 30, or 31, which invalidates short months like February. | 1. Open **Module Settings & Toggles**.<br>2. Set `DueDateDay` to a valid number between 1 and 28 (Default: 15).<br>3. Save configuration. |
| **`"Late fee penalty interest rate cannot be negative"`** | Negative number submitted for penalty interest percentage. | 1. Open **Module Settings & Toggles**.<br>2. Set `LateFeeInterestPercent` to a positive value between 0% and 50%.<br>3. Save configuration. |
| **`"Access Denied: Voting module disabled by society"`** | Resident attempting to submit vote when `voting` module is toggled OFF in society settings. | 1. Managing Committee opens **Module Settings & Toggles**.<br>2. Toggle **AGM Resolution Polling & E-Voting** to **Active**.<br>3. Save settings. |
| **`"HTTP 403: Insufficient Role Permissions"`** | Committee member attempting action outside their assigned RBAC rights (e.g. Secretary attempting invoice generation). | 1. Open **Committee RBAC Console**.<br>2. Verify user's assigned role.<br>3. If necessary, assign `SOCIETY_ADMIN` or `TREASURER` role. |
| **`"QR Pass Expired / Entry Denied"`** | Pre-approved visitor pass scanned past the `passExpiryHours` window. | 1. Resident generates a fresh visitor pass in the mobile app.<br>2. Alternatively, guard uses manual visitor verification flow. |

---
*Operational Manual Version 3.0 — Smart Co-op Housing Society Management SaaS*
