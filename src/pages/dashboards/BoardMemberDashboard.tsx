import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { LayoutDashboard, Vote, FileText, BarChart3, Users } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/board-member', icon: LayoutDashboard },
  { label: 'Resolutions', href: '/dashboard/board-member/resolutions', icon: Vote },
  { label: 'Minutes', href: '/dashboard/board-member/minutes', icon: FileText },
  { label: 'Reports', href: '/dashboard/board-member/reports', icon: BarChart3 },
  { label: 'Members', href: '/dashboard/board-member/members', icon: Users },
];

export default function BoardMemberDashboard() {
  return (
    <DashboardLayout title="Board Member Dashboard" navItems={navItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardStatsCard icon={Vote} title="Pending Votes" value="3" />
        <DashboardStatsCard icon={FileText} title="Meeting Minutes" value="24" />
        <DashboardStatsCard icon={Users} title="Board Members" value="9" />
      </div>
    </DashboardLayout>
  );
}
