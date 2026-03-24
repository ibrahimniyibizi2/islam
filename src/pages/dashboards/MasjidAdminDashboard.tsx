import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Users, Calendar, FileText, Settings, Building2 } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/masjid-admin', icon: LayoutDashboard },
  { label: 'Imams', href: '/dashboard/masjid-admin/imams', icon: Users },
  { label: 'Events', href: '/dashboard/masjid-admin/events', icon: Calendar },
  { label: 'Documents', href: '/dashboard/masjid-admin/documents', icon: FileText },
  { label: 'Settings', href: '/dashboard/masjid-admin/settings', icon: Settings },
];

export default function MasjidAdminDashboard() {
  return (
    <DashboardLayout title="Masjid Admin Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Building2} title="My Masjid" value="Active" description="Registered" />
        <DashboardStatsCard icon={Users} title="Imams" value="4" description="2 active" />
        <DashboardStatsCard icon={Calendar} title="Upcoming Events" value="7" />
      </div>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Masjid Management</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage your masjid's imams, events, and operations.</p>
      </div>
    </DashboardLayout>
  );
}
