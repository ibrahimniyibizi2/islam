/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type SupportedLanguage = 'en' | 'rw' | 'ar' | 'fr';

export interface StorageRequest {
  applicationId: string;
  fullName: string;
  certificateId: string;
  languages: SupportedLanguage[];
  certificateData: any; // Full certificate data
}

const storeCertificatesInStorage = async (data: StorageRequest) => {
  console.log('📦 Storing certificates in Supabase Storage...');
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const storageUrls: Record<SupportedLanguage, string> = {} as any;
    
    // Generate and store each language version
    for (const lang of data.languages) {
      console.log(`📄 Generating ${lang} certificate for storage...`);
      
      // 1. Generate PDF
      const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-multilingual-shahada-certificate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data.certificateData,
          language: lang
        })
      });
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to generate ${lang} certificate`);
      }
      
      const pdfBuffer = await pdfResponse.arrayBuffer();
      
      // 2. Store in Supabase Storage with organized structure
      const fileName = `${data.certificateId}/${lang}/shahada-certificate-${lang}-${data.fullName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      
      const storageResponse = await fetch(`${supabaseUrl}/storage/v1/object/certificates/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/pdf',
        },
        body: pdfBuffer
      });
      
      if (!storageResponse.ok) {
        throw new Error(`Failed to store ${lang} certificate`);
      }
      
      // 3. Get public URL
      storageUrls[lang] = `${supabaseUrl}/storage/v1/object/public/certificates/${fileName}`;
      console.log(`✅ ${lang} certificate stored: ${storageUrls[lang]}`);
    }
    
    // 4. Update application with storage URLs
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/shahada_applications?id=eq.${data.applicationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        certificate_urls: storageUrls,
        certificate_stored_at: new Date().toISOString(),
        status: 'completed'
      })
    });
    
    if (!updateResponse.ok) {
      console.error('Failed to update application with storage URLs');
    }
    
    return {
      success: true,
      storageUrls,
      message: 'All certificates stored successfully in Supabase Storage'
    };
    
  } catch (error) {
    console.error('Storage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage failed'
    };
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const data: StorageRequest = await req.json();
    
    console.log('📦 Storage request received:', {
      applicationId: data.applicationId,
      certificateId: data.certificateId,
      languages: data.languages
    });

    // Validate required fields
    if (!data.applicationId || !data.certificateId || !data.languages || !data.certificateData) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: applicationId, certificateId, languages, certificateData' 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const result = await storeCertificatesInStorage(data);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in store-certificates function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
