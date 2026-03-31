# 🧪 Test Script for Certificate Email Function

## Quick Test from Browser Console

```javascript
// Test the certificate email function
const testCertificateEmail = async (applicationId) => {
  console.log('🧪 Testing certificate email function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-shahada-certificate-email', {
      body: { applicationId: applicationId }
    });
    
    console.log('✅ Result:', { data, error });
    
    if (data?.success) {
      console.log('🎉 SUCCESS! Email sent to:', data.email);
      console.log('📄 File name:', data.fileName);
    } else {
      console.error('❌ FAILED:', error);
    }
    
  } catch (err) {
    console.error('💥 ERROR:', err);
  }
};

// Usage: Replace with a real application ID
testCertificateEmail('your-application-id-here');
```

## Test with cURL

```bash
# Test via command line
curl -X POST 'https://olpvftgnmycofavltxoa.supabase.co/functions/v1/send-shahada-certificate-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"applicationId": "test-application-id"}'
```

## Expected Success Response

```json
{
  "success": true,
  "message": "Certificate sent successfully",
  "email": "user@example.com",
  "fileName": "shahada-certificate-john-doe.pdf",
  "applicationId": "abc-123",
  "timestamp": "2026-03-31T19:41:00.000Z"
}
```

## Check Logs

```bash
# View function logs
npx supabase functions logs send-shahada-certificate-email
```

## Validation Checklist

- [ ] Application exists in database
- [ ] Application has email address
- [ ] Application status is "completed"
- [ ] RESEND_API_KEY is set
- [ ] generate-multilingual-shahada-certificate function works
- [ ] Email arrives with PDF attachment
- [ ] PDF opens correctly
