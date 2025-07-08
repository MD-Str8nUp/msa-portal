// /api/import-excel/route.ts
// Enhanced Excel processing for complex MSA family data with multiple children and detailed group assignments

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import * as bcrypt from 'bcryptjs';

interface EnhancedFamilyExcelRow {
  'Submission Date*'?: string;
  'Submission ID'?: string;
  'Parent First Name*'?: string;
  'Parent Last Name*'?: string;
  'Parent Email*'?: string;
  'Parent Phone*'?: string;
  'Street Address*'?: string;
  'City*'?: string;
  'State*'?: string;
  'Postal Code*'?: number;
  'How Heard About MSA'?: string;
  'Child First Name*'?: string;
  'Child Last Name*'?: string;
  'Child Date of Birth*'?: string;
  'Child Age*'?: number;
  'Child Gender*'?: string;
  'Child School'?: string;
  'Child Uniform Top Size'?: string;
  'Child Uniform Bottom Size'?: string;
  'Child Allergies/Medical'?: string;
  'Child Division (Auto-Assigned)'?: string;
  'Application Status*'?: string;
  'Priority Score'?: number;
  'Notes'?: string;
  // Alternative column names for flexible parsing
  'parent_first_name'?: string;
  'Parent First Name'?: string;
  'parent_last_name'?: string;
  'Parent Last Name'?: string;
  'parent_email'?: string;
  'Parent Email'?: string;
  'child_first_name'?: string;
  'Child First Name'?: string;
  'child_last_name'?: string;
  'Child Last Name'?: string;
  'child_age'?: number;
  'Child Age'?: number;
}

interface EnhancedStaffExcelRow {
  'Full Name*'?: string;
  'Role*'?: string;
  'Email*'?: string;
  'Phone Number*'?: string;
  'Group Assignment*'?: string;
  'Start Date'?: string;
  'Qualifications'?: string;
  'Emergency Contact'?: string;
  'Working With Children Check'?: string;
  'Islamic Studies Background'?: string;
  'Previous Scouting Experience'?: string;
  'Notes'?: string;
}

class EnhancedMSAExcelImporter {
  
  /**
   * Determines detailed group assignment based on age
   */
  private getDetailedGroupAssignment(age: number): string {
    if (age === 5) return 'Joeys A';
    if (age === 6) return 'Joeys B';
    if (age === 7) return 'Joeys C';
    if (age === 8) return 'Cubs A';
    if (age === 9) return 'Cubs B';
    if (age === 10 || age === 11) return 'Cubs C';
    if (age === 12) return 'Scouts A';
    if (age === 13) return 'Scouts B';
    if (age >= 14 && age <= 15) return 'Scouts C';
    if (age >= 16 && age <= 18) return 'Rovers';
    return 'Cubs'; // default
  }

  /**
   * Processes enhanced family application data with multiple children support
   */
  async processFamilyData(data: EnhancedFamilyExcelRow[]) {
    const results = {
      processed: 0,
      errors: [] as string[],
      families: [] as any[],
      scouts: [] as any[],
      multipleChildrenFamilies: 0
    };

    // Track families to detect multiple children
    const familyTracker = new Map<string, { parentId: string; childrenCount: number }>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number

      try {
        // Flexible column matching for parent data
        const parentFirstName = row['Parent First Name*'] || row['parent_first_name'] || row['Parent First Name'];
        const parentLastName = row['Parent Last Name*'] || row['parent_last_name'] || row['Parent Last Name'];
        const parentEmail = row['Parent Email*'] || row['parent_email'] || row['Parent Email'];

        // Validate required fields
        if (!parentFirstName || !parentLastName || !parentEmail) {
          results.errors.push(`Row ${rowNum}: Missing required parent information`);
          continue;
        }

        const email = parentEmail!.toLowerCase().trim();
        
        // Create parent user data
        const parentData = {
          name: `${parentFirstName!.trim()} ${parentLastName!.trim()}`,
          email: email,
          password: await bcrypt.hash('MSA_temp_password_2024', 12), // Temporary password
          role: 'parent',
          isParent: true,
          isLeader: false,
          isExecutive: false,
          isSupport: false
        };

        let parentId: string;

        // Check if parent already exists (for multiple children families)
        if (familyTracker.has(email)) {
          parentId = familyTracker.get(email)!.parentId;
          familyTracker.get(email)!.childrenCount++;
        } else {
          // Check database for existing parent
          const existingParent = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true }
          });

          if (existingParent) {
            // Update existing parent
            const updatedParent = await prisma.user.update({
              where: { email: email },
              data: parentData,
              select: { id: true }
            });
            parentId = updatedParent.id;
          } else {
            // Create new parent
            const newParent = await prisma.user.create({
              data: parentData,
              select: { id: true }
            });
            parentId = newParent.id;
          }

          familyTracker.set(email, { parentId, childrenCount: 1 });
          results.families.push({ ...parentData, id: parentId });
        }

        // Process child data if available
        const childFirstName = row['Child First Name*'] || row['child_first_name'] || row['Child First Name'];
        const childAge = row['Child Age*'] || row['child_age'] || row['Child Age'];
        
        if (childFirstName && childAge) {
          // Get detailed group assignment
          const detailedGroup = this.getDetailedGroupAssignment(childAge);

          // Find or create the group
          let group = await prisma.group.findUnique({
            where: { name: detailedGroup }
          });

          if (!group) {
            group = await prisma.group.create({
              data: {
                name: detailedGroup,
                description: this.getGroupDescription(detailedGroup)
              }
            });
          }

          const childLastName = row['Child Last Name*'] || row['child_last_name'] || row['Child Last Name'] || parentLastName;

          const scoutData = {
            name: `${childFirstName!.trim()} ${childLastName!.trim()}`,
            age: childAge,
            rank: 'New Scout',
            parentId: parentId,
            groupId: group.id
          };

          // Create scout
          const newScout = await prisma.scout.create({
            data: scoutData,
            select: { id: true }
          });

          results.scouts.push({ ...scoutData, id: newScout.id });
        }

        results.processed++;

      } catch (error) {
        results.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Count families with multiple children
    results.multipleChildrenFamilies = Array.from(familyTracker.values())
      .filter(family => family.childrenCount > 1).length;

    return results;
  }

  /**
   * Processes enhanced staff data
   */
  async processStaffData(data: EnhancedStaffExcelRow[]) {
    const results = {
      processed: 0,
      errors: [] as string[],
      staff: [] as any[]
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      try {
        // Flexible column matching for staff data
        const fullName = row['Full Name*'] || row['name'] || row['Name'];
        const staffRole = row['Role*'] || row['role'] || row['Role'];
        const email = row['Email*'] || row['email'] || row['Email'];

        // Validate required fields
        if (!fullName || !staffRole || !email) {
          results.errors.push(`Row ${rowNum}: Missing required staff information`);
          continue;
        }

        // Map role to system roles
        const role = this.mapStaffRole(staffRole!);
        
        const staffData = {
          name: fullName!.trim(),
          email: email!.toLowerCase().trim(),
          password: await bcrypt.hash('MSA_temp_password_2024', 12), // Temporary password
          role,
          isParent: false,
          isLeader: role === 'leader',
          isExecutive: role === 'executive',
          isSupport: role === 'support'
        };

        // Check if staff member already exists
        const existingStaff = await prisma.user.findUnique({
          where: { email: staffData.email },
          select: { id: true }
        });

        let staffId: string;

        if (existingStaff) {
          // Update existing staff
          const updatedStaff = await prisma.user.update({
            where: { email: staffData.email },
            data: staffData,
            select: { id: true }
          });
          staffId = updatedStaff.id;
        } else {
          // Create new staff member
          const newStaff = await prisma.user.create({
            data: staffData,
            select: { id: true }
          });
          staffId = newStaff.id;
        }

        // Handle group assignments for leaders
        if (role === 'leader' && row['Group Assignment*']) {
          await this.assignLeaderToGroups(staffId, row['Group Assignment*']);
        }

        results.staff.push({ ...staffData, id: staffId, groupAssignment: row['Group Assignment*'] });
        results.processed++;

      } catch (error) {
        results.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Assigns a leader to groups using Prisma
   */
  private async assignLeaderToGroups(leaderId: string, groupAssignment: string) {
    const groups = groupAssignment.split(',').map(g => g.trim());
    
    for (const groupName of groups) {
      if (['Joeys A', 'Joeys B', 'Joeys C', 'Cubs A', 'Cubs B', 'Cubs C', 
           'Scouts A', 'Scouts B', 'Scouts C', 'Rovers', 'Multiple', 'Support'].includes(groupName)) {
        
        if (groupName === 'Multiple' || groupName === 'Support') {
          // Handle special assignments
          continue;
        }

        // Find or create the group
        let group = await prisma.group.findUnique({
          where: { name: groupName }
        });

        if (!group) {
          group = await prisma.group.create({
            data: {
              name: groupName,
              description: this.getGroupDescription(groupName)
            }
          });
        }

        // Create group membership for leader using UserGroup
        await prisma.userGroup.upsert({
          where: {
            userId_groupId: {
              userId: leaderId,
              groupId: group.id
            }
          },
          update: {
            role: 'leader'
          },
          create: {
            userId: leaderId,
            groupId: group.id,
            role: 'leader'
          }
        });
      }
    }
  }


  /**
   * Gets description for each detailed group
   */
  private getGroupDescription(groupName: string): string {
    const descriptions = {
      'Joeys A': 'Age 5 - Saturday 9:00 AM',
      'Joeys B': 'Age 6 - Saturday 10:00 AM',
      'Joeys C': 'Age 7 - Saturday 11:00 AM',
      'Cubs A': 'Age 8 - Saturday 1:00 PM',
      'Cubs B': 'Age 9 - Saturday 2:00 PM',
      'Cubs C': 'Age 10-11 - Saturday 3:00 PM',
      'Scouts A': 'Age 12 - Saturday 4:00 PM',
      'Scouts B': 'Age 13 - Saturday 5:00 PM',
      'Scouts C': 'Age 14-15 - Saturday 6:00 PM',
      'Rovers': 'Age 16-18 - Friday 7:00 PM'
    };
    
    return descriptions[groupName as keyof typeof descriptions] || `${groupName} scout group`;
  }


  /**
   * Maps Excel staff role to database role
   */
  private mapStaffRole(excelRole: string): 'leader' | 'executive' | 'support' {
    const role = excelRole.toLowerCase();
    if (role.includes('executive')) return 'executive';
    if (role.includes('support')) return 'support';
    return 'leader'; // default
  }

}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    const importer = new EnhancedMSAExcelImporter();
    let results;

    if (type === 'families') {
      results = await importer.processFamilyData(data);
    } else if (type === 'staff') {
      results = await importer.processStaffData(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid import type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.processed} records`,
      details: {
        processed: results.processed,
        errors: results.errors,
        familiesCreated: type === 'families' ? results.families?.length || 0 : 0,
        scoutsCreated: type === 'families' ? results.scouts?.length || 0 : 0,
        multipleChildrenFamilies: type === 'families' ? results.multipleChildrenFamilies || 0 : 0,
        staffCreated: type === 'staff' ? results.staff?.length || 0 : 0
      }
    });

  } catch (error) {
    console.error('Enhanced Excel import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process Excel data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['families', 'staff'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid template type' },
        { status: 400 }
      );
    }

    // Return enhanced templates with detailed group structure
    const templates = {
      families: {
        headers: [
          'Submission Date*', 'Submission ID', 'Parent First Name*', 'Parent Last Name*', 'Parent Email*',
          'Parent Phone*', 'Street Address*', 'City*', 'State*', 'Postal Code*', 'How Heard About MSA',
          'Child First Name*', 'Child Last Name*', 'Child Date of Birth*', 'Child Age*',
          'Child Gender*', 'Child School', 'Child Uniform Top Size', 'Child Uniform Bottom Size',
          'Child Allergies/Medical', 'Child Division (Auto-Assigned)', 'Application Status*', 'Priority Score', 'Notes'
        ],
        groupAssignments: {
          5: 'Joeys A', 6: 'Joeys B', 7: 'Joeys C',
          8: 'Cubs A', 9: 'Cubs B', 10: 'Cubs C', 11: 'Cubs C',
          12: 'Scouts A', 13: 'Scouts B', 14: 'Scouts C', 15: 'Scouts C',
          16: 'Rovers', 17: 'Rovers', 18: 'Rovers'
        }
      },
      staff: {
        headers: [
          'Full Name*', 'Role*', 'Email*', 'Phone Number*', 'Group Assignment*',
          'Start Date', 'Qualifications', 'Emergency Contact', 'Working With Children Check',
          'Islamic Studies Background', 'Previous Scouting Experience', 'Notes'
        ],
        groupOptions: [
          'Joeys A', 'Joeys B', 'Joeys C', 'Cubs A', 'Cubs B', 'Cubs C',
          'Scouts A', 'Scouts B', 'Scouts C', 'Rovers', 'Multiple', 'Support'
        ]
      }
    };

    const template = templates[type as keyof typeof templates];
    
    return NextResponse.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Enhanced template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate enhanced template' },
      { status: 500 }
    );
  }
}