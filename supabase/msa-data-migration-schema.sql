-- MSA Portal Data Migration Schema Updates
-- This script prepares the database for importing real MSA applications data
-- Execute this BEFORE running the data migration script

-- 1. Update scouts table to include missing fields from CSV data
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female'));
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_size_top TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_size_bottom TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS allergies_medical TEXT;

-- 2. Update applications table to track CSV import metadata
ALTER TABLE applications ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submission_date DATE;

-- 3. Create addresses table for storing parent address information
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Australia',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure required groups exist for scout assignments
INSERT INTO groups (name, type, description) VALUES 
  ('Joeys', 'SCOUT_GROUP', 'For ages 5-7 - Joeys Division'),
  ('Cubs', 'SCOUT_GROUP', 'For ages 8-11 - Cubs Division'),
  ('Scouts', 'SCOUT_GROUP', 'For ages 12-15 - Scouts Division')
ON CONFLICT (name) DO NOTHING;

-- 5. Create indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_scouts_date_of_birth ON scouts(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_scouts_gender ON scouts(gender);
CREATE INDEX IF NOT EXISTS idx_scouts_school ON scouts(school);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_primary ON addresses(is_primary);
CREATE INDEX IF NOT EXISTS idx_applications_external_id ON applications(external_id);
CREATE INDEX IF NOT EXISTS idx_applications_submission_date ON applications(submission_date);

-- 6. Add RLS policies for addresses table
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on addresses" ON addresses
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can view own addresses" ON addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'PARENT'
    )
  );

-- 7. Add trigger for addresses updated_at timestamp
CREATE OR REPLACE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Create helper function to get group ID by division name
CREATE OR REPLACE FUNCTION get_group_id_by_name(group_name TEXT)
RETURNS UUID AS $$
DECLARE
  group_id UUID;
BEGIN
  SELECT id INTO group_id FROM groups WHERE name = group_name LIMIT 1;
  RETURN group_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create helper function to validate age-division assignment
CREATE OR REPLACE FUNCTION validate_age_division(scout_age INTEGER, division_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE 
    WHEN division_name = 'Joeys' AND scout_age BETWEEN 5 AND 7 THEN
      RETURN TRUE;
    WHEN division_name = 'Cubs' AND scout_age BETWEEN 8 AND 11 THEN
      RETURN TRUE;
    WHEN division_name = 'Scouts' AND scout_age BETWEEN 12 AND 15 THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED')),
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for migration_log
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on migration_log" ON migration_log
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Create index for migration_log
CREATE INDEX IF NOT EXISTS idx_migration_log_migration_name ON migration_log(migration_name);
CREATE INDEX IF NOT EXISTS idx_migration_log_status ON migration_log(status);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'MSA Data Migration Schema Update Completed Successfully';
  RAISE NOTICE 'Database is now ready for importing MSA applications data';
  RAISE NOTICE 'Total Groups Available: %', (SELECT COUNT(*) FROM groups WHERE type = 'SCOUT_GROUP');
END $$;