# Phase 3 — Regulation library

## What's new
- **Database**: `regulation_categories`, `regulations`, `tags`,
  `regulation_tag`, `user_bookmarks` tables + models + relationships.
- **Storage**: a dedicated `regulations` disk (`storage/app/regulations`,
  never public) plus a reserved `attachments` disk for Phase 5 chat.
  Downloads/previews always go through an authorized controller route,
  never a direct public URL (spec Part 23/38).
- **Public library** (`/peraturan`): search, category filter, pagination,
  cards showing title/type/number/year/issuer, "DATA CONTOH" badge on
  seeded sample data. Browsable and downloadable by guests — only
  bookmarking requires login (Part 26).
- **Regulation detail** (`/peraturan/{regulation}`): full metadata, tags,
  embedded PDF preview (`<iframe>` + a "buka layar penuh" link), download
  button, bookmark toggle (if logged in), related regulations from the
  same category.
- **Bookmarks** (`/peraturan/tersimpan`, User-only): list, remove.
- **Super Admin CMS** (`/admin/peraturan`, `/admin/categories`): table
  view with search, create/edit forms (category dropdown, tags as a
  comma-separated field, status, PDF upload with `mimes:pdf` + configurable
  max size via `REGULATION_MAX_UPLOAD_MB`), delete (soft delete), and a
  separate category CRUD page. Every mutating action re-checks
  `RegulationPolicy` directly, not just the route middleware.
- **RegulationPolicy**: published regulations are viewable by anyone;
  create/update/delete restricted to Super Admin.
- **Seed data**: 10 categories, 15 sample regulations — each with a real,
  valid placeholder PDF (not a broken file reference) so download/preview
  actually work out of the box, all flagged `is_sample_data` and titled
  with "(DATA CONTOH)".
- **Tests**: `RegulationLibraryTest` (public browsing, draft regulations
  hidden from guests but visible to Super Admin, CMS restricted to Super
  Admin only, PDF-only upload validation) and `BookmarkTest` (guests can't
  bookmark, users only see their own bookmarks).
- Wired real links into the landing page search bar, User/Admin/Super
  Admin nav sidebars, and the User/Super Admin dashboards (real bookmark
  count and total regulation count instead of placeholder zeros).

## Before running
1. Add to your local `.env` (not in the zip, since `.env` is gitignored):
   ```
   REGULATION_MAX_UPLOAD_MB=25
   ```
2. `composer update` — no new PHP packages this phase, but there's still
   no committed lock file.
3. `php artisan migrate` — creates the 5 new tables.
4. `php artisan db:seed` — populates categories + 15 sample regulations
   with working placeholder PDFs. Safe to re-run (categories use
   `firstOrCreate`).
5. `npm run dev` + `php artisan serve`, then visit `/peraturan` — you
   should see 15 "DATA CONTOH" cards, searchable and filterable, each
   with a working preview/download.
6. To run the tests: `php artisan test` (needs `pdo_sqlite` enabled, per
   Phase 2's notes).

## Still not implemented (per the phase plan)
Admin directory/profiles (Phase 4), chat (Phase 5), user/admin management
UI and audit logs (Phase 7). "Peraturan terkait" only looks within the
same category for now — no tag-based relevance scoring.
