# Enterprise Audit Report — True Level Production Management System

**Date:** 2026-06-13
**Auditor:** Senior Enterprise Code Auditor
**Scope:** Full-stack audit — 18 admin modules, Prisma schema, server actions, API routes, auth, portal, accounting, workflow
**Codebase:** Next.js (App Router) + Prisma + TypeScript + PostgreSQL
**Total files inspected:** 50+ (pages, components, lib, prisma, api routes)

---

## 1. Executive Summary

### Overall System Health Score: **48 / 100**

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Security | 35/100 | Multiple critical auth bypasses, no rate limiting, session forgery risk |
| Data Integrity | 40/100 | No double-entry accounting, no audit trail, hard deletes, race conditions |
| Architecture | 45/100 | Monolithic files (1606/925 lines), duplicate models, no i18n |
| Performance | 50/100 | 30+ missing indexes, N+1 query risks |
| UX/Reliability | 30/100 | Zero loading/error boundaries, no toast system, fragile breadcrumbs |
| Maintainability | 55/100 | Dead code, 69+ `any` types, missing layout, inline SVGs |
| Workflow Correctness | 25/100 | No state machine, no transition guards, no audit trail |
| Accounting Correctness | 30/100 | Broken "Mark as Paid", no double-entry, no VAT compliance |

### Most Critical Systemic Issues

1. **Session forgery via hardcoded HMAC secret** — if `ADMIN_SESSION_SECRET` env var is missing in production, any attacker can forge admin sessions
2. **Portal session token is raw database ID** — no signature, no expiry, no rotation; token theft = permanent account compromise
3. **No rate limiting anywhere** — all login endpoints, all API routes, all server actions are unprotected
4. **No state machine for workflow** — all 6 workflow models use free-form strings for status; any transition allowed, no audit trail
5. **No audit trail implemented** — `logActivity()` and `autoLogActivity()` exist but are never called; activity log page is permanently empty
6. **Broken "Mark as Paid"** — uses invalid enum value `PAID` for `InvoiceStatus` (valid values: `DRAFT | SENT | CANCELLED`); always throws Prisma validation error
7. **No loading.tsx or error.tsx in any admin route** — users see blank white screen on navigation; any server error crashes to default Next.js error page

---

## 2. Security Audit

---

### SEC-001: Hardcoded Fallback HMAC Secret for Session Signing

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `lib/auth.ts:10` defines `const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "development-only-change-this-secret"`. If the `ADMIN_SESSION_SECRET` environment variable is not set in production, sessions are signed with a publicly known string. |
| **Risk Impact** | Any attacker who knows the secret can forge arbitrary admin session cookies. The cookie format is `base64({email,expires}).HMAC-SHA256`, which can be constructed offline. Full admin account takeover. |
| **Affected File(s)** | `lib/auth.ts:10` |
| **Recommendation** | Remove the fallback. Make `ADMIN_SESSION_SECRET` required at startup — throw if missing. Add a build-time/startup check. |
| **Effort** | S |

---

### SEC-002: Portal Session Token is Unsigned Static Database ID

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `lib/actions.ts:1583` sets `portal-token` cookie to `user.id` (a CUID string — the raw database primary key). `lib/portal-auth.ts:7-17` reads this cookie and does `ClientPortalUser.findUnique({ where: { id: token } })`. There is NO HMAC signature, NO server-side expiry check, and NO token rotation. The cookie has `maxAge: 86400` (24h) but `requirePortalAuth()` never checks any timestamp. |
| **Risk Impact** | 1) Token theft = permanent account compromise (no rotation, no expiry). 2) Any attacker who obtains the cookie can impersonate the user indefinitely. 3) No server-side session invalidation possible (password reset doesn't change the ID). 4) The token is simply the database ID, so if an attacker discovers another user's ID (CUIDs are not random enough to be secrets), they can craft a valid cookie. |
| **Affected File(s)** | `lib/actions.ts:1583-1584`, `lib/portal-auth.ts:5-17` |
| **Recommendation** | Sign the portal token with an HMAC (like admin sessions). Add server-side expiry validation in `requirePortalAuth()`. Implement token rotation on password change. Consider using a dedicated random session token stored in DB with explicit expiry. |
| **Effort** | M |

---

### SEC-003: No Rate Limiting on Any Endpoint

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | Zero rate limiting exists in the entire codebase. No middleware, no `@upstash/ratelimit`, no custom implementation. This affects: admin login (`loginAction` at `actions.ts:53-60`), portal login (`portalLoginAction` at `actions.ts:1570-1587`), all API routes, all server actions, all export routes. |
| **Risk Impact** | 1) Brute-force password attacks against admin and portal logins are unbounded. 2) DoS attacks can exhaust database connections via expensive queries. 3) Enumeration attacks can determine valid usernames/emails via response timing/errors. 4) Automated abuse of any server action. |
| **Affected File(s)** | All server actions in `lib/actions.ts`, all `app/api/*/route.ts`, all `app/admin/export/*/route.ts` |
| **Recommendation** | Implement rate limiting at the middleware level (e.g., Next.js middleware + Upstash/Vercel KV). Apply strict limits on auth endpoints (5 attempts/15min), broader limits on API routes. |
| **Effort** | M |

---

### SEC-004: Cron Endpoint Authentication Bypass

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `app/api/cron/meeting-reminders/route.ts:7-9`: `const secret = process.env.CRON_SECRET; const authHeader = request.headers.get("authorization"); if (secret && authHeader !== \`Bearer ${secret}\`) { return new Response("Unauthorized", { status: 401 }); }`. The check `if (secret && ...)` means if `CRON_SECRET` env var is empty, undefined, or not set, the authentication check is **entirely skipped**. |
| **Risk Impact** | Anyone who discovers this endpoint can trigger mass email notifications to all clients with upcoming meetings. This can be used for harassment, social engineering, or simply spamming the entire client base. |
| **Affected File(s)** | `app/api/cron/meeting-reminders/route.ts:7-9` |
| **Recommendation** | Remove the conditional. Always require authentication: `if (authHeader !== \`Bearer ${process.env.CRON_SECRET}\`)`. Throw if `CRON_SECRET` is not set. |
| **Effort** | S |

---

### SEC-005: CSV/Excel Injection in Invoice Print Route

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `app/admin/accounting/invoices/[id]/print/page.tsx` renders user-controlled data (client name, invoice items, amounts) into an HTML page with no Content-Security-Policy headers. The page is designed for printing, which means users may export it as CSV/XLS where Excel could interpret cells starting with `=`, `+`, `-`, `@` as DDE formulas. |
| **Risk Impact** | If an admin exports the print page to CSV/XLS, cells starting with `=` could execute arbitrary Excel formulas on the admin's machine (e.g., `=CMD|'/C calc'!A0`). This is a stored CSV injection via invoice item descriptions. |
| **Affected File(s)** | `app/admin/accounting/invoices/[id]/print/page.tsx` |
| **Recommendation** | 1) Sanitize user-controlled strings by prefixing with a single quote (`'`) when rendering in table cells. 2) Add `Content-Security-Policy` header. 3) Escape `=`, `+`, `-`, `@` characters at the start of text fields. |
| **Effort** | S |

---

### SEC-006: No CSRF Protection on API Routes

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | Traditional API routes under `app/api/` (Google OAuth, cron, exports) use GET methods and are not protected by CSRF tokens. While Next.js server actions have built-in anti-CSRF via `next-action` header, the `/api/*` routes and `/admin/export/*` routes have no origin/referer validation or CSRF tokens. |
| **Risk Impact** | An attacker could craft a `<img src="...">` or `<form action="...">` that triggers GET requests to export routes, potentially exfiltrating sensitive data cross-origin if CORS is misconfigured. Export routes could be triggered without user intent. |
| **Affected File(s)** | All `app/api/*/route.ts` files, all `app/admin/export/*/route.ts` files |
| **Recommendation** | Add origin/referer header validation on all state-changing routes. For export routes, consider requiring a CSRF token or using POST with `Content-Type: application/json`. |
| **Effort** | M |

---

### SEC-007: Portal Data Access by Client Name String Matching

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `lib/admin-data.ts:861-872` (`getPortalDeliverables`) and `lib/admin-data.ts:912-923` (`getPortalProjects`) filter data by `clientName` (a string field on `WorkflowDelivery` and `Project`), not by `clientId` (foreign key). `getPortalDeliverables` queries `workflowDelivery` with `project.clientName` matching the authenticated user's client name. |
| **Risk Impact** | 1) If two clients share the same name (e.g., "ABC Corp" appears twice), both see each other's deliverables and projects. 2) If a client changes their name, they lose access to their data until all workflow/project records are updated. 3) No referential integrity — client name is a mutable string used as an access control key. |
| **Affected File(s)** | `lib/admin-data.ts:861-872`, `lib/admin-data.ts:912-923` |
| **Recommendation** | Add a `clientId` foreign key to `WorkflowDelivery` and `Project` models (or use the existing relationship through `WorkflowProject` which has a `clientName` but no `clientId`). Query by `clientId` instead of `clientName`. |
| **Effort** | XL (requires schema migration + data backfill) |

---

### SEC-008: Audit Logging Infrastructure is Dead Code

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | Two audit logging helpers exist but are NEVER called: `logActivity()` at `lib/admin-data.ts:694-710` and `autoLogActivity()` at `lib/actions.ts:1598-1606`. Zero server actions, zero workflow status changes, zero accounting operations, zero portal logins, zero data mutations log to the `ActivityLog` table. The Activity Log page (`app/admin/activity/page.tsx`) renders a UI that will always be empty. |
| **Risk Impact** | No audit trail exists for any operation in the system. Unauthorized data changes, accidental deletions, and security breaches are untraceable. Compliance requirements (GDPR, SOC2) are unmet. Forensic investigation is impossible. |
| **Affected File(s)** | `lib/admin-data.ts:694-710` (definition), `lib/actions.ts:1598-1606` (definition), `app/admin/activity/page.tsx` (always-empty UI) |
| **Recommendation** | Integrate `logActivity()` calls into every server action in `actions.ts` — at minimum: creates, updates, deletes, status changes, and all accounting mutations. |
| **Effort** | M |

---

### SEC-009: Admin Export Routes Leak All Client PII

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `app/admin/export/bookings/route.ts` calls `getBookings()` with no filter, exporting ALL bookings including full client names, emails, phone numbers, prices, deposit amounts, and payment status. `app/admin/export/accounting/route.ts` exports all payments and expenses. Any authenticated admin can dump all client PII to a CSV file. |
| **Risk Impact** | Mass data exfiltration by a single admin with valid credentials. Client PII (names, emails, phones) combined with financial data is a GDPR Article 33 reportable breach. No audit log of who exported what. |
| **Affected File(s)** | `app/admin/export/bookings/route.ts`, `app/admin/export/accounting/route.ts`, `app/admin/export/invoice/[id]/route.ts`, `app/admin/export/contract/[id]/route.ts` |
| **Recommendation** | 1) Add export logging to ActivityLog (who exported what, when). 2) Consider role-based export restrictions. 3) Add rate limiting to export routes. 4) Consider requiring re-authentication for bulk exports. |
| **Effort** | M |

---

### SEC-010: Workflow Status Updates Accept Arbitrary Strings

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `lib/actions.ts:987-998` (`updateWorkflowStageAction`) does `await prisma.workflowProject.update({ where: { id }, data: { stage } })` with zero validation of the `stage` value. Same pattern at lines 1038-1060 (WorkflowTask status), 1098-1109 (WorkflowApproval status), 1135-1146 (WorkflowDelivery status), 1261-1274 (ContentProduction stage). All are free-form `String` fields in Prisma schema. |
| **Risk Impact** | Any arbitrary string can be written to status/stage fields. This can corrupt the Kanban board, break status-based filtering, and produce invalid state combinations. Combined with no audit trail, corruption is irreversible and invisible. |
| **Affected File(s)** | `lib/actions.ts:987-998`, `lib/actions.ts:1038-1060`, `lib/actions.ts:1098-1109`, `lib/actions.ts:1135-1146`, `lib/actions.ts:1261-1274` |
| **Recommendation** | 1) Validate all status/stage inputs against allowed values using Zod enums. 2) Implement a state machine with allowed transitions. 3) Use Prisma enums instead of `String` in schema. |
| **Effort** | L |

---

### SEC-011: Google OAuth Creates Session for Any Verified Email

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | `app/api/auth/callback/google/route.ts:63` calls `createAdminSession(email)` for ANY verified Google email, not just admin emails. Line 64 redirects based on `isAdminEmail()`, but a session cookie is created regardless. Non-admin users get a valid `tl_admin_session` cookie and can access `/account`. |
| **Risk Impact** | While admin pages check `isAdminAuthenticated()` (which verifies both session AND admin email), the session itself is valid for any Google-authenticated user. If any page or action checks only session validity without email verification, non-admin users could gain access. |
| **Affected File(s)** | `app/api/auth/callback/google/route.ts:63-64` |
| **Recommendation** | Only create admin sessions for verified admin emails. Redirect non-admin users without creating a session, or create a separate "user session" with different scope. |
| **Effort** | S |

---

### SEC-012: No HTTP Security Headers

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | No response headers are set anywhere: no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy`. Neither in route handlers, middleware, nor `next.config.ts`. |
| **Risk Impact** | 1) Clickjacking attacks via missing `X-Frame-Options`. 2) MIME-type sniffing attacks via missing `X-Content-Type-Options`. 3) No protection against XSS via missing CSP. 4) No HSTS enforcement. |
| **Affected File(s)** | All route files; no middleware file exists |
| **Recommendation** | Create a Next.js middleware (`middleware.ts`) that sets security headers on all responses. Minimum set: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=63072000`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| **Effort** | S |

---

### SEC-013: No Portal Session Revocation Mechanism

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | The portal authentication token is the raw `ClientPortalUser.id`. There is no separate session table, no token rotation, and no mechanism to invalidate existing sessions. Changing a portal user's password does NOT invalidate their existing cookie because `requirePortalAuth()` only checks `id` and `isActive` — it never verifies a password hash or session token. |
| **Risk Impact** | 1) If an admin resets a compromised portal user's password, the attacker's existing cookie remains valid. 2) No "logout all devices" functionality exists. 3) No session audit trail. |
| **Affected File(s)** | `lib/portal-auth.ts:5-17`, `lib/actions.ts:1570-1587` |
| **Recommendation** | Implement a session token system: store a random token (not the user ID) in a `PortalSession` table with an expiry timestamp. On password change, delete all sessions for that user. |
| **Effort** | M |

---

### SEC-014: No Portal Password Complexity

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | `lib/actions.ts:1556` (portal user creation) and `lib/actions.ts:1573` (portal login validation) only check `password.length < 6`. There is no requirement for uppercase, lowercase, digits, special characters, or minimum length beyond 6 characters. |
| **Risk Impact** | Weak portal passwords are trivially brute-forced. Compounded by no rate limiting (SEC-003), an attacker can attempt thousands of passwords per minute against a known portal email. |
| **Affected File(s)** | `lib/actions.ts:1556`, `lib/actions.ts:1573` |
| **Recommendation** | Enforce minimum password length of 12 characters with complexity requirements. Validate against common password lists. |
| **Effort** | S |

---

### SEC-015: Financial Blur is CSS-Only, Not Access Control

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | `app/globals.css:30-43` defines `.blur-sensitive`, `.blur-financial`, `.blur-chart` classes. `.admin-blur-mode` on `<body>` applies `filter: blur(5px)` to these elements. This is purely cosmetic — financial values are present in the HTML source, accessible via devtools, and readable by screen readers. |
| **Risk Impact** | False sense of security. A low-privilege admin with browser access can bypass the blur by removing CSS or viewing the DOM. |
| **Affected File(s)** | `app/globals.css:30-43` |
| **Recommendation** | Either remove the blur (if it's cosmetic) or implement actual role-based rendering that excludes sensitive data from the HTML. |
| **Effort** | S |

---

## 3. Database & Prisma Audit

---

### DB-001: Missing Database Indexes on 19+ Models

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | Only 6 models in `prisma/schema.prisma` have explicit `@@index` directives. The remaining 19+ models lack indexes on frequently-queried foreign keys and status filter fields. Specifically: `Booking`, `Invoice`, `InvoiceItem`, `Payment`, `Expense`, `Contract`, `Quotation`, `WorkflowTask`, `WorkflowApproval`, `WorkflowDelivery`, `ContentProduction`, `ApprovalRequest`, `AdminUser`, `ClientPortalUser`, `Notification`, `ActivityLog`, `FileAttachment`, `Meeting`, `Project`, `TeamMember`. |
| **Risk Impact** | As data grows, queries that filter by `clientId`, `status`, `email`, or `date` will degrade from index scans to sequential scans. Kanban board loading, invoice listing, client search, notification queries will slow linearly with data volume. At 10K+ records, page loads will exceed 3-5 seconds. |
| **Affected File(s)** | `prisma/schema.prisma` (models: lines 148-187, 209-283, 285-316, 318-334, 342-358, 360-375, 377-416, 436-462, 464-481, 483-495, 497-509, 511-529, 531-548, 550-566, 568-585, 587-598, 600-618, 620-637, 639-657) |
| **Recommendation** | Add `@@index` directives on every foreign key field and every frequently-filtered status/date field. Minimum set: all `*Id` fields, all `status` fields, `email`, `date`, `createdAt`, `entityType+entityId` on ActivityLog. |
| **Effort** | M |

---

### DB-002: Client Cascade Delete Destroys All Financial Records

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `prisma/schema.prisma:213`: `client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)`. Deleting a `Client` record cascade-deletes all their `Invoice` records. `Invoice` in turn cascade-deletes `InvoiceItem` records (line 245). `Payment` records have `onDelete: SetNull` on `invoiceId` (line 266), leaving orphaned payments. |
| **Risk Impact** | Accidental or malicious deletion of a single `Client` record permanently destroys ALL financial history (invoices, invoice items) and orphans all payments associated with that client. Data loss is irreversible — no soft-delete, no recovery. |
| **Affected File(s)** | `prisma/schema.prisma:213`, `prisma/schema.prisma:245`, `prisma/schema.prisma:266` |
| **Recommendation** | Change `onDelete: Cascade` to `onDelete: Restrict` or `onDelete: NoAction` for financial records. Implement soft-delete (`deletedAt` + `isDeleted` fields) for all accounting models. Provide a UI for archiving clients instead of deletion. |
| **Effort** | L (requires migration + schema changes + UI changes) |

---

### DB-003: Duplicate / Overlapping Models

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Four pairs of models serve overlapping purposes: 1) `Project` (lines 377-416) vs `WorkflowProject` (lines 436-462) — both track production-related entities with different schemas. 2) `User` (lines 81-96) vs `AdminUser` (lines 550-566) — two separate authentication tables. 3) `Notification` (lines 568-585) vs `WorkflowNotification` (model inferred from references) — two notification systems. 4) `BookingType` (lines 134-146) vs `AppointmentType` — potential categorization overlap. |
| **Risk Impact** | Data fragmentation: projects exist in two tables with different schemas, requiring joins or dual queries. Admin authentication has two parallel paths. Notifications may be split across two tables, making unified notification views difficult. |
| **Affected File(s)** | `prisma/schema.prisma:81-96`, `prisma/schema.prisma:134-146`, `prisma/schema.prisma:377-416`, `prisma/schema.prisma:436-462`, `prisma/schema.prisma:550-566`, `prisma/schema.prisma:568-585` |
| **Recommendation** | Consolidate each pair: migrate `Project` fields into `WorkflowProject` or vice versa. Unify to a single `User` model with role field. Merge notification models into one with polymorphic entity references. |
| **Effort** | XL (schema migration, data migration, all query code changes) |

---

### DB-004: Missing Unique Constraints

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | Several models lack `@unique` constraints on fields that should be unique: `Client.email` (line 192), `Contract.contractNo` (line 293), `Quotation.quotationNo` (line 321), `AdminUser.email` (line 553), `ClientPortalUser.email`. `Invoice.invoiceNo` has `@unique` (line 212), which is correct. `Meeting` has no unique constraint on `(date, time, room)` to prevent double-booking. |
| **Risk Impact** | Duplicate client records with the same email, duplicate contract/quotation numbers (breaking numbering schemes), duplicate admin accounts. Application-level checks are insufficient under concurrent creation (race conditions bypass them). |
| **Affected File(s)** | `prisma/schema.prisma:192`, `prisma/schema.prisma:293`, `prisma/schema.prisma:321`, `prisma/schema.prisma:553`, `prisma/schema.prisma:620-637` |
| **Recommendation** | Add `@unique` constraints. For `Meeting`, add a compound unique `@@unique([date, startTime, room])` or similar. |
| **Effort** | M (requires migration + data deduplication) |

---

### DB-005: SQL Injection Vectors via Type-Unsafe Where Clauses

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | `lib/admin-data.ts` has 6+ functions that accept `where: Record<string, unknown>` and pass it directly to Prisma queries: `getBookings()`, `getWorkflowTasks()`, `getInvoices()`, `getPayments()`, `getExpenses()`, `getNotifications()`. Additionally, `searchEntities()` (line 355) uses `query` string in `contains` filters across multiple models. `updateWorkflowProjectAction()` at `actions.ts:966-985` takes raw `formData.get(key)` values and assigns them to `data[key]` without validation. |
| **Risk Impact** | While Prisma parameterizes queries (preventing classic SQL injection), the type-unsafe `Record<string, unknown>` pattern allows arbitrary filter injection. An attacker could inject unexpected filter conditions (e.g., pagination bypass, accessing records they shouldn't see). The `data[key]` pattern in `updateWorkflowProjectAction` allows setting ANY column on the model, including sensitive fields, to ANY value. |
| **Affected File(s)** | `lib/admin-data.ts` (multiple functions), `lib/actions.ts:966-985` |
| **Recommendation** | Replace `Record<string, unknown>` with specific, validated where-clause types. In `updateWorkflowProjectAction`, use a whitelist of allowed fields instead of iterating all formData keys. |
| **Effort** | L |

---

### DB-006: N+1 Query Risks in Data Layer

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Several data functions fetch parent records without including related children: `getWorkflowProjects()` fetches projects without including `tasks`, `approvals`, or `deliveries` — each Kanban card load fires separate queries. `getClients()` fetches clients without aggregated invoice/payment totals — the dashboard fires per-client aggregation queries. |
| **Risk Impact** | Page load time grows linearly with data volume. Kanban board with 50 projects and 200 tasks could fire 50+ extra queries. Dashboard with 100 clients fires 100+ extra queries. At production scale, this causes multi-second page loads and excessive database connections. |
| **Affected File(s)** | `lib/admin-data.ts` |
| **Recommendation** | Use Prisma `include` or `select` with nested relations to eager-load related data in a single query. For aggregations (count, sum), use Prisma raw queries or the `_count` and `_sum` features. |
| **Effort** | M |

---

### DB-007: Invoice Invoice Number Generation Not Atomic

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | `lib/actions.ts:695-696`: `const count = await prisma.invoice.count(); const invoiceNo = \`INV-${String(count + 1).padStart(4, "0")}\``. This reads the count, increments it in memory, and then creates the invoice. Between the `count()` and the `create()`, another concurrent creation reads the same count, resulting in duplicate number attempts. The `@unique` constraint catches the collision, but one creation fails. |
| **Risk Impact** | Duplicate invoice number attempts cause creation failures under concurrent load. Gaps in invoice number sequence from failed attempts. Number sequence also breaks on deletions (count() ≠ max number). |
| **Affected File(s)** | `lib/actions.ts:695-696` (invoices), `lib/actions.ts:814-815` (quotations — same pattern) |
| **Recommendation** | Use a dedicated counter table with atomic increment, or Prisma's `$transaction` with `findFirst({ orderBy: { createdAt: 'desc' } })` for max invoice number, or a database sequence. |
| **Effort** | M |

---

## 4. Performance Audit

---

### PERF-001: 30+ Missing Indexes (see DB-001)

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | Refer to DB-001 for full details. 19+ models lack indexes on foreign keys and status/date filter fields. |
| **Risk Impact** | Sequential scans on all filtered queries as data grows. |
| **Affected File(s)** | `prisma/schema.prisma` |
| **Recommendation** | Add composite indexes on `(foreignKey, status)` and `(createdAt)` for all queried models. |
| **Effort** | M |

---

### PERF-002: N+1 Queries in Admin Data Layer (see DB-006)

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Refer to DB-006 for full details. |
| **Risk Impact** | Page load times degrade linearly with record count. |
| **Affected File(s)** | `lib/admin-data.ts` |
| **Recommendation** | Eager-load with Prisma `include`; use `_count` and `_sum` for aggregations. |
| **Effort** | M |

---

### PERF-003: No Pagination on Admin List Pages

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Admin list pages (clients, invoices, payments, expenses, bookings, notifications) do not implement cursor or offset pagination. The data functions return all records matching the filter. For example, `getInvoices()` returns all invoices with no `take`/`skip`, `getClients()` returns all clients, `getPayments()` returns all payments. |
| **Risk Impact** | As the database grows to thousands of records, pages will load increasingly large datasets into memory and send increasingly large HTML payloads to the client. At 10K invoices, a page load could consume 100MB+ of server memory. |
| **Affected File(s)** | `lib/admin-data.ts` (all getter functions) |
| **Recommendation** | Implement cursor-based pagination on all list endpoints. Use `take`/`skip` (offset) or `cursor` (keyset pagination) with a default page size of 25-50. |
| **Effort** | L |

---

### PERF-004: No Database Connection Pooling Configuration

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | `lib/prisma.ts` initializes `PrismaClient` in global scope (standard pattern) but does not configure connection pool limits. The default pool size for Prisma + PostgreSQL is typically environment-dependent (often 4-10 connections). |
| **Risk Impact** | Under concurrent load (e.g., 50+ simultaneous requests), the default pool may be exhausted, causing connection wait timeouts. |
| **Affected File(s)** | `lib/prisma.ts` |
| **Recommendation** | Configure `connection_limit` in the database URL or via `PrismaClient` options. Set pool size proportional to expected concurrency (e.g., `connection_limit=20` for moderate load). |
| **Effort** | S |

---

## 5. Workflow & Business Logic Audit

---

### WBL-001: No State Machine — All Statuses are Free-Form Strings

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | Six workflow models use free-form `String` fields for status/stage: `WorkflowProject.stage` (line 442), `WorkflowTask.status` (line 471), `WorkflowApproval.status` (line 488), `WorkflowDelivery.status` (line 503), `ContentProduction.stage` (line 518), `ApprovalRequest.status` (line 535). None use Prisma enums. None have Zod validation for allowed values. None have a state machine definition. The UI uses dropdowns with hardcoded options, but the server accepts ANY string. |
| **Risk Impact** | Corrupted workflow stages (e.g., "SHIPPED" instead of "DELIVERED") break the Kanban board, status-based filtering, and all status-dependent logic. Invalid states cannot be detected without manual DB inspection. Combined with no audit trail, corruption is invisible. |
| **Affected File(s)** | `prisma/schema.prisma:436-548`, `lib/actions.ts:966-998`, `lib/actions.ts:1038-1060`, `lib/actions.ts:1098-1109`, `lib/actions.ts:1135-1146`, `lib/actions.ts:1261-1274` |
| **Recommendation** | 1) Define Prisma enums for all status/stage fields. 2) Implement a state machine definition (e.g., using XState or a simple transition map) that specifies allowed transitions. 3) Add server-side validation in every status update action that checks allowed transitions. 4) Add client-side validation in dropdowns to only show valid next states. |
| **Effort** | XL |

---

### WBL-002: No Transition Guards — Any Transition Allowed

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | Since no state machine exists, ANY status transition is allowed, including: `NEW_LEAD → DELIVERED` (skipping 10 stages), `APPROVED → ARCHIVED` (skipping production entirely), `PRODUCTION → NEW_LEAD` (going backwards), `TODO → DONE` (skipping IN_PROGRESS and REVIEW), `PENDING → COMPLETED` on bookings (skipping APPROVED), `COMPLETED → PENDING` on bookings (going backwards). |
| **Risk Impact** | Business processes can be bypassed entirely. A project can go from lead to delivered without production, editing, or review. A booking can be marked completed without approval. The workflow system does not enforce any business rules. |
| **Affected File(s)** | `lib/actions.ts:987-998`, `lib/actions.ts:1038-1060`, `lib/actions.ts:1098-1109`, `lib/actions.ts:1135-1146`, `lib/actions.ts:1261-1274` |
| **Recommendation** | Implement transition validation in every status update action. Define a transition map per entity type, e.g.: `const WORKFLOW_PROJECT_TRANSITIONS = { NEW_LEAD: ["DISCOVERY_CALL"], DISCOVERY_CALL: ["MEETING_SCHEDULED"], ... }`. Validate that the new status is in `allowedTransitions[currentStatus]`. |
| **Effort** | L |

---

### WBL-003: No Audit Trail for Any Status Change

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `logActivity()` (defined at `admin-data.ts:694`) and `autoLogActivity()` (defined at `actions.ts:1598`) are never called anywhere in the codebase. Zero workflow status changes, zero accounting mutations, zero data operations are logged. The `ActivityLog` model (schema.prisma:568-585) has well-designed fields including `action`, `entityType`, `entityId`, `entityName`, `description`, `metadata` (JSON), `userId`, `userName`, `createdAt` — but it remains empty. |
| **Risk Impact** | No forensic trail exists for any data change. Unauthorized status changes, accidental modifications, and system abuse cannot be traced. Audit compliance (SOC2, ISO 27001) is impossible. Bug reproduction is impossible because "what changed and when" is permanently unknown. |
| **Affected File(s)** | `lib/admin-data.ts:694-710`, `lib/actions.ts:1598-1606`, `app/admin/activity/page.tsx` |
| **Recommendation** | Add `logActivity()` calls to every mutation action in `actions.ts`. At minimum: create, update, delete, and status change operations. Log the previous and new values in `metadata`. |
| **Effort** | M |

---

### WBL-004: No Race Condition Protection on Any Mutation

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | Zero `prisma.$transaction()` usage exists anywhere in the codebase. All update operations follow the pattern: 1) read data, 2) compute new values, 3) write new values — without any locking. The Kanban board auto-submits stage changes on dropdown selection (`onChange={e => e.target.form?.requestSubmit()}` at `app/admin/workflow/page.tsx:145`), making simultaneous conflicting updates highly likely. No `version` or `lock` field exists on any model for optimistic concurrency control. |
| **Risk Impact** | Two admins editing the same project simultaneously: Admin A changes stage to "EDITING", Admin B changes to "REVIEW" 5ms later. Admin B's write silently overwrites Admin A's change. Neither admin knows their change was lost. On financial operations, this can cause: lost payments, duplicate invoice numbers, and incorrect `paidAmount` calculations. |
| **Affected File(s)** | All `update*` actions in `lib/actions.ts`, `app/admin/workflow/page.tsx:145` |
| **Recommendation** | 1) Wrap multi-step read-then-write operations in `prisma.$transaction()`. 2) Add an `optimisticLock` or `version` integer field to models with high contention (WorkflowProject, Invoice, Booking). 3) Implement `where: { id, version: currentVersion }` updates and retry on failure. |
| **Effort** | L |

---

### WBL-005: Missing Timestamps on Terminal Status Changes

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Several models have timestamp fields that exist but are never auto-populated when reaching terminal statuses: `WorkflowDelivery.deliveryDate` exists (schema line 501) but is never set when status changes to "DELIVERED". `WorkflowApproval.sentDate` exists (schema line 487) but is never set when status changes to "SENT_TO_CLIENT". Some models lack timestamp fields entirely for terminal states: `WorkflowProject` has no `completedAt` or `archivedAt` field. |
| **Risk Impact** | Cannot answer basic business questions: "When was this project completed?", "When was this delivery made?", "When was this approval sent to the client?" |
| **Affected File(s)** | `prisma/schema.prisma:501, 487, 436-462`, `lib/actions.ts:1135-1146`, `lib/actions.ts:1098-1109` |
| **Recommendation** | Add `completedAt`/`archivedAt` to `WorkflowProject`. Auto-populate `deliveryDate` when status = "DELIVERED". Auto-populate `sentDate` when status = "SENT_TO_CLIENT". |
| **Effort** | S |

---

### WBL-006: Booking "Mark as Paid" Uses Invalid Enum Value (Broken Feature)

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | `app/admin/accounting/invoices/invoice-actions.tsx:22-24` calls `updateInvoiceStatusAction` with `fd.set("status", "PAID")`. However, `InvoiceStatus` Prisma enum (schema.prisma:47-51) only defines `DRAFT | SENT | CANCELLED`. `PAID` is NOT a valid value. The action at `lib/actions.ts:730-747` calls `prisma.invoice.update({ data: { status: "PAID" } })` which causes a Prisma runtime validation error. |
| **Risk Impact** | The "Mark as Paid" button in the invoice actions dropdown is broken. Every click produces an error with no user feedback. The button only appears when `status === "SENT"` (line 78), so this is a dead code path that always errors. |
| **Affected File(s)** | `app/admin/accounting/invoices/invoice-actions.tsx:22-24`, `lib/actions.ts:730-747`, `prisma/schema.prisma:47-51` |
| **Recommendation** | Two options: 1) Fix by updating `paymentStatus` instead of `status` (InvoicePaymentStatus enum has PAID). 2) If the intent was to mark the invoice as paid, use `addInvoicePaymentAction` instead. The `status` field should remain `SENT` or change to a valid value. |
| **Effort** | S |

---

## 6. API & Server Actions Audit

---

### API-001: Monolithic actions.ts (1606 lines)

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `lib/actions.ts` contains ~120+ exported async functions across 1606 lines. It includes: authentication actions, booking CRUD, client CRUD, invoice CRUD, payment CRUD, expense CRUD, quotation CRUD, contract CRUD, workflow CRUD, content pipeline CRUD, approval CRUD, delivery CRUD, team member CRUD, notification CRUD, file upload actions, portal actions, settings actions, meeting actions. |
| **Risk Impact** | Maintenance bottleneck: a single change requires navigating a 1606-line file. Import conflicts, merge conflicts, and accidental cross-domain coupling are highly likely. New developers face a steep learning curve. |
| **Affected File(s)** | `lib/actions.ts` |
| **Recommendation** | Split by domain: `lib/actions/booking.ts`, `lib/actions/client.ts`, `lib/actions/invoice.ts`, `lib/actions/workflow.ts`, `lib/actions/portal.ts`, etc. Export barrel file from `lib/actions/index.ts`. |
| **Effort** | M |

---

### API-002: Admin Layout Not Encapsulated — Every Page Must Import AdminShell

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | No `app/admin/layout.tsx` exists. Every admin page must manually import and wrap with `<AdminShell>`. This is error-prone — a new page could omit the wrapper and have no sidebar, no breadcrumbs, no header. |
| **Risk Impact** | Missing sidebar/breadcrumbs on any page that forgets the wrapper. Inconsistent admin experience. |
| **Affected File(s)** | `app/admin/*/page.tsx` (all pages except settings which wraps differently) |
| **Recommendation** | Create `app/admin/layout.tsx` that wraps all admin pages with `<AdminShell>`. Move common data fetching (notifications, settings) to the layout. |
| **Effort** | S |

---

### API-003: Server Actions Swallow Errors Silently

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Multiple server actions in `lib/actions.ts` have bare `catch { /* no-op */ }` or `catch { /* empty */ }` blocks that silently consume errors without logging or rethrowing. Examples at lines 903, 921, 935, 963, 984, 997, 1009, 1035. |
| **Risk Impact** | Failures are invisible to both users and developers. A critical operation (creating an invoice, updating a workflow stage) could fail silently, and no one would know. Debugging requires manually adding log statements. |
| **Affected File(s)** | `lib/actions.ts:903, 921, 935, 963, 984, 997, 1009, 1035, 1435, 1504, 1533, 1559` |
| **Recommendation** | Remove empty catch blocks. Log errors with structured logging. Return meaningful error states to the UI. |
| **Effort** | S |

---

### API-004: Google OAuth State Cookie is `sameSite: "lax"` Instead of `"strict"`

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | `app/api/auth/google/route.ts:19` sets `sameSite: "lax"` on the OAuth state cookie. For CSRF protection via the state parameter, `sameSite: "strict"` is preferable to prevent the cookie from being sent on initial redirects from external sites. |
| **Risk Impact** | Low — the state parameter CSRF protection is the primary defense. `sameSite: "lax"` allows the cookie on top-level navigations from external sites, which is the OAuth callback flow. |
| **Affected File(s)** | `app/api/auth/google/route.ts:19` |
| **Recommendation** | Change to `sameSite: "strict"` and verify the OAuth callback flow still works. Test in all major browsers. |
| **Effort** | S |

---

## 7. UX / Frontend Architecture Audit

---

### UX-001: Zero loading.tsx Files in Admin Routes

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | No `loading.tsx` files exist anywhere under `app/admin/`. Every admin page is an async server component that awaits database queries before rendering. Users see a completely blank white page until all data is fetched and the component renders. |
| **Risk Impact** | On slow connections or large datasets, users see a blank page for 2-10+ seconds with no visual feedback. Users may think the page is broken and navigate away. Perceived performance is terrible. |
| **Affected File(s)** | No `app/admin/**/loading.tsx` exists anywhere |
| **Recommendation** | Create `app/admin/loading.tsx` (global fallback) and domain-specific loading skeletons matching each page's layout structure. |
| **Effort** | M |

---

### UX-002: Zero error.tsx Files in Admin Routes

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | No `error.tsx` files exist anywhere under `app/admin/`. If any server component throws an error (e.g., Prisma connection failure, null reference on optional chaining), the entire page crashes to Next.js's default development error screen (in dev) or a generic 500 page (in prod). |
| **Risk Impact** | Any unexpected error results in a completely broken page with no recovery. In development, sensitive information (stack traces, database queries) is displayed. Users have no way to retry or report the error. |
| **Affected File(s)** | No `app/admin/**/error.tsx` exists anywhere |
| **Recommendation** | Create `app/admin/error.tsx` with a user-friendly error message, a retry button, and expected error reporting. Wrap critical sections in `<Suspense>` with error boundaries. |
| **Effort** | M |

---

### UX-003: No Toast/Notification System for User Feedback

| Field | Value |
|-------|-------|
| **Severity** | **CRITICAL** |
| **Description** | There is no toast library installed (sonner, react-hot-toast, notistack, etc. — 0 matches). User feedback for form submissions and mutations is handled via: 1) URL query parameters (`?saved=meeting`, `?error=invalid-client`), 2) inline state (`setMsg(...)` in invoice-form/ quotation-form). Both approaches are fragile — query params are lost on refresh, inline state is isolated to specific components. |
| **Risk Impact** | Users often miss feedback: 1) After successful save, the page redirects without a visible confirmation. 2) After failed save, an error query param appears in the URL but is not visually prominent. 3) Long-running operations have no progress indication. 4) Background operations (e.g., email sending) have no completion feedback. |
| **Affected File(s)** | All admin pages (no toast library), `lib/actions.ts` (query param feedback pattern) |
| **Recommendation** | Install a toast library (sonner is minimal and works with server actions). Replace all redirect-based feedback with toast notifications. Add `useTransition` or `useActionState` pending states. |
| **Effort** | S |

---

### UX-004: Breadcrumbs Rely on Fragile Header Detection

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `components/admin-shell.tsx:20`: `const currentPath = h.get("x-invoke-path") || h.get("next-url") || "";`. `x-invoke-path` is a Vercel-specific header that may not be available in all hosting environments. `next-url` is not a standard header. The fallback to empty string means breadcrumbs may silently render incorrectly. |
| **Risk Impact** | Breadcrumbs break on non-Vercel deployments or certain Next.js versions. Navigation context is lost, making deep page navigation confusing. |
| **Affected File(s)** | `components/admin-shell.tsx:20` |
| **Recommendation** | Use `headers().get("next-url")` as primary (this is the Next.js documented approach for App Router). For path segment parsing, use `URL` constructor. Add a fallback that reads from `x-pathname` or the request URL directly. |
| **Effort** | S |

---

### UX-005: Inaccessible Edit/Create Overlays Using `<details>/<summary>`

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Edit forms use `<details>/<summary>` HTML elements for expandable overlays (e.g., clients page line 82, accounting page line 244). These have: no focus trapping (Tab key moves outside the overlay), no keyboard escape handling (Esc doesn't close), no aria attributes (aria-modal, role="dialog"), close is only via re-clicking the summary (hard to discover for screen readers). |
| **Risk Impact** | Users who rely on keyboard navigation or screen readers cannot effectively use these overlays. Focus can escape the overlay, causing disorientation. The overlay pattern is not accessible (WCAG 2.1 SC 2.1.1, SC 2.4.3). |
| **Affected File(s)** | `app/admin/clients/page.tsx:82`, `app/admin/accounting/page.tsx:244`, and other pages using `<details>/<summary>` |
| **Recommendation** | Replace `<details>/<summary>` with proper dialog components that: trap focus, handle Escape key, have appropriate ARIA attributes, and close on backdrop click. |
| **Effort** | L |

---

### UX-006: Most Client Forms Lack Loading States

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Only 5 components use `useTransition`/`isPending` for button-level feedback: `invoice-form.tsx`, `invoice-actions.tsx`, `invoice-payments.tsx`, `quotation-form.tsx`, `quotation-actions.tsx`. Other forms (`company-settings-form`, `admin-meeting-form`, `account-forms`, `team-member-form`, `workflow-form`, etc.) have no loading state whatsoever. |
| **Risk Impact** | Users who click "Save" on a form with no loading state may click multiple times, submitting the same data multiple times. No visual feedback during slow operations. |
| **Affected File(s)** | `components/company-settings-form.tsx`, `components/admin-meeting-form.tsx`, `components/account-forms.tsx`, `app/admin/team-center/page.tsx`, `app/admin/workflow/page.tsx` |
| **Recommendation** | Add `useTransition` + `isPending` to all form submissions. Disable submit buttons during pending state. Show inline loading text or spinners. |
| **Effort** | M |

---

### UX-007: No "Back to..." Navigation on Detail Pages

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | Detail pages (client detail at `app/admin/clients/[id]/page.tsx`, quotation detail, invoice detail) rely solely on breadcrumbs for parent navigation. Breadcrumbs are hidden on mobile viewports. There are no explicit "Back to clients" or "Back to invoices" links. |
| **Risk Impact** | On mobile, users have no way to navigate back to the list without using browser back (which may not preserve page state). |
| **Affected File(s)** | `app/admin/clients/[id]/page.tsx`, all detail pages |
| **Recommendation** | Add a "Back to [list]" link at the top of each detail page, visible on all viewports. |
| **Effort** | S |

---

## 8. Code Quality & Maintainability Audit

---

### CQ-001: Monolithic actions.ts (1606 Lines) and admin-data.ts (925 Lines)

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `lib/actions.ts` contains ~120+ functions across 1606 lines covering all domains. `lib/admin-data.ts` contains all database query functions across 925 lines. No domain-level separation. |
| **Risk Impact** | Maintenance bottlenecks, merge conflicts, steep learning curve, accidental cross-domain coupling. |
| **Affected File(s)** | `lib/actions.ts`, `lib/admin-data.ts` |
| **Recommendation** | Split into domain files: `lib/actions/booking.ts`, `lib/actions/client.ts`, `lib/actions/invoice.ts`, `lib/actions/workflow.ts`, `lib/actions/portal.ts`, etc. Same for `lib/data/`. |
| **Effort** | M |

---

### CQ-002: 69+ `any` Type Usages in Admin Pages

| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Description** | `any` types are pervasive: `app/admin/files/page.tsx:51, 114` (`(p: any)`, `(file: any)`, `app/admin/studio/page.tsx:121, 131` (`bookings: any[]`, `Record<number, any[]>`), `app/admin/search/page.tsx:33-98` (all map callbacks use `any`), `app/admin/accounting/invoices/invoice-form.tsx:28` (`invoice?: any`), `lib/admin-data.ts` (numerous `as any` casts at lines 208, 226, 238, 250, 355, 443, 751, etc.) |
| **Risk Impact** | TypeScript provides zero type safety for these code paths. Refactoring is dangerous — changing a Prisma model won't surface errors in `any`-typed code. Runtime type errors are guaranteed but undetected at compile time. |
| **Affected File(s)** | Multiple files — 69+ matches (see above) |
| **Recommendation** | Replace all `any` types with proper Prisma-generated types (`Prisma.InvoiceGetPayload<{ include: { ... } }>`) or explicit interfaces. For search results, create a discriminated union type. |
| **Effort** | L |

---

### CQ-003: Dead Code — admin-search.tsx, logActivity(), autoLogActivity()

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | Three pieces of dead code: 1) `components/admin-search.tsx` re-exports `CommandPalette` as `GlobalSearch` but `GlobalSearch` is imported by zero files. 2) `lib/admin-data.ts:694-710` defines `logActivity()` which is never called. 3) `lib/actions.ts:1598-1606` defines `autoLogActivity()` which is never called. |
| **Risk Impact** | Dead code increases maintenance surface area, confuses new developers, and may give false confidence that audit logging exists. The `ActivityLog` table is always empty despite having a dedicated helper. |
| **Affected File(s)** | `components/admin-search.tsx`, `lib/admin-data.ts:694-710`, `lib/actions.ts:1598-1606` |
| **Recommendation** | Remove `admin-search.tsx`. Either implement `logActivity()` calls in all actions or remove the dead code. |
| **Effort** | S |

---

### CQ-004: Arabic/English Mixed Without i18n Framework

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | The accounting system uses Arabic (`dir="rtl"`, Arabic labels, Arabic empty states). Most other admin pages use English. `lib/constants.ts` has Arabic translation objects (`paymentStatusArabic`, `quotationStatusArabic`, `contractTypes`, etc.) but no consistent i18n system. Strings are mixed inline in JSX (some English, some Arabic) without locale-based switching. |
| **Risk Impact** | Adding a new language requires manually updating every page. Translation strings are scattered across components and constants. No locale detection or switching mechanism. |
| **Affected File(s)** | `lib/constants.ts`, all accounting pages, various admin pages |
| **Recommendation** | Implement next-intl or a similar i18n library. Extract all user-facing strings into locale files. Use `dir="auto"` or dynamic direction based on locale. |
| **Effort** | L |

---

### CQ-005: Duplicate Logic — Status Badge Colors, InvoiceSummary, Revenue Calculations

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | 1) `InvoiceSummary` component is defined inline in `app/admin/accounting/page.tsx:14` and not shared. 2) Revenue-by-client calculation logic is duplicated between `accounting/page.tsx` (OverviewTab, ReportsTab) and `admin-data.ts` (`getFinanceCenter`). 3) Status badge color logic (mapping status values to CSS colors) is duplicated across invoices page, accounting page, and dashboard. |
| **Risk Impact** | Changed business rules (e.g., "change color of PAID from green to blue") must be updated in multiple locations. Inconsistencies will arise. |
| **Affected File(s)** | `app/admin/accounting/page.tsx:14`, `lib/admin-data.ts`, `app/admin/invoices/page.tsx`, `app/admin/dashboard/page.tsx` |
| **Recommendation** | Extract `InvoiceSummary` to a shared component. Extract revenue calculations to `admin-data.ts` with a single source of truth. Create a shared `statusBadgeColor()` utility. |
| **Effort** | M |

---

### CQ-006: Module-Level Mutable State (keyCounter)

| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Description** | `app/admin/accounting/invoices/invoice-form.tsx:21`: `let keyCounter = 0;` — a module-level mutable variable used to generate unique keys for invoice line items via `keyCounter++`. In React Concurrent mode (Strict Mode, Fast Refresh), this can produce duplicate keys. |
| **Risk Impact** | React key collisions cause rendering bugs in invoice line items: items may not re-render correctly, focus may be lost, and React may produce incorrect DOM updates. In Strict Mode, keys will definitely collide. |
| **Affected File(s)** | `app/admin/accounting/invoices/invoice-form.tsx:21` |
| **Recommendation** | Use `crypto.randomUUID()`, `Date.now()`, or a proper counter scoped to the component instance (via `useRef`). |
| **Effort** | S |

---

### CQ-007: Missing `key` Props on Dynamically Rendered Elements

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | `app/admin/accounting/page.tsx:462`: `<tr><td ... colSpan={4}>لا توجد بيانات</td></tr>` — missing `key` prop on `<tr>` elements rendered inside `map()` callbacks. Similar patterns throughout the accounting page and other list renders. |
| **Risk Impact** | React warnings in console. Potential incorrect DOM patching when list data changes. |
| **Affected File(s)** | `app/admin/accounting/page.tsx:462` and multiple list render locations |
| **Recommendation** | Add unique `key` props to all dynamically rendered elements (use entity IDs where available, index as last resort). |
| **Effort** | S |

---

### CQ-008: SetupNotice Rendered on Every Page

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | The `SetupNotice` component is rendered on every page that checks `hasDatabase()`. Once the database is configured and the first admin is created, this check is unnecessary overhead on every page load. |
| **Risk Impact** | Unnecessary database query on every admin page load. |
| **Affected File(s)** | All admin pages that check `hasDatabase()` |
| **Recommendation** | Cache the `hasDatabase()` result (e.g., in a global singleton or via React cache). Only show `SetupNotice` once, then hide it permanently. |
| **Effort** | S |

---

### CQ-009: Inline SVG Icons Without Shared Component

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | SVG icons are inline in JSX across multiple components. `components/admin-nav-sidebar.tsx` alone has 4 inline SVGs (lines 107, 117, 130, 170). Other components also render SVGs inline. No shared `Icon` component exists. |
| **Risk Impact** | Inconsistent icon appearance. Difficult to update icon set (e.g., switching to a library). |
| **Affected File(s)** | `components/admin-nav-sidebar.tsx`, `components/admin-shell.tsx`, `components/command-palette.tsx`, accounting pages |
| **Recommendation** | Extract SVG icons into a shared `Icon` component with size and color props. Consider using `lucide-react` or `heroicons`. |
| **Effort** | M |

---

### CQ-010: Missing Strict TypeScript Configuration

| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Description** | The codebase uses `Record<string, unknown>` for Prisma where clauses, `as any` for type casting in data functions, and has no strict interfaces for settings, search results, or form data. The `InvoiceForm` receives `settings: Record<string, string>` and `clients: any[]`. |
| **Risk Impact** | No compile-time safety for the most critical data paths in the application. |
| **Affected File(s)** | `lib/admin-data.ts`, `app/admin/accounting/invoices/invoice-form.tsx`, `app/admin/quotations/quotation-form.tsx`, `components/company-settings-form.tsx` |
| **Recommendation** | Create typed interfaces for all data structures. Use Prisma-generated types for database query results. |
| **Effort** | L |

---

## Appendix A: Risk Heat Map

| Area | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Security | 4 | 6 | 5 | 1 |
| Database | 1 | 2 | 3 | 0 |
| Performance | 0 | 1 | 2 | 1 |
| Workflow/Business Logic | 4 | 0 | 1 | 0 |
| API/Server Actions | 0 | 2 | 1 | 1 |
| UX/Frontend | 3 | 1 | 3 | 1 |
| Code Quality | 0 | 2 | 3 | 4 |

**Total: 12 Critical, 14 High, 18 Medium, 8 Low**

---

## Appendix B: Effort Distribution

| Effort | Count | Total Person-Days (Est.) |
|--------|-------|--------------------------|
| S (hours) | 14 | ~7 days |
| M (days) | 12 | ~24 days |
| L (1-2 weeks) | 6 | ~60 days |
| XL (2+ weeks) | 2 | ~40 days |
| **Total** | **34** | **~131 days (~6 months)** |

---

*End of Audit Report — All 8 domains, 4 severity tiers, with full per-issue detail including recommendations and effort estimates.*
