import { Briefcase, GraduationCap, Mail, MapPin, Phone, Wrench } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { ThemeSwitcher } from './ThemeSwitcher';
import { CVData } from '@/features/store/CVStore';

interface CVSidebarPreviewProps {
  cvData: CVData;
  theme: string;
  toggleTheme: () => void;
}

export const CVSidebarPreview = ({ cvData, theme, toggleTheme }: CVSidebarPreviewProps) => {
  // Ensure arrays exist to prevent runtime errors
  const experience = cvData.Experience || [];
  const education = cvData.Education || [];
  const skills = cvData.Skills || [];
  
  const hasData = Object.keys(cvData.Profile || {}).length > 0;

  return (
    <div className={`w-full md:w-72 lg:w-96 p-4 border-l border-[var(--color-border)] bg-[var(--color-bg-sidebar)] text-[var(--color-text-sidebar)] overflow-y-auto h-full flex flex-col`}>
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-4 text-center text-[var(--color-text-primary)]">Vista Previa CV</h2>
        {!hasData && (
          <p className="text-[var(--color-text-secondary)] text-center mt-10">
            La vista previa aparecerá aquí a medida que añadas información.
          </p>
        )}
        {hasData && (
          <div className="space-y-4 text-sm">
            {Object.keys(cvData.Profile || {}).length > 0 && (
              <section>
                {cvData.Profile['name'] && (
                  <h2 className="text-xl font-bold text-center text-[var(--color-text-primary)] mb-2">
                    {cvData.Profile['name']}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] mb-4">
                  {cvData.Profile['email'] && (
                    <span className="flex items-center">
                      <Mail size={12} className="mr-1" /> {cvData.Profile['email']}
                    </span>
                  )}
                  {cvData.Profile['phone'] && (
                    <span className="flex items-center">
                      <Phone size={12} className="mr-1" /> {cvData.Profile['phone']}
                    </span>
                  )}
                  {cvData.Profile['address'] && (
                    <span className="flex items-center">
                      <MapPin size={12} className="mr-1" /> {cvData.Profile['address']}
                    </span>
                  )}
                </div>
              </section>
            )}
            {experience && (
              <section>
                <SectionTitle icon={Briefcase} title="Experiencia Profesional" />
                <div className="space-y-3">
                  {experience.map((exp, index) => (
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
            {education && (
              <section>
                <SectionTitle icon={GraduationCap} title="Educación" />
                <div className="space-y-3">
                  {education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-[var(--color-text-primary)]">{edu.degree || 'Título sin especificar'}</h4>
                      <p className="text-sm font-medium text-[var(--color-secondary)]">{edu.institution || 'Institución sin nombre'}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-1">{edu.dates || 'Fechas sin especificar'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {skills && (
              <section>
                <SectionTitle icon={Wrench} title="Habilidades" />
                <ul className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
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