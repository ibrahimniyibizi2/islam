import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Flower2, Truck, Calendar, FileText } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/funeral-service', icon: LayoutDashboard },
  { label: 'Active Requests', href: '/dashboard/funeral-service/requests', icon: Flower2 },
  { label: 'Transport', href: '/dashboard/funeral-service/transport', icon: Truck },
  { label: 'Schedule', href: '/dashboard/funeral-service/schedule', icon: Calendar },
  { label: 'Records', href: '/dashboard/funeral-service/records', icon: FileText },
];

export default function FuneralServiceDashboard() {
  return (
    <DashboardLayout title="Funeral Service Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Flower2} title="Active Requests" value="4" description="In progress" />
        <DashboardStatsCard icon={Truck} title="Transports Today" value="2" />
        <DashboardStatsCard icon={Calendar} title="Scheduled" value="6" description="This week" />
      </div>
    </DashboardLayout>
  );
}
