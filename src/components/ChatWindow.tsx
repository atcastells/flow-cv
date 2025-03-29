import React, { useEffect, useRef, useState, useMemo } from "react"; // Added useState, useMemo
import ChatMessage, { ChatMessageProps } from "./ChatMessage"; // Assuming this component can handle the updated Message type
import InputArea from "./InputArea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, X, Image, Paperclip } from "lucide-react"; // Added Image, Paperclip icons
import { useChat } from "@/features/ai/hooks"; // Assuming useChat hook is correctly placed
import { OpenRouterService } from "@/features/ai/service"; // Assuming service is correctly placed
import type { ContentPart, ImageUrlPart, Message, TextPart } from "@/features/ai/service"; // Import the updated Message type
import { useProfileStore, useEducationStore, useExperienceStore, useSkillsStore } from "@/features/store"; // Keep stores for CV data
import CVPreview from "./CVPreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'; 
import { TextItem } from "pdfjs-dist/types/src/display/api";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Add interface for attachment metadata
interface AttachmentInfo {
  name: string;
  type: string;
  size: number;
}

// Extend the Message type (assuming it's imported and can be extended)
// If you can't modify the imported type directly, you can create a local extended version
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
  const [selectedModel, setSelectedModel] = useState("google/gemini-flash-1.5"); // Default to a potentially free/capable model
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [educationList, setEducationList] = useState(useEducationStore()?.educationList || []);
  const [experienceList, setExperienceList] = useState(useExperienceStore()?.experienceList || []);
  const skills = useSkillsStore((state) => state.skills); // Directly select skills from the store
  const [isProcessingFile, setIsProcessingFile] = useState(false); // Added state for file processing

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

  const profileStore = useProfileStore();

  // Use optional chaining and provide default values
  const personalData = profileStore?.personalData || {};

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

  const handleSendMessage = async (textContent: string, files?: File[] | null) => {
    if (textContent.trim() === "" && (!files || files.length === 0)) return;
  
    let messageContent: string | ContentPart[];
    const file = files?.[0]; // Process only the first attached file for now
    
    // Create attachments metadata array if files exist
    const attachments: AttachmentInfo[] | null = files?.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })) || null;
  
    if (file) {
        setIsProcessingFile(true); // Show loading indicator during file processing
        console.log(`Processing attached file: ${file.name}, Type: ${file.type}`);
        
        try {
            // --- PDF Handling ---
            if (file.type === 'application/pdf') {
                // Use a text-only model or ensure the multimodal model handles large text well
                // TODO: Check if selectedModel is suitable for large text input
                const extractedText = await extractTextFromPdf(file);
                // Combine user text and extracted PDF text
                messageContent = `${textContent}\n\n--- Start of Content from PDF: ${file.name} ---\n\n${extractedText}\n\n--- End of Content from PDF: ${file.name} ---`;
            
            // --- Image Handling ---
            } else if (file.type.startsWith('image/')) {
                // Ensure a multimodal model is selected
                // TODO: Check selectedModel capabilities
                 if (!isMultimodalModel(selectedModel)) {
                   toast({ title: "Error", description: `Model ${selectedModel} cannot process images. Please select a multimodal model (e.g., Gemini Flash, Claude 3 Haiku/Sonnet/Opus, GPT-4o).`, variant: "destructive" });
                   setIsProcessingFile(false); // Stop loading
                   return; 
                 }
                const base64DataUri = await readFileAsDataURL(file);
                messageContent = [
                    { type: "text", text: textContent },
                    { type: "image_url", image_url: { url: base64DataUri } }
                ];
            
            // --- Unsupported File Type ---
            } else {
                toast({ title: "Unsupported File", description: `Cannot process file type: ${file.type}. Please upload an image or PDF.`, variant: "destructive" });
                setIsProcessingFile(false); // Stop loading
                return; // Don't send
            }
            
            // --- Construct and Send ---
            const userMessage: ExtendedMessage = { 
                role: 'user', 
                content: messageContent,
                attachments // Store file metadata 
            };
            setIsProcessingFile(false); // File processing complete
            await sendMessage(userMessage); // Call the hook's sendMessage
  
        } catch (error) {
            console.error("Error processing file or sending message:", error);
            toast({ title: "Error", description: `Failed to process file or send message: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
            setIsProcessingFile(false); // Stop loading on error
            return; // Prevent further execution if file processing failed
        }
  
    } else {
        // --- Text Only Message ---
        const userMessage: ExtendedMessage = { 
            role: 'user', 
            content: textContent,
            attachments // Will be null here
        };
        await sendMessage(userMessage); 
    }
  };

  // Dummy function for multimodal check - replace with actual logic
  const isMultimodalModel = (modelId: string): boolean => {
      const multiModalKeywords = ['vision', 'opus', 'sonnet', 'haiku', 'gpt-4o', 'flash-1.5']; // Add known multimodal model IDs/keywords
      return multiModalKeywords.some(keyword => modelId.toLowerCase().includes(keyword));
  }

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

  // --- Updated displayMessages ---
  const displayMessages = useMemo(() => {
    // Define el marcador exacto que usaste en handleSendMessage
    const pdfMarkerStart = "--- Start of Content from PDF:"; 

    return chatMessages
        // Filtro para mostrar solo mensajes relevantes (mantenido como antes)
        .filter(message => {
           return message.role === 'user' || (message.role === 'assistant' && typeof message.content === 'string' && message.content.trim() !== ''); 
        })
        .map((message, index) => {
            
            let displayContent: string; // El texto que se mostrará en la UI
            let imagePreviewUrl: string | null = null; 
            let isPdfReference = false; // Flag opcional para indicar si se envió PDF
            // Cast to access potential attachments property
            const extMessage = message as ExtendedMessage;
            
            // Create attachment element if message has attachments
            let attachmentElement = null;
            if (message.role === 'user' && extMessage.attachments?.length) {
              attachmentElement = (
                <div className="flex flex-wrap gap-2 mb-2">
                  {extMessage.attachments.map((attachment, i) => {
                    // Select appropriate icon based on file type
                    let FileIcon = Paperclip;
                    if (attachment.type.startsWith('image/')) {
                      FileIcon = Image;
                    } else if (attachment.type === 'application/pdf') {
                      FileIcon = FileText;
                    }
                    
                    // Format file size
                    const sizeInKB = Math.round(attachment.size / 1024);
                    const sizeText = sizeInKB < 1000 
                      ? `${sizeInKB} KB` 
                      : `${(sizeInKB / 1024).toFixed(1)} MB`;
                    
                    // Truncate long filenames
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

            // --- Lógica de Contenido para Mostrar ---
            if (message.role === 'user') {
                if (typeof message.content === 'string') {
                    // Es un mensaje de texto del usuario
                    const markerIndex = message.content.indexOf(pdfMarkerStart);
                    
                    if (markerIndex !== -1) {
                        // Contiene texto de PDF: Extrae solo el texto ANTES del marcador
                        displayContent = message.content.substring(0, markerIndex).trim();
                        isPdfReference = true; 
                        // Si no había texto *antes* del PDF, muestra un placeholder vacío
                        // ya que ahora mostramos el adjunto con su propio elemento
                        if (displayContent === "") {
                             displayContent = "";
                        }
                    } else {
                        // Mensaje de texto normal del usuario
                        displayContent = message.content;
                    }
                } else if (Array.isArray(message.content)) {
                    // Mensaje multimodal (imagen + texto) del usuario
                    const textPart = message.content.find(part => part.type === 'text') as TextPart | undefined;
                    displayContent = textPart?.text ?? ''; // Usamos texto o vacío, ya que mostramos previsualización
                    const imagePart = message.content.find(part => part.type === 'image_url') as ImageUrlPart | undefined;
                    imagePreviewUrl = imagePart?.image_url.url ?? null; 
                } else {
                     displayContent = ""; // Fallback
                }
            } else if (message.role === 'assistant') {
                 // Mensaje del asistente (solo mostramos si tiene contenido string)
                 displayContent = typeof message.content === 'string' ? message.content : '';
            } else {
                 // Otros roles (tool, system) ya están filtrados, pero por si acaso
                 displayContent = '';
            }

            const messageKey = `${message.role}-${index}`; 
            // Las acciones solo aplican a mensajes de asistente con texto
            const actions = (message.role === 'assistant' && typeof message.content === 'string') 
                ? getActionsForMessage(message.content) 
                : [];

            // Create message content that includes image preview if available
            let messageContent = displayContent;
            if (imagePreviewUrl) {
              // Add an image element inside the message content if needed
              // We can append HTML to the content that will show the image
              messageContent = `${displayContent}\n\n[Image attached]`;
            } else if (isPdfReference && extMessage.attachments?.some(a => a.type === 'application/pdf')) {
              // Add PDF reference if needed
              messageContent = displayContent || "[PDF document attached]";
            }

            // Return a Fragment containing attachment (if any) and message
            return (
              <React.Fragment key={messageKey}>
                {attachmentElement}
                <ChatMessage 
                  content={messageContent}
                  isUser={message.role === 'user'} 
                  timestamp={new Date()}
                  actions={actions}
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
  }, [chatMessages, onOpenModal]); // Dependencias del useMemo

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 10); // Limit pages to process (e.g., first 10)
  
    console.log(`Extracting text from PDF: ${file.name}, Pages: ${maxPages}/${pdf.numPages}`);
  
    for (let i = 1; i <= maxPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // textContent.items is an array of TextItem objects
            const pageText = textContent.items.map(item => (item as TextItem).str).join(' '); 
            fullText += pageText + '\n\n'; // Add space between pages
            // Optional: Clean up page object to free memory if processing many pages
            // page.cleanup(); 
        } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError);
            fullText += `[Error processing page ${i}]\n\n`;
        }
    }
    
    // Optional: Truncate very long text
    const MAX_TEXT_LENGTH = 15000; // Adjust as needed based on token limits
    if (fullText.length > MAX_TEXT_LENGTH) {
        console.warn(`PDF text truncated from ${fullText.length} to ${MAX_TEXT_LENGTH} characters.`);
        fullText = fullText.substring(0, MAX_TEXT_LENGTH) + "\n\n[... PDF TEXT TRUNCATED ...]";
    }
  
    console.log(`Extracted text length: ${fullText.length}`);
    return fullText;
  };

  // Add this helper function inside or outside the component
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
            <div className="mx-auto max-w-3xl">
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
                skills={skills} // Use the skills array directly from the store selector
              />
            </div>
          </div>
        )}
      </div>

      <InputArea onSendMessage={handleSendMessage} isLoading={aiLoading || isProcessingFile} />
    </div>
  );
};

export default ChatWindow;