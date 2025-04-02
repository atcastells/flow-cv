import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => (
  <div>
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
  </div>
); 