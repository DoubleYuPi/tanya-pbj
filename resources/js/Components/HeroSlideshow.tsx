import { ReactNode, TouchEvent, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
    id: number;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    link_url: string | null;
}

const INTERVAL_MS = 6000;

export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
    const count = slides.length;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchX = useRef<number | null>(null);

    const active = index >= count ? 0 : index;
    const go = (n: number) => setIndex(((n % count) + count) % count);

    // Auto-advance. Re-arms after every change, so manual navigation resets the timer.
    useEffect(() => {
        if (count < 2 || paused) return;
        const t = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
        return () => clearTimeout(t);
    }, [active, paused, count]);

    const onTouchStart = (e: TouchEvent) => {
        touchX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        touchX.current = null;
    };

    return (
        <section
            className="relative w-full overflow-hidden bg-[var(--color-green-700)]"
            aria-roledescription="carousel"
            aria-label="Slide informasi"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div className="relative aspect-[16/9] sm:aspect-[8/3]">
                {slides.map((s, i) => (
                    <div
                        key={s.id}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${i + 1} dari ${count}`}
                        aria-hidden={i !== active}
                        className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    >
                        <SlideLink href={s.link_url} focusable={i === active}>
                            <img
                                src={s.image_url}
                                alt={s.title ?? `Slide ${i + 1}`}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                className="h-full w-full object-cover"
                            />
                            {(s.title || s.subtitle) && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-10 pt-16 text-white sm:px-12">
                                    {s.title && <h2 className="text-xl font-extrabold sm:text-4xl">{s.title}</h2>}
                                    {s.subtitle && <p className="mt-1 max-w-2xl text-sm text-white/90 sm:text-lg">{s.subtitle}</p>}
                                </div>
                            )}
                        </SlideLink>
                    </div>
                ))}
            </div>

            {count > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Slide sebelumnya"
                        onClick={() => go(active - 1)}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Slide berikutnya"
                        onClick={() => go(active + 1)}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                aria-label={`Ke slide ${i + 1}`}
                                aria-current={i === active}
                                onClick={() => go(i)}
                                className={`h-2.5 w-2.5 rounded-full transition ${i === active ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

// Whole slide is clickable when a link is set. "/..." = internal (Inertia), otherwise opens in a new tab.
function SlideLink({ href, focusable, children }: { href: string | null; focusable: boolean; children: ReactNode }) {
    const cls = 'absolute inset-0 block';
    if (!href) return <div className={cls}>{children}</div>;
    if (href.startsWith('/')) {
        return (
            <Link href={href} className={cls} tabIndex={focusable ? 0 : -1}>
                {children}
            </Link>
        );
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} tabIndex={focusable ? 0 : -1}>
            {children}
        </a>
    );
}
