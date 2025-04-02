import { z } from "zod";
import { SuggestionType } from "../types/chat";

/**
 * Schema for chat suggestion generation requests.
 * Provides context to help generate relevant suggestions.
 */
const inputSchema = z.object({
  /** Current conversation context to base suggestions on */
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })),
  /** Active section or page in the app */
  currentContext: z.string(),
  /** Optional maximum number of suggestions to return */
  maxSuggestions: z.number().min(1).max(10).optional().default(5)
});

/**
 * Schema for suggestion output, matching the Suggestion interface
 */
const outputSchema = z.array(z.object({
  id: z.string(),
  label: z.string(),
  type: z.nativeEnum(SuggestionType),
  payload: z.union([
    // APP_ACTION payload
    z.object({
      actionId: z.string(),
      params: z.record(z.unknown()).optional()
    }),
    // CHAT_PREFILL payload
    z.object({
      text: z.string()
    })
  ]),
  icon: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().optional()
}));

export type ProvideChatSuggestionsInput = z.infer<typeof inputSchema>;
export type ProvideChatSuggestionsOutput = z.infer<typeof outputSchema>;

/**
 * Tool: provide_chat_suggestions
 * 
 * Purpose: Generates contextually relevant suggestions for the chat interface based on
 * the current conversation history and app context. These suggestions can either be
 * pre-filled messages or actions the user might want to take.
 * 
 * Usage:
 * - Analyze conversation history and current context to understand user intent
 * - Generate relevant suggestions that either:
 *   1. Pre-fill chat messages for common follow-up questions/requests
 *   2. Suggest app actions that might help the user achieve their goals
 * - Prioritize suggestions based on relevance and likelihood of use
 * - Include helpful icons and descriptions for better user understanding
 * 
 * Example:
 * If user is discussing skills and on the skills page:
 * - Suggest actions like "Add new skill" or "Filter skills by category"
 * - Suggest follow-up questions like "What are my top skills?"
 * 
 * @param {ProvideChatSuggestionsInput} input - Conversation history and context
 * @returns {Promise<ProvideChatSuggestionsOutput>} Array of relevant suggestions
 */
export const provideChatSuggestionsTool = {
  name: "provide_chat_suggestions",
  description: "Generates contextually relevant chat suggestions based on conversation history",
  inputSchema,
  outputSchema
};