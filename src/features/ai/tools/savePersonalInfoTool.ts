import { useProfileStore, PersonalData } from '../../store/profileStore';

/**
 * Tool function to save personal information to the profile store.
 * @param args - The personal data to be saved
 * @returns A promise resolving to an object indicating the status of the operation
 */
export async function savePersonalInfoTool(args: PersonalData): Promise<object> {
  console.log("--- Executing Tool: save_personal_info ---");
  console.log("Arguments:", args);
  
  try {
    // Update the profile store with the provided personal data
    useProfileStore.getState().setPersonalData(args);
    
    return {
      status: "success",
      message: "Personal info saved to store successfully.",
      received_args: args
    };
  } catch (error) {
    console.error("Error saving personal info:", error);
    return {
      status: "error",
      message: "Failed to save personal info to store.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}