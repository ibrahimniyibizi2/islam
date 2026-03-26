import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { identifier, type } = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ success: false, message: "Identifier is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this identifier
    await supabase.from("otps").delete().eq("identifier", identifier);

    // Store new OTP (expires in 5 minutes)
    const { error: insertError } = await supabase.from("otps").insert({
      identifier: identifier.trim(),
      otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      verified: false,
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to store OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Send OTP via SMS (Twilio or other provider)
    // For now, log to console for testing
    console.log(`OTP for ${identifier}: ${otp}`);

    // TODO: Integrate with SMS provider
    // Example with Twilio:
    // await sendSMS(identifier, `Your verification code is: ${otp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        // Only return OTP in development
        ...(Deno.env.get("ENVIRONMENT") === "development" && { otp })
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
