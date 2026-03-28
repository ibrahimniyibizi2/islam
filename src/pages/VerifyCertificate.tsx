import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Share2, Download, Eye, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const { toast } = useToast();

  const [state, setState] = useState<VerificationState>({ status: 'loading' });
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

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

  // Handle share certificate
  const handleShare = async () => {
    if (state.status !== 'found') return;
    
    const shareUrl = `${window.location.origin}/verify-certificate/${state.record.certificate_number}?app=${state.record.id}`;
    const shareData = {
      title: 'Nikah Certificate Verification',
      text: `Verify Nikah Certificate for ${state.record.groom_name} & ${state.record.bride_name}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied!',
          description: 'Certificate verification link copied to clipboard.',
        });
      }
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled');
    }
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (state.status !== 'found') return;
    
    // If certificate_url exists, download it
    if (state.record.certificate_url) {
      const link = document.createElement('a');
      link.href = state.record.certificate_url;
      link.download = `Nikah_Certificate_${state.record.certificate_number}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: 'Your certificate is being downloaded.',
      });
    } else {
      // Generate a simple PDF using window.print
      window.print();
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Generate PDF from certificate preview
  const generatePDF = async () => {
    if (state.status !== 'found' || !certificateRef.current) return;
    
    setDownloading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos = (210 - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth, imgHeight);
      pdf.save(`Nikah_Certificate_${state.record.certificate_number}.pdf`);
      
      toast({
        title: 'Download Complete',
        description: `Certificate downloaded successfully.`,
      });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  // Handle print certificate
  const handlePrint = () => {
    window.print();
  };

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
                    <p className="text-sm text-foreground">{formatDate(state.record.certificate_issued_at)}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Masjid</p>
                    <p className="text-sm text-foreground">{state.record.preferred_masjid || '-'}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Confirmed Date</p>
                    <p className="text-sm text-foreground">{formatDate(state.record.confirmed_date)}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{state.record.confirmed_location || '-'}</p>
                  </div>
                </div>

                {state.status === 'found' && state.isValid && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Certificate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Certificate Preview
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {/* Certificate Preview */}
                          <div 
                            ref={certificateRef}
                            className="bg-gradient-to-br from-amber-50 via-white to-amber-50 border-8 border-double border-amber-600 p-8 relative"
                            style={{ aspectRatio: '1.414/1' }}
                          >
                            {/* Header */}
                            <div className="text-center mb-6">
                              <h1 className="text-2xl font-bold text-green-800 tracking-wide">REPUBLIC OF RWANDA</h1>
                              <h2 className="text-xl font-bold text-amber-600">RWANDA ISLAMIC COMMUNITY</h2>
                              <p className="text-sm text-amber-600 uppercase tracking-widest mt-1 font-semibold">Official Marriage Certificate</p>
                              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
                            </div>

                            {/* Certificate Number */}
                            <div className="text-center mb-6">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-400 px-6 py-2 rounded-full shadow-lg">
                                <span className="text-amber-800 font-semibold text-sm">CERTIFICATE NO:</span>
                                <span className="font-bold text-purple-700">{state.record.certificate_number}</span>
                              </div>
                            </div>

                            {/* Certification Text */}
                            <div className="text-center mb-4">
                              <p className="text-lg text-gray-700 italic">This is to certify that the Islamic Marriage (Nikah) was solemnized between:</p>
                            </div>

                            {/* Couple Names */}
                            <div className="text-center space-y-2 mb-6">
                              <p className="text-2xl font-bold text-green-800" style={{ fontFamily: 'Georgia, serif' }}>
                                {state.record.groom_name}
                              </p>
                              <p className="text-xl italic text-amber-600">~ and ~</p>
                              <p className="text-2xl font-bold text-green-800" style={{ fontFamily: 'Georgia, serif' }}>
                                {state.record.bride_name}
                              </p>
                            </div>

                            {/* Date and Place */}
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6 bg-amber-50/70 p-4 rounded-lg border border-amber-200">
                              <div>
                                <span className="text-gray-500 text-xs font-medium">Date of Nikah:</span>
                                <p className="font-semibold text-gray-800">{formatDate(state.record.confirmed_date)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs font-medium">Place of Nikah:</span>
                                <p className="font-semibold text-gray-800">{state.record.confirmed_location || state.record.preferred_masjid || '-'}</p>
                              </div>
                            </div>

                            {/* Official Stamp */}
                            <div className="flex justify-center my-6">
                              <div className="w-20 h-20 border-4 border-red-600 rounded-full flex flex-col items-center justify-center bg-white">
                                <span className="text-xs text-red-600 font-bold">OFFICIAL</span>
                                <span className="text-lg text-red-600">★</span>
                              </div>
                            </div>

                            {/* Issued Info */}
                            <div className="text-center text-sm text-gray-500 mt-4">
                              <p>Issued on: {formatDate(state.record.certificate_issued_at)}</p>
                              <p className="mt-1">Verify at: {window.location.origin}/verify-certificate/{state.record.certificate_number}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 mt-6 justify-center">
                            <Button onClick={generatePDF} disabled={downloading}>
                              {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              Download PDF
                            </Button>
                            <Button variant="outline" onClick={handlePrint}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                            <Button variant="outline" onClick={handleShare}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={() => setShowPreview(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
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
