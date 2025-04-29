// Top-level
export interface PersonalData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    location?: string;
    links?: string[];
  }
  
  export type Skills = string[];
  
  // Experience
  export interface ExperienceEntry {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
  }
  
  export type Experience = ExperienceEntry[];
  
  // Education
  export interface EducationEntry {
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
    fieldOfStudy?: string;
    location?: string;
    description?: string;
  }
  
  export type Education = EducationEntry[];
  
  // Projects
  export interface ProjectEntry {
    name: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }
  
  export type Projects = ProjectEntry[];
  
  // Certifications
  export interface CertificationEntry {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }
  
  export type Certifications = CertificationEntry[];
  
  // Languages
  export interface LanguageEntry {
    name: string;
    level: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
  }
  
  export type Languages = LanguageEntry[];
  
  // Publications
  export interface PublicationEntry {
    title: string;
    publisher?: string;
    date?: string;
    link?: string;
    description?: string;
  }
  
  export type Publications = PublicationEntry[];
  
  // Volunteer
  export interface VolunteerEntry {
    organization: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }
  
  export type VolunteerExperience = VolunteerEntry[];
  
  // Awards
  export interface AwardEntry {
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }
  
  export type Awards = AwardEntry[];
  
  // ContactInfo (optional if separated from PersonalData)
  export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
    links?: string[];
  }
  