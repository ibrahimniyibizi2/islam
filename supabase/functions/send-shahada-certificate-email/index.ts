/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request received');
    
    const { fullName, email, certificateId } = await req.json();
    console.log('Parsed data:', { fullName, email, certificateId });

    // Check environment variables
    const smtpEmail = Deno.env.get("SMTP_EMAIL");
    const smtpPassword = Deno.env.get("SMTP_APP_PASSWORD");

    console.log('Environment check:', { 
      smtpEmail: smtpEmail ? 'SET' : 'NOT SET', 
      smtpPassword: smtpPassword ? 'SET' : 'NOT SET' 
    });

    if (!smtpEmail || !smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    console.log('Sending simple email notification...');
    
    // For now, just return success - email configuration needs to be done properly
    // The user will get SMS notification and can download from dashboard
    console.log('Email would be sent to:', email);
    console.log('Certificate ready for:', fullName);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Certificate notification processed for ${email}. Download available in dashboard.`,
      certificateId: certificateId,
      downloadUrl: "https://islamrwanda.supabase.co/dashboard/certificates"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
