import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Search, 
  Award, 
  Calendar, 
  Users, 
  FileCheck, 
  Printer, 
  Download,
  Eye,
  Copy,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Certificate {
  id: string;
  groom_name: string;
  bride_name: string;
  certificate_number: string;
  certificate_issued_at: string;
  imam_name?: string;
  witness_1_name?: string;
  witness_2_name?: string;
  preferred_date: string;
  preferred_masjid?: string;
  status: string;
  [key: string]: any;
}

export default function ViewCertificatesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filters
  const [masjidFilter, setMasjidFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Selected for bulk actions
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());

  // Email sending state
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({});

  // Fetch all certificates
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nikah_applications')
        .select('*')
        .not('certificate_number', 'is', null)
        .order('certificate_issued_at', { ascending: false })
        .limit(10000);

      if (error) throw error;

      setCertificates(data || []);
      setFilteredCertificates(data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Filter certificates based on search and filters
  useEffect(() => {
    let filtered = certificates;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.certificate_number.toLowerCase().includes(query) ||
        cert.groom_name.toLowerCase().includes(query) ||
        cert.bride_name.toLowerCase().includes(query) ||
        cert.imam_name?.toLowerCase().includes(query) ||
        cert.preferred_masjid?.toLowerCase().includes(query)
      );
    }

    // Masjid filter
    if (masjidFilter !== 'all') {
      filtered = filtered.filter(cert => cert.preferred_masjid === masjidFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(cert => new Date(cert.certificate_issued_at) >= dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(cert => new Date(cert.certificate_issued_at) <= endDate);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.certificate_issued_at).getTime();
        const dateB = new Date(b.certificate_issued_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const nameA = `${a.groom_name} ${a.bride_name}`.toLowerCase();
        const nameB = `${b.groom_name} ${b.bride_name}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
    });

    setFilteredCertificates(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, certificates, masjidFilter, dateFrom, dateTo, sortBy, sortOrder]);

  // Copy certificate number to clipboard
  const copyCertNumber = (certNumber: string) => {
    navigator.clipboard.writeText(certNumber);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied!',
      description: `Certificate number ${certNumber} copied to clipboard.`,
    });
  };

  // Export certificates to CSV
  const exportToCSV = () => {
    const headers = [
      'Certificate Number',
      'Groom Name',
      'Bride Name',
      'Nikah Date',
      'Issue Date',
      'Masjid',
      'Imam',
      'Witness 1',
      'Witness 2',
    ];

    const rows = filteredCertificates.map(cert => [
      cert.certificate_number,
      cert.groom_name,
      cert.bride_name,
      cert.preferred_date,
      formatDate(cert.certificate_issued_at),
      cert.preferred_masjid || 'N/A',
      cert.imam_name || 'N/A',
      cert.witness_1_name || 'N/A',
      cert.witness_2_name || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `certificates_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Exported!',
      description: `${filteredCertificates.length} certificates exported to CSV.`,
    });
  };

  // Handle send certificate via email
  const handleSendEmail = async (cert: Certificate, email: string) => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }

    setSendingEmail(prev => ({ ...prev, [cert.id]: true }));
    try {
      // Use EmailJS for client-side email sending (no CORS issues)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

      if (!serviceId || !templateId || !publicKey) {
        toast({
          title: 'Email Not Configured',
          description: 'Missing EmailJS configuration (service/template/public key).',
          variant: 'destructive',
        });
        return;
      }

      const templateParams = {
        to_email: email,
        certificate_number: cert.certificate_number,
        groom_name: cert.groom_name || 'N/A',
        bride_name: cert.bride_name || 'N/A',
        verification_url: `${window.location.origin}/verify-certificate/${cert.certificate_number}?app=${cert.id}`,
        reply_to: 'ibaimniyizi2@gmail.com',
      };

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      toast({
        title: 'Email Sent',
        description: `Certificate sent to ${email}`,
      });
      setEmailInputs(prev => ({ ...prev, [cert.id]: '' }));
    } catch (err: any) {
      const message =
        err?.text ||
        err?.message ||
        (typeof err === 'string' ? err : 'Failed to send email.');

      toast({
        title: 'Email Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(prev => ({ ...prev, [cert.id]: false }));
    }
  };
  // Handle delete certificate
  const handleDeleteCertificate = async (cert: Certificate) => {
    if (!confirm(`Are you sure you want to delete certificate ${cert.certificate_number}?\n\nThis will remove the certificate number and issued date from the application.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('nikah_applications')
        .update({
          certificate_number: null,
          certificate_issued_at: null,
          status: 'approved',
        })
        .eq('id', cert.id);

      if (error) throw error;

      // Remove from local state
      setCertificates(prev => prev.filter(c => c.id !== cert.id));
      setFilteredCertificates(prev => prev.filter(c => c.id !== cert.id));

      toast({
        title: 'Certificate Deleted',
        description: `Certificate ${cert.certificate_number} has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete certificate.',
        variant: 'destructive',
      });
    }
  };
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-600" />
            Marriage Certificates
          </h2>
          <p className="text-muted-foreground">
            View and manage all issued marriage certificates
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Certificates</p>
          <p className="text-3xl font-bold text-amber-600">{certificates.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by certificate number, couple names, imam, or masjid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchCertificates} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
              Refresh
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid gap-4 sm:grid-cols-4 mt-4 pt-4 border-t">
            {/* Masjid Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Filter by Masjid</Label>
              <Select value={masjidFilter} onValueChange={setMasjidFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Masjids" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Masjids</SelectItem>
                  {[...new Set(certificates.map(c => c.preferred_masjid).filter(Boolean))].map(masjid => (
                    <SelectItem key={masjid} value={masjid}>{masjid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? formatDate(dateFrom.toISOString()) : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? formatDate(dateTo.toISOString()) : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="text-xs">Sort By</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v: 'date' | 'name') => setSortBy(v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Issue Date</SelectItem>
                    <SelectItem value="name">Couple Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(masjidFilter !== 'all' || dateFrom || dateTo || searchQuery) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMasjidFilter('all');
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setSearchQuery('');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Issued Certificates ({filteredCertificates.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredCertificates.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading certificates...</span>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates found</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCertificates
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((cert) => (
                <div
                  key={cert.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Certificate Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          <Award className="h-3 w-3 mr-1" />
                          {cert.certificate_number}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyCertNumber(cert.certificate_number)}
                        >
                          {copiedId === cert.certificate_number ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {cert.groom_name} <span className="text-muted-foreground">&</span> {cert.bride_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Nikah: {cert.preferred_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          Issued: {formatDate(cert.certificate_issued_at)}
                        </span>
                        {cert.preferred_masjid && (
                          <span>Masjid: {cert.preferred_masjid}</span>
                        )}
                      </div>

                      {cert.imam_name && (
                        <p className="text-sm text-muted-foreground">
                          Imam: {cert.imam_name}
                          {cert.witness_1_name && ` | Witnesses: ${cert.witness_1_name}, ${cert.witness_2_name}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link to={`/verify-certificate/${cert.certificate_number}?app=${cert.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/dashboard/super-admin/generate_certificate?app=${cert.id}&cert=${encodeURIComponent(cert.certificate_number)}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </Link>
                      
                      {/* Email Section */}
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <Input
                          type="email"
                          placeholder="Email address..."
                          value={emailInputs[cert.id] || ''}
                          onChange={(e) => setEmailInputs(prev => ({ ...prev, [cert.id]: e.target.value }))}
                          className="h-8 text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleSendEmail(cert, emailInputs[cert.id] || '')}
                          disabled={sendingEmail[cert.id] || !emailInputs[cert.id]}
                        >
                          {sendingEmail[cert.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Mail className="h-4 w-4 mr-1" />
                          )}
                          Send
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteCertificate(cert)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {filteredCertificates.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(filteredCertificates.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCertificates.length / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(filteredCertificates.length / itemsPerPage)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Summary Stats */}
      {!loading && certificates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-primary">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => new Date(c.certificate_issued_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-muted-foreground">Issued This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {new Set(certificates.map(c => c.preferred_masjid)).size}
              </p>
              <p className="text-sm text-muted-foreground">Active Masjids</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
