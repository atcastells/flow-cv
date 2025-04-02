import { useState } from 'react';
import { CVData, Education, Experience, PersonalInfo } from '../features/cv/types';

export const useCV = () => {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
  });

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...info
      }
    }));
  };

  const addExperience = (experience: Experience) => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, experience]
    }));
  };

  const addEducation = (education: Education) => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, education]
    }));
  };

  const addSkill = (skill: string) => {
    if (!cvData.skills.includes(skill)) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  return {
    cvData,
    updatePersonalInfo,
    addExperience,
    addEducation,
    addSkill
  };
}; 