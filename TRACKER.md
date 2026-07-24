# Society Ledger — Implementation Tracker & Architecture Roadmap

This tracker outlines the core capabilities, ongoing enhancements, and newly prioritized requirements for **Society Ledger**, a modern full-stack society management system.

---

## 🚀 Core Features Matrix & Status

| Module | Feature | Target User | Priority | Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth & Multi-Society** | Multi-Society Selector | Resident & Admin | High | **Completed** | Enables a resident with flats in separate societies (e.g., Greenwood and Sea Breeze) to toggle societies in real-time. |
| **Auth & Multi-Society** | Multi-Unit Ownership Swapper | Resident | High | **Completed** | Allows residents with more than one flat inside the *same* society to swap their active flat unit context from a dropdown. |
| **Auth & Multi-Society** | First-Time Onboarding Wizard | System Admin | Medium | **Completed** | Step-by-step registration wizard for a brand-new society setup, configuring structures, towers, wings, and admin accounts. |
| **Auth & Disambiguation** | Duplicate Name Disambiguation Engine | System Admin | High | **Completed** | Auto-generates unique `SocietyCode` (e.g., `OMRE1`, `OMRE2`) and URL short-hash slugs to prevent credential collisions for identical society names. |
| **Auth & Security** | Forced First-Time Password Reset Gate | All Users | High | **Completed** | Intercepts logins with temporary passwords (`MustChangePassword: true`) and forces route guard redirection to password change screen. |
| **Committee Governance** | Granular Committee RBAC Console | Admin & Committee | High | **Completed** | Interactive console (`CommitteeManagement.tsx`) to manage and assign 7 granular roles (`SOCIETY_ADMIN`, `TREASURER`, `SECRETARY`, `GATE_STAFF`, etc.) with permission matrix. |
| **Tenant Governance** | Configurable Module Catalog & Toggles | Admin & Committee | High | **Completed** | Discretionary JSONB toggles (`enabled_modules` & `module_settings`) to activate/deactivate features with automatic API & UI gating (HTTP 403 / 0 rows). |
| **Notice & Communication** | Admin-Only Document Upload | Committee Admin | High | **Completed** | Role-gated document upload for notices. Admins can drag & drop or select documents (simulate actual files); residents get read-only view. |
| **Amenity Booking** | Shared Facility Booking Calendar | Resident | Medium | **Completed** | Real-time visual slot booking calendar for society clubhouse, party hall, and sports courts. |
| **Auth & Security** | OTP-Based MFA Verification Simulation | All Users | Medium | **Completed** | Simulates SMS/Email OTP code delivery and verification for first-time login, pre-approved gate passes, or high-value payments. |
| **Visitor Gatekeeper** | Pre-Approve Guest Pass | Resident | High | **Completed** | Residents issue a pre-approved pass. The security gate instantly authorizes entry when checked. |
| **Visitor Gatekeeper** | Gatekeeper Terminal Console & QR Scanner | Security / Admin | High | **Completed** | Live simulator of a gate security cabin with camera/QR code scanner for quick validation of pre-approved visitor passes. |
| **Billing & Invoicing** | Auto Monthly Billing Run | Committee Admin | High | **Completed** | One-click invoice engine generating monthly maintenance, water, security, and utility bills for all resident units. |
| **Billing & Invoicing** | Member Payment Portal & PDF Receipt | Resident | High | **Completed** | Residents pay outstanding bills via simulated UPI, cash, cheque, or bank transfer with printable ledger receipts. |
| **Complaints & Helpdesk** | Interactive Discussion Thread | Resident & Admin | Medium | **Completed** | Multi-user chat thread on any open/active complaint for troubleshooting. |
| **Emergency & Helpdesk** | SOS Directory & Top Alert Banner | Resident & Admin | High | **Completed** | High-visibility top emergency notification banner on resident home view and SOS dial directory (Plumber, Electrician, Police, Fire, Committee). |
| **Notifications & Bell** | Bell Center Modal & AMC Auto Alert | All Users | High | **Completed** | Real-time notification center modal with unread count badges, system push triggers, and 30-day AMC expiry auto-alerts. |
| **Staff & Security** | Domestic Staff Entry & Gate Tracking | Guard & Resident | High | **Completed** | Passcode check-in/check-out for maids, cooks, and drivers with live 'Inside Premises' directory and attendance logs. |
| **NOC & Move-In/Out** | Resident NOC Clearance Workflow | Resident & Admin | High | **Completed** | Step-by-step NOC application, dual Treasurer dues clearance + Secretary issuing approvals, and move-in deposit tracking. |
| **Asset & Maintenance** | Society Asset & AMC Service Register | Committee Admin | High | **Completed** | Full inventory register for elevators, generators, water pumps, fire safety, with warranty dates and vendor contracts. |
| **Resident Management** | Tenant Register & KYC Tracker | Resident & Admin | High | **Completed** | Comprehensive register for tenant move-in/move-out dates, rental agreements, ID proof document attachments, and police verification status. |
| **Vehicle & Parking** | Vehicle Register & Guest Slot Passes | Resident & Admin | High | **Completed** | Resident vehicle sticker tracking (license plates, slot #s) and guest parking pass issuer with temporary slot allocations. |
| **Document Vault** | Society Document Repository | All Users | Medium | **Completed** | Central repository for society bylaws, AGM minutes, annual audit reports, and public circulars with role-gated upload permissions. |
| **Water Management** | Water Meter & Tank Cleaning Tracker | Resident & Admin | Medium | **Completed** | Flat-wise sub-meter reading logs, unit consumption tracking, and tank cleaning schedule updates. |
| **Database & Export** | Supabase SQL Sync & Expo Hub | System Admin | High | **Completed** | Full DDL SQL schema generation including all 39 core tables with RLS security policies, triggers, and Expo code exports. |
| **Admin Utilities** | Credential Delivery Log & Tracker | System Admin | Medium | **Completed** | Track, copy, and dispatch temporary passwords and welcome credentials to newly onboarded society administrators with audit logs. |
| **Automated Testing** | E2E & Boundary Test Suite (51 Tests) | System Admin | High | **Completed** | Full Jest + Playwright + Supabase CLI test suite covering happy paths, negative boundaries, RLS isolation, performance SLA (<0.5ms), and RBAC (51/51 passing). |
| **Billing & Ledger** | Flat-Level Dues History & Invoice Ledger | Resident & Admin | High | **Completed** | Filters invoices and payments for a specific flat, displaying a chronological transaction ledger with type, status badges, and payment modes. |
| **Financial Analytics** | Recharts Financial Insights Panel | Treasurer & Admin | High | **Completed** | Interactive `BarChart` component grouping society expenses by `Category` to visualize monthly spending patterns and budget allocations. |
| **Network & Resilience** | IndexedDB Offline Queue & Re-Sync Engine | All Users | High | **Completed** | Intercepts failed network mutations into IndexedDB (`society_offline_store`) and provides an **Offline Sync Status Banner** with a **"Sync Now"** button. |
| **Member Onboarding** | CSV Member Directory Bulk Import | Admin | High | **Completed** | CSV-to-JSON parser component allowing admins to download a template, validate rows, and batch import members directly into the local directory and database. |
| **Documentation** | Multi-Document Operational Manuals | All Users | High | **Completed** | Complete `DOCS_HOW_TO_MANUAL.md`, `DOCS_CONFIGURABLE_ITEMS_GUIDE.md`, `DOCS_TEST_SUITES_AND_AUTOMATION.md`, and in-app Configs drawer. |
| **UI & UX Theme** | Dynamic Light/Dark Theme Adaptation | All Users | Medium | **Completed** | Comprehensive theme-aware UI in `MobileSimulator` and main app shell, auto-adjusting buttons, badges, navigation, and modal styling. |

---

## 🎯 Implementation Highlights

### Priority 1: Multi-Unit Ownership Swapper
* **Goal**: Enable a single email address (e.g., Amit Sharma) to own multiple flats inside the same society (e.g., Greenwood Flat 101 and Flat 302).
* **Status**: **Completed**

### Priority 2: Gated Notice Document Upload & Preview
* **Goal**: Ensure notices are highly professional and document-secured. Gated creation to Committee Members only.
* **Status**: **Completed**

### Priority 3: Domestic Staff Entry & Attendance Module
* **Goal**: Enable gate guards and residents to track maids, cooks, drivers, and daily staff with passcode/QR entry and live attendance logs.
* **Status**: **Completed**

### Priority 4: NOC Clearance & Move-In Deposit Workflow
* **Goal**: Multi-step NOC workflow for move-in and move-out requests with Treasurer dues verification and Secretary issuance.
* **Status**: **Completed**

### Priority 5: Asset Inventory & AMC Warranty Expiry Register
* **Goal**: Society asset inventory (elevators, DG sets, fire safety) with vendor contract tracking and automated 30-day expiry notifications.
* **Status**: **Completed**

### Priority 6: Notification Bell Center & Auto Expiry Engine
* **Goal**: Unread badge count, category filtering, push notification trigger service, and auto-dispatch for urgent system events.
* **Status**: **Completed**

### Priority 7: High-Visibility Emergency Alert Top Banner
* **Goal**: Sticky alert banner on top of the resident home screen for critical water, power, or security emergencies.
* **Status**: **Completed**

### Priority 8: One-Click Printable Maintenance Invoice PDF
* **Goal**: Professional printable receipt statement with statutory GST breakups, payment IDs, and society header.
* **Status**: **Completed**

### Priority 9: Camera / QR Gatekeeper Scanner Simulator
* **Goal**: Interactive QR pass scanner in the Gatekeeper kiosk for instant visitor validation.
* **Status**: **Completed**

### Priority 10: Automated Test Suite Expansion (51 Tests, 100% Pass Rate)
* **Goal**: Full automated test suite across 15 test files validating all core capabilities, security boundaries, and edge cases.
* **Status**: **Completed (51/51 Passing)**

---

## 🛠️ Execution Action Plan

1. [x] **Phase 1: Multi-Unit Swapper & Notices Gating**
2. [x] **Phase 2: Advanced Structural Types & Schema Upgrade**
3. [x] **Phase 3: Interactive Onboarding & Registration Wizard**
4. [x] **Phase 4: Shared Facility Booking & OTP MFA Simulation**
5. [x] **Phase 5: Tiers 1 & 2 Society Services Expansion (SOS, Tenants, Vehicles, Docs, AMC, Water)**
6. [x] **Phase 6: Supabase SQL Schema Sync & RLS Policies Update**
7. [x] **Phase 7: MobileSimulator & Shell Light/Dark Theme Adaptation**
8. [x] **Phase 8: Duplicate Name Disambiguation (`SocietyCode` & Slug) & Forced Password Reset Gate**
9. [x] **Phase 9: Committee RBAC Management Console & Module Catalog Settings Modal**
10. [x] **Phase 10: Staff Tracking, NOC Clearance, Asset AMC Register & Notification Engine**
11. [x] **Phase 11: Automated Test Suite Expansion (51 Tests) & Operational Manuals (`DOCS_*.md`)**

---

## 🟢 Status Overview

All core capabilities, operational modules, automated test suites, and documentation manuals are **100% complete, verified, and passing**.
