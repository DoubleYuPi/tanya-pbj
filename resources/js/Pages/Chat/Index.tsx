import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { PageProps } from '@/types';
import { Paperclip, Send, CheckCircle2, RotateCcw, Circle, FileText, MessageCircleQuestion } from 'lucide-react';

interface ConversationSummary {
    id: number;
    counterpart_name: string;
    status: string;
    last_message_at: string | null;
    unread_count: number;
}

interface MessageAttachment {
    id: number;
    original_name: string;
    mime_type: string;
}

interface MessageData {
    id: number;
    body: string;
    user_id: number;
    sender_name: string;
    created_at: string;
    read_at: string | null;
    attachments: MessageAttachment[];
}

interface ActiveConversation {
    id: number;
    subject: string | null;
    status: string;
    counterpart: { id: number | null; name: string; position: string | null; status: string | null };
    messages: MessageData[];
}

const STATUS_LABEL: Record<string, string> = {
    open: 'Terbuka',
    waiting_for_admin: 'Menunggu Admin',
    waiting_for_user: 'Menunggu Anda',
    resolved: 'Selesai',
    closed: 'Ditutup',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
    open: 'default',
    waiting_for_admin: 'outline',
    waiting_for_user: 'outline',
    resolved: 'secondary',
    closed: 'outline',
};

export default function ChatIndex() {
    const { auth, conversations, activeConversation, routePrefix } = usePage<PageProps<{
        conversations: ConversationSummary[];
        activeConversation: ActiveConversation | null;
        routePrefix: 'chat' | 'admin.chat';
    }>>().props;

    const [body, setBody] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Messages that arrived over the websocket since this page rendered.
    // Kept separate from the Inertia props so a partial reload doesn't
    // duplicate them — the reload replaces `activeConversation.messages`
    // with the full server-side list, at which point we clear these.
    const [liveMessages, setLiveMessages] = useState<MessageData[]>([]);

    useEffect(() => {
        setLiveMessages([]);
    }, [activeConversation?.id, activeConversation?.messages.length]);

    useEffect(() => {
        if (!activeConversation) return;

        const channel = window.Echo.private(`conversation.${activeConversation.id}`);

        channel.listen('.message.sent', (e: { message: MessageData }) => {
            setLiveMessages((prev) =>
                prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message]
            );
        });

        channel.listen('.conversation.updated', () => {
            // Status changed on the other side — pull the authoritative
            // state rather than guessing at it client-side.
            router.reload({ only: ['activeConversation', 'conversations'] });
        });

        return () => {
            window.Echo.leave(`conversation.${activeConversation.id}`);
        };
    }, [activeConversation?.id]);

    const allMessages = activeConversation
        ? [...activeConversation.messages, ...liveMessages.filter(
            (lm) => !activeConversation.messages.some((m) => m.id === lm.id)
          )]
        : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages.length]);
    const Layout = routePrefix === 'admin.chat' ? AdminLayout : UserLayout;

    const isResolved = activeConversation ? ['resolved', 'closed'].includes(activeConversation.status) : false;

    const submitMessage: FormEventHandler = (e) => {
        e.preventDefault();
        if (!activeConversation || !body.trim()) return;

        router.post(route(`${routePrefix}.messages.store`, activeConversation.id), {
            body,
            attachments: files,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setBody('');
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const toggleResolved = () => {
        if (!activeConversation) return;
        const action = isResolved ? 'reopen' : 'resolve';
        router.post(route(`${routePrefix}.${action}`, activeConversation.id), {}, { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title={activeConversation ? activeConversation.counterpart.name : 'Konsultasi'} />

            <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
                {/* LEFT: conversation list — hidden on mobile once a conversation is open */}
                <aside className={`w-full shrink-0 overflow-y-auto border-r border-[var(--color-border)] sm:w-80 ${activeConversation ? 'hidden sm:block' : 'block'}`}>
                    <div className="border-b border-[var(--color-border)] p-4">
                        <h1 className="font-semibold text-[var(--color-navy-700)]">Riwayat Konsultasi</h1>
                    </div>
                    {conversations.length === 0 ? (
                        <p className="p-4 text-sm text-[var(--color-muted-foreground)]">Belum ada konsultasi.</p>
                    ) : (
                        <ul>
                            {conversations.map((c) => (
                                <li key={c.id}>
                                    <Link
                                        href={route(`${routePrefix}.show`, c.id)}
                                        className={`flex items-center justify-between gap-2 border-b border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)] ${activeConversation?.id === c.id ? 'bg-[var(--color-muted)]' : ''}`}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{c.counterpart_name}</p>
                                            <p className="text-xs text-[var(--color-muted-foreground)]">{c.last_message_at}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {c.unread_count > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-secondary)] text-xs font-semibold text-white">
                                                    {c.unread_count}
                                                </span>
                                            )}
                                            <Badge variant={STATUS_VARIANT[c.status]} className="text-[10px]">{STATUS_LABEL[c.status]}</Badge>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* CENTER: active conversation */}
                <section className={`flex min-w-0 flex-1 flex-col ${activeConversation ? 'flex' : 'hidden sm:flex'}`}>
                    {!activeConversation ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--color-muted-foreground)]">
                            <MessageCircleQuestion className="h-8 w-8" />
                            <p>Pilih konsultasi di sebelah kiri, atau mulai konsultasi baru dari halaman admin.</p>
                        </div>
                    ) : (
                        <>
                            <header className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
                                <div className="flex items-center gap-2">
                                    <Link href={route(`${routePrefix}.index`)} className="text-sm text-[var(--color-muted-foreground)] sm:hidden">←</Link>
                                    <div>
                                        <p className="font-semibold">{activeConversation.counterpart.name}</p>
                                        {activeConversation.counterpart.position && (
                                            <p className="text-xs text-[var(--color-muted-foreground)]">{activeConversation.counterpart.position}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={STATUS_VARIANT[activeConversation.status]}>{STATUS_LABEL[activeConversation.status]}</Badge>
                                    <Button size="sm" variant="outline" onClick={toggleResolved}>
                                        {isResolved ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {isResolved ? 'Buka Kembali' : 'Tandai Selesai'}
                                    </Button>
                                </div>
                            </header>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {allMessages.map((m) => {
                                    const mine = m.user_id === auth.user?.id;
                                    return (
                                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-muted)] text-[var(--color-foreground)]'}`}>
                                                <p className="whitespace-pre-wrap">{m.body}</p>
                                                {m.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {m.attachments.map((a) => (
                                                            <a
                                                                key={a.id}
                                                                href={route('chat.attachments.download', a.id)}
                                                                className={`flex items-center gap-1 text-xs underline ${mine ? 'text-white/90' : 'text-[var(--color-primary)]'}`}
                                                            >
                                                                <FileText className="h-3 w-3" /> {a.original_name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-[var(--color-muted-foreground)]'}`}>
                                                    {new Date(m.created_at).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {!isResolved && (
                                <form onSubmit={submitMessage} className="flex items-end gap-2 border-t border-[var(--color-border)] p-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                                        aria-label="Lampirkan file"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                                    />
                                    <textarea
                                        className="flex-1 resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                                        rows={1}
                                        placeholder="Ketikan pertanyaan Anda..."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                submitMessage(e as unknown as React.FormEvent);
                                            }
                                        }}
                                    />
                                    <Button type="submit" size="icon" disabled={!body.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                            {files.length > 0 && (
                                <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-muted-foreground)]">
                                    {files.length} file dipilih: {files.map((f) => f.name).join(', ')}
                                </p>
                            )}
                        </>
                    )}
                </section>

                {/* RIGHT: participant info panel — desktop only */}
                {activeConversation && (
                    <aside className="hidden w-64 shrink-0 border-l border-[var(--color-border)] p-4 lg:block">
                        <div className="flex flex-col items-center text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-navy-100)] text-xl font-semibold text-[var(--color-navy-600)]">
                                {activeConversation.counterpart.name.charAt(0)}
                            </span>
                            <p className="mt-2 font-semibold">{activeConversation.counterpart.name}</p>
                            {activeConversation.counterpart.position && (
                                <p className="text-xs text-[var(--color-muted-foreground)]">{activeConversation.counterpart.position}</p>
                            )}
                            {activeConversation.counterpart.status && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs">
                                    <Circle className={`h-2.5 w-2.5 fill-current ${activeConversation.counterpart.status === 'online' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                    <span className="text-[var(--color-muted-foreground)]">
                                        {activeConversation.counterpart.status === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </Layout>
    );
}
