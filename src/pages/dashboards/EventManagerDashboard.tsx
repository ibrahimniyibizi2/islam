import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Calendar, MapPin, Users, Settings } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/event-manager', icon: LayoutDashboard },
  { label: 'Events', href: '/dashboard/event-manager/events', icon: Calendar },
  { label: 'Venues', href: '/dashboard/event-manager/venues', icon: MapPin },
  { label: 'Attendees', href: '/dashboard/event-manager/attendees', icon: Users },
  { label: 'Settings', href: '/dashboard/event-manager/settings', icon: Settings },
];

export default function EventManagerDashboard() {
  return (
    <DashboardLayout title="Event Manager Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Calendar} title="Upcoming Events" value="12" />
        <DashboardStatsCard icon={MapPin} title="Active Venues" value="5" />
        <DashboardStatsCard icon={Users} title="RSVPs" value="450" description="This month" />
      </div>
    </DashboardLayout>
  );
}
