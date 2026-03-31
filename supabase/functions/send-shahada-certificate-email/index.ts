/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface ShahadaApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  former_name?: string;
  date_of_birth: string;
  nationality: string;
  id_number: string;
  passport_photo_url?: string;
  shahada_date: string;
  location: string;
  witness_name: string;
  witness_title: string;
  certificate_id: string;
  issue_date: string;
  status: string;
  certificate_sent?: boolean;
  certificate_sent_at?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Email log entry interface
interface EmailLogEntry {
  application_id: string;
  user_id?: string;
  notification_type: string;
  channel: string;
  status: string;
  recipient?: string;
  error_message?: string;
  retry_count: number;
  pdf_size_bytes?: number;
  certificate_url?: string;
}

interface CertificateRequest {
  applicationId: string;
  fullName: string;
  formerName?: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  shahadaDate: string;
  location: string;
  witnessName: string;
  witnessTitle: string;
  certificateId: string;
  issueDate: string;
  passportPhotoUrl?: string;
  language?: 'en' | 'rw' | 'ar' | 'fr';
}

// Generate certificate PDF by calling internal function
async function generateCertificatePDF(application: ShahadaApplication): Promise<Uint8Array> {
  console.log('Generating certificate PDF for application:', application.id);
  
  const request: CertificateRequest = {
    applicationId: application.id,
    fullName: `${application.first_name} ${application.last_name}`,
    formerName: application.former_name,
    dateOfBirth: application.date_of_birth,
    nationality: application.nationality,
    idNumber: application.id_number,
    shahadaDate: application.shahada_date,
    location: application.location,
    witnessName: application.witness_name,
    witnessTitle: application.witness_title,
    certificateId: application.certificate_id,
    issueDate: application.issue_date,
    passportPhotoUrl: application.passport_photo_url,
    language: 'en' // Default to English, can be made configurable
  };

  // Call internal certificate generation function
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-multilingual-shahada-certificate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Certificate generation failed: ${errorText}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  return new Uint8Array(pdfBuffer);
}

// Send email using Resend API with retry logic
async function sendEmailWithPDF(
  to: string, 
  subject: string, 
  body: string, 
  pdfBuffer: Uint8Array, 
  fileName: string
): Promise<void> {
  console.log('📧 Sending email to:', to);
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('❌ RESEND_API_KEY environment variable not set');
  }

  // ✅ CRITICAL: Convert PDF to base64 correctly using Buffer
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
  console.log('📄 PDF converted to base64, size:', pdfBase64.length, 'characters');
  
  const emailData = {
    from: 'Rwanda Islamic <noreply@rwanda-islamic.rw>',
    to: [to],
    subject: subject,
    html: body,
    attachments: [
      {
        filename: fileName,
        content: pdfBase64,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  // ✅ Retry logic for email sending
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`📤 Attempting to send email (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Email send failed (attempt ${retryCount + 1}):`, errorText);
        
        if (retryCount === maxRetries) {
          throw new Error(`Failed to send email after ${maxRetries + 1} attempts: ${errorText}`);
        }
        
        retryCount++;
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const result = await response.json();
      console.log('✅ Email sent successfully to:', to, 'Response:', result);
      return; // Success - exit function
      
    } catch (error) {
      console.error(`❌ Email send error (attempt ${retryCount + 1}):`, error);
      
      if (retryCount === maxRetries) {
        throw error;
      }
      
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Helper: Log to email_logs table
async function logNotification(
  supabaseUrl: string, 
  supabaseKey: string, 
  entry: EmailLogEntry
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/rest/v1/email_logs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(entry)
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

// Helper: Save PDF to storage
async function saveCertificateToStorage(
  supabaseUrl: string,
  supabaseKey: string,
  applicationId: string,
  pdfBuffer: Uint8Array
): Promise<string | null> {
  try {
    console.log('💾 Saving certificate to storage...');
    
    const filePath = `shahada/${applicationId}.pdf`;
    
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/certificates/${filePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/pdf',
          'x-upsert': 'true'
        },
        body: pdfBuffer
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to save certificate:', errorText);
      return null;
    }

    // Generate public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/certificates/${filePath}`;
    console.log('✅ Certificate saved to storage:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error saving certificate:', error);
    return null;
  }
}

// Helper: Update certificate_sent flag
async function markCertificateAsSent(
  supabaseUrl: string,
  supabaseKey: string,
  applicationId: string
): Promise<void> {
  try {
    await fetch(
      `${supabaseUrl}/rest/v1/shahada_applications?id=eq.${applicationId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          certificate_sent: true,
          certificate_sent_at: new Date().toISOString()
        })
      }
    );
    console.log('✅ Certificate marked as sent in database');
  } catch (error) {
    console.error('❌ Failed to update certificate_sent flag:', error);
  }
}

// Enterprise-grade main handler
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🚀 ENTERPRISE: send-shahada-certificate-email started');
  
  let applicationId: string | null = null;
  let userId: string | null = null;
  
  try {
    const body = await req.json();
    applicationId = body.applicationId;
    const authToken = body.authToken || req.headers.get('Authorization')?.replace('Bearer ', '');

    // ✅ SECURITY: Validate request
    if (!applicationId) {
      console.error('❌ SECURITY: Missing applicationId');
      return new Response(JSON.stringify({ 
        error: 'applicationId is required',
        code: 'MISSING_APPLICATION_ID'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('❌ CRITICAL: Supabase credentials not configured');
    }

    // ✅ SECURITY: Verify admin role if auth token provided
    if (authToken) {
      try {
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
          
          // Check if user is admin
          const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
            {
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              }
            }
          );
          
          if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            if (!profiles[0] || !['admin', 'super_admin'].includes(profiles[0].role)) {
              console.error('❌ SECURITY: Non-admin attempted to send certificate:', userId);
              return new Response(JSON.stringify({ 
                error: 'Forbidden: Admin access required',
                code: 'FORBIDDEN'
              }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            }
            console.log('✅ SECURITY: Admin verified:', userId);
          }
        }
      } catch (error) {
        console.warn('⚠️ SECURITY: Could not verify user, proceeding with service role:', error);
      }
    }

    console.log('📋 Processing application:', applicationId);

    // Fetch application data
    const appResponse = await fetch(
      `${supabaseUrl}/rest/v1/shahada_applications?id=eq.${applicationId}&select=*`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    );

    if (!appResponse.ok) {
      const errorText = await appResponse.text();
      throw new Error(`Failed to fetch application: ${errorText}`);
    }

    const applications = await appResponse.json() as ShahadaApplication[];
    
    if (applications.length === 0) {
      await logNotification(supabaseUrl, supabaseServiceKey, {
        application_id: applicationId,
        user_id: userId,
        notification_type: 'certificate_email',
        channel: 'email',
        status: 'failed',
        error_message: 'Application not found',
        retry_count: 0
      });
      
      return new Response(JSON.stringify({ 
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const application = applications[0];

    // ✅ DUPLICATE PREVENTION: Check if already sent
    if (application.certificate_sent) {
      console.warn('⚠️ DUPLICATE PREVENTION: Certificate already sent for:', applicationId);
      
      await logNotification(supabaseUrl, supabaseServiceKey, {
        application_id: applicationId,
        user_id: userId,
        notification_type: 'certificate_email',
        channel: 'email',
        status: 'duplicate_prevented',
        recipient: application.email,
        retry_count: 0
      });
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Certificate already sent previously',
        alreadySent: true,
        sentAt: application.certificate_sent_at,
        applicationId: applicationId
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('✅ Application valid, proceeding with certificate generation');

    // Validate email
    if (!application.email) {
      await logNotification(supabaseUrl, supabaseServiceKey, {
        application_id: applicationId,
        user_id: userId,
        notification_type: 'certificate_email',
        channel: 'email',
        status: 'failed',
        error_message: 'Application has no email address',
        retry_count: 0
      });
      
      return new Response(JSON.stringify({ 
        error: 'Application has no email address',
        code: 'MISSING_EMAIL',
        fallbackMessage: 'User can download certificate from dashboard'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Generate certificate PDF
    console.log('📄 Generating certificate PDF...');
    const pdfBuffer = await generateCertificatePDF(application);
    console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

    // ✅ PERSISTENCE: Save to storage
    const certificateUrl = await saveCertificateToStorage(
      supabaseUrl, 
      supabaseServiceKey, 
      applicationId, 
      pdfBuffer
    );

    // Prepare and send email
    const fullName = `${application.first_name} ${application.last_name}`;
    const fileName = `shahada-certificate-${fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    
    const downloadLink = certificateUrl 
      ? `<p style="text-align: center; margin: 20px 0;"><a href="${certificateUrl}" style="background: #0F4C3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Certificate</a></p>`
      : '';
    
    const emailSubject = 'Your Shahada Certificate';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0F4C3A, #2d8f5e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🤗 Congratulations!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Your Shahada Certificate is Ready</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Assalamu Alaikum <strong>${fullName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
            Masha'Allah! Your Shahada certificate has been generated and is attached to this email.
          </p>
          
          ${downloadLink}
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 16px; color: #333;">
              <strong>Certificate Details:</strong><br>
              Certificate ID: ${application.certificate_id}<br>
              Issue Date: ${new Date(application.issue_date).toLocaleDateString()}<br>
              ${certificateUrl ? `<a href="${certificateUrl}">Download again here</a>` : ''}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
            May Allah bless your journey in Islam and grant you success in this life and the hereafter. 🤲
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #0F4C3A; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block;">
              <strong>Rwanda Islamic Hub</strong><br>
              <span style="font-size: 14px; opacity: 0.9;">Islamic Services Platform</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Send email
    console.log('📧 Sending email...');
    await sendEmailWithPDF(application.email, emailSubject, emailBody, pdfBuffer, fileName);

    // ✅ Mark as sent (duplicate prevention)
    await markCertificateAsSent(supabaseUrl, supabaseServiceKey, applicationId);

    // ✅ Log success
    await logNotification(supabaseUrl, supabaseServiceKey, {
      application_id: applicationId,
      user_id: userId,
      notification_type: 'certificate_email',
      channel: 'email',
      status: 'success',
      recipient: application.email,
      retry_count: 0,
      pdf_size_bytes: pdfBuffer.length,
      certificate_url: certificateUrl
    });

    const duration = Date.now() - startTime;
    console.log(`🎉 SUCCESS: Certificate sent in ${duration}ms`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Certificate sent successfully',
      email: application.email,
      fileName: fileName,
      applicationId: applicationId,
      certificateUrl: certificateUrl,
      duration: duration,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 CRITICAL ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: duration,
      applicationId: applicationId,
      timestamp: new Date().toISOString()
    });
    
    // Log error if possible
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseKey && applicationId) {
        await logNotification(supabaseUrl, supabaseKey, {
          application_id: applicationId,
          user_id: userId,
          notification_type: 'certificate_email',
          channel: 'email',
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          retry_count: 0
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'FUNCTION_ERROR',
      duration: duration,
      timestamp: new Date().toISOString(),
      fallbackMessage: 'Please contact support or download certificate from dashboard'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
