import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Heart, BarChart3, Users, FileText } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/ngo-manager', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/dashboard/ngo-manager/campaigns', icon: Heart },
  { label: 'Beneficiaries', href: '/dashboard/ngo-manager/beneficiaries', icon: Users },
  { label: 'Reports', href: '/dashboard/ngo-manager/reports', icon: BarChart3 },
  { label: 'Documents', href: '/dashboard/ngo-manager/documents', icon: FileText },
];

export default function NgoManagerDashboard() {
  return (
    <DashboardLayout title="NGO Manager Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Heart} title="Active Campaigns" value="8" />
        <DashboardStatsCard icon={Users} title="Beneficiaries" value="342" />
        <DashboardStatsCard icon={BarChart3} title="Funds Raised (RWF)" value="1.2M" description="This quarter" />
      </div>
    </DashboardLayout>
  );
}
