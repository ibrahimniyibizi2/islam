import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMS_API_URL = "https://api.pindo.io/v1/sms/";

// Status display names and colors for email templates
const statusConfig: Record<string, { label: string; color: string; message: string }> = {
  approved: {
    label: "Approved",
    color: "#059669",
    message: "Your application has been approved. Congratulations!",
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    message: "We regret to inform you that your application has been rejected.",
  },
  processing: {
    label: "Processing",
    color: "#2563eb",
    message: "Your application is currently being processed.",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
    message: "Your application is pending review. We will update you soon.",
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
    message: "Your certificate/document has been delivered.",
  },
  denied: {
    label: "Denied",
    color: "#7c2d12",
    message: "Your application has been denied.",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    message: "Your application process has been completed successfully.",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
    message: "Your application has been cancelled.",
  },
};

const applicationTypeNames: Record<string, string> = {
  shahada: "Shahada Certificate",
  nikah: "Nikah Application",
  residence: "Certificate of Residence",
  business: "Business Registration",
};

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

function buildStatusEmailHTML(
  recipientName: string,
  applicationType: string,
  status: string,
  reason?: string,
  referenceNumber?: string
) {
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const appName = applicationTypeNames[applicationType] || applicationType;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a5e3a, #2d8f5e); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-top: 10px; background: ${statusInfo.color}; color: white; }
    .body { padding: 30px; color: #333; line-height: 1.7; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: 600; color: #1a5e3a; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; }
    .greeting { font-size: 16px; margin-bottom: 16px; }
    .message { background: #f0fdf4; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .reason-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 Application Status Update</h1>
      <span class="status-badge">${statusInfo.label}</span>
    </div>
    <div class="body">
      <p class="greeting">Assalamu Alaikum ${recipientName || "Valued Applicant"},</p>
      
      <div class="message">
        <p style="margin: 0; color: ${statusInfo.color}; font-weight: 500;">${statusInfo.message}</p>
      </div>

      <div style="margin: 20px 0;">
        <div class="detail-row">
          <span class="detail-label">Application Type</span>
          <span class="detail-value">${appName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Current Status</span>
          <span class="detail-value" style="color: ${statusInfo.color};">${statusInfo.label}</span>
        </div>
        ${referenceNumber ? `
        <div class="detail-row">
          <span class="detail-label">Reference Number</span>
          <span class="detail-value">${referenceNumber}</span>
        </div>
        ` : ""}
      </div>

      ${reason && status === "rejected" ? `
      <div class="reason-box">
        <p style="margin: 0; color: #dc2626; font-weight: 500;"><strong>Reason for Rejection:</strong></p>
        <p style="margin: 8px 0 0; color: #7f1d1d;">${reason}</p>
      </div>
      ` : ""}

      <p>If you have any questions, please contact the Masjid or visit the Rwanda Islamic Hub portal.</p>
      <p>May Allah bless you. 🤲</p>
    </div>
    <div class="footer">
      <p>Rwanda Islamic Hub &mdash; Rwanda Muslim Community</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  smtpEmail: string,
  smtpAppPassword: string
) {
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

    const {
      applicant_name,
      applicant_email,
      applicant_phone,
      application_type,
      status,
      reason,
      reference_number,
      // For nikah applications with bride/groom
      groom_email,
      groom_phone,
      groom_name,
      bride_email,
      bride_phone,
      bride_name,
    } = await req.json();

    const PINDO_TOKEN = Deno.env.get("PINDO_API_TOKEN");
    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_APP_PASSWORD = Deno.env.get("SMTP_APP_PASSWORD");

    const results: {
      sms: { recipient: string; success: boolean; error?: string }[];
      email: { recipient: string; success: boolean; error?: string }[];
    } = {
      sms: [],
      email: [],
    };

    const statusInfo = statusConfig[status] || statusConfig.pending;
    const appName = applicationTypeNames[application_type] || application_type;

    // Build SMS message
    const buildSMSMessage = (name: string) => {
      let msg = `Assalamu Alaikum ${name || "Valued Applicant"}.\n\n`;
      msg += `Your ${appName} application status has been updated to: ${statusInfo.label}.\n\n`;
      msg += `${statusInfo.message}`;
      if (reference_number) {
        msg += `\n\nRef: ${reference_number}`;
      }
      if (reason && status === "rejected") {
        msg += `\n\nReason: ${reason}`;
      }
      msg += "\n\nRwanda Islamic Hub";
      return msg;
    };

    // Send SMS notifications
    if (PINDO_TOKEN) {
      // Handle nikah applications with both bride and groom
      if (application_type === "nikah") {
        if (groom_phone) {
          try {
            await sendSMS(groom_phone, buildSMSMessage(groom_name), PINDO_TOKEN);
            results.sms.push({ recipient: "groom", success: true });
          } catch (e) {
            results.sms.push({
              recipient: "groom",
              success: false,
              error: (e as Error).message,
            });
          }
        }
        if (bride_phone) {
          try {
            await sendSMS(bride_phone, buildSMSMessage(bride_name), PINDO_TOKEN);
            results.sms.push({ recipient: "bride", success: true });
          } catch (e) {
            results.sms.push({
              recipient: "bride",
              success: false,
              error: (e as Error).message,
            });
          }
        }
      } else if (applicant_phone) {
        try {
          await sendSMS(applicant_phone, buildSMSMessage(applicant_name), PINDO_TOKEN);
          results.sms.push({ recipient: "applicant", success: true });
        } catch (e) {
          results.sms.push({
            recipient: "applicant",
            success: false,
            error: (e as Error).message,
          });
        }
      }
    }

    // Send Email notifications
    if (SMTP_EMAIL && SMTP_APP_PASSWORD) {
      const subject = `${appName} - Status Update: ${statusInfo.label}`;

      // Handle nikah applications with both bride and groom
      if (application_type === "nikah") {
        if (groom_email) {
          try {
            await sendEmailViaSMTP(
              groom_email,
              subject,
              buildStatusEmailHTML(groom_name, application_type, status, reason, reference_number),
              SMTP_EMAIL,
              SMTP_APP_PASSWORD
            );
            results.email.push({ recipient: "groom", success: true });
          } catch (e) {
            results.email.push({
              recipient: "groom",
              success: false,
              error: (e as Error).message,
            });
          }
        }
        if (bride_email) {
          try {
            await sendEmailViaSMTP(
              bride_email,
              subject,
              buildStatusEmailHTML(bride_name, application_type, status, reason, reference_number),
              SMTP_EMAIL,
              SMTP_APP_PASSWORD
            );
            results.email.push({ recipient: "bride", success: true });
          } catch (e) {
            results.email.push({
              recipient: "bride",
              success: false,
              error: (e as Error).message,
            });
          }
        }
      } else if (applicant_email) {
        try {
          await sendEmailViaSMTP(
            applicant_email,
            subject,
            buildStatusEmailHTML(applicant_name, application_type, status, reason, reference_number),
            SMTP_EMAIL,
            SMTP_APP_PASSWORD
          );
          results.email.push({ recipient: "applicant", success: true });
        } catch (e) {
          results.email.push({
            recipient: "applicant",
            success: false,
            error: (e as Error).message,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-status-notification:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
