# Co-op Housing Society Digital Management Platform

A highly polished, modern, and production-ready digital operations platform designed for **Co-op Housing Societies**, **Apartment Complexes**, and **Gated Communities**. This full-stack system pairs a **Super-Admin Developer Panel** with an interactive **Mobile Simulator** replicating a native iOS/Android companion app experience built on **Expo SDK 51** and backed by a **Supabase REST Database API**.

---

## 🚀 Key Achievements & Core Functionalities

### 1. Multi-Tenant Architecture
* **Super-Admin Console**: A dedicated super-admin control panel on the desktop dashboard allows registering new customer societies (housing societies, residential co-operatives, or commercial complexes).
* **Instant Tenant Allocation**: Creating a new customer allocates a secure tenant ID, seeds a welcome bulletin, and automatically loads mock default starter members.
* **Seamless Context Switching**: Real-time hot-reloading switches active tenant datasets (residents, complaints, bulletins, accounts) instantly without browser reloads.

### 2. Multi-Role Mobile Simulator (Admin & Resident App)
* **Visual Device Shell**: An elegant mobile viewport matching modern mobile dimensions with customized typography and smooth interactions.
* **Role-Based Workspaces**:
  * **Admin View**: Access to settings, ledger controls, notice publishing, member status editing, and audit logging.
  * **Resident View**: View outstanding dues, log online maintenance payments, track complaints, and view active bulletins.
* **Secure Simulated Authentication**:
  * Quick-login by selecting pre-configured flats or inputting code credentials (e.g., `gw100` for Greenwood Residency, `rh200` for Royal Heights, `sb300` for Sea Breeze).
  * Gate security authentication using administrative passcodes (e.g., `admin123`).

### 3. Feature-Rich Functional Modules

#### 🏢 Members Directory
* **Wing Subdivisions**: Support for single-block buildings or complex multi-wing communities (e.g. Wing A, Tower B) with fast filter buttons.
* **Resident Profiles**: Track flat ownership status (Owner vs. Tenant), detailed contact information, email records, and co-owners lists.
* **Search & Navigation**: Instantly search members by flat number, name, or status.

#### 💳 Accounts & Ledger
* **Maintenance Tracker**: High-visibility balance cards indicating outstanding dues and prepaid accounts.
* **Payment Recorder**: Record digital payments instantly with support for custom transaction amounts, methods (UPI, Bank Transfer, Cash), reference IDs, and automatic ledger adjustments.

#### 💸 Expense Tracker
* **Operating Expenditures**: Log repairs, diesel purchases, security vendor payments, and housekeeping costs.
* **Categorization & Ledger Deductions**: View categorized expenses with specific billing dates and detailed descriptions.

#### 📋 Complaints Desk
* **Grievance Resolution**: Residents can file maintenance, security, or billing issues directly from the app.
* **Admin Controls**: Society Admins can transition complaint statuses (Open ➔ In Progress ➔ Resolved) with automatic audit trailing.

#### 📣 Notice Board Bulletin & Document Center
* **Dynamic Broadcasting**: Admins can publish urgent updates (e.g., Water Shutdowns, Annual General Meetings) with priority tags (Event, Maintenance, Security, General).
* **Committee-Only Document Attachments**: Notice drafting and document uploads are restricted to Committee Members (Admin role). Includes an interactive drag-and-drop simulated attachment interface supporting PDF, DOCX, and JPG circular uploads.
* **Immersive Circular Viewer**: Residents can preview official notice documents within an immersive, high-fidelity modal. Features include responsive document zoom, digital letterhead generation, official society seals, and electronic signatures.

#### 🏠 Multi-Unit Ownership Swapper
* **Single-Owner Multi-Flat Handling**: Detects when a resident owns more than one flat within the same society (mapped by registered email or contact details).
* **Real-time Context Switching**: Adds a dynamic flat-swapper widget inside the resident's mobile dashboard. Selecting a different flat instantly updates the entire active dashboard context (maintenance balances, invoice records, pre-approved visitor gate logs, and logged complaints) on the fly.

#### 📅 Shared Facility Booking Calendar
* **Amenity Booking Hub**: Interactive scheduling dashboard for common amenities like the **Clubhouse**, **Party Hall**, and **Tennis Court**.
* **Automatic Ledger Integration**: Booking premium slots automatically computes rates and posts the reservation cost straight to the resident unit's balance sheet/outstanding dues ledger.
* **Conflict Resolution**: Smart scheduling engine prevents overlapping time-slot reservations for the same facility.

#### 🛡️ OTP-Based Verification & Multi-Factor Simulation
* **Secure Session MFA**: Secure Resident Sign-In includes an optional Multi-Factor toggle to simulate enterprise-grade security.
* **Interactive SMS Push Notifications**: Simulates SMS delivery by triggering animated, full-fidelity message banners at the top of the mobile device containing randomized 4-digit verification codes.
* **Live Audit Terminal Logs**: Integrated real-time security log terminal inside the sign-in modal displaying full transaction logs, status updates (Success, Failure, Resent), and security telemetry.

---

## 🛠️ Technology Stack & Project Structure

* **Frontend Framework**: React 18, TypeScript, and Vite.
* **Styling**: Tailwind CSS for responsive desktop layouts, styled with custom shadows, spacious padding, and deep slate/purple themes.
* **Database & Sync**: Real-time persistence using `localStorage` with built-in REST API synchronization endpoints matching **Supabase PostgreSQL** specifications.
* **Native Companion Code**: Includes a copyable React Native source code viewer compiled for Expo SDK 51.

---

## 💻 Quick Start & Testing Guide

1. **Accessing the Super-Admin panel**:
   * Navigate to the **Developer Control Panel** on the right side of the desktop page.
   * Click **Register New Customer (Society)** to set up custom tenants instantly.
2. **Logging into the Mobile App**:
   * Use flat credentials displayed in the active list (e.g., click Flat 101 or copy flat code `gw100`).
   * For Admin privileges, switch the toggle or authenticate with passcode `admin123`.
3. **Data Syncing**:
   * Click the **Refresh Button** (🔄) to perform live synchronizations with the connected database backend.
