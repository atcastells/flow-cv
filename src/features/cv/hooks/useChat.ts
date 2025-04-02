import { useEffect, useRef, useState } from 'react';
import { Message } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, sender: 'user' | 'bot' | 'system', suggestions: string[] | null = null) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, sender, suggestions, suggestionsUsed: false },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      addMessage(trimmedInput, 'user');
      setInputValue('');
      
      // Here would go any additional processing needed before sending to LM
      // The actual communication with LM and data storage is now handled externally
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
    messagesEndRef,
    chatContainerRef,
    addMessage,
    clearMessages
  };
}; 