import { PropsWithChildren } from 'react';
import DashboardShell, { NavItem } from '@/Components/Nav/DashboardShell';
import { LayoutDashboard, Users, UserCog, ScrollText, FolderTree, ShieldAlert, ChartBar, Settings, UserCircle } from 'lucide-react';

const navItems: NavItem[] = [
    { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
    { label: 'Manajemen Pengguna', href: route('admin.users.index'), icon: Users },
    { label: 'Manajemen Admin', href: route('admin.admins.index'), icon: UserCog },
    { label: 'Manajemen Peraturan', href: route('admin.regulations.index'), icon: ScrollText },
    { label: 'Kategori Peraturan', href: route('admin.categories.index'), icon: FolderTree },
    { label: 'Statistik', href: route('admin.statistics.index'), icon: ChartBar },
    { label: 'Audit Log', href: route('admin.audit-logs.index'), icon: ShieldAlert },
    { label: 'Pengaturan', href: route('admin.settings.edit'), icon: Settings },
    { label: 'Profil Saya', href: route('profile.edit'), icon: UserCircle },
];

export default function SuperAdminLayout({ children }: PropsWithChildren) {
    return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
