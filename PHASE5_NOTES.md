# Phase 5 — Chat / consultation system

This is the core feature. Per the spec's own phasing, Phase 5 is
**database-backed messaging**; real-time broadcasting (Reverb) is
explicitly Phase 6 — "Build database-backed messaging first. Then
implement real-time broadcasting." So messages persist and appear on
page load/navigation, but don't yet push live without a refresh.

## What's new
- **Database**: `conversations`, `conversation_participants`, `messages`,
  `message_attachments` + models and relationships.
- **ConversationPolicy** — the security centerpiece (spec Part 17):
  - a user sees only their own conversations
  - an admin sees only conversations assigned to them
  - Super Admin can *view* any conversation (Part 7 "monitor") but
    explicitly **cannot send messages** into one — monitoring isn't
    participation
  - no messages into resolved/closed conversations
- **ConversationService** — business logic kept out of the controller
  (Part 46): starting a consultation, posting messages with attachments,
  auto-flipping status between `waiting_for_admin`/`waiting_for_user`,
  resolve/reopen. Also prevents duplicate threads: starting a second
  consultation with the same admin while one is still unresolved reuses
  the existing conversation rather than fragmenting the history.
- **One shared ChatController** serving both `/chat` (User) and
  `/admin/chat` (Admin) — same logic, correctly scoped per role by the
  query + policy, rather than two near-identical controllers.
- **Chat UI** (`Chat/Index.tsx`): the 3-column desktop layout from Part 16
  (conversation list / messages / participant panel). On mobile the list
  and thread swap to a single full-screen column (Part 34). User messages
  right-aligned, admin left, attachments rendered as download links,
  status badges, resolve/reopen button, Enter-to-send.
- **Attachments**: PDF/DOC/DOCX/JPG/JPEG/PNG only, validated by actual
  file content (`mimes:`) not the client-reported type, max 3 per message,
  size configurable via `ATTACHMENT_MAX_UPLOAD_MB`. Stored on the private
  `attachments` disk with UUID filenames; downloads go through an
  authorized route that re-checks ConversationPolicy.
- **"Mulai Konsultasi" now actually works** — the admin profile page has
  a real question form (guests get a "Masuk untuk Mulai Konsultasi"
  button instead).
- **Dashboards wired to real data**: User sees real active/resolved
  counts; Admin sees a real "Pertanyaan Menunggu Jawaban" queue with
  working "Jawab" buttons; Super Admin sees real conversation totals.
- **Seed data**: 10 sample users (each with a random satuan kerja),
  10 conversations using the spec's own example questions, 30+ messages,
  with ~a third resolved so statuses vary.
- **Tests**: `ConversationPrivacyTest` covers the spec's literal security
  example — User A cannot reach User B's conversation by changing the
  URL — plus cross-admin isolation, the Super-Admin-can-view-but-not-post
  rule, and role separation between `/chat` and `/admin/chat`.
  `ChatFlowTest` covers start/reply/status-flip/attachments/resolve/reopen
  and rejects `.exe` uploads.

## Before running
1. Add to your local `.env`:
   ```
   ATTACHMENT_MAX_UPLOAD_MB=10
   ```
2. `composer update`
3. `php artisan migrate` — creates the 4 new chat tables.
4. `php artisan db:seed` — adds sample users/conversations/messages.
   (Safe to re-run; regulation/admin seeders are idempotent, though this
   will add another 10 users + 10 conversations each time you run it.)
5. `npm run dev` + `php artisan serve`.

## Try the full flow
- Log in as a seeded user (any of the 10 new ones, password `password` —
  find an email via `php artisan tinker` → `User::where('role','user')->first()`).
- Go to `/admins` → pick an admin → type a question → "Kirim Pertanyaan".
- Log in as that admin (e.g. `ahmad.rizky@tanyapbj.test`, password
  `password`) → dashboard shows the question → "Jawab" → reply.
- Back as the user, the reply is there. Mark it resolved, reopen it.
- **Try the security check yourself**: while logged in as one user, note
  another user's conversation ID and visit `/chat/{that-id}` — you should
  get a 403, not their messages.

## Not yet (Phase 6)
Live push via Reverb/broadcasting, notifications (bell/unread badge
beyond the per-conversation count already shown), typing indicators,
online presence. Unread counts and read receipts are already persisted —
Phase 6 just makes them update without a refresh.
