import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { Message } from '../types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { EmptyState } from './EmptyState';

interface ChatContainerProps {
  messages: Message[];
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
  onClearChat?: () => void;
  onSendPredefinedMessage?: (message: string) => void;
  modelSelector?: React.ReactNode;
  handleSkillSelection: (skills: string[], toolCallId: string) => void;
}

export const ChatContainer = ({
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  handleKeyPress,
  messagesEndRef,
  chatContainerRef,
  isLoading = false,
  onClearChat,
  onSendPredefinedMessage,
  modelSelector,
  handleSkillSelection
}: ChatContainerProps) => {
  
  const handleSendPredefinedMessage = (message: string) => {
    if (onSendPredefinedMessage) {
      onSendPredefinedMessage(message);
    } else {
      setInputValue(message);
      setTimeout(() => {
        handleSendMessage();
      }, 0);
    }
  };

  return (
    <Card className="w-full h-[100vh] md:h-[95vh] md:max-w-3xl rounded-none md:rounded-lg flex flex-col border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
      <CardHeader className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-none md:rounded-t-lg flex-row items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-[var(--color-icon-on-primary)]" />
          <CardTitle>Asistente de CV</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {modelSelector}
        </div>
      </CardHeader>

      <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[var(--color-bg-card)] text-[var(--color-text-primary)] overflow-x-hidden">
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onSkillSelect={handleSkillSelection} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <EmptyState onSendPredefinedMessage={handleSendPredefinedMessage} />
        )}
      </CardContent>

      <ChatInput
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        onSend={handleSendMessage}
        isLoading={isLoading}
        onClearChat={onClearChat}
        messageCount={messages.length}
      />
    </Card>
  );
}; 