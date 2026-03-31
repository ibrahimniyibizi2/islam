const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Disable JWT verification for this function
export const config = {
  auth: false,
};

function buildEmailHTML(name: string, referenceNumber: string, status: string, type: string, reason?: string) {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#059669' : '#dc2626';
  const statusText = isApproved ? 'Approved' : 'Rejected';
  const statusIcon = isApproved ? '✅' : '❌';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, ${isApproved ? '#1a5e3a, #2d8f5e' : '#7c2d12, #dc2626'}); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 30px; color: #333; line-height: 1.7; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; background: ${statusColor}15; color: ${statusColor}; border: 2px solid ${statusColor}; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: 600; color: #1a5e3a; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; }
    .greeting { font-size: 16px; margin-bottom: 16px; }
    .message { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .reason-box { margin: 20px 0; padding: 15px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; }
    .btn { display: inline-block; padding: 12px 24px; background: #1a5e3a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
    .btn:hover { background: #145c30; }
    .center { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusIcon} Application ${statusText}</h1>
      <p>Rwanda Islamic Hub - ${type.charAt(0).toUpperCase() + type.slice(1)} Application</p>
    </div>
    <div class="body">
      <p class="greeting">Assalamu Alaikum ${name || 'Applicant'},</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge">${statusText.toUpperCase()}</span>
      </div>
      
      <p>Your ${type} application has been <strong>${statusText.toLowerCase()}</strong>.</p>
      
      <div style="margin: 20px 0;">
        <div class="detail-row">
          <span class="detail-label">Reference Number</span>
          <span class="detail-value">${referenceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Application Type</span>
          <span class="detail-value">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" style="color: ${statusColor};">${statusText}</span>
        </div>
      </div>
      
      ${isApproved ? `
      <div class="message">
        <p><strong>Next Steps:</strong></p>
        <p>Your application has been approved. You will receive further instructions regarding the next steps. Please check your email regularly for updates.</p>
      </div>
      ` : ''}
      
      <div class="center">
        <a href="https://islamrwanda.com/dashboard/user" class="btn">View My Application</a>
      </div>
      
      ${reason ? `
      <div class="reason-box">
        <p><strong>Reason for Rejection:</strong></p>
        <p>${reason}</p>
      </div>
      <p>If you have any questions about this decision, please contact our support team.</p>
      ` : ''}
      
      <p>May Allah guide us all. 🤲</p>
    </div>
    <div class="footer">
      <p>Rwanda Islamic Hub &mdash; Islamic Services Platform</p>
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

  // Verify transporter
  console.log('Verifying SMTP connection...');
  await transporter.verify();
  console.log('SMTP connection verified');

  console.log(`Sending email to: ${to}`);
  const info = await transporter.sendMail({
    from: `"Rwanda Islamic Hub" <${smtpEmail}>`,
    to: to,
    subject: subject,
    html: html,
  });

  console.log(`Email sent successfully. MessageId: ${info.messageId}`);
  return info;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_APP_PASSWORD = Deno.env.get("SMTP_APP_PASSWORD");
    
    console.log("Environment check:");
    console.log("- SMTP_EMAIL exists:", !!SMTP_EMAIL);
    console.log("- SMTP_APP_PASSWORD exists:", !!SMTP_APP_PASSWORD);
    
    if (!SMTP_EMAIL || !SMTP_APP_PASSWORD) {
      console.error("Missing SMTP credentials");
      throw new Error(`SMTP credentials missing: EMAIL=${!!SMTP_EMAIL}, PASSWORD=${!!SMTP_APP_PASSWORD}`);
    }

    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { email, name, reference_number, status, type, reason } = body;
    
    if (!email || !reference_number || !status || !type) {
      throw new Error(`Missing required fields: email=${!!email}, reference_number=${!!reference_number}, status=${!!status}, type=${!!type}`);
    }

    const subject = status === 'approved' 
      ? `✅ Application Approved - ${type.charAt(0).toUpperCase() + type.slice(1)}` 
      : `❌ Application Rejected - ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    await sendEmailViaGmail(
      email,
      subject,
      buildEmailHTML(name, reference_number, status, type, reason),
      SMTP_EMAIL,
      SMTP_APP_PASSWORD
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-status-email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : "";
    console.error("Error stack:", stack);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
