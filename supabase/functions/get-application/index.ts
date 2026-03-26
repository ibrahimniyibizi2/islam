import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return new Response(
        JSON.stringify({ success: false, message: "Application ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Try to find application in different tables
    // First check nikah_applications
    let { data: application, error } = await supabase
      .from("nikah_applications")
      .select("id, first_name, last_name, phone, status, created_at")
      .eq("id", applicationId)
      .single();

    // If not found, check hajj_umrah_applications
    if (!application) {
      const result = await supabase
        .from("hajj_umrah_applications")
        .select("id, first_name, last_name, phone, status, created_at")
        .eq("id", applicationId)
        .single();
      application = result.data;
      error = result.error;
    }

    // If not found, check shahada_applications
    if (!application) {
      const result = await supabase
        .from("shahada_applications")
        .select("id, first_name, last_name, phone, status, created_at")
        .eq("id", applicationId)
        .single();
      application = result.data;
      error = result.error;
    }

    if (error || !application) {
      return new Response(
        JSON.stringify({ success: false, message: "Application not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return application data (without sensitive info)
    return new Response(
      JSON.stringify({
        success: true,
        application: {
          id: application.id,
          firstName: application.first_name,
          lastName: application.last_name,
          phone: application.phone,
          status: application.status || 'pending',
          submittedAt: application.created_at,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-application:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
