import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, ClipboardList, MessageCircle, Settings } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/general-staff', icon: LayoutDashboard },
  { label: 'Tasks', href: '/dashboard/general-staff/tasks', icon: ClipboardList },
  { label: 'Messages', href: '/dashboard/general-staff/messages', icon: MessageCircle },
  { label: 'Settings', href: '/dashboard/general-staff/settings', icon: Settings },
];

export default function GeneralStaffDashboard() {
  return (
    <DashboardLayout title="Staff Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={ClipboardList} title="Assigned Tasks" value="8" description="3 urgent" />
        <DashboardStatsCard icon={MessageCircle} title="Messages" value="5" description="Unread" />
      </div>
    </DashboardLayout>
  );
}
