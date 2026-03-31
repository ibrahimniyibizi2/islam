import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TestNotificationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [phone, setPhone] = useState('0796125538');
  const [email, setEmail] = useState('ibrahimniyibizi2@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSMS = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in first to test SMS.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult('');
    try {
      console.log('Testing SMS to:', phone);
      console.log('Current user:', user?.email);
      
      const { data, error } = await supabase.functions.invoke('send-status-sms', {
        body: {
          phone: phone,
          name: 'Test User',
          application_id: 'TEST-123',
          status: 'approved',
          type: 'nikah',
        },
      });

      console.log('SMS test result:', { data, error });

      if (error) {
        throw error;
      }

      setResult(JSON.stringify(data, null, 2));
      toast({
        title: 'SMS Test Sent',
        description: `SMS sent to ${phone}. Check your phone.`,
      });
    } catch (err: any) {
      console.error('SMS test failed:', err);
      setResult(`Error: ${err.message}`);
      toast({
        title: 'SMS Test Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in first to test email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult('');
    try {
      console.log('Testing email to:', email);
      console.log('Current user:', user?.email);
      
      const { data, error } = await supabase.functions.invoke('send-status-email', {
        body: {
          email: email,
          name: 'Test User',
          application_id: 'TEST-123',
          status: 'approved',
          type: 'nikah',
        },
      });

      console.log('Email test result:', { data, error });

      if (error) {
        throw error;
      }

      setResult(JSON.stringify(data, null, 2));
      toast({
        title: 'Email Test Sent',
        description: `Email sent to ${email}. Check your inbox.`,
      });
    } catch (err: any) {
      console.error('Email test failed:', err);
      setResult(`Error: ${err.message}`);
      toast({
        title: 'Email Test Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testNikahSMS = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in first to test SMS.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult('');
    try {
      console.log('Testing Nikah SMS to:', phone);
      console.log('Current user:', user?.email);
      
      const { data, error } = await supabase.functions.invoke('send-nikah-sms', {
        body: {
          reference_number: 'NIKAH-TEST-123',
          groom_name: 'Test Groom',
          groom_phone: phone,
          bride_name: 'Test Bride',
          bride_phone: phone,
          preferred_date: '2024-12-25',
        },
      });

      console.log('Nikah SMS test result:', { data, error });

      if (error) {
        throw error;
      }

      setResult(JSON.stringify(data, null, 2));
      toast({
        title: 'Nikah SMS Test Sent',
        description: `SMS sent to ${phone}. Check your phone.`,
      });
    } catch (err: any) {
      console.error('Nikah SMS test failed:', err);
      setResult(`Error: ${err.message}`);
      toast({
        title: 'Nikah SMS Test Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-6">Test SMS & Email Notifications</h1>
      
      {/* Login Status */}
      <Card className={`mb-6 ${user ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`font-medium ${user ? 'text-green-800' : 'text-red-800'}`}>
              {user ? `Logged in as: ${user.email}` : 'Not logged in - Please log in first'}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <div className="flex gap-2">
              <Phone className="w-5 h-5 text-gray-400 mt-2" />
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0796125538"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <div className="flex gap-2">
              <Mail className="w-5 h-5 text-gray-400 mt-2" />
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ibrahimniyibizi2@gmail.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button 
          onClick={testSMS} 
          disabled={loading}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          Test Status SMS
        </Button>
        
        <Button 
          onClick={testEmail} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Test Status Email
        </Button>
        
        <Button 
          onClick={testNikahSMS} 
          disabled={loading}
          variant="secondary"
          className="w-full"
        >
          <Phone className="w-4 h-4 mr-2" />
          Test Nikah SMS
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debugging Tips:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Check browser console (F12) for detailed logs</li>
          <li>Verify PINDO_API_TOKEN is set in Supabase Edge Function secrets</li>
          <li>Check Supabase function logs in dashboard</li>
          <li>Ensure phone number format is correct (079... or +250...)</li>
        </ul>
      </div>
    </div>
  );
}
