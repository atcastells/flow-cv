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
  modelSelector
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
    <Card className="w-full max-w-4xl h-full flex flex-col border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-t-lg flex-row items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-[var(--color-icon-on-primary)]" />
          <CardTitle>Asistente de CV</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {modelSelector}
          {onClearChat && messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearChat}
              title="Limpiar chat"
              className="text-[var(--color-icon-on-primary)] hover:bg-[var(--color-primary-hover)]"
            >
              <Trash2 className="w-5 h-5" />
              <span className="sr-only">Limpiar chat</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
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
      />
    </Card>
  );
}; 