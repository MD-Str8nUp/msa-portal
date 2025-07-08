// MSA Portal Group Structure Constants
// Age-based groups following scouting traditions

export const SCOUT_GROUPS = {
  JOEYS: {
    A: { name: 'Joeys A', ageRange: '5-7', description: 'Youngest scouts group A' },
    B: { name: 'Joeys B', ageRange: '5-7', description: 'Youngest scouts group B' },
    C: { name: 'Joeys C', ageRange: '5-7', description: 'Youngest scouts group C' }
  },
  CUBS: {
    A: { name: 'Cubs A', ageRange: '8-10', description: 'Middle age scouts group A' },
    B: { name: 'Cubs B', ageRange: '8-10', description: 'Middle age scouts group B' },
    C: { name: 'Cubs C', ageRange: '8-10', description: 'Middle age scouts group C' }
  },
  SCOUTS: {
    A: { name: 'Scouts A', ageRange: '11-15', description: 'Senior scouts group A' },
    B: { name: 'Scouts B', ageRange: '11-15', description: 'Senior scouts group B' },
    C: { name: 'Scouts C', ageRange: '11-15', description: 'Senior scouts group C' }
  }
};

// Flatten groups for dropdown options
export const ALL_GROUPS = [
  ...Object.values(SCOUT_GROUPS.JOEYS),
  ...Object.values(SCOUT_GROUPS.CUBS),
  ...Object.values(SCOUT_GROUPS.SCOUTS)
];

// Helper function to get group by age
export function getGroupByAge(age: number): string {
  if (age >= 5 && age <= 7) return 'Joeys';
  if (age >= 8 && age <= 10) return 'Cubs';
  if (age >= 11 && age <= 15) return 'Scouts';
  return 'Unknown';
}

// Helper function to validate group name
export function isValidGroupName(groupName: string): boolean {
  return ALL_GROUPS.some(group => group.name === groupName);
}