import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';

// Navbar + footer, per spec Part 42. Used by the landing page and later by
// the public regulation-library and admin-directory pages (Phase 3/4),
// which stay browsable without logging in.
export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-[var(--color-border)] bg-white">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <Link href={route('landing')}>
                        <ApplicationLogo />
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-muted-foreground)] md:flex">
                        <Link href={route('landing')}>Beranda</Link>
                        <Link href={route('ukpbj.profile')}>Profil UKPBJ</Link>
                        <Link href={route('regulations.index')}>Regulasi</Link>
                        <Link href={route('faq.index')}>FAQ</Link>
                        <a href="#tentang">Kontak Kami</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild><Link href={route('login')}>Masuk</Link></Button>
                                <Button asChild><Link href={route('register')}>Daftar</Link></Button>
                            </>
                        )}
                    </div>
                </div>
                <nav
                    aria-label="Menu utama"
                    className="flex gap-5 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted-foreground)] md:hidden"
                >
                    <Link href={route('landing')}>Beranda</Link>
                    <Link href={route('ukpbj.profile')}>Profil UKPBJ</Link>
                    <Link href={route('regulations.index')}>Peraturan</Link>
                    <Link href={route('faq.index')}>FAQ</Link>
                    <a href="#tentang">Kontak Kami</a>
                </nav>
            </header>

            <main className="flex-1">{children}</main>

            <footer id="tentang" className="border-t border-[var(--color-border)] bg-white py-8">
                <div className="mx-auto max-w-6xl px-4 text-sm text-[var(--color-muted-foreground)]">
                    <p>&copy; {new Date().getFullYear()} SAPA PBJ — SENTRA AKSES PEMBINAAN & ADVOKASI PENGADAAN BARANG/JASA.</p>
                </div>
            </footer>
        </div>
    );
}
