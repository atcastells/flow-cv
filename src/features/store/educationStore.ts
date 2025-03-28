import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationState {
  educationList: Education[];
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
}

export const useEducationStore = create<EducationState>()(
  persist<EducationState>(
    (set) => ({
      educationList: [],
      addEducation: (education) => 
        set((state) => ({
          educationList: [...state.educationList, education]
        })),
      updateEducation: (id, updatedEducation) =>
        set((state) => ({
          educationList: state.educationList.map((item) =>
            item.id === id ? { ...item, ...updatedEducation } : item
          )
        })),
      removeEducation: (id) =>
        set((state) => ({
          educationList: state.educationList.filter((item) => item.id !== id)
        }))
    }),
    {
      name: 'education-storage',
      skipHydration: false,
    }
  )
);