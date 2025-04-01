import { useSkillsStore } from '../../store/skillsStore';

/**
 * Tool function to save skills to the skills store.
 * @param args - Object containing skills array
 * @returns A promise resolving to an object indicating the status of the operation
 */
export async function saveSkillsTool(args: { skills: string[] }): Promise<object> {
  console.log("--- Executing Tool: save_skills ---");
  console.log("Arguments:", args);
  try {
    if (!Array.isArray(args.skills)) {
      throw new Error('Invalid arguments: skills must be an array.');
    }
    const { setSkills } = useSkillsStore.getState();
    setSkills(args.skills);
    return { status: "success", message: "Skills saved successfully." };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving skills';
    console.error("Error executing tool save_skills:", errorMessage);
    return { status: "error", message: errorMessage };
  }
}