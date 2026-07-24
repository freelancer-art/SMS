# Co-op Housing Society Digital Operations & SaaS Platform

A highly polished, modern, and production-ready digital operations platform designed for **Co-op Housing Societies**, **Apartment Complexes**, and **Gated Communities**. This full-stack system pairs a **Super-Admin Developer Panel** with an interactive **Mobile Simulator** replicating a native iOS/Android companion app experience built on **Expo SDK 51** and backed by a **Supabase REST Database API**.

---

## 📚 Platform Manuals & Documentation Library

Complete operational guides, configurable settings specifications, and automated test suite documentation are maintained in the root repository:

1. 📖 **[Master How-To Operational Manual (SOP)](./DOCS_HOW_TO_MANUAL.md)**: End-to-end administration guide covering society onboarding, committee RBAC assignments, module catalog toggles, batch invoicing, gatekeeper visitor passes, and troubleshooting workflows.
2. ⚙️ **[Configurable Items & Module Settings Manual](./DOCS_CONFIGURABLE_ITEMS_GUIDE.md)**: Field-by-field specification matrix detailing expected inputs, data types, validation rules, default values, and JSONB schemas across all platform modules.
3. 🧪 **[Automated Testing & Security Boundaries Manual](./DOCS_TEST_SUITES_AND_AUTOMATION.md)**: Full reference for the 41+ automated E2E Jest, Playwright, and Supabase RLS security test cases, performance SLAs, boundary constraints, and CLI execution commands.

---

## 🚀 Key Achievements & Core Functionalities

### 1. Multi-Tenant Architecture & Duplicate Disambiguation
* **Super-Admin Console**: Dedicated control panel to register customer societies (housing societies, residential co-operatives, commercial complexes).
* **Automated Disambiguation Engine**: Prevents credential routing collisions when societies share identical names (*"Om Residency"*) by auto-generating unique `SocietyCode` identifiers (`OMRE1`, `OMRE2`) and URL slugs (`om-residency-a1b2c3`).
* **Instant Tenant Allocation**: Allocates isolated database tenant IDs, seeds welcome circulars, and loads starter member directories.

### 2. Committee Governance & Granular RBAC Permissions
* **7 Standard Roles**: Dedicated access control for `SOCIETY_ADMIN`, `PRESIDENT`, `SECRETARY`, `TREASURER`, `AUDITOR`, `GATE_STAFF`, and `RESIDENT`.
* **Granular Permission Keys**: Enforces operational boundaries (`billing:write`, `gatekeeper:write`, `voting:write`, `committee:write`, `settings:write`).

### 3. Discretionary Module Catalog & Feature Toggles
* **Tenant Discretion**: Societies toggle modules ON/OFF individually via `enabled_modules` JSONB configuration settings (`gatekeeper`, `billing`, `voting`, `water_meters`, `facility_booking`, `tenants`, `document_vault`).
* **RLS Enforcement**: Disabling a module hides visual tabs and enforces HTTP 403 / 0-row restrictions on underlying API routes.

### 4. Multi-Role Mobile Simulator (Admin & Resident App)
* **Visual Device Shell**: Elegant mobile viewport matching modern smartphone dimensions with Expo SDK 51 companion code.
* **Role-Based Workspaces**:
  * **Admin View**: Access to settings, ledger controls, notice publishing, committee RBAC, and audit logging.
  * **Resident View**: View outstanding dues, log online maintenance payments, track complaints, pre-approve guest passes, and vote in AGM polls.

---

## 🧪 Automated Test Suite Execution Commands

```bash
# Run all Jest automated test suites (41+ tests across 13 files)
npm run test:all

# Run E2E Playwright tests
npm run test:e2e

# Run Supabase RLS cross-tenant security isolation tests
npm run test:security
```

---

## 🛠️ Technology Stack & Project Structure

* **Frontend Framework**: React 18, TypeScript, and Vite.
* **Styling**: Tailwind CSS for responsive desktop layouts, styled with custom shadows, spacious padding, and deep slate/purple themes.
* **Database & Persistence**: Real-time persistence with built-in REST API endpoints matching **Supabase PostgreSQL** specifications.
* **Testing Framework**: Jest, Playwright, and Supabase CLI test runners.
* **Native Companion Code**: Includes copyable React Native source code compiled for Expo SDK 51.

---
*Smart Co-op Housing Society Management SaaS Platform v3.0*
