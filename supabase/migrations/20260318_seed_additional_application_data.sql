-- Insert sample data for additional application tables

-- Marriage Applications (Nikah)
INSERT INTO marriage_applications (
  user_id, applicant_name, applicant_email, applicant_phone,
  spouse_name, spouse_email, spouse_phone, wedding_date, masjid, imam_name,
  witnesses, marriage_type, documents, special_requirements, status
) VALUES
  (
    gen_random_uuid(), 'Aisha Hassan', 'aisha.hassan@example.com', '+250788123456',
    'Mohammed Ali', 'mohammed.ali@example.com', '+250787654321', '2024-04-20',
    'Kigali Central Mosque', 'Imam Ibrahim Hassan', 
    ARRAY['Abdul Rahman', 'Aisha Hassan'], 'nikah',
    ARRAY['ID cards', 'Passport copies', 'Birth certificates'], 'Traditional ceremony preferred', 'approved'
  ),
  (
    gen_random_uuid(), 'Khadija Mohamed', 'khadija.mohamed@example.com', '+250789234567',
    'Omar Hassan', 'omar.hassan@example.com', '+250788345678', '2024-05-15',
    'Islamic Center Kigali', 'Imam Yusuf Kimoni',
    ARRAY['Ibrahim Hassan', 'Mariam Ali'], 'both',
    ARRAY['IDs', 'Residence proof', 'Medical certificates'], 'Requires pre-marital counseling', 'pending'
  ),
  (
    gen_random_uuid(), 'Zainab Ali', 'zainab.ali@example.com', '+250787456789',
    'Yusuf Mohamed', 'yusuf.mohamed@example.com', '+250786567890', '2024-06-10',
    'Nyarugenge Mosque', 'Imam Abdul Karim',
    ARRAY['Ahmed Hassan', 'Fatima Mohamed'], 'nikah',
    ARRAY['Passports', 'Visa copies', 'Police clearance'], 'International marriage', 'processing'
  );

-- Residence Certificate Applications
INSERT INTO residence_applications (
  user_id, applicant_name, applicant_email, applicant_phone,
  address, city, district, duration, purpose, employer_name, employer_address,
  documents, special_notes, status
) VALUES
  (
    gen_random_uuid(), 'John Smith', 'john.smith@example.com', '+250785678901',
    'KN 123 Street, Kiyovu', 'Kigali', 'Nyarugenge', '2 years', 'employment',
    'Rwanda Tech Ltd', 'KN 456 Avenue, Kacyiru',
    ARRAY['Passport', 'Work Permit', 'Lease Agreement', 'Employment Letter'], 'Need urgent processing', 'approved'
  ),
  (
    gen_random_uuid(), 'Jane Doe', 'jane.doe@example.com', '+250784789012',
    'KN 789 Avenue, Remera', 'Kigali', 'Gasabo', '3 years', 'family reunification',
    NULL, NULL,
    ARRAY['Passport', 'Visa', 'Marriage Certificate', 'Spouse ID'], 'Husband is Rwandan citizen', 'pending'
  ),
  (
    gen_random_uuid(), 'Robert Johnson', 'robert.johnson@example.com', '+250783890123',
    'KN 234 Road, Nyabugogo', 'Kigali', 'Nyarugenge', '1 year', 'business',
    'Johnson Enterprises', 'KN 567 Street, Gisozi',
    ARRAY['Passport', 'Business License', 'Tax Clearance', 'Bank Statement'], 'Renewing existing permit', 'processing'
  );

-- Business Registration Applications
INSERT INTO business_applications (
  user_id, applicant_name, applicant_email, applicant_phone,
  business_name, business_type, registration_number, capital, business_address,
  business_phone, business_email, directors, employees_count, business_description,
  documents, license_type, status
) VALUES
  (
    gen_random_uuid(), 'John Doe', 'john.doe@rwandatech.rw', '+250782901234',
    'Rwanda Tech Solutions', 'Technology Services', 'RWB/TECH/2024/001', 'RWF 15,000,000',
    'KN 890 Avenue, Kacyiru', '+250789012345', 'info@rwandatech.rw',
    ARRAY['John Doe', 'Jane Smith', 'Robert Johnson'], 12,
    'Software development and IT consulting company specializing in fintech solutions',
    ARRAY['Business Plan', 'Director IDs', 'Tax Clearance', 'Office Lease', 'Certificate of Incorporation'], 'professional', 'approved'
  ),
  (
    gen_random_uuid(), 'Mariam Ali', 'mariam.ali@kigalitrading.rw', '+250781012345',
    'Kigali Trading Company', 'Import/Export', 'RWB/TRADE/2024/002', 'RWF 8,000,000',
    'KN 345 Street, Nyabugogo', '+250788123456', 'contact@kigalitrading.rw',
    ARRAY['Mariam Ali', 'Hassan Mohamed'], 8,
    'Import and distribution of consumer goods and electronics',
    ARRAY['Trade License', 'Import Permit', 'Warehouse Lease', 'Director IDs'], 'standard', 'pending'
  ),
  (
    gen_random_uuid(), 'Abdul Karim', 'abdul.karim@islamicbank.rw', '+250780123456',
    'Islamic Finance Rwanda', 'Financial Services', 'RWB/BANK/2024/003', 'RWF 100,000,000',
    'KN 678 Boulevard, Kimihurura', '+250787234567', 'admin@islamicbank.rw',
    ARRAY['Abdul Karim', 'Yusuf Hassan', 'Aisha Mohamed', 'Ibrahim Ali'], 25,
    'Islamic banking and financial services compliant with Sharia principles',
    ARRAY['Banking License', 'BNR Approval', 'Board Resolutions', 'Shareholder Agreements', 'Audit Reports'], 'industrial', 'processing'
  );
