import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  content: string;
  onChange: (content: string) => void;
  onSend: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  hasFiles: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  content,
  onChange,
  onSend,
  onFileSelect,
  isLoading,
  hasFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Escribe tu mensaje o adjunta un archivo..."
        className="resize-none pr-24 pl-10"
        disabled={isLoading}
        onKeyDown={handleKeyDown}
      />
      {/* Attach button */}
      <label 
        htmlFor="file-upload" 
        className={cn(
          "absolute left-3 bottom-3 cursor-pointer p-1 rounded-full hover:bg-muted",
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        )}
        aria-disabled={isLoading}
      >
        <Paperclip className={cn("h-5 w-5", hasFiles ? "text-primary" : "text-muted-foreground")} />
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onFileSelect}
          disabled={isLoading}
        />
      </label>
      {/* Send button */}
      <div className="absolute right-3 bottom-3 flex items-center">
        <Button 
          onClick={onSend}
          disabled={isLoading || (!content.trim() && !hasFiles)}
          size="sm"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;