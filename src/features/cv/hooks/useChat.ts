import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Message as UIMessage } from '../types';
import { Message as StoreMessage } from '../services/aiService';

const mapRoleToSender = (role: StoreMessage['role']): UIMessage['sender'] | null => {
  switch (role) {
    case 'user':
      return 'user';
    case 'assistant':
      return 'bot';
    case 'system':
      return 'system';
    case 'tool':
    default:
      return null;
  }
};

export const useChat = (onSendMessage: (message: string) => void) => {
  const storeMessages = useChatStore((state) => state.messages);
  const clearStoreMessages = useChatStore((state) => state.clearMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages: UIMessage[] = useMemo(() => {
    return storeMessages
      .map((msg, index): UIMessage | null => {
        const sender = mapRoleToSender(msg.role);
        if (sender && typeof msg.content === 'string') {
          return {
            id: Date.now() + index,
            text: msg.content,
            sender: sender,
            suggestions: null,
            suggestionsUsed: false,
          };
        }
        return null;
      })
      .filter((msg): msg is UIMessage => msg !== null);
  }, [storeMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearMessages = () => {
    clearStoreMessages();
  };

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      onSendMessage(trimmedInput);
      setInputValue('');
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
    clearMessages
  };
}; 