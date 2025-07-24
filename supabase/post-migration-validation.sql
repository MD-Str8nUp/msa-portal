-- MSA Portal Post-Migration Validation Queries
-- Run these queries after data migration to validate the import

-- 1. Migration Summary Report
DO $$
DECLARE
  total_users INTEGER;
  parent_users INTEGER;
  total_scouts INTEGER;
  total_addresses INTEGER;
  total_applications INTEGER;
  joeys_count INTEGER;
  cubs_count INTEGER;
  scouts_count INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO parent_users FROM users WHERE role = 'PARENT';
  
  -- Count scouts
  SELECT COUNT(*) INTO total_scouts FROM scouts;
  
  -- Count addresses
  SELECT COUNT(*) INTO total_addresses FROM addresses;
  
  -- Count applications
  SELECT COUNT(*) INTO total_applications FROM applications;
  
  -- Count scouts by division
  SELECT COUNT(*) INTO joeys_count FROM scouts s
    JOIN groups g ON s.group_id = g.id 
    WHERE g.name = 'Joeys';
    
  SELECT COUNT(*) INTO cubs_count FROM scouts s
    JOIN groups g ON s.group_id = g.id 
    WHERE g.name = 'Cubs';
    
  SELECT COUNT(*) INTO scouts_count FROM scouts s
    JOIN groups g ON s.group_id = g.id 
    WHERE g.name = 'Scouts';
  
  -- Display summary
  RAISE NOTICE '=== MSA MIGRATION SUMMARY ===';
  RAISE NOTICE 'Total Users: %', total_users;
  RAISE NOTICE 'Parent Users: %', parent_users;
  RAISE NOTICE 'Total Scouts: %', total_scouts;
  RAISE NOTICE 'Total Addresses: %', total_addresses;
  RAISE NOTICE 'Total Applications: %', total_applications;
  RAISE NOTICE '';
  RAISE NOTICE 'Scout Distribution:';
  RAISE NOTICE '- Joeys (5-7): %', joeys_count;
  RAISE NOTICE '- Cubs (8-11): %', cubs_count;
  RAISE NOTICE '- Scouts (12-15): %', scouts_count;
END $$;

-- 2. Data Quality Validation
-- Check for orphaned scouts (scouts without parents)
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.parent_id,
  'Orphaned Scout - No Parent Found' as issue
FROM scouts s
LEFT JOIN users u ON s.parent_id = u.id
WHERE u.id IS NULL;

-- Check for parents without addresses
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  'Parent Without Address' as issue
FROM users u
LEFT JOIN addresses a ON u.id = a.user_id
WHERE u.role = 'PARENT' AND a.id IS NULL;

-- Check for age-division mismatches
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.age,
  g.name as division,
  CASE 
    WHEN g.name = 'Joeys' AND (s.age < 5 OR s.age > 7) THEN 'Age mismatch - should be 5-7'
    WHEN g.name = 'Cubs' AND (s.age < 8 OR s.age > 11) THEN 'Age mismatch - should be 8-11'
    WHEN g.name = 'Scouts' AND (s.age < 12 OR s.age > 15) THEN 'Age mismatch - should be 12-15'
    ELSE 'OK'
  END as validation_result
FROM scouts s
JOIN groups g ON s.group_id = g.id
WHERE 
  (g.name = 'Joeys' AND (s.age < 5 OR s.age > 7)) OR
  (g.name = 'Cubs' AND (s.age < 8 OR s.age > 11)) OR
  (g.name = 'Scouts' AND (s.age < 12 OR s.age > 15));

-- Check for duplicate emails
SELECT 
  email,
  COUNT(*) as count,
  STRING_AGG(first_name || ' ' || last_name, ', ') as users
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 3. Parent-Scout Relationship Validation
SELECT 
  u.first_name || ' ' || u.last_name as parent_name,
  u.email as parent_email,
  COUNT(s.id) as child_count,
  STRING_AGG(s.first_name || ' ' || s.last_name || ' (' || g.name || ')', ', ') as children
FROM users u
LEFT JOIN scouts s ON u.id = s.parent_id
LEFT JOIN groups g ON s.group_id = g.id
WHERE u.role = 'PARENT'
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY u.last_name, u.first_name;

-- 4. Group Distribution Report
SELECT 
  g.name as division,
  COUNT(s.id) as scout_count,
  AVG(s.age) as avg_age,
  MIN(s.age) as min_age,
  MAX(s.age) as max_age,
  COUNT(DISTINCT s.gender) as gender_diversity
FROM groups g
LEFT JOIN scouts s ON g.id = s.group_id
WHERE g.type = 'SCOUT_GROUP'
GROUP BY g.id, g.name
ORDER BY g.name;

-- 5. Medical Information Summary
SELECT 
  'Scouts with Allergies/Medical Info' as category,
  COUNT(*) as count
FROM scouts 
WHERE allergies_medical IS NOT NULL AND allergies_medical != '';

SELECT 
  'Scouts without Medical Info' as category,
  COUNT(*) as count
FROM scouts 
WHERE allergies_medical IS NULL OR allergies_medical = '';

-- 6. Uniform Size Distribution
SELECT 
  uniform_size_top as size,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM scouts
WHERE uniform_size_top IS NOT NULL
GROUP BY uniform_size_top
ORDER BY uniform_size_top;

-- 7. School Distribution
SELECT 
  school,
  COUNT(*) as student_count
FROM scouts
WHERE school IS NOT NULL AND school != ''
GROUP BY school
ORDER BY student_count DESC;

-- 8. Migration Log Summary
SELECT 
  migration_name,
  status,
  records_processed,
  records_successful,
  records_failed,
  CASE 
    WHEN records_processed > 0 THEN 
      ROUND(records_successful * 100.0 / records_processed, 1)
    ELSE 0 
  END as success_rate_percentage,
  started_at,
  completed_at,
  CASE 
    WHEN completed_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (completed_at - started_at))
    ELSE NULL
  END as duration_seconds
FROM migration_log
ORDER BY started_at DESC;

-- 9. Address Completeness Check
SELECT 
  'Addresses with all fields' as category,
  COUNT(*) as count
FROM addresses 
WHERE street_address IS NOT NULL 
  AND city IS NOT NULL 
  AND state IS NOT NULL 
  AND postal_code IS NOT NULL;

-- 10. Export data for external validation (sample queries)
-- Uncomment and run individually if needed for external reports

/*
-- Parent contact list for welcome emails
SELECT 
  u.first_name,
  u.last_name,
  u.email,
  u.phone,
  COUNT(s.id) as children_count
FROM users u
LEFT JOIN scouts s ON u.id = s.parent_id
WHERE u.role = 'PARENT'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone
ORDER BY u.last_name, u.first_name;

-- Scout roster by division
SELECT 
  g.name as division,
  s.first_name,
  s.last_name,
  s.age,
  s.gender,
  s.school,
  u.first_name || ' ' || u.last_name as parent_name,
  u.email as parent_email,
  u.phone as parent_phone
FROM scouts s
JOIN groups g ON s.group_id = g.id
JOIN users u ON s.parent_id = u.id
ORDER BY g.name, s.last_name, s.first_name;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VALIDATION COMPLETE ===';
  RAISE NOTICE 'Review the results above for any data quality issues.';
  RAISE NOTICE 'Address any problems before proceeding with user notifications.';
END $$;