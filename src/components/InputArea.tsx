
import React, { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  className?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, className }) => {
  const [message, setMessage] = useState("");
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-adjust height based on content
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className={cn("border-t bg-card/80 backdrop-blur-sm sticky bottom-0 p-4", className)}>
      <div className="mx-auto max-w-3xl flex gap-2 items-end">
        <textarea
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 max-h-[120px] min-h-[40px] resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className={cn(
            "rounded-full p-2 transition-all",
            message.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-100"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
