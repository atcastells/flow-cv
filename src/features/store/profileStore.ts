import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalData {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

interface ProfileState {
  personalData: PersonalData;
  setPersonalData: (data: PersonalData) => void;
  updatePersonalData: (field: keyof PersonalData, value: string) => void;
}

export const useProfileStore = create<ProfileState, [["zustand/persist", ProfileState]]>(
  persist<ProfileState>(
    (set) => ({
      personalData: {
        name: "Ana García Martínez",
        email: "ana.garcia@example.com",
        phone: "+34 612 345 678",
        address: "Madrid, España",
        summary: "Desarrolladora Full Stack con más de 5 años de experiencia creando aplicaciones web modernas y escalables."
      },
      setPersonalData: (data) => set({ personalData: data }),
      updatePersonalData: (field, value) => 
        set((state) => ({
          personalData: {
            ...state.personalData,
            [field]: value
          }
        }))
    }),
    {
      name: 'profile-storage',
      skipHydration: false,
    }
  )
);