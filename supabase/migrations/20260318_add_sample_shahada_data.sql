-- Add sample shahada applications if table is empty
INSERT INTO shahada_applications (
  user_id, first_name, last_name, email, phone, current_religion, conversion_reason,
  witness1_name, witness1_phone, witness1_relationship,
  witness2_name, witness2_phone, witness2_relationship,
  status, created_at, updated_at
) VALUES
  (
    gen_random_uuid(), 'Ahmed', 'Hassan', 'ahmed.hassan@example.com', '+250788123456',
    'Christian', 'I want to convert to Islam after studying the religion for 2 years',
    'Mohammed Ali', '+250787654321', 'Friend',
    'Mariam Hassan', '+250786543210', 'Colleague',
    'pending', NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Fatima', 'Mohamed', 'fatima.mohamed@example.com', '+250789234567',
    'Buddhist', 'I have been learning about Islam and want to embrace it fully',
    'Abdul Rahman', '+250785432109', 'Community Leader',
    'Aisha Ali', '+250784321098', 'Teacher',
    'approved', NOW(), NOW()
  ),
  (
    gen_random_uuid(), 'Ibrahim', 'Ali', 'ibrahim.ali@example.com', '+250787345678',
    'Hindu', 'I believe in the teachings of Islam and want to convert',
    'Yusuf Hassan', '+250782109876', 'Mentor',
    'Khadija Mohamed', '+250781098765', 'Family Friend',
    'processing', NOW(), NOW()
  )
ON CONFLICT DO NOTHING;
