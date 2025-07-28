import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'scouts';
    const format = searchParams.get('format') || 'xlsx';
    
    console.log('Excel export request:', { type, format });

    if (type === 'scouts') {
      return await exportScoutsData(format);
    } else if (type === 'parents') {
      return await exportParentsData(format);
    } else if (type === 'attendance') {
      return await exportAttendanceData(format);
    } else if (type === 'groups') {
      return await exportGroupsData(format);
    } else {
      return NextResponse.json(
        { error: 'Invalid export type. Expected "scouts", "parents", "attendance", or "groups".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Excel export' },
      { status: 500 }
    );
  }
}

async function exportScoutsData(format: string) {
  const { data: scouts, error } = await supabase
    .from('scouts')
    .select(`
      *,
      users!scouts_parent_id_fkey (
        first_name,
        last_name,
        email,
        phone
      ),
      groups (
        name,
        type,
        description
      )
    `)
    .eq('status', 'ACTIVE');

  if (error) {
    throw new Error(`Failed to fetch scouts: ${error.message}`);
  }

  const exportData = scouts?.map(scout => ({
    'Scout First Name': scout.first_name,
    'Scout Last Name': scout.last_name,
    'Age': scout.age,
    'Date of Birth': scout.date_of_birth,
    'Gender': scout.gender,
    'School': scout.school,
    'Group': scout.groups?.name,
    'Group Type': scout.groups?.type,
    'Uniform Top Size': scout.uniform_size_top,
    'Uniform Bottom Size': scout.uniform_size_bottom,
    'Allergies/Medical': scout.allergies_medical,
    'Parent First Name': scout.users?.first_name,
    'Parent Last Name': scout.users?.last_name,
    'Parent Email': scout.users?.email,
    'Parent Phone': scout.users?.phone,
    'Status': scout.status,
    'Joined Date': scout.created_at
  })) || [];

  return createExcelResponse(exportData, 'scouts_export', format);
}

async function exportParentsData(format: string) {
  const { data: parents, error } = await supabase
    .from('users')
    .select(`
      *,
      scouts (
        first_name,
        last_name,
        age,
        groups (
          name
        )
      )
    `)
    .eq('role', 'PARENT')
    .eq('status', 'ACTIVE');

  if (error) {
    throw new Error(`Failed to fetch parents: ${error.message}`);
  }

  const exportData = parents?.map(parent => ({
    'Parent First Name': parent.first_name,
    'Parent Last Name': parent.last_name,
    'Email': parent.email,
    'Phone': parent.phone,
    'Children Count': parent.scouts?.length || 0,
    'Children Names': parent.scouts?.map((s: any) => `${s.first_name} ${s.last_name}`).join(', ') || '',
    'Children Groups': parent.scouts?.map((s: any) => s.groups?.name).join(', ') || '',
    'Status': parent.status,
    'Joined Date': parent.created_at
  })) || [];

  return createExcelResponse(exportData, 'parents_export', format);
}

async function exportAttendanceData(format: string) {
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select(`
      *,
      scouts (
        first_name,
        last_name,
        groups (
          name
        )
      ),
      events (
        title,
        date,
        location
      )
    `);

  if (error) {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }

  const exportData = attendance?.map(record => ({
    'Event': record.events?.title,
    'Event Date': record.events?.date,
    'Location': record.events?.location,
    'Scout Name': `${record.scouts?.first_name} ${record.scouts?.last_name}`,
    'Group': record.scouts?.groups?.name,
    'Status': record.status,
    'Notes': record.notes,
    'Recorded Date': record.created_at
  })) || [];

  return createExcelResponse(exportData, 'attendance_export', format);
}

async function exportGroupsData(format: string) {
  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      *,
      scouts (
        id,
        first_name,
        last_name
      ),
      users!group_leaders (
        first_name,
        last_name,
        email
      )
    `)
    .eq('status', 'ACTIVE');

  if (error) {
    throw new Error(`Failed to fetch groups: ${error.message}`);
  }

  const exportData = groups?.map(group => ({
    'Group Name': group.name,
    'Type': group.type,
    'Description': group.description,
    'Scout Count': group.scouts?.length || 0,
    'Leader Count': group.users?.length || 0,
    'Leaders': group.users?.map((u: any) => `${u.first_name} ${u.last_name}`).join(', ') || '',
    'Status': group.status,
    'Created Date': group.created_at
  })) || [];

  return createExcelResponse(exportData, 'groups_export', format);
}

function createExcelResponse(data: any[], filename: string, format: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: format as any });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.${format}`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fullFilename}"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}