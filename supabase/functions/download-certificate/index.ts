/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

type SupportedLanguage = 'en' | 'rw' | 'ar' | 'fr';

export interface DownloadRequest {
  certificateId: string;
  language: SupportedLanguage;
  applicationId?: string;
}

const downloadCertificate = async (certificateId: string, language: SupportedLanguage, applicationId?: string) => {
  try {
    console.log(`📄 Downloading certificate: ${certificateId} in ${language}`);
    
    // 1. Fetch application data if applicationId provided
    let applicationData = null;
    if (applicationId) {
      const appResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/shahada_applications?id=eq.${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        }
      });
      
      if (appResponse.ok) {
        const apps = await appResponse.json();
        applicationData = apps[0];
      }
    }
    
    // 2. Generate certificate PDF in requested language
    const pdfResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-multilingual-shahada-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: applicationId || 'unknown',
        fullName: applicationData ? `${applicationData.first_name} ${applicationData.last_name}` : 'Certificate Holder',
        formerName: applicationData?.former_name || undefined,
        dateOfBirth: applicationData?.date_of_birth || '1990-01-01',
        nationality: applicationData?.nationality || 'Rwandan',
        idNumber: applicationData?.national_id || '123456789',
        shahadaDate: applicationData?.shahada_date || new Date().toISOString().split('T')[0],
        location: applicationData?.location || 'Kigali Islamic Cultural Center',
        witnessName: applicationData?.witness1_name || 'Sheikh Muhammad Al-Hassan',
        witnessTitle: applicationData?.witness1_title || 'Senior Imam',
        certificateId: certificateId,
        issueDate: new Date().toISOString().split('T')[0],
        language: language
      })
    });
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to generate certificate: ${pdfResponse.statusText}`);
    }
    
    // 3. Get PDF buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // 4. Log the download
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/certificate_downloads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          certificate_id: certificateId,
          language: language,
          application_id: applicationId,
          downloaded_at: new Date().toISOString(),
          user_agent: 'API'
        })
      });
    } catch (logError) {
      console.error('Failed to log download:', logError);
    }
    
    // 5. Return PDF with proper headers
    const fileName = `shahada-certificate-${language}-${certificateId}.pdf`;
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(req.url);
    const certificateId = url.searchParams.get('certificateId');
    const language = url.searchParams.get('lang') as SupportedLanguage;
    const applicationId = url.searchParams.get('applicationId');
    
    // Validate parameters
    if (!certificateId) {
      return new Response(JSON.stringify({ error: 'certificateId is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (!language || !['en', 'rw', 'ar', 'fr'].includes(language)) {
      return new Response(JSON.stringify({ error: 'lang must be one of: en, rw, ar, fr' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`📥 Download request: ${certificateId} in ${language}`);
    
    return await downloadCertificate(certificateId, language, applicationId || undefined);
    
  } catch (error) {
    console.error('Error in download-certificate function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
