import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { ChatMessageProps } from '@/components/ChatMessage';

interface ChatState {
  messages: ChatMessageProps[];
  isLoading: boolean;
  addMessage: (message: ChatMessageProps) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState, [["zustand/persist", ChatState]]>(
  persist<ChatState>(
      (set) => ({
      messages: [
        {
          content: "¡Hola! Soy tu asistente para crear tu CV. Puedo ayudarte a añadir información en las siguientes secciones. También puedes adjuntar un CV existente para extraer automáticamente esta información.",
          isUser: false,
          actions: [
            { label: "Añadir Perfil", action: () => {} },
            { label: "Añadir Educación", action: () => {} },
            { label: "Añadir Experiencia", action: () => {} },
            { label: "Añadir Habilidades", action: () => {} },
            { label: "Añadir Proyectos", action: () => {} },
            { label: "Añadir Premios", action: () => {} },
            { label: "Adjuntar CV existente", action: () => {} }
          ],
          timestamp: new Date(),
          isNew: false
        }
      ],
      isLoading: false,
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearMessages: () => set({
        messages: [
          {
            content: "¡Hola! Soy tu asistente para crear tu CV. Puedo ayudarte a añadir información en las siguientes secciones. También puedes adjuntar un CV existente para extraer automáticamente esta información.",
            isUser: false,
            actions: [
              { label: "Añadir Perfil", action: () => {} },
              { label: "Añadir Educación", action: () => {} },
              { label: "Añadir Experiencia", action: () => {} },
              { label: "Añadir Habilidades", action: () => {} },
              { label: "Añadir Proyectos", action: () => {} },
              { label: "Añadir Premios", action: () => {} },
              { label: "Adjuntar CV existente", action: () => {} }
            ],
            timestamp: new Date(),
            isNew: false
          }
        ]
      })
    }),
    {
      name: 'chat-storage',
      skipHydration: false,
    }
  )
);