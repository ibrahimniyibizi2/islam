/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type SupportedLanguage = 'en' | 'rw' | 'ar' | 'fr';

export interface CertificateOrchestrationRequest {
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
  email: string;
  phone: string;
  language?: SupportedLanguage;
}

const orchestrateCertificateFlow = async (data: CertificateOrchestrationRequest) => {
  console.log('🚀 Starting certificate orchestration for:', data.fullName);
  
  try {
    // 1. Store certificates in Supabase Storage for instant access
    console.log('� Storing certificates in Supabase Storage...');
    const storageResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/store-certificates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: data.applicationId,
        fullName: data.fullName,
        certificateId: data.certificateId,
        languages: ['en', 'rw', 'ar', 'fr'],
        certificateData: data
      })
    });
    
    let storageUrls: Record<string, string> = {};
    
    if (storageResponse.ok) {
      const storageResult = await storageResponse.json();
      storageUrls = storageResult.storageUrls || {};
      console.log('✅ Certificates stored in Storage');
    } else {
      console.error('❌ Storage failed, falling back to on-demand generation');
      
      // Fallback: generate on-demand
      const languages: SupportedLanguage[] = ['en', 'rw', 'ar', 'fr'];
      for (const lang of languages) {
        console.log(`Generating ${lang} certificate on-demand...`);
        
        const pdfResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-multilingual-shahada-certificate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            language: lang
          })
        });
        
        if (pdfResponse.ok) {
          const fileName = `shahada-certificate-${lang}-${data.fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
          storageUrls[lang] = `${Deno.env.get("SUPABASE_URL")}/functions/v1/download-certificate?certificateId=${data.certificateId}&lang=${lang}`;
        }
      }
    }
    
    // 2. Send notifications immediately (no wait)
    console.log('📱 Sending SMS notification...');
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-shahada-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_name: data.fullName,
          phone: data.phone,
          certificateId: data.certificateId
        })
      });
      console.log('✅ SMS sent');
    } catch (smsError) {
      console.error('❌ SMS failed:', smsError);
    }
    
    // 3. Send email with certificate
    console.log('📧 Sending email notification...');
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-shahada-certificate-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: data.applicationId,
          fullName: data.fullName,
          email: data.email,
          certificateId: data.certificateId,
          language: data.language || 'en'
        })
      });
      console.log('✅ Email sent');
    } catch (emailError) {
      console.error('❌ Email failed:', emailError);
    }
    
    // 4. Update application status
    console.log('🔄 Updating application status...');
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/shahada_applications?id=eq.${data.applicationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'completed',
          certificate_urls: storageUrls,
          completed_at: new Date().toISOString()
        })
      });
      console.log('✅ Application status updated');
    } catch (updateError) {
      console.error('❌ Status update failed:', updateError);
    }
    
    return {
      success: true,
      message: 'Certificate orchestration completed successfully',
      certificateUrls: storageUrls,
      status: 'completed'
    };
    
  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CertificateOrchestrationRequest = await req.json();
    
    console.log('🎯 Certificate orchestration request received:', {
      applicationId: data.applicationId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone
    });

    // Validate required fields
    if (!data.applicationId || !data.fullName || !data.email || !data.phone) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: applicationId, fullName, email, phone' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Start orchestration (this will run asynchronously)
    orchestrateCertificateFlow(data);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Certificate orchestration started. You will receive SMS and email notifications immediately.',
      estimatedDelivery: 'immediately'
    }), {
      status: 202, // Accepted
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in orchestrate-certificate function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
