# Environment Setup for Automatic Certificate Email

## 📧 Required Environment Variables

Add these to your Supabase Dashboard → Project Settings → Edge Functions → Secrets:

### 1. Resend API Configuration
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Supabase Configuration (should already exist)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🔧 Setup Instructions

### Step 1: Get Resend API Key
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Sign up/login
3. Go to API Keys → Create API Key
4. Copy the key and add to Supabase secrets

### Step 2: Verify Domain (Optional but Recommended)
1. In Resend Dashboard → Domains
2. Add your domain: `rwanda-islamic.rw`
3. Verify DNS records (TXT, CNAME)
4. This allows sending from your custom domain

### Step 3: Test the Function
```bash
# Test the function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/send-shahada-certificate-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"applicationId": "your-test-application-id"}'
```

---

## 🎯 Integration Points

### 1. Admin Approval Component
Add this to your admin approval logic:

```typescript
import { handleShahadaApproval } from '@/utils/certificateEmailUtils';

// When admin clicks "Complete/Approve"
const onApproveApplication = async (applicationId: string) => {
  await handleShahadaApproval(applicationId, 'completed');
  // Show success message
};
```

### 2. Automatic Trigger via Database Hook (Advanced)
Create a database trigger to automatically send email when status changes:

```sql
-- Create function to trigger email
CREATE OR REPLACE FUNCTION trigger_certificate_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Call the edge function
    PERFORM http_post(
      'https://your-project.supabase.co/functions/v1/send-shahada-certificate-email',
      json_build_object('applicationId', NEW.id),
      headers := json_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER certificate_email_trigger
  AFTER UPDATE ON shahada_applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certificate_email();
```

---

## 📧 Email Template Features

The email includes:
- ✅ **Professional HTML design** with Rwanda Islamic branding
- ✅ **Personalized greeting** with user's name
- ✅ **PDF certificate attachment** with proper filename
- ✅ **Certificate details** (ID, issue date)
- ✅ **Islamic blessings** and professional closing
- ✅ **Responsive design** for mobile/desktop

---

## 🔄 Testing Workflow

### 1. Manual Test
```typescript
// Test from browser console
const testEmail = async () => {
  const { data, error } = await supabase.functions.invoke('send-shahada-certificate-email', {
    body: { applicationId: 'test-application-id' }
  });
  console.log('Result:', { data, error });
};
```

### 2. Admin Approval Test
1. Go to admin dashboard
2. Find a Shahada application with "approved" status
3. Change status to "completed"
4. Check email inbox for certificate
5. Verify PDF attachment opens correctly

### 3. Error Handling Test
- Test with invalid application ID
- Test with application missing email
- Test with expired Resend API key

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. "RESEND_API_KEY not set"
**Solution:** Add the API key to Supabase Edge Functions secrets

#### 2. "Certificate generation failed"
**Solution:** Check if the `generate-multilingual-shahada-certificate` function is deployed and working

#### 3. "Application not found"
**Solution:** Verify the application ID exists and user has access

#### 4. "Failed to send email"
**Solution:** Check Resend API key validity and domain verification

### Debug Logs:
```bash
# View function logs
npx supabase functions logs send-shahada-certificate-email

# View certificate generation logs
npx supabase functions logs generate-multilingual-shahada-certificate
```

---

## 📊 Monitoring

### Success Metrics to Track:
- ✅ Email delivery rate
- ✅ PDF generation success
- ✅ Admin approval completion rate
- ✅ User download rate

### Alert Setup:
Monitor for:
- Failed email sends
- Certificate generation errors
- Missing application data

---

## 🚀 Production Checklist

Before going live:

- [ ] Resend API key configured
- [ ] Domain verified (optional)
- [ ] Test application with valid email
- [ ] Admin approval flow tested
- [ ] Error handling verified
- [ ] Logging and monitoring set up
- [ ] Backup email method configured
- [ ] User documentation updated

---

## 💡 Pro Tips

1. **Batch Processing**: For multiple approvals, consider batching email sends
2. **Retry Logic**: Add retry for failed email sends
3. **Email Templates**: Store templates in database for easy updates
4. **User Preferences**: Allow users to choose email language
5. **Analytics**: Track email open rates and certificate downloads

---

**Ready to automate certificate delivery!** 🎉
