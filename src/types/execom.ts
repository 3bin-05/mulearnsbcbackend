export interface ExeComMember {
  id: string;
  name: string;
  mulearnId: string;
  position: string;
  roleTitle?: string;
  branch: string;
  year: string;
  email: string;
  phone: string;
  dob: string;
  imageUrl: string;
  socials: {
    linkedin: string;
    github: string;
    instagram: string;
    twitter: string;
    website: string;
    discord: string;
  };
  bio: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export const PREDEFINED_POSITIONS = [
  'Lead',
  'Co Lead',
  'Enabler Lead',
  'Tech Associate',
  'HR',
  'Mentor',
  'IG Lead',
  'Creative Lead',
  'Creative Team',
  'Operations Lead',
  'Operations Team',
  'Marketing Lead',
  'Marketing Team',
  'Media Lead',
  'Media Team',
  'MuV Lead',
  'MuV Team'
] as const;

export type ExeComPosition = typeof PREDEFINED_POSITIONS[number];
