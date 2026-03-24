import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

// Enhanced Shahada Application Form with Certificate Generation
export const EnhancedShahadaApplicationForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    formerName: '',
    dateOfBirth: '',
    nationality: 'Rwandan',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    previousReligion: '',
    shahadaDate: new Date().toISOString().split('T')[0],
    location: 'Kigali Islamic Cultural Center',
    witnessName: 'Sheikh Muhammad Al-Hassan',
    witnessTitle: 'Senior Imam',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateCertificateId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SHA-RWA-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Insert application data
      const { data: applicationData, error: insertError } = await supabase
        .from('shahada_applications')
        .insert({
          user_id: user.id,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          date_of_birth: formData.dateOfBirth,
          nationality: formData.nationality,
          address: formData.address.trim(),
          current_religion: formData.previousReligion.trim() || null,
          witness1_name: formData.witnessName,
          status: 'completed' // Auto-approve for demo
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate and send certificate via email
      const { error: emailError } = await supabase.functions.invoke('send-shahada-certificate-email', {
        body: {
          applicationId: applicationData.id,
          fullName: `${applicationData.first_name} ${applicationData.last_name}`,
          email: applicationData.email,
          certificateId: generateCertificateId(),
          language: 'en' // Default to English
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the whole process if email fails
      }

      // Send SMS notification
      const { error: smsError } = await supabase.functions.invoke('send-shahada-sms', {
        body: {
          applicant_name: `${applicationData.first_name} ${applicationData.last_name}`,
          phone: applicationData.phone,
          certificateId: generateCertificateId()
        }
      });

      if (smsError) {
        console.error('SMS error:', smsError);
        // Don't fail the whole process if SMS fails
      }

      toast({
        title: 'Application Submitted Successfully!',
        description: 'Your Shahada certificate has been generated and sent to your email.',
      });

      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shahada Certificate Application</h2>
        <p className="text-gray-600">Complete this form to receive your official Shahada certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Former Name (if applicable)</label>
            <input
              type="text"
              name="formerName"
              value={formData.formerName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="Rwandan">Rwandan</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="0781234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Religious Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Religious Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Religion</label>
            <input
              type="text"
              name="previousReligion"
              value={formData.previousReligion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shahada Date *</label>
              <input
                type="date"
                name="shahadaDate"
                value={formData.shahadaDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
