import { useState, useRef, useEffect } from 'react';
import { FileText, ArrowRight, X, Loader2, RefreshCw, User, Phone, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

interface ApplicationData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface TrackApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'input' | 'preview' | 'phone' | 'otp' | 'success';

export function TrackApplicationModal({ isOpen, onClose }: TrackApplicationModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [applicationId, setApplicationId] = useState('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { toast } = useToast();
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('input');
        setApplicationId('');
        setApplicationData(null);
        setPhone('');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(30);
      }, 300);
    }
  }, [isOpen]);

  // Validate application ID format
  const isValidApplicationId = (id: string) => {
    return /^[A-Z0-9]{6,20}$/i.test(id.trim());
  };

  // Validate Rwanda phone number
  const isValidRwandaPhone = (phone: string) => {
    const rwandaRegex = /^(\+250|0)?[7][2-9]\d{7}$/;
    return rwandaRegex.test(phone.replace(/\s/g, ''));
  };

  // Mask phone number for display
  const maskPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) return phone;
    return cleaned.slice(0, 4) + '****' + cleaned.slice(-3);
  };

  // Step 1: Fetch application data
  const handleFetchApplication = async () => {
    if (!isValidApplicationId(applicationId)) {
      toast({ 
        title: 'Invalid Application ID', 
        description: 'Please enter a valid application ID (6-20 alphanumeric characters)', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: applicationId.trim() }),
      });

      const data = await response.json();

      if (data.success && data.application) {
        setApplicationData(data.application);
        setStep('preview');
      } else {
        toast({ 
          title: 'Application Not Found', 
          description: 'No application found with this ID. Please check and try again.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch application data. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm identity and go to phone verification
  const handleConfirmIdentity = () => {
    setStep('phone');
  };

  // Step 3: Send OTP
  const handleSendOTP = async () => {
    if (!isValidRwandaPhone(phone)) {
      toast({ 
        title: 'Invalid Phone Number', 
        description: 'Please enter a valid Rwanda phone number (e.g., +250 788 123 456)', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: phone.replace(/\s/g, ''),
          applicationId: applicationId.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ 
          title: 'OTP Sent!', 
          description: `Code sent to ${maskPhone(phone)}` 
        });
        setStep('otp');
        startResendTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to send OTP', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 4: Verify OTP
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast({ title: 'Error', description: 'Please enter all 6 digits', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: phone.replace(/\s/g, ''), 
          otp: otpString,
          applicationId: applicationId.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success!', description: 'Access granted. Redirecting...' });
        
        if (data.token) {
          sessionStorage.setItem('track_token', data.token);
          sessionStorage.setItem('track_application_id', applicationId.trim());
        }
        
        setStep('success');
        
        setTimeout(() => {
          window.location.href = `/track/${applicationId.trim()}`;
        }, 1500);
      } else {
        toast({ 
          title: 'Invalid OTP', 
          description: data.message || 'Please check your code and try again.', 
          variant: 'destructive' 
        });
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      handleSendOTP();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {step === 'success' ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {step === 'input' && 'Track Application'}
                  {step === 'preview' && 'Confirm Identity'}
                  {step === 'phone' && 'Phone Verification'}
                  {step === 'otp' && 'Enter OTP'}
                  {step === 'success' && 'Access Granted'}
                </h3>
                <p className="text-sm text-white/80">
                  {step === 'input' && 'Enter your application ID'}
                  {step === 'preview' && 'Verify this is your application'}
                  {step === 'phone' && 'Enter phone number used during application'}
                  {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
                  {step === 'success' && 'Redirecting to your application...'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Input Application ID */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-id" className="text-emerald-900">
                  Application ID or Document Code
                </Label>
                <Input
                  id="app-id"
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                  placeholder="e.g., APP123456"
                  className="mt-2 bg-white border-emerald-200"
                  disabled={loading}
                />
                <p className="text-xs text-emerald-600 mt-2">
                  Enter the application ID provided when you submitted your application
                </p>
              </div>

              <Button
                onClick={handleFetchApplication}
                disabled={loading || !applicationId.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Preview Application Data */}
          {step === 'preview' && applicationData && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {applicationData.firstName} {applicationData.lastName}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Application #{applicationData.id}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium capitalize ${
                      applicationData.status === 'approved' ? 'text-emerald-600' :
                      applicationData.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {applicationData.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="text-gray-900">
                      {new Date(applicationData.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Is this your application? Click continue to verify your identity.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="flex-1"
                >
                  No, Go Back
                </Button>
                <Button
                  onClick={handleConfirmIdentity}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  Yes, Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Phone Verification */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4 text-emerald-700">
                <Shield className="w-5 h-5" />
                <p className="text-sm">For security, we need to verify your phone number</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-emerald-900">
                  Phone Number (Rwanda)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 123 456"
                  className="mt-2 bg-white border-emerald-200"
                  disabled={loading}
                />
                <p className="text-xs text-emerald-600 mt-2">
                  Enter the phone number you used during application
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading || !phone.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>

              <button
                onClick={() => setStep('preview')}
                className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Enter the 6-digit code sent to <strong>{maskPhone(phone)}</strong>
              </p>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={loading}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Access'
                )}
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center justify-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep('phone')}
                className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
              >
                ← Back to phone
              </button>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Verified!</h3>
              <p className="text-gray-600">Redirecting to your application...</p>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-emerald-600" />
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-center gap-2">
            {['input', 'preview', 'phone', 'otp'].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  ['input', 'preview', 'phone', 'otp', 'success'].indexOf(step) >= i
                    ? 'bg-emerald-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
