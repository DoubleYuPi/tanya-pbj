# Phase 6 — Real-time (Reverb + broadcasting + notifications)

Phase 5 persisted messages; this phase makes them appear live and adds
the notification system.

## What's new
- **Reverb configured**: `config/reverb.php` added, `config/broadcasting.php`
  rewritten from the Laravel 10-era version it still had (it used the old
  `BROADCAST_DRIVER` key and had no Reverb connection at all).
- **Removed `BroadcastServiceProvider`** — a Laravel 10 leftover that
  called `Broadcast::routes()` and re-required `channels.php`, both of
  which Laravel 11+ already does via `withRouting(channels: ...)` in
  `bootstrap/app.php`. Leaving it in double-registers the auth route.
- **Channel authorization** (`routes/channels.php`) — security-critical.
  It reuses `$user->can('view', $conversation)`, i.e. the *same*
  ConversationPolicy the HTTP layer uses, so there's one source of truth
  for "who may see this conversation". Without this, someone could
  subscribe to another user's conversation channel over the websocket and
  receive their messages live even though `/chat/{id}` would 403.
- **Events**: `MessageSent` and `ConversationUpdated`, both broadcasting
  on a private per-conversation channel with explicitly shaped payloads
  (not raw model serialization, so internal fields stay off the wire).
- **Notifications**: `NewMessageNotification` and
  `ConversationResolvedNotification`, each via `database` (history for the
  bell dropdown) + `broadcast` (live badge updates). Email/WhatsApp/push
  are future features in the spec — they'd slot into `via()` without
  touching any call site.
- **Notification bell** in the dashboard header: unread badge, dropdown
  with history, click-through to the conversation, "tandai semua dibaca",
  and a live subscription to the user's private notification channel.
- **Live chat**: the chat page subscribes to its conversation channel,
  appends incoming messages without a reload, auto-scrolls, and reloads
  authoritative state when the other side resolves/reopens.
  `->toOthers()` prevents the sender seeing their own message twice.
- **Tests** (`BroadcastAuthTest`): proves a user can't authorize onto
  another user's conversation *or* notification channel via
  `/broadcasting/auth`, that a real participant can, and that sending a
  message dispatches the broadcast and notifies the other party (but not
  the sender).
- **`composer run dev`** now launches all four processes at once
  (server + queue + reverb + vite) via `concurrently`.

## Before running
1. Add to your local `.env` (these are new — copy from `.env.example`):
   ```
   BROADCAST_CONNECTION=reverb

   REVERB_APP_ID=tanya-pbj
   REVERB_APP_KEY=tanyapbjlocalkey
   REVERB_APP_SECRET=tanyapbjlocalsecret
   REVERB_HOST="localhost"
   REVERB_PORT=8080
   REVERB_SCHEME=http

   VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
   VITE_REVERB_HOST="${REVERB_HOST}"
   VITE_REVERB_PORT="${REVERB_PORT}"
   VITE_REVERB_SCHEME="${REVERB_SCHEME}"
   ```
   If your `.env` still has a `BROADCAST_DRIVER=log` line, delete it —
   Laravel 11+ reads `BROADCAST_CONNECTION` instead.
2. `composer update` (picks up nothing new PHP-side, but regenerates the
   autoloader now that BroadcastServiceProvider is gone — important).
3. `php artisan migrate` — creates the `notifications` table.
4. `npm install` — picks up `concurrently`.
5. `php artisan config:clear` — the new broadcasting config won't be read
   if an old cached config is sitting there.

## Running it
Four processes now. Either run `composer run dev` (starts all four), or
in separate terminals:
```
php artisan serve
php artisan reverb:start
npm run dev
php artisan queue:listen      # optional; notifications are sync by default
```
Reverb listens on port 8080 — make sure nothing else has it (XAMPP's
Apache sometimes uses 8080 as its alternate port; if so, change both
`REVERB_PORT` and `REVERB_SERVER_PORT`).

## Try it
Open two browsers (or one normal + one incognito): log in as a user in
one and as their assigned admin in the other, open the same conversation
in both, and send a message. It should appear on the other side within a
second, with the bell badge incrementing — no refresh.

If nothing arrives live, check: (a) `php artisan reverb:start` is running,
(b) the browser console for a websocket connection error, (c) that
`BROADCAST_CONNECTION=reverb` is set and config cache is cleared.

## Not yet (Phase 7)
Typing indicators and online-presence tracking (both listed as optional in
the spec), Super Admin user/admin management UI, audit logs, statistics
charts, and the global search page.
