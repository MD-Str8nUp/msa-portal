#!/usr/bin/env node

/**
 * MSA Portal - Real Data Migration Script
 * 
 * This script migrates the 79 real MSA applications from CSV to Supabase database
 * 
 * Prerequisites:
 * 1. Run msa-data-migration-schema.sql first
 * 2. Ensure MCP Supabase connection is active
 * 3. CSV file exists at project root: MSA_Applications .csv
 * 
 * Usage: node scripts/migrate-msa-applications.js
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CSV_FILE_PATH = path.join(process.cwd(), 'MSA_Applications .csv');
const TEMP_PASSWORD = 'temppass123';
const BATCH_SIZE = 10; // Process records in batches to handle errors gracefully

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Parse CSV file and return array of records
 */
function parseCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length === headers.length) {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
        });
        records.push(record);
      }
    }
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    return [];
  }
}

/**
 * Parse a single CSV line handling quotes and commas
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

/**
 * Validate and filter records for migration
 */
function validateRecords(records) {
  const validRecords = [];
  const skippedRecords = [];
  
  for (const record of records) {
    // Skip records with missing child data
    if (record.notes && record.notes.includes('URGENT: No child data')) {
      skippedRecords.push({
        id: record.submission_id,
        reason: 'Missing child data',
        record
      });
      continue;
    }
    
    // Skip duplicate applications
    if (record.notes && record.notes.includes('DUPLICATE APPLICATION')) {
      skippedRecords.push({
        id: record.submission_id,
        reason: 'Duplicate application',
        record
      });
      continue;
    }
    
    // Validate required fields
    if (!record.parent_email || !record.child_first_name || !record.child_age) {
      skippedRecords.push({
        id: record.submission_id,
        reason: 'Missing required fields',
        record
      });
      continue;
    }
    
    validRecords.push(record);
  }
  
  return { validRecords, skippedRecords };
}

/**
 * Get group ID by division name
 */
async function getGroupIdByDivision(division) {
  const { data, error } = await supabase
    .from('groups')
    .select('id')
    .eq('name', division)
    .single();
  
  if (error) {
    console.error(`Error finding group for division ${division}:`, error);
    return null;
  }
  
  return data?.id;
}

/**
 * Check if user already exists
 */
async function checkUserExists(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error(`Error checking user exists for ${email}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Create parent user account
 */
async function createParentUser(record) {
  try {
    // Check if user already exists
    const existingUser = await checkUserExists(record.parent_email);
    if (existingUser) {
      console.log(`User already exists: ${record.parent_email} (${existingUser.first_name} ${existingUser.last_name})`);
      return existingUser.id;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);
    
    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: record.parent_first_name,
        last_name: record.parent_last_name,
        email: record.parent_email,
        password: hashedPassword,
        role: 'PARENT',
        status: 'ACTIVE',
        phone: record.parent_phone
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Created parent user: ${record.parent_email}`);
    return data.id;
  } catch (error) {
    console.error(`Error creating parent user for ${record.parent_email}:`, error);
    throw error;
  }
}

/**
 * Create address record for parent
 */
async function createAddress(userId, record) {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        street_address: record.street_address,
        city: record.city,
        state: record.state,
        postal_code: record.postal_code,
        country: 'Australia',
        is_primary: true
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Created address for user ${userId}`);
    return data.id;
  } catch (error) {
    console.error(`Error creating address for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Parse date from DD/MM/YYYY format
 */
function parseDate(dateString) {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Get default rank by division
 */
function getDefaultRankByDivision(division) {
  const rankMap = {
    'Joeys': 'Joey Scout',
    'Cubs': 'Cub Scout',
    'Scouts': 'Scout'
  };
  return rankMap[division] || 'Scout';
}

/**
 * Create scout record
 */
async function createScout(parentId, groupId, record) {
  try {
    const dateOfBirth = parseDate(record.child_dob);
    
    const { data, error } = await supabase
      .from('scouts')
      .insert({
        first_name: record.child_first_name,
        last_name: record.child_last_name,
        age: parseInt(record.child_age),
        date_of_birth: dateOfBirth,
        gender: record.child_gender,
        school: record.child_school,
        uniform_size_top: record.child_uniform_top,
        uniform_size_bottom: record.child_uniform_bottom,
        allergies_medical: record.child_allergies === 'None' ? null : record.child_allergies,
        parent_id: parentId,
        group_id: groupId,
        rank: getDefaultRankByDivision(record.child_division),
        status: 'ACTIVE'
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Created scout: ${record.child_first_name} ${record.child_last_name} (${record.child_division})`);
    return data.id;
  } catch (error) {
    console.error(`Error creating scout for ${record.child_first_name} ${record.child_last_name}:`, error);
    throw error;
  }
}

/**
 * Create application record
 */
async function createApplication(record) {
  try {
    const submissionDate = parseDate(record.submission_date);
    
    const { data, error } = await supabase
      .from('applications')
      .insert({
        external_id: record.submission_id,
        scout_name: `${record.child_first_name} ${record.child_last_name}`,
        scout_age: parseInt(record.child_age),
        parent_name: `${record.parent_first_name} ${record.parent_last_name}`,
        parent_email: record.parent_email,
        parent_phone: record.parent_phone,
        preferred_group: record.child_division,
        status: 'APPROVED', // Since we're importing approved applications
        notes: record.notes,
        priority_score: parseInt(record.priority_score) || 0,
        submission_date: submissionDate
      })
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Created application record: ${record.submission_id}`);
    return data.id;
  } catch (error) {
    console.error(`Error creating application for ${record.submission_id}:`, error);
    throw error;
  }
}

/**
 * Process a single record
 */
async function processRecord(record) {
  try {
    console.log(`\n--- Processing ${record.submission_id} ---`);
    
    // Get group ID for the division
    const groupId = await getGroupIdByDivision(record.child_division);
    if (!groupId) {
      throw new Error(`Group not found for division: ${record.child_division}`);
    }
    
    // Create parent user
    const parentId = await createParentUser(record);
    
    // Create address
    await createAddress(parentId, record);
    
    // Create scout
    const scoutId = await createScout(parentId, groupId, record);
    
    // Create application record
    await createApplication(record);
    
    return {
      success: true,
      parentId,
      scoutId,
      record: record.submission_id
    };
  } catch (error) {
    console.error(`Failed to process ${record.submission_id}:`, error.message);
    return {
      success: false,
      error: error.message,
      record: record.submission_id
    };
  }
}

/**
 * Log migration start
 */
async function logMigrationStart(totalRecords) {
  const { data, error } = await supabase
    .from('migration_log')
    .insert({
      migration_name: 'MSA_Applications_CSV_Import',
      status: 'STARTED',
      records_processed: 0,
      records_successful: 0,
      records_failed: 0
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error logging migration start:', error);
    return null;
  }
  
  return data.id;
}

/**
 * Update migration log
 */
async function updateMigrationLog(logId, status, stats) {
  const updateData = {
    status,
    records_processed: stats.processed,
    records_successful: stats.successful,
    records_failed: stats.failed
  };
  
  if (status === 'COMPLETED' || status === 'FAILED') {
    updateData.completed_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('migration_log')
    .update(updateData)
    .eq('id', logId);
  
  if (error) {
    console.error('Error updating migration log:', error);
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting MSA Applications Data Migration...\n');
  
  // Parse CSV file
  console.log('📄 Reading CSV file...');
  const rawRecords = parseCSV(CSV_FILE_PATH);
  console.log(`Found ${rawRecords.length} records in CSV file`);
  
  // Validate records
  console.log('\n🔍 Validating records...');
  const { validRecords, skippedRecords } = validateRecords(rawRecords);
  console.log(`Valid records: ${validRecords.length}`);
  console.log(`Skipped records: ${skippedRecords.length}`);
  
  if (skippedRecords.length > 0) {
    console.log('\nSkipped records:');
    skippedRecords.forEach(skip => {
      console.log(`- ${skip.id}: ${skip.reason}`);
    });
  }
  
  // Start migration logging
  const logId = await logMigrationStart(validRecords.length);
  
  // Process records in batches
  const results = [];
  const stats = { processed: 0, successful: 0, failed: 0 };
  
  console.log(`\n🔄 Processing ${validRecords.length} valid records...\n`);
  
  for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
    const batch = validRecords.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records) ---`);
    
    for (const record of batch) {
      const result = await processRecord(record);
      results.push(result);
      
      stats.processed++;
      if (result.success) {
        stats.successful++;
      } else {
        stats.failed++;
      }
      
      // Brief pause between records
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update progress
    console.log(`\nProgress: ${stats.processed}/${validRecords.length} (${stats.successful} successful, ${stats.failed} failed)`);
    
    // Pause between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final statistics
  console.log('\n📊 Migration Statistics:');
  console.log(`Total Records Processed: ${stats.processed}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success Rate: ${((stats.successful / stats.processed) * 100).toFixed(1)}%`);
  
  // Log failed records
  const failedRecords = results.filter(r => !r.success);
  if (failedRecords.length > 0) {
    console.log('\n❌ Failed Records:');
    failedRecords.forEach(failed => {
      console.log(`- ${failed.record}: ${failed.error}`);
    });
  }
  
  // Update migration log
  await updateMigrationLog(logId, stats.failed === 0 ? 'COMPLETED' : 'COMPLETED', stats);
  
  console.log('\n✅ Migration completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Review failed records (if any) and manually process them');
  console.log('2. Send welcome emails to new parents with temporary password: temppass123');
  console.log('3. Generate reports for scout group leaders');
  console.log('4. Validate user authentication for all new accounts');
}

// Run migration
if (require.main === module) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { main, parseCSV, validateRecords };