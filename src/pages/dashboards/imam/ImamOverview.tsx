import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardStatsCard from '@/components/DashboardStatsCard';
import { Heart, BookOpen, Calendar, FileText, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function ImamOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingNikah: 0,
    sermonsThisMonth: 0,
    upcomingEvents: 0,
    certificatesIssued: 0,
  });
  const [recentNikahRequests, setRecentNikahRequests] = useState<any[]>([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Fetch pending nikah requests
        const { count: pendingNikahCount, error: nikahError } = await supabase
          .from('nikah_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (nikahError) throw nikahError;

        // Fetch recent nikah requests
        const { data: recentNikah, error: recentNikahError } = await supabase
          .from('nikah_applications')
          .select('id, status, bride_name, groom_name, preferred_date, created_at, notes')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentNikahError) throw recentNikahError;

        // Fetch sermons count for this month (skip if table doesn't exist)
        let sermonsCount = 0;
        try {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { count } = await supabase
            .from('sermons')
            .select('*', { count: 'exact', head: true })
            .gte('date', startOfMonth.toISOString())
            .eq('imam_id', user.id);
          sermonsCount = count || 0;
        } catch {
          sermonsCount = 0;
        }

        // Fetch upcoming events (skip if table doesn't exist)
        let eventsCount = 0;
        let scheduleItems: any[] = [];
        try {
          const today = new Date().toISOString();
          const { count } = await supabase
            .from('imam_schedule')
            .select('*', { count: 'exact', head: true })
            .gte('event_date', today)
            .eq('imam_id', user.id);
          eventsCount = count || 0;

          // Fetch upcoming schedule items
          const { data: items } = await supabase
            .from('imam_schedule')
            .select('*')
            .gte('event_date', today)
            .eq('imam_id', user.id)
            .order('event_date', { ascending: true })
            .limit(3);
          scheduleItems = items || [];
        } catch {
          eventsCount = 0;
          scheduleItems = [];
        }

        // Fetch certificates issued count (skip if table doesn't exist)
        let certificatesCount = 0;
        try {
          const { count } = await supabase
            .from('certificates')
            .select('*', { count: 'exact', head: true })
            .eq('issued_by', user.id);
          certificatesCount = count || 0;
        } catch {
          certificatesCount = 0;
        }

        setStats({
          pendingNikah: pendingNikahCount || 0,
          sermonsThisMonth: sermonsCount || 0,
          upcomingEvents: eventsCount || 0,
          certificatesIssued: certificatesCount || 0,
        });

        setRecentNikahRequests(recentNikah || []);
        setUpcomingSchedule(scheduleItems || []);
      } catch (error) {
        console.error('Error fetching imam dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard
          icon={Heart}
          title="Pending Nikah"
          value={String(stats.pendingNikah)}
          description="Awaiting approval"
        />
        <DashboardStatsCard
          icon={BookOpen}
          title="Sermons This Month"
          value={String(stats.sermonsThisMonth)}
          description="Delivered"
        />
        <DashboardStatsCard
          icon={Calendar}
          title="Upcoming Events"
          value={String(stats.upcomingEvents)}
          description="Scheduled"
        />
        <DashboardStatsCard
          icon={FileText}
          title="Certificates Issued"
          value={String(stats.certificatesIssued)}
          description="Total"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Nikah Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNikahRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending nikah requests. Check the Nikah section for all requests.
              </p>
            ) : (
              <div className="space-y-3">
                {recentNikahRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {request.bride_name} & {request.groom_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Preferred: {new Date(request.preferred_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/dashboard/imam/nikah')}
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              View All Nikah Requests
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events scheduled. Manage your schedule in the Schedule section.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.event_date).toLocaleDateString()} at {item.event_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/dashboard/imam/schedule')}
              className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              Manage Schedule
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                label: 'Review Nikah Requests',
                desc: 'Approve or decline applications',
                path: '/dashboard/imam/nikah',
              },
              {
                icon: BookOpen,
                label: 'Manage Sermons',
                desc: 'View and schedule sermons',
                path: '/dashboard/imam/sermons',
              },
              {
                icon: Calendar,
                label: 'Update Schedule',
                desc: 'Manage your calendar',
                path: '/dashboard/imam/schedule',
              },
              {
                icon: FileText,
                label: 'Issue Certificates',
                desc: 'Generate and manage certificates',
                path: '/dashboard/imam/certificates',
              },
            ].map((action) => (
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
  );
}
