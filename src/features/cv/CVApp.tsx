import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChatStore } from '../../features/store/chatStore';
import { ChatContainer } from './components/ChatContainer';
import { CVSidebarPreview } from './components/CVSidebarPreview';
import { ModelSelector } from './components/ModelSelector';
import { useAI } from './hooks/useAI';
import { useChat } from './hooks/useChat';
import { useCV } from './hooks/useCV';
import { useTheme } from './hooks/useTheme';
import './styles.css';

// For demonstration purposes - in a real app, this would come from env variables or user settings
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

export const CVApp = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const clearStoreMessages = useChatStore((state) => state.clearMessages);
  
  const { 
    cvData, 
    updatePersonalInfo, 
    addExperience, 
    addEducation, 
    addSkill 
  } = useCV();
  
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    handleKeyPress, 
    messagesEndRef,
    chatContainerRef,
    addMessage,
    clearMessages
  } = useChat();

  const { sendUserMessageToAI, isLoading } = useAI({ 
    addMessage,
    apiKey: API_KEY,
    model: selectedModel
  });

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    console.log(`Model changed from ${selectedModel} to ${modelId}`);
    setSelectedModel(modelId);
  };

  // Override handleSendMessage to use the AI hook
  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      console.log('handleSendMessage called with input:', trimmedInput);
      sendUserMessageToAI(trimmedInput);
      setInputValue('');
    }
  };

  // Direct method to send predefined messages
  const handleSendPredefinedMessage = (message: string) => {
    console.log('Sending predefined message:', message);
    sendUserMessageToAI(message);
  };

  // Clear chat
  const clearChat = () => {
    // Clear UI messages
    clearMessages();
    // Clear store messages
    clearStoreMessages();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Auto-open sidebar on mobile when user starts adding content
  useEffect(() => {
    if (messages.length > 2 && window.innerWidth < 768 && !isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  }, [messages.length, isSidebarOpen]);

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
        <div className="flex items-center justify-center flex-1 p-2 sm:p-4">
          <ChatContainer
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
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
          />
        </div>
      </div>
    </div>
  );
}; 