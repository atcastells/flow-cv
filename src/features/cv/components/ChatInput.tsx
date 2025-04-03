import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Trash2 } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isLoading?: boolean;
  onClearChat?: () => void;
  messageCount?: number;
}

export const ChatInput = ({ 
  value, 
  onChange, 
  onKeyPress, 
  onSend,
  isLoading = false,
  onClearChat,
  messageCount = 0
}: ChatInputProps) => (
  <CardFooter className="border-t border-[var(--color-border)] p-3 sm:p-4 bg-[var(--color-bg-input)] rounded-b-lg">
    <div className="flex w-full items-center gap-2 flex-col">
      {/* Input */}
      <div className="flex-1 flex items-center gap-2 w-full">
      <Input
        type="text"
        placeholder="Responde aquí o escribe 'listo'..."
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            onSend();
          }
        }}
        className="flex-1"
        disabled={isLoading}
      />
      <Button onClick={onSend} disabled={isLoading} className="shrink-0">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </Button>
      </div>
      {/* Actions */}
      <div className="flex flex-row w-full">
      {onClearChat && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClearChat} 
          disabled={messageCount === 0}
          className="w-10 justify-start shrink-1 flex-grow-0"
        >
          <Trash2 className="w-5 h-5" />
          <span className="sr-only">Limpiar chat</span>
        </Button>
      )}
      <div className="flex-1"></div>
      </div>
    </div>
  </CardFooter>
); 