export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  initials: string;
  linkedin?: string;
  github?: string;
}

/**
 * CONFIGURABLE TEAM MEMBERS DATA
 * 
 * Edit this array to update team details.
 * Placeholders are maintained exactly as requested.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Samyak Gedam',
    role: 'Team Leader',
    bio: 'Leading computer vision architectures, OCR label ingestion, and bounding-box geometry pipelines.',
    avatar: '/images/team/samyak.jpg',
    initials: 'SG',
    linkedin: 'https://www.linkedin.com/in/samyak-gedam-827a51394/',
    github: 'https://github.com/vitsamyak',
  },
  {
    id: 'member-2',
    name: 'Sameer Jaiswal',
    role: 'AI Engineer',
    bio: 'Designing rule-mapping engines aligned with the Legal Metrology (Packaged Commodities) Rules.',
    avatar: '/images/team/sameer.jpg',
    initials: 'SJ',
    linkedin: 'https://www.linkedin.com/in/sameer-jaiswal-6a3263304/',
    github: 'https://github.com',
  },
  {
    id: 'member-3',
    name: 'Sanshrey Sanagar',
    role: 'Backend Developer',
    bio: 'Architecting high-concurrency cloud pipelines, evidence audit trails, and data persistence layers.',
    avatar: '/images/team/sanshrey.HEIC',
    initials: 'SS',
    linkedin: 'https://www.linkedin.com/in/sanshreysanagar/',
    github: 'https://github.com/sanshrey7273-eng',
  },
  {
    id: 'member-4',
    name: 'Vaishnavi Sandbhor',
    role: 'Frontend Developer',
    bio: 'Crafting intuitive enforcement interfaces, inspector verification workflows, and mobile UX.',
    avatar: '/images/team/vaishnavi.jpeg',
    initials: 'VS',
    linkedin: 'https://www.linkedin.com/in/vaishnavi-sandbhor-42287b386/',
    github: 'https://github.com/vaishnavisandbhor',
  },
  {
    id: 'member-5',
    name: 'Sambhav Jain',
    role: 'Cloud Architect',
    bio: 'Developing robust backend services and ensuring seamless data integration with third-party APIs.',
    avatar: '/images/team/sambhav.jpeg',
    initials: 'SJ',
    linkedin: 'https://www.linkedin.com/in/sambhav-jain-661aa4386?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    github: 'https://github.com/sambhav-vitp',
  },
  {
    id: 'member-6',
    name: 'Sanay Surana',
    role: 'Product Manager',
    bio: 'Managing project timelines, driving feature specifications, and coordinating deployment strategies.',
    avatar: '/images/team/sanay.jpeg',
    initials: 'SS',
    linkedin: 'https://www.linkedin.com/in/sanay-surana-a33625387?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    github: 'https://github.com/yanzay7',
  },
];
