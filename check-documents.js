// Script to check and upload missing nikah documents
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://olpvftgnmycofavltxoa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDocuments() {
  console.log('Checking nikah_applications for document URLs...\n');

  // Get all applications with document URLs
  const { data: applications, error } = await supabase
    .from('nikah_applications')
    .select('id, bride_name, groom_name, hiv_test_url, groom_id_document_url, bride_id_document_url, groom_birth_cert_url, bride_birth_cert_url, groom_passport_photo_url, bride_passport_photo_url');

  if (error) {
    console.error('Error fetching applications:', error);
    return;
  }

  console.log(`Found ${applications.length} applications\n`);

  let missingCount = 0;

  for (const app of applications) {
    console.log(`\nApplication: ${app.groom_name} & ${app.bride_name} (${app.id})`);
    console.log('-'.repeat(60));

    const docFields = [
      { name: 'HIV Test', url: app.hiv_test_url },
      { name: 'Groom ID', url: app.groom_id_document_url },
      { name: 'Bride ID', url: app.bride_id_document_url },
      { name: 'Groom Birth Cert', url: app.groom_birth_cert_url },
      { name: 'Bride Birth Cert', url: app.bride_birth_cert_url },
      { name: 'Groom Photo', url: app.groom_passport_photo_url },
      { name: 'Bride Photo', url: app.bride_passport_photo_url },
    ];

    for (const doc of docFields) {
      if (!doc.url) {
        console.log(`  ❌ ${doc.name}: No URL saved`);
        continue;
      }

      // Check if file exists in bucket
      const { data, error: listError } = await supabase.storage
        .from('nikah-documents')
        .list(doc.url.split('/')[0], { search: doc.url.split('/').pop() });

      if (listError || !data || data.length === 0) {
        console.log(`  ❌ ${doc.name}: FILE MISSING - ${doc.url}`);
        missingCount++;
      } else {
        console.log(`  ✅ ${doc.name}: Found`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total missing files: ${missingCount}`);
  console.log(`\nTo fix missing files, you need to:`);
  console.log(`1. Get the files from the applicant (they may need to re-submit)`);
  console.log(`2. Or ask the applicant to create a new application`);
  console.log(`3. Or manually upload files to the correct paths in Supabase Storage`);
}

checkDocuments();
