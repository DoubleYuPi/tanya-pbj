import { PropsWithChildren } from 'react';
import DashboardShell, { NavItem } from '@/Components/Nav/DashboardShell';
import { LayoutDashboard, Users, ScrollText, ShieldAlert, Settings, UserCircle } from 'lucide-react';

const navItems: NavItem[] = [
    { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
    { label: 'Manajemen Pengguna', href: route('dashboard'), icon: Users },
    { label: 'Manajemen Peraturan', href: route('dashboard'), icon: ScrollText },
    { label: 'Audit Log', href: route('dashboard'), icon: ShieldAlert },
    { label: 'Pengaturan', href: route('dashboard'), icon: Settings },
    { label: 'Profil Saya', href: route('profile.edit'), icon: UserCircle },
];

export default function SuperAdminLayout({ children }: PropsWithChildren) {
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
