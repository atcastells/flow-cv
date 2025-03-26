
import React, { useEffect, useRef, useState } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  className?: string;
  onOpenModal: (modalType: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className, onOpenModal }) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      content: "¡Hola! Soy tu asistente para crear tu CV. ¿Qué te gustaría hacer hoy?",
      isUser: false,
      actions: [
        { 
          label: "Añadir experiencia", 
          action: () => onOpenModal("experience") 
        },
        { 
          label: "Añadir educación", 
          action: () => onOpenModal("education") 
        },
        { 
          label: "Añadir habilidades", 
          action: () => onOpenModal("skills") 
        }
      ],
      timestamp: new Date(),
      isNew: false
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (content: string) => {
    if (content.trim() === "") return;
    
    const userMessage: ChatMessageProps = {
      content,
      isUser: true,
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate AI "thinking"
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // Check message content for keywords and provide contextual response
      let responseActions = [];
      
      if (content.toLowerCase().includes("experiencia")) {
        responseActions = [
          { 
            label: "Añadir experiencia", 
            action: () => onOpenModal("experience") 
          }
        ];
      } else if (content.toLowerCase().includes("educación") || content.toLowerCase().includes("formación")) {
        responseActions = [
          { 
            label: "Añadir educación", 
            action: () => onOpenModal("education") 
          }
        ];
      } else if (content.toLowerCase().includes("habilidad")) {
        responseActions = [
          { 
            label: "Añadir habilidades", 
            action: () => onOpenModal("skills") 
          }
        ];
      } else {
        responseActions = [
          { 
            label: "Añadir experiencia", 
            action: () => onOpenModal("experience") 
          },
          { 
            label: "Añadir educación", 
            action: () => onOpenModal("education") 
          },
          { 
            label: "Añadir habilidades", 
            action: () => onOpenModal("skills") 
          }
        ];
      }
      
      const aiResponse: ChatMessageProps = {
        content: getResponseForMessage(content),
        isUser: false,
        actions: responseActions,
        timestamp: new Date(),
        isNew: true
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const getResponseForMessage = (message: string): string => {
    message = message.toLowerCase();
    
    if (message.includes("experiencia")) {
      return "Puedes añadir tu experiencia laboral con el botón a continuación. Incluye el nombre de la empresa, tu puesto, fechas y una breve descripción de tus responsabilidades.";
    } else if (message.includes("educación") || message.includes("formación")) {
      return "La sección de educación es importante. Añade tus estudios, institución, fechas y logros relevantes usando el botón de abajo.";
    } else if (message.includes("habilidad")) {
      return "Excelente. Las habilidades son fundamentales en un CV. ¿Qué habilidades técnicas o blandas te gustaría destacar?";
    } else if (message.includes("hola") || message.includes("ayuda")) {
      return "¡Bienvenido! Estoy aquí para ayudarte a crear tu CV. Puedes añadir diferentes secciones como experiencia laboral, educación o habilidades.";
    } else {
      return "Entiendo. Para continuar creando tu CV, puedes añadir información sobre tu experiencia laboral, educación o habilidades. ¿Qué te gustaría añadir primero?";
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 rounded-2xl bg-ai px-4 py-3 text-ai-foreground max-w-[80%] mr-auto">
              <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light"></div>
              <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
