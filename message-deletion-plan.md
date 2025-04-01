# Plan: Implement Message Deletion (No Confirmation)

This plan outlines the steps to add functionality for deleting individual messages from the chat interface without requiring user confirmation.

## 1. Update State Management (`src/features/store/chatStore.ts`)

*   **Add Delete Action:**
    *   Define a `deleteMessage(id: string)` function in the `ChatState` interface.
    *   Implement the `deleteMessage` function within the `create` call. This function will find the message with the matching `id` in the `messages` array and update its `content` to a specific marker string, like `"[DELETED_MESSAGE]"`.
*   **Ensure Unique IDs:**
    *   Modify the `addMessage` and `addMessages` actions to ensure every message added to the store has a unique `id`. If a message doesn't come with an `id`, generate one using `crypto.randomUUID()` or a similar method before adding it to the state.

## 2. Enhance the Chat Hook (`src/features/ai/hooks.ts`)

*   **Expose Delete Handler:**
    *   Create a new function `handleDeleteMessage(id: string)` within the `useChat` hook.
    *   This function will directly call the `deleteMessage` action imported from the `useChatStore`.
    *   Return `handleDeleteMessage` from the hook's return object.
*   **ID Assignment:**
    *   Double-check that the `sendMessage` and internal `processChatTurn` logic correctly assign unique IDs to messages before they reach the store actions, coordinating with the changes made in `chatStore.ts`.

## 3. Modify the Chat Window Component (`src/components/ChatWindow.tsx`)

*   **Remove Modal Logic:** Delete any state variables and functions previously intended for a confirmation modal.
*   **Pass Direct Delete Handler:**
    *   In the `displayMessages` mapping logic, retrieve the `handleDeleteMessage` function from the `useChat` hook.
    *   Pass the `message.id` (ensure it's available) and the `handleDeleteMessage` function down as props (e.g., `onDelete`) to each `ChatMessage` component.
*   **Render Deleted Placeholder:**
    *   Modify the `displayMessages` mapping logic. If `message.content === "[DELETED_MESSAGE]"`, render a simplified placeholder (e.g., `<div>[Message deleted]</div>`) instead of the full `ChatMessage` component.

## 4. Update the Message Component (`src/components/ChatMessage.tsx`)

*   **Accept Props:**
    *   Update `ChatMessageProps` to accept `id: string` and `onDelete: (id: string) => void`.
*   **Add Action Menu:**
    *   Integrate a small menu button (e.g., three vertical dots icon) into the message layout, likely appearing on hover.
    *   Use a dropdown component (e.g., Shadcn UI's `DropdownMenu`) triggered by the menu button.
    *   Add a "Delete" item to this dropdown menu.
*   **Trigger Direct Delete:**
    *   When the "Delete" menu item is clicked, call the `onDelete(id)` prop function, passing the message's `id`.

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant ChatMessage UI
    participant ChatWindow UI
    participant useChat Hook
    participant ChatStore (Zustand)

    User->>ChatMessage UI: Clicks 3-dot menu on a message
    ChatMessage UI->>ChatMessage UI: Shows DropdownMenu
    User->>ChatMessage UI: Clicks "Delete" item
    ChatMessage UI->>ChatWindow UI: Calls onDelete(messageId) prop (handleDeleteMessage from hook)
    ChatWindow UI->>useChat Hook: (Directly calls) handleDeleteMessage(messageId)
    useChat Hook->>ChatStore (Zustand): Calls deleteMessage(messageId) action
    ChatStore (Zustand)->>ChatStore (Zustand): Finds message by ID & updates content
    ChatStore (Zustand)-->>ChatWindow UI: Notifies of state update
    ChatWindow UI->>ChatWindow UI: Re-renders, showing placeholder for deleted message