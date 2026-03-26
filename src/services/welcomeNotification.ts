import { supabase } from '@/integrations/supabase/client';

export interface WelcomeNotificationData {
  email?: string;
  phone?: string;
  name?: string;
}

/**
 * Send welcome email and SMS after successful login
 */
export async function sendWelcomeNotification(data: WelcomeNotificationData): Promise<{ error: Error | null }> {
  try {
    console.log('Sending welcome notification:', data);
    
    // Call Supabase Edge Function to send welcome email/SMS
    const { error } = await supabase.functions.invoke('welcome-notification', {
      body: {
        email: data.email,
        phone: data.phone,
        name: data.name || 'User',
        type: 'login',
      },
    });

    if (error) {
      console.error('Welcome notification error:', error);
      return { error: new Error(error.message) };
    }

    console.log('Welcome notification sent successfully');
    return { error: null };
  } catch (err) {
    console.error('Failed to send welcome notification:', err);
    return { error: err as Error };
  }
}

/**
 * Check if user has been welcomed today (to avoid spam)
 */
export function shouldSendWelcome(): boolean {
  const lastWelcome = localStorage.getItem('lastWelcomeDate');
  const today = new Date().toDateString();
  
  if (lastWelcome === today) {
    return false; // Already sent today
  }
  
  localStorage.setItem('lastWelcomeDate', today);
  return true;
}
