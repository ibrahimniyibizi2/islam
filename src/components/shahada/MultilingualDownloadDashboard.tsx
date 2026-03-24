import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

// Types
interface ShahadaApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  certificate_urls?: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  completed_at?: string;
  certificate_id?: string;
}

// Language options with download URLs
const languageOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' }
];

// Enhanced Dashboard with Download Endpoints
export const MultilingualDownloadDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ShahadaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingLanguage, setDownloadingLanguage] = useState<{ applicationId: string; language: string } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shahada_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your Shahada applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (application: ShahadaApplication, language: string) => {
    try {
      setDownloadingLanguage({ applicationId: application.id, language });
      
      // Generate certificate ID if not exists
      const certificateId = application.certificate_id || `SHA-RWA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Use the new download endpoint
      const downloadUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/download-certificate?certificateId=${certificateId}&lang=${language}&applicationId=${application.id}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `shahada-certificate-${language}-${application.first_name}-${application.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: `Certificate downloading in ${languageOptions.find(opt => opt.value === language)?.label}`,
      });
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive',
      });
    } finally {
      setDownloadingLanguage(null);
    }
  };

  const handleOrchestrateCertificate = async (application: ShahadaApplication) => {
    try {
      const certificateId = `SHA-RWA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Update application with certificate ID
      await supabase
        .from('shahada_applications')
        .update({ 
          status: 'approved', 
          certificate_id: certificateId 
        })
        .eq('id', application.id);

      // Start orchestration
      const { error } = await supabase.functions.invoke('orchestrate-certificate', {
        body: {
          applicationId: application.id,
          fullName: `${application.first_name} ${application.last_name}`,
          email: application.email,
          phone: application.phone,
          certificateId: certificateId,
          issueDate: new Date().toISOString().split('T')[0],
          dateOfBirth: "1990-01-01",
          nationality: "Rwandan",
          idNumber: "123456789",
          shahadaDate: new Date().toISOString().split('T')[0],
          location: "Kigali Islamic Cultural Center",
          witnessName: "Sheikh Muhammad Al-Hassan",
          witnessTitle: "Senior Imam",
          language: 'en'
        }
      });

      if (error) throw error;

      toast({
        title: 'Certificate Generation Started',
        description: 'Your certificates will be ready immediately. You will receive SMS and email notifications.',
      });

      // Refresh applications
      fetchApplications();

    } catch (error) {
      console.error('Error starting certificate generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start certificate generation',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Completed';
      case 'approved': return '⏳ Processing...';
      case 'pending': return '📋 Pending';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shahada Certificates</h2>
        <p className="text-gray-600">Download your Shahada certificates in multiple languages</p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            🚀 <strong>Fast Delivery:</strong> Certificates are generated and delivered immediately via SMS and email.
          </p>
          <p className="text-sm text-green-700 mt-1">
            🌍 <strong>4 Languages:</strong> Download in English, Kinyarwanda, Arabic, or French.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600">Submit your Shahada application to receive your certificates</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.first_name} {application.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                    {application.completed_at && (
                      <p className="text-sm text-gray-600">Completed: {new Date(application.completed_at).toLocaleDateString()}</p>
                    )}
                    {application.certificate_id && (
                      <p className="text-sm text-gray-600">Certificate ID: {application.certificate_id}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600">{application.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">{application.phone}</span>
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => handleOrchestrateCertificate(application)}
                      className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium"
                    >
                      🚀 Generate Certificate (Immediate Delivery)
                    </button>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      📧 Your certificates are being generated immediately. You will receive SMS and email notifications.
                    </p>
                    <div className="animate-pulse bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">⚡ Processing... Immediate delivery</p>
                    </div>
                  </div>
                )}

                {application.status === 'completed' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">📥 Download Certificate:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {languageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDownloadCertificate(application, option.value)}
                          disabled={downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value}
                          className={`flex items-center justify-center px-3 py-2 border rounded-lg transition-all duration-200 ${
                            downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value
                              ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400'
                          }`}
                        >
                          <span className="mr-2">{option.flag}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                          {downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      💡 Each certificate is generated on-demand with QR code and official watermark
                    </div>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-red-600">
                      Your application was not approved. Please contact the Islamic Affairs office for more information.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
