/**
 * Types for chat suggestions functionality
 */

/**
 * Types of suggestions that can be presented to the user
 */
export enum SuggestionType {
  /** Triggers a specific app action (e.g., navigation) */
  APP_ACTION = 'APP_ACTION',
  /** Pre-filled text for the chat input */
  CHAT_PREFILL = 'CHAT_PREFILL'
}

/**
 * Payload for APP_ACTION type suggestions
 */
export interface AppActionPayload {
  /** The action identifier to be executed */
  actionId: string;
  /** Optional parameters for the action */
  params?: Record<string, unknown>;
}

/**
 * Payload for CHAT_PREFILL type suggestions
 */
export interface ChatPrefillPayload {
  /** The text to be pre-filled in the chat input */
  text: string;
}

/**
 * Union type for all possible suggestion payloads
 */
export type SuggestionPayload = AppActionPayload | ChatPrefillPayload;

/**
 * Represents a clickable suggestion in the chat interface
 */
export interface Suggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** Display text for the suggestion button */
  label: string;
  /** Type of suggestion (determines the action when clicked) */
  type: SuggestionType;
  /** The payload containing the suggestion's data */
  payload: SuggestionPayload;
  /** Optional icon identifier to display with the suggestion */
  icon?: string;
  /** Optional description for additional context */
  description?: string;
  /** Priority for ordering suggestions (higher numbers shown first) */
  priority?: number;
}