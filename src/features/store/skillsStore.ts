import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SkillsState {
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skillToRemove: string) => void;
  setSkills: (skills: string[]) => void;
  clearSkills: () => void;
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set) => ({
      skills: [], // Initial state: empty array
      addSkill: (skill) =>
        set((state) => {
          // Avoid adding duplicates
          if (!state.skills.includes(skill)) {
            return { skills: [...state.skills, skill] };
          }
          return state; // Return current state if skill already exists
        }),
      removeSkill: (skillToRemove) =>
        set((state) => ({
          skills: state.skills.filter((skill) => skill !== skillToRemove),
        })),
      setSkills: (skills) => set({ skills: skills }),
      clearSkills: () => set({ skills: [] }),
    }),
    {
      name: 'skills-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ skills: state.skills }), // Only persist the skills array
      skipHydration: false, // Ensure state is loaded on initialization
    }
  )
);