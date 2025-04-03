import { Message } from '../types';
import { SkillSelector } from './SkillSelector';

interface ChatMessageProps {
  message: Message;
  onSkillSelect: (skills: string[], toolCallId: string) => void;
}

export const ChatMessage = ({ message, onSkillSelect }: ChatMessageProps) => {
  const { uiComponents } = message;

  const handleSkillSelect = (skills: string[], toolCallId: string) => {
    if (onSkillSelect) {
      onSkillSelect(skills, toolCallId);
    }
  };
  
  return (
    <div className="max-w-full overflow-hidden">
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
        className={`p-3 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow text-sm sm:text-base ${
          message.sender === 'user'
            ? 'bg-[var(--color-accent-user)] text-[var(--color-text-on-accent-user)]'
            : 'bg-[var(--color-accent-bot)] text-[var(--color-text-on-accent-bot)]'
        }`}
      >
        {message.text.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
        </div>
      </div>

      {uiComponents?.map((component, index) => {
        if (component.type === 'skillSelector') {
          return (
            <SkillSelector
              key={`skill-selector-${index}`}
              category={component.props.category}
              jobTitle={component.props.jobTitle}
              industryContext={component.props.industryContext}
              onSelect={(skills) => onSkillSelect(skills, component.props.toolCallId)}
            />
          );
        }
        return null;
      })}
    </div>
  );
}; 