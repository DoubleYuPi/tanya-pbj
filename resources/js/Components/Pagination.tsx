import { Link } from '@inertiajs/react';
import { PaginationLink } from '@/types/pagination';
import { cn } from '@/lib/utils';

// Renders Laravel's paginator `links` array directly — works for any
// paginated Inertia response without needing separate page-number math.
export default function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) return null; // only prev/current/next → nothing to page through

    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url ?? '#'}
                    preserveScroll
                    className={cn(
                        'flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium',
                        link.active
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]',
                        !link.url && 'pointer-events-none opacity-40'
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </nav>
    );
}
