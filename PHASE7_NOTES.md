# Phase 7 — Super Admin (management, audit logs, statistics, search)

## What's new
- **Audit trail** (`audit_logs` table + `AuditLogger` service): every
  admin-account creation/edit, user activation/deactivation, and
  regulation create/update/delete is now recorded with actor, action,
  description, IP, and timestamp. `user_id` is `nullOnDelete` but
  `actor_name` is stored as a snapshot alongside it, so deleting an
  account never destroys the readability of what they did — there's a
  test for exactly that.
- **User management** (`/admin/users`): searchable list (name, email,
  satuan kerja), activate/deactivate with confirmation, and a detail
  view. The detail view deliberately shows only account metadata and a
  conversation *count* — never the conversation contents, since chat
  privacy (Part 21) still applies to the Super Admin's monitoring role.
- **Admin management** (`/admin/admins`): create and edit admin accounts
  with their full profile (position, organization, bio, expertise) in one
  form. This is now the proper way to make an admin — no more flipping
  the `role` column by hand in phpMyAdmin. Password is optional on edit
  (blank = unchanged).
- **Audit log viewer** (`/admin/audit-logs`): searchable, filterable by
  action type, paginated.
- **Statistics** (`/admin/statistics`): totals plus 6-month bar charts
  for conversations, new users, and regulations uploaded, and a
  conversation status breakdown. The per-month query uses date ranges
  rather than a raw `DATE_FORMAT` expression so it works on both MySQL
  and the SQLite test database instead of only one.
- **Global search** (`/cari`): searches regulation titles, numbers,
  descriptions and tags, plus admin names/positions/organizations/
  expertise. Results are grouped by type with counts, and capped at 10
  per group with a "see all" link rather than dumping the table into the
  browser. The landing page hero search now points here.
- **Charts without a new dependency**: `BarChart` is a small inline
  component rather than pulling in a charting library — the spec's charts
  are simple monthly counts, so this keeps the bundle lean.

## Safety guards worth knowing about
- A Super Admin account cannot be deactivated through the user management
  screen (guards against locking yourself out) — tested.
- Search results and the admin directory never expose admin email
  addresses — tested.
- Draft regulations don't appear in global search — tested.

## Before running
1. `composer update`
2. `php artisan migrate` — creates `audit_logs`.
3. `npm run dev` + `php artisan serve` (plus `php artisan reverb:start`
   for chat), or just `composer run dev`.
4. Log in as your Super Admin and check the new sidebar items:
   Manajemen Pengguna, Manajemen Admin, Statistik, Audit Log.

## Try it
- Create an admin from `/admin/admins/create`, then check `/admin/audit-logs`
  — the creation should be recorded there.
- Upload or delete a regulation, then check the audit log again.
- Deactivate a test user, then try logging in as them — login should be
  refused (that check has been in place since Phase 1).
- Search for "swakelola" or an admin's name from the landing page hero.

## Remaining (Phase 8)
Final polish: responsive/accessibility pass, loading and empty states
audit, a security review sweep, performance (N+1 checks, eager loading),
and filling out remaining test coverage. `/admin/settings` from the spec's
route list is still unimplemented — it was never given concrete
requirements beyond the name, so it's worth deciding what belongs there.
