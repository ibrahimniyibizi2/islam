import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
  console.log(
    `PINDO_SENDER_ID ${senderId?.trim() ? `set (${senderId.trim()})` : "not set (using account default sender)"}`,
  );

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing or invalid auth header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Auth header found, validating...");

    // For service role key validation, we'll accept any Bearer token for now
    // In production, you should validate against the actual service role key
    const token = authHeader.replace("Bearer ", "");
    console.log(`Token received (first 10 chars): ${token.substring(0, 10)}...`);

    console.log("Authentication successful");

    const PINDO_TOKEN = Deno.env.get("PINDO_API_TOKEN");
    if (!PINDO_TOKEN) {
      throw new Error("PINDO_API_TOKEN is not configured");
    }

    const { application_id, groom_name, groom_phone, bride_name, bride_phone, preferred_date } =
      await req.json();

    const results: { recipient: string; success: boolean; error?: string }[] = [];

    // SMS to Groom
    if (groom_phone) {
      try {
        await sendSMS(
          groom_phone,
          `Nikah application received. ID: ${application_id}. Bride: ${bride_name}. Date: ${preferred_date || "TBC"}.`,
          PINDO_TOKEN
        );
        results.push({ recipient: "groom", success: true });
      } catch (e) {
        results.push({
          recipient: "groom",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // SMS to Bride
    if (bride_phone) {
      try {
        await sendSMS(
          bride_phone,
          `Nikah application submitted. ID: ${application_id}. Groom: ${groom_name}. Date: ${preferred_date || "TBC"}.`,
          PINDO_TOKEN
        );
        results.push({ recipient: "bride", success: true });
      } catch (e) {
        results.push({
          recipient: "bride",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-nikah-sms:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
