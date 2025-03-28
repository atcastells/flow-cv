import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5 skill level
  category?: string;
}

interface SkillsState {
  skillsList: Skill[];
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
}

export const useSkillsStore = create<SkillsState, [["zustand/persist", SkillsState]]>(
  persist<SkillsState>(
      (set) => ({
        skillsList: [],
        addSkill: (skill) => 
          set((state) => ({
            skillsList: [...state.skillsList, skill]
          })),
        updateSkill: (id, updatedSkill) =>
          set((state) => ({
            skillsList: state.skillsList.map((item) =>
              item.id === id ? { ...item, ...updatedSkill } : item
            )
          })),
        removeSkill: (id) =>
          set((state) => ({
            skillsList: state.skillsList.filter((item) => item.id !== id)
          }))
      }),
      {
        name: 'skills-storage',
        skipHydration: false,
      }
    )
);