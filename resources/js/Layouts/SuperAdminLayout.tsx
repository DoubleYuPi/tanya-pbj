import { PropsWithChildren } from 'react';
import DashboardShell, { NavItem } from '@/Components/Nav/DashboardShell';
import { LayoutDashboard, Users, ScrollText, ShieldAlert, Settings, UserCircle } from 'lucide-react';

const navItems: NavItem[] = [
    { label: 'Dashboard', href: route('super-admin.dashboard'), icon: LayoutDashboard },
    { label: 'Manajemen Pengguna', href: route('super-admin.dashboard'), icon: Users },
    { label: 'Manajemen Peraturan', href: route('super-admin.dashboard'), icon: ScrollText },
    { label: 'Audit Log', href: route('super-admin.dashboard'), icon: ShieldAlert },
    { label: 'Pengaturan', href: route('super-admin.dashboard'), icon: Settings },
    { label: 'Profil Saya', href: route('profile.edit'), icon: UserCircle },
];

export default function SuperAdminLayout({ children }: PropsWithChildren) {
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
