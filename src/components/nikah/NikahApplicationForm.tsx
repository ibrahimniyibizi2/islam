import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Send, Loader2, FileCheck, AlertTriangle, Upload, CheckCircle2, CreditCard, Smartphone, User } from 'lucide-react';

const STEPS = ['Groom Info', 'Bride Info', 'Marriage Details', 'Witnesses & Wali', 'Review', 'Documents & Payment'];

const MARITAL_OPTIONS = ['Single (Never Married)', 'Divorced', 'Widowed'];

interface FormData {
  // Groom
  groom_name: string;
  groom_national_id: string;
  groom_father_name: string;
  groom_mother_name: string;
  groom_phone: string;
  groom_email: string;
  groom_address: string;
  groom_marital_status: string;
  // Bride
  bride_name: string;
  bride_national_id: string;
  bride_father_name: string;
  bride_mother_name: string;
  bride_phone: string;
  bride_email: string;
  bride_address: string;
  bride_marital_status: string;
  // Marriage
  preferred_date: string;
  preferred_time: string;
  preferred_masjid: string;
  preferred_imam: string;
  venue_type: string;
  custom_venue_address: string;
  mahr_amount: string;
  mahr_description: string;
  service_tier: string;
  special_requests: string;
  // Witnesses & Wali
  wali_name: string;
  wali_relation: string;
  wali_phone: string;
  wali_national_id: string;
  male_witness_name: string;
  male_witness_phone: string;
  female_witness1_name: string;
  female_witness1_phone: string;
  female_witness2_name: string;
  female_witness2_phone: string;
}

type DocKey = 'hiv_test' | 'groom_id' | 'bride_id' | 'groom_birth_cert' | 'bride_birth_cert' | 'groom_passport_photo' | 'bride_passport_photo';

// Calculate minimum date (14 days from today)
const getMinDate = () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  return minDate.toISOString().split('T')[0];
};

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
    // Capitalize names (fields ending with _name or containing name)
    const nameFields = ['groom_name', 'groom_father_name', 'groom_mother_name', 
                        'bride_name', 'bride_father_name', 'bride_mother_name',
                        'wali_name', 'male_witness_name', 'female_witness1_name', 'female_witness2_name'];
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
          min={type === 'date' ? getMinDate() : undefined}
          className="h-11 sm:h-10 text-base sm:text-sm"
        />
      </div>
    </div>
  );
};

const DOC_CONFIG: { key: DocKey; label: string; desc: string }[] = [
  { key: 'hiv_test', label: 'HIV Test (HV/SIDA)', desc: 'Recent HIV/AIDS test results for both parties (within 3 months)' },
  { key: 'groom_id', label: "Groom's Valid ID", desc: 'National ID card or passport of the groom' },
  { key: 'bride_id', label: "Bride's Valid ID", desc: 'National ID card or passport of the bride' },
  { key: 'groom_birth_cert', label: "Groom's Birth Certificate", desc: 'Certified copy of groom birth certificate' },
  { key: 'bride_birth_cert', label: "Bride's Birth Certificate", desc: 'Certified copy of bride birth certificate' },
  { key: 'groom_passport_photo', label: "Groom's Passport Photos", desc: '2 recent passport-size photographs' },
  { key: 'bride_passport_photo', label: "Bride's Passport Photos", desc: '2 recent passport-size photographs' },
];

const initialForm: FormData = {
  groom_name: '', groom_national_id: '', groom_father_name: '', groom_mother_name: '',
  groom_phone: '', groom_email: '', groom_address: '', groom_marital_status: '',
  bride_name: '', bride_national_id: '', bride_father_name: '', bride_mother_name: '',
  bride_phone: '', bride_email: '', bride_address: '', bride_marital_status: '',
  preferred_date: '', preferred_time: '', preferred_masjid: '', preferred_imam: '',
  venue_type: 'masjid', custom_venue_address: '', mahr_amount: '', mahr_description: '',
  service_tier: 'standard', special_requests: '',
  wali_name: '', wali_relation: '', wali_phone: '', wali_national_id: '',
  male_witness_name: '', male_witness_phone: '',
  female_witness1_name: '', female_witness1_phone: '',
  female_witness2_name: '', female_witness2_phone: '',
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NikahApplicationForm({ onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [docFiles, setDocFiles] = useState<Record<DocKey, File | null>>({
    hiv_test: null, groom_id: null, bride_id: null,
    groom_birth_cert: null, bride_birth_cert: null,
    groom_passport_photo: null, bride_passport_photo: null,
  });
  const [docPreviews, setDocPreviews] = useState<Record<DocKey, string | null>>({
    hiv_test: null, groom_id: null, bride_id: null,
    groom_birth_cert: null, bride_birth_cert: null,
    groom_passport_photo: null, bride_passport_photo: null,
  });
  const [uploading, setUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [mosques, setMosques] = useState<{ id: string; name: string }[]>([]);

  // Load mosques on mount
  useEffect(() => {
    supabase.from('mosques').select('id, name').eq('status', 'active').then(({ data }) => {
      if (data) setMosques(data);
    });
  }, []);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const setSelect = (field: keyof FormData) => (val: string) =>
    setForm(p => ({ ...p, [field]: val }));

  const allDocsUploaded = Object.values(docFiles).every(f => f !== null);
  const paymentReady = paymentMethod === 'visa' || (paymentMethod && paymentPhone.trim().length >= 10);
  const canSubmit = allDocsUploaded && paymentReady;

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.groom_name.trim() || !form.groom_national_id.trim() || !form.groom_phone.trim()) {
        toast({ title: 'Missing fields', description: 'Groom name, national ID and phone are required.', variant: 'destructive' });
        return false;
      }
    }
    if (step === 1) {
      if (!form.bride_name.trim() || !form.bride_national_id.trim() || !form.bride_phone.trim()) {
        toast({ title: 'Missing fields', description: 'Bride name, national ID and phone are required.', variant: 'destructive' });
        return false;
      }
    }
    if (step === 2) {
      if (!form.preferred_date) {
        toast({ title: 'Missing fields', description: 'Preferred date is required.', variant: 'destructive' });
        return false;
      }
    }
    if (step === 3) {
      if (!form.wali_name.trim() || !form.male_witness_name.trim() || !form.female_witness1_name.trim()) {
        toast({ title: 'Missing fields', description: 'Wali, male witness, and at least one female witness are required.', variant: 'destructive' });
        return false;
      }
    }
    if (step === 5) {
      if (!allDocsUploaded) {
        toast({ title: 'Documents Required', description: 'Please upload all required documents.', variant: 'destructive' });
        return false;
      }
      if (!paymentReady) {
        toast({ title: 'Payment Required', description: 'Please select a payment method and provide details.', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);
    setUploading(true);

    try {
      // Upload documents to Supabase Storage
      const docUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(docFiles)) {
        if (!file) continue;
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${key}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('nikah-documents')
          .upload(path, file);
        if (uploadError) throw new Error(`Failed to upload ${key}: ${uploadError.message}`);
        docUrls[key] = path;
      }
      setUploading(false);

      // Insert application with document URLs
      const { data: insertedData, error } = await supabase.from('nikah_applications').insert({
        user_id: user.id,
        groom_name: form.groom_name.trim(),
        groom_national_id: form.groom_national_id.trim(),
        groom_father_name: form.groom_father_name.trim() || null,
        groom_mother_name: form.groom_mother_name.trim() || null,
        groom_phone: form.groom_phone.trim() || null,
        groom_email: form.groom_email.trim() || null,
        groom_address: form.groom_address.trim() || null,
        groom_marital_status: form.groom_marital_status || null,
        bride_name: form.bride_name.trim(),
        bride_national_id: form.bride_national_id.trim() || null,
        bride_father_name: form.bride_father_name.trim() || null,
        bride_mother_name: form.bride_mother_name.trim() || null,
        bride_phone: form.bride_phone.trim() || null,
        bride_email: form.bride_email.trim() || null,
        bride_address: form.bride_address.trim() || null,
        bride_marital_status: form.bride_marital_status || null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        preferred_masjid: form.preferred_masjid || null,
        preferred_imam: form.preferred_imam || null,
        venue_type: form.venue_type || null,
        custom_venue_address: form.venue_type === 'custom' ? form.custom_venue_address.trim() : null,
        mahr_amount: form.mahr_amount ? parseFloat(form.mahr_amount) : null,
        mahr_description: form.mahr_description.trim() || null,
        service_tier: form.service_tier,
        special_requests: form.special_requests.trim() || null,
        wali_name: form.wali_name.trim() || null,
        wali_relation: form.wali_relation.trim() || null,
        wali_phone: form.wali_phone.trim() || null,
        wali_national_id: form.wali_national_id.trim() || null,
        male_witness_name: form.male_witness_name.trim() || null,
        male_witness_phone: form.male_witness_phone.trim() || null,
        female_witness1_name: form.female_witness1_name.trim() || null,
        female_witness1_phone: form.female_witness1_phone.trim() || null,
        female_witness2_name: form.female_witness2_name.trim() || null,
        female_witness2_phone: form.female_witness2_phone.trim() || null,
        // Document URLs
        hiv_test_url: docUrls.hiv_test || null,
        groom_id_document_url: docUrls.groom_id || null,
        bride_id_document_url: docUrls.bride_id || null,
        groom_birth_cert_url: docUrls.groom_birth_cert || null,
        bride_birth_cert_url: docUrls.bride_birth_cert || null,
        groom_passport_photo_url: docUrls.groom_passport_photo || null,
        bride_passport_photo_url: docUrls.bride_passport_photo || null,
        // Payment info
        payment_method: paymentMethod,
        payment_status: 'pending',
      } as any).select().single();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Application Submitted', description: 'Your nikah application and documents have been submitted successfully.' });

        // Send SMS notifications
        try {
          await supabase.functions.invoke('send-nikah-sms', {
            body: {
              reference_number: insertedData?.reference_number || insertedData?.id,
              groom_name: form.groom_name.trim(),
              groom_phone: form.groom_phone.trim(),
              bride_name: form.bride_name.trim(),
              bride_phone: form.bride_phone.trim(),
              preferred_date: form.preferred_date,
            },
          });
        } catch (smsErr) { console.error('SMS failed:', smsErr); }

        // Send email notifications
        try {
          await supabase.functions.invoke('send-nikah-email', {
            body: {
              reference_number: insertedData?.reference_number || insertedData?.id,
              groom_name: form.groom_name.trim(),
              groom_email: form.groom_email.trim(),
              bride_name: form.bride_name.trim(),
              bride_email: form.bride_email.trim(),
              preferred_date: form.preferred_date,
            },
          });
        } catch (emailErr) { console.error('Email failed:', emailErr); }

        onSuccess();
      }
    } catch (uploadErr: any) {
      toast({ title: 'Upload Error', description: uploadErr.message, variant: 'destructive' });
    }
    setSubmitting(false);
    setUploading(false);
  };

  const ReviewRow = ({ label, value }: { label: string; value: string }) => value ? (
    <div className="flex justify-between py-1 border-b border-border/50 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  ) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1 min-w-[60px]">
            <div className={`flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full text-sm sm:text-xs font-semibold shrink-0 ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </div>
            <span className={`text-xs hidden sm:block truncate ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 min-w-[20px] ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Groom */}
      {step === 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6"><CardTitle className="text-base sm:text-lg">Groom Information</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2 px-4 sm:px-6">
            <Field label="Full Name" field="groom_name" required placeholder="As on national ID" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-blue-500 shrink-0" />} />
            <Field label="National ID Number" field="groom_national_id" required placeholder="16 digits" form={form} onChange={handleFieldChange} numeric icon={<CreditCard className="w-4 h-4 text-blue-500 shrink-0" />} />
            <Field label="Father's Name" field="groom_father_name" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-blue-400 shrink-0" />} />
            <Field label="Mother's Name" field="groom_mother_name" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-pink-400 shrink-0" />} />
            <Field label="Phone" field="groom_phone" type="tel" required placeholder="07XXXXXXXX" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-blue-500 shrink-0" />} />
            <Field label="Email" field="groom_email" type="email" form={form} onChange={handleFieldChange} />
            <Field label="Address / District" field="groom_address" form={form} onChange={handleFieldChange} />
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Marital Status</Label>
              <Select value={form.groom_marital_status} onValueChange={setSelect('groom_marital_status')}>
                <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MARITAL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Bride */}
      {step === 1 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6"><CardTitle className="text-base sm:text-lg">Bride Information</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2 px-4 sm:px-6">
            <Field label="Full Name" field="bride_name" required placeholder="As on national ID" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-pink-500 shrink-0" />} />
            <Field label="National ID Number" field="bride_national_id" required placeholder="16 digits" form={form} onChange={handleFieldChange} numeric icon={<CreditCard className="w-4 h-4 text-pink-500 shrink-0" />} />
            <Field label="Father's Name" field="bride_father_name" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-blue-400 shrink-0" />} />
            <Field label="Mother's Name" field="bride_mother_name" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-pink-400 shrink-0" />} />
            <Field label="Phone" field="bride_phone" type="tel" required placeholder="07XXXXXXXX" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-pink-500 shrink-0" />} />
            <Field label="Email" field="bride_email" type="email" form={form} onChange={handleFieldChange} />
            <Field label="Address / District" field="bride_address" form={form} onChange={handleFieldChange} />
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Marital Status</Label>
              <Select value={form.bride_marital_status} onValueChange={setSelect('bride_marital_status')}>
                <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MARITAL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Marriage Details */}
      {step === 2 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6"><CardTitle className="text-base sm:text-lg">Marriage Details & Booking</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 sm:grid-cols-2 px-4 sm:px-6">
            <Field label="Preferred Date" field="preferred_date" type="date" required form={form} onChange={handleFieldChange} />
            <Field label="Preferred Time" field="preferred_time" type="time" form={form} onChange={handleFieldChange} />
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Preferred Masjid</Label>
              <Select value={form.preferred_masjid} onValueChange={setSelect('preferred_masjid')}>
                <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="Select a masjid" /></SelectTrigger>
                <SelectContent>
                  {mosques.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Preferred Imam / Sheikh" field="preferred_imam" placeholder="Optional" form={form} onChange={handleFieldChange} />
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Venue Type</Label>
              <Select value={form.venue_type} onValueChange={setSelect('venue_type')}>
                <SelectTrigger className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masjid">At Masjid</SelectItem>
                  <SelectItem value="custom">Custom Venue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.venue_type === 'custom' && <Field label="Custom Venue Address" field="custom_venue_address" form={form} onChange={handleFieldChange} />}
            <Field label="Mahr Amount (RWF)" field="mahr_amount" type="number" placeholder="e.g. 1000000" form={form} onChange={handleFieldChange} />
            <Field label="Mahr Description" field="mahr_description" placeholder="e.g. Cash + Gold ring" form={form} onChange={handleFieldChange} />
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Service Tier</Label>
              <Select value={form.service_tier} onValueChange={setSelect('service_tier')}>
                <SelectTrigger className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-medium">Special Requests</Label>
              <Textarea 
                value={form.special_requests} 
                onChange={(e) => handleFieldChange('special_requests', e.target.value)} 
                placeholder="Any special requirements..." 
                className="min-h-[80px] sm:min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Witnesses & Wali */}
      {step === 3 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6"><CardTitle className="text-base sm:text-lg">Witnesses & Wali (Guardian)</CardTitle></CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">Bride's Wali (Guardian)</h4>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <Field label="Wali Full Name" field="wali_name" required form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-blue-500 shrink-0" />} />
                <Field label="Relation to Bride" field="wali_relation" placeholder="e.g. Father" form={form} onChange={handleFieldChange} />
                <Field label="Phone" field="wali_phone" type="tel" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-blue-400 shrink-0" />} />
                <Field label="National ID" field="wali_national_id" form={form} onChange={handleFieldChange} numeric icon={<CreditCard className="w-4 h-4 text-blue-400 shrink-0" />} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">Male Witness</h4>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <Field label="Full Name" field="male_witness_name" required form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-blue-500 shrink-0" />} />
                <Field label="Phone" field="male_witness_phone" type="tel" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-blue-400 shrink-0" />} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">Female Witnesses</h4>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <Field label="Witness 1 Name" field="female_witness1_name" required form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-pink-500 shrink-0" />} />
                <Field label="Witness 1 Phone" field="female_witness1_phone" type="tel" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-pink-400 shrink-0" />} />
                <Field label="Witness 2 Name" field="female_witness2_name" form={form} onChange={handleFieldChange} icon={<User className="w-4 h-4 text-pink-400 shrink-0" />} />
                <Field label="Witness 2 Phone" field="female_witness2_phone" type="tel" form={form} onChange={handleFieldChange} numeric icon={<Smartphone className="w-4 h-4 text-pink-300 shrink-0" />} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6"><CardTitle className="text-base sm:text-lg">Review Your Application</CardTitle></CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Groom</h4>
              <ReviewRow label="Name" value={form.groom_name} />
              <ReviewRow label="National ID" value={form.groom_national_id} />
              <ReviewRow label="Father" value={form.groom_father_name} />
              <ReviewRow label="Mother" value={form.groom_mother_name} />
              <ReviewRow label="Phone" value={form.groom_phone} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Bride</h4>
              <ReviewRow label="Name" value={form.bride_name} />
              <ReviewRow label="National ID" value={form.bride_national_id} />
              <ReviewRow label="Father" value={form.bride_father_name} />
              <ReviewRow label="Mother" value={form.bride_mother_name} />
              <ReviewRow label="Phone" value={form.bride_phone} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Marriage Details</h4>
              <ReviewRow label="Date" value={form.preferred_date} />
              <ReviewRow label="Time" value={form.preferred_time} />
              <ReviewRow label="Masjid" value={form.preferred_masjid} />
              <ReviewRow label="Imam" value={form.preferred_imam} />
              <ReviewRow label="Mahr" value={form.mahr_amount ? `${Number(form.mahr_amount).toLocaleString()} RWF` : ''} />
              <ReviewRow label="Venue" value={form.venue_type === 'custom' ? form.custom_venue_address : 'At Masjid'} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary mb-2">Witnesses</h4>
              <ReviewRow label="Wali" value={`${form.wali_name}${form.wali_relation ? ` (${form.wali_relation})` : ''}`} />
              <ReviewRow label="Male Witness" value={form.male_witness_name} />
              <ReviewRow label="Female Witness 1" value={form.female_witness1_name} />
              <ReviewRow label="Female Witness 2" value={form.female_witness2_name} />
            </div>
           </CardContent>
        </Card>
      )}

      {/* Step 5: Required Documents & Payment */}
      {step === 5 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" /> Required Documents & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">
                  Please confirm that all required documents listed below are prepared and ready for submission. These documents must be presented at the time of the Nikah ceremony.
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {DOC_CONFIG.map(doc => (
                <div
                  key={doc.key}
                  className={`rounded-lg border p-3 sm:p-4 transition-colors ${docFiles[doc.key] ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {docFiles[doc.key] ? (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {doc.label} <span className="text-destructive">*</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                      {docPreviews[doc.key] && (
                        <img 
                          src={docPreviews[doc.key]!} 
                          alt={doc.label}
                          className="w-16 h-16 object-cover rounded mt-2 border"
                        />
                      )}
                    </div>
                    <label className="shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            toast({ title: 'Invalid file', description: 'Only images are allowed.', variant: 'destructive' });
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast({ title: 'File too large', description: 'Maximum file size is 5MB.', variant: 'destructive' });
                            return;
                          }
                          setDocFiles(p => ({ ...p, [doc.key]: file }));
                          setDocPreviews(p => ({ ...p, [doc.key]: URL.createObjectURL(file) }));
                        }}
                      />
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        {docFiles[doc.key] ? 'Replace' : 'Upload'}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Uploaded:</span>
              <span className="font-medium text-foreground">
                {Object.values(docFiles).filter(Boolean).length} / {DOC_CONFIG.length}
              </span>
              {allDocsUploaded && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Payment Method <span className="text-destructive">*</span></Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { value: 'mtn_momo', label: 'MTN MoMo', icon: Smartphone, color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700' },
                  { value: 'airtel_money', label: 'Airtel Money', icon: Smartphone, color: 'bg-red-500/10 border-red-500/30 text-red-700' },
                  { value: 'visa', label: 'Visa / Mastercard', icon: CreditCard, color: 'bg-blue-500/10 border-blue-500/30 text-blue-700' },
                ].map(pm => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-2.5 sm:p-3 text-left transition-all ${
                      paymentMethod === pm.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className={`rounded-full p-1.5 ${pm.color}`}>
                      <pm.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Money Phone Number */}
            {(paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-medium">
                  {paymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'} Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder={paymentMethod === 'mtn_momo' ? '078XXXXXXX' : '073XXXXXXX'}
                  className="h-11 sm:h-10"
                />
                <p className="text-xs text-muted-foreground">
                  You will receive a USSD prompt on this number to confirm payment.
                </p>
              </div>
            )}

            {/* Visa info */}
            {paymentMethod === 'visa' && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to a secure payment page after submission.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/50 p-3 sm:p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Payment Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Tier</span>
                <span className="font-medium text-foreground capitalize">{form.service_tier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Venue</span>
                <span className="font-medium text-foreground">{form.venue_type === 'custom' ? 'Custom Venue' : 'At Masjid'}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-primary text-base sm:text-lg">{form.service_tier === 'premium' ? '100,000' : '50,000'} RWF</span>
              </div>
            </div>

            {!allDocsUploaded && (
              <p className="text-xs text-destructive font-medium">
                ✦ Please upload all required documents before submitting.
              </p>
            )}
            {!paymentMethod && (
              <p className="text-xs text-destructive font-medium">
                ✦ Please select a payment method to proceed.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 sm:pt-4 gap-3">
        <Button 
          variant="outline" 
          onClick={step === 0 ? onCancel : prev}
          className="h-11 sm:h-10 px-4 sm:px-3"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />{step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button 
            onClick={next}
            className="h-11 sm:h-10 px-4 sm:px-3"
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={submit} 
            disabled={submitting || !canSubmit}
            className="h-11 sm:h-10 px-4 sm:px-3"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {uploading ? 'Uploading...' : 'Submitting...'}
              </>
            ) : (
              <><Send className="mr-1 h-4 w-4" /> Submit & Pay {form.service_tier === 'premium' ? '100,000' : '50,000'} RWF</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
