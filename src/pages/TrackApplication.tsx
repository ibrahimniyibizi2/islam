import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Download, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ApplicationStatus {
  id: string;
  type: 'nikah' | 'hajj' | 'shahada' | 'other';
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  submittedAt: string;
  updatedAt: string;
  applicantName: string;
  details: Record<string, string>;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

export default function TrackApplicationPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    // Check if user has track token
    const trackToken = sessionStorage.getItem('track_token');
    if (!trackToken) {
      toast({ 
        title: 'Access Denied', 
        description: 'Please verify your identity first.', 
        variant: 'destructive' 
      });
      navigate('/');
      return;
    }

    // Fetch application data
    fetchApplicationData();
  }, [applicationId]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual endpoint
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('track_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Application not found');
      }

      const data = await response.json();
      setApplication(data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load application data.', 
        variant: 'destructive' 
      });
      // For demo, set mock data
      setApplication(getMockData(applicationId || ''));
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (id: string): ApplicationStatus => ({
    id,
    type: 'nikah',
    status: 'processing',
    submittedAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-18T14:20:00Z',
    applicantName: 'John Doe',
    details: {
      'Service Type': 'Nikah Registration',
      'Mosque': 'Kigali Central Mosque',
      'Preferred Date': '2024-04-15',
      'Status': 'Under Review'
    },
    timeline: [
      { date: '2024-03-15T10:30:00Z', status: 'Submitted', description: 'Application submitted successfully' },
      { date: '2024-03-16T09:00:00Z', status: 'Received', description: 'Application received by the office' },
      { date: '2024-03-18T14:20:00Z', status: 'Processing', description: 'Application under review by the committee' }
    ]
  });

  const handleDownload = () => {
    toast({ title: 'Download Started', description: 'Your application document is being prepared.' });
    // TODO: Implement actual PDF download
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Application Status',
          text: `Track my application ${applicationId}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied', description: 'Share link copied to clipboard.' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-4" />
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find any application with that ID.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-emerald-600 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
              <p className="text-gray-600">Track your application #{application.id}</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6 border-l-4 border-l-emerald-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Status</CardTitle>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                {application.status.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(application.details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {application.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      {getStatusIcon(event.status.toLowerCase())}
                    </div>
                    {index !== application.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-emerald-200 my-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-gray-900">{event.status}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
