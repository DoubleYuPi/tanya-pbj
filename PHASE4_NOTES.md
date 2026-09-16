# Phase 4 — Admin system

## What's new
- **Public admin directory** (`/admins`): browsable without login, search
  by name/position/organization, filter by expertise (Tender, E-Katalog,
  Kontrak, Swakelola, Regulasi, Lainnya — spec Part 14's exact filter
  list), status indicator (online/away/offline dot).
- **Admin detail page** (`/admins/{admin}`): photo placeholder, position,
  organization, bio, expertise tags, optional stats (consultations/
  answered/response time — all zero/placeholder until Phase 5's chat
  exists), and a disabled "Mulai Konsultasi" button labeled "Segera
  Hadir" (Phase 5 wires this up for real).
- **Privacy note**: the directory/detail endpoints only ever expose name,
  position, organization, bio, expertise, and status — never email, phone,
  or role. Covered by a test (`test_admin_directory_response_never_exposes_email`).
- **Admin's own profile** (`/admin/profile`, separate from the generic
  `/profile` per spec Part 41's route table): position, organization,
  bio, expertise (comma-separated in the UI, stored as a JSON array),
  and availability status — creates the `admin_profiles` row on first
  save if one doesn't exist yet.
- **Quick availability toggle** on the Admin dashboard — a one-click
  online/away/offline switcher (`PATCH /admin/availability`) separate
  from the full profile form, for the "change availability" capability
  in Part 8.
- **User dashboard** now shows real available (online) admins pulled
  from the database instead of a placeholder message, with a link to
  the full directory.
- **Seed data**: 3 sample admins with profiles matching the spec's own
  example (Ahmad Rizky — Tender/E-Katalog/Kontrak, UKPBJ Kota Pontianak;
  plus two more covering Swakelola/Regulasi and E-Katalog/Lainnya).
- **Tests**: directory/profile visibility (guests can browse, inactive
  admins hidden, a plain user's ID 404s as an "admin" rather than leaking
  their data), profile self-editing restricted to the Admin role, and the
  availability toggle.

## Before running
1. `composer update` — no new PHP packages this phase.
2. No new migrations this phase — `admin_profiles` already existed from
   Phase 1.
3. `php artisan db:seed --class=AdminSeeder` (or just `php artisan db:seed`
   again — it's idempotent via `firstOrCreate`/`updateOrCreate`) to get
   the 3 sample admins into your existing database.
4. `npm run dev` + `php artisan serve`, visit `/admins` — should show the
   3 seeded admins with working search/filter.
5. Log in as one of the seeded admin accounts (password: `password`) and
   check `/admin/profile` and the availability toggle on `/admin/dashboard`.
6. `php artisan test` — all Phase 1-4 tests should still pass.

## Still not implemented
Actually starting a consultation (Phase 5 — this is the whole point of
the "Mulai Konsultasi" button, intentionally disabled for now), Super
Admin's ability to create/deactivate Admin accounts from a UI (Phase 7 —
for now, promote a user to admin manually via phpMyAdmin, same as
before), admin avatar upload (field exists on `admin_profiles` but no
upload UI yet).
