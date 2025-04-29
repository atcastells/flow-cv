import { ChatCompletionResponseMessage } from "../services";
import { Message } from "../types";

// Example parsing function (place in a utility file or within useAI.ts)
export const parseSuggestionsFromContent = ({content}: ChatCompletionResponseMessage): { cleanContent: string | null; suggestions: string[] } => {
    if (!content) {
      return { cleanContent: null, suggestions: [] };
    }
  
    // If content is not a string, we can't process it for suggestions
    if (typeof content !== 'string') {
      return { cleanContent: null, suggestions: [] };
    }
  
    const suggestions: string[] = [];
    // Regex to find <suggestion> tags and capture content
    const suggestionRegex = /<suggestion>(.*?)<\/suggestion>/g;

  
    // Replace tags with empty string (or keep for styling) while extracting
    const cleanContent = content.replace(suggestionRegex, (match, suggestionText) => {
      if (suggestionText) {
        suggestions.push(suggestionText.trim());
      }
      return ''; // Remove the tag from the content to be displayed
    }).trim();
    // If you want to keep tags for styling, adjust the replacement logic
  
    // Return content without tags, and the array of suggestions
    return { cleanContent: cleanContent || null, suggestions };
  }