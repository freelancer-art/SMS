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

---

## 🎯 Prioritized Implementation Specifications

### Priority 1: Multi-Unit Ownership Swapper (High Priority)
* **Goal**: Enable a single email address (e.g., Amit Sharma) to own multiple flats inside the same society (e.g., Greenwood Flat 101 and Flat 302).
* **Functional Requirements**:
  1. Scan all member entries matching the logged-in email.
  2. If count > 1, show a **"Select Active Flat"** dropdown in the resident dashboard header.
  3. Swapping the active flat instantly triggers a context refresh across:
     - Dues and outstanding balance.
     - Paid/Unpaid invoice lists.
     - Unit-specific visitor alerts & gate authorizations.
     - Personal complaint logs.
* **UX Design**: A compact, floating badge in the navigation area: `🏠 Flat: 101 (Active) ▾` with a dropdown listing other owned units in that society.

---

### Priority 2: Gated Notice Document Upload & Preview (High Priority)
* **Goal**: Ensure notices are highly professional and document-secured. Gated creation to Committee Members only.
* **Functional Requirements**:
  1. **Upload Restriction**: Show the notice drafting panel and "Add Attachment" button **only** to users whose role is `'Admin'` (Committee Members).
  2. **Simulated Drag & Drop / File Select**: Interactive upload element supporting PDF, DOCX, and JPG types. Allow selecting from a list of standard templates (e.g. *Water Billing Revision.pdf*, *AGM Meeting Circular.pdf*) or dragging local files to simulate real uploads.
  3. **High-Fidelity Document Card**: Display uploaded attachments as custom stylized document cards with icons, file size tags, and download triggers.
  4. **Viewer Role**: Regular Members see a static card view with a "Download Circular" button and an integrated previewer modal.

---

### Priority 3: Society Hierarchical Structural Modeling (Medium Priority)
* **Goal**: Replicate complex real-world layouts instead of flat strings.
* **Model Structures**:
  1. **Standalone Building**: Single tower, 1 to $N$ floors, with numeric flats per floor (e.g. 101, 102).
  2. **Multiple Wings**: Single project split into wings (e.g. Wing A, Wing B), flat numbers containing wing prefixes (A-101, B-102).
  3. **Towers with Wings**: Large multi-tower projects where each Tower (Tower 1, Tower 2) contains specific wings (Wing A, Wing B), and flats map to nested hierarchies (e.g., `Tower 1 ➔ Wing A ➔ Flat 101`).
* **Schema Evolution**:
  ```typescript
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
    StructureType: 'standalone' | 'wings' | 'towers_wings';
    Towers?: Tower[];
    Wings?: string[];
  }
  ```

---

### Priority 4: First-Time Onboarding & Registration Wizard (Medium Priority)
* **Goal**: A step-by-step wizard for newly launching the application.
* **Step-by-Step Flow**:
  1. **Basic Details**: Setup Name, Building Type, Postal Address, and Registering Authority Details.
  2. **Structural Topology Select**: Interactive UI choosing Standalone, Wings, or Towers with Wings. Configures the exact wings/towers.
  3. **Auto Flat Generator**: Admins define floors (e.g., 1 to 10) and units per floor (e.g., 4), instantly auto-generating the directory list of flats with custom prefixes.
  4. **Primary Admin Setup**: Create the initial Committee Secretary username, contact details, and secure login email.
* **First-Time Detection**: If the local registry has no societies, automatically redirect the app launcher to this Wizard.

---

### Priority 5: Shared Facility & Amenity Booking Calendar (Medium Priority)
* **Goal**: Provide residents a visual booking system for common amenities.
* **Functional Requirements**:
  1. Interactive reservation table or grid of slots for major facilities: **Clubhouse**, **Party Lawn**, and **Tennis Court**.
  2. Prevent overlapping bookings on the same date/time.
  3. Resident can book a slot, instantly appearing in the global schedule list; Admins can cancel or approve any request.

---

### Priority 6: OTP-Based Verification & Multi-Factor Simulation (Medium Priority)
* **Goal**: Add realistic multi-factor security loops for high-value actions.
* **Functional Requirements**:
  1. Simulates delivery of a 6-digit numeric OTP via a sleek pop-up notification toast or SMS simulator modal when logging in, pre-approving visitors, or making dues payments.
  2. Requires typing the exact code (e.g., `482910` displayed as a simulated text message) to verify the transaction.

---

## 🛠️ Execution Action Plan

1. [x] **Phase 1: Multi-Unit Swapper & notices Gating**
   - Implement logged-in email scanner.
   - Design and insert the Flat Swapper floating header control.
   - Refactor notice forms to hide the attachment button and posting panel for regular members. Include simulated attachment uploads for admins.
2. [x] **Phase 2: Advanced Structural Types & Schema Upgrade**
   - Update `types.ts` to support nested `Tower` and `StructureType` schemas.
   - Upgrade default database mock entries to match the new structure formats.
3. [x] **Phase 3: Interactive Onboarding & Registration Wizard**
   - Build a custom setup wizard view.
   - Add first-time launcher check and automatic redirection.
4. [x] **Phase 4: Shared Facility Booking & OTP MFA Simulation**
   - Implement amenity booking schedule interface.
   - Add simulated OTP MFA verification gates for secure triggers.

## 💡 Future Simplifications & High-Efficiency Ideas (Under Consideration)

The following simple, lightweight features are planned as secondary enhancements to provide high-value information without introducing architectural overhead:

1. **Dashboard Alert Banner (High-Priority Notices)**
   - Display a single high-contrast warning banner at the top of the resident home page for critical, time-sensitive events (e.g., "Water Supply suspended on Monday 10am-4pm").
   - Keeps residents instantly informed of key society updates at a single glance.

2. **One-Click Ledger PDF/Print Export**
   - Provide a lightweight print-friendly receipt layout or a simple PDF download of the resident's maintenance payment ledger.
   - Enables users to keep copies of transactions with zero server-side generation required.

