## Plan: Add Save Button and Improved UX to ProfileCard

**Objective:**

Enhance the `ProfileCard` component by adding a "Save" button and improving the user experience when saving profile information.  Specifically, upon saving, the `ProfileCard` message in the `ChatWindow` should be replaced with a message hint indicating the profile edit.

**Revised Plan:**

1.  **Modify `ProfileCard.tsx`:**
    *   **Add a "Save" Button:** Include a button within the `ProfileCard` component, likely at the bottom. Use Tailwind CSS for styling consistency.
    *   **Implement `handleSave` Function:**
        *   This function will be called when the "Save" button is clicked.
        *   It will update the profile data using `setPersonalData`.
        *   It will execute a callback function, `onProfileSave`, passed as a prop from `ChatWindow`. This callback will notify `ChatWindow` to replace the `ProfileCard` message.

2.  **Modify `ChatWindow.tsx`:**
    *   **Identify `ProfileCard` Rendering:** Locate where `ProfileCard` is rendered within `ChatWindow.tsx`, likely within the `displayMessages` function as a "local" message.
    *   **Pass a Callback to `ProfileCard`:** When rendering `ProfileCard` in `ChatWindow`, pass the `onProfileSave` callback function as a prop.
    *   **Manage Message State:**
        *   Identify the message object representing the `ProfileCard`.
        *   When `onProfileSave` is triggered, update the `messages` state in `ChatWindow`.
        *   Replace the `ProfileCard` message object with a new message object representing a "profile edited" hint. This hint message will have different `content` (e.g., "Profile information updated") and potentially a different `role` (e.g., 'system' or 'hint') for styling.
    *   **Conditional Rendering in `displayMessages`:** The `displayMessages` function will re-render based on the updated `messages` state, displaying the "profile edited" hint message instead of the `ProfileCard`.

**Mermaid Diagram:**

```mermaid
graph LR
    A[Start] --> B{Modify ProfileCard.tsx};
    B --> C{Add Save Button};
    C --> D{Implement handleSave Function (with onProfileSave Callback)};
    D --> E{Modify ChatWindow.tsx};
    E --> F{Locate ProfileCard Rendering in displayMessages};
    F --> G{Pass onProfileSave Callback to ProfileCard};
    G --> H{Update messages State in ChatWindow on Profile Save};
    H --> I{Replace ProfileCard Message with "Profile Edited" Hint};
    I --> J{Conditional Rendering in displayMessages (Hint Message)};
    J --> K[Plan Complete];
```

This plan outlines the steps to add a "Save" button to the `ProfileCard` and enhance the UX by providing a clear indication within the `ChatWindow` when the profile information is saved.