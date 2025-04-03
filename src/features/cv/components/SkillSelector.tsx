import React, { useEffect, useState } from 'react';

// Define skill categories - in a real app, these would come from your API or database
const skillsByCategory: Record<string, string[]> = {
  technical: [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git', 
    'Docker', 'AWS', 'HTML/CSS', 'GraphQL', 'REST APIs'
  ],
  soft: [
    'Communication', 'Leadership', 'Team Management', 'Problem Solving', 
    'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity'
  ],
  language: [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian', 'Portuguese'
  ],
  industry: [
    'Healthcare', 'Finance', 'Education', 'E-commerce', 'Marketing', 'UX/UI Design',
    'Data Science', 'AI/Machine Learning', 'Cybersecurity'
  ]
};

// Default "all" category includes a selection from each category
const allSkills = [
  ...skillsByCategory.technical.slice(0, 6),
  ...skillsByCategory.soft.slice(0, 4),
  ...skillsByCategory.language.slice(0, 3),
  ...skillsByCategory.industry.slice(0, 4)
];

interface SkillSelectorProps {
  category: string;
  jobTitle?: string;
  industryContext?: string;
  onSelect: (skills: string[]) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  category,
  jobTitle,
  industryContext,
  onSelect
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  
  useEffect(() => {
    // In a real app, you might want to fetch skill suggestions based on job title and industry
    // For now, we'll just use our predefined categories
    let skills: string[];
    
    if (category === 'all') {
      skills = allSkills;
    } else if (category in skillsByCategory) {
      skills = skillsByCategory[category as keyof typeof skillsByCategory];
    } else {
      skills = allSkills;
    }
    
    setAvailableSkills(skills);
  }, [category, jobTitle, industryContext]);
  
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  const handleSubmit = () => {
    onSelect(selectedSkills);
  };
  
  return (
    <div className="skill-selector p-4 mt-2 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Select Your Skills</h3>
      <p className="text-sm text-gray-600 mb-3">
        {jobTitle 
          ? `Select skills relevant for your ${jobTitle} position${industryContext ? ` in ${industryContext}` : ''}.` 
          : 'Select skills to add to your CV.'}
      </p>
      
      <div className="skill-options flex flex-wrap gap-2 mb-4">
        {availableSkills.map(skill => (
          <button
            key={skill}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedSkills.includes(skill)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedSkills.length} skills selected
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleSubmit}
          disabled={selectedSkills.length === 0}
        >
          Add to CV
        </button>
      </div>
    </div>
  );
};