// MSA Portal Excel Template Generator - Updated for Real MSA Data Structure
// Handles multiple children per family and detailed age-based group assignments

import * as XLSX from 'xlsx';

interface FamilyApplication {
  submission_date: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: number;
  how_heard: string;
  child_first_name?: string;
  child_last_name?: string;
  child_dob?: string;
  child_age?: number;
  child_gender?: string;
  child_school?: string;
  child_uniform_top?: string;
  child_uniform_bottom?: string;
  child_allergies?: string;
  child_division?: string;
  status: string;
  notes?: string;
}

interface StaffMember {
  name: string;
  role: string;
  email: string;
  phone?: string;
  group_assignment?: string;
  start_date?: string;
  qualifications?: string;
  emergency_contact?: string;
}

class MSAExcelTemplateGenerator {
  
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
   * Creates comprehensive Family Applications Excel Template
   */
  createFamilyApplicationsTemplate(): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    
    // Main data sheet with ALL required fields from real MSA data
    const familyData = [
      // Complete header row matching real MSA application structure
      [
        'Submission Date*', 'Submission ID', 'Parent First Name*', 'Parent Last Name*', 'Parent Email*', 
        'Parent Phone*', 'Street Address*', 'City*', 'State*', 'Postal Code*', 'How Heard About MSA',
        'Child First Name*', 'Child Last Name*', 'Child Date of Birth*', 'Child Age*',
        'Child Gender*', 'Child School', 'Child Uniform Top Size', 'Child Uniform Bottom Size',
        'Child Allergies/Medical', 'Child Division (Auto-Assigned)', 'Application Status*', 'Priority Score', 'Notes'
      ],
      
      // Sample rows showing real Islamic family examples
      [
        '01/07/2025', 'MSA_80', 'Fatima', 'Ahmed', 'fatima.ahmed@email.com',
        '(02) 9876 5432', '123 Crescent Road', 'Lakemba', 'NSW', 2195, 'Word of mouth',
        'Omar', 'Ahmed', '15/03/2015', 10, 'Male', 'Al-Faisal College', 'Size 10', 'Size 10',
        'None', 'Cubs C', 'Approved', 85, 'Welcome to MSA!'
      ],
      [
        '02/07/2025', 'MSA_81', 'Ali', 'Hassan', 'ali.hassan@email.com',
        '0412 345 678', '456 Park Road', 'Punchbowl', 'NSW', 2196, 'Facebook',
        'Aisha', 'Hassan', '20/08/2017', 8, 'Female', 'Islamic School', 'Size 8', 'Size 8',
        'None', 'Cubs A', 'Pending Review', 75, ''
      ],
      [
        '03/07/2025', 'MSA_82', 'Hassan', 'Hijazi', 'hassan.hijazi@email.com',
        '(02) 9555 1234', '789 Main Street', 'Bankstown', 'NSW', 2200, 'Friend referral',
        'Zahra', 'Hijazi', '12/11/2018', 6, 'Female', 'Malek Fahd Islamic School', 'Size 6', 'Size 6',
        'None', 'Joeys B', 'Approved', 90, 'Excited to join!'
      ],
      
      // Multiple children example
      [
        '04/07/2025', 'MSA_83', 'Mariam', 'Droubi', 'mariam.droubi@email.com',
        '0433 567 890', '321 Cedar Lane', 'Auburn', 'NSW', 2144, 'Community event',
        'Ahmed', 'Droubi', '05/09/2016', 9, 'Male', 'Quba Islamic School', 'Size 10', 'Size 10',
        'None', 'Cubs B', 'Approved', 80, 'First child - older brother to follow'
      ],
      [
        '04/07/2025', 'MSA_84', 'Mariam', 'Droubi', 'mariam.droubi@email.com',
        '0433 567 890', '321 Cedar Lane', 'Auburn', 'NSW', 2144, 'Community event',
        'Hussein', 'Droubi', '22/04/2019', 6, 'Male', 'Quba Islamic School', 'Size 6', 'Size 6',
        'None', 'Joeys B', 'Approved', 80, 'Second child - younger brother'
      ],
      
      // Empty rows for data entry (15 more rows)
      ...Array(15).fill([
        '', '', '', '', '', 
        '', '', '', 'NSW', '', '',
        '', '', '', '', 
        '', '', '', '', 
        'None', '', 'Pending Review', '', ''
      ])
    ];
    
    const familySheet = XLSX.utils.aoa_to_sheet(familyData);
    
    // Set column widths for better readability
    familySheet['!cols'] = [
      {wch: 12}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 25}, // Submission info + Parent details
      {wch: 15}, {wch: 20}, {wch: 15}, {wch: 8}, {wch: 10}, {wch: 18}, // Contact info
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 8}, // Child basic info
      {wch: 8}, {wch: 20}, {wch: 12}, {wch: 12}, // Child details
      {wch: 20}, {wch: 15}, {wch: 15}, {wch: 8}, {wch: 30} // Medical, division, status, notes
    ];
    
    XLSX.utils.book_append_sheet(workbook, familySheet, 'Family Applications');
    
    // Group Assignment Reference Sheet
    const groupAssignmentData = [
      ['MSA Group Assignment Guide - Age-Based Placement'],
      [''],
      ['Age', 'Group Assignment', 'Typical Size', 'Meeting Day/Time'],
      ['5 years', 'Joeys A', '6-8 children', 'Saturday 9:00 AM'],
      ['6 years', 'Joeys B', '6-8 children', 'Saturday 10:00 AM'],
      ['7 years', 'Joeys C', '6-8 children', 'Saturday 11:00 AM'],
      ['8 years', 'Cubs A', '8-10 children', 'Saturday 1:00 PM'],
      ['9 years', 'Cubs B', '8-10 children', 'Saturday 2:00 PM'],
      ['10-11 years', 'Cubs C', '8-12 children', 'Saturday 3:00 PM'],
      ['12 years', 'Scouts A', '8-10 children', 'Saturday 4:00 PM'],
      ['13 years', 'Scouts B', '8-10 children', 'Saturday 5:00 PM'],
      ['14-15 years', 'Scouts C', '6-8 children', 'Saturday 6:00 PM'],
      ['16-18 years', 'Rovers', '6-10 youth', 'Friday 7:00 PM'],
      [''],
      ['IMPORTANT NOTES:'],
      ['• Group assignments are automatic based on child age'],
      ['• Multiple children from same family get separate rows'],
      ['• Each child needs their own complete application row'],
      ['• Division column will auto-populate when age is entered']
    ];
    
    const groupSheet = XLSX.utils.aoa_to_sheet(groupAssignmentData);
    groupSheet['!cols'] = [{wch: 15}, {wch: 20}, {wch: 15}, {wch: 20}];
    XLSX.utils.book_append_sheet(workbook, groupSheet, 'Group Assignments');
    
    // Comprehensive Instructions Sheet
    const instructionsData = [
      ['Mi\'raj Scouts Academy - Complete Family Applications Guide'],
      ['Created for Sarah - Handles Multiple Children & Detailed Group Assignments'],
      [''],
      ['📋 QUICK START FOR MULTIPLE CHILDREN FAMILIES:'],
      ['1. Create ONE ROW per child (not per family)'],
      ['2. Repeat parent information for each child'],
      ['3. Each child gets their own submission ID (MSA_80, MSA_81, etc.)'],
      ['4. Group assignment is automatic based on age'],
      [''],
      ['✅ REQUIRED FIELDS (marked with *):'],
      ['• Submission Date - Format: DD/MM/YYYY (e.g., 15/07/2025)'],
      ['• Parent First Name - Islamic names (Fatima, Ahmed, Ali, Mariam)'],
      ['• Parent Last Name - Family surname'],
      ['• Parent Email - Valid email for portal access (one per family)'],
      ['• Parent Phone - Include area code: (02) 9876 5432 or 0412 345 678'],
      ['• Street Address - Complete street address'],
      ['• City - Suburb (Punchbowl, Lakemba, Bankstown, Auburn, etc.)'],
      ['• State - NSW for all MSA families'],
      ['• Postal Code - 4-digit NSW postcode'],
      ['• Child First Name - Child\'s given name'],
      ['• Child Last Name - Usually same as parent surname'],
      ['• Child Date of Birth - Format: DD/MM/YYYY'],
      ['• Child Age - Current age (5-18 years)'],
      ['• Child Gender - Male or Female'],
      ['• Application Status - Select from dropdown'],
      [''],
      ['🎯 DETAILED GROUP ASSIGNMENTS:'],
      ['Age 5 → Joeys A (Saturday 9:00 AM)'],
      ['Age 6 → Joeys B (Saturday 10:00 AM)'],
      ['Age 7 → Joeys C (Saturday 11:00 AM)'],
      ['Age 8 → Cubs A (Saturday 1:00 PM)'],
      ['Age 9 → Cubs B (Saturday 2:00 PM)'],
      ['Age 10-11 → Cubs C (Saturday 3:00 PM)'],
      ['Age 12 → Scouts A (Saturday 4:00 PM)'],
      ['Age 13 → Scouts B (Saturday 5:00 PM)'],
      ['Age 14-15 → Scouts C (Saturday 6:00 PM)'],
      ['Age 16-18 → Rovers (Friday 7:00 PM)'],
      [''],
      ['👨‍👩‍👧‍👦 HANDLING MULTIPLE CHILDREN:'],
      ['EXAMPLE: Mariam Droubi has 2 children'],
      ['Row 1: Mariam Droubi → Ahmed (9 years) → Cubs B'],
      ['Row 2: Mariam Droubi → Hussein (6 years) → Joeys B'],
      ['• Same parent details in both rows'],
      ['• Different submission IDs (MSA_83, MSA_84)'],
      ['• Each child gets appropriate group assignment'],
      [''],
      ['📞 PHONE NUMBER FORMATS:'],
      ['• Landline: (02) 9876 5432'],
      ['• Mobile: 0412 345 678 or (042) 340-9850'],
      ['• Include area codes for all numbers'],
      [''],
      ['🕌 ISLAMIC NAMES EXAMPLES:'],
      ['Boys: Ahmed, Ali, Omar, Hassan, Hussein, Mohamed, Ibrahim, Yusuf, Khalil'],
      ['Girls: Fatima, Aisha, Zeinab, Mariam, Hawraa, Aminah, Batoul, Khadija, Zahra'],
      [''],
      ['📍 COMMON NSW LOCATIONS:'],
      ['Punchbowl (2196), Lakemba (2195), Bankstown (2200), Auburn (2144)'],
      ['Croydon Park (2133), Bardwell Valley (2207), Picnic Point (2213)'],
      [''],
      ['📝 APPLICATION STATUS OPTIONS:'],
      ['• Approved - Family/child accepted into MSA'],
      ['• Pending Review - Application under review (default)'],
      ['• On Waitlist - Waiting for group space'],
      ['• Requires Info - Missing information needed'],
      ['• Interview Scheduled - Parent meeting arranged'],
      ['• Declined - Application not accepted'],
      [''],
      ['🏫 SCHOOL EXAMPLES:'],
      ['• Al-Faisal College'],
      ['• Islamic School'],
      ['• Al Zahraa College'],
      ['• Malek Fahd Islamic School'],
      ['• Quba Islamic School'],
      ['• Arrahman College'],
      [''],
      ['⚠️ TROUBLESHOOTING:'],
      ['• Red cells = Error that must be fixed'],
      ['• Yellow cells = Warning, please review'],
      ['• Green cells = Valid data, ready for upload'],
      ['• Multiple children = One row per child with same parent details'],
      [''],
      ['📧 CONTACT SUPPORT:'],
      ['For technical help, contact Moe at MSA Portal development team'],
      ['For community questions, contact Sarah at MSA administration']
    ];
    
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{wch: 80}];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
    
    return workbook;
  }
  
  /**
   * Creates Staff Management Excel Template with detailed role assignments
   */
  createStaffManagementTemplate(): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    
    const staffData = [
      // Header row with all staff fields
      [
        'Full Name*', 'Role*', 'Email*', 'Phone Number*', 'Group Assignment*',
        'Start Date', 'Qualifications', 'Emergency Contact', 'Working With Children Check',
        'Islamic Studies Background', 'Previous Scouting Experience', 'Notes'
      ],
      
      // Real MSA staff examples
      [
        'Rehab Kassem', 'Leader', 'rehab.kassem@msascouts.org.au',
        '(02) 9876 5432', 'Cubs C', '01/01/2025',
        'Scout Leader Training, First Aid', 'Spouse: (02) 9876 5433', 'Current',
        'Islamic Studies Degree', '5 years group leadership', 'Experienced Cubs leader'
      ],
      [
        'Ali Makki', 'Leader', 'ali.makki@msascouts.org.au',
        '0412 345 678', 'Scouts A', '15/02/2025',
        'Youth Work Certificate', 'Parent: (02) 9876 5434', 'Pending',
        'Community Islamic education', 'New to scouting', 'Enthusiastic new volunteer'
      ],
      [
        'Hassan Hijazi', 'Leader', 'hassan.hijazi@msascouts.org.au',
        '(02) 9555 7890', 'Joeys B', '01/03/2025',
        'Child Protection Training', 'Brother: 0433 123 456', 'Current',
        'Madrassa teacher', '2 years assistant leader', 'Great with young children'
      ],
      [
        'Mohamed Dirani', 'Support', 'mohamed.dirani@msascouts.org.au',
        '0455 234 567', 'Multiple', '01/12/2024',
        'Event Management, Logistics', 'Wife: 0466 345 678', 'Current',
        'Community volunteer', 'Event coordination', 'Scouting officer and logistics'
      ],
      [
        'Hassan Ellachi', 'Support', 'hassan.ellachi@msascouts.org.au',
        '0477 456 789', 'Media/Support', '15/11/2024',
        'Digital Marketing, Photography', 'Friend: 0488 567 890', 'Current',
        'Islamic media experience', 'Content creation', 'Media and communications specialist'
      ],
      
      // Empty rows for additional staff
      ...Array(10).fill([
        '', 'Leader', '', '', 'Multiple', '',
        '', '', '', '', '', ''
      ])
    ];
    
    const staffSheet = XLSX.utils.aoa_to_sheet(staffData);
    
    // Set column widths for all staff fields
    staffSheet['!cols'] = [
      {wch: 20}, {wch: 12}, {wch: 30}, {wch: 15}, {wch: 15},
      {wch: 12}, {wch: 30}, {wch: 25}, {wch: 15},
      {wch: 25}, {wch: 25}, {wch: 30}
    ];
    
    XLSX.utils.book_append_sheet(workbook, staffSheet, 'Staff Management');
    
    // Staff role assignments reference
    const staffRolesData = [
      ['MSA Staff Roles & Group Assignments'],
      [''],
      ['Role Type', 'Responsibilities', 'Typical Groups', 'Requirements'],
      ['Leader', 'Direct group leadership, activities, mentoring', 'Single age group', 'WWCC, Training'],
      ['Support', 'Admin, logistics, events, specialized skills', 'Multiple/All groups', 'WWCC, Skills'],
      ['AGL Support', 'Area Group Leader assistance', 'Multiple groups', 'Experience, WWCC'],
      ['Executive', 'Academy management, strategy, oversight', 'All groups', 'Leadership experience'],
      [''],
      ['Group Assignment Options:'],
      ['Joeys A (Age 5)', 'Joeys B (Age 6)', 'Joeys C (Age 7)'],
      ['Cubs A (Age 8)', 'Cubs B (Age 9)', 'Cubs C (Age 10-11)'],
      ['Scouts A (Age 12)', 'Scouts B (Age 13)', 'Scouts C (Age 14-15)'],
      ['Rovers (Age 16-18)', 'Multiple (Cross-age)', 'Support (All groups)'],
      [''],
      ['Current MSA Leaders by Group:'],
      ['• Joeys Groups: Need 6 leaders (2 per group)'],
      ['• Cubs Groups: Need 9 leaders (3 per group)'],
      ['• Scouts Groups: Need 9 leaders (3 per group)'],
      ['• Rovers: Need 2-3 leaders'],
      ['• Support Staff: 5-8 specialists needed']
    ];
    
    const rolesSheet = XLSX.utils.aoa_to_sheet(staffRolesData);
    rolesSheet['!cols'] = [{wch: 15}, {wch: 35}, {wch: 20}, {wch: 20}];
    XLSX.utils.book_append_sheet(workbook, rolesSheet, 'Role Assignments');
    
    return workbook;
  }
  
  /**
   * Creates pre-populated template with real MSA data for initial import
   */
  createRealMSADataTemplate(familiesData: FamilyApplication[]): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    
    // Process families data with detailed group assignments
    const familyRows = [
      // Complete headers matching the enhanced template
      [
        'Submission Date', 'Submission ID', 'Parent First Name', 'Parent Last Name', 'Parent Email',
        'Parent Phone', 'Street Address', 'City', 'State', 'Postal Code', 'How Heard About MSA',
        'Child First Name', 'Child Last Name', 'Child Date of Birth', 'Child Age',
        'Child Gender', 'Child School', 'Child Uniform Top Size', 'Child Uniform Bottom Size',
        'Child Allergies/Medical', 'Child Division', 'Application Status', 'Priority Score', 'Notes'
      ],
      
      // Real family data with proper group assignments
      ...familiesData.map((family, index) => [
        family.submission_date,
        family.submission_id || `MSA_${index + 1}`,
        family.parent_first_name,
        family.parent_last_name,
        family.parent_email,
        family.parent_phone || '',
        family.street_address || '',
        family.city || '',
        family.state || 'NSW',
        family.postal_code || '',
        family.how_heard || 'Word of mouth',
        family.child_first_name || '',
        family.child_last_name || '',
        family.child_dob || '',
        family.child_age || '',
        family.child_gender || '',
        family.child_school || '',
        family.child_uniform_top || '',
        family.child_uniform_bottom || '',
        family.child_allergies || 'None',
        family.child_age ? this.getDetailedGroupAssignment(family.child_age) : '',
        family.status || 'Pending Review',
        family.priority_score || 75,
        family.notes || ''
      ])
    ];
    
    const familySheet = XLSX.utils.aoa_to_sheet(familyRows);
    familySheet['!cols'] = Array(24).fill({wch: 15});
    XLSX.utils.book_append_sheet(workbook, familySheet, 'MSA Families Data');
    
    return workbook;
  }
  
  /**
   * Enhanced data validation for comprehensive Excel data
   */
  validateExcelData(data: any[]): {
    errors: string[];
    warnings: string[];
    validRecords: number;
    totalRecords: number;
    multipleChildrenFamilies: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;
    const familyEmails = new Set();
    const multipleChildrenEmails = new Set();
    
    data.forEach((row, index) => {
      const rowNum = index + 2;
      
      // Track families with multiple children
      const email = row['Parent Email*'] || row['parent_email'];
      if (email) {
        if (familyEmails.has(email)) {
          multipleChildrenEmails.add(email);
        }
        familyEmails.add(email);
      }
      
      // Required field validation
      if (!row['Parent First Name*'] && !row['parent_first_name']) {
        errors.push(`Row ${rowNum}: Parent first name is required`);
      }
      if (!row['Parent Email*'] && !row['parent_email']) {
        errors.push(`Row ${rowNum}: Parent email is required`);
      }
      if (!row['Parent Phone*'] && !row['parent_phone']) {
        errors.push(`Row ${rowNum}: Parent phone is required`);
      }
      
      // Enhanced child data validation
      const childAge = row['Child Age*'] || row['child_age'];
      if (childAge) {
        if (childAge < 5 || childAge > 18) {
          warnings.push(`Row ${rowNum}: Child age ${childAge} is outside MSA range (5-18)`);
        }
        
        // Check group assignment matches age
        const expectedGroup = this.getDetailedGroupAssignment(childAge);
        const actualGroup = row['Child Division (Auto-Assigned)'] || row['child_division'];
        if (actualGroup && actualGroup !== expectedGroup) {
          warnings.push(`Row ${rowNum}: Age ${childAge} should be in ${expectedGroup}, not ${actualGroup}`);
        }
        
        validRecords++;
      }
      
      // Address validation
      if (!row['Street Address*'] && !row['street_address']) {
        warnings.push(`Row ${rowNum}: Street address missing`);
      }
      if (!row['City*'] && !row['city']) {
        warnings.push(`Row ${rowNum}: City missing`);
      }
    });
    
    return {
      errors,
      warnings,
      validRecords,
      totalRecords: data.length,
      multipleChildrenFamilies: multipleChildrenEmails.size
    };
  }
}

// Export the enhanced template generator
export const msaTemplateGenerator = new MSAExcelTemplateGenerator();

export function generateMSATemplates() {
  const familyTemplate = msaTemplateGenerator.createFamilyApplicationsTemplate();
  const familyBuffer = XLSX.write(familyTemplate, { bookType: 'xlsx', type: 'buffer' });
  
  const staffTemplate = msaTemplateGenerator.createStaffManagementTemplate();
  const staffBuffer = XLSX.write(staffTemplate, { bookType: 'xlsx', type: 'buffer' });
  
  return {
    familyTemplate: familyBuffer,
    staffTemplate: staffBuffer
  };
}