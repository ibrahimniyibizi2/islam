import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Phone, Mail, Clock, Search } from 'lucide-react';

export default function UserFindMasjids() {
  const [mosques, setMosques] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('mosques')
      .select('id, name, address, district, province, phone, email, fajr_time, dhuhr_time, asr_time, maghrib_time, isha_time, status, image_url')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => {
        setMosques(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = mosques.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.district?.toLowerCase().includes(search.toLowerCase()) ||
    m.province?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Find Masjids</h2>
        <p className="text-sm text-muted-foreground">Browse registered mosques across Rwanda</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, district or province..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12"><Building2 className="mb-3 h-12 w-12 text-muted-foreground/50" /><p className="text-lg font-medium">No masjids found</p><p className="text-sm text-muted-foreground">{search ? 'Try a different search term.' : 'No active mosques registered yet.'}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <Card key={m.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{m.name}</h3>
                    {m.district && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {m.district}{m.province ? `, ${m.province}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {m.address && <p className="mb-2 text-xs text-muted-foreground">{m.address}</p>}

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {m.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{m.phone}</p>}
                  {m.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{m.email}</p>}
                </div>

                {(m.fajr_time || m.dhuhr_time || m.asr_time || m.maghrib_time || m.isha_time) && (
                  <div className="mt-3 rounded-md bg-accent/50 p-2.5">
                    <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground"><Clock className="h-3 w-3" /> Prayer Times</p>
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      {[
                        { label: 'Fajr', time: m.fajr_time },
                        { label: 'Dhuhr', time: m.dhuhr_time },
                        { label: 'Asr', time: m.asr_time },
                        { label: 'Maghrib', time: m.maghrib_time },
                        { label: 'Isha', time: m.isha_time },
                      ].map(p => (
                        <div key={p.label}>
                          <p className="text-muted-foreground">{p.label}</p>
                          <p className="font-medium text-foreground">{p.time?.slice(0, 5) || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
