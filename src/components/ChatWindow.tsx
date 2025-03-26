
import React, { useEffect, useRef, useState } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatWindowProps {
  className?: string;
  onOpenModal: (modalType: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className, onOpenModal }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      content: "¡Hola! Soy tu asistente para crear tu CV. Puedo ayudarte a añadir información en las siguientes secciones. También puedes adjuntar un CV existente para extraer automáticamente esta información.",
      isUser: false,
      actions: [
        { 
          label: "Añadir Perfil", 
          action: () => onOpenModal("profile") 
        },
        { 
          label: "Añadir Educación", 
          action: () => onOpenModal("education") 
        },
        { 
          label: "Añadir Experiencia", 
          action: () => onOpenModal("work") 
        },
        { 
          label: "Añadir Habilidades", 
          action: () => onOpenModal("skills") 
        },
        { 
          label: "Añadir Proyectos", 
          action: () => onOpenModal("projects") 
        },
        { 
          label: "Añadir Premios", 
          action: () => onOpenModal("awards") 
        },
        { 
          label: "Adjuntar CV existente", 
          action: () => onOpenModal("upload") 
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
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      let responseActions = [];
      
      if (content.toLowerCase().includes("perfil")) {
        responseActions = [
          { 
            label: "Añadir Perfil", 
            action: () => onOpenModal("profile") 
          }
        ];
      } else if (content.toLowerCase().includes("educación") || content.toLowerCase().includes("formación")) {
        responseActions = [
          { 
            label: "Añadir Educación", 
            action: () => onOpenModal("education") 
          }
        ];
      } else if (content.toLowerCase().includes("experiencia") || content.toLowerCase().includes("trabajo")) {
        responseActions = [
          { 
            label: "Añadir Experiencia", 
            action: () => onOpenModal("work") 
          }
        ];
      } else if (content.toLowerCase().includes("habilidad")) {
        responseActions = [
          { 
            label: "Añadir Habilidades", 
            action: () => onOpenModal("skills") 
          }
        ];
      } else if (content.toLowerCase().includes("proyecto")) {
        responseActions = [
          { 
            label: "Añadir Proyectos", 
            action: () => onOpenModal("projects") 
          }
        ];
      } else if (content.toLowerCase().includes("premio") || content.toLowerCase().includes("reconocimiento")) {
        responseActions = [
          { 
            label: "Añadir Premios", 
            action: () => onOpenModal("awards") 
          }
        ];
      } else if (content.toLowerCase().includes("adjuntar") || content.toLowerCase().includes("subir") || 
                content.toLowerCase().includes("existente")) {
        responseActions = [
          { 
            label: "Adjuntar CV existente", 
            action: () => onOpenModal("upload") 
          }
        ];
      } else {
        responseActions = [
          { 
            label: "Añadir Perfil", 
            action: () => onOpenModal("profile") 
          },
          { 
            label: "Añadir Educación", 
            action: () => onOpenModal("education") 
          },
          { 
            label: "Añadir Experiencia", 
            action: () => onOpenModal("work") 
          },
          { 
            label: "Añadir Habilidades", 
            action: () => onOpenModal("skills") 
          },
          { 
            label: "Añadir Proyectos", 
            action: () => onOpenModal("projects") 
          },
          { 
            label: "Añadir Premios", 
            action: () => onOpenModal("awards") 
          },
          { 
            label: "Adjuntar CV existente", 
            action: () => onOpenModal("upload") 
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
    
    if (message.includes("perfil")) {
      return "Puedes añadir información de tu perfil con el botón a continuación. Incluye tu nombre, título profesional, datos de contacto y un resumen profesional.";
    } else if (message.includes("educación") || message.includes("formación")) {
      return "La sección de educación es importante. Añade tus estudios, institución, fechas y logros relevantes usando el botón de abajo.";
    } else if (message.includes("experiencia") || message.includes("trabajo")) {
      return "Tu experiencia laboral es fundamental en un CV. Añade las empresas donde has trabajado, tu cargo, fechas y responsabilidades principales.";
    } else if (message.includes("habilidad")) {
      return "Las habilidades son esenciales en un CV. ¿Qué competencias técnicas o blandas te gustaría destacar?";
    } else if (message.includes("proyecto")) {
      return "Los proyectos destacados ayudan a demostrar tu experiencia práctica. Incluye nombre, descripción, tecnologías utilizadas y enlaces si están disponibles.";
    } else if (message.includes("premio") || message.includes("reconocimiento")) {
      return "Los premios y reconocimientos destacan tus logros. Incluye el título, la institución que lo otorgó, la fecha y una breve descripción.";
    } else if (message.includes("adjuntar") || message.includes("subir") || message.includes("existente")) {
      return "Puedes adjuntar un CV existente y extraeré automáticamente la información para ahorrar tiempo. Acepto formatos PDF, DOCX y TXT.";
    } else if (message.includes("hola") || message.includes("ayuda")) {
      return "¡Bienvenido! Estoy aquí para ayudarte a crear tu CV. Puedes añadir diferentes secciones como perfil, educación, experiencia laboral, habilidades, proyectos o premios. También puedes adjuntar un CV existente para extraer la información automáticamente.";
    } else {
      return "Entiendo. Para continuar creando tu CV, puedes añadir información en las diferentes secciones o adjuntar un CV existente para extraer los datos automáticamente. ¿Qué te gustaría hacer primero?";
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-end p-2 border-b">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={() => navigate("/preview")}
        >
          <FileText size={16} />
          Previsualizar CV
        </Button>
      </div>
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
