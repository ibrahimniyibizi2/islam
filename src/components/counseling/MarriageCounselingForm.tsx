import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Send, Loader2, FileCheck, Heart, Users, Calendar, MessageSquare, CheckCircle2, FileText, Phone, AlertTriangle } from 'lucide-react';

const STEPS = ['Couple Info', 'Marriage Details', 'Counseling Needs', 'Review', 'Documents'];

interface FormData {
  // Husband
  husband_name: string;
  husband_national_id: string;
  husband_age: string;
  husband_phone: string;
  husband_email: string;
  husband_address: string;
  husband_occupation: string;
  
  // Wife
  wife_name: string;
  wife_national_id: string;
  wife_age: string;
  wife_phone: string;
  wife_email: string;
  wife_address: string;
  wife_occupation: string;
  
  // Marriage Details
  marriage_date: string;
  marriage_place: string;
  years_married: string;
  number_of_children: string;
  
  // Counseling Needs
  counseling_type: string;
  primary_issues: string;
  issue_details: string;
  has_previous_counseling: string;
  previous_counseling_details: string;
  preferred_date: string;
  preferred_time: string;
  preferred_location: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  additional_notes: string;
  
  // Documents
  marriage_certificate_file: string;
  husband_id_file: string;
  wife_id_file: string;
  additional_documents: string;
}

// Capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

interface FieldProps {
  label: string;
  field: keyof FormData;
  type?: string;
  placeholder?: string;
  required?: boolean;
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  numeric?: boolean;
  icon?: React.ReactNode;
}

const Field = ({ label, field, type = 'text', placeholder = '', required = false, form, onChange, numeric, icon }: FieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (numeric) {
      value = value.replace(/\D/g, '');
    }
    // Capitalize names
    const nameFields = ['husband_name', 'wife_name', 'emergency_contact_name'];
    if (nameFields.includes(field)) {
      value = capitalizeWords(value);
    }
    onChange(field, value);
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <div className="flex items-center gap-2">
        {icon}
        <Input 
          type={type} 
          value={form[field]} 
          onChange={handleChange} 
          placeholder={placeholder}
          inputMode={numeric ? 'numeric' : undefined}
          pattern={numeric ? '[0-9]*' : undefined}
          className="h-11 sm:h-10 text-base sm:text-sm"
        />
      </div>
    </div>
  );
};

const DOC_CONFIG: { key: keyof FormData; label: string; desc: string; required: boolean }[] = [
  { key: 'marriage_certificate_file', label: 'Marriage Certificate', desc: 'Original or certified copy of Nikah certificate', required: true },
  { key: 'husband_id_file', label: "Husband's Valid ID", desc: 'National ID or passport', required: true },
  { key: 'wife_id_file', label: "Wife's Valid ID", desc: 'National ID or passport', required: true },
  { key: 'additional_documents', label: 'Additional Documents', desc: 'Any relevant documents (optional)', required: false },
];

const initialForm: FormData = {
  husband_name: '', husband_national_id: '', husband_age: '', husband_phone: '',
  husband_email: '', husband_address: '', husband_occupation: '',
  wife_name: '', wife_national_id: '', wife_age: '', wife_phone: '',
  wife_email: '', wife_address: '', wife_occupation: '',
  marriage_date: '', marriage_place: '', years_married: '', number_of_children: '',
  counseling_type: '', primary_issues: '', issue_details: '', has_previous_counseling: '',
  previous_counseling_details: '', preferred_date: '', preferred_time: '', preferred_location: '',
  emergency_contact_name: '', emergency_contact_phone: '', additional_notes: '',
  marriage_certificate_file: '', husband_id_file: '', wife_id_file: '', additional_documents: '',
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const MarriageCounselingForm = ({ onSuccess, onCancel }: Props) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const onChange = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: // Couple Info
        return form.husband_name && form.husband_phone && form.wife_name && form.wife_phone;
      case 1: // Marriage Details
        return form.marriage_date;
      case 2: // Counseling Needs
        return form.counseling_type && form.primary_issues;
      case 3: // Review
        return true;
      case 4: // Documents
        return form.marriage_certificate_file && form.husband_id_file && form.wife_id_file;
      default:
        return true;
    }
  };

  const handleFileUpload = async (docKey: keyof FormData, file: File | null) => {
    if (!file) {
      onChange(docKey, '');
      return;
    }

    if (!user?.id) {
      toast({ 
        title: 'Authentication required', 
        description: 'Please log in to upload files',
        variant: 'destructive'
      });
      return;
    }

    setUploading(docKey);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `marriage-counseling/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      onChange(docKey, publicUrl);
      toast({ title: 'File uploaded', description: `${file.name} uploaded successfully` });
    } catch (error: any) {
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to submit an application', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const applicationData = {
        user_id: user.id,
        ...form,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        application_type: 'marriage_counseling',
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) throw error;

      toast({ title: 'Application Submitted', description: 'Your Marriage Counseling application has been submitted successfully.' });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  Couple Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Husband Full Name" field="husband_name" required form={form} onChange={onChange} />
                <Field label="Husband National ID" field="husband_national_id" required form={form} onChange={onChange} numeric />
                <Field label="Husband Age" field="husband_age" form={form} onChange={onChange} numeric />
                <Field label="Husband Phone" field="husband_phone" required form={form} onChange={onChange} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                <Field label="Husband Email" field="husband_email" type="email" form={form} onChange={onChange} />
                <Field label="Husband Address" field="husband_address" form={form} onChange={onChange} />
                <Field label="Husband Occupation" field="husband_occupation" form={form} onChange={onChange} />
              </CardContent>
            </Card>
            
            <Card className="border-pink-200 bg-pink-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-5 h-5 text-pink-600" />
                  Wife Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Wife Full Name" field="wife_name" required form={form} onChange={onChange} />
                <Field label="Wife National ID" field="wife_national_id" required form={form} onChange={onChange} numeric />
                <Field label="Wife Age" field="wife_age" form={form} onChange={onChange} numeric />
                <Field label="Wife Phone" field="wife_phone" required form={form} onChange={onChange} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                <Field label="Wife Email" field="wife_email" type="email" form={form} onChange={onChange} />
                <Field label="Wife Address" field="wife_address" form={form} onChange={onChange} />
                <Field label="Wife Occupation" field="wife_occupation" form={form} onChange={onChange} />
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="w-5 h-5 text-amber-600" />
                  Marriage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Date of Marriage <span className="text-destructive">*</span></Label>
                  <Input 
                    type="date" 
                    value={form.marriage_date}
                    onChange={(e) => onChange('marriage_date', e.target.value)}
                    className="h-11 sm:h-10"
                  />
                </div>
                <Field label="Place of Marriage" field="marriage_place" form={form} onChange={onChange} />
                <Field label="Years Married" field="years_married" form={form} onChange={onChange} numeric />
                <Field label="Number of Children" field="number_of_children" form={form} onChange={onChange} numeric />
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Counseling Needs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Type of Counseling <span className="text-destructive">*</span></Label>
                  <Select value={form.counseling_type} onValueChange={(value) => onChange('counseling_type', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select counseling type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_marriage">Pre-Marriage Counseling</SelectItem>
                      <SelectItem value="marriage_enrichment">Marriage Enrichment</SelectItem>
                      <SelectItem value="conflict_resolution">Conflict Resolution</SelectItem>
                      <SelectItem value="family_planning">Family Planning</SelectItem>
                      <SelectItem value="communication_skills">Communication Skills</SelectItem>
                      <SelectItem value="crisis_intervention">Crisis Intervention</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Primary Issues <span className="text-destructive">*</span></Label>
                  <Select value={form.primary_issues} onValueChange={(value) => onChange('primary_issues', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select primary issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication">Communication Problems</SelectItem>
                      <SelectItem value="financial">Financial Disagreements</SelectItem>
                      <SelectItem value="intimacy">Intimacy Issues</SelectItem>
                      <SelectItem value="in_laws">Family/In-Law Conflicts</SelectItem>
                      <SelectItem value="parenting">Parenting Differences</SelectItem>
                      <SelectItem value="trust">Trust Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Detailed Description</Label>
                  <Textarea
                    value={form.issue_details}
                    onChange={(e) => onChange('issue_details', e.target.value)}
                    placeholder="Please describe the issues you're facing in your marriage..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Have you received counseling before?</Label>
                  <Select value={form.has_previous_counseling} onValueChange={(value) => onChange('has_previous_counseling', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.has_previous_counseling === 'yes' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm font-medium">Previous Counseling Details</Label>
                    <Textarea
                      value={form.previous_counseling_details}
                      onChange={(e) => onChange('previous_counseling_details', e.target.value)}
                      placeholder="Please provide details about previous counseling..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Scheduling Preferences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm font-medium">Preferred Date</Label>
                      <Input 
                        type="date" 
                        value={form.preferred_date}
                        onChange={(e) => onChange('preferred_date', e.target.value)}
                        className="h-11 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm font-medium">Preferred Time</Label>
                      <Select value={form.preferred_time} onValueChange={(value) => onChange('preferred_time', value)}>
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue placeholder="Select time..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                          <SelectItem value="evening">Evening (5pm-8pm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Field label="Preferred Location" field="preferred_location" form={form} onChange={onChange} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Emergency Contact Name" field="emergency_contact_name" form={form} onChange={onChange} />
                    <Field label="Emergency Contact Phone" field="emergency_contact_phone" form={form} onChange={onChange} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    value={form.additional_notes}
                    onChange={(e) => onChange('additional_notes', e.target.value)}
                    placeholder="Any additional information or requests..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  Review Your Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Husband</h4>
                    <p><span className="text-gray-500">Name:</span> {form.husband_name}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.husband_phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Wife</h4>
                    <p><span className="text-gray-500">Name:</span> {form.wife_name}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.wife_phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Marriage</h4>
                    <p><span className="text-gray-500">Date:</span> {form.marriage_date}</p>
                    <p><span className="text-gray-500">Children:</span> {form.number_of_children || '0'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Counseling</h4>
                    <p><span className="text-gray-500">Type:</span> {form.counseling_type}</p>
                    <p><span className="text-gray-500">Issue:</span> {form.primary_issues}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Important Notice</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        By submitting this application, you confirm that all information provided is accurate. 
                        A counselor will contact you within 48 hours to schedule your session. 
                        Marriage counseling is confidential and conducted by qualified Islamic counselors.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {DOC_CONFIG.map((doc) => (
                  <div key={doc.key} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{doc.label} {doc.required && <span className="text-red-500">*</span>}</h4>
                        <p className="text-xs text-gray-500 mt-1">{doc.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                          className="w-full sm:w-auto text-xs"
                          disabled={uploading === doc.key}
                        />
                        {uploading === doc.key && <Loader2 className="w-4 h-4 animate-spin" />}
                        {form[doc.key] && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </div>
                    </div>
                    {form[doc.key] && (
                      <p className="text-xs text-emerald-600 mt-2">✓ Document uploaded successfully</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Application Fee</h4>
                    <p className="text-xs text-gray-500">Marriage counseling session fee</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">Free</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Marriage Counseling Application</h2>
          <span className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        
        {/* Step Labels */}
        <div className="hidden sm:flex justify-between text-xs text-gray-500">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? 'text-emerald-600 font-semibold' : ''}>
              {s}
            </span>
          ))}
        </div>
        
        {/* Mobile Step Label */}
        <div className="sm:hidden text-center text-sm font-medium text-emerald-600">
          {STEPS[step]}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={() => step === 0 ? onCancel() : setStep(step - 1)}
          className="order-2 sm:order-1"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-emerald-600 hover:bg-emerald-700 order-1 sm:order-2"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="bg-emerald-600 hover:bg-emerald-700 order-1 sm:order-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Submit Application
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarriageCounselingForm;
