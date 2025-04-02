import React from 'react';
import { Button } from '@/components/ui/button';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="p-4 my-2 bg-gray-100 rounded-lg shadow-sm">
      <p className="text-gray-700 font-medium mb-3">
        Chat Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions && suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="suggestion"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-sm"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;