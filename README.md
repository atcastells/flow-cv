# CV Interaction Flow

This project implements an interactive CV (Curriculum Vitae) builder using a conversational chat interface. Users can interact with an AI assistant to provide their personal information, skills, experience, etc., and see a live preview of their CV updated in real-time.

## Features

*   **Conversational Interface:** Build your CV by chatting with an AI assistant.
*   **Integrated Live Preview:** See your CV update instantly as you provide information.
*   **AI-Powered Data Handling:** Uses AI tools to parse and save profile data (personal info, skills) to the application state.
*   **Persistent Chat:** Chat history is saved using `localStorage`, allowing you to resume your session later.
*   **Responsive Design:** The interface adapts to different screen sizes, including mobile devices.
*   **Component-Based:** Built with React, TypeScript, and Shadcn UI components.
*   **State Management:** Uses Zustand for managing global application state (profile data, chat messages, skills).

## Getting Started

### Prerequisites

*   Node.js (or Bun)
*   npm (or Bun package manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd cv-interaction-flow
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or if using Bun
    # bun install
    ```

### Configuration

This project requires API keys for the AI models it uses.

1.  Create a `.env` file in the root directory of the project.
2.  Add the following environment variables to the `.env` file, replacing `<your_api_key>` with your actual keys:

    ```env
    VITE_OPENROUTER_API_KEY=<your_openrouter_api_key>
    VITE_GROQ_API_KEY=<your_groq_api_key>
    ```

    *   `VITE_OPENROUTER_API_KEY`: Your API key for accessing models via OpenRouter.
    *   `VITE_GROQ_API_KEY`: Your API key for accessing models via Groq.

### Running the Application

*   **Development Mode:** Start the development server with hot reloading.
    ```bash
    npm run dev
    # or
    # bun run dev
    ```
    The application will typically be available at `http://localhost:5173`.

*   **Build for Production:** Create an optimized production build.
    ```bash
    npm run build
    # or
    # bun run build
    ```

*   **Preview Production Build:** Serve the production build locally.
    ```bash
    npm run preview
    # or
    # bun run preview
    ```

*   **Linting:** Check the code for potential errors and style issues.
    ```bash
    npm run lint
    # or
    # bun run lint
    ```

## Project Structure (Overview)

*   `src/`: Main application source code.
    *   `components/`: Reusable UI components (built with Shadcn UI).
    *   `features/`: Core application logic, including AI interaction, state management (Zustand stores), hooks, and tools.
    *   `pages/`: Top-level page components.
    *   `lib/`: Utility functions and configurations.
    *   `hooks/`: Custom React hooks.
*   `memory-bank/`: Contains context files tracking project details, decisions, and progress.
*   `public/`: Static assets.
*   `*.md`: Planning documents for specific features or refactors. 