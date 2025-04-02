import { useEffect, useRef, useState } from 'react';
import { Message } from '../features/cv/types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente para crear CVs. Para empezar, ¿cuál es tu nombre completo?',
      sender: 'bot',
      suggestions: null,
      suggestionsUsed: false,
    },
  ]);
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

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      addMessage(trimmedInput, 'user');
      setInputValue('');
      
      // Here you would process the user input and generate a bot response
      // For now, we'll just echo a placeholder response
      setTimeout(() => {
        addMessage('Gracias por tu respuesta. ¿Qué más te gustaría añadir a tu CV?', 'bot');
      }, 500);
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
    chatContainerRef
  };
}; 