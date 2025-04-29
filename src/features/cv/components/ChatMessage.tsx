import { Message } from '../types';
import { SkillSelector } from './SkillSelector';
import { CheckCircle2, Info } from 'lucide-react'; // Import icons from lucide-react
import ReactMarkdown from 'react-markdown';

// Remove the old SVG Icon component definitions

interface ChatMessageProps {
  message: Message;
  onSkillSelect: (skills: string[], toolCallId: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
}

export const ChatMessage = ({ message, onSkillSelect, onSuggestionSelect }: ChatMessageProps) => {
  const { uiComponents } = message;  

  if (message.sender === 'bot' && message.text === "" && !uiComponents){
    return null;
  }

  let alignmentClass = 'justify-start'; // Default alignment
  let messageBubbleClasses = 'p-3 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow text-sm sm:text-base'; // Base classes for user/bot
  let content = null; // To hold the rendered content

  if (message.sender === 'user') {
    alignmentClass = 'justify-end';
    messageBubbleClasses += ' bg-[var(--color-accent-user)] text-[var(--color-text-on-accent-user)]';
    content = message.text.split('\n').map((line, index, arr) => (
      <span key={index}>
        {line}
        {index < arr.length - 1 && <br />}
      </span>
    ));
  } else if (message.sender === 'bot') {
    alignmentClass = 'justify-start';
    messageBubbleClasses += ' bg-[var(--color-accent-bot)] text-[var(--color-text-on-accent-bot)]';
    content = <ReactMarkdown>{message.text}</ReactMarkdown>;
  } else if (message.sender === 'system') {
    alignmentClass = 'justify-left'; // Center system messages
    messageBubbleClasses = 'p-2 rounded-md max-w-sm shadow text-xs '; // Adjusted base for system
    messageBubbleClasses += 'bg-[var(--color-bg-system)] text-[var(--color-text-system)] border border-[var(--color-border-system)] italic';

    try {
      const systemData = JSON.parse(message.text);
      if (systemData && typeof systemData === 'object' && systemData.message) {
        // Determine which icon to use based on status
        const IconComponent = systemData.status === 'success' ? CheckCircle2 : Info;
        const iconClasses = systemData.status === 'success' 
            ? "h-4 w-4 inline-block mr-1 text-green-600 dark:text-green-400 flex-shrink-0" // Added flex-shrink-0
            : "h-4 w-4 inline-block mr-1 text-blue-600 dark:text-blue-400 flex-shrink-0"; // Added flex-shrink-0

        content = (
          // Use flex to align icon and text properly
          <div className='flex flex-col items-start gap-2'>
            <pre>
              {JSON.stringify(systemData, null, 2)}
              <br />              
            </pre>
            <span>{systemData.message}</span>
            

            <div className="flex items-start"> 
              
              <div className='flex flex-row items-center'>
              <IconComponent className={iconClasses} aria-hidden="true" />
              {systemData.updated_sections && Array.isArray(systemData.updated_sections) && systemData.updated_sections.length > 0 && (
                <div className=" text-[0.7rem] opacity-80"> {/* Even smaller text for details */}
                  Updated: {systemData.updated_sections.join(', ')}
                </div>
              )}
            </div>
          </div>
          </div>
        );
      } else {
         // Parsed JSON but unexpected structure, render raw text with Info icon        
        
         content = null
      }
    } catch (e) {
      // Parsing failed, render raw text with Info icon
      console.warn("System message text is not valid JSON:", message.text);
      content = (
        <div className="flex items-start">
            <Info className="h-4 w-4 inline-block mr-1 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
            <span>{message.text}</span>
        </div>
      ); 
    }
  } else {
    // Fallback for unknown sender types
     alignmentClass = 'justify-center';
     messageBubbleClasses = 'p-2 rounded-md max-w-sm shadow text-xs bg-gray-200 text-gray-700 italic';
     content = (
        <div className="flex items-start">
            <Info className="h-4 w-4 inline-block mr-1 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <span>{message.text}</span>
        </div>
     );
  }


  return (
    <div className="max-w-full overflow-hidden my-2">
      {/* Align message bubble based on sender */}
      {content && (
      <div className={`flex ${alignmentClass}`}>
        <div className={messageBubbleClasses}>
          {content} {/* Render the prepared content */}
        </div>
      </div>
      )}
            {/* --- ADD SUGGESTION RENDERING --- */}
            {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-2 flex flex-col  gap-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"> {/* Align with bubble width */}
          {message.suggestions.map((suggestion, index) => (
            <button
              key={`${message.id}-suggestion-${index}`} // More specific key
              onClick={() => onSuggestionSelect(suggestion)}
              // Example Styling (customize with your CSS variables)
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {/* --- END SUGGESTION RENDERING --- */}
      {/* Render UI Components like SkillSelector - Keep as before */}
      {uiComponents?.map((component, index) => {
        if (component.type === 'skillSelector') {
          return (
            <>
            <div key={`skill-selector-${index}`} className="mt-2 flex justify-start"> 
              <SkillSelector
                category={component.props.category}
                jobTitle={component.props.jobTitle}
                industryContext={component.props.industryContext}
                onSelect={(skills) => onSkillSelect(skills, component.props.toolCallId)}
              />
            </div>
            </>
          );
        }
        return null;
      })}
    </div>
  );
};