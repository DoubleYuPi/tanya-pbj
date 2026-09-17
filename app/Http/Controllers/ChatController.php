<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Http\Requests\StartConversationRequest;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    // Serves both /chat (User) and /admin/chat (Admin) — the same logic
    // correctly scopes "my conversations" for either role via the query
    // below plus ConversationPolicy, so there's no need for two near-
    // identical controllers (spec Part 46: avoid duplicated code).
    public function __construct(private readonly ConversationService $conversations)
    {
    }

    public function index(Request $request): Response
    {
        return $this->render($request, null);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorize('view', $conversation);

        // Mark the other side's messages as read now that this user has
        // opened the conversation.
        $conversation->messages()
            ->where('user_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->render($request, $conversation);
    }

    public function store(StartConversationRequest $request)
    {
        $admin = User::findOrFail($request->validated('admin_id'));

        $conversation = $this->conversations->startOrFindExisting(
            $request->user(),
            $admin,
            $request->validated('message')
        );

        return to_route('chat.show', $conversation)
            ->with('success', 'Konsultasi Anda telah dikirim.');
    }

    public function storeMessage(SendMessageRequest $request, Conversation $conversation)
    {
        $this->conversations->postMessage(
            $conversation,
            $request->user(),
            $request->validated('body'),
            $request->file('attachments', [])
        );

        return back();
    }

    public function resolve(Request $request, Conversation $conversation)
    {
        $this->authorize('markResolved', $conversation);

        $this->conversations->markResolved($conversation);

        return back()->with('success', 'Percakapan ditandai selesai.');
    }

    public function reopen(Request $request, Conversation $conversation)
    {
        $this->authorize('reopen', $conversation);

        $this->conversations->reopen($conversation);

        return back()->with('success', 'Percakapan dibuka kembali.');
    }

    public function downloadAttachment(MessageAttachment $attachment)
    {
        $this->authorize('view', $attachment->message->conversation);

        abort_unless(Storage::disk($attachment->disk)->exists($attachment->path), 404);

        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->original_name);
    }

    private function render(Request $request, ?Conversation $active): Response
    {
        $user = $request->user();

        $listQuery = Conversation::query()->with(['user', 'admin'])->orderByDesc('last_message_at');
        $listQuery = $user->isAdmin()
            ? $listQuery->where('admin_id', $user->id)
            : $listQuery->where('user_id', $user->id);

        $conversations = $listQuery->get()->map(fn (Conversation $c) => $this->summarize($c, $user));

        $activeData = null;

        if ($active) {
            $active->load(['messages.sender', 'messages.attachments']);

            $activeData = [
                'id' => $active->id,
                'subject' => $active->subject,
                'status' => $active->status,
                'counterpart' => $this->counterpartData($active, $user),
                'messages' => $active->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'body' => $m->body,
                    'user_id' => $m->user_id,
                    'sender_name' => $m->sender->name,
                    'created_at' => $m->created_at->toIso8601String(),
                    'read_at' => $m->read_at?->toIso8601String(),
                    'attachments' => $m->attachments->map(fn ($a) => [
                        'id' => $a->id,
                        'original_name' => $a->original_name,
                        'mime_type' => $a->mime_type,
                    ]),
                ]),
            ];
        }

        $routePrefix = $user->isAdmin() ? 'admin.chat' : 'chat';

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'activeConversation' => $activeData,
            'routePrefix' => $routePrefix,
        ]);
    }

    private function summarize(Conversation $c, User $viewer): array
    {
        $counterpart = $c->counterpart($viewer);
        $unreadCount = $c->messages()->where('user_id', '!=', $viewer->id)->whereNull('read_at')->count();

        return [
            'id' => $c->id,
            'counterpart_name' => $counterpart?->name ?? 'Belum ditugaskan',
            'status' => $c->status,
            'last_message_at' => $c->last_message_at?->diffForHumans(),
            'unread_count' => $unreadCount,
        ];
    }

    private function counterpartData(Conversation $c, User $viewer): array
    {
        $counterpart = $c->counterpart($viewer);

        return [
            'id' => $counterpart?->id,
            'name' => $counterpart?->name ?? 'Belum ditugaskan',
            'position' => $counterpart?->adminProfile?->position,
            'status' => $counterpart?->adminProfile?->status,
        ];
    }
}
