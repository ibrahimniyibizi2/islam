import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import DashboardStatsCard from '@/components/DashboardStatsCard';

export default function UserDonations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [mosques, setMosques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', donation_type: 'sadaqa', mosque_id: '', donor_name: '', is_anonymous: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [donRes, mosRes] = await Promise.all([
      supabase.from('donations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('mosques').select('id, name').eq('status', 'active').order('name'),
    ]);
    setDonations(donRes.data ?? []);
    setMosques(mosRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleFormChange = useCallback((field: string) => (value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const handleSubmit = async () => {
    if (!user || !form.amount) return;
    setSubmitting(true);
    const { error } = await supabase.from('donations').insert({
      user_id: user.id,
      amount: Number(form.amount),
      donation_type: form.donation_type,
      mosque_id: form.mosque_id || null,
      donor_name: form.is_anonymous ? null : (form.donor_name || user.email),
      is_anonymous: form.is_anonymous,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Donation recorded', description: 'JazakAllahu Khairan!' });
      setOpen(false);
      setForm({ amount: '', donation_type: 'sadaqa', mosque_id: '', donor_name: '', is_anonymous: false });
      fetchData();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Donations</h2>
          <p className="text-sm text-muted-foreground">Track your charitable giving</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> New Donation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record a Donation</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Amount (RWF)</Label><Input type="number" placeholder="5000" value={form.amount} onChange={e => handleFormChange('amount')(e.target.value)} /></div>
              <div><Label>Type</Label>
                <Select value={form.donation_type} onValueChange={handleFormChange('donation_type')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sadaqa">Sadaqa</SelectItem>
                    <SelectItem value="zakat">Zakat</SelectItem>
                    <SelectItem value="fitrana">Fitrana</SelectItem>
                    <SelectItem value="waqf">Waqf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Masjid (Optional)</Label>
                <Select value={form.mosque_id} onValueChange={handleFormChange('mosque_id')}>
                  <SelectTrigger><SelectValue placeholder="Select masjid" /></SelectTrigger>
                  <SelectContent>
                    {mosques.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon" checked={form.is_anonymous} onChange={e => handleFormChange('is_anonymous')(e.target.checked)} className="rounded border-border" />
                <Label htmlFor="anon">Donate anonymously</Label>
              </div>
              <Button onClick={handleSubmit} disabled={submitting || !form.amount} className="w-full">{submitting ? 'Saving...' : 'Record Donation'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatsCard icon={Heart} title="Total Donated" value={`${totalDonated.toLocaleString()} RWF`} description={`${donations.length} donations`} />
        <DashboardStatsCard icon={TrendingUp} title="This Month" value={`${donations.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).reduce((s, d) => s + Number(d.amount), 0).toLocaleString()} RWF`} description="Current month" />
        <DashboardStatsCard icon={Heart} title="Zakat Given" value={`${donations.filter(d => d.donation_type === 'zakat').reduce((s, d) => s + Number(d.amount), 0).toLocaleString()} RWF`} description="Total zakat" />
      </div>

      {donations.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12"><Heart className="mb-3 h-12 w-12 text-muted-foreground/50" /><p className="text-lg font-medium">No donations yet</p><p className="text-sm text-muted-foreground">Record your first donation above.</p></CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Donation History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {donations.map(d => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{Number(d.amount).toLocaleString()} RWF</p>
                    <p className="text-xs text-muted-foreground capitalize">{d.donation_type} • {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  {d.is_anonymous && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Anonymous</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
