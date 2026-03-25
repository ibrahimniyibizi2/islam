import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Heart, 
  Home, 
  Building2, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jsPDF } from 'jspdf';

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Your application is being reviewed'
  },
  paid_pending_review: { 
    label: 'Paid - Under Review', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    description: 'Payment received, reviewing documents'
  },
  sent_to_imam_masjid: { 
    label: 'Sent to Imam/Masjid', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Clock,
    description: 'Forwarded to local mosque'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Your application has been confirmed'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle,
    description: 'Service completed successfully'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Application was not approved'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Application approved'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Loader2,
    description: 'Processing your application'
  },
};

const APPLICATION_TYPES = [
  { 
    id: 'nikah', 
    label: 'Nikah/Marriage', 
    icon: Heart, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50',
    table: 'nikah_applications',
    fields: ['id', 'reference_number', 'bride_name', 'groom_name', 'status', 'preferred_date', 'preferred_masjid', 'payment_status', 'amount_due', 'amount_paid', 'created_at', 'updated_at']
  },
  { 
    id: 'shahada', 
    label: 'Shahada Certificate', 
    icon: FileText, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    table: 'shahada_applications',
    fields: ['id', 'reference_number', 'full_name', 'status', 'created_at', 'updated_at']
  },
  { 
    id: 'residence', 
    label: 'Residence Certificate', 
    icon: Home, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    table: 'residence_applications',
    fields: ['id', 'reference_number', 'full_name', 'status', 'created_at', 'updated_at']
  },
  { 
    id: 'business', 
    label: 'Business Registration', 
    icon: Building2, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    table: 'business_applications',
    fields: ['id', 'reference_number', 'business_name', 'status', 'created_at', 'updated_at']
  },
];

interface Application {
  id: string;
  type: string;
  reference_number: string;
  status: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export default function TrackApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchAllApplications = async () => {
    if (!user) return;
    setLoading(true);
    
    const allApps: Application[] = [];
    
    for (const type of APPLICATION_TYPES) {
      try {
        const { data, error } = await supabase
          .from(type.table as any)
          .select(type.fields.join(', '))
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.log(`Table ${type.table} may not exist yet:`, error.message);
          continue;
        }
        
        if (data && Array.isArray(data)) {
          data.forEach((app: any) => {
            allApps.push({
              ...app,
              type: type.id,
              typeLabel: type.label,
              typeIcon: type.icon,
              typeColor: type.color,
              typeBgColor: type.bgColor
            });
          });
        }
      } catch (err) {
        console.log(`Error fetching ${type.id} applications:`, err);
      }
    }
    
    // Sort by created_at descending
    allApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setApplications(allApps);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllApplications();
  }, [user]);

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
      description: 'Status unknown'
    };
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.bride_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.groom_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || app.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const downloadReceipt = (app: Application) => {
    if (app.type !== 'nikah') return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // Header
    doc.setFillColor(0, 100, 0);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RWANDA ISLAMIC HUB', centerX, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Application Receipt', centerX, 32, { align: 'center' });
    
    // Receipt Info
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
    
    // Application Details
    let y = 100;
    const leftCol = 20;
    const rightCol = 80;
    const lineHeight = 10;
    
    const addRow = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(label, leftCol, y);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(value, rightCol, y);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(leftCol, y + 2, pageWidth - 20, y + 2);
      
      y += lineHeight;
    };
    
    // Section Header
    doc.setFillColor(0, 100, 0);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('APPLICATION DETAILS', 20, y);
    y += 12;
    
    addRow('Application Type:', app.typeLabel);
    addRow('Status:', app.status.replace(/_/g, ' ').toUpperCase());
    if (app.bride_name) addRow('Bride:', app.bride_name);
    if (app.groom_name) addRow('Groom:', app.groom_name);
    if (app.full_name) addRow('Applicant:', app.full_name);
    if (app.business_name) addRow('Business:', app.business_name);
    y += 5;
    
    // Payment Section
    if (app.payment_status) {
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
    }
    
    // Footer
    doc.setFillColor(0, 100, 0);
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Rwanda Islamic Hub!', centerX, 287, { align: 'center' });
    doc.text('For inquiries, contact your local masjid.', centerX, 293, { align: 'center' });
    
    doc.save(`${app.type}-Receipt-${app.reference_number || 'N/A'}.pdf`);
  };

  const getApplicationTitle = (app: Application) => {
    switch (app.type) {
      case 'nikah':
        return `${app.bride_name || 'Unknown'} & ${app.groom_name || 'Unknown'}`;
      case 'shahada':
      case 'residence':
        return app.full_name || 'Unknown';
      case 'business':
        return app.business_name || 'Unknown';
      default:
        return 'Application';
    }
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Track Applications</h2>
          <p className="text-sm text-gray-500">
            View and track all your Islamic service applications in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {applications.length} Total
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {APPLICATION_TYPES.map((type) => {
          const count = applications.filter(a => a.type === type.id).length;
          const Icon = type.icon;
          return (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`p-3 rounded-xl ${type.bgColor}`}>
                  <Icon className={`w-6 h-6 ${type.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{type.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by reference number, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Tabs value={selectedType} onValueChange={setSelectedType} className="w-auto">
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {APPLICATION_TYPES.map(t => (
                    <TabsTrigger key={t.id} value={t.id} className="text-xs px-2">
                      {t.label.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery || selectedType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t submitted any applications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => {
                const status = getStatusConfig(app.status);
                const StatusIcon = status.icon;
                const TypeIcon = app.typeIcon;
                
                return (
                  <div 
                    key={app.id} 
                    className="group flex flex-col gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${app.typeBgColor} shrink-0`}>
                        <TypeIcon className={`w-5 h-5 ${app.typeColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{getApplicationTitle(app)}</h4>
                          <Badge variant="outline" className="text-xs">
                            {app.typeLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Ref: {app.reference_number || 'Pending'} • Submitted {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {app.payment_status && (
                            <Badge 
                              variant={app.payment_status === 'paid' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {app.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                            className="w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <TypeIcon className={`w-5 h-5 ${app.typeColor}`} />
                              Application Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-gray-50">
                              <p className="text-sm text-gray-500">Status</p>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusIcon className={`w-4 h-4 ${status.color.split(' ')[1]}`} />
                                <span className="font-medium">{status.label}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reference</span>
                                <span className="font-medium">{app.reference_number || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium">{app.typeLabel}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Submitted</span>
                                <span className="font-medium">{new Date(app.created_at).toLocaleDateString()}</span>
                              </div>
                              {app.preferred_date && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Preferred Date</span>
                                  <span className="font-medium">{app.preferred_date}</span>
                                </div>
                              )}
                              {app.preferred_masjid && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Preferred Masjid</span>
                                  <span className="font-medium">{app.preferred_masjid}</span>
                                </div>
                              )}
                              {app.amount_due && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Amount Due</span>
                                  <span className="font-medium text-emerald-600">
                                    {app.amount_due.toLocaleString()} RWF
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              onClick={() => downloadReceipt(app)}
                              className="w-full"
                              variant="outline"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Receipt
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hidden sm:flex text-gray-400 hover:text-emerald-600"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
