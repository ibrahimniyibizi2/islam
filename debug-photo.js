// 🧪 DEBUG SCRIPT: Test Passport Photo in Certificate
// Run this in browser console to test photo fetching

const debugCertificatePhoto = async (applicationId) => {
  console.log('🔍 Debugging certificate photo for application:', applicationId);
  
  try {
    // 1. Check if application has photo URL
    console.log('\n📋 STEP 1: Checking application data...');
    const { data: app, error: appError } = await supabase
      .from('shahada_applications')
      .select('id, first_name, last_name, passport_photo_url, status')
      .eq('id', applicationId)
      .single();
    
    if (appError) {
      console.error('❌ Error fetching application:', appError);
      return;
    }
    
    console.log('Application data:', {
      id: app.id,
      name: `${app.first_name} ${app.last_name}`,
      hasPhotoUrl: !!app.passport_photo_url,
      photoUrl: app.passport_photo_url,
      status: app.status
    });
    
    if (!app.passport_photo_url) {
      console.error('❌ No passport_photo_url found in database!');
      console.log('💡 SOLUTION: User needs to upload photo during application');
      return;
    }
    
    // 2. Test if photo URL is accessible
    console.log('\n📸 STEP 2: Testing photo URL accessibility...');
    try {
      const photoCheck = await fetch(app.passport_photo_url, { method: 'HEAD' });
      console.log('Photo URL check:', {
        status: photoCheck.status,
        ok: photoCheck.ok,
        contentType: photoCheck.headers.get('content-type'),
        contentLength: photoCheck.headers.get('content-length')
      });
      
      if (!photoCheck.ok) {
        console.error('❌ Photo URL not accessible!');
        console.log('💡 SOLUTION: Check storage bucket permissions (documents bucket)');
      }
    } catch (fetchError) {
      console.error('❌ Error fetching photo:', fetchError);
    }
    
    // 3. Try to generate certificate
    console.log('\n📄 STEP 3: Generating certificate PDF...');
    console.log('Calling function with passportPhotoUrl:', app.passport_photo_url);
    
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke('generate-multilingual-shahada-certificate', {
      body: {
        applicationId: app.id,
        fullName: `${app.first_name} ${app.last_name}`,
        dateOfBirth: '1990-01-01', // Replace with actual
        nationality: 'Rwandan', // Replace with actual
        idNumber: '123456789', // Replace with actual
        shahadaDate: new Date().toISOString().split('T')[0],
        location: 'Kigali', // Replace with actual
        witnessName: 'Sheikh Test',
        witnessTitle: 'Imam',
        certificateId: `SHA-${Date.now()}`,
        issueDate: new Date().toISOString().split('T')[0],
        passportPhotoUrl: app.passport_photo_url, // This is the key!
        language: 'en'
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('❌ Certificate generation failed:', error);
      return;
    }
    
    console.log('✅ Certificate generated successfully!');
    console.log('Duration:', duration, 'ms');
    console.log('PDF size:', data?.length || 'unknown', 'bytes');
    
    // 4. Download to check if photo is there
    console.log('\n💾 STEP 4: Downloading PDF to verify...');
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-certificate-${app.first_name}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('📥 PDF downloaded! Check if photo appears in the Personal Information section.');
    
    // 5. Check Supabase Dashboard logs
    console.log('\n🔍 STEP 5: Check logs in Supabase Dashboard:');
    console.log('Go to: https://supabase.com/dashboard/project/olpvftgnmycofavltxoa/functions');
    console.log('Click: generate-multilingual-shahada-certificate');
    console.log('Tab: Logs');
    console.log('Look for: "📸 Photo check", "✅ Passport photo added", or "❌ Failed"');
    
  } catch (error) {
    console.error('💥 Critical error:', error);
  }
};

// Quick check function
const quickPhotoCheck = async (applicationId) => {
  const { data } = await supabase
    .from('shahada_applications')
    .select('passport_photo_url')
    .eq('id', applicationId)
    .single();
  
  console.log('Photo URL:', data?.passport_photo_url || 'NOT SET');
  return data?.passport_photo_url;
};

// Usage:
// debugCertificatePhoto('your-application-id-here');
// quickPhotoCheck('your-application-id-here');
