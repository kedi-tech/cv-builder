
export type Language = 'en' | 'fr';

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: number; // 1 to 5
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface CoverLetterData {
  recipientName: string;
  companyName: string;
  jobTitle: string;
  body: string;
}

export interface ResumeData {
  template: 'modern' | 'classic' | 'minimal' | 'professional' | 'elegant' | 'creative';
  personalInfo: {
    fullName: string;
    role: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    summary: string;
    photoUrl: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: LanguageItem[];
  achievements: Achievement[];
  courses: string[];
  interests: string[];
  sectionOrder: string[];
  coverLetter: CoverLetterData;
}
