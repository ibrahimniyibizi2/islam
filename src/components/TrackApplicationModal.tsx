import { useState } from 'react';
import { FileText, ArrowRight, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

interface TrackApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackApplicationModal({ isOpen, onClose }: TrackApplicationModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [value, setValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { toast } = useToast();

  // Detect if input is phone or application code
  const isPhone = /^[0-9+\-()\s]{7,20}$/.test(value.replace(/\s/g, ''));
  const isApplicationCode = /^[A-Z0-9]{6,20}$/i.test(value);

  const handleSendOTP = async () => {
    if (!value.trim()) {
      toast({ title: 'Error', description: 'Please enter your phone number or application code', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      // Call Supabase Edge Function to send OTP
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: value.trim(),
          type: isPhone ? 'phone' : 'code'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ 
          title: 'OTP Sent!', 
          description: `Check your ${isPhone ? 'SMS' : 'email'} for the verification code.` 
        });
        setStep('otp');
        startResendTimer();
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to send OTP', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a valid 6-digit OTP', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      // Call Supabase Edge Function to verify OTP
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: value.trim(), otp }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Success!', description: 'Access granted. Redirecting...' });
        
        // Store temporary access token
        if (data.token) {
          sessionStorage.setItem('track_token', data.token);
        }
        
        // Redirect to track page
        setTimeout(() => {
          window.location.href = `/track/${data.applicationId || value}`;
        }, 1000);
      } else {
        toast({ title: 'Invalid OTP', description: 'Please check your code and try again.', variant: 'destructive' });
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
    // Reset state after animation
    setTimeout(() => {
      setStep('input');
      setValue('');
      setOtp('');
      setResendTimer(30);
    }, 300);
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
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Track Application</h3>
                <p className="text-sm text-white/80">
                  {step === 'input' ? 'Enter your details to continue' : 'Verify your identity'}
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
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="track-input" className="text-emerald-900">
                  Phone Number or Application Code
                </Label>
                <Input
                  id="track-input"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g., +250 788 123 456 or APP123"
                  className="mt-2 bg-white border-emerald-200"
                  disabled={loading}
                />
                <p className="text-xs text-emerald-600 mt-2">
                  {isPhone ? 'Phone number detected' : isApplicationCode ? 'Application code detected' : 'Enter phone number or application code'}
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading || !value.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp-input" className="text-emerald-900">
                  Enter 6-digit OTP
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  We sent a code to {isPhone ? 'your phone' : 'your email'}
                </p>
                <Input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="mt-2 bg-white border-emerald-200 text-center text-2xl tracking-widest"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
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
                    Resend OTP in {resendTimer}s
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
                onClick={() => setStep('input')}
                className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
              >
                ← Back to input
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
