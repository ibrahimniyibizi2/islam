import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Heart, BookOpen, Calendar, FileText } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/imam', icon: LayoutDashboard },
  { label: 'Nikah Requests', href: '/dashboard/imam/nikah', icon: Heart },
  { label: 'Sermons', href: '/dashboard/imam/sermons', icon: BookOpen },
  { label: 'Schedule', href: '/dashboard/imam/schedule', icon: Calendar },
  { label: 'Certificates', href: '/dashboard/imam/certificates', icon: FileText },
];

export default function ImamDashboard() {
  return (
    <DashboardLayout title="Imam Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Heart} title="Nikah Pending" value="3" description="This week" />
        <DashboardStatsCard icon={BookOpen} title="Sermons Given" value="28" description="This month" />
        <DashboardStatsCard icon={Calendar} title="Upcoming" value="5" description="Events" />
      </div>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Imam Services</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage nikah ceremonies, sermons, and schedules.</p>
      </div>
    </DashboardLayout>
  );
}
