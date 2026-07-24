# Configurable Items & Module Settings Manual
*Comprehensive Specification Matrix of All Tenant Settings, Formats, Validation Rules, and Defaults*

---

## 📌 Executive Summary
The Smart Co-op Housing Society SaaS Platform provides extensive configurability across multi-tenant society settings, billing engines, module activation catalogs, staff tracking, NOC clearance workflows, asset inventory management, notification triggers, and role-based permissions. This document specifies every configurable parameter across all platform domains.

---

## 1. Society Metadata & Core Onboarding Configurations

| Parameter Name | DB Column / JSON Key | Expected Input Format / Example | Data Type & Range | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Society Name** | `Societies.Name` | `Greenwood Residency Co-Op Housing Society Ltd.` | String (3–120 chars) | *None (Required)* | Legal registered title. System auto-generates unique `SocietyCode` (e.g. `OMRE1`) and kebab URL slug. |
| **GSTIN** | `Societies.GSTIN` | `27AAACG1234H1Z5` | String (15-char Regex) | `null` | 15-character Goods and Services Tax Identification Number used on tax invoice headers. |
| **PAN Number** | `Societies.PAN` | `AAACG1234H` | String (10-char Regex) | `null` | 10-character Permanent Account Number for statutory TDS compliance. |
| **Postal Address** | `Societies.PostalAddress` | `Plot 12, Sector 15, Vashi, Navi Mumbai 400703` | String (10–250 chars) | *None (Required)* | Full postal address rendered on official notices and member receipts. |
| **Building Structure Type** | `Societies.StructureType` | `wings` \| `standalone` \| `towers_wings` | Enum | `wings` | Dictates directory layout (e.g. Wing A vs. Tower 1 — Wing A). |
| **Wings List** | `Societies.Wings` | `["Wing A", "Wing B", "Wing C"]` | Array of Strings | `["Wing A", "Wing B"]` | Wing identifiers available when creating flat records. |

---

## 2. Maintenance Billing & Financial Engine Configurations

| Parameter Name | DB Column / JSON Key | Expected Input Format / Example | Data Type & Range | Default Value | Description & Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Billing Mode** | `Societies.BillingMode` | `Flat Rate` \| `SqFt Rate` \| `Hybrid` | Enum | `Flat Rate` | Strategy for monthly maintenance calculations across units. |
| **Rate Per SqFt** | `Societies.RatePerSqFt` | `3.50` | Numeric (> 0) | `3.5` | Multiplied by unit square footage when `BillingMode` is `SqFt Rate`. |
| **Flat Rate Amount** | `Societies.FlatRateAmount` | `2500` | Numeric (> 0) | `2000` | Fixed fee per unit when `BillingMode` is `Flat Rate`. |
| **Maintenance Due Date Day** | `module_settings.society.dueDateDay` | `15` | Integer (1–28) | `15` | Cutoff day of the month for maintenance payments. Must be between 1 and 28. |
| **Late Fee Interest Percent** | `module_settings.society.lateFeeInterestPercent` | `12` | Numeric (0%–50%) | `12` | Annual interest rate percentage applied pro-rata to overdue balances. |
| **Enable GST Calculation** | `module_settings.billing.enableGST` | `true` \| `false` | Boolean | `false` | Toggles statutory 18% GST calculation on non-exempt billing items. |
| **Auto Invoice Generation Day** | `module_settings.billing.autoInvoiceDay` | `1` | Integer (1–28) | `1` | Day of the month when automated draft batch invoices are compiled. |

---

## 3. Module Activation Catalog (`enabled_modules` JSONB)

Tenant societies can enable or disable functional modules individually via the `enabled_modules` JSONB field in the `Societies` table:

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

### Module Toggle Specification Table

| Module Key | Display Name | Impact when Enabled (`true`) | Impact when Disabled (`false`) |
| :--- | :--- | :--- | :--- |
| `gatekeeper` | Gatekeeper Security | Exposes Gate Kiosk, QR Pass Scanner, & Visitor Push Alerts. | Hides Gate Kiosk tab & blocks visitor check-in APIs. |
| `billing` | Financial Billing | Enables Batch Invoicing, Ledger, & Printable PDF Receipts. | Restricts billing write operations to Admins. |
| `helpdesk` | Complaint Helpdesk | Residents can log plumbing, electrical, & elevator tickets. | Disables ticket submission form. |
| `voting` | AGM Resolution Voting | Enables E-Voting polls with 1-Flat = 1-Vote enforcement. | Blocks ballot submissions with HTTP 403 error. |
| `facility_booking` | Amenity Reservations | Allows booking Clubhouse, Tennis Court, & Party Hall. | Disables amenity scheduling calendar. |
| `water_meters` | Sub-Meter Water Billing | Allows entering water readings & automated line charges. | Hides water meter entry screens. |
| `tenants` | Tenant KYC Register | Digital lease agreement uploads & move-in approvals. | Restricts tenant onboarding forms. |
| `document_vault` | Society Document Center | Secure repository for audit reports, circulars, & minutes. | Disables document upload center. |
| `staff_tracking` | Domestic Staff Tracking | Enables passcode gate check-in, directory, & attendance logs for maids, cooks, and drivers. | Hides staff directory and gate check-in tab. |
| `noc_clearance` | NOC & Move Clearance | Enables move-in/out NOC applications, Treasurer clearance, & refundable deposit tracking. | Hides NOC application form. |
| `asset_inventory` | Asset & AMC Register | Tracks society elevators, generators, water pumps, warranty dates, & AMC renewals. | Hides asset inventory tab. |
| `emergency_alerts` | Emergency Alert System | High-visibility sticky top alert banner on resident home view and SOS dial directory. | Disables top emergency banner. |

---

## 4. Module Custom Configurations (`module_settings` JSONB)

### 4.1 Gatekeeper Security Settings
```json
"gatekeeper": {
  "autoApproveGuests": true,
  "passExpiryHours": 12,
  "notifyDeliveryArrival": true,
  "panicAlertEscalationPhone": "+919876543210"
}
```
- `passExpiryHours` (Integer 1–72): QR visitor pass expiration window. Default: `12` hours.
- `autoApproveGuests` (Boolean): Allows residents to auto-approve frequent visitors. Default: `true`.

### 4.2 Water Meter Sub-Billing Settings
```json
"water_meters": {
  "ratePerUnit": 15.00,
  "tier1Limit": 5000,
  "tier2RatePerUnit": 22.50,
  "billingCycle": "Monthly"
}
```
- `ratePerUnit` (Numeric > 0): Charge per unit of water consumed. Default: `15.00`.
- `tier1Limit` (Integer > 0): Tier 1 consumption limit in units. Default: `5000`.

### 4.3 Amenity & Facility Booking Settings
```json
"facility_booking": {
  "maxAdvanceBookingDays": 30,
  "cancellationRefundHours": 24,
  "clubhouseHourlyRate": 500.00,
  "partyHallDailyRate": 5000.00
}
```

### 4.4 Domestic Staff & NOC Settings
```json
"staff_tracking": {
  "requireGatePasscode": true,
  "allowResidentPasscodeView": true,
  "maxAssignedFlatsPerStaff": 10
},
"noc_clearance": {
  "defaultMoveInDeposit": 5000.00,
  "requireTreasurerDuesClearance": true,
  "requireSecretarySignature": true
}
```

### 4.5 Asset AMC & Warranty Settings
```json
"asset_inventory": {
  "amcExpiryNoticeDays": 30,
  "autoDispatchExpiryAlerts": true,
  "requireDualApprovalForMaintenance": true
}
```

---

## 5. Committee Role Permissions Matrix

The platform maps granular permissions across 7 standard roles defined in the `Roles` table:

```ts
export type PermissionKey = 
  | '*'
  | 'billing:read' | 'billing:write' | 'billing:pay'
  | 'gatekeeper:read' | 'gatekeeper:write'
  | 'voting:read' | 'voting:write' | 'voting:cast'
  | 'notices:read' | 'notices:write'
  | 'helpdesk:read' | 'helpdesk:write' | 'helpdesk:file'
  | 'amenities:read' | 'amenities:write' | 'amenities:book'
  | 'tenants:read' | 'tenants:write'
  | 'staff:read' | 'staff:write'
  | 'noc:read' | 'noc:write' | 'noc:approve'
  | 'assets:read' | 'assets:write'
  | 'committee:read' | 'committee:write'
  | 'settings:read' | 'settings:write'
  | 'expenses:read' | 'expenses:write'
  | 'audit:read' | 'alerts:write';
```

---
*Configurable Items Guide Version 3.0 — Smart Co-op Housing Society Management SaaS*
