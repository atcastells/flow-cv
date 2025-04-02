import { SectionTitleProps } from '../types';

export const SectionTitle = ({ icon: Icon, title }: SectionTitleProps) => (
  <h3 className="text-lg font-semibold mt-4 mb-2 border-b border-[var(--color-primary)] pb-1 flex items-center text-[var(--color-text-primary)]">
    {Icon && <Icon size={18} className="mr-2 text-[var(--color-icon)]" />}
    {title}
  </h3>
); 