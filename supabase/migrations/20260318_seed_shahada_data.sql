-- Insert sample shahada applications for testing
INSERT INTO shahada_applications (
  user_id, first_name, last_name, email, phone, current_religion, conversion_reason,
  witness1_name, witness1_phone, witness1_relationship,
  witness2_name, witness2_phone, witness2_relationship,
  status
) VALUES
  (
    gen_random_uuid(), 'John', 'Doe', 'john.doe@example.com', '+250788123456',
    'Christian', 'I want to convert to Islam after studying the religion',
    'Ahmed Hassan', '+250787654321', 'Friend',
    'Mariam Ali', '+250786543210', 'Colleague',
    'pending'
  ),
  (
    gen_random_uuid(), 'Jane', 'Smith', 'jane.smith@example.com', '+250789234567',
    'Buddhist', 'I have been learning about Islam and want to embrace it',
    'Mohammed Ali', '+250785432109', 'Community Leader',
    'Fatima Hassan', '+250784321098', 'Teacher',
    'approved'
  ),
  (
    gen_random_uuid(), 'Robert', 'Johnson', 'robert.johnson@example.com', '+250787345678',
    'Hindu', 'I believe in the teachings of Islam and want to convert',
    'Abdul Rahman', '+250782109876', 'Mentor',
    'Aisha Mohamed', '+250781098765', 'Family Friend',
    'processing'
  );

-- Add some rejection examples
INSERT INTO shahada_applications (
  user_id, first_name, last_name, email, phone, current_religion, conversion_reason,
  witness1_name, witness1_phone, witness1_relationship,
  witness2_name, witness2_phone, witness2_relationship,
  status, rejection_reason
) VALUES
  (
    gen_random_uuid(), 'Test', 'User', 'test@example.com', '+250781234567',
    'Atheist', 'Just testing the system',
    'Test Witness 1', '+250787654321', 'Friend',
    'Test Witness 2', '+250786543210', 'Colleague',
    'rejected', 'Insufficient documentation provided'
  );
