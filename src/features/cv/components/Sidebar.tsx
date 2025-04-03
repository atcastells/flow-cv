import { Briefcase, GraduationCap, Mail, MapPin, Phone, Wrench, X } from 'lucide-react';
import { CVData } from '../types';
import { SectionTitle } from './SectionTitle';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  cvData: CVData;
  theme: string;
  toggleTheme: () => void;
  onClose?: () => void;
}

export const Sidebar = ({ cvData, theme, toggleTheme, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  const hasData =
    Object.keys(cvData.personalInfo || {}).length > 0 ||
    cvData.experience?.length > 0 ||
    cvData.education?.length > 0 ||
    cvData.skills?.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-bg-sidebar)] text-[var(--color-text-sidebar)]">
      {/* Mobile Close Button */}
      {isMobile && onClose && (
        <div className="flex justify-end p-2 border-b border-[var(--color-border)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[var(--color-icon)]"
          >
            <X size={20} />
            <span className="sr-only">Cerrar sidebar</span>
          </Button>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-4 text-center text-[var(--color-text-primary)]">Vista Previa CV</h2>
        {!hasData && (
          <p className="text-[var(--color-text-secondary)] text-center mt-10">
            La vista previa aparecerá aquí a medida que añadas información.
          </p>
        )}
        {hasData && (
          <div className="space-y-4 text-sm">
            {Object.keys(cvData.personalInfo || {}).length > 0 && (
              <section>
                {cvData.personalInfo.name && (
                  <h2 className="text-xl font-bold text-center text-[var(--color-text-primary)] mb-2">
                    {cvData.personalInfo.name}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] mb-4">
                  {cvData.personalInfo.email && (
                    <span className="flex items-center">
                      <Mail size={12} className="mr-1" /> {cvData.personalInfo.email}
                    </span>
                  )}
                  {cvData.personalInfo.phone && (
                    <span className="flex items-center">
                      <Phone size={12} className="mr-1" /> {cvData.personalInfo.phone}
                    </span>
                  )}
                  {cvData.personalInfo.address && (
                    <span className="flex items-center">
                      <MapPin size={12} className="mr-1" /> {cvData.personalInfo.address}
                    </span>
                  )}
                </div>
              </section>
            )}
            {cvData.experience && cvData.experience.length > 0 && (
              <section>
                <SectionTitle icon={Briefcase} title="Experiencia Profesional" />
                <div className="space-y-3">
                  {cvData.experience.map((exp, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-[var(--color-text-primary)]">{exp.jobTitle || 'Puesto sin título'}</h4>
                      <p className="text-sm font-medium text-[var(--color-primary)]">{exp.company || 'Empresa sin nombre'}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-1">{exp.dates || 'Fechas sin especificar'}</p>
                      {exp.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {cvData.education && cvData.education.length > 0 && (
              <section>
                <SectionTitle icon={GraduationCap} title="Educación" />
                <div className="space-y-3">
                  {cvData.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-[var(--color-text-primary)]">{edu.degree || 'Título sin especificar'}</h4>
                      <p className="text-sm font-medium text-[var(--color-secondary)]">{edu.institution || 'Institución sin nombre'}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-1">{edu.dates || 'Fechas sin especificar'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {cvData.skills && cvData.skills.length > 0 && (
              <section>
                <SectionTitle icon={Wrench} title="Habilidades" />
                <ul className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, index) => (
                    <li key={index} className="text-xs bg-[var(--color-accent-bot)] text-[var(--color-text-on-accent-bot)] px-2 py-1 rounded">
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
};