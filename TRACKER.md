# Society Ledger — Implementation Tracker & Architecture Roadmap

This tracker outlines the core capabilities, ongoing enhancements, and newly prioritized requirements for **Society Ledger**, a modern full-stack society management system.

---

## 🚀 Core Features Matrix & Status

| Module | Feature | Target User | Priority | Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth & Multi-Society** | Multi-Society Selector | Resident & Admin | High | **Completed** | Enables a resident with flats in separate societies (e.g., Greenwood and Sea Breeze) to toggle societies in real-time. |
| **Auth & Multi-Society** | Multi-Unit Ownership Swapper | Resident | High | **Completed** | Allows residents with more than one flat inside the *same* society to swap their active flat unit context from a dropdown. |
| **Auth & Multi-Society** | First-Time Onboarding Wizard | System Admin | Medium | **Completed** | Step-by-step registration wizard for a brand-new society setup, configuring structures, towers, wings, and admin accounts. |
| **Notice & Communication** | Admin-Only Document Upload | Committee Admin | High | **Completed** | Role-gated document upload for notices. Admins can drag & drop or select documents (simulate actual files); residents get read-only view. |
| **Amenity Booking** | Shared Facility Booking Calendar | Resident | Medium | **Completed** | Real-time visual slot booking calendar for society clubhouse, party hall, and sports courts. |
| **Auth & Security** | OTP-Based MFA Verification Simulation | All Users | Medium | **Completed** | Simulates SMS/Email OTP code delivery and verification for first-time login, pre-approved gate passes, or high-value payments. |
| **Visitor Gatekeeper** | Pre-Approve Guest Pass | Resident | High | **Completed** | Residents issue a pre-approved pass. The security gate instantly authorizes entry when checked. |
| **Visitor Gatekeeper** | Gatekeeper Terminal Console | Security / Admin | High | **Completed** | Live simulator of a gate security cabin. Register visitors, request active resident authorization, and check-out. |
| **Billing & Invoicing** | Auto Monthly Billing Run | Committee Admin | High | **Completed** | One-click invoice engine generating monthly maintenance, water, security, and utility bills for all resident units. |
| **Billing & Invoicing** | Member Payment Portal | Resident | High | **Completed** | Residents pay outstanding bills via simulated UPI, cash, cheque, or bank transfer with ledger tracking. |
| **Complaints & Helpdesk** | Interactive Discussion Thread | Resident & Admin | Medium | **Completed** | Multi-user chat thread on any open/active complaint for troubleshooting. |
| **Emergency & Helpdesk** | SOS & Emergency Contacts Directory | Resident & Admin | High | **Completed** | Quick dial and emergency helpline directory (Plumber, Electrician, Police, Fire, Committee) with search & priority badges. |
| **Resident Management** | Tenant Register & KYC Tracker | Resident & Admin | High | **Completed** | Comprehensive register for tenant move-in/move-out dates, rental agreements, ID proof document attachments, and police verification status. |
| **Vehicle & Parking** | Vehicle Register & Guest Slot Passes | Resident & Admin | High | **Completed** | Resident vehicle sticker tracking (license plates, slot #s) and guest parking pass issuer with temporary slot allocations. |
| **Document Vault** | Society Document Repository | All Users | Medium | **Completed** | Central repository for society bylaws, AGM minutes, annual audit reports, and public circulars with role-gated upload permissions. |
| **Asset & Maintenance** | Asset AMC & Lift Servicing Tracker | Committee Admin | Medium | **Completed** | Vendor contract tracking for lifts, DG sets, gym equipment, and fire safety systems with service due alerts and report URLs. |
| **Water Management** | Water Meter & Tank Cleaning Tracker | Resident & Admin | Medium | **Completed** | Flat-wise sub-meter reading logs, unit consumption tracking, and tank cleaning schedule updates. |
| **Database & Export** | Supabase SQL Sync & Expo Hub | System Admin | High | **Completed** | Full DDL SQL schema generation including all 19 core tables (`EmergencyContacts`, `Tenants`, `Vehicles`, `GuestParking`, `SocietyDocuments`, `AssetAMCs`, `WaterMeters`, etc.) with RLS policies and code exports. |
| **UI & UX Theme** | Dynamic Light/Dark Theme Adaptation | All Users | Medium | **Completed** | Comprehensive theme-aware UI in `MobileSimulator` and main app shell, auto-adjusting buttons, badges, navigation, and modal styling. |

---

## 🎯 Prioritized Implementation Specifications

### Priority 1: Multi-Unit Ownership Swapper (High Priority)
* **Goal**: Enable a single email address (e.g., Amit Sharma) to own multiple flats inside the same society (e.g., Greenwood Flat 101 and Flat 302).
* **Status**: **Completed**

### Priority 2: Gated Notice Document Upload & Preview (High Priority)
* **Goal**: Ensure notices are highly professional and document-secured. Gated creation to Committee Members only.
* **Status**: **Completed**

### Priority 3: Society Hierarchical Structural Modeling (Medium Priority)
* **Goal**: Replicate complex real-world layouts instead of flat strings.
* **Status**: **Completed**

### Priority 4: First-Time Onboarding & Registration Wizard (Medium Priority)
* **Goal**: A step-by-step wizard for newly launching the application.
* **Status**: **Completed**

### Priority 5: Shared Facility & Amenity Booking Calendar (Medium Priority)
* **Goal**: Provide residents a visual booking system for common amenities.
* **Status**: **Completed**

### Priority 6: OTP-Based Verification & Multi-Factor Simulation (Medium Priority)
* **Goal**: Add realistic multi-factor security loops for high-value actions.
* **Status**: **Completed**

### Priority 7: Essential Society Services (Tiers 1 & 2 Modules) (High Priority)
* **Goal**: Expand capabilities into emergency SOS, tenant KYC, vehicle parking passes, document vault, AMC vendor contracts, and water meter maintenance.
* **Status**: **Completed**

---

## 🛠️ Execution Action Plan

1. [x] **Phase 1: Multi-Unit Swapper & notices Gating**
2. [x] **Phase 2: Advanced Structural Types & Schema Upgrade**
3. [x] **Phase 3: Interactive Onboarding & Registration Wizard**
4. [x] **Phase 4: Shared Facility Booking & OTP MFA Simulation**
5. [x] **Phase 5: Tiers 1 & 2 Society Services Expansion (SOS, Tenants, Vehicles, Docs, AMC, Water)**
6. [x] **Phase 6: Supabase SQL Schema Sync & RLS Policies Update**
7. [x] **Phase 7: MobileSimulator & Shell Light/Dark Theme Adaptation**

---

## ⏳ Pending & Future Roadmap Items (Under Consideration)

The following items represent remaining potential enhancements and future roadmap concepts:

1. **Dashboard Alert Banner (High-Priority Notices)** — *Pending / Roadmap*
   - Display a persistent high-contrast top notification banner on the resident home tab for critical emergencies (e.g. "Water Supply suspended today 10am - 4pm").

2. **One-Click Ledger PDF/Print Export** — *Pending / Roadmap*
   - Printable receipt and ledger statement generator for resident maintenance payments.

3. **Real-time Push Notification Simulation** — *Pending / Roadmap*
   - In-app notification center modal with unread badge counter for immediate gate arrivals, notice broadcasts, and payment reminders.

4. **Biometric / QR Code Gatekeeper Scanner** — *Pending / Roadmap*
   - QR scanner simulator for gate security officers to quickly validate pre-approved visitor passes.


