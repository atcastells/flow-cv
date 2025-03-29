import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message } from '../ai/service'; // Adjust path as necessary

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  addMessages: (newMessages: Message[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      addMessages: (newMessages) =>
        set((state) => ({
          messages: [...state.messages, ...newMessages],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage', // Key for localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ messages: state.messages }), // Only persist the messages array
      skipHydration: false, // Ensure state is loaded on initialization
    }
  )
);