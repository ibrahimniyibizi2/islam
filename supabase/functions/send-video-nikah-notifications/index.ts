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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PINDO_TOKEN = Deno.env.get("PINDO_API_TOKEN");
    if (!PINDO_TOKEN) {
      throw new Error("PINDO_API_TOKEN is not configured");
    }

    const {
      nikah_application_id,
      room_url,
      groom_name,
      groom_phone,
      groom_email,
      bride_name,
      bride_phone,
      bride_email,
      preferred_date,
      preferred_time,
      imam_name,
      male_witness_name,
      male_witness_phone,
      female_witness1_name,
      female_witness1_phone,
      female_witness2_name,
      female_witness2_phone,
      wali_name,
      wali_phone,
    } = await req.json();

    const results: { recipient: string; type: string; success: boolean; error?: string }[] = [];

    // SMS to Groom
    if (groom_phone) {
      try {
        await sendSMS(
          groom_phone,
          `Your Nikah video ceremony is scheduled. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "groom", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "groom",
          type: "sms",
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
          `Your Nikah video ceremony with ${groom_name} is scheduled. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "bride", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "bride",
          type: "sms",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // SMS to Male Witness
    if (male_witness_phone) {
      try {
        await sendSMS(
          male_witness_phone,
          `You are invited as a witness to the Nikah ceremony of ${groom_name} & ${bride_name}. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "male_witness", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "male_witness",
          type: "sms",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // SMS to Female Witness 1
    if (female_witness1_phone) {
      try {
        await sendSMS(
          female_witness1_phone,
          `You are invited as a witness to the Nikah ceremony of ${groom_name} & ${bride_name}. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "female_witness1", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "female_witness1",
          type: "sms",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // SMS to Female Witness 2
    if (female_witness2_phone) {
      try {
        await sendSMS(
          female_witness2_phone,
          `You are invited as a witness to the Nikah ceremony of ${groom_name} & ${bride_name}. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "female_witness2", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "female_witness2",
          type: "sms",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // SMS to Wali
    if (wali_phone) {
      try {
        await sendSMS(
          wali_phone,
          `You are invited as Wali to the Nikah ceremony of ${bride_name}. Date: ${preferred_date || "TBC"}, Time: ${preferred_time || "TBC"}. Join: ${room_url}`,
          PINDO_TOKEN
        );
        results.push({ recipient: "wali", type: "sms", success: true });
      } catch (e) {
        results.push({
          recipient: "wali",
          type: "sms",
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // Send email notifications using the existing send-nikah-email function
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      try {
        await supabase.functions.invoke("send-nikah-email", {
          body: {
            reference_number: nikah_application_id,
            groom_name,
            groom_email,
            bride_name,
            bride_email,
            preferred_date,
            room_url,
            is_video_ceremony: true,
            message: `Your Nikah video ceremony has been scheduled. Please join using this link: ${room_url}`,
          },
        });
        results.push({ recipient: "email", type: "email", success: true });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
        results.push({
          recipient: "email",
          type: "email",
          success: false,
          error: (emailErr as Error).message,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-video-nikah-notifications:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
