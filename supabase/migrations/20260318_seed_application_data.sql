-- Insert sample application data for testing

-- Sample Shahada Applications
INSERT INTO shahada_applications (applicant_name, applicant_email, current_religion, desired_religion, reason, references, status) VALUES
('Ahmed Hassan', 'ahmed.hassan@example.com', 'Christianity', 'Islam', 'Personal conviction and study of Islamic teachings', ARRAY['Imam Ali Mosque', 'Islamic Center Kigali'], 'pending'),
('Fatima Mohamed', 'fatima.mohamed@example.com', 'None', 'Islam', 'Spiritual journey and connection to Islamic community', ARRAY['Kigali Central Mosque'], 'approved'),
('John Smith', 'john.smith@example.com', 'Catholic', 'Islam', 'Marriage to Muslim partner and desire to convert', ARRAY['Islamic Center Kigali'], 'processing');

-- Sample Marriage Applications  
INSERT INTO marriage_applications (applicant_name, applicant_email, spouse_name, wedding_date, masjid, witnesses, status) VALUES
('Aisha Hassan', 'aisha.hassan@example.com', 'Mohammed Ali', '2024-04-20', 'Kigali Central Mosque', ARRAY['Abdul Rahman', 'Aisha Hassan'], 'approved'),
('Khadija Mohamed', 'khadija.mohamed@example.com', 'Omar Hassan', '2024-05-15', 'Islamic Center Kigali', ARRAY['Ibrahim Hassan', 'Mariam Ali'], 'pending'),
('Zainab Ali', 'zainab.ali@example.com', 'Yusuf Mohamed', '2024-06-10', 'Nyarugenge Mosque', ARRAY['Ahmed Hassan', 'Fatima Mohamed'], 'processing');

-- Sample Residence Certificate Applications
INSERT INTO residence_applications (applicant_name, applicant_email, address, duration, purpose, documents, status) VALUES
('John Smith', 'john.smith@example.com', 'KN 123 Street, Kigali', '5 years', 'Employment', ARRAY['Passport', 'Work Permit', 'Lease Agreement'], 'processing'),
('Jane Doe', 'jane.doe@example.com', 'KN 456 Avenue, Kigali', '3 years', 'Family reunification', ARRAY['Passport', 'Visa', 'Marriage Certificate'], 'approved'),
('Robert Johnson', 'robert.johnson@example.com', 'KN 789 Road, Kigali', '2 years', 'Business', ARRAY['Passport', 'Business License', 'Tax Clearance'], 'pending');

-- Sample Business Registration Applications
INSERT INTO business_applications (applicant_name, applicant_email, business_type, registration_number, capital, directors, status) VALUES
'Rwanda Tech Ltd', 'info@rwandatech.rw', 'Technology Services', '123456789', 'RWF 10,000,000', ARRAY['John Doe', 'Jane Smith'], 'pending'),
'Kigali Trading Co', 'contact@kigalitrading.rw', 'Import/Export', '987654321', 'RWF 5,000,000', ARRAY['Mohamed Ali', 'Aisha Hassan'], 'approved'),
'Islamic Finance Bank', 'admin@islamicbank.rw', 'Financial Services', '456789123', 'RWF 50,000,000', ARRAY['Abdul Rahman', 'Ibrahim Hassan', 'Mariam Ali'], 'processing');
