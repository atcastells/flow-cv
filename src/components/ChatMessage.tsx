import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import ActionButton from "./ActionButton";
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from "@/hooks/use-mobile";

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
  actions?: ActionButtonData[];
  timestamp?: Date;
  isNew?: boolean;
  onActionClick?: (action: Action) => void;
  inlineComponents?: Record<string, React.ComponentType<any>>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  actions = [],
  timestamp = new Date(),
  isNew = false,
  onActionClick,
  inlineComponents = {}
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm",
          isUser
            ? "bg-user text-user-foreground"
            : "bg-ai text-ai-foreground"
        )}
      >
        {(() => {
          const parts: { type: 'text' | 'component'; content?: string; fullMatch?: string; component?: string; attributes?: string }[] = [];
          let lastIndex = 0;
          const actionRegex = /`(?:<action>(.*?)<\/action>)`/gm; // Modified regex to capture backticks
          let actionMatch;

          while ((actionMatch = actionRegex.exec(content)) !== null) {
            // Add text before the action block
            if (actionMatch.index > lastIndex) {
              parts.push({
                type: 'text',
                content: content.substring(lastIndex, actionMatch.index)
              });
            }

            const actionContent = actionMatch[1]?.trim(); // Content inside <action>
            if (actionContent) {
              const selfClosingTagRegex = /<([^\s>]+)(?:\s+([^>]*))?\/>/;
              const selfClosingMatch = actionContent.match(selfClosingTagRegex);

              if (selfClosingMatch) {
                parts.push({
                  type: 'component',
                  fullMatch: actionMatch[0], // Store the full match (including backticks and <action>)
                  component: selfClosingMatch[1],
                  attributes: selfClosingMatch[2] || ''
                });
              } else {
                // If no self-closing tag found inside <action>, treat the whole block as text (including backticks)
                parts.push({
                  type: 'text',
                  content: actionMatch[0]
                });
              }
            } else {
              // If <action> tag was present but empty, treat as text (including backticks)
              parts.push({
                type: 'text',
                content: actionMatch[0]
              });
            }

            lastIndex = actionMatch.index + actionMatch[0].length;
          }

          // Add remaining text after the last action block
          if (lastIndex < content.length) {
            parts.push({
              type: 'text',
              content: content.substring(lastIndex)
            });
          }

          return parts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <ReactMarkdown key={index} components={{
                  p: ({ children }) => <span className="inline whitespace-pre-wrap">{children}</span>
                }}>{part.content}</ReactMarkdown>
              );
            } else if (part.type === 'component') {
              const componentName = part.component;
              const attributesStr = part.attributes;
              let props: Record<string, any> = {};

              const attributeMatches = attributesStr.matchAll(/([^\s=]+)="([^"]*)"/g);
              for (const attrMatch of attributeMatches) {
                const [_, attrName, attrValue] = attrMatch;
                props[attrName] = attrValue;
              }

              if (inlineComponents[componentName]) {
                const InlineComponent = inlineComponents[componentName];
                return <InlineComponent key={index} {...props} />;
              } else if (onActionClick) {
                try {
                  const label = componentName.replace(/([A-Z])/g, ' $1').trim();
                  const action: Action = {
                    component: componentName,
                    props
                  };
                  return (
                    <span key={index} className="mx-1 inline-flex">
                      <ActionButton
                        label={isMobile && label.length > 12 ? label.substring(0, 12) + '...' : label}
                        onClick={() => onActionClick(action)}
                        variant="secondary"
                        className="my-1 min-h-[36px]" // Ensure good touch target size
                      />
                    </span>
                  );
                } catch (error) {
                  console.error('Error rendering ActionButton:', error);
                  return part.fullMatch;
                }
              }
            }
            return null;
          });
        })()}
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
  );
};

export default ChatMessage;