import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ExperienceState {
  experienceList: Experience[];
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
}

export const useExperienceStore = create<ExperienceState>()(
  persist<ExperienceState>(
    (set) => ({
      experienceList: [],
      addExperience: (experience) => 
        set((state) => ({
          experienceList: [...state.experienceList, experience]
        })),
      updateExperience: (id, updatedExperience) =>
        set((state) => ({
          experienceList: state.experienceList.map((item) =>
            item.id === id ? { ...item, ...updatedExperience } : item
          )
        })),
      removeExperience: (id) =>
        set((state) => ({
          experienceList: state.experienceList.filter((item) => item.id !== id)
        }))
    }),
    {
      name: 'experience-storage',
      skipHydration: false,
    }
  )
);