import { cn } from "@/lib/utils";
import React, { createElement, useEffect, useRef } from "react";
import ActionButton from "./ActionButton";
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from "@/hooks/use-mobile";
import { MoreVertical, Paperclip } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileCard from "./ProfileCard";

interface Action {
  component: string;
  props?: Record<string, any>;
}

export interface ActionButtonData {
  label: string;
  action: () => void;
}

export interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  isNew?: boolean;
  onActionClick?: (action: Action) => void;
  files?: File[];
  id?: string;
  onDelete?: (id: string) => void;
  onProfileSave?: () => void;
  isLocal?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  timestamp = new Date(),
  isNew = false,
  onActionClick,
  files = [],
  id,
  onDelete,
  isLocal = false,
  onProfileSave,
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
        "message-container mb-4 max-w-[95%] sm:max-w-[85%] md:max-w-[80%] animate-fade-in",
        isUser && !isLocal ? "ml-auto" : "mr-auto",
        isLocal ? "w-full !max-w-full" : ""
      )}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="flex w-full gap-2 mb-1 flex-1">
          {files.length > 0 && (
            <div className="flex flex-col w-full gap-2">
              {files.map((file, index) => (
                <div key={index} className="cursor-pointer flex items-center gap-1 border-primary border rounded-md px-2 py-1 w-full" onClick={() => window.open(URL.createObjectURL(file), "_blank")}>
                  <Paperclip size={16} />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "rounded-md px-3 sm:px-4 py-2 sm:py-3 shadow-sm flex-grow",
              isUser && !isLocal
                ? "bg-user text-user-foreground"
                : "bg-ai text-ai-foreground",
              isLocal ? "bg-slate-400" : ""
            )}
          >
            {typeof content === 'string' ? (
              (() => {
                const parts: { type: 'text' | 'component'; content?: string; fullMatch?: string; component?: string; attributes?: string }[] = [];
                let lastIndex = 0;
                
                if (lastIndex < content.length) {
                  parts.push({
                    type: 'text',
                    content: content.substring(lastIndex)
                  });
                }

                if(isLocal) {
                  const ProfileCardWithData = () => createElement(ProfileCard, { onProfileSave });

                  switch (content) {
                    case "ProfileCardWithData":
                      return <ProfileCardWithData key={0} />;
                    default:
                  }
                }

                return parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <ReactMarkdown key={index} components={{
                        p: ({ children }) => <span className="inline whitespace-pre-wrap">{children}</span>
                      }}>{part.content}</ReactMarkdown>
                    );
                  } 
                  return null;
                });
              })()
            ) : null}
          </div>
          {id && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-md transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            isUser ? "text-right" : "text-left"
          )}
        >
          {(timestamp instanceof Date ? timestamp : new Date(timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;