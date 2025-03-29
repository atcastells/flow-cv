## Plan for Integrating Skills into Conversational UI (Scenario 1)

```mermaid
graph LR
    A[User Input: Skills in Chat (Text Field)] --> B{AI Processing};
    B --> C[Parse Skills from Text];
    C --> D{Call save_skills Tool};
    D --> E[Update skillsStore (Zustand)];
    E --> F[CVPreview Updates];
    B --> G[AI Proactive Prompt for Skills];
    G --> A;
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333,stroke-width:2px
    style G fill:#ccf,stroke:#333,stroke-width:2px
```

**Steps:**

1.  **Refine System Prompt (system.yaml):**
    *   Modify the system prompt to include instructions for the AI to proactively ask the user for their skills after the previous CV sections (like experience or education) are completed.
    *   Instruct the AI to expect skills to be provided as a comma-separated list or a free-form text.
    *   Ensure the prompt guides the AI to use the `save_skills` tool to persist the extracted skills in the `skillsStore`.

2.  **Verify `save_skills` Tool in `useChat` Hook (`src/features/ai/hooks.ts`):**
    *   Double-check that the `useChat` hook correctly defines the `save_skills` tool within its `availableTools` configuration.
    *   Confirm that the `save_skills` tool is mapped to the correct JavaScript function that updates the `useSkillsStore`.
    *   Ensure the tool description accurately reflects its purpose for the AI's understanding.

3.  **Chat UI (`src/components/ChatWindow.tsx`):**
    *   No specific UI modifications are needed in `ChatWindow.tsx` as we are using the existing text input field. The focus is on the AI's prompting and processing.
    *   Verify that the `CVPreview` component is correctly connected to the `skillsStore` to display the updated skills. (This is already confirmed as per your "Task Completed" message).

4.  **Testing:**
    *   Start a chat session.
    *   Go through the CV creation flow until the AI prompts for skills.
    *   Input skills in the chat input as a comma-separated list (e.g., "Python, React, SQL").
    *   Observe if the AI correctly processes the input and calls the `save_skills` tool (you can check console logs for tool calls if needed).
    *   Verify that the skills are correctly saved in the `skillsStore` (you can use Zustand devtools or console logs within the `save_skills` function).
    *   Confirm that the `CVPreview` component dynamically updates to display the newly added skills.