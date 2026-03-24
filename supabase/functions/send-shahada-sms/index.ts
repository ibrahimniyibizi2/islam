/// <reference path="../deno.d.ts" />

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PINDO_TOKEN = Deno.env.get("PINDO_API_TOKEN");
    if (!PINDO_TOKEN) {
      throw new Error("PINDO_API_TOKEN is not configured");
    }

    const { applicant_name, phone } = await req.json();

    const results: { recipient: string; success: boolean; error?: string }[] = [];

    // SMS to Applicant
    if (phone) {
      try {
        await sendSMS(
          phone,
          `Assalamu Alaikum ${applicant_name}!\n\nYour Shahada certificate is ready.\n\nPlease check your email or download from your account.\n\nCertificate ID: SHA-RWA-2024-001\n\nMay Allah bless your journey in Islam.\n\nRwanda Islamic Hub`,
          PINDO_TOKEN
        );
        results.push({ recipient: "applicant", success: true });
      } catch (e) {
        results.push({
          recipient: "applicant",
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
    console.error("Error in send-shahada-sms:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
