import { PropsWithChildren } from 'react';
import DashboardShell, { NavItem } from '@/Components/Nav/DashboardShell';
import { LayoutDashboard, MessageCircleQuestion, ScrollText, UserCircle, Bookmark, History } from 'lucide-react';

const navItems: NavItem[] = [
    { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
    { label: 'Tanya Admin', href: route('admins.index'), icon: MessageCircleQuestion },
    { label: 'Riwayat Konsultasi', href: route('chat.index'), icon: History },
    { label: 'Peraturan', href: route('regulations.index'), icon: ScrollText },
    { label: 'Peraturan Tersimpan', href: route('regulations.bookmarks'), icon: Bookmark },
    { label: 'Profil Saya', href: route('profile.edit'), icon: UserCircle },
];

export default function UserLayout({ children }: PropsWithChildren) {
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
