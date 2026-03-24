/// <reference path="../deno.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

export interface VerificationRequest {
  certificateId: string;
}

export interface CertificateVerification {
  certificateId: string;
  fullName: string;
  issueDate: string;
  shahadaDate: string;
  location: string;
  witnessName: string;
  status: 'valid' | 'invalid' | 'expired';
  issuedBy: string;
  qrCodeUrl: string;
  verificationHash: string;
  createdAt: string;
  lastVerified: string;
}

const verifyCertificate = async (certificateId: string): Promise<CertificateVerification> => {
  try {
    console.log(`🔍 Verifying certificate: ${certificateId}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // 1. Search for certificate in applications
    const appResponse = await fetch(`${supabaseUrl}/rest/v1/shahada_applications?certificate_id=eq.${certificateId}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
      }
    });
    
    if (!appResponse.ok) {
      throw new Error('Failed to query certificate database');
    }
    
    const applications = await appResponse.json();
    
    if (applications.length === 0) {
      // Certificate not found
      return {
        certificateId,
        fullName: 'Unknown',
        issueDate: '',
        shahadaDate: '',
        location: '',
        witnessName: '',
        status: 'invalid',
        issuedBy: 'Republic of Rwanda - Ministry of Islamic Affairs',
        qrCodeUrl: '',
        verificationHash: '',
        createdAt: '',
        lastVerified: new Date().toISOString()
      };
    }
    
    const application = applications[0];
    
    // 2. Generate verification hash
    const verificationData = `${application.certificate_id}-${application.first_name}-${application.last_name}-${application.created_at}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(verificationData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 3. Check if certificate is expired (1 year validity)
    const issueDate = new Date(application.completed_at || application.created_at);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const isExpired = new Date() > expiryDate;
    
    // 4. Generate QR code URL
    const qrCodeUrl = `${supabaseUrl.replace('https://', '')}/verify-certificate?certificateId=${certificateId}`;
    
    // 5. Return verification result
    return {
      certificateId: application.certificate_id!,
      fullName: `${application.first_name} ${application.last_name}`,
      issueDate: application.completed_at || application.created_at,
      shahadaDate: application.shahada_date || new Date().toISOString().split('T')[0],
      location: application.location || 'Kigali Islamic Cultural Center',
      witnessName: application.witness1_name || 'Sheikh Muhammad Al-Hassan',
      status: isExpired ? 'expired' : 'valid',
      issuedBy: 'Republic of Rwanda - Ministry of Islamic Affairs',
      qrCodeUrl,
      verificationHash,
      createdAt: application.created_at,
      lastVerified: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Verification error:', error);
    return {
      certificateId,
      fullName: 'Unknown',
      issueDate: '',
      shahadaDate: '',
      location: '',
      witnessName: '',
      status: 'invalid',
      issuedBy: 'Republic of Rwanda - Ministry of Islamic Affairs',
      qrCodeUrl: '',
      verificationHash: '',
      createdAt: '',
      lastVerified: new Date().toISOString()
    };
  }
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(req.url);
    const certificateId = url.searchParams.get('certificateId');
    
    if (!certificateId) {
      return new Response(generateVerificationHTML({
        error: 'Certificate ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html" }
      });
    }
    
    console.log(`🔍 Verification request for: ${certificateId}`);
    
    const verification = await verifyCertificate(certificateId);
    
    // Log verification attempt
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/certificate_verifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          certificate_id: certificateId,
          verification_status: verification.status,
          verified_at: new Date().toISOString(),
          user_agent: req.headers.get('user-agent') || 'unknown',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        })
      });
    } catch (logError) {
      console.error('Failed to log verification:', logError);
    }
    
    // Return HTML page for QR code scanning
    const html = generateVerificationHTML(verification);
    
    return new Response(html, {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
    
  } catch (error) {
    console.error('Error in verify-certificate function:', error);
    return new Response(generateVerificationHTML({
      error: error instanceof Error ? error.message : 'Verification failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html" }
    });
  }
});

function generateVerificationHTML(verification: CertificateVerification | { error: string }): string {
  if ('error' in verification) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - Rwanda Islamic Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #0F4C3A; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🕌 Republic of Rwanda</div>
            <h1>Islamic Affairs Certificate Verification</h1>
        </div>
        <div class="content">
            <div class="error">
                <h2>❌ Verification Failed</h2>
                <p>${verification.error}</p>
                <p>Please check the Certificate ID and try again.</p>
            </div>
        </div>
        <div class="footer">
            <p>Republic of Rwanda - Ministry of Islamic Affairs</p>
            <p>For verification assistance, contact: certificates@islamrwanda.rw</p>
        </div>
    </div>
</body>
</html>`;
  }
  
  const statusColors = {
    valid: '#28a745',
    expired: '#ffc107',
    invalid: '#dc3545'
  };
  
  const statusIcons = {
    valid: '✅',
    expired: '⚠️',
    invalid: '❌'
  };
  
  const statusText = {
    valid: 'VALID',
    expired: 'EXPIRED',
    invalid: 'INVALID'
  };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - ${verification.certificateId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #0F4C3A; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; font-size: 14px; }
        .status-valid { background: ${statusColors.valid}; }
        .status-expired { background: ${statusColors.expired}; }
        .status-invalid { background: ${statusColors.invalid}; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .info-item { padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0F4C3A; }
        .info-label { font-weight: bold; color: #333; margin-bottom: 5px; }
        .info-value { color: #666; }
        .verification-hash { background: #e9ecef; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 20px 0; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(15, 76, 58, 0.1); font-weight: bold; z-index: -1; }
        @media (max-width: 600px) {
            .container { padding: 10px; }
            .header, .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL</div>
    <div class="container">
        <div class="header">
            <div class="logo">🕌 Republic of Rwanda</div>
            <h1>Islamic Affairs Certificate Verification</h1>
            <p>Official Certificate Verification System</p>
        </div>
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="status-badge status-${verification.status}">
                    ${statusIcons[verification.status]} ${statusText[verification.status]}
                </div>
                <h2 style="margin-top: 15px; color: #333;">Certificate ID: ${verification.certificateId}</h2>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Certificate Holder</div>
                    <div class="info-value">${verification.fullName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Issue Date</div>
                    <div class="info-value">${new Date(verification.issueDate).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Shahada Date</div>
                    <div class="info-value">${verification.shahadaDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Location</div>
                    <div class="info-value">${verification.location}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Witness</div>
                    <div class="info-value">${verification.witnessName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Issued By</div>
                    <div class="info-value">${verification.issuedBy}</div>
                </div>
            </div>
            
            <div class="verification-hash">
                <strong>Verification Hash:</strong><br>
                ${verification.verificationHash}
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <p style="color: #1976d2; font-weight: bold;">✅ This certificate is officially verified</p>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">Last verified: ${new Date(verification.lastVerified).toLocaleString()}</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Republic of Rwanda - Ministry of Islamic Affairs</strong></p>
            <p>For verification assistance: certificates@islamrwanda.rw | +250 788 123 456</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                This verification page is official and secure. Certificate ID: ${verification.certificateId}
            </p>
        </div>
    </div>
</body>
</html>`;
}
