import { LucideIcon } from 'lucide-react';

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Experience {
  jobTitle?: string;
  company?: string;
  dates?: string;
  description?: string;
}

export interface Education {
  institution?: string;
  degree?: string;
  dates?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
  suggestions: string[] | null;
  suggestionsUsed: boolean;
  uiComponents?: { type: string; props: any }[];
}

export interface SectionTitleProps {
  icon: LucideIcon;
  title: string;
} 