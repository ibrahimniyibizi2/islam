// Script to create bucket via Supabase API
// You'll need to add your SERVICE_ROLE_KEY to run this

const { createClient } = require('@supabase/supabase-js');

// You need to get this from your Supabase dashboard > Settings > API
const SUPABASE_URL = 'https://olpvftgnmycofavltxoa.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace this!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('nikah-documents', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }

    console.log('Bucket created successfully:', data);
    
    // Verify bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createBucket();
