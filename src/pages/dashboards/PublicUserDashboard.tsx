import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import { LayoutDashboard, Heart, FileText, Building2, Bell, ClipboardList } from 'lucide-react';
import UserOverview from './user/UserOverview';
import UserRequests from './user/UserRequests';
import TrackApplications from './user/TrackApplications';
import UserDonations from './user/UserDonations';
import UserFindMasjids from './user/UserFindMasjids';
import UserNotifications from './user/UserNotifications';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/user', icon: LayoutDashboard },
  { label: 'Track Applications', href: '/dashboard/user/track', icon: ClipboardList },
  { label: 'My Requests', href: '/dashboard/user/requests', icon: FileText },
  { label: 'Donations', href: '/dashboard/user/donations', icon: Heart },
  { label: 'Find Masjids', href: '/dashboard/user/masjids', icon: Building2 },
  { label: 'Notifications', href: '/dashboard/user/notifications', icon: Bell },
];

export default function PublicUserDashboard() {
  return (
    <DashboardLayout title="My Dashboard" navItems={navItems}>
      <Routes>
        <Route index element={<UserOverview />} />
        <Route path="track" element={<TrackApplications />} />
        <Route path="requests" element={<UserRequests />} />
        <Route path="donations" element={<UserDonations />} />
        <Route path="masjids" element={<UserFindMasjids />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="*" element={<Navigate to="/dashboard/user" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
