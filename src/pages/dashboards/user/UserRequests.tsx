import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Clock, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NikahApplicationForm from '@/components/nikah/NikahApplicationForm';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid_pending_review: 'bg-blue-100 text-blue-800',
  sent_to_imam_masjid: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function UserRequests() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const downloadReceipt = (app: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // === HEADER ===
    doc.setFillColor(0, 100, 0);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RWANDA ISLAMIC HUB', centerX, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Official Nikah Receipt', centerX, 32, { align: 'center' });
    
    // === RECEIPT INFO BOX ===
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(15, 55, pageWidth - 30, 30, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 20, 65);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reference: ${app.reference_number || 'N/A'}`, 20, 78);
    
    // === TABLE DATA ===
    let y = 100;
    const leftCol = 20;
    const rightCol = 80;
    const lineHeight = 10;
    
    // Helper function for table rows
    const addRow = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(label, leftCol, y);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(value, rightCol, y);
      
      // Light separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(leftCol, y + 2, pageWidth - 20, y + 2);
      
      y += lineHeight;
    };
    
    // Section: Couple Information
    doc.setFillColor(0, 100, 0);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('COUPLE INFORMATION', 20, y);
    y += 12;
    
    addRow('Bride:', app.bride_name || 'N/A');
    addRow('Groom:', app.groom_name || 'N/A');
    y += 5;
    
    // Section: Wedding Details
    doc.setFillColor(0, 100, 0);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('WEDDING DETAILS', 20, y);
    y += 12;
    
    addRow('Preferred Date:', app.preferred_date || 'N/A');
    addRow('Masjid:', app.preferred_masjid || 'N/A');
    y += 5;
    
    // Section: Payment
    doc.setFillColor(0, 100, 0);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS', 20, y);
    y += 12;
    
    addRow('Payment Status:', (app.payment_status || 'pending').toUpperCase());
    addRow('Amount Due:', app.amount_due ? `${app.amount_due.toLocaleString()} RWF` : 'N/A');
    addRow('Amount Paid:', app.amount_paid ? `${app.amount_paid.toLocaleString()} RWF` : '0 RWF');
    y += 5;
    
    // Section: Application Status
    doc.setFillColor(0, 100, 0);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('APPLICATION STATUS', 20, y);
    y += 12;
    
    const status = app.status?.replace(/_/g, ' ').toUpperCase() || 'N/A';
    addRow('Current Status:', status);
    
    // === SIGNATURE AREA ===
    y = 230;
    doc.setDrawColor(0, 0, 0);
    doc.line(20, y, 70, y);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signature', 20, y + 5);
    
    // === FOOTER ===
    doc.setFillColor(0, 100, 0);
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Rwanda Islamic Hub!', centerX, 287, { align: 'center' });
    doc.text('For inquiries, contact your local masjid.', centerX, 293, { align: 'center' });
    
    // Save PDF
    doc.save(`Nikah-Receipt-${app.reference_number || 'N/A'}.pdf`);
  };

  const fetchApplications = () => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('nikah_applications')
      .select('id, reference_number, bride_name, groom_name, status, preferred_date, preferred_masjid, preferred_imam, created_at, payment_status, amount_due, amount_paid')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApplications(data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchApplications(); }, [user]);

  if (showForm) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">New Nikah Application</h2>
        <NikahApplicationForm
          onSuccess={() => { setShowForm(false); fetchApplications(); }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Nikah Requests</h2>
          <p className="text-sm text-muted-foreground">Track and manage your nikah applications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Your nikah applications will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{app.reference_number || 'Pending Reference'}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] || 'bg-muted text-muted-foreground'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.bride_name} {app.groom_name ? `& ${app.groom_name}` : ''}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(app.created_at).toLocaleDateString()}</span>
                    {app.preferred_date && <span>Preferred: {app.preferred_date}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.payment_status && (
                    <Badge variant={app.payment_status === 'paid' ? 'default' : 'secondary'}>
                      Payment: {app.payment_status}
                    </Badge>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelected(app)}>
                        <Eye className="mr-1 h-4 w-4" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                      </DialogHeader>
                      {selected && (
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="text-muted-foreground">Reference:</span><p className="font-medium">{selected.reference_number || 'N/A'}</p></div>
                            <div><span className="text-muted-foreground">Status:</span><p className="font-medium capitalize">{selected.status.replace(/_/g, ' ')}</p></div>
                            <div><span className="text-muted-foreground">Bride:</span><p className="font-medium">{selected.bride_name}</p></div>
                            <div><span className="text-muted-foreground">Groom:</span><p className="font-medium">{selected.groom_name || 'N/A'}</p></div>
                            <div><span className="text-muted-foreground">Preferred Date:</span><p className="font-medium">{selected.preferred_date || 'N/A'}</p></div>
                            <div><span className="text-muted-foreground">Masjid:</span><p className="font-medium">{selected.preferred_masjid || 'N/A'}</p></div>
                            <div><span className="text-muted-foreground">Payment:</span><p className="font-medium">{selected.payment_status || 'pending'}</p></div>
                            <div><span className="text-muted-foreground">Amount Due:</span><p className="font-medium">{selected.amount_due ? `${selected.amount_due} RWF` : 'N/A'}</p></div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => downloadReceipt(selected)}
                          >
                            <Download className="mr-2 h-4 w-4" /> Download Receipt
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
