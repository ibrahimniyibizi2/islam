import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react';

export default function UserNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('nikah_notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('nikah_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('nikah_notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BellOff className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card key={n.id} className={`transition-colors ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Bell className={`h-4 w-4 ${!n.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground capitalize">{n.notification_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="shrink-0">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
