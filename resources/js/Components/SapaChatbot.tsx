import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';

// SAPA PBJ — rule-based landing page chatbot (no backend involved).
// Place at: resources/js/Components/SapaChatbot.tsx
// Mascot image expected at: public/images/maskot-sapa.png

const MASCOT_SRC = '/images/maskot-sapa.png';

// ---- Jam layanan admin (edit di sini) --------------------------------------
const TIME_ZONE = 'Asia/Pontianak'; // WIB
const OFFICE = {
    open: 7 * 60 + 15, // 07.15
    lunchStart: 11 * 60 + 30, // 11.30
    lunchEnd: 13 * 60 + 30, // 13.30
    close: 15 * 60 + 45, // 15.45
    closedOnWeekend: true, // set false jika admin juga melayani Sabtu/Minggu
};

type Sender = 'bot' | 'user';
interface Message {
    id: number;
    from: Sender;
    text: string;
}
interface BotAction {
    label: string;
    href: string;
}

type ClosedReason = 'weekend' | 'before' | 'lunch' | 'after';

interface SharedProps {
    auth?: { user: { id: number; name: string } | null };
    [key: string]: unknown;
}

function getZonedTime(date: Date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const hour = parseInt(get('hour'), 10);
    const minute = parseInt(get('minute'), 10);
    const weekday = get('weekday'); // Mon, Tue, ...
    return { minutes: hour * 60 + minute, hour, weekday };
}

function getGreeting(date: Date = new Date()): string {
    const { hour } = getZonedTime(date);
    if (hour >= 4 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
}

function getClosedReason(date: Date = new Date()): ClosedReason | null {
    const { minutes, weekday } = getZonedTime(date);
    if (OFFICE.closedOnWeekend && (weekday === 'Sat' || weekday === 'Sun')) return 'weekend';
    if (minutes < OFFICE.open) return 'before';
    if (minutes >= OFFICE.lunchStart && minutes < OFFICE.lunchEnd) return 'lunch';
    if (minutes >= OFFICE.close) return 'after';
    return null; // dalam jam layanan
}

const CLOSED_MESSAGES: Record<ClosedReason, string> = {
    before: 'Info: layanan baru dibuka pukul 07.15 WIB, pertanyaan Anda mungkin akan dibalas setelah itu.',
    lunch: 'Info: saat ini jam istirahat (11.30–13.30 WIB). Layanan akan aktif kembali setelah pukul 13.30, balasan Anda mungkin akan tertunda.',
    after: 'Info: layanan hari ini sudah berakhir (pukul 15.45 WIB). Pertanyaan Anda mungkin baru dibalas pada hari kerja berikutnya, mulai pukul 07.15.',
    weekend: 'Info: hari ini akhir pekan. Layanan tersedia pada hari kerja, pukul 07.15–15.45 WIB (istirahat 11.30–13.30), jadi balasan Anda mungkin tertunda.',
};

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

const optionClass =
    'rounded-full border border-[var(--color-green-700)] bg-white px-4 py-2 text-left text-sm font-medium text-[var(--color-green-700)] transition hover:bg-[var(--color-green-700)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-green-700)]';
const primaryClass =
    'rounded-full bg-[var(--color-green-700)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-green-700)]';

export default function SapaChatbot() {
    const { auth } = usePage<SharedProps>().props;
    const isLoggedIn = Boolean(auth?.user);

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showOptions, setShowOptions] = useState(true);
    const [action, setAction] = useState<BotAction | null>(null);
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
                push('bot', `${getGreeting()}! Saya SAPA PBJ.\nApa yang Anda butuhkan?`);
            }
            return !wasOpen;
        });
    };

    // Keep the newest message in view.
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing, showOptions, action, open]);

    // Close with Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    // Clear pending timers on unmount.
    useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

        // Shared "user picked something" start: hide options, echo choice, show typing.
    const begin = (label: string) => {
        setShowOptions(false);
        setAction(null);
        push('user', label);
        setTyping(true);
    };

    const chooseAdmin = () => {
        const closed = getClosedReason();
        const adminsUrl = route('admins.index');
        begin('Tanya Admin');

        later(() => {
            setTyping(false);

            if (!isLoggedIn) {
                push('bot', 'Untuk berkonsultasi dengan admin, Anda perlu masuk terlebih dahulu.');
                if (closed) push('bot', CLOSED_MESSAGES[closed]);
                setAction({ label: 'Login', href: route('login') });
                return;
            }

            if (closed) {
                // Di luar jam layanan: tampilkan info dan biarkan pengguna memutuskan.
                push('bot', 'Anda bisa memilih admin yang sesuai kebutuhan.');
                push('bot', CLOSED_MESSAGES[closed]);
                setAction({ label: 'Lihat Daftar Admin', href: adminsUrl });
                return;
            }

            push('bot', 'Baik! Silakan pilih admin yang sesuai dengan kebutuhan Anda…');
            later(() => router.visit(adminsUrl), 1100);
        }, 600);
    };

    const chooseRegulations = () => {
        begin('Cek Peraturan');
        later(() => {
            setTyping(false);
            push('bot', 'Baik! Saya arahkan Anda ke daftar peraturan pengadaan…');
        }, 600);
        later(() => router.visit(route('regulations.index')), 1700);
    };

    const backToMenu = () => {
        setAction(null);
        push('user', 'Kembali ke menu');
        setTyping(true);
        later(() => {
            setTyping(false);
            push('bot', 'Silakan pilih salah satu:');
            setShowOptions(true);
        }, 400);
    };


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
                            <p className="text-xs text-white/80">UKPBJ KOTA PONTIANAK</p>
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
                                    <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm ring-1 ring-black/5">
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

                        {action && (
                            <div className="flex flex-col gap-2 pl-9">
                                <Link href={action.href} className={primaryClass}>
                                    {action.label}
                                </Link>
                                <button type="button" onClick={backToMenu} className={optionClass}>
                                    Kembali ke menu
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
                        Hai Sobat PBJ!
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
