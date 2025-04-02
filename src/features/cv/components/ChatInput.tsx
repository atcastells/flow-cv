import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isLoading?: boolean;
}

export const ChatInput = ({ 
  value, 
  onChange, 
  onKeyPress, 
  onSend,
  isLoading = false
}: ChatInputProps) => (
  <CardFooter className="border-t border-[var(--color-border)] p-3 sm:p-4 bg-[var(--color-bg-input)] rounded-b-lg">
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
      className="flex-1 mr-2"
      disabled={isLoading}
    />
    <Button onClick={onSend} disabled={isLoading}>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
    </Button>
  </CardFooter>
); 