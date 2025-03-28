import React, { useEffect, useRef } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, X } from "lucide-react";
import { useChat } from "@/features/ai/hooks";
import { OpenRouterService } from "@/features/ai/service";
import { useChatStore, useProfileStore, useEducationStore, useExperienceStore, useSkillsStore } from "@/features/store";
import { EditProfile, EditEducation, EditWorkExperience, EditSkills, EditProjects, EditAwards, UploadExistingCV } from "./CVActionComponents";
import CVPreview from "./CVPreview";
import { useIsMobile } from "@/hooks/use-mobile";

export enum CVAction {
  EditProfile = "editProfile",
  EditEducation = "editEducation",
  EditWorkExperience = "editWorkExperience",
  EditSkills = "editSkills",
  EditProjects = "editProjects",
  EditAwards = "editAwards",
  UploadExistingCV = "uploadExistingCV",
}

interface ChatWindowProps {
  className?: string;
  onOpenModal: (modalType: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className, onOpenModal }) => {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState("deepseek/deepseek-chat-v3-0324:free");
  const [availableModels, setAvailableModels] = React.useState<Array<{id: string, name: string}>>([]);

  const { messages: aiMessages, isLoading: aiLoading, sendMessage, clearMessages } = useChat({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    model: selectedModel
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const service = new OpenRouterService(import.meta.env.VITE_OPENROUTER_API_KEY, selectedModel);
        const models = await service.getAvailableModels();
        setAvailableModels(models.map(model => ({
          id: model.id,
          name: model.name
        })));
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const { messages, addMessage, isLoading, setIsLoading } = useChatStore();
  const { personalData } = useProfileStore();
  const { educationList } = useEducationStore();
  const { experienceList } = useExperienceStore();
  const { skillsList } = useSkillsStore();
  
  useEffect(() => {
    if (messages.length > 0 && messages[0].actions) {
      const updatedActions = [
        { label: "Añadir Perfil", action: () => onOpenModal("profile") },
        { label: "Añadir Educación", action: () => onOpenModal("education") },
        { label: "Añadir Experiencia", action: () => onOpenModal("work") },
        { label: "Añadir Habilidades", action: () => onOpenModal("skills") },
        { label: "Añadir Proyectos", action: () => onOpenModal("projects") },
        { label: "Añadir Premios", action: () => onOpenModal("awards") },
        { label: "Adjuntar CV existente", action: () => onOpenModal("upload") }
      ];
      
      useChatStore.setState({
        messages: [{ ...messages[0], actions: updatedActions }, ...messages.slice(1)]
      });
    }
  }, [onOpenModal]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (content: string, force = false) => {
    if (!force && content.trim() === "") return;
    
    const userMessage: ChatMessageProps = {
      content,
      isUser: true,
      timestamp: new Date(),
      isNew: true
    };
    
    addMessage(userMessage);
    
    try {
      setIsLoading(true);
      const contextMessage = `User Message: ${content}`;
      const assistantMessage = await sendMessage(contextMessage);
      const responseActions = getActionsForMessage(assistantMessage.content);
      
      const aiResponse: ChatMessageProps = {
        content: assistantMessage.content,
        isUser: false,
        actions: responseActions,
        timestamp: new Date(),
        isNew: true
      };
      
      addMessage(aiResponse);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const getActionsForMessage = (message: string) => {
    message = message.toLowerCase();
    const actions = [];
    
    if (message.includes("perfil")) {
      actions.push({ label: "Añadir Perfil", action: () => onOpenModal("profile") });
    } else if (message.includes("educación") || message.includes("formación")) {
      actions.push({ label: "Añadir Educación", action: () => onOpenModal("education") });
    } else if (message.includes("experiencia") || message.includes("trabajo")) {
      actions.push({ label: "Añadir Experiencia", action: () => onOpenModal("work") });
    } else if (message.includes("habilidad")) {
      actions.push({ label: "Añadir Habilidades", action: () => onOpenModal("skills") });
    } else if (message.includes("proyecto")) {
      actions.push({ label: "Añadir Proyectos", action: () => onOpenModal("projects") });
    } else if (message.includes("premio") || message.includes("reconocimiento")) {
      actions.push({ label: "Añadir Premios", action: () => onOpenModal("awards") });
    } else if (message.includes("adjuntar") || message.includes("subir") || message.includes("existente")) {
      actions.push({ label: "Adjuntar CV existente", action: () => onOpenModal("upload") });
    } else {
      actions.push(
        { label: "Añadir Perfil", action: () => onOpenModal("profile") },
        { label: "Añadir Educación", action: () => onOpenModal("education") },
        { label: "Añadir Experiencia", action: () => onOpenModal("work") },
        { label: "Añadir Habilidades", action: () => onOpenModal("skills") },
        { label: "Añadir Proyectos", action: () => onOpenModal("projects") },
        { label: "Añadir Premios", action: () => onOpenModal("awards") },
        { label: "Adjuntar CV existente", action: () => onOpenModal("upload") }
      );
    }
    
    return actions;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleClearChat = () => {
    useChatStore.setState({ messages: [] });
    clearMessages();
  };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <div className="border-b p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <div className="w-full sm:w-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {isMobile && model.name.length > 25 ? model.name.substring(0, 25) + '...' : model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-row justify-end gap-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2"
              onClick={handleClearChat}
              title="Limpiar Chat"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpiar Chat</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2"
              onClick={() => setShowPreview(!showPreview)}
              title="Previsualizar CV"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Previsualizar CV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={cn(
          "overflow-y-auto transition-[width] duration-300",
          showPreview ? "w-[60%]" : "w-full"
        )}>
          <div className="px-4 py-4">
            <div className="mx-auto max-w-3xl">
              {messages.filter((message => {
                if(message.content === "") return false;
                else return true
              })).map((message, index) => (
                <ChatMessage key={index} {...message} inlineComponents={
                  {
                    [CVAction.EditProfile]: EditProfile,
                    [CVAction.EditEducation]: EditEducation,
                    [CVAction.EditWorkExperience]: EditWorkExperience,
                    [CVAction.EditSkills]: EditSkills,
                    [CVAction.EditProjects]: EditProjects,
                    [CVAction.EditAwards]: EditAwards,
                    [CVAction.UploadExistingCV]: UploadExistingCV
                  }
                } />
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-ai px-4 py-3 text-ai-foreground max-w-[95%] sm:max-w-[85%] md:max-w-[80%] mr-auto">
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light" style={{ animationDelay: "0.4s" }}></div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {showPreview && (
          <div className={cn(
            "border-l bg-background",
            isMobile ? "fixed inset-0 z-50" : "w-[40%]"
          )}>
            <div className="flex items-center justify-between p-2 border-b">
              <h2 className="text-lg font-semibold">Vista Previa CV</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-3rem)]">
              <CVPreview
                personalData={personalData}
                experiences={experienceList}
                education={educationList}
                skills={skillsList.map(skill => skill.name)}
              />
            </div>
          </div>
        )}
      </div>
      
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
