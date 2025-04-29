import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../../features/store/chatStore';
import type { Message as StoreMessage } from '../../features/ai/service';
import { ChatContainer } from './components/ChatContainer';
import { CVSidebarPreview } from './components/CVSidebarPreview';
import { ModelSelector } from './components/ModelSelector';
import { useAI } from './hooks/useAI';
import { useCV } from './hooks/useCV';
import { useTheme } from './hooks/useTheme';
import type { Message as UIMessage } from './types';
import './styles.css';

// For demonstration purposes - in a real app, this would come from env variables or user settings
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

export const CVApp = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  
  // Get messages and clear function directly from the store
  const storeMessages = useChatStore((state) => state.messages);
  const clearStoreMessages = useChatStore((state) => state.clearMessages);
  
  // Manage input value locally
  const [inputValue, setInputValue] = useState('');

  const { 
    cvData, 
    updatePersonalInfo, 
    addExperience, 
    addEducation, 
    addSkill 
  } = useCV();
  
  const { 
    sendUserMessageToAI, 
    isLoading, 
    handleSkillSelection,
  } = useAI({ 
    apiKey: API_KEY,
    model: selectedModel,
  });

  // --- Message Mapping --- 
  const uiMessages = useMemo(() => {
    return storeMessages
      .filter(msg => msg.role !== 'system' ) // Filter out system/tool messages for display
      .map((msg: StoreMessage, index: number): UIMessage => {
        let textContent = '';
        if (typeof msg.content === 'string') {
          textContent = msg.content;
        } else if (Array.isArray(msg.content)) {
          // Handle potential array content (e.g., multimodal text parts)
          textContent = msg.content
            .filter(part => part.type === 'text')
            .map(part => (part as { type: 'text'; text: string }).text)
            .join('\n');
        }

        

        // Map role to sender
        const sender: UIMessage['sender'] = msg.role === 'assistant' ? 'bot' : msg.role === 'user' ? 'user' : 'system';
        
        // Extract UI component if present
        const uiComponents = msg.uiComponent ? [msg.uiComponent] : undefined;
        
        return {
          // Use message ID from store if available, otherwise generate a temporary one (consider stability)
          // The store's ensureMessageId should provide a stable crypto.randomUUID()
          id: msg.id ? Number.parseInt(msg.id, 16) : Date.now() + index, // Attempt to use store ID, fallback needs improvement
          text: textContent,
          sender: sender,
          suggestions: msg.suggestions, // TODO: Add suggestion handling if needed
          suggestionsUsed: false,
          uiComponents: uiComponents,
        };
      });
  }, [storeMessages]);
  // --- End Message Mapping ---

  // Wrapper function to handle sending message from ChatContainer
  const handleSend = (value: string) => {
    const trimmedInput = value.trim();
    console.log('trimmedInput', trimmedInput);
    if (trimmedInput) {
      sendUserMessageToAI(trimmedInput);
      setInputValue(''); // Clear input after sending
    }
  };

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    console.log(`Model changed from ${selectedModel} to ${modelId}`);
    setSelectedModel(modelId);
  };

  // Direct method to send predefined messages
  const handleSendPredefinedMessage = (message: string) => {
    console.log('Sending predefined message:', message);
    sendUserMessageToAI(message);
  };

  // Clear chat - simplified to only clear the store
  const clearChat = () => {
    clearStoreMessages();
    console.log('Chat store cleared.');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`flex h-screen bg-[var(--color-bg-main)] font-sans`}>
      {/* Sidebar Toggle Button */}
      <Button
        variant="icon_toggle"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden absolute top-4 left-4 z-20 text-[var(--color-icon)] bg-[var(--color-bg-card)]/80 dark:bg-[var(--color-bg-card)]/80 backdrop-blur-sm border border-[var(--color-border)]"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="sr-only">Mostrar/Ocultar Resumen</span>
      </Button>    
      {/* CV Preview Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'block absolute top-0 left-0 z-10 w-full h-full' : 'hidden'}
          md:block md:relative md:flex-shrink-0 h-full
        `}
      >
        <CVSidebarPreview cvData={cvData} theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-center flex-1 p-0 md:p-4">
          <ChatContainer  
            messages={uiMessages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSend}
            isLoading={isLoading}
            onClearChat={clearChat}
            onSendPredefinedMessage={handleSendPredefinedMessage}
            modelSelector={
              <ModelSelector 
                apiKey={API_KEY}
                selectedModel={selectedModel}
                onSelectModel={handleModelSelect}
              />
            }
            handleSkillSelection={handleSkillSelection}
          />
        </div>
      </div>
    </div>
  );
}; 