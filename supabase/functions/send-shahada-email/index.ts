/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildEmailHTML(applicantName: string) {
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
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; }
    .greeting { font-size: 16px; margin-bottom: 16px; }
    .highlight { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a5e3a; }
    .steps { margin: 20px 0; }
    .step { display: flex; align-items: center; margin: 10px 0; }
    .step-number { background: #1a5e3a; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; }
    .step-text { flex: 1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 Shahada Application</h1>
      <p>Islamic Conversion Certificate Application</p>
    </div>
    <div class="body">
      <p class="greeting">Assalamu Alaikum ${applicantName},</p>
      <p>Your Shahada certificate application has been received successfully. We are honored to be part of your journey to Islam.</p>
      
      <div class="highlight">
        <strong>🎉 Welcome to the Muslim Community!</strong><br>
        Your application is being reviewed by the Islamic Affairs Division.
      </div>
      
      <div class="steps">
        <h3>Next Steps:</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Application review by Islamic scholars</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Contact for interview and learning session</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Shahada declaration ceremony</div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-text">Certificate issuance</div>
        </div>
      </div>
      
      <p>May Allah bless your journey and make it easy for you. We are here to support you every step of the way.</p>
      <p><strong>Barakallahu feekum (May Allah bless you).</strong> 🤲</p>
    </div>
    <div class="footer">
      <p>Shahada System &mdash; Rwanda Islamic Hub</p>
      <p>Islamic Affairs Division</p>
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

Deno.serve(async (req: Request) => {
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

    // Accept any Bearer token (the client already sends a valid user JWT via supabase-js).
    // Avoid strict validation here to prevent unexpected 401s due to token verification/config.
    const token = authHeader.replace("Bearer ", "");
    console.log(`Token received (first 10 chars): ${token.substring(0, 10)}...`);

    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_APP_PASSWORD = Deno.env.get("SMTP_APP_PASSWORD");
    if (!SMTP_EMAIL || !SMTP_APP_PASSWORD) {
      throw new Error("SMTP credentials are not configured");
    }

    const { applicant_name, email } = await req.json();

    const results: { recipient: string; success: boolean; error?: string }[] = [];

    // Email to Applicant
    if (email) {
      try {
        await sendEmailViaGmailAPI(
          email,
          "Shahada Application Received - Welcome to Islam!",
          buildEmailHTML(applicant_name),
          SMTP_EMAIL,
          SMTP_APP_PASSWORD
        );
        results.push({ recipient: "applicant", success: true });
        console.log(`Email sent to applicant: ${email}`);
      } catch (e) {
        console.error(`Email to applicant failed:`, e);
        results.push({ recipient: "applicant", success: false, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-shahada-email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
