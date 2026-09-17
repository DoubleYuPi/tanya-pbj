import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { PageProps } from '@/types';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
    const { auth, notifications, unreadNotificationCount } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Live-refresh the bell when something lands on this user's private
    // notification channel, so the badge updates without a page load.
    useEffect(() => {
        if (!auth.user) return;

        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);

        channel.notification(() => {
            router.reload({ only: ['notifications', 'unreadNotificationCount'] });
        });

        return () => {
            window.Echo.leave(`App.Models.User.${auth.user?.id}`);
        };
    }, [auth.user?.id]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const openNotification = (id: string, conversationId: number | null) => {
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                if (conversationId) {
                    const routeName = auth.user?.role === 'admin' ? 'admin.chat.show' : 'chat.show';
                    router.visit(route(routeName, conversationId));
                }
            },
        });
    };

    const markAllRead = () => {
        router.post(route('notifications.readAll'), {}, { preserveScroll: true });
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                aria-label="Notifikasi"
                aria-expanded={open}
            >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-[10px] font-semibold text-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
                        <p className="text-sm font-semibold">Notifikasi</p>
                        {unreadNotificationCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-[var(--color-primary)] hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                            Belum ada notifikasi.
                        </p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto">
                            {notifications.map((n) => (
                                <li key={n.id}>
                                    <button
                                        onClick={() => openNotification(n.id, n.conversation_id)}
                                        className={`w-full border-b border-[var(--color-border)] px-4 py-3 text-left hover:bg-[var(--color-muted)] ${!n.read_at ? 'bg-[var(--color-emerald-50)]' : ''}`}
                                    >
                                        <p className="text-sm font-medium">{n.sender_name}</p>
                                        <p className="truncate text-xs text-[var(--color-muted-foreground)]">{n.preview}</p>
                                        <p className="mt-0.5 text-[10px] text-[var(--color-muted-foreground)]">{n.created_at}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
