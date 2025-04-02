import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'ghost' | 'icon_toggle' | 'suggestion' | 'default';
  size?: string;
  active?: boolean;
}

export const Button = ({ className, children, variant = 'default', size, active, ...props }: ButtonProps) => {
  let baseClasses = `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-[var(--color-bg-card)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`;
  if (variant === 'ghost') {
    baseClasses += ` h-10 px-3 py-2 flex-1 `;
    if (active) {
      baseClasses += ` bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-sm`;
    } else {
      baseClasses += ` bg-transparent text-[var(--color-text-sidebar)] hover:bg-[var(--color-bg-card)]/60 dark:hover:bg-[var(--color-bg-card)]/60`;
    }
  } else if (variant === 'icon_toggle') {
    baseClasses += ` hover:bg-[var(--color-bg-card)]/50 dark:hover:bg-[var(--color-bg-card)]/50 h-10 w-10`;
  } else if (variant === 'suggestion') {
    baseClasses += ` px-3 py-1 h-auto text-xs border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)]/10`;
  } else {
    baseClasses += ` bg-[var(--color-accent-user)] text-[var(--color-text-on-accent-user)] hover:bg-[var(--color-accent-user-hover)] h-10 px-4 py-2 shadow`;
  }
  return (
    <button className={`${baseClasses} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};
