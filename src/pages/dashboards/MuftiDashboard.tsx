import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Scale, FileText, MessageCircle } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/mufti', icon: LayoutDashboard },
  { label: 'Fatwas', href: '/dashboard/mufti/fatwas', icon: Scale },
  { label: 'Requests', href: '/dashboard/mufti/requests', icon: MessageCircle },
  { label: 'Publications', href: '/dashboard/mufti/publications', icon: FileText },
];

export default function MuftiDashboard() {
  return (
    <DashboardLayout title="Mufti Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Scale} title="Fatwa Requests" value="12" description="Pending review" />
        <DashboardStatsCard icon={FileText} title="Published Fatwas" value="156" />
        <DashboardStatsCard icon={MessageCircle} title="Consultations" value="8" description="This week" />
      </div>
    </DashboardLayout>
  );
}
