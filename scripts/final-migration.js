#!/usr/bin/env node

/**
 * Final MSA Data Migration Script
 * - Uses correct division enum values (Joeys, Cubs, Scouts)  
 * - Maps to existing scout_groups (Joeys A, Cubs A, Scouts A)
 * - Handles existing parent accounts properly
 * - Converts date format correctly
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
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

// Age-based mapping to actual scout groups and divisions
const getScoutMapping = (age) => {
  if (age >= 5 && age <= 7) {
    return { 
      division: 'Joeys',
      groupName: 'Joeys A' // Use first available Joeys group
    };
  }
  if (age >= 8 && age <= 11) {
    return { 
      division: 'Cubs',
      groupName: 'Cubs A' // Use first available Cubs group
    };
  }
  if (age >= 12 && age <= 15) {
    return { 
      division: 'Scouts',
      groupName: 'Scouts A' // Use first available Scouts group
    };
  }
  return { 
    division: 'Cubs',
    groupName: 'Cubs A' // Default fallback
  };
};

async function finalMigration() {
  console.log('🎯 Starting Final MSA Data Migration...');
  
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
          
          // Get existing parent accounts and scout groups
          const [parentMap, scoutGroupMap] = await Promise.all([
            getExistingParents(),
            getScoutGroups()
          ]);
          
          // Create scout records
          await createScoutRecords(records, parentMap, scoutGroupMap);
          
          console.log('✅ Final migration complete!');
          resolve();
        } catch (error) {
          console.error('❌ Final migration failed:', error);
          reject(error);
        }
      });
  });
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
    parentMap.set(parent.email.toLowerCase().trim(), parent.id);
  });
  
  console.log(`✅ Found ${parents.length} existing parent accounts`);
  
  // Show sample of email keys for debugging
  console.log('📧 Sample parent emails:', Array.from(parentMap.keys()).slice(0, 5));
  
  return parentMap;
}

async function getScoutGroups() {
  console.log('📋 Getting scout groups...');
  
  const { data: scoutGroups, error } = await supabase
    .from('scout_groups')
    .select('id, name');
    
  if (error) {
    console.error('❌ Error getting scout groups:', error);
    return new Map();
  }
  
  const scoutGroupMap = new Map();
  scoutGroups.forEach(g => scoutGroupMap.set(g.name, g.id));
  
  console.log('✅ Available scout groups:', Array.from(scoutGroupMap.keys()));
  return scoutGroupMap;
}

async function createScoutRecords(records, parentMap, scoutGroupMap) {
  console.log('🧒 Creating scout records...');
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  for (const record of records) {
    try {
      const parentEmail = record.parent_email.toLowerCase().trim();
      const parentId = parentMap.get(parentEmail);
      
      if (!parentId) {
        console.log(`⚠️  Parent not found: ${parentEmail} for scout ${record.child_first_name}`);
        errorCount++;
        continue;
      }
      
      const age = parseInt(record.child_age);
      const { division, groupName } = getScoutMapping(age);
      const scoutGroupId = scoutGroupMap.get(groupName);
      
      if (!scoutGroupId) {
        console.error(`❌ Scout group not found: ${groupName}`);
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
        skipCount++;
        continue;
      }
      
      const scoutData = {
        first_name: record.child_first_name,
        last_name: record.child_last_name,
        age: age,
        date_of_birth: convertDateFormat(record.child_dob),
        gender: record.child_gender,
        school: record.child_school,
        group_id: scoutGroupId,
        parent_id: parentId,
        uniform_top: record.child_uniform_top,
        uniform_bottom: record.child_uniform_bottom,
        allergies: record.child_allergies === 'None' ? null : record.child_allergies,
        division: division, // Using correct enum value
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('scouts')
        .insert(scoutData);
        
      if (error) {
        console.error(`❌ Error creating scout ${record.child_first_name} ${record.child_last_name}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Scout created: ${record.child_first_name} ${record.child_last_name} (${division}, Age: ${age}, Group: ${groupName})`);
        successCount++;
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (err) {
      console.error(`❌ Error processing scout ${record.child_first_name}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Final Scout Creation Summary:`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ⚠️  Already existed: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total processed: ${successCount + skipCount + errorCount}`);
}

// Execute final migration if run directly
if (require.main === module) {
  finalMigration()
    .then(() => {
      console.log('🎉 Final MSA Data Migration Complete!');
      console.log('📋 Your MSA Portal now has real data from all applications!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Final migration failed:', error);
      process.exit(1);
    });
}

module.exports = { finalMigration };