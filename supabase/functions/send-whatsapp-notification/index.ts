/// <reference path="../deno.d.ts" />

const whatsAppCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface WhatsAppMessageRequest {
  to: string;
  name: string;
  certificateId: string;
  downloadUrl: string;
  messageType: 'certificate_ready' | 'application_approved' | 'reminder';
}

// Format phone number for WhatsApp (Rwanda format)
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add Rwanda country code if not present
  if (!cleaned.startsWith('250')) {
    cleaned = '250' + cleaned;
  }
  
  // Return with WhatsApp format (add +)
  return '+' + cleaned;
}

// Send WhatsApp message using Twilio
async function sendWhatsAppMessage(request: WhatsAppMessageRequest): Promise<void> {
  console.log('📱 Sending WhatsApp message to:', request.to);
  
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., whatsapp:+14155238886
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('❌ Twilio credentials not configured');
  }

  const formattedNumber = formatPhoneNumber(request.to);
  const toWhatsApp = `whatsapp:${formattedNumber}`;
  
  // Create personalized message based on type
  let messageBody = '';
  
  switch (request.messageType) {
    case 'certificate_ready':
      messageBody = `🎉 *Masha'Allah ${request.name}!*

Your Shahada certificate is ready! 📜

*Certificate ID:* ${request.certificateId}

✅ Download your certificate here:
${request.downloadUrl}

May Allah bless your journey in Islam! 🤲

_Rwanda Islamic Hub_`;
      break;
      
    case 'application_approved':
      messageBody = `✅ *Assalamu Alaikum ${request.name}!*

Your Shahada application has been *APPROVED*! 🎉

We're now preparing your official certificate.
You'll receive another message when it's ready for download.

*Application ID:* ${request.certificateId}

_JazakAllah Khair_
_Rwanda Islamic Hub_`;
      break;
      
    case 'reminder':
      messageBody = `📅 *Reminder - Rwanda Islamic Hub*

Assalamu Alaikum ${request.name},

Don't forget to download your Shahada certificate!

*Download link:*
${request.downloadUrl}

_Rwanda Islamic Hub_`;
      break;
      
    default:
      messageBody = `Assalamu Alaikum ${request.name}! Your certificate is ready: ${request.downloadUrl}`;
  }

  // Retry logic for WhatsApp
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`📤 WhatsApp attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'From': fromNumber,
            'To': toWhatsApp,
            'Body': messageBody
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ WhatsApp failed (attempt ${retryCount + 1}):`, errorText);
        
        if (retryCount === maxRetries) {
          throw new Error(`WhatsApp failed after ${maxRetries + 1} attempts: ${errorText}`);
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      const result = await response.json();
      console.log('✅ WhatsApp message sent successfully:', {
        sid: result.sid,
        to: toWhatsApp,
        status: result.status
      });
      
      return;
      
    } catch (error) {
      console.error(`❌ WhatsApp error (attempt ${retryCount + 1}):`, error);
      
      if (retryCount === maxRetries) {
        throw error;
      }
      
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: whatsAppCorsHeaders });
  }

  console.log('🚀 WhatsApp notification function started');
  
  try {
    const { to, name, certificateId, downloadUrl, messageType } = await req.json();

    // Validation
    if (!to || !name || !certificateId) {
      console.error('❌ Missing required fields');
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, name, certificateId',
        code: 'MISSING_FIELDS'
      }), {
        status: 400,
        headers: { ...whatsAppCorsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('📱 Processing WhatsApp notification:', {
      to: to,
      name: name,
      type: messageType || 'certificate_ready'
    });

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: to,
      name: name,
      certificateId: certificateId,
      downloadUrl: downloadUrl || 'https://rwanda-islamic.rw/dashboard',
      messageType: messageType || 'certificate_ready'
    });

    console.log('🎉 WhatsApp notification sent successfully!');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'WhatsApp notification sent successfully',
      recipient: to,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...whatsAppCorsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR in WhatsApp function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'WHATSAPP_ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...whatsAppCorsHeaders, "Content-Type": "application/json" }
    });
  }
});
