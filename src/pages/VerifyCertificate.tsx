import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type VerificationState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | {
      status: 'found';
      isValid: boolean;
      record: {
        id: string;
        certificate_number: string | null;
        certificate_issued_at: string | null;
        certificate_url: string | null;
        groom_name: string | null;
        bride_name: string | null;
        confirmed_date: string | null;
        confirmed_location: string | null;
        preferred_masjid: string | null;
      };
    };

export default function VerifyCertificate() {
  const { certificate_number } = useParams();
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('app');
  const certificateNumber = useMemo(() => (certificate_number || '').trim(), [certificate_number]);

  const [state, setState] = useState<VerificationState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!certificateNumber && !appId) {
        setState({ status: 'not_found' });
        return;
      }

      setState({ status: 'loading' });

      // If appId is provided, use it directly (most reliable)
      if (appId) {
        const { data, error } = await supabase
          .from('nikah_applications')
          .select(
            'id, certificate_number, certificate_issued_at, certificate_url, groom_name, bride_name, confirmed_date, confirmed_location, preferred_masjid'
          )
          .eq('id', appId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setState({ status: 'error', message: error.message });
          return;
        }

        if (data && data.certificate_number && data.certificate_issued_at) {
          setState({
            status: 'found',
            isValid: true,
            record: data,
          });
          return;
        }
      }

      // Fallback: try by certificate number
      if (certificateNumber) {
        const { data, error } = await supabase
          .from('nikah_applications')
          .select(
            'id, certificate_number, certificate_issued_at, certificate_url, groom_name, bride_name, confirmed_date, confirmed_location, preferred_masjid'
          )
          .eq('certificate_number', certificateNumber)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setState({ status: 'error', message: error.message });
          return;
        }

        if (data) {
          const isValid = Boolean(data.certificate_number) && Boolean(data.certificate_issued_at);
          setState({
            status: 'found',
            isValid,
            record: data,
          });
          return;
        }
      }

      // Nothing found
      setState({ status: 'not_found' });
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [certificateNumber, appId]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificate Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify a Nikah certificate by certificate number.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {state.status === 'found' && state.isValid && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {state.status === 'found' && !state.isValid && <XCircle className="h-5 w-5 text-destructive" />}
              {(state.status === 'not_found' || state.status === 'error') && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Certificate Number</p>
              <p className="font-mono text-sm text-foreground">{certificateNumber || '-'}</p>
            </div>

            {state.status === 'loading' && (
              <p className="text-sm text-muted-foreground">Checking certificate…</p>
            )}

            {state.status === 'not_found' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Invalid certificate</p>
                <p className="text-sm text-muted-foreground">
                  No certificate was found with this number.
                </p>
              </div>
            )}

            {state.status === 'error' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Could not verify</p>
                <p className="text-sm text-muted-foreground">{state.message}</p>
              </div>
            )}

            {state.status === 'found' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className={state.isValid ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-destructive'}>
                    {state.isValid ? 'Valid certificate' : 'Certificate found, but not issued/invalid'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Groom: <span className="font-medium text-foreground">{state.record.groom_name || '-'}</span>
                    <br />
                    Bride: <span className="font-medium text-foreground">{state.record.bride_name || '-'}</span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Issued At</p>
                    <p className="text-sm text-foreground">{state.record.certificate_issued_at || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Masjid</p>
                    <p className="text-sm text-foreground">{state.record.preferred_masjid || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Confirmed Date</p>
                    <p className="text-sm text-foreground">{state.record.confirmed_date || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{state.record.confirmed_location || '-'}</p>
                  </div>
                </div>

                {state.record.certificate_url && (
                  <div>
                    <Button asChild variant="outline">
                      <a href={state.record.certificate_url} target="_blank" rel="noreferrer">
                        View Certificate
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="secondary">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
