import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/DashboardLayout';
import { LayoutDashboard, Heart, BookOpen, Calendar, FileText, Video } from 'lucide-react';
import ImamOverview from './imam/ImamOverview';
import ImamNikah from './imam/ImamNikah';
import VideoNikahManagement from './imam/VideoNikahManagement';
import ImamSermons from './imam/ImamSermons';
import ImamSchedule from './imam/ImamSchedule';
import ImamCertificates from './imam/ImamCertificates';
import MeetingLobby from '@/pages/meetings/MeetingLobby';
import MeetingRoom from '@/pages/meetings/MeetingRoom';

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/imam', icon: LayoutDashboard },
  { label: 'Nikah Requests', href: '/dashboard/imam/nikah', icon: Heart },
  { label: 'Video Nikah', href: '/dashboard/imam/video-nikah', icon: Video },
  { label: 'Meetings', href: '/dashboard/imam/meeting', icon: Video },
  { label: 'Sermons', href: '/dashboard/imam/sermons', icon: BookOpen },
  { label: 'Schedule', href: '/dashboard/imam/schedule', icon: Calendar },
  { label: 'Certificates', href: '/dashboard/imam/certificates', icon: FileText },
];

export default function ImamDashboard() {
  return (
    <DashboardLayout title="Imam Dashboard" navItems={navItems}>
      <Routes>
        <Route index element={<ImamOverview />} />
        <Route path="nikah" element={<ImamNikah />} />
        <Route path="video-nikah" element={<VideoNikahManagement />} />
        <Route path="meeting" element={<MeetingLobby />} />
        <Route path="meeting/:roomId" element={<MeetingRoom />} />
        <Route path="sermons" element={<ImamSermons />} />
        <Route path="schedule" element={<ImamSchedule />} />
        <Route path="certificates" element={<ImamCertificates />} />
        <Route path="*" element={<Navigate to="/dashboard/imam" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
