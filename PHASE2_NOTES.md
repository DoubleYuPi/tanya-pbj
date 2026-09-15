# Phase 2 — Authorization hardening & role isolation tests

Most of "Login, Registration, Password reset, Roles, User dashboard"
(the literal Phase 2 checklist) already landed in Phase 1. What this
phase adds:

## Fixed a contradiction in the spec
Part 29 and Part 30 both assign `/admin/dashboard` to two different
roles (Super Admin and Admin). Resolved by following Part 41's explicit
route table, which only lists `/admin/dashboard` under Admin — Super
Admin keeps using the shared, role-aware `/dashboard` (already renders
the right page per role via DashboardController). Removed the redundant
`/admin/super-dashboard` route from Phase 1 and updated
`SuperAdminLayout`'s nav links accordingly.

## Custom error pages (Part 37)
`bootstrap/app.php` now renders an Inertia `Error` page for 403/404/419/
429/500/503 responses — in Indonesian, no stack traces or SQL details
ever shown. This only activates when `APP_DEBUG=false`; locally with
debug mode on you'll still see Laravel's full debug page, which is what
you want during development. To actually see the custom error page
locally, temporarily set `APP_DEBUG=false` in `.env` and visit a 404 URL
or a role-restricted route as the wrong role.

## Authorization tests (Part 44)
Three new test files under `tests/Feature/`:
- `Auth/AuthenticationTest.php` — login success/failure, deactivated
  accounts blocked, logout, guests redirected from `/dashboard`.
- `Auth/RegistrationTest.php` — registration always creates a `user`
  role account even if the request tries to pass `role=super_admin`,
  and satuan_kerja must be one of the 32 valid values.
- `Authorization/RoleAccessTest.php` — the important one: proves each
  role sees its own dashboard, a plain user gets 403 on `/admin/dashboard`,
  Super Admin can reach every role-gated route, and guests get redirected
  to login rather than seeing content.

## Before running the tests
Tests use in-memory SQLite (configured in `phpunit.xml`) so they never
touch your dev MySQL database. This needs the `pdo_sqlite` PHP extension
enabled — in your php.ini, alongside the extensions you enabled earlier
(curl, mbstring, openssl, pdo_mysql, mysqli, zip, gd), also uncomment:
```
extension=pdo_sqlite
extension=sqlite3
```
Then restart your terminal and run:
```
php artisan test
```
(or `vendor/bin/phpunit`). All tests should pass. If any fail, paste me
the output.
