import React from 'react';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  loading?: boolean;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  loading = false
}) => {
  if (loading) {
    return <div className="flex justify-center p-2 text-gray-500">Loading suggestions...</div>;
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};