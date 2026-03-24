import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { FileText, Heart, Bell, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function UserOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ requests: 0, pendingRequests: 0, donations: 0, notifications: 0 });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [appsRes, donationsRes, notifRes] = await Promise.all([
        supabase.from('nikah_applications').select('id, status, bride_name, created_at, reference_number').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('donations').select('id').eq('user_id', user.id),
        supabase.from('nikah_notifications').select('id').eq('recipient_id', user.id).eq('is_read', false),
      ]);

      const apps = appsRes.data ?? [];
      const pendingCount = apps.filter(a => a.status === 'pending').length;

      setStats({
        requests: apps.length,
        pendingRequests: pendingCount,
        donations: donationsRes.data?.length ?? 0,
        notifications: notifRes.data?.length ?? 0,
      });
      setRecentApplications(apps.slice(0, 3));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard icon={FileText} title="Nikah Requests" value={String(stats.requests)} description={`${stats.pendingRequests} pending`} />
        <DashboardStatsCard icon={Heart} title="Donations" value={String(stats.donations)} description="Total given" />
        <DashboardStatsCard icon={Bell} title="Notifications" value={String(stats.notifications)} description="Unread" />
        <DashboardStatsCard icon={Building2} title="Services" value="4" description="Available" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Nikah Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet. Start by submitting a nikah request.</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.reference_number || 'Pending Ref'}</p>
                      <p className="text-xs text-muted-foreground">{app.bride_name}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      app.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-muted text-muted-foreground'
                    }`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: FileText, label: 'New Nikah Request', desc: 'Apply for nikah ceremony', path: '/dashboard/user/requests' },
                { icon: Heart, label: 'Make Donation', desc: 'Donate to a masjid', path: '/dashboard/user/donations' },
                { icon: Building2, label: 'Find Masjids', desc: 'Browse nearby mosques', path: '/dashboard/user/masjids' },
                { icon: Calendar, label: 'View Events', desc: 'Upcoming community events', path: '/dashboard/user/masjids' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                >
                  <action.icon className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
