# EDUKA - INITIAL AUDIT REPORT & PRODUCTION SECURITY REBUILD SPECIFICATION

## 1. Executive Summary & Audit Scope
This audit presents an exhaustive security and architectural assessment of the EDUKA codebase. The system as evaluated was operating as a client-side prototype utilizing `localStorage` as a mock database engine (`DatabaseEngine`), hardcoded mock seeds (`DEFAULT_STUDENTS`, `DEFAULT_PARENTS`, `DEFAULT_INVOICES`, `DEFAULT_GRADES`), simulated role-switching (`DEMO_USERS`, `switchRole`), client-side financial balance calculations, and simulated background synchronization timers.

This report establishes the baseline vulnerabilities across OWASP Top 10 and OWASP API Security Top 10 guidelines, and details the production architecture required to transform EDUKA into a secure, multi-tenant, production-ready SaaS application.

---

2. Hardcoded Data & Mock Seed Inventory
The following hardcoded datasets were identified in `src/services/db.ts`:
- **Organizations & Schools**: `DEFAULT_ORGANIZATION`, `DEFAULT_SCHOOLS` (3 Haitian schools).
- **Academic Structure**: `DEFAULT_ACADEMIC_YEARS`, `DEFAULT_SUBJECTS`, `DEFAULT_CLASSES`.
- **User Records & PII**:
  - `DEFAULT_PARENTS` (Includes full names, personal phone numbers, emails, home addresses).
  - `DEFAULT_TEACHERS` (Includes teacher IDs, phone numbers, emails, hire dates).
  - `DEFAULT_STUDENTS` (7 student profiles with birth dates, birth places, blood groups, medical notes, scholarship rates).
- **Financial & Operational Data**:
  - `DEFAULT_FEES`, `DEFAULT_INVOICES`, `DEFAULT_PAYMENTS` (Hardcoded Gourde/USD amounts and MonCash/Bank references).
  - `DEFAULT_ATTENDANCE`, `DEFAULT_ASSESSMENTS`, `DEFAULT_GRADES`, `DEFAULT_TIMETABLE`, `DEFAULT_ADMISSIONS`, `DEFAULT_DOCUMENTS`, `DEFAULT_MESSAGES`, `DEFAULT_EVENTS`, `DEFAULT_AUDIT_LOGS`, `DEFAULT_SESSIONS`.

*Production Policy*: All `DEFAULT_*` seeds must be stripped from production runtime bundles and migrated strictly to environment-isolated development seeders (`prisma/seed.ts`).

---

3. Authentication, Session & Authorization Security Vulnerabilities
- **Fake User Switching (`src/services/auth.ts`)**:
  - `DEMO_USERS` object exposed 8 predefined role credentials (super_admin, admin, direction, secretaire, comptable, enseignant, parent, eleve).
  - `auth.switchRole(role)` allowed arbitrary, client-controlled role elevation without server authentication or password checks.
  - Active role persisted directly in `localStorage` under `eduka_current_role`.
- **Client-Side RBAC (`ROLE_PERMISSIONS`)**:
  - Role permissions were checked solely in React via `auth.hasPermission(permission)`.
  - An attacker could modify client state or craft direct network requests to bypass all frontend permission gates.
- **Session Security Risks**:
  - Mock active sessions (`DEFAULT_SESSIONS`) were kept in browser memory.
  - No HttpOnly cookie session management, JWT verification, session rotation, or server-side revocation existed.

---

4. Financial Integrity & Business Logic Flaws
- **Client-Side Financial Recalculation (`src/services/db.ts`, `src/services/finance.ts`)**:
  - Invoice payment incrementing was executed directly in browser code (`inv.amountPaid += payment.amount`).
  - No database transactions, row-level locks, or server validation prevented race conditions, double payments, negative payment values, or balance manipulation.
- **Simulated Third-Party Payments**:
  - MonCash / NatCash / Bank transactions relied on client assertions of "payment success" without cryptographic webhook signature checks or idempotency handling.

---

5. Offline Sync, Audit & AI Risks
- **Fake Synchronization Engine (`src/services/sync.ts`)**:
  - Sync queue processing used `setTimeout` to auto-mark operations as `synced` without sending data to any remote API.
- **Manipulable Audit Logs**:
  - Audit logs were generated on the client via `db.addAuditLog(...)` and stored in `localStorage`, allowing any user to fabricate or erase audit entries.
- **AI Gateway & Secrets**:
  - `@google/genai` was configured for client-side invocations, risking API key leaks in production JS bundles.

---

6. OWASP Top 10 & OWASP API Security Mapping
1. **A01:2021 - Broken Access Control / API1:2023 Broken Object Level Authorization (BOLA)**:
   - Client-controlled `schoolId` and resource IDs allowed cross-tenant and cross-user data access without server-side validation.
2. **A02:2021 - Cryptographic Failures / API2:2023 Broken Authentication**:
   - Authentication bypass via `switchRole`, lack of server session validation, and absence of Argon2id password hashing.
3. **A04:2021 - Insecure Design / API6:2023 Server-Side Request Forgery & Unrestricted Resource Consumption**:
   - Absence of backend rate limiting on login, registration, password resets, and file uploads.
4. **A08:2021 - Software and Data Integrity Failures**:
   - Client-authoritative payment balances, attendance status, and grade locking.

---

7. Production Rebuild Target Architecture
- **Backend Framework**: Express.js with TypeScript (`src/server/`).
- **Database**: PostgreSQL managed via Prisma ORM (`prisma/schema.prisma`).
- **Session Strategy**: HttpOnly, SameSite=Strict, Secure cookies backed by server session store.
- **Authentication**: Argon2id password hashing, TOTP-based 2FA, session rotation, rate limiting.
- **Tenant & Role Security**: Server-enforced middleware (`auth.ts`, `permission.ts`) isolating Organization and School IDs from session metadata.
