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
   - 5.1 Automated Monthly Batch Invoicing & Printable Receipts
   - 5.2 Gatekeeper Visitor Entry & QR Camera Scanner
   - 5.3 Domestic Staff Entry & Daily Attendance Logs
   - 5.4 Resident NOC Clearance & Move-In Deposit Workflow
   - 5.5 Society Asset Inventory & AMC Expiry Alerts
   - 5.6 Real-Time Notification Center & Emergency Banner
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
| **SECRETARY** | Operational Administrative Head | `["voting:write", "notices:write", "helpdesk:write", "amenities:write", "tenants:write", "noc:write"]` |
| **TREASURER** | Financial & Accounting Head | `["billing:read", "billing:write", "expenses:write", "audit:read", "noc:approve"]` |
| **AUDITOR** | Independent Compliance Inspector | `["billing:read", "expenses:read", "audit:read"]` (Read-only financial access) |
| **GATE_STAFF** | Main Gate Security Guard | `["gatekeeper:read", "gatekeeper:write", "alerts:write", "staff:write"]` |
| **RESIDENT** | Flat Owner or Registered Tenant | `["self:read", "billing:pay", "helpdesk:file", "voting:cast", "noc:read"]` |

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
  "document_vault": true,
  "staff_tracking": true,
  "noc_clearance": true,
  "asset_inventory": true,
  "emergency_alerts": true
}
```

---

## Phase 4: Master Configurable Items Reference Matrix

| Area / Module | Field Name | Expected Format / Example | Data Type & Range | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Society Metadata** | `Name` | `Greenwood Residency Co-Op Housing Society Ltd.` | String (3–120 chars) | Legal society title. Auto-generates unique `SocietyCode` & URL slug. |
| **Society Metadata** | `GSTIN` | `27AAACG1234H1Z5` | String (15-char Regex) | 15-character statutory GST identification number. Must match standard regex. |
| **Financial Engine** | `BillingMode` | `Flat Rate` \| `SqFt Rate` \| `Hybrid` | Enum | Calculation model for batch invoice generation. |
| **Financial Engine** | `RatePerSqFt` | `3.50` | Numeric (> 0) | Rate multiplied by flat SqFt area when `BillingMode` is `SqFt Rate`. |
| **Financial Engine** | `FlatRateAmount` | `2500` | Numeric (> 0) | Fixed maintenance charge per unit when `BillingMode` is `Flat Rate`. |
| **Financial Engine** | `DueDateDay` | `15` | Integer (1–28) | Cutoff day of the month for maintenance payments. Must be between 1 and 28. |
| **Financial Engine** | `LateFeeInterestPercent` | `12` | Numeric (0–50%) | Annual interest rate charged on overdue maintenance balances. |
| **Gatekeeper** | `passExpiryHours` | `12` | Integer (1–72) | Duration in hours before pre-approved visitor QR code expires. |
| **Staff Tracking** | `requireGatePasscode` | `true` | Boolean | Enforces 4-digit PIN for domestic staff gate check-in. |
| **NOC Clearance** | `defaultMoveInDeposit` | `5000.00` | Numeric (> 0) | Default refundable move-in deposit required from incoming residents. |
| **Asset AMC** | `amcExpiryNoticeDays` | `30` | Integer (1–90) | Days prior to AMC contract expiration to trigger alert notifications. |

---

## Phase 5: Daily & Monthly Operational Workflows

### 5.1 Automated Monthly Batch Invoicing & Printable Receipts
1. Navigate to **Financials ➔ Invoices ➔ Generate Batch Invoices**.
2. Select Billing Month & Year (e.g. *August 2026*).
3. System calculates dues:
   $$\text{Total Invoice} = \text{Base Maintenance} + \text{Water Meter Usage} + \text{Parking Fees} + \text{Arrears} - \text{Advance Credits}$$
4. Click **Publish & Broadcast Invoices** — dispatches push notifications and emails with direct payment links to all residents.
5. Residents can click **Print Receipt** on any paid invoice to generate a clean, formatted PDF receipt statement complete with GST breakdowns and society letterhead.

### 5.2 Gatekeeper Visitor Entry & QR Camera Scanner
1. Guard accesses **Gatekeeper Kiosk** using security guard credentials.
2. Guard can manually enter visitor details OR tap **Scan QR Passcode** to launch the camera scanner simulator.
3. Aligning the visitor's QR code token instantly validates access authorization and logs entry time.
4. Resident receives a real-time Expo push notification upon visitor arrival.

### 5.3 Domestic Staff Entry & Daily Attendance Logs
1. Guards select staff member (maid, cook, driver) from the **Staff Tracking Directory**.
2. Staff enters their assigned 4-digit PIN or scans their QR token.
3. System validates active employment status and updates status to **'Inside Premises'**.
4. Resident receives a notification that their assigned staff has checked in, and can view active attendance logs.

### 5.4 Resident NOC Clearance & Move-In Deposit Workflow
1. Resident submits an NOC application for **Move-In** or **Move-Out** via the NOC Workflow Module.
2. **Treasurer Dues Audit**: System verifies flat maintenance balance = ₹0. Treasurer approves dues clearance.
3. **Secretary Authorization**: Secretary reviews applicant details and issues the digital NOC certificate with move-in deposit tracking.
4. Upon vacating or shift completion, Treasurer toggles deposit refund status to **Refunded**.

### 5.5 Society Asset Inventory & AMC Expiry Alerts
1. Committee Admins manage elevators, generators, water pumps, and fire safety systems in the **Asset Inventory Register**.
2. System logs vendor details, warranty expiry dates, and AMC contract terms.
3. Automated background engine checks contract dates daily: when a contract is within **30 days of expiration**, a high-priority push notification is automatically sent to all Committee Admins.

### 5.6 Real-Time Notification Center & Emergency Banner
1. Residents and admins view unread notification counts on the top bell icon.
2. Clicking the bell opens the **Notification Center Modal**, supporting filtering by Emergency, Gate, Notice, and Billing categories.
3. For critical society emergencies (water pipe bursts, power outages, security alerts), admins publish a sticky **Top Emergency Alert Banner** that renders prominently on all resident home screens.

---

## Phase 6: Automated Test Suites & Security Boundaries

The platform features an automated E2E test suite built with **Jest**, **Playwright**, and **Supabase CLI**:

### Running the Test Suite
```bash
# Run all Jest automated test suites (51 tests across 15 files)
npm run test:all

# Run E2E Playwright tests
npm run test:e2e

# Run Supabase RLS security verification
npm run test:security
```

---

## Phase 7: Comprehensive Troubleshooting & Error Resolution Matrix

| Error Message | Root Cause | Step-by-Step Resolution Procedure |
| :--- | :--- | :--- |
| **`"Resident unable to log in / Phone number not found"`** | Resident phone number missing or improperly formatted without country code. | 1. Open **Resident Directory**.<br>2. Search flat number.<br>3. Verify phone format (`+91 XXXXX XXXXX`).<br>4. Click **Resend Login Invite**. |
| **`"NOC Approval Blocked: Outstanding Maintenance Dues"`** | Resident flat has an unpaid balance > ₹0. | 1. Resident pays outstanding maintenance invoice via Payment Portal.<br>2. Treasurer verifies zero balance and re-runs NOC approval. |
| **`"Staff Check-In Denied: Invalid Passcode / Inactive Status"`** | Incorrect 4-digit PIN entered or staff marked as Terminated. | 1. Open **Staff Tracking Directory**.<br>2. Verify staff member's passcode and ensure status is **Active**.<br>3. Reset passcode if forgotten. |
| **`"Maintenance due date day must be between 1 and 28"`** | Due date set to 29, 30, or 31, which invalidates short months like February. | 1. Open **Module Settings & Toggles**.<br>2. Set `DueDateDay` to a valid number between 1 and 28 (Default: 15).<br>3. Save configuration. |
| **`"Access Denied: Module disabled by society"`** | User attempting to access a module toggled OFF in society settings. | 1. Managing Committee opens **Module Settings & Toggles**.<br>2. Enable desired feature (e.g. Staff Tracking or Asset AMC).<br>3. Save settings. |

---
*Operational Manual Version 3.0 — Smart Co-op Housing Society Management SaaS*
