import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Excel import request received:', { 
      type: body.type, 
      dataLength: body.data?.length 
    });

    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array.' },
        { status: 400 }
      );
    }

    if (body.type === 'families') {
      return await processFamilyData(body.data);
    } else if (body.type === 'staff') {
      return await processStaffData(body.data);
    } else {
      return NextResponse.json(
        { error: 'Invalid import type. Expected "families" or "staff".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Excel import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Excel import' },
      { status: 500 }
    );
  }
}

async function processFamilyData(data: any[]) {
  const results = {
    processed: 0,
    parents: { created: 0, updated: 0 },
    scouts: { created: 0, errors: 0 },
    groups: { created: 0 },
    errors: [] as string[]
  };

  for (const row of data) {
    try {
      // Extract parent data
      const parentEmail = row['Parent Email*'] || row['parent_email'] || row['Parent Email'];
      const parentFirstName = row['Parent First Name*'] || row['parent_first_name'] || row['Parent First Name'];
      const parentLastName = row['Parent Last Name*'] || row['parent_last_name'] || row['Parent Last Name'];

      if (!parentEmail || !parentFirstName || !parentLastName) {
        results.errors.push(`Missing required parent data for row ${results.processed + 1}`);
        continue;
      }

      // Check if parent exists
      const { data: existingParent } = await supabase
        .from('users')
        .select('*')
        .eq('email', parentEmail)
        .single();

      let parentId: string;

      if (existingParent) {
        // Update existing parent
        const { data: updatedParent, error } = await supabase
          .from('users')
          .update({
            first_name: parentFirstName,
            last_name: parentLastName,
            phone: row['Parent Phone*'] || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingParent.id)
          .select()
          .single();

        if (error) throw error;
        parentId = existingParent.id;
        results.parents.updated++;
      } else {
        // Create new parent
        const hashedPassword = await bcrypt.hash('temppass123', 10);
        const { data: newParent, error } = await supabase
          .from('users')
          .insert({
            email: parentEmail,
            first_name: parentFirstName,
            last_name: parentLastName,
            phone: row['Parent Phone*'] || null,
            password: hashedPassword,
            role: 'PARENT',
            status: 'ACTIVE'
          })
          .select()
          .single();

        if (error) throw error;
        parentId = newParent.id;
        results.parents.created++;
      }

      // Process scout data
      const childFirstName = row['Child First Name*'] || row['child_first_name'] || row['Child First Name'];
      const childLastName = row['Child Last Name*'] || row['child_last_name'] || row['Child Last Name'];
      const childAge = row['Child Age*'] || row['child_age'] || row['Child Age'];

      if (childFirstName && childLastName && childAge) {
        // Determine group based on age
        const groupName = childAge >= 12 ? 'Venturer Scouts' : 'Joey Scouts';
        
        // Find or create group
        let { data: group } = await supabase
          .from('groups')
          .select('*')
          .eq('name', groupName)
          .single();

        if (!group) {
          const { data: newGroup, error } = await supabase
            .from('groups')
            .insert({
              name: groupName,
              type: childAge >= 12 ? 'VENTURERS' : 'JOEYS',
              description: `${groupName} group`,
              status: 'ACTIVE'
            })
            .select()
            .single();

          if (error) throw error;
          group = newGroup;
          results.groups.created++;
        }

        // Create scout
        const { data: newScout, error } = await supabase
          .from('scouts')
          .insert({
            first_name: childFirstName,
            last_name: childLastName,
            date_of_birth: row['Child Date of Birth*'] || null,
            age: parseInt(childAge),
            gender: row['Child Gender*'] || null,
            school: row['Child School'] || null,
            uniform_size_top: row['Child Uniform Top Size'] || null,
            uniform_size_bottom: row['Child Uniform Bottom Size'] || null,
            allergies_medical: row['Child Allergies/Medical'] || null,
            parent_id: parentId,
            group_id: group.id,
            status: 'ACTIVE'
          })
          .select();

        if (error) {
          results.errors.push(`Failed to create scout: ${error.message}`);
          results.scouts.errors++;
        } else {
          results.scouts.created++;
        }
      }

      results.processed++;
    } catch (error: any) {
      results.errors.push(`Row ${results.processed + 1}: ${error.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    message: `Processed ${results.processed} family records`,
    results
  });
}

async function processStaffData(data: any[]) {
  const results = {
    processed: 0,
    staff: { created: 0, updated: 0 },
    groups: { created: 0 },
    errors: [] as string[]
  };

  for (const row of data) {
    try {
      const email = row['Email*'] || row['email'];
      const fullName = row['Full Name*'] || row['full_name'];
      const role = row['Role*'] || row['role'];

      if (!email || !fullName || !role) {
        results.errors.push(`Missing required staff data for row ${results.processed + 1}`);
        continue;
      }

      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // Check if staff exists
      const { data: existingStaff } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      let staffId: string;

      if (existingStaff) {
        // Update existing staff
        const { data: updatedStaff, error } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            role: role.toUpperCase(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStaff.id)
          .select()
          .single();

        if (error) throw error;
        staffId = existingStaff.id;
        results.staff.updated++;
      } else {
        // Create new staff
        const hashedPassword = await bcrypt.hash('temppass123', 10);
        const { data: newStaff, error } = await supabase
          .from('users')
          .insert({
            email,
            first_name: firstName,
            last_name: lastName,
            password: hashedPassword,
            role: role.toUpperCase(),
            status: 'ACTIVE'
          })
          .select()
          .single();

        if (error) throw error;
        staffId = newStaff.id;
        results.staff.created++;
      }

      results.processed++;
    } catch (error: any) {
      results.errors.push(`Row ${results.processed + 1}: ${error.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    message: `Processed ${results.processed} staff records`,
    results
  });
}
