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
import { ChevronLeft, ChevronRight, Send, Loader2, FileCheck, AlertTriangle, CheckCircle2, Scale, User, Phone, FileText, Calendar, MessageSquare } from 'lucide-react';

const STEPS = ['Husband Info', 'Wife Info', 'Marriage Details', 'Divorce Details', 'Review', 'Documents & Payment'];

const TALAQ_TYPES = ['Talaq Raji (Revocable)', 'Talaq Baa\'in (Irrevocable)', 'Talaq Mughallazah (Final)', 'Khul\' (Wife-initiated)'];

interface FormData {
  // Husband
  husband_name: string;
  husband_national_id: string;
  husband_father_name: string;
  husband_mother_name: string;
  husband_phone: string;
  husband_email: string;
  husband_address: string;
  husband_occupation: string;
  
  // Wife
  wife_name: string;
  wife_national_id: string;
  wife_father_name: string;
  wife_mother_name: string;
  wife_phone: string;
  wife_email: string;
  wife_address: string;
  wife_occupation: string;
  
  // Marriage Details
  marriage_date: string;
  marriage_certificate_number: string;
  nikah_place: string;
  nikah_imam_name: string;
  
  // Divorce Details
  talaq_type: string;
  reason_for_divorce: string;
  reason_details: string;
  has_reconciliation_attempted: string;
  reconciliation_details: string;
  children_involved: string;
  number_of_children: string;
  children_ages: string;
  custody_arrangement: string;
  financial_settlement: string;
  mahr_returned: string;
  mahr_amount: string;
  
  // Additional
  preferred_date: string;
  preferred_location: string;
  special_requests: string;
  
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
    const nameFields = ['husband_name', 'husband_father_name', 'husband_mother_name', 
                        'wife_name', 'wife_father_name', 'wife_mother_name',
                        'nikah_imam_name'];
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
  { key: 'husband_id_file', label: "Husband's Valid ID", desc: 'National ID or passport of the husband', required: true },
  { key: 'wife_id_file', label: "Wife's Valid ID", desc: 'National ID or passport of the wife', required: true },
  { key: 'additional_documents', label: 'Additional Documents', desc: 'Any court orders, agreements, or other relevant documents', required: false },
];

const initialForm: FormData = {
  husband_name: '', husband_national_id: '', husband_father_name: '', husband_mother_name: '',
  husband_phone: '', husband_email: '', husband_address: '', husband_occupation: '',
  wife_name: '', wife_national_id: '', wife_father_name: '', wife_mother_name: '',
  wife_phone: '', wife_email: '', wife_address: '', wife_occupation: '',
  marriage_date: '', marriage_certificate_number: '', nikah_place: '', nikah_imam_name: '',
  talaq_type: '', reason_for_divorce: '', reason_details: '', has_reconciliation_attempted: '',
  reconciliation_details: '', children_involved: '', number_of_children: '', children_ages: '',
  custody_arrangement: '', financial_settlement: '', mahr_returned: '', mahr_amount: '',
  preferred_date: '', preferred_location: '', special_requests: '',
  marriage_certificate_file: '', husband_id_file: '', wife_id_file: '', additional_documents: '',
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const TalaqApplicationForm = ({ onSuccess, onCancel }: Props) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const onChange = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: // Husband Info
        return form.husband_name && form.husband_national_id && form.husband_phone;
      case 1: // Wife Info
        return form.wife_name && form.wife_national_id && form.wife_phone;
      case 2: // Marriage Details
        return form.marriage_date && form.marriage_certificate_number;
      case 3: // Divorce Details
        return form.talaq_type && form.reason_for_divorce;
      case 4: // Review
        return true;
      case 5: // Documents
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
      const filePath = `talaq-applications/${fileName}`;

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
        application_type: 'talaq',
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) throw error;

      toast({ title: 'Application Submitted', description: 'Your Talaq application has been submitted successfully.' });
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
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-5 h-5 text-red-600" />
                  Husband Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" field="husband_name" required form={form} onChange={onChange} />
                <Field label="National ID" field="husband_national_id" required form={form} onChange={onChange} numeric />
                <Field label="Father's Name" field="husband_father_name" form={form} onChange={onChange} />
                <Field label="Mother's Name" field="husband_mother_name" form={form} onChange={onChange} />
                <Field label="Phone Number" field="husband_phone" required form={form} onChange={onChange} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                <Field label="Email" field="husband_email" type="email" form={form} onChange={onChange} />
                <Field label="Address" field="husband_address" form={form} onChange={onChange} />
                <Field label="Occupation" field="husband_occupation" form={form} onChange={onChange} />
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-5 h-5 text-red-600" />
                  Wife Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" field="wife_name" required form={form} onChange={onChange} />
                <Field label="National ID" field="wife_national_id" required form={form} onChange={onChange} numeric />
                <Field label="Father's Name" field="wife_father_name" form={form} onChange={onChange} />
                <Field label="Mother's Name" field="wife_mother_name" form={form} onChange={onChange} />
                <Field label="Phone Number" field="wife_phone" required form={form} onChange={onChange} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                <Field label="Email" field="wife_email" type="email" form={form} onChange={onChange} />
                <Field label="Address" field="wife_address" form={form} onChange={onChange} />
                <Field label="Occupation" field="wife_occupation" form={form} onChange={onChange} />
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Marriage Information
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
                <Field label="Marriage Certificate Number" field="marriage_certificate_number" required form={form} onChange={onChange} />
                <Field label="Place of Nikah" field="nikah_place" form={form} onChange={onChange} />
                <Field label="Imam Name" field="nikah_imam_name" form={form} onChange={onChange} />
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Scale className="w-5 h-5 text-red-600" />
                  Divorce Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Type of Talaq <span className="text-destructive">*</span></Label>
                  <Select value={form.talaq_type} onValueChange={(value) => onChange('talaq_type', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select type of talaq" />
                    </SelectTrigger>
                    <SelectContent>
                      {TALAQ_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Reason for Divorce <span className="text-destructive">*</span></Label>
                  <Select value={form.reason_for_divorce} onValueChange={(value) => onChange('reason_for_divorce', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select primary reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irreconcilable_differences">Irreconcilable Differences</SelectItem>
                      <SelectItem value="financial_issues">Financial Issues</SelectItem>
                      <SelectItem value="infidelity">Infidelity</SelectItem>
                      <SelectItem value="abuse">Abuse/Violence</SelectItem>
                      <SelectItem value="abandonment">Abandonment</SelectItem>
                      <SelectItem value="incompatibility">Incompatibility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Detailed Reason <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={form.reason_details}
                    onChange={(e) => onChange('reason_details', e.target.value)}
                    placeholder="Please provide detailed explanation of the reason for divorce..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Has reconciliation been attempted?</Label>
                  <Select value={form.has_reconciliation_attempted} onValueChange={(value) => onChange('has_reconciliation_attempted', value)}>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.has_reconciliation_attempted === 'yes' && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm font-medium">Reconciliation Details</Label>
                    <Textarea
                      value={form.reconciliation_details}
                      onChange={(e) => onChange('reconciliation_details', e.target.value)}
                      placeholder="Describe reconciliation attempts..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Children Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm font-medium">Children Involved?</Label>
                      <Select value={form.children_involved} onValueChange={(value) => onChange('children_involved', value)}>
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {form.children_involved === 'yes' && (
                      <>
                        <Field label="Number of Children" field="number_of_children" form={form} onChange={onChange} numeric />
                        <Field label="Children Ages" field="children_ages" form={form} onChange={onChange} />
                        <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                          <Label className="text-sm font-medium">Proposed Custody Arrangement</Label>
                          <Textarea
                            value={form.custody_arrangement}
                            onChange={(e) => onChange('custody_arrangement', e.target.value)}
                            placeholder="Describe proposed custody and visitation arrangement..."
                            className="min-h-[80px]"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Financial Settlement</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm font-medium">Has Mahr (Dowry) been returned?</Label>
                      <Select value={form.mahr_returned} onValueChange={(value) => onChange('mahr_returned', value)}>
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="na">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Field label="Mahr Amount (if applicable)" field="mahr_amount" form={form} onChange={onChange} />
                    <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                      <Label className="text-sm font-medium">Financial Settlement Details</Label>
                      <Textarea
                        value={form.financial_settlement}
                        onChange={(e) => onChange('financial_settlement', e.target.value)}
                        placeholder="Describe any financial agreements or settlements..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Preferred Processing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Preferred Date for Procedure</Label>
                  <Input 
                    type="date" 
                    value={form.preferred_date}
                    onChange={(e) => onChange('preferred_date', e.target.value)}
                    className="h-11 sm:h-10"
                  />
                </div>
                <Field label="Preferred Location" field="preferred_location" form={form} onChange={onChange} />
                <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                  <Label className="text-sm font-medium">Special Requests / Notes</Label>
                  <Textarea
                    value={form.special_requests}
                    onChange={(e) => onChange('special_requests', e.target.value)}
                    placeholder="Any additional information or requests..."
                    className="min-h-[80px]"
                  />
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
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  Review Your Application
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Husband Information</h4>
                    <p><span className="text-gray-500">Name:</span> {form.husband_name}</p>
                    <p><span className="text-gray-500">ID:</span> {form.husband_national_id}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.husband_phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Wife Information</h4>
                    <p><span className="text-gray-500">Name:</span> {form.wife_name}</p>
                    <p><span className="text-gray-500">ID:</span> {form.wife_national_id}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.wife_phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Marriage Details</h4>
                    <p><span className="text-gray-500">Date:</span> {form.marriage_date}</p>
                    <p><span className="text-gray-500">Certificate No:</span> {form.marriage_certificate_number}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Divorce Details</h4>
                    <p><span className="text-gray-500">Type:</span> {form.talaq_type}</p>
                    <p><span className="text-gray-500">Reason:</span> {form.reason_for_divorce}</p>
                    <p><span className="text-gray-500">Children:</span> {form.children_involved === 'yes' ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Important Notice</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        By submitting this application, you confirm that all information provided is accurate and true to the best of your knowledge. 
                        This application will be reviewed by the Islamic Family Affairs department. You may be required to attend counseling sessions 
                        before the Talaq is finalized.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
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
                    <p className="text-xs text-gray-500">Talaq application processing fee</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">10,000 - 30,000 RWF</span>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Talaq (Divorce) Application</h2>
          <span className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        
        {/* Step Labels */}
        <div className="hidden sm:flex justify-between text-xs text-gray-500">
          {STEPS.map((s, i) => (
            <span key={s} className={i === step ? 'text-red-600 font-semibold' : ''}>
              {s}
            </span>
          ))}
        </div>
        
        {/* Mobile Step Label */}
        <div className="sm:hidden text-center text-sm font-medium text-red-600">
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
            className="bg-red-600 hover:bg-red-700 order-1 sm:order-2"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="bg-red-600 hover:bg-red-700 order-1 sm:order-2"
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

export default TalaqApplicationForm;
