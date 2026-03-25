import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Rwanda phone validation: +250 7XX XXX XXX or 07XX XXX XXX
  const isValidRwandaPhone = (phone: string) => {
    const rwandaRegex = /^(\+250|0)?[7][2-9]\d{7}$/;
    return rwandaRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      toast({ title: 'Password mismatch', description: 'Passwords do not match. Please try again.', variant: 'destructive' });
      return;
    }
    
    // Validate Rwanda phone number
    if (!isValidRwandaPhone(phone)) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid Rwanda phone number (e.g., +250 788 123 456 or 0788 123 456)', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(email, password, name, phone);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created', description: 'Please check your email for a verification link.' });
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-emerald-900">Create Account</CardTitle>
          <CardDescription className="text-emerald-700">Join IslamRwanda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-emerald-900">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="bg-white border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-900">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-white border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-emerald-900">Phone Number (Rwanda)</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                placeholder="+250 788 123 456" 
                pattern="^(\+250|0)?[7][2-9]\d{7}$"
                maxLength={16}
                className="bg-white border-emerald-200" 
              />
              <p className="text-xs text-emerald-600">Format: +250 7XX XXX XXX (e.g., +250 788 123 456)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-900">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="bg-white border-emerald-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-emerald-900">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="bg-white border-emerald-200" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-emerald-800">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
