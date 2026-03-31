// Example: How to call the email function after admin approval
// This should be added to your admin approval logic

import { supabase } from '@/integrations/supabase/client';

// Function to handle status update and trigger email + WhatsApp
export const handleShahadaApproval = async (applicationId: string, newStatus: string, applicationData?: any) => {
  try {
    // 1. Update the application status
    const { data, error } = await supabase
      .from('shahada_applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select();

    if (error) {
      throw error;
    }

    console.log('Application status updated:', data);
    
    // Get application data for notifications
    const appData = data?.[0] || applicationData;

    // 2. If status is "completed", send certificate notifications
    if (newStatus === 'completed' && appData) {
      console.log('Status is completed, sending notifications...');
      
      // Send Email with PDF
      if (appData.email) {
        console.log('📧 Sending email notification...');
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-shahada-certificate-email', {
          body: {
            applicationId: applicationId
          }
        });

        if (emailError) {
          console.error('❌ Failed to send certificate email:', emailError);
        } else {
          console.log('✅ Certificate email sent successfully:', emailData);
        }
      }
      
      // Send WhatsApp notification
      if (appData.phone) {
        console.log('📱 Sending WhatsApp notification...');
        const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            to: appData.phone,
            name: `${appData.first_name} ${appData.last_name}`,
            certificateId: appData.certificate_id || `SHA-${applicationId.slice(0, 8).toUpperCase()}`,
            downloadUrl: `https://rwanda-islamic.rw/dashboard/shahada/${applicationId}`,
            messageType: 'certificate_ready'
          }
        });

        if (whatsappError) {
          console.error('❌ Failed to send WhatsApp notification:', whatsappError);
        } else {
          console.log('✅ WhatsApp notification sent successfully:', whatsappData);
        }
      }
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error in handleShahadaApproval:', error);
    throw error;
  }
};

// Example usage in your admin component:
/*
import { handleShahadaApproval } from '@/utils/certificateEmailUtils';

const onApproveApplication = async (application: any) => {
  if (application.status === 'completed') {
    setLoading(true);
    
    try {
      await handleShahadaApproval(application.id, 'completed', application);
      
      toast({
        title: "Success!",
        description: "Application approved. Certificate sent via email and WhatsApp.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      fetchApplications();
    }
  }
};
*/
