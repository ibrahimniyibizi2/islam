// Script to create nikah-documents bucket via Supabase API
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://olpvftgnmycofavltxoa.supabase.co';
// Replace with your service role key from Supabase Dashboard > Settings > API
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createBucket() {
  try {
    console.log('Creating nikah-documents bucket...');
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('nikah-documents', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Bucket already exists');
      } else {
        console.error('Error creating bucket:', error);
        return;
      }
    } else {
      console.log('Bucket created successfully:', data);
    }

    // List all buckets to verify
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('\nAvailable buckets:');
    buckets?.forEach(b => console.log(`  - ${b.name} (public: ${b.public})`));

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createBucket();
