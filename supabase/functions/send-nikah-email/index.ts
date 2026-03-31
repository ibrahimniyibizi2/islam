import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildEmailHTML(recipientType: string, groomName: string, brideName: string, preferredDate: string, referenceNumber: string) {
  const isGroom = recipientType === "groom";
  const partnerLabel = isGroom ? "Bride" : "Groom";
  const partnerName = isGroom ? brideName : groomName;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a5e3a, #2d8f5e); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 30px; color: #333; line-height: 1.7; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: 600; color: #1a5e3a; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; }
    .greeting { font-size: 16px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 Nikah Application</h1>
      <p>Marriage Registration Confirmation</p>
    </div>
    <div class="body">
      <p class="greeting">Assalamu Alaikum,</p>
      <p>Your Nikah application has been ${isGroom ? "received" : "submitted"} successfully. Below are the details:</p>
      <div style="margin: 20px 0;">
        <div class="detail-row">
          <span class="detail-label">Reference Number</span>
          <span class="detail-value">${referenceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${partnerLabel}</span>
          <span class="detail-value">${partnerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Preferred Date</span>
          <span class="detail-value">${preferredDate || "To be confirmed"}</span>
        </div>
      </div>
      <p>${isGroom ? "You will be contacted by the Masjid soon regarding next steps." : "The Masjid will review your application and contact you soon."}</p>
      <p>May Allah bless this union. 🤲</p>
    </div>
    <div class="footer">
      <p>Nikah System &mdash; Rwanda Muslim Community</p>
    </div>
  </div>
</body>
</html>`;
}

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function buildRawEmail(from: string, to: string, subject: string, html: string): string {
  const boundary = "boundary_" + crypto.randomUUID().replace(/-/g, "");
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    encodeBase64(html),
    ``,
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}

async function sendEmailViaGmailAPI(to: string, subject: string, html: string, smtpEmail: string, smtpAppPassword: string) {
  const raw = buildRawEmail(smtpEmail, to, subject, html);
  const encodedMessage = encodeBase64(raw)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Use Gmail SMTP relay via a simple POST approach
  // Since native SMTP libs don't work in Edge Runtime, we use nodemailer via npm
  const { createTransport } = await import("npm:nodemailer@6");
  
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpEmail,
      pass: smtpAppPassword,
    },
  });

  const info = await transporter.sendMail({
    from: smtpEmail,
    to: to,
    subject: subject,
    html: html,
  });

  console.log(`Email sent: ${info.messageId}`);
  return info;
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_APP_PASSWORD = Deno.env.get("SMTP_APP_PASSWORD");
    if (!SMTP_EMAIL || !SMTP_APP_PASSWORD) {
      throw new Error("SMTP credentials are not configured");
    }

    const { reference_number, groom_name, groom_email, bride_name, bride_email, preferred_date } =
      await req.json();

    const results: { recipient: string; success: boolean; error?: string }[] = [];

    // Email to Groom
    if (groom_email) {
      try {
        await sendEmailViaGmailAPI(
          groom_email,
          "Nikah Application Received - Confirmation",
          buildEmailHTML("groom", groom_name, bride_name, preferred_date, reference_number),
          SMTP_EMAIL,
          SMTP_APP_PASSWORD
        );
        results.push({ recipient: "groom", success: true });
        console.log(`Email sent to groom: ${groom_email}`);
      } catch (e) {
        console.error(`Email to groom failed:`, e);
        results.push({ recipient: "groom", success: false, error: (e as Error).message });
      }
    }

    // Email to Bride
    if (bride_email) {
      try {
        await sendEmailViaGmailAPI(
          bride_email,
          "Nikah Application Submitted - Confirmation",
          buildEmailHTML("bride", groom_name, bride_name, preferred_date, reference_number),
          SMTP_EMAIL,
          SMTP_APP_PASSWORD
        );
        results.push({ recipient: "bride", success: true });
        console.log(`Email sent to bride: ${bride_email}`);
      } catch (e) {
        console.error(`Email to bride failed:`, e);
        results.push({ recipient: "bride", success: false, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-nikah-email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
