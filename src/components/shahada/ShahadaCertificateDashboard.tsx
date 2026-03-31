import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { MultilingualShahadaCertificateDownload, SupportedLanguage } from './MultilingualShahadaCertificate';
import { toast } from '../ui/use-toast';

// Types
interface ShahadaApplication {
  id: string;
  first_name: string;
  last_name: string;
  former_name?: string;
  date_of_birth: string;
  nationality: string;
  id_number: string;
  passport_photo_url?: string;
  shahada_date: string;
  location: string;
  witness_name: string;
  witness_title: string;
  certificate_id: string;
  issue_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

// Dashboard Component for Certificate Downloads
export const ShahadaCertificateDashboard = () => {
  const [applications, setApplications] = useState<ShahadaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ShahadaApplication | null>(null);
  const [downloadingLanguage, setDownloadingLanguage] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shahada_applications')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          national_id,
          date_of_birth,
          current_religion,
          address,
          city,
          district,
          status,
          created_at,
          updated_at,
          certificate_number,
          certificate_issued_at,
          witness1_name,
          witness2_name,
          witness1_phone,
          witness2_phone,
          conversion_reason,
          islamic_knowledge,
          passport_photo_url
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Map database columns to interface
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        // Use first_name and last_name from database
        id_number: item.national_id,
        shahada_date: item.preferred_date || item.created_at,
        location: `${item.city || ''}, ${item.district || ''}`,
        witness_name: item.witness1_name,
        witness_title: 'Witness',
        certificate_id: item.certificate_number || `SHA-${item.id.slice(0, 8).toUpperCase()}`,
        issue_date: item.certificate_issued_at || item.updated_at || item.created_at,
      })) as ShahadaApplication[];
      setApplications(mappedData);
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

  const handleDownloadCertificate = async (application: ShahadaApplication, language: SupportedLanguage) => {
    try {
      setDownloadingLanguage(language);
      
      // Call the multilingual certificate generation function
      const { data, error } = await supabase.functions.invoke('generate-multilingual-shahada-certificate', {
        body: {
          applicationId: application.id,
          fullName: `${application.first_name} ${application.last_name}`,
          formerName: application.former_name,
          dateOfBirth: application.date_of_birth,
          nationality: application.nationality,
          idNumber: application.id_number,
          shahadaDate: application.shahada_date,
          location: application.location,
          witnessName: application.witness_name,
          witnessTitle: application.witness_title,
          certificateId: application.certificate_id,
          issueDate: application.issue_date,
          passportPhotoUrl: application.passport_photo_url,
          language
        }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fullName = `${application.first_name} ${application.last_name}`.toLowerCase().replace(/\s+/g, '-');
      a.href = url;
      a.download = `shahada-certificate-${language}-${fullName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `Certificate downloaded in ${language.toUpperCase()}`,
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
      case 'completed': return 'Completed';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const languageOptions: { value: SupportedLanguage; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

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
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600">Your Shahada certificates will appear here once approved</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{application.first_name} {application.last_name}</h3>
                    <p className="text-sm text-gray-600">Certificate ID: {application.certificate_id}</p>
                    <p className="text-sm text-gray-600">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Shahada Date:</span>
                    <span className="ml-2 text-gray-600">{application.shahada_date}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{application.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Witness:</span>
                    <span className="ml-2 text-gray-600">{application.witness_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Issue Date:</span>
                    <span className="ml-2 text-gray-600">{application.issue_date}</span>
                  </div>
                </div>

                {application.status === 'completed' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Download Certificate:</h4>
                    <div className="flex flex-wrap gap-2">
                      {languageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDownloadCertificate(application, option.value)}
                          disabled={downloadingLanguage === option.value}
                          className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="mr-2">{option.flag}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                          {downloadingLanguage === option.value && (
                            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {application.status !== 'completed' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      {application.status === 'pending' && 'Your application is being reviewed.'}
                      {application.status === 'approved' && 'Your application has been approved. Certificate will be available soon.'}
                      {application.status === 'rejected' && 'Your application was not approved. Please contact the Islamic Affairs office.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Certificate Preview</h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <MultilingualShahadaCertificateDownload
                certificateData={{
                  fullName: `${selectedApplication.first_name} ${selectedApplication.last_name}`,
                  formerName: selectedApplication.former_name,
                  dateOfBirth: selectedApplication.date_of_birth,
                  nationality: selectedApplication.nationality,
                  idNumber: selectedApplication.id_number,
                  shahadaDate: selectedApplication.shahada_date,
                  location: selectedApplication.location,
                  witnessName: selectedApplication.witness_name,
                  witnessTitle: selectedApplication.witness_title,
                  certificateId: selectedApplication.certificate_id,
                  issueDate: selectedApplication.issue_date,
                }}
                buttonText="Preview Certificate"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
