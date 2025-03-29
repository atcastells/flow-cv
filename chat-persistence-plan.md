# Plan: Implement Persistent Chat Messages using Zustand

**Goal:** Modify the application to store chat messages persistently across page refreshes using Zustand and `localStorage`, aligning with the pattern used in `profileStore.ts`.

**Steps:**

1.  **Create a new Zustand Store for Chat:**
    *   Create a file: `src/features/store/chatStore.ts`.
    *   Import `create` from `zustand` and `persist`, `createJSONStorage` from `zustand/middleware`.
    *   Import the `Message` type from `../ai/service`.
    *   Define the store's state interface (`ChatState`) with:
        *   `messages: Message[]`
        *   `addMessage: (message: Message) => void`
        *   `addMessages: (newMessages: Message[]) => void` (for adding multiple, like tool results)
        *   `clearMessages: () => void`
    *   Implement the store using `create<ChatState>()(persist(...))`.
    *   Inside `persist`:
        *   Define the initial state: `messages: []`.
        *   Implement actions (`addMessage`, `addMessages`, `clearMessages`) using `set((state) => ({ messages: ... }))`.
        *   Configure persistence options:
            *   `name: 'chat-storage'` (key for localStorage).
            *   `storage: createJSONStorage(() => localStorage)` (explicitly use localStorage).
            *   Optionally use `partialize: (state) => ({ messages: state.messages })` to only store the messages array.

2.  **Refactor `useChat` Hook (`src/features/ai/hooks.ts`):**
    *   Remove the local `useState` for `messages`.
    *   Import and use the new `useChatStore`.
    *   Select the `messages` array and the actions (`addMessage`, `addMessages`, `clearMessages`) from the store.
    *   Update `sendMessage`: Instead of `setMessages`, call the store's `addMessage` action.
    *   Update `processChatTurn`:
        *   When adding the assistant's response (text or tool calls), use the store's `addMessage`.
        *   When adding tool results, use the store's `addMessages`.
    *   Update `clearMessages`: Call the store's `clearMessages` action.
    *   The hook will no longer manage the message state directly; it orchestrates calls to the store and handles the API interaction logic (`isLoading`, `service` calls, etc.).

**Diagram (Zustand Approach):**

```mermaid
sequenceDiagram
    participant User
    participant ChatWindow
    participant useChatHook
    participant ChatStore <br/> (Zustand + Persist)
    participant LocalStorage

    User->>ChatWindow: Loads page/component
    ChatWindow->>useChatHook: Initializes
    useChatHook->>ChatStore: Subscribes/Selects state & actions
    ChatStore->>LocalStorage: Reads 'chat-storage' (via persist middleware)
    LocalStorage-->>ChatStore: Returns stored messages
    ChatStore-->>useChatHook: Provides initial messages state
    useChatHook-->>ChatWindow: Provides messages
    ChatWindow->>User: Displays messages

    User->>ChatWindow: Sends new message
    ChatWindow->>useChatHook: Calls sendMessage(newMessage)
    useChatHook->>ChatStore: Calls addMessage(newMessage) action
    ChatStore->>ChatStore: Updates state
    ChatStore->>LocalStorage: Saves updated state (via persist middleware)

    Note right of useChatHook: API call, receives assistant message
    useChatHook->>ChatStore: Calls addMessage(assistantMessage) action
    ChatStore->>ChatStore: Updates state
    ChatStore->>LocalStorage: Saves updated state (via persist middleware)

    User->>ChatWindow: Clicks 'Clear Chat'
    ChatWindow->>useChatHook: Calls clearMessages()
    useChatHook->>ChatStore: Calls clearMessages() action
    ChatStore->>ChatStore: Resets state
    ChatStore->>LocalStorage: Saves empty state (via persist middleware)