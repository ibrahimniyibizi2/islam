import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Users, Calendar, MapPin, Upload, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ShahadaApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ShahadaApplicationForm = ({ onSuccess, onCancel }: ShahadaApplicationFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    currentReligion: "",
    
    // Address Information
    address: "",
    city: "",
    district: "",
    
    // Conversion Information
    conversionReason: "",
    islamicKnowledge: "",
    muslimSince: "",
    
    // Witnesses
    witness1Name: "",
    witness1Phone: "",
    witness1Relationship: "",
    witness2Name: "",
    witness2Phone: "",
    witness2Relationship: "",
    
    // Additional Information
    additionalInfo: "",
    
    // Documents
    documents: [] as File[],
    
    // Agreement
    declaration: false,
    understanding: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please log in to submit an application.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'nationality', 'currentReligion', 'address', 'city', 'district', 'conversionReason', 'islamicKnowledge'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        toast({ 
          title: 'Validation Error', 
          description: `Please fill in all required fields: ${missingFields.join(', ')}`, 
          variant: 'destructive' 
        });
        return;
      }

      if (!user?.id) {
        toast({ 
          title: 'Authentication Error', 
          description: 'User not authenticated. Please log in again.', 
          variant: 'destructive' 
        });
        return;
      }

      console.log('Submitting Shahada application with data:', {
        user_id: user.id,
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth,
        previous_religion: formData.currentReligion.trim(),
        address: formData.address.trim(),
        declaration_text: formData.conversionReason.trim(),
        special_requests: formData.islamicKnowledge.trim(),
      });

      const insertData: any = {
        user_id: user.id,
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        national_id: null, 
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        previous_religion: formData.currentReligion.trim(),
        witness1_name: formData.witness1Name.trim() || null,
        witness1_phone: formData.witness1Phone.trim() || null,
        witness1_id: null, 
        witness2_name: formData.witness2Name.trim() || null,
        witness2_phone: formData.witness2Phone.trim() || null,
        witness2_id: null, 
        declaration_text: formData.conversionReason.trim(), 
        preferred_date: null, 
        special_requests: formData.islamicKnowledge.trim(), 
      };

      if (formData.additionalInfo.trim()) {
        insertData.additional_info = formData.additionalInfo.trim();
      }

      const { data, error } = await supabase
        .from("shahada_applications")
        .insert([insertData])
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        toast({ 
          title: 'Database Error', 
          description: `Failed to save application: ${error.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      toast({ 
        title: 'Application Submitted', 
        description: 'Your Shahada application has been submitted successfully.' 
      });

      // Send SMS notification to applicant
      try {
        await supabase.functions.invoke('send-shahada-sms', {
          body: {
            applicant_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            phone: formData.phone.trim(),
          },
        });
      } catch (smsErr) {
        console.error('SMS notification failed:', smsErr);
      }

      // Send email notification to applicant
      try {
        await supabase.functions.invoke('send-shahada-email', {
          body: {
            applicant_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email.trim(),
          },
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }

      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({ 
        title: 'Submission Error', 
        description: 'An unexpected error occurred. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Application Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  placeholder="e.g., Rwandan, Kenyan, Ugandan"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Conversion Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Conversion Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentReligion">Current Religion *</Label>
                <Input
                  id="currentReligion"
                  value={formData.currentReligion}
                  onChange={(e) => handleInputChange("currentReligion", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionReason">Reason for Converting to Islam *</Label>
                <Textarea
                  id="conversionReason"
                  placeholder="Please explain why you want to convert to Islam"
                  value={formData.conversionReason}
                  onChange={(e) => handleInputChange("conversionReason", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="islamicKnowledge">What do you know about Islam? *</Label>
                <Textarea
                  id="islamicKnowledge"
                  placeholder="Describe your knowledge of Islamic beliefs and practices"
                  value={formData.islamicKnowledge}
                  onChange={(e) => handleInputChange("islamicKnowledge", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Witnesses Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Witnesses Information
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Witness 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="witness1Name">Full Name *</Label>
                    <Input
                      id="witness1Name"
                      value={formData.witness1Name}
                      onChange={(e) => handleInputChange("witness1Name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="witness1Phone">Phone Number *</Label>
                    <Input
                      id="witness1Phone"
                      value={formData.witness1Phone}
                      onChange={(e) => handleInputChange("witness1Phone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="witness1Relationship">Relationship *</Label>
                    <Input
                      id="witness1Relationship"
                      value={formData.witness1Relationship}
                      onChange={(e) => handleInputChange("witness1Relationship", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Witness 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="witness2Name">Full Name *</Label>
                    <Input
                      id="witness2Name"
                      value={formData.witness2Name}
                      onChange={(e) => handleInputChange("witness2Name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="witness2Phone">Phone Number *</Label>
                    <Input
                      id="witness2Phone"
                      value={formData.witness2Phone}
                      onChange={(e) => handleInputChange("witness2Phone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="witness2Relationship">Relationship *</Label>
                    <Input
                      id="witness2Relationship"
                      value={formData.witness2Relationship}
                      onChange={(e) => handleInputChange("witness2Relationship", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Declarations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="declaration"
                  checked={formData.declaration}
                  onCheckedChange={(checked) => handleInputChange("declaration", checked as boolean)}
                  required
                />
                <Label htmlFor="declaration" className="text-sm">
                  I declare that I am converting to Islam willingly and without any coercion, and I understand the meaning and implications of the Shahada declaration.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="understanding"
                  checked={formData.understanding}
                  onCheckedChange={(checked) => handleInputChange("understanding", checked as boolean)}
                  required
                />
                <Label htmlFor="understanding" className="text-sm">
                  I understand that this certificate will be issued based on the information provided, and I affirm that all information is true and accurate.
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShahadaApplicationForm;
