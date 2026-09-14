# Phase 1 — Frontend foundation

## What's new
- **Inertia + React + TypeScript + Tailwind v4 + shadcn/ui-style components**
  wired in: `composer.json` (inertiajs/inertia-laravel, laravel/reverb,
  tightenco/ziggy), `package.json`, `vite.config.ts`, `tsconfig.json`,
  `resources/css/app.css` (Tanya PBJ navy/emerald theme via CSS variables),
  `resources/views/app.blade.php` (Inertia root view, replaces the old
  `welcome.blade.php`).
- **Auth**: full Login / Register / Forgot-Reset Password / Email
  Verification / Confirm Password / Password Update flow —
  `app/Http/Controllers/Auth/*` + `resources/js/Pages/Auth/*`.
- **Roles**: `users.role` enum added via a new migration (the original
  `users` table already existed with real migration history, so this
  *adds* columns rather than editing the old migration file), plus
  `admin_profiles` table and `EnsureUserHasRole` middleware
  (`role:admin`, `role:super_admin`).
- **The four layouts from spec Part 42**: `PublicLayout` (navbar+footer,
  used by the landing page), `UserLayout`, `AdminLayout`,
  `SuperAdminLayout` — the latter three share one `DashboardShell`
  component so the sidebar/mobile-nav/logout chrome isn't duplicated
  three times; only the nav item lists differ per role.
- **Landing page** (Part 10/11): hero, search bar, "Cara Kerja" steps,
  feature cards. Stats and "peraturan populer" are placeholders — real
  once Phase 3/5 exist.
- **Three dashboards** (User/Admin/Super Admin) with placeholder stat
  cards (all zero) — they'll read real numbers once conversations/
  regulations exist in Phase 3-5.

## What's intentionally NOT here yet (per the phase plan)
Regulation library, admin directory/profiles, chat, notifications,
bookmarks, search, audit logs, Super Admin CMS — these are Phases 3-7.
The routes reserved for them in `routes/web.php` are commented, and the
DB tables for most of them don't exist yet either.

## Before you run anything
1. `composer update` — pulls in Inertia/Reverb/Ziggy.
2. `php artisan migrate` — runs the two new migrations (adds role/phone/
   is_active/soft-deletes to `users`, creates `admin_profiles`).
3. `npm install`
4. `npm run dev` (separate terminal) + `php artisan serve`
5. Visit `/` — should show the Tanya PBJ landing page. Register a user,
   confirm it lands on the User dashboard.
6. To test Admin/Super Admin dashboards, manually set a user's `role`
   column to `admin` or `super_admin` via phpMyAdmin/CLI for now — a
   proper Super Admin user-management UI is Phase 7.
