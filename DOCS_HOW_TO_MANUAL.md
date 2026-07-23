# Housing Society SaaS Platform — How-To & Configuration Manual
*Official Operational & Deployment Standard Operating Procedure (SOP)*

---

## 📋 Table of Contents
1. [Phase 1: Society Registration & Initial Onboarding](#phase-1-society-registration--initial-onboarding)
2. [Phase 2: Feature Activation & Module Management](#phase-2-feature-activation--module-management)
3. [Phase 3: Daily & Monthly Operational Workflows](#phase-3-daily--monthly-operational-workflows)
4. [Phase 4: Troubleshooting, Errors & Solutions Matrix](#phase-4-troubleshooting-errors--solutions-matrix)

---

## Phase 1: Society Registration & Initial Onboarding

### 1.1 Registering a New Society
To onboard a new residential or commercial complex onto the SaaS platform, the Managing Committee Administrator must complete the initial society registration wizard:

1. **Navigate to Onboarding / Switch Society:** Click on **"Register New Society"** in the top workspace toolbar or login screen.
2. **Provide Primary Metadata:**
   - **Society Name:** Official registered name (e.g., *Greenwood Heights Co-Operative Housing Society Ltd.*).
   - **GSTIN & PAN Number:** Required for tax-compliant invoicing and tax deductions (e.g., `27AAACG1234H1Z5`).
   - **Postal Address & Pin Code:** Complete physical location for postal circulars and automated invoice headers.
   - **Registration Number:** District registrar allotment code (e.g., `BOM/HSG/12345/2018`).
3. **Configure Building & Structural Architecture:**
   - **Standalone Building:** Single structure without wings.
   - **Wings / Blocks:** Multi-wing layout (e.g., *Wing A, Wing B, Wing C*).
   - **Towers & Wings Combined:** High-rise complexes with multiple towers (e.g., *Tower 1 — Wing A, Tower 1 — Wing B*).
   - **Total Flats Count:** Total unit capacity across all blocks.

---

### 1.2 Setting Up Committee Roles & Access Hierarchies
The platform uses **Role-Based Access Control (RBAC)** to enforce operational privacy:

| Role | Operational Scope & Permissions |
| :--- | :--- |
| **Admin / Managing Committee** | Full administrative access: Society settings, financial ledgers, member management, audit logs, feature catalog toggles. |
| **President / Secretary** | Authorization rights: AGM resolution publishing, vendor contracts, official announcements, emergency broadcasts. |
| **Treasurer / Accountant** | Financial controls: Maintenance bill generation, payment verification, vendor payout approval, GST & audit statement downloads. |
| **Security Guard / Gatekeeper** | Main gate kiosk interface: Visitor entry/exit logs, delivery verification, cab tracking, emergency panic alarms. |
| **Resident (Owner / Tenant)** | Mobile/Web portal: Dues payment via UPI/Gateway, visitor pre-approvals, complaint ticketing, amenity booking, e-voting. |

#### To Assign Roles:
1. Open **Resident Directory** in the Admin Console.
2. Select the target resident record and click **Edit Role**.
3. Choose `Admin`, `President`, `Secretary`, `Treasurer`, or `Resident`.
4. Save record — permissions take effect immediately upon next session refresh.

---

### 1.3 Bulk Resident & Flat Directory Import
You can populate flat allocations and resident profiles manually or via automated CSV batch import:

#### Option A: CSV Batch Upload
1. Go to **Admin Console ➔ Resident Directory ➔ Bulk Import CSV**.
2. Download the standard CSV Template (`society_residents_template.csv`).
3. Fill in required columns:
   `FlatNo`, `Wing`, `OwnerName`, `ContactNo`, `Email`, `Status` (`Owner` / `Tenant`), `Floor`, `ParkingSlot`
4. Upload the CSV file. The system will perform pre-validation checks:
   - Unique phone number validation
   - Wing existence check
   - Flat duplication guard
5. Click **Confirm Import**.

#### Option B: Manual Registration
1. Click **+ Add Resident** button.
2. Input Flat Number, Wing/Tower selection, Primary Owner Name, Phone Number (+91 format), and Email address.
3. Save record — a login credential SMS/Email invitation is automatically queued for the resident.

---

## Phase 2: Feature Activation & Module Management

### 2.1 Feature Catalog & Module Specification
The SaaS platform features a modular architecture. Societies only activate the modules they require:

1. **Gatekeeper Security & Visitor Pass:** Real-time gate check-ins, host push notifications, delivery verification, and QR visitor passes.
2. **Automated Water Meter Billing:** Sub-meter reading entries, tiered volume pricing, and automated line-item inclusion in monthly invoices.
3. **Facility & Amenity Booking:** Calendar reservations for Clubhouse, Tennis Court, Swimming Pool, and Banquet Hall with online slot payment.
4. **Digital AGM Resolutions & E-Voting:** Quorum tracking, 1-Flat = 1-Vote enforcement, tamper-proof ballot logs, and real-time result charts.
5. **Vendor & AMC Management:** Track Annual Maintenance Contracts (lifts, generators, pumps, fire systems) with service due alerts.
6. **Staff & Maid Directory:** Domestic help registration, gate pass creation, police verification status badges, and attendance logs.
7. **Tenant & KYC Register:** Digital lease document vault, identity proof verification, and move-in/move-out approval workflows.
8. **Document Vault:** Central repository for financial audit reports, circulars, bye-laws, and AGM meeting minutes.

---

### 2.2 Activating or Deactivating Modules
Managing Committee Administrators can toggle modules ON or OFF at any time:

1. Click the **Module Settings / Sliders Icon** in the top navigation bar or go to **Admin Console ➔ Module Settings**.
2. Review active modules in the **Feature Catalog**.
3. Toggle the desired module **Active** or **Disabled**.
4. **Impact:**
   - Toggling **ON** instantly exposes the module's tab and controls in the main navigation menu for all residents and committee members in that society.
   - Toggling **OFF** hides the module tab and restricts underlying API execution while keeping past historical data securely stored in the database.

---

## Phase 3: Daily & Monthly Operational Workflows

### 3.1 Maintenance Calculation Rules & Billing Configuration
Configure society maintenance rules in **Admin Console ➔ Billing & Financial Engine**:

1. **Select Maintenance Fee Structure:**
   - **Flat Rate:** Same fixed charge for every flat (e.g., ₹2,500/month).
   - **Area-Based (Per SqFt):** Charged according to flat square footage (e.g., ₹3.50/sq.ft × 1,200 sq.ft = ₹4,200/month).
   - **Hybrid / Tiered:** Fixed base fee + sub-meter additions (e.g., Base Maintenance + Water Consumption + Parking Fee).
2. **Configure Penalty Rules:**
   - **Due Date:** Default cutoff day of the month (e.g., 10th of every month).
   - **Grace Period:** Number of grace days before late fee accrues (e.g., 5 days).
   - **Late Penalty Fee:** Fixed late fee (e.g., ₹200) or interest rate (e.g., 12% per annum pro-rata).
3. **Save Configuration:** Updates apply to all upcoming batch invoice cycles.

---

### 3.2 Automated Monthly Batch Invoicing
Generate monthly dues across all society flats in 1 click:

1. Go to **Financials ➔ Invoices ➔ Generate Batch Invoices**.
2. Select Billing Month & Year (e.g., *August 2026*).
3. System automatically calculates total payable for each flat:
   $$\text{Total Invoice} = \text{Base Maintenance} + \text{Water Meter Usage} + \text{Parking Fees} + \text{Arrears} - \text{Advance Credits}$$
4. Review draft ledger preview.
5. Click **Publish & Broadcast Invoices**.
6. Invoices are generated, and instant push notifications/emails with direct UPI payment links are dispatched to all residents.

---

### 3.3 Gatekeeper Security & Visitor Pass Management
Ensure robust security at the main entry gates:

1. **Gate Guard Login:** Security guards use the dedicated **Gatekeeper Kiosk** interface logged in under the security guard passcode.
2. **Walk-in / Delivery Visitor Arrival:**
   - Guard enters Visitor Name, Mobile Number, Vehicle Number, Purpose (Delivery/Cab/Guest/Service), and Target Flat No.
   - System triggers a real-time **Expo Push Notification** to the target flat's resident mobile device.
   - Resident receives popup: *"Delivery partner Amazon at Gate. Approve entry?"*
   - Resident taps **Approve** ➔ Gatekeeper screen turns green and displays *"Entry Granted"*.
3. **Pre-Approved Guest Pass:**
   - Resident opens mobile app ➔ **Add Pre-Approved Guest**.
   - Generates a 6-digit OTP or QR pass valid for a specific date range.
   - Guest presents QR/OTP at gate ➔ Guard scans code for instant 1-tap entry without calling the resident.

---

### 3.4 Publishing Digital Notices & Launching AGM Polls

#### Publishing Notices:
1. Navigate to **Notices & Broadcasts ➔ Create Notice**.
2. Input Title, Category (*Maintenance, AGM, Event, Emergency*), and Notice Content.
3. Attach optional PDF documents (e.g., *Audited Accounts FY25-26.pdf*).
4. Click **Publish & Send Broadcast**. All residents receive instant push notifications.

#### Launching AGM E-Voting Polls:
1. Go to **Governance & Polls ➔ Create Poll**.
2. Enter Poll Title, Motion Description, and Voting Deadline.
3. Configure Options (e.g., *Approved, Rejected, Abstain*).
4. **Enforce 1-Flat = 1-Vote Rule:** System blocks multiple votes from the same flat number.
5. Real-time voting progress bar and quorum percentage update live on committee dashboards.

---

### 3.5 Resident Payments & Treasurer Receipts Reconciliation

1. **Resident Payment Experience:**
   - Resident opens **My Dues** on Web or Mobile App.
   - Taps **Pay Now** on an unpaid invoice.
   - Chooses **Dynamic UPI QR Code** (GPay, PhonePe, Paytm) or **Payment Gateway** (Razorpay / Credit Card / Netbanking).
   - Upon completing payment, transaction hash and screenshot are logged.
2. **Treasurer Approval & Verification:**
   - Automated Webhooks verify gateway payments and transition invoice status from `Unpaid` to `Paid` instantly.
   - For manual bank transfer/offline checks, the Treasurer opens **Financial Ledger ➔ Pending Approvals**, verifies the bank credit, and clicks **Approve Payment**.
   - An official PDF Payment Receipt with GST breakups is generated and emailed to the resident.

---

## Phase 4: Troubleshooting, Errors & Solutions Matrix

| Error Scenario | Root Cause | Step-by-Step Resolution Procedure |
| :--- | :--- | :--- |
| **"Resident unable to log in / Phone number not found"** | The resident's phone number is either not added to the Resident Directory or formatted without the proper country code prefix. | 1. Admin opens **Resident Directory**.<br>2. Search for the flat number.<br>3. Verify phone number format (+91 XXXXX XXXXX).<br>4. Ensure status is set to `Active`.<br>5. Click **Resend Login Invite**. |
| **"Duplicate flat entry error during CSV import"** | The CSV file contains duplicate flat numbers, or the flat already exists in the society registry. | 1. Open the CSV file in Excel/Google Sheets.<br>2. Run **Remove Duplicates** on `FlatNo` column.<br>3. In Admin Console, check if flats are already registered under a different Wing.<br>4. Re-upload clean CSV. |
| **"Maintenance invoice generated with incorrect amount"** | Inaccurate area (SqFt) setting in flat profile or incorrect base rate configuration in Billing Rules. | 1. Go to **Billing Rules** and verify flat rate vs. per SqFt rate.<br>2. Check flat details under **Resident Directory** to ensure correct SqFt area.<br>3. Delete draft batch invoice, update rates, and regenerate batch. |
| **"Payment receipt submitted but invoice status still shows Overdue"** | Offline bank payment pending Treasurer approval or payment gateway webhook callback failed. | 1. Treasurer opens **Payments Ledger ➔ Pending Approvals**.<br>2. Verify transaction reference number against society bank statement.<br>3. Click **Approve Payment** to flip status to `Paid`. |
| **"Gatekeeper push notification not received by resident"** | Mobile device lacks Expo Push Token registration or notifications disabled in OS settings. | 1. Ensure resident has logged into the mobile app on a physical device.<br>2. Verify notification permissions in phone Settings.<br>3. Check token status in **Admin Console ➔ Push Tokens Register**. |
| **"Water meter reading entry fails or displays negative consumption"** | Current meter reading entered is less than the previous recorded reading. | 1. Verify physical meter dial.<br>2. Ensure current reading > previous month reading.<br>3. If meter was replaced, log a **Meter Replacement Entry** in the Water Meter module to reset baseline. |
| **"Poll vote rejected ('You have already voted for this flat')"** | Another registered member/co-owner from the same flat number has already submitted a ballot for this motion. | 1. Platform strictly enforces 1-Flat = 1-Vote policy as per Bye-Law 114.<br>2. Admin can inspect voting audit trail to view timestamp and member who cast the flat's vote. |

---
*Manual Version 2.5 — Generated for Housing Society Management Platform*
