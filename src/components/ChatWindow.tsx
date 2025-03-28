import React, { useEffect, useRef, useState, useMemo } from "react"; // Added useState, useMemo
import ChatMessage, { ChatMessageProps } from "./ChatMessage"; // Assuming this component can handle the updated Message type
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, X } from "lucide-react";
import { useChat } from "@/features/ai/hooks"; // Assuming useChat hook is correctly placed
import { OpenRouterService } from "@/features/ai/service"; // Assuming service is correctly placed
import type { Message } from "@/features/ai/service"; // Import the updated Message type
import { useProfileStore, useEducationStore, useExperienceStore, useSkillsStore } from "@/features/store"; // Keep stores for CV data
import CVPreview from "./CVPreview";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatWindowProps {
  className?: string;
  onOpenModal: (modalType: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className, onOpenModal }) => {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedModel, setSelectedModel] = useState("google/gemini-flash-1.5"); // Default to a potentially free/capable model
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);

  // Use the updated useChat hook - this manages the AI message state internally
  const {
    messages: chatMessages, // Renamed to avoid conflict with local store if kept
    isLoading: aiLoading,
    sendMessage,
    clearMessages: clearAiMessages, // Renamed to avoid conflict if useChatStore kept
  } = useChat({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY as string, // Ensure API key is string
    model: selectedModel,
  });

  // Keep other stores for CV data management with null checks and defaults
  const profileStore = useProfileStore();
  const educationStore = useEducationStore();
  const experienceStore = useExperienceStore();
  const skillsStore = useSkillsStore();

  // Use optional chaining and provide default values
  const personalData = profileStore?.personalData || {};
  const educationList = educationStore?.educationList || [];
  const experienceList = experienceStore?.experienceList || [];
  const skillsList = skillsStore?.skillsList || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch models effect (remains the same)
  useEffect(() => {
    const fetchModels = async () => {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        console.error("OpenRouter API Key is missing.");
        return; // Don't fetch without API key
      }
      try {
        const service = new OpenRouterService(import.meta.env.VITE_OPENROUTER_API_KEY as string, selectedModel);
        const models = await service.getAvailableModels();
        setAvailableModels(
          models.map((model) => ({
            id: model.id,
            name: model.name || model.id, // Use ID if name is missing
          }))
        );
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, [selectedModel]);

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "") return;

    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error sending message via useChat hook:", error);
    }
  };

  const getActionsForMessage = (messageContent: string | null): Array<{ label: string; action: () => void }> => {
    if (!messageContent) return [];

    const message = messageContent.toLowerCase();
    const actions: Array<{ label: string; action: () => void }> = [];

    if (message.includes("perfil") || message.includes("personal")) {
      actions.push({ label: "Editar Perfil", action: () => onOpenModal("profile") });
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
    }

    return actions;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleClearChat = () => {
    clearAiMessages();
  };

  const displayMessages = useMemo(() => {
    return chatMessages
      .filter((message) => {
        return message.role === "user" || (message.role === "assistant" && message.content);
      })
      .map((message, index) => ({
        key: `${message.role}-${index}-${message.content?.substring(0, 10) ?? "tool"}`,
        content: message.content ?? "",
        isUser: message.role === "user",
        timestamp: new Date(),
        actions: message.role === "assistant" ? getActionsForMessage(message.content) : [],
      }));
  }, [chatMessages, onOpenModal]);

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <div className="border-b p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <div className="w-full sm:w-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={aiLoading}
            >
              {!availableModels.some((m) => m.id === selectedModel) && (
                <option key={selectedModel} value={selectedModel}>
                  {selectedModel.split("/").pop()}
                </option>
              )}
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {isMobile && model.name.length > 30 ? `${model.name.substring(0, 30)}...` : model.name}
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
              disabled={aiLoading}
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
              disabled={aiLoading}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Previsualizar CV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div
          className={cn(
            "overflow-y-auto transition-[width] duration-300",
            showPreview ? (isMobile ? "hidden" : "w-[60%]") : "w-full"
          )}
        >
          <div className="px-4 py-4">
            <div className="mx-auto max-w-3xl">
              {displayMessages.map((msgProps) => (
                <ChatMessage {...msgProps} />
              ))}

              {aiLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-ai px-4 py-3 text-ai-foreground max-w-[95%] sm:max-w-[85%] md:max-w-[80%] mr-auto">
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light"></div>
                  <div
                    className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-primary/50 animate-pulse-light"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {showPreview && (
          <div
            className={cn(
              "border-l bg-background",
              isMobile ? "fixed inset-0 z-50 p-4" : "w-[40%]"
            )}
          >
            <div className="flex items-center justify-between p-2 border-b">
              <h2 className="text-lg font-semibold">Vista Previa CV</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-3.5rem)]">
              <CVPreview
                personalData={personalData}
                experiences={experienceList}
                education={educationList}
                skills={(skillsList || []).map((skill) => skill?.name || "")}
              />
            </div>
          </div>
        )}
      </div>

      <InputArea onSendMessage={handleSendMessage} isLoading={aiLoading} />
    </div>
  );
};

export default ChatWindow;