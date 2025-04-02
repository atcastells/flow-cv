import { create } from 'zustand';

// Types for CV data
export interface PersonalData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  links?: string[];
}

export type Skills = string[];

// For the other CV sections, we'll use a flexible structure as described in the system prompt
export type CVSectionValue = Record<string, string | string[] | number> | string[];

export interface CVData {
  Profile?: CVSectionValue;
  Experience?: CVSectionValue;
  Education?: CVSectionValue;
  Projects?: CVSectionValue;
  Certifications?: CVSectionValue;
  Languages?: CVSectionValue;
  Publications?: CVSectionValue;
  VolunteerExperience?: CVSectionValue;
  Awards?: CVSectionValue;
  ContactInfo?: CVSectionValue;
}

// Store interface
interface ProfileStore {
  // State
  personalData: PersonalData;
  skills: Skills;
  cvData: CVData;

  // Actions
  setPersonalData: (data: PersonalData) => void;
  setSkills: (skills: Skills) => void;
  setCVSection: <K extends keyof CVData>(section: K, data: CVData[K]) => void;
}

export const useCVStore = create<ProfileStore>((set) => ({
  personalData: {},
  skills: [],
  cvData: {},

  setPersonalData: (data) => set((state) => ({
    personalData: { ...state.personalData, ...data },
  })),
  
  setSkills: (skills) => set(() => ({
    skills,
  })),
  
  setCVSection: (section, data) => set((state) => ({
    cvData: {
      ...state.cvData,
      [section]: data,
    },
  })),
}));