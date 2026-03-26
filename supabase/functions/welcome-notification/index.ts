// @ts-nocheck
// Deno Edge Function - TypeScript errors are false positives

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildWelcomeEmailHTML(name: string) {
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
    .greeting { font-size: 18px; margin-bottom: 20px; color: #1a5e3a; }
    .message { margin: 20px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669; }
    .features { margin: 20px 0; }
    .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .btn { display: inline-block; padding: 12px 24px; background: #1a5e3a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
    .btn:hover { background: #145c30; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; }
    .center { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤗 Welcome Back!</h1>
      <p>Rwanda Islamic  - Islamic Services Platform</p>
    </div>
    <div class="body">
      <p class="greeting">Assalamu Alaikum ${name || 'Brother/Sister'},</p>
      
      <p>Welcome back to <strong>Rwanda Islamic</strong>! We're delighted to see you again.</p>
      
      <div class="message">
        <p><strong>You've successfully logged in!</strong></p>
        <p>You can now access all our Islamic services including:</p>
      </div>
      
      <div class="features">
        <div class="feature-item">✅ Nikah Services</div>
        <div class="feature-item">✅ Funeral Services</div>
        <div class="feature-item">✅ Islamic Education</div>
        <div class="feature-item">✅ Zakat & Charity</div>
        <div class="feature-item">✅ Mosque Services</div>
        <div class="feature-item">✅ Shahada Certificate</div>
      </div>
      
      <div class="center">
        <a href="https://islam-xi-rust.vercel.app/dashboard/user" class="btn">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>May Allah bless you and grant you success in this life and the hereafter. 🤲</p>
    </div>
    <div class="footer">
      <p>Rwanda Islamic  — Islamic Services Platform</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmailViaGmail(to: string, subject: string, html: string, smtpEmail: string, smtpPassword: string) {
  console.log(`Setting up email transport for: ${smtpEmail}`);
  
  const { createTransport } = await import("npm:nodemailer@6");
  
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  console.log('Verifying SMTP connection...');
  await transporter.verify();
  console.log('SMTP connection verified');

  console.log(`Sending welcome email to: ${to}`);
  const info = await transporter.sendMail({
    from: `"Rwanda Islamic" <${smtpEmail}>`,
    to: to,
    subject: subject,
    html: html,
  });

  console.log(`Welcome email sent successfully. MessageId: ${info.messageId}`);
  return info;
}

async function sendSMSWithPindo(phone: string, message: string, apiToken: string) {
  // Format phone number (remove spaces and ensure +250 prefix)
  let formattedPhone = phone.replace(/\s/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+250' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }
  
  console.log(`Sending SMS via Pindo to: ${formattedPhone}`);
  
  const response = await fetch('https://api.pindo.io/v1/sms/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'to': formattedPhone,
      'text': message,
      'sender': 'RW-ISLAM',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pindo SMS failed: ${errorText}`);
  }

  const data = await response.json();
  console.log(`SMS sent successfully via Pindo:`, data);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, name, type } = await req.json();

    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_APP_PASSWORD = Deno.env.get("SMTP_APP_PASSWORD");
    const PINDO_API_TOKEN = Deno.env.get("PINDO_API_TOKEN");

    // Send email if provided
    if (email && SMTP_EMAIL && SMTP_APP_PASSWORD) {
      await sendEmailViaGmail(
        email,
        "🤗 Welcome Back to Rwanda Islamic!",
        buildWelcomeEmailHTML(name),
        SMTP_EMAIL,
        SMTP_APP_PASSWORD
      );
    }

    // Send SMS if phone provided
    if (phone && PINDO_API_TOKEN) {
      const smsMessage = `Assalamu Alaikum ${name || 'Brother/Sister'}! Welcome back to Rwanda Islamic. You've successfully logged in. May Allah bless you! 🤲`;
      await sendSMSWithPindo(phone, smsMessage, PINDO_API_TOKEN);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in welcome-notification:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
