import { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NotificationBell from '@/Components/NotificationBell';
import { Menu, X, LogOut, LucideIcon } from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface DashboardShellProps {
    navItems: NavItem[];
}

// Shared sidebar/header/mobile-nav chrome so UserLayout, AdminLayout, and
// SuperAdminLayout (spec Part 42) don't each reimplement the same
// navigation shell — only their nav item lists differ.
export default function DashboardShell({ navItems, children }: PropsWithChildren<DashboardShellProps>) {
    const { auth } = usePage<PageProps>().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-white lg:flex">
                <div className="flex h-16 items-center px-6">
                    <ApplicationLogo />
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-[var(--color-border)] p-3">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Link>
                </div>
            </aside>

            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-4 lg:px-8">
                    <button
                        className="text-[var(--color-foreground)] lg:hidden"
                        onClick={() => setMobileNavOpen((v) => !v)}
                        aria-label="Buka menu navigasi"
                    >
                        {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <span className="text-sm font-medium">{auth.user?.name}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-navy-100)] text-sm font-semibold text-[var(--color-navy-600)]">
                            {auth.user?.name?.charAt(0)}
                        </span>
                    </div>
                </header>

                {mobileNavOpen && (
                    <nav className="space-y-1 border-b border-[var(--color-border)] bg-white p-3 lg:hidden">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--color-muted)]">
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </Link>
                    </nav>
                )}

                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
