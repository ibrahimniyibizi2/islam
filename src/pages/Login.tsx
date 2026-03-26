import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeNotification, shouldSendWelcome } from '@/services/welcomeNotification';
import { Home } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect if input is phone or email
  const isPhone = /^[0-9+\-()\s]{7,20}$/.test(identifier.replace(/\s/g, ''));
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Use phone or email based on detection
    const emailToUse = isPhone ? `${identifier}@phone.local` : identifier;
    const { error } = await signIn(emailToUse, password);
    
    setIsLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      // Send welcome notification
      if (shouldSendWelcome()) {
        const { error: notifError } = await sendWelcomeNotification({
          email: isEmail ? identifier : undefined,
          phone: isPhone ? identifier : undefined,
        });
        
        if (!notifError) {
          toast({ 
            title: 'Welcome back!', 
            description: 'A welcome message has been sent to your email/SMS.',
          });
        }
      }
      
      setTimeout(() => navigate(getDashboardPath()), 500);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('/hero-mosque.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50" />
      <Card className="w-full max-w-md shadow-primary relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center relative">
          <Link to="/" className="absolute left-4 top-4 p-2 rounded-full hover:bg-emerald-50 transition-colors text-emerald-600">
            <Home className="w-5 h-5" />
          </Link>
          <CardTitle className="text-2xl text-emerald-900">Welcome Back</CardTitle>
          <CardDescription className="text-emerald-700">Sign in to IslamRwanda</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-900">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-white border-emerald-200" />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-emerald-800">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
