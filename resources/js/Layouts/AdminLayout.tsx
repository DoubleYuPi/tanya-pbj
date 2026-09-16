import { PropsWithChildren } from 'react';
import DashboardShell, { NavItem } from '@/Components/Nav/DashboardShell';
import { LayoutDashboard, MessageCircleQuestion, ScrollText, UserCircle } from 'lucide-react';

const navItems: NavItem[] = [
    { label: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard },
    { label: 'Percakapan', href: route('admin.dashboard'), icon: MessageCircleQuestion },
    { label: 'Peraturan', href: route('regulations.index'), icon: ScrollText },
    { label: 'Profil Saya', href: route('admin.profile.edit'), icon: UserCircle },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
