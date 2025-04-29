import { ChatCompletionResponseMessage } from "../services";

/**
 * Sanitizes AI-generated content by removing unwanted artifacts and control sequences
 */
export const sanitizeContent = (content: string | null): string | null => {
  if (!content) return null;

  // Remove model artifact patterns
  let sanitized = content.replace(/<\|im_start\|>.*?$/gs, '');
  

  // Trim any trailing whitespace that might be left
  return sanitized.trim();
};

/**
 * Apply sanitization to a ChatCompletionResponseMessage
 */
export const sanitizeMessage = (message: ChatCompletionResponseMessage): ChatCompletionResponseMessage => {
  if (!message.content) return message;

  // Only sanitize if content is a string
  if (typeof message.content === 'string') {
    return {
      ...message,
      content: sanitizeContent(message.content)
    };
  }
  
  // Return unchanged if content is not a string
  return message;
};
