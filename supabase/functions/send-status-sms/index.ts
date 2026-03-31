import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMS_API_URL = "https://api.pindo.io/v1/sms/";

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) {
    return "+250" + cleaned.slice(1);
  }
  if (cleaned.startsWith("250")) {
    return "+" + cleaned;
  }
  return "+250" + cleaned;
}

async function sendSMS(phone: string, message: string, apiToken: string) {
  const formattedPhone = formatPhone(phone);
  console.log(`Sending SMS to ${formattedPhone}`);

  const senderId = Deno.env.get("PINDO_SENDER_ID");

  const response = await fetch(SMS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      to: formattedPhone,
      text: message,
      ...(senderId?.trim() ? { sender: senderId.trim() } : {}),
    }),
  });

  const text = await response.text();
  console.log(`SMS response [${response.status}]: ${text}`);

  if (!response.ok) {
    throw new Error(`SMS send failed [${response.status}]: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check temporarily disabled for testing
    // const authHeader = req.headers.get("Authorization");
    // if (!authHeader?.startsWith("Bearer ")) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: { ...corsHeaders, "Content-Type": "application/json" },
    //   });
    // }

    const PINDO_TOKEN = Deno.env.get("PINDO_API_TOKEN");
    if (!PINDO_TOKEN) {
      throw new Error("PINDO_API_TOKEN is not configured");
    }

    const { phone, name, reference_number, status, type, reason } = await req.json();

    // Build short SMS message
    let message = '';
    
    if (status === 'approved') {
      // Use approved message template with reference number
      message = reference_number
        ? `Nikah approved (Ref: ${reference_number}). Barakallahu!`
        : `Nikah approved. Barakallahu!`;
    } else {
      message = reason 
        ? `Your ${type} application (Ref: ${reference_number}) is rejected. Reason: ${reason.substring(0, 50)}.`
        : `Your ${type} application (Ref: ${reference_number}) is rejected. Contact support.`;
    }

    await sendSMS(phone, message, PINDO_TOKEN);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-status-sms:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
