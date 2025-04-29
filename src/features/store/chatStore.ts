import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../ai/service';

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  addMessages: (newMessages: Message[]) => void;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
}

const ensureMessageId = (message: Message): Message => {
  if (!message.id) {
    return {
      ...message,
      id: crypto.randomUUID()
    };
  }
  return message;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, ensureMessageId(message)],
        })),
      addMessages: (newMessages) =>
        set((state) => ({
          messages: [...state.messages, ...newMessages.map(ensureMessageId)],
        })),
      clearMessages: () => set({ messages: [] }),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),
    }),
    {
      name: 'chat-storage',
    }
  )
);