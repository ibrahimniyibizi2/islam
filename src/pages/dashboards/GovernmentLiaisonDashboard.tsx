import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Landmark, FileText, BarChart3 } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/government-liaison', icon: LayoutDashboard },
  { label: 'Compliance', href: '/dashboard/government-liaison/compliance', icon: Landmark },
  { label: 'Reports', href: '/dashboard/government-liaison/reports', icon: BarChart3 },
  { label: 'Documents', href: '/dashboard/government-liaison/documents', icon: FileText },
];

export default function GovernmentLiaisonDashboard() {
  return (
    <DashboardLayout title="Government Liaison Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Landmark} title="Compliance Items" value="15" description="3 pending" />
        <DashboardStatsCard icon={FileText} title="Submitted Reports" value="42" />
        <DashboardStatsCard icon={BarChart3} title="This Quarter" value="On Track" />
      </div>
    </DashboardLayout>
  );
}
