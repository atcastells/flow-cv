# System Flow Diagram

```mermaid
flowchart TD
    subgraph User Interaction
        U[User]
    end

    subgraph System Definition
        Roo(Roo Meta) --Manages--> ModeFeaturesStore["Mode Features Store .roo/mode_features_store.json"]
        U -- Manages System --> Roo
    end

    subgraph Workflow Execution
        CPO(CPO)
        Architect(Architect)
        Code(Code)
        Ask(Ask)
        Debug(Debug)
        Test(Test)
        Default(Default)

        U -- Starts Workflow --> CPO
        U -- Starts Workflow --> Ask
        U -- Can Invoke --> Default

        CPO -- Delegates High-Level Tasks --> Architect
        Architect -- Delegates Subtasks --> Code
        Architect -- Delegates Subtasks --> Test
        Architect -- Delegates Subtasks --> Debug
        Architect -- Delegates Subtasks --> Ask

        Code -- May Request Info --> Ask
        Test -- May Request Info --> Ask
        Debug -- May Request Info --> Ask

        %% Fallback/Switch to Default (Optional/Implicit)
        CPO -. May Switch To .-> Default
        Architect -. May Switch To .-> Default
        Code -. May Switch To .-> Default
        Test -. May Switch To .-> Default
        Debug -. May Switch To .-> Default
        Ask -. May Switch To .-> Default
    end