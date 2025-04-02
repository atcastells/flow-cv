import React, { useEffect } from 'react';
import { Message } from '../features/ai/service';
import { useChatStore } from '../features/store/chatStore';
import { useChatSuggestions } from '../hooks/useChatSuggestions';
import { ChatSuggestions } from './ChatSuggestions';

interface ChatContainerProps {
  onSendMessage: (message: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ onSendMessage }) => {
  const messages = useChatStore((state) => state.messages);
  const { suggestions, loading, fetchSuggestions } = useChatSuggestions();

  // Fetch suggestions whenever the messages change
  useEffect(() => {
    if (messages.length > 0) {
      fetchSuggestions(messages);
    }
  }, [messages, fetchSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {typeof message.content === 'string' ? message.content : null}
            </div>
          </div>
        ))}
      </div>
      
      {/* Chat Suggestions */}
      <div className="border-t border-gray-200">
        <ChatSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          loading={loading}
        />
      </div>
    </div>
  );
};