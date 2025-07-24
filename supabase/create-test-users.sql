-- Create test users with known passwords for MSA Portal testing
-- Password 'secret' hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Clear existing test data
DELETE FROM users WHERE email IN ('admin@msaportal.com', 'test@test.com', 'parent@test.com', 'leader@test.com');

-- Insert test users with 'secret' password
INSERT INTO users (first_name, last_name, email, password, role, status, phone) VALUES 
  ('Admin', 'User', 'admin@msaportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'ACTIVE', '(555) 000-0001'),
  ('Test', 'Parent', 'parent@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARENT', 'ACTIVE', '(555) 000-0002'),
  ('Test', 'Leader', 'leader@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LEADER', 'ACTIVE', '(555) 000-0003'),
  ('Test', 'User', 'test@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARENT', 'ACTIVE', '(555) 000-0004')
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone;

-- Verify users were created
SELECT email, first_name, last_name, role, status FROM users WHERE email IN ('admin@msaportal.com', 'test@test.com', 'parent@test.com', 'leader@test.com');