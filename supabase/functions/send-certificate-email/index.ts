// Supabase Edge Function to send certificate emails via Gmail
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight first
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    })
  }

  try {
    const { certificateNumber, email, groomName, brideName, verificationUrl } = await req.json()

    // Validate required fields
    if (!certificateNumber || !email) {
      return new Response(
        JSON.stringify({ error: 'Certificate number and email are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Gmail credentials from environment
    const GMAIL_USER = Deno.env.get('GMAIL_USER')
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')
    
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in Supabase secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content
    const subject = `Marriage Certificate - ${certificateNumber}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d6b36;">Marriage Certificate</h2>
        <p>Dear ${groomName || 'Valued Client'} & ${brideName || 'Valued Client'},</p>
        <p>Your marriage certificate has been issued by the Rwanda Islamic Community.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Certificate Number:</strong> ${certificateNumber}</p>
          <p style="margin: 5px 0;"><strong>Groom:</strong> ${groomName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Bride:</strong> ${brideName || 'N/A'}</p>
        </div>
        
        <p>You can verify your certificate online:</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #2d6b36; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;">
          Verify Certificate
        </a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Rwanda Islamic Community<br>
          Official Marriage Certificate System
        </p>
      </div>
    `

    // Send email using Gmail SMTP via fetch
    const emailBody = [
      `From: Rwanda Islamic Community <${GMAIL_USER}>`,
      `To: ${email}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      htmlContent
    ].join('\r\n')

    // Base64 encode the email
    const encodedEmail = btoa(emailBody)

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GMAIL_APP_PASSWORD}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gmail API error:', error)
      
      // Fallback: Try SMTP via Brevo
      return await sendViaSMTP(email, subject, htmlContent, GMAIL_USER, GMAIL_APP_PASSWORD, corsHeaders)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Fallback SMTP function
async function sendViaSMTP(to: string, subject: string, html: string, from: string, password: string, cors: any) {
  try {
    // Simple SMTP implementation via Brevo
    const smtpResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': password,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: from, name: 'Rwanda Islamic Community' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    })

    if (!smtpResponse.ok) {
      throw new Error('SMTP send failed')
    }

    return new Response(
      JSON.stringify({ success: true, method: 'smtp' }),
      { 
        status: 200, 
        headers: { ...cors, 'Content-Type': 'application/json' } 
      }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to send email: ' + e.message }),
      { 
        status: 500, 
        headers: { ...cors, 'Content-Type': 'application/json' } 
      }
    )
  }
}
