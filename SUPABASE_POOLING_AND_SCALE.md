# Supabase Database Connection Pooling & High Concurrency Scaling Guide

To scale your Housing Society Management application to hundreds of societies and tens of thousands of concurrent mobile app users without exceeding connection limits or stalling PostgREST API calls, follow these production database configuration guidelines.

---

## 1. Connection Pooler Setup (Supavisor / PgBouncer)

Mobile applications establish frequent, short-lived HTTP/REST and WebSocket connections. Connecting thousands of mobile clients directly to PostgreSQL's session-based port (`5432`) quickly exhausts PostgreSQL `max_connections` (typically capped at 100-500 connections on standard tiers).

### Recommended Settings:
- **Pooler Engine**: Supavisor (Default in Supabase) or PgBouncer
- **Pool Mode**: **Transaction** (Crucial for high-concurrency stateless API queries)
- **Port**: Connect via port **`6543`** (instead of standard PostgreSQL port `5432`)
- **Default Pool Size**: `20` - `50` server connections
- **Max Client Connections**: Up to `10,000` concurrent clients

### Transaction Mode Benefits:
In **Transaction Mode**, a single database connection is assigned to a client only for the duration of an active transaction or HTTP REST query, and returned to the pool immediately afterwards. This allows 50 database pool connections to handle 10,000+ active mobile users seamlessly.

---

## 2. Query Projection Optimization

Avoid unbounded `SELECT *` queries on large directory tables (`Members`, `Visitors`, `AuditLogs`, `Invoices`, `Payments`). 

Always explicitly select required column projections to minimize network bandwidth and database memory overhead:

```ts
// Optimized REST Projection Example
fetch(`${SUPABASE_URL}/rest/v1/Members?select=id,SocietyId,FlatNo,OwnerName,ContactNo,Balance,Status,Wing`)
```

---

## 3. Offloading Heavy Batch Jobs to Serverless Edge Functions

Heavy operations like generating 500+ monthly flat invoices or broadcasting gate visitor arrival notifications should **never** run on the client mobile interface.

### Edge Functions Included in `/supabase/functions`:
1. **`generate-monthly-invoices`**:
   - Executes batch invoice calculation and single-transaction bulk INSERT for 500+ flats.
   - Run command: `supabase functions deploy generate-monthly-invoices`
2. **`send-gate-notifications`**:
   - Asynchronously triggers Web Push / SMS / Audit logs when a visitor checks in at the gate.
   - Run command: `supabase functions deploy send-gate-notifications`

---

## 4. SQL Composite Multi-Tenant Indexing

Ensure composite indexes exist on high-frequency query pairs in `SupabaseSchema.sql`:

```sql
CREATE INDEX IF NOT EXISTS idx_members_society_flat ON "Members" ("SocietyId", "FlatNo");
CREATE INDEX IF NOT EXISTS idx_invoices_society_status ON "Invoices" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_visitors_society_date ON "Visitors" ("SocietyId", "CheckInTime");
CREATE INDEX IF NOT EXISTS idx_complaints_society_status ON "Complaints" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_gatekeeper_logs ON "Visitors" ("SocietyId", "Status", "CheckInTime");
```
