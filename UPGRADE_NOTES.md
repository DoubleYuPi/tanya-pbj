# Phase 0 upgrade notes (Laravel 10.50.3 → Laravel 13)

## What changed
- `composer.json`: `laravel/framework` ^10.10 → ^13.0, `laravel/sanctum` ^3.3 → ^4.0,
  `php` ^8.1 → ^8.3, dev deps bumped to their Laravel-13-compatible versions
  (`spatie/laravel-ignition` dropped — no longer part of the default skeleton).
- Removed `app/Http/Kernel.php`, `app/Console/Kernel.php`,
  `app/Providers/RouteServiceProvider.php`, `app/Providers/EventServiceProvider.php`,
  `app/Providers/AuthServiceProvider.php`, `app/Exceptions/Handler.php` — Laravel 11+
  folds all of these into `bootstrap/app.php` + `bootstrap/providers.php`.
- New `bootstrap/app.php` (fluent `Application::configure()` style) and
  `bootstrap/providers.php`.
- `app/Providers/AppServiceProvider.php` now carries over the two things the
  deleted providers used to do: the `api` rate limiter and the
  `Registered → SendEmailVerificationNotification` event listener.
- `vendor/` and `composer.lock` were removed from this delivery (they were
  built against PHP 8.1 / Laravel 10 and are now stale) — you'll regenerate
  both with `composer update`.
- Nothing else was touched: no custom app code existed in the uploaded
  project (it was an untouched `laravel new tanya-pbj`), so there was
  nothing to migrate beyond the skeleton itself.

## What you need to do
1. Upgrade PHP locally to 8.3+ (see chat for OS-specific steps).
2. `composer update` (not `composer install` — the lock file is gone on purpose).
3. `php artisan key:generate` if `composer update` doesn't do it for you.
4. `php artisan about` → confirm it reports Laravel 13.x.
5. `php artisan migrate:status` → confirm the 4 default migrations still show
   correctly against your `tanya_pbj` database.
6. `php artisan serve` → confirm the default welcome page still loads at `/up`
   and `/`.
7. Report back the output of steps 4–6 (or any errors) before we move to
   Phase 1 (Inertia + React + TypeScript + Tailwind + shadcn/ui setup).

## Git
- `b69c041` — checkpoint of the original vanilla Laravel 10.50.3 project,
  before any change.
- `a5d5a0e` — this Phase 0 upgrade.
- `composer.json.pre-upgrade.bak` / `composer.lock.pre-upgrade.bak` are also
  sitting in the project root as an extra copy outside git, per the spec's
  "back up composer.json and composer.lock" instruction.
