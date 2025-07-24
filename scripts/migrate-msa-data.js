#!/usr/bin/env node

/**
 * MSA Portal Data Migration Script
 * Migrates real MSA applications data to Supabase
 * Phase 1: Parents & Scouts Setup
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('🔧 Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Age-based group assignments
const getGroupByAge = (age) => {
  if (age >= 5 && age <= 7) return 'Joeys';
  if (age >= 8 && age <= 11) return 'Cubs';  
  if (age >= 12 && age <= 15) return 'Scouts';
  return 'Cubs'; // Default fallback
};

// Generate secure password
const generatePassword = () => Math.random().toString(36).slice(-8);

async function migrateMSAData() {
  console.log('🚀 Starting MSA Data Migration - Phase 1...');
  
  const csvPath = path.join(__dirname, '..', 'MSA_Applications .csv');
  const records = [];
  
  // Read CSV data
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Filter out incomplete records
        if (row.child_first_name && row.child_last_name && row.parent_email) {
          records.push(row);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Processing ${records.length} valid applications...`);
          
          // Phase 1: Create Groups First
          await createScoutGroups();
          
          // Phase 2: Create Parent Accounts
          const parentMap = await createParentAccounts(records);
          
          // Phase 3: Create Scout Records
          await createScoutRecords(records, parentMap);
          
          console.log('✅ Phase 1 Migration Complete!');
          resolve();
        } catch (error) {
          console.error('❌ Migration failed:', error);
          reject(error);
        }
      });
  });
}

async function createScoutGroups() {
  console.log('📋 Creating scout groups...');
  
  const groups = [
    {
      name: 'Joeys',
      description: 'Ages 5-7: Fun, games, and basic scouting activities'
    },
    {
      name: 'Cubs', 
      description: 'Ages 8-11: Adventure, skills, and team activities'
    },
    {
      name: 'Scouts',
      description: 'Ages 12-15: Leadership, outdoor skills, and community service'
    }
  ];
  
  for (const group of groups) {
    // Check if group already exists
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('name', group.name)
      .single();
      
    if (existing) {
      console.log(`✅ Group already exists: ${group.name}`);
    } else {
      const { error } = await supabase
        .from('groups')
        .insert(group);
        
      if (error) {
        console.error(`❌ Error creating group ${group.name}:`, error);
      } else {
        console.log(`✅ Group created: ${group.name}`);
      }
    }
  }
}

async function createParentAccounts(records) {
  console.log('👥 Creating parent accounts...');
  
  const uniqueParents = new Map();
  const parentMap = new Map();
  
  // Deduplicate parents by email
  records.forEach(record => {
    const email = record.parent_email.toLowerCase().trim();
    if (!uniqueParents.has(email)) {
      uniqueParents.set(email, {
        firstName: record.parent_first_name,
        lastName: record.parent_last_name,
        email: email,
        phone: record.parent_phone,
        address: {
          street: record.street_address,
          city: record.city,
          state: record.state,
          postal: record.postal_code
        }
      });
    }
  });
  
  console.log(`📊 Creating ${uniqueParents.size} unique parent accounts...`);
  
  for (const [email, parentData] of uniqueParents) {
    try {
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          first_name: parentData.firstName,
          last_name: parentData.lastName,
          username: parentData.email.split('@')[0], // Use email prefix as username
          email: parentData.email,
          role: 'parent',
          phone: parentData.phone,
          address: `${parentData.address.street}, ${parentData.address.city}, ${parentData.address.state} ${parentData.address.postal}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating parent ${email}:`, error);
      } else {
        parentMap.set(email, data.id);
        console.log(`✅ Parent created: ${parentData.firstName} ${parentData.lastName} (${email})`);
        console.log(`   🔑 Temp password: ${password}`);
      }
    } catch (err) {
      console.error(`❌ Error processing parent ${email}:`, err);
    }
  }
  
  return parentMap;
}

async function createScoutRecords(records, parentMap) {
  console.log('🧒 Creating scout records...');
  
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name');
    
  const groupMap = new Map();
  groups.forEach(g => groupMap.set(g.name, g.id));
  
  for (const record of records) {
    try {
      const parentEmail = record.parent_email.toLowerCase().trim();
      const parentId = parentMap.get(parentEmail);
      
      if (!parentId) {
        console.error(`❌ Parent not found for scout: ${record.child_first_name}`);
        continue;
      }
      
      const age = parseInt(record.child_age);
      const groupName = getGroupByAge(age);
      const groupId = groupMap.get(groupName);
      
      const scoutData = {
        first_name: record.child_first_name,
        last_name: record.child_last_name,
        age: age,
        date_of_birth: record.child_dob,
        gender: record.child_gender,
        school: record.child_school,
        group_id: groupId,
        parent_id: parentId,
        uniform_top: record.child_uniform_top,
        uniform_bottom: record.child_uniform_bottom,
        allergies: record.child_allergies === 'None' ? null : record.child_allergies,
        division: groupName,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('scouts')
        .insert(scoutData);
        
      if (error) {
        console.error(`❌ Error creating scout ${record.child_first_name}:`, error);
      } else {
        console.log(`✅ Scout created: ${record.child_first_name} ${record.child_last_name} (${groupName})`);
      }
    } catch (err) {
      console.error(`❌ Error processing scout ${record.child_first_name}:`, err);
    }
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateMSAData()
    .then(() => {
      console.log('🎉 MSA Data Migration Phase 1 Complete!');
      console.log('📋 Next: Run Phase 2 to set up leaders and group assignments');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateMSAData };