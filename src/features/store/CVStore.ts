import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { Education } from '../cv/types';
import { Awards, ContactInfo } from './interfaces';
import { Certifications, Languages, Publications, VolunteerExperience } from './interfaces';
import { Experience } from '../cv/types';
import { Projects } from './interfaces';

// Types
export interface PersonalData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  links?: string[];
}

export type Skills = string[];


export interface CVData {
  PersonalData?: PersonalData;
  Skills?: Skills;
  Profile?: string; // Optional: summary or objective
  Experience?: Experience;
  Education?: Education;
  Projects?: Projects;
  Certifications?: Certifications;
  Languages?: Languages;
  Publications?: Publications;
  VolunteerExperience?: VolunteerExperience;
  Awards?: Awards;
  ContactInfo?: ContactInfo;
}

// Store Interface
interface CVStore {
  cvData: CVData;

  // Actions
  setCVSection: <K extends keyof CVData>(section: K, data: Partial<CVData[K]> | CVData[K]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  resetCV: () => void;

  // Computed
  hasMinimumCVData: () => boolean;
}

// Store
export const useCVStore = create<CVStore>()(
  devtools(
    persist(
      (set, get) => ({
        cvData: {},

        setCVSection: (section, data) =>
          set((state) => {
            const current = state.cvData[section];
            const isMergeable = typeof current === 'object' && !Array.isArray(current);
            return {
              cvData: {
                ...state.cvData,
                [section]: isMergeable
                  ? { ...(current as object), ...(data as object) }
                  : data,
              },
            };
          }),

        addSkill: (skill) =>
          set((state) => {
            const currentSkills = state.cvData.Skills ?? [];
            return {
              cvData: {
                ...state.cvData,
                Skills: currentSkills.includes(skill)
                  ? currentSkills
                  : [...currentSkills, skill],
              },
            };
          }),

        removeSkill: (skill) =>
          set((state) => {
            const currentSkills = state.cvData.Skills ?? [];
            return {
              cvData: {
                ...state.cvData,
                Skills: currentSkills.filter((s) => s !== skill),
              },
            };
          }),

        resetCV: () => set(() => ({ cvData: {} })),

        hasMinimumCVData: () => {
          const personal = get().cvData.PersonalData;
          return Boolean(personal?.name && personal?.email);
        },
      }),
      {
        name: 'cv-storage',
        storage:
          typeof window !== 'undefined'
            ? createJSONStorage(() => localStorage)
            : undefined,
      }
    )
  )
);
