import { useCVStore } from '@/features/store/CVStore';
import { CVData } from '@/features/store/CVStore';

// Type definitions for the tool parameters
type CVSectionValue = Record<string, string | string[] | number> | string[];

interface CVInfoParams {
  cvInfo: {
    [K in keyof CVData]?: CVSectionValue;
  };
}

/**
 * Tool function to save CV section information to the CV store.
 * @param args - The CV information containing sections to be saved
 * @returns A promise resolving to an object indicating the status of the operation
 */
export async function saveCVInfoTool(args: CVInfoParams): Promise<object> {
  console.log("--- Executing Tool: save_cv_info ---");
  console.log("Arguments:", args);
  
  try {
    const { cvInfo } = args;
    const store = useCVStore.getState();
    
    // Process each section in the cvInfo object
    Object.entries(cvInfo).forEach(([section, data]) => {
      // Use proper type casting with keyof CVData
      const sectionKey = section as keyof CVData;
      store.setCVSection(sectionKey, data);
      console.log(`Updated section: ${section}`);
    });
    
    return {
      status: "success",
      message: "CV information saved to store successfully.",
      updated_sections: Object.keys(cvInfo)
    };
  } catch (error) {
    console.error("Error saving CV info:", error);
    return {
      status: "error",
      message: "Failed to save CV info to store.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
