import React from "react";
import { User, GraduationCap, Briefcase, Lightbulb, FolderKanban, Award, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CVActionComponentProps {
  onOpenModal: (modalType: string) => void;
}

const aiActionStyles = "inline-flex items-center gap-1 mx-1 my-1 cursor-pointer rounded-full bg-primary/20 text-primary px-2 py-1 min-h-[36px] text-sm hover:bg-primary/30 active:bg-primary/40";

export const EditProfile: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("profile")}
      title="Editar Perfil"
    >
      <User size={isMobile ? 16 : 14} />
      <span>Editar Perfil</span>
    </span>
  );
};

export const EditEducation: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("education")}
      title="Editar Educación"
    >
      <GraduationCap size={isMobile ? 16 : 14} />
      <span>Editar Educación</span>
    </span>
  );
};

export const EditWorkExperience: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("work")}
      title="Editar Experiencia"
    >
      <Briefcase size={isMobile ? 16 : 14} />
      <span>Editar Experiencia</span>
    </span>
  );
};

export const EditSkills: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("skills")}
      title="Editar Habilidades"
    >
      <Lightbulb size={isMobile ? 16 : 14} />
      <span>Editar Habilidades</span>
    </span>
  );
};

export const EditProjects: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("projects")}
      title="Editar Proyectos"
    >
      <FolderKanban size={isMobile ? 16 : 14} />
      <span>Editar Proyectos</span>
    </span>
  );
};

export const EditAwards: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("awards")}
      title="Editar Premios"
    >
      <Award size={isMobile ? 16 : 14} />
      <span>Editar Premios</span>
    </span>
  );
};

export const UploadExistingCV: React.FC<CVActionComponentProps> = ({ onOpenModal }) => {
  const isMobile = useIsMobile();
  return (
    <span
      className={aiActionStyles}
      onClick={() => onOpenModal("upload")}
      title="Adjuntar CV"
    >
      <Upload size={isMobile ? 16 : 14} />
      <span>Adjuntar CV</span>
    </span>
  );
};