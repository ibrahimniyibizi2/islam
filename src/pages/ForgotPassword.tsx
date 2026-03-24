import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  // Detect if input is phone or email
  const isPhone = /^[0-9+\-()\s]{7,20}$/.test(identifier.replace(/\s/g, ''));
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Use phone or email based on detection
    const emailToUse = isPhone ? `${identifier}@phone.local` : identifier;
    const { error } = await resetPassword(emailToUse);
    
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setIsSent(true);
      toast({ 
        title: isPhone ? 'SMS sent' : 'Email sent', 
        description: isPhone 
          ? 'Check your phone for password reset instructions.' 
          : 'Check your inbox for password reset instructions.' 
      });
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('/src/assets/hero-mosque.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md shadow-primary relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-emerald-900">Reset Password</CardTitle>
          <CardDescription className="text-emerald-700">
            {isSent 
              ? 'Check your email or phone' 
              : 'Enter your email or phone to receive reset instructions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-emerald-900">
                  {isPhone ? 'Phone Number' : isEmail ? 'Email' : 'Email or Phone'}
                </Label>
                <Input 
                  id="identifier" 
                  type="text" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  required 
                  placeholder="email@example.com or +250 78..." 
                  className="bg-white border-emerald-200" 
                />
                <p className="text-xs text-emerald-600">
                  {isPhone ? 'Phone number format detected' : isEmail ? 'Email format detected' : 'Enter your email or phone number'}
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-emerald-800 mb-4">
                We've sent password reset instructions to your {isPhone ? 'phone' : 'email'}.
              </p>
              <Button 
                onClick={() => setIsSent(false)} 
                variant="outline" 
                className="border-emerald-200 text-emerald-700"
              >
                Send again
              </Button>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-emerald-800">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
