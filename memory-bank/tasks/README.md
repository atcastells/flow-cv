# Task Management Guidelines (`memory-bank/tasks/`)

This directory contains individual Markdown files, each representing a specific task, feature epic, or technical subtask required for the project.

## Purpose

- **Track Work:** Provides a clear, version-controlled record of planned and ongoing work.
- **Define Scope:** Each file details the requirements, goals, and status of a specific piece of work.
- **Facilitate Delegation:** Tasks are assigned and delegated between different modes (CPO, Architect, Specialists).
- **Maintain History:** Tracks the lifecycle and changes of each task.

## Task File Naming Convention

- **High-Level Tasks (CPO):** `task-XXX.md` (e.g., `task-001.md`) or descriptive prefixes like `feat-FEATURE_NAME-XXX.md`, `refactor-AREA-XXX.md`. `XXX` is a sequential number.
- **Sub-Tasks (Architect/Specialists):** `PARENT_TASK_ID-sub-YYY.md` (e.g., `task-001-sub-001.md`, `feat-chat-markdown-001-sub-001.md`). `YYY` is a sequential number within the parent task scope.

*Use `list_files` on this directory to determine the next available sequential number (`XXX` or `YYY`) before creating a new task file.*

## Task File Structure (Markdown)

Each task file should follow this general structure:

```markdown
# Task ID: [e.g., task-001, feat-chat-markdown-001-sub-001]

**Description:** Clear, concise description of the task's goal.
**Status:** [Pending | In Progress | Blocked | Review | Completed]
**Priority:** [Low | Medium | High | Critical]
**Assigned To:** [CPO | Architect | Code | Test | etc.]
**Created Date:** YYYY-MM-DD HH:MM:SS
**Last Updated:** YYYY-MM-DD HH:MM:SS
**Related Feature/Epic:** (Link to relevant section in `productContext.md` or parent task ID)
**Delegated From Task:** (ID of the parent task, if applicable, e.g., `task-001`)

---

## Details / Requirements / Acceptance Criteria

(Detailed description, user stories, technical notes, links to designs, or specific acceptance criteria.)
(For CPO tasks, this might link to `productContext.md`. For Architect/Specialist tasks, this section will be more detailed.)

---

## History

(Timestamped log of significant events, status changes, or decisions.)
- YYYY-MM-DD HH:MM:SS: Created by [Mode] based on [Reason/Source].
- YYYY-MM-DD HH:MM:SS: Status changed to [New Status] by [Mode] because [Reason].
- YYYY-MM-DD HH:MM:SS: Delegated to [Mode] by [Mode].
```

## Task Status Lifecycle

- **Pending:** The task is defined but not yet started.
- **In Progress:** The task is actively being worked on by the assigned mode.
- **Blocked:** The task cannot proceed due to an external dependency or issue. (Add details in History).
- **Review:** The task is complete but requires review or verification (e.g., code review, CPO acceptance).
- **Completed:** The task has been successfully finished and verified.

## Task Flow Example

1.  **CPO:** Identifies a need (from User Request, Roadmap, etc.). Defines the 'what' and 'why' in `productContext.md`. Creates a high-level task file (e.g., `feat-new-feature-005.md`) in `memory-bank/tasks/`, sets Status to `Pending`, Priority, and assigns to `CPO`.

## Linking Tasks to Commits (Optional)

To improve traceability between work items and code changes, developers (Code mode) should reference the relevant task or subtask ID in their commit messages.

**Recommended Commit Message Format:**

```
feat: Implement user login form

Refs: feat-auth-002-sub-001
```

Or for multiple tasks:

```
fix: Correct layout issues on mobile

Refs: task-015-sub-003, task-015-sub-004
```

This practice helps connect specific code changes back to the requirements and history documented in the task files.

2.  **CPO:** Delegates the task to the Architect using `new_task`, referencing the task file path (`memory-bank/tasks/feat-new-feature-005.md`). Updates the task file: Status -> `In Progress`, Assigned To -> `Architect`, adds History entry.
3.  **Architect:** Receives the task. Analyzes requirements. Decomposes the high-level task into smaller, technical subtasks (e.g., `feat-new-feature-005-sub-001.md`, `feat-new-feature-005-sub-002.md`). Creates these subtask files, linking them back via `Delegated From Task: feat-new-feature-005`. Assigns subtasks to appropriate modes (Code, Test, etc.) or keeps them assigned to `Architect` for further planning. Updates subtask Status to `Pending` or `In Progress`.
4.  **Specialist Modes (Code, Test, etc.):** Receive delegated subtasks via `new_task` from the Architect. Execute the work. Update their assigned subtask file's Status (`In Progress` -> `Review` or `Completed`) and History. Report completion back to the Architect using `attempt_completion`.
5.  **Architect:** Receives completion reports for subtasks. Updates the corresponding subtask files (Status -> `Completed`). Once all subtasks are done, updates the original high-level task file (`feat-new-feature-005.md`) delegated by the CPO: Status -> `Review` (or `Completed` if no CPO review needed), adds History entry. Reports overall completion back to the CPO using `attempt_completion`.
6.  **CPO:** Receives the completion report from the Architect. Reviews the outcome if necessary. Updates the high-level task file (`feat-new-feature-005.md`): Status -> `Completed`, adds final History entry.

This flow ensures clear ownership, traceability, and progress tracking throughout the development lifecycle.