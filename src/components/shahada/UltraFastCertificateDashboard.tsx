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
  certificate_stored_at?: string;
}

// Language options
const languageOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' }
];

// Ultra-fast Dashboard with Storage
export const UltraFastCertificateDashboard = () => {
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
      
      // Priority 1: Use stored URL from Storage (instant)
      if (application.certificate_urls && application.certificate_urls[language]) {
        const storedUrl = application.certificate_urls[language];
        
        // Download from stored URL
        const response = await fetch(storedUrl);
        if (!response.ok) {
          throw new Error('Failed to download stored certificate');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shahada-certificate-${language}-${application.first_name}-${application.last_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: '⚡ Instant Download',
          description: `Certificate downloaded from Storage in ${languageOptions.find(opt => opt.value === language)?.label}`,
        });
        return;
      }
      
      // Priority 2: Use download endpoint (on-demand)
      const certificateId = application.certificate_id || `SHA-RWA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://olpvftgnmycofavltxoa.supabase.co';
      const downloadUrl = `${supabaseUrl}/functions/v1/download-certificate?certificateId=${certificateId}&lang=${language}&applicationId=${application.id}`;
      
      // Download from endpoint
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to generate certificate');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shahada-certificate-${language}-${application.first_name}-${application.last_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: '📄 Download Started',
        description: `Certificate generated and downloaded in ${languageOptions.find(opt => opt.value === language)?.label}`,
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

      // Start orchestration with Storage
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
        title: '🚀 Ultra-Fast Certificate Generation',
        description: 'Your certificates are being stored for instant delivery. You will receive SMS and email notifications immediately.',
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
      case 'approved': return '⚡ Processing...';
      case 'pending': return '📋 Pending';
      case 'rejected': return '❌ Rejected';
      default: return status;
    }
  };

  const getDownloadSpeed = (application: ShahadaApplication) => {
    if (application.certificate_stored_at) {
      return { text: '⚡ Ultra-Fast', color: 'text-green-600' };
    }
    return { text: '📄 Fast', color: 'text-blue-600' };
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ Ultra-Fast Shahada Certificates</h2>
        <p className="text-gray-600">Download your Shahada certificates instantly with Storage optimization</p>
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            🚀 <strong>Ultra-Fast Delivery:</strong> Certificates stored in Supabase Storage for instant download.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            💾 <strong>Smart Storage:</strong> Pre-generated certificates available in 4 languages.
          </p>
          <p className="text-sm text-purple-700 mt-1">
            🌍 <strong>4 Languages:</strong> English, Kinyarwanda, Arabic, French.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600">Submit your Shahada application to receive your ultra-fast certificates</p>
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
                    {application.certificate_stored_at && (
                      <p className="text-sm text-green-600 font-medium">
                        ⚡ Stored: {new Date(application.certificate_stored_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                    {application.status === 'completed' && (
                      <span className={`text-xs font-medium ${getDownloadSpeed(application).color}`}>
                        {getDownloadSpeed(application).text}
                      </span>
                    )}
                  </div>
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
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
                    >
                      🚀 Generate Ultra-Fast Certificate
                    </button>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      ⚡ Your certificates are being stored for ultra-fast delivery. You will receive SMS and email notifications immediately.
                    </p>
                    <div className="animate-pulse bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">⚡ Storing certificates for instant access...</p>
                    </div>
                  </div>
                )}

                {application.status === 'completed' && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">📥 Download Certificate:</h4>
                      <span className={`text-xs font-medium ${getDownloadSpeed(application).color}`}>
                        {getDownloadSpeed(application).text}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {languageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDownloadCertificate(application, option.value)}
                          disabled={downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value}
                          className={`flex items-center justify-center px-3 py-2 border rounded-lg transition-all duration-200 ${
                            downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value
                              ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                              : application.certificate_urls?.[option.value]
                              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400'
                              : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400'
                          }`}
                        >
                          <span className="mr-2">{option.flag}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                          {downloadingLanguage?.applicationId === application.id && downloadingLanguage?.language === option.value && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {application.certificate_stored_at ? (
                        <span>💾 Stored in Supabase Storage - Instant download</span>
                      ) : (
                        <span>📄 Generated on-demand with QR code and watermark</span>
                      )}
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
