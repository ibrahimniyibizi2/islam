import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../hooks/useAuth';

// Enhanced Shahada Application Form with Orchestration
export const OrchestrateShahadaApplicationForm = ({ onSuccess }: { onSuccess: () => void }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // 1. Insert application data
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
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Start certificate orchestration
      const { error: orchestrationError } = await supabase.functions.invoke('orchestrate-certificate', {
        body: {
          applicationId: applicationData.id,
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          formerName: formData.formerName.trim() || undefined,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          certificateId: `SHA-RWA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          issueDate: new Date().toISOString().split('T')[0],
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          idNumber: formData.idNumber.trim(),
          shahadaDate: formData.shahadaDate,
          location: formData.location,
          witnessName: formData.witnessName,
          witnessTitle: formData.witnessTitle,
          language: 'en'
        }
      });

      if (orchestrationError) {
        console.error('Orchestration error:', orchestrationError);
        // Don't fail the whole process if orchestration fails
      }

      toast({
        title: 'Application Submitted Successfully!',
        description: 'Your Shahada application has been submitted. Certificates will be generated and sent to you within 2 minutes.',
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
        <p className="text-gray-600">Complete this form to receive your official Shahada certificate in 4 languages</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            📋 <strong>Process:</strong> After submission, your certificates will be generated in 2 minutes and sent via SMS and email.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            🌍 <strong>Languages:</strong> English, Kinyarwanda, Arabic, French
          </p>
        </div>
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
              'Submit Application & Generate Certificates'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
