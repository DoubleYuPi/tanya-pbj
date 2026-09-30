import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';

// SAPA PBJ — rule-based landing page chatbot (no backend involved).
// Place at: resources/js/Components/SapaChatbot.tsx
// Mascot image expected at: public/images/maskot-sapa.png

const MASCOT_SRC = '/images/maskot-sapa.png';

type Sender = 'bot' | 'user';
interface Message {
    id: number;
    from: Sender;
    text: string;
}

interface SharedProps {
    auth?: { user: { id: number; name: string } | null };
    [key: string]: unknown;
}

function getGreeting(date: Date = new Date()): string {
    const h = date.getHours();
    if (h >= 4 && h < 11) return 'Selamat pagi';
    if (h >= 11 && h < 15) return 'Selamat siang';
    if (h >= 15 && h < 18) return 'Selamat sore';
    return 'Selamat malam';
}

function MascotAvatar({ className = '' }: { className?: string }) {
    return (
        <div className={`shrink-0 overflow-hidden rounded-full bg-[var(--color-emerald-50)] ring-1 ring-black/5 ${className}`}>
            <img
                src={MASCOT_SRC}
                alt=""
                className="h-full w-full origin-top scale-[1.35] object-cover object-top"
            />
        </div>
    );
}

export default function SapaChatbot() {
    const { auth } = usePage<SharedProps>().props;
    const isLoggedIn = Boolean(auth?.user);

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showOptions, setShowOptions] = useState(true);
    const [typing, setTyping] = useState(false);

    const nextId = useRef(1);
    const timers = useRef<number[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const push = (from: Sender, text: string) =>
        setMessages((prev) => [...prev, { id: nextId.current++, from, text }]);

    const later = (fn: () => void, ms: number) => {
        timers.current.push(window.setTimeout(fn, ms));
    };

    // Greeting is built the first time the panel opens, so it uses the
    // visitor's real local time.
    const toggle = () => {
        setOpen((wasOpen) => {
            if (!wasOpen && messages.length === 0) {
                push('bot', `${getGreeting()}! Saya SAPA PBJ. Apa yang Anda butuhkan?`);
            }
            return !wasOpen;
        });
    };

    // Keep the newest message in view.
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing, showOptions, open]);

    // Close with Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    // Clear pending timers on unmount.
    useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

    const choose = (label: string, reply: string, url: string) => {
        setShowOptions(false);
        push('user', label);
        setTyping(true);
        later(() => {
            setTyping(false);
            push('bot', reply);
        }, 600);
        later(() => router.visit(url), 1700);
    };

    const chooseAdmin = () =>
        isLoggedIn
            ? choose(
                  'Tanya Admin',
                  'Baik! Silakan pilih admin yang sesuai dengan kebutuhan Anda…',
                  route('admins.index'),
              )
            : choose(
                  'Tanya Admin',
                  'Untuk berkonsultasi dengan admin, Anda perlu masuk terlebih dahulu. Saya arahkan ke halaman login ya…',
                  route('login'),
              );

    const chooseRegulations = () =>
        choose(
            'Cek Peraturan',
            'Baik! Saya arahkan Anda ke daftar peraturan pengadaan…',
            route('regulations.index'),
        );

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {open && (
                <div
                    role="dialog"
                    aria-label="Chat SAPA PBJ"
                    className="flex h-[min(28rem,70vh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
                >
                    <header className="flex items-center gap-3 bg-[var(--color-green-700)] px-4 py-3 text-white">
                        <MascotAvatar className="h-10 w-10 bg-white" />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight">SAPA PBJ</p>
                            <p className="text-xs text-white/80">Asisten Pengadaan Barang/Jasa</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Tutup chat"
                            className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
                        {messages.map((m) =>
                            m.from === 'bot' ? (
                                <div key={m.id} className="flex items-end gap-2">
                                    <MascotAvatar className="h-7 w-7" />
                                    <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm ring-1 ring-black/5">
                                        {m.text}
                                    </p>
                                </div>
                            ) : (
                                <div key={m.id} className="flex justify-end">
                                    <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--color-green-700)] px-3 py-2 text-sm text-white">
                                        {m.text}
                                    </p>
                                </div>
                            ),
                        )}

                        {typing && (
                            <div className="flex items-end gap-2">
                                <MascotAvatar className="h-7 w-7" />
                                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-3 py-3 shadow-sm ring-1 ring-black/5" aria-label="SAPA PBJ sedang mengetik">
                                    {[0, 150, 300].map((d) => (
                                        <span
                                            key={d}
                                            className="h-1.5 w-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce"
                                            style={{ animationDelay: `${d}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {showOptions && messages.length > 0 && (
                            <div className="flex flex-col gap-2 pl-9">
                                <button
                                    type="button"
                                    onClick={chooseAdmin}
                                    className="rounded-full border border-[var(--color-green-700)] bg-white px-4 py-2 text-left text-sm font-medium text-[var(--color-green-700)] transition hover:bg-[var(--color-green-700)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-green-700)]"
                                >
                                    Tanya Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={chooseRegulations}
                                    className="rounded-full border border-[var(--color-green-700)] bg-white px-4 py-2 text-left text-sm font-medium text-[var(--color-green-700)] transition hover:bg-[var(--color-green-700)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-green-700)]"
                                >
                                    Cek Peraturan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label={open ? 'Tutup chat SAPA PBJ' : 'Buka chat SAPA PBJ'}
                className="group flex items-end gap-2 focus-visible:outline-none"
            >
                {!open && (
                    <span className="mb-6 hidden rounded-2xl rounded-br-sm bg-white px-3 py-2 text-sm font-medium text-[var(--color-green-700)] shadow-lg ring-1 ring-black/5 sm:block">
                        Ada yang bisa dibantu?
                    </span>
                )}
                <img
                    src={MASCOT_SRC}
                    alt="Maskot SAPA PBJ"
                    className="h-24 w-auto drop-shadow-xl transition motion-safe:group-hover:-translate-y-1 group-focus-visible:rounded-lg group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-green-700)] sm:h-28"
                />
            </button>
        </div>
    );
}
