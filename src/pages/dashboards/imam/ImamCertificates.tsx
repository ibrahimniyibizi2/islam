import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Search, Plus, Eye, Download, Award, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Certificate {
  id: string;
  certificate_number: string;
  recipient_name: string;
  certificate_type: 'nikah' | 'shahada' | 'hajj' | 'course' | 'other';
  issue_date: string;
  status: 'active' | 'revoked' | 'expired';
  mosque_id?: string;
  created_at: string;
  mosques?: { name: string };
}

export default function ImamCertificates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  useEffect(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.certificate_type === typeFilter);
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, typeFilter]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          mosques (name)
        `)
        .eq('issued_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
      setFilteredCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openViewDialog = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  const handleDownload = async (certificate: Certificate) => {
    toast({
      title: 'Download Started',
      description: `Certificate ${certificate.certificate_number} is being prepared for download.`,
    });
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      nikah: 'bg-pink-100 text-pink-800',
      shahada: 'bg-green-100 text-green-800',
      hajj: 'bg-blue-100 text-blue-800',
      course: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={styles[type as keyof typeof styles]}>{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificates</h2>
          <p className="text-muted-foreground">Manage and issue certificates</p>
        </div>
        <Button onClick={() => navigate('/dashboard/imam/certificates/generate')}>
          <Plus className="mr-2 h-4 w-4" />
          Issue New Certificate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by recipient name or certificate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="nikah">Nikah</SelectItem>
                <SelectItem value="shahada">Shahada</SelectItem>
                <SelectItem value="hajj">Hajj</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <div className="py-8 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No certificates found</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/dashboard/imam/certificates/generate')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Issue Your First Certificate
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{certificate.certificate_number}</span>
                      {getTypeBadge(certificate.certificate_type)}
                      {getStatusBadge(certificate.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {certificate.recipient_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </span>
                      {certificate.mosques?.name && (
                        <span>Mosque: {certificate.mosques.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(certificate)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(certificate)}>
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>Complete information about this certificate</DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <Award className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{selectedCertificate.certificate_number}</p>
                <p className="text-sm text-muted-foreground">Certificate Number</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                  <p className="text-sm">{selectedCertificate.recipient_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">{selectedCertificate.certificate_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="text-sm">
                    {new Date(selectedCertificate.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                </div>
              </div>
              {selectedCertificate.mosques?.name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issuing Mosque</p>
                  <p className="text-sm">{selectedCertificate.mosques.name}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedCertificate && handleDownload(selectedCertificate)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
