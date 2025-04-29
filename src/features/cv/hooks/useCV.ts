
import { Education, Experience } from '../types';

import { useCVStore, PersonalData, Skills } from '../../store/CVStore';

export const useCV = () => {
  const { 
   cvData,
   setCVSection,
  } = useCVStore();


  console.log(cvData);

  const updatePersonalInfo = (info: Partial<PersonalData>) => {
    setCVSection('PersonalData', info as PersonalData);
  };

  const addExperience = (experience: Experience) => {
    const currentExperience = Array.isArray(cvData.Experience) 
      ? cvData.Experience as unknown[] 
      : [];
    
    const updatedExperience = [...currentExperience, experience] as unknown as Experience[];
    setCVSection('Experience', updatedExperience);
  };

  const addEducation = (education: Education) => {
    const currentEducation = Array.isArray(cvData.Education) 
      ? cvData.Education as unknown[] 
      : [];
    
    const updatedEducation = [...currentEducation, education] as unknown as Education[];
    setCVSection('Education', updatedEducation);
  };

  const addSkill = (skill: string) => {
    const currentSkills = Array.isArray(cvData.Skills)  
      ? cvData.Skills as unknown[] 
      : [];

    if (!currentSkills.includes(skill)) {
      setCVSection('Skills', [...currentSkills, skill] as unknown as Skills);
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