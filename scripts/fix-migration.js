#!/usr/bin/env node

/**
 * Fix MSA Data Migration Issues
 * 1. Fix date format conversion
 * 2. Use correct scout_groups table
 * 3. Handle existing parent accounts
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Convert DD/MM/YYYY to YYYY-MM-DD
const convertDateFormat = (dateStr) => {
  if (!dateStr) return null;
  
  const [day, month, year] = dateStr.split('/');
  if (day && month && year) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
};

// Age-based group assignments for scout_groups
const getScoutGroupByAge = (age) => {
  if (age >= 5 && age <= 7) return 'Joeys'; // Will need to create this in scout_groups
  if (age >= 8 && age <= 11) return 'Cubs C'; // Maps to existing Cubs C
  if (age >= 12 && age <= 15) return 'Scouts A'; // Maps to existing Scouts A
  return 'Cubs C'; // Default fallback
};

async function fixMigration() {
  console.log('🔧 Starting MSA Data Migration Fix...');
  
  const csvPath = path.join(__dirname, '..', 'MSA_Applications .csv');
  const records = [];
  
  // Read CSV data
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.child_first_name && row.child_last_name && row.parent_email) {
          records.push(row);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Processing ${records.length} valid applications...`);
          
          // Step 1: Create missing scout groups
          await createMissingScoutGroups();
          
          // Step 2: Get existing parent accounts
          const existingParents = await getExistingParents();
          
          // Step 3: Create scout records with proper date conversion
          await createScoutRecordsFixed(records, existingParents);
          
          console.log('✅ Migration fix complete!');
          resolve();
        } catch (error) {
          console.error('❌ Migration fix failed:', error);
          reject(error);
        }
      });
  });
}

async function createMissingScoutGroups() {
  console.log('📋 Creating missing scout groups...');
  
  // We need Joeys in scout_groups table
  const { data: existing } = await supabase
    .from('scout_groups')
    .select('id, name');
    
  console.log('✅ Existing scout groups:', existing.map(g => g.name));
  
  const joeysExists = existing.some(g => g.name === 'Joeys');
  
  if (!joeysExists) {
    const { error } = await supabase
      .from('scout_groups')
      .insert({
        name: 'Joeys',
        description: 'Ages 5-7: Joey scouts'
      });
      
    if (error) {
      console.error('❌ Error creating Joeys scout group:', error);
    } else {
      console.log('✅ Created Joeys scout group');
    }
  } else {
    console.log('✅ Joeys scout group already exists');
  }
}

async function getExistingParents() {
  console.log('👥 Getting existing parent accounts...');
  
  const { data: parents, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('role', 'parent');
    
  if (error) {
    console.error('❌ Error getting existing parents:', error);
    return new Map();
  }
  
  const parentMap = new Map();
  parents.forEach(parent => {
    parentMap.set(parent.email.toLowerCase(), parent.id);
  });
  
  console.log(`✅ Found ${parents.length} existing parent accounts`);
  return parentMap;
}

async function createScoutRecordsFixed(records, parentMap) {
  console.log('🧒 Creating scout records with fixes...');
  
  // Get scout_groups mapping
  const { data: scoutGroups } = await supabase
    .from('scout_groups')
    .select('id, name');
    
  const scoutGroupMap = new Map();
  scoutGroups.forEach(g => scoutGroupMap.set(g.name, g.id));
  
  console.log('📋 Available scout groups:', Array.from(scoutGroupMap.keys()));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const record of records) {
    try {
      const parentEmail = record.parent_email.toLowerCase().trim();
      const parentId = parentMap.get(parentEmail);
      
      if (!parentId) {
        console.log(`⚠️  Parent not found for scout: ${record.child_first_name} (${parentEmail})`);
        errorCount++;
        continue;
      }
      
      const age = parseInt(record.child_age);
      const scoutGroupName = getScoutGroupByAge(age);
      const scoutGroupId = scoutGroupMap.get(scoutGroupName);
      
      if (!scoutGroupId) {
        console.error(`❌ Scout group not found: ${scoutGroupName} for age ${age}`);
        errorCount++;
        continue;
      }
      
      // Check if scout already exists
      const { data: existingScout } = await supabase
        .from('scouts')
        .select('id')
        .eq('first_name', record.child_first_name)
        .eq('last_name', record.child_last_name)
        .eq('parent_id', parentId)
        .single();
        
      if (existingScout) {
        console.log(`✅ Scout already exists: ${record.child_first_name} ${record.child_last_name}`);
        continue;
      }
      
      const scoutData = {
        first_name: record.child_first_name,
        last_name: record.child_last_name,
        age: age,
        date_of_birth: convertDateFormat(record.child_dob),
        gender: record.child_gender,
        school: record.child_school,
        group_id: scoutGroupId, // Using scout_groups table ID
        parent_id: parentId,
        uniform_top: record.child_uniform_top,
        uniform_bottom: record.child_uniform_bottom,
        allergies: record.child_allergies === 'None' ? null : record.child_allergies,
        division: scoutGroupName,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('scouts')
        .insert(scoutData);
        
      if (error) {
        console.error(`❌ Error creating scout ${record.child_first_name}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Scout created: ${record.child_first_name} ${record.child_last_name} (${scoutGroupName}, Age: ${age})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing scout ${record.child_first_name}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Scout Creation Summary:`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Errors/Skipped: ${errorCount}`);
}

// Execute migration fix if run directly
if (require.main === module) {
  fixMigration()
    .then(() => {
      console.log('🎉 MSA Data Migration Fix Complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMigration };