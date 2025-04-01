import React, { useEffect, useRef, useState, useMemo } from "react";
import ChatMessage from "./ChatMessage";
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, X, Image, Paperclip } from "lucide-react";
import { useChat } from "@/features/ai/hooks";
import { OpenRouterService } from "@/features/ai/service";
import type { ContentPart, ImageUrlPart, Message, TextPart } from "@/features/ai/service";
import { useProfileStore, useEducationStore, useExperienceStore, useSkillsStore, useChatStore } from "@/features/store";
import CVPreview from "./CVPreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { TextItem } from "pdfjs-dist/types/src/display/api";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface AttachmentInfo {
  name: string;
  type: string;
  size: number;
}

interface ExtendedMessage extends Message {
  attachments?: AttachmentInfo[] | null;
}

interface ChatWindowProps {
  className?: string;
  onOpenModal: (modalType: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className, onOpenModal }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash-exp:free");
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [educationList, setEducationList] = useState(useEducationStore()?.educationList || []);
  const [experienceList, setExperienceList] = useState(useExperienceStore()?.experienceList || []);
  const skills = useSkillsStore((state) => state.skills);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const {
    messages: chatMessages,
    isLoading: aiLoading,
    sendMessage,
    clearMessages: clearAiMessages,
    handleQuickAction,
    handleDeleteMessage,
  } = useChat({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY as string,
    model: selectedModel,
  });
  
  const handleProfileSave = () => {
    const { addMessage, deleteMessage } = useChatStore.getState();
    // Find the ProfileCard message and replace it with a hint
    chatMessages.forEach((msg) => {
      if (msg.content === "ProfileCardWithData") {
        deleteMessage(msg.id);
        addMessage({
          id: `profile-saved-${Date.now()}`,
          role: 'system',
          content: "Profile information updated",
          isLocal: false,
        });
      }
    });
  };

  const profileStore = useProfileStore();
  const personalData = profileStore?.personalData || {};
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        console.error("OpenRouter API Key is missing.");
        return;
      }
      try {
        const service = new OpenRouterService(import.meta.env.VITE_OPENROUTER_API_KEY as string, selectedModel);
        const models = await service.getAvailableModels();
        setAvailableModels(
          models.map((model) => ({
            id: model.id,
            name: model.name || model.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, [selectedModel]);

  const handleSendMessage = async (textContent: string, files?: File[] | null) => {
    if (textContent.trim() === "" && (!files || files.length === 0)) return;
  
    let messageContent: string | ContentPart[];
    const file = files?.[0];
    
    const attachments: AttachmentInfo[] | null = files?.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })) || null;
  
    if (file) {
      setIsProcessingFile(true);
      console.log(`Processing attached file: ${file.name}, Type: ${file.type}`);
      
      try {
        if (file.type === 'application/pdf') {
          const extractedText = await extractTextFromPdf(file);
          messageContent = `${textContent}\n\n--- Start of Content from PDF: ${file.name} ---\n\n${extractedText}\n\n--- End of Content from PDF: ${file.name} ---`;
        
        } else if (file.type.startsWith('image/')) {
          if (!isMultimodalModel(selectedModel)) {
            toast({ title: "Error", description: `Model ${selectedModel} cannot process images. Please select a multimodal model (e.g., Gemini Flash, Claude 3 Haiku/Sonnet/Opus, GPT-4o).`, variant: "destructive" });
            setIsProcessingFile(false);
            return; 
          }
          const base64DataUri = await readFileAsDataURL(file);
          messageContent = [
            { type: "text", text: textContent },
            { type: "image_url", image_url: { url: base64DataUri } }
          ];
        
        } else {
          toast({ title: "Unsupported File", description: `Cannot process file type: ${file.type}. Please upload an image or PDF.`, variant: "destructive" });
          setIsProcessingFile(false);
          return;
        }
        
        const userMessage: ExtendedMessage = { 
          role: 'user', 
          content: messageContent,
          attachments
        };
        setIsProcessingFile(false);
        await sendMessage(userMessage);

      } catch (error) {
        console.error("Error processing file or sending message:", error);
        toast({ title: "Error", description: `Failed to process file or send message: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
        setIsProcessingFile(false);
        return;
      }

    } else {
      const userMessage: ExtendedMessage = { 
        role: 'user', 
        content: textContent,
        attachments
      };
      await sendMessage(userMessage); 
    }
  };

  const isMultimodalModel = (modelId: string): boolean => {
    const multiModalKeywords = ['vision', 'opus', 'sonnet', 'haiku', 'gpt-4o', 'flash-1.5'];
    return multiModalKeywords.some(keyword => modelId.toLowerCase().includes(keyword));
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleClearChat = () => {
    clearAiMessages();
  };

  const displayMessages = useMemo(() => {
    const pdfMarkerStart = "--- Start of Content from PDF:";

    return chatMessages
      .filter(message => {
        return message.role === 'user' || (message.role === 'assistant' && typeof message.content === 'string' && message.content.trim() !== '');
      })
      .map((message, index) => {
        let displayContent: string | React.ComponentType<any>;
        let imagePreviewUrl: string | null = null;
        let isPdfReference = false;
        const extMessage = message as ExtendedMessage;
            
        let attachmentElement = null;
        if (message.role === 'user' && extMessage.attachments?.length) {
          attachmentElement = (
            <div className="flex flex-wrap gap-2 mb-2">
              {extMessage.attachments.map((attachment, i) => {
                let FileIcon = Paperclip;
                if (attachment.type.startsWith('image/')) {
                  FileIcon = Image;
                } else if (attachment.type === 'application/pdf') {
                  FileIcon = FileText;
                }
                
                const sizeInKB = Math.round(attachment.size / 1024);
                const sizeText = sizeInKB < 1000 
                  ? `${sizeInKB} KB` 
                  : `${(sizeInKB / 1024).toFixed(1)} MB`;
                
                const MAX_FILENAME_LENGTH = 20;
                const displayName = attachment.name.length > MAX_FILENAME_LENGTH
                  ? attachment.name.substring(0, MAX_FILENAME_LENGTH) + '...'
                  : attachment.name;
                  
                return (
                  <div key={`attachment-${i}`} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                    <FileIcon className="h-3 w-3" />
                    <span>{displayName}</span>
                    <span className="text-muted-foreground ml-1">({sizeText})</span>
                  </div>
                );
              })}
            </div>
          );
        }

        if (message.role === 'user') {
          if (typeof message.content === 'string') {
            const markerIndex = message.content.indexOf(pdfMarkerStart);
            
            if (markerIndex !== -1) {
              displayContent = message.content.substring(0, markerIndex).trim();
              isPdfReference = true;
              if (displayContent === "") {
                displayContent = "";
              }
            } else {
              displayContent = message.content;
            }
          } else if (Array.isArray(message.content)) {
            const textPart = message.content.find(part => part.type === 'text') as TextPart | undefined;
            displayContent = textPart?.text ?? '';
            const imagePart = message.content.find(part => part.type === 'image_url') as ImageUrlPart | undefined;
            imagePreviewUrl = imagePart?.image_url.url ?? null;
          } else {
            displayContent = "";
          }
        } else if (message.role === 'assistant' || message.role === 'system') {
          if (typeof message.content === 'string') {
            displayContent = message.content;
          } else {
            displayContent = '';
          }
        } else {
          displayContent = '';
        }

        return (
          <React.Fragment key={`${message.role}-${index}`}>
            {attachmentElement}
            <ChatMessage
              content={displayContent}
              isUser={message.role === 'user'}
              timestamp={new Date()}
              id={message.id}
              onDelete={handleDeleteMessage}
              isLocal={message.isLocal}
              onProfileSave={handleProfileSave}
            />
            {imagePreviewUrl && (
              <div className="mt-2 mb-4 ml-4 max-w-xs">
                <img
                  src={imagePreviewUrl}
                  alt="Attached image"
                  className="rounded-md border border-border max-h-60 object-contain"
                />
              </div>
            )}
          </React.Fragment>
        );
      });
  }, [chatMessages, handleDeleteMessage]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 10);
  
    console.log(`Extracting text from PDF: ${file.name}, Pages: ${maxPages}/${pdf.numPages}`);
  
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as TextItem).str).join(' ');
        fullText += pageText + '\n\n';
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        fullText += `[Error processing page ${i}]\n\n`;
      }
    }
    
    const MAX_TEXT_LENGTH = 15000;
    if (fullText.length > MAX_TEXT_LENGTH) {
      console.warn(`PDF text truncated from ${fullText.length} to ${MAX_TEXT_LENGTH} characters.`);
      fullText = fullText.substring(0, MAX_TEXT_LENGTH) + "\n\n[... PDF TEXT TRUNCATED ...]";
    }
  
    console.log(`Extracted text length: ${fullText.length}`);
    return fullText;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
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
            <div className="mx-auto flex flex-col max-w-5xl">
              {displayMessages}

              {(aiLoading || isProcessingFile) && (
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
                  {isProcessingFile && (
                    <span className="ml-2 text-sm">Procesando archivo...</span>
                  )}
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
                skills={skills}
              />
            </div>
          </div>
        )}
      </div>

      <InputArea
        onSendMessage={handleSendMessage}
        isLoading={aiLoading || isProcessingFile}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export default ChatWindow;
