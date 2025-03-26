
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import ActionButton from "./ActionButton";

export interface ActionButtonData {
  label: string;
  action: () => void;
}

export interface ChatMessageProps {
  content: string;
  isUser: boolean;
  actions?: ActionButtonData[];
  timestamp?: Date;
  isNew?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  actions = [],
  timestamp = new Date(),
  isNew = false
}) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew && messageRef.current) {
      messageRef.current.classList.add("message-enter");
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isNew]);

  return (
    <div
      ref={messageRef}
      className={cn(
        "message-container mb-4 max-w-[80%] animate-fade-in",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-user text-user-foreground"
            : "bg-ai text-ai-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        
        {!isUser && actions && actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <ActionButton
                key={index}
                label={action.label}
                onClick={action.action}
                variant={index === 0 ? "primary" : "secondary"}
              />
            ))}
          </div>
        )}
      </div>
      <div
        className={cn(
          "mt-1 text-xs text-muted-foreground",
          isUser ? "text-right" : "text-left"
        )}
      >
        {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
};

export default ChatMessage;
