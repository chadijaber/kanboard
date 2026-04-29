# kanboard-cli

A terminal-native project management tool with an interactive Kanban board TUI and a full CLI for task, sprint, and documentation management. All data is stored locally in a `.kanboard.json` file — no server, no account required.

## Features

- **Interactive TUI** — full-screen Kanban board, docs browser, and sprint tracker navigable by keyboard
- **Task management** — create, update, move, and delete tasks across board columns
- **Checklists & deadlines** — add checklist items to tasks and set due dates with proximity warnings
- **Sprints** — plan sprints with start/end dates, assign tasks, track milestones, and set an active sprint
- **Docs** — write and browse Markdown documentation organized in a tree structure
- **Tags** — label tasks for quick filtering
- **CLI mode** — scriptable commands for every operation, with `--json` output for automation

## Installation

kanboard-cli is distributed as a private npm package via GitHub Releases. Node.js 16 or later is required.

1. Go to the [Releases](../../releases) page and download the latest `kanboard-cli-x.x.x.tgz` asset.
2. Install it globally with npm:

```bash
npm install -g kanboard-cli-x.x.x.tgz
```

After installation the `kanboard-cli` command will be available in your terminal.

## Quick Start

```bash
# 1. Initialize a project in your repo root
kanboard-cli init --name "My Project"

# 2. Open the interactive TUI
kanboard-cli

# 3. Or use CLI commands directly
kanboard-cli task add --name "Fix login bug" --status todo
kanboard-cli task list
kanboard-cli status
```

In the TUI, press `?` at any time to see all keyboard shortcuts.

## CLI Reference

### Project

| Command           | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `kanboard-cli init`   | Initialize a new `.kanboard.json` in the current directory |
| `kanboard-cli status` | Show task counts per board column                          |
| `kanboard-cli config` | View or update project settings                            |

### Task

| Command                            | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `kanboard-cli task add`                | Create a new task (`-n`, `-d`, `-o`, `-s`, `-D`, `-S`) |
| `kanboard-cli task list`               | List tasks (filter with `--status`, `--owner`)         |
| `kanboard-cli task show <id>`          | Show full task details                                 |
| `kanboard-cli task update <id>`        | Update task fields                                     |
| `kanboard-cli task move <id> <status>` | Move a task to a different column                      |
| `kanboard-cli task delete <id>`        | Delete a task (`--force` to skip confirmation)         |

### Checklist

| Command                               | Description                |
| ------------------------------------- | -------------------------- |
| `kanboard-cli task checklist <id> add`    | Add an item (`--text`)     |
| `kanboard-cli task checklist <id> toggle` | Toggle an item (`--index`) |
| `kanboard-cli task checklist <id> remove` | Remove an item (`--index`) |

### Sprint

| Command                         | Description                                |
| ------------------------------- | ------------------------------------------ |
| `kanboard-cli sprint add`           | Create a sprint (`-n`, `--start`, `--end`) |
| `kanboard-cli sprint list`          | List all sprints                           |
| `kanboard-cli sprint show <id>`     | Show sprint details and progress           |
| `kanboard-cli sprint update <id>`   | Update sprint fields                       |
| `kanboard-cli sprint activate <id>` | Set the active sprint                      |
| `kanboard-cli sprint delete <id>`   | Delete a sprint (tasks move to backlog)    |

### Sprint Milestones

| Command                                 | Description                    |
| --------------------------------------- | ------------------------------ |
| `kanboard-cli sprint milestone add <id>`    | Add a milestone (`--text`)     |
| `kanboard-cli sprint milestone toggle <id>` | Toggle a milestone (`--index`) |
| `kanboard-cli sprint milestone remove <id>` | Remove a milestone (`--index`) |

### Docs

| Command                      | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `kanboard-cli doc add`           | Create a doc (`--path`, `--title`, `--content`) |
| `kanboard-cli doc list`          | List docs as a tree (`--flat` for a flat list)  |
| `kanboard-cli doc read <path>`   | Render a doc in the terminal                    |
| `kanboard-cli doc update <path>` | Update a doc's title or content                 |
| `kanboard-cli doc delete <path>` | Delete a doc                                    |

### Common Flags

| Flag            | Short | Description                                 |
| --------------- | ----- | ------------------------------------------- |
| `--name`        | `-n`  | Name                                        |
| `--description` | `-d`  | Description                                 |
| `--owner`       | `-o`  | Task owner                                  |
| `--status`      | `-s`  | Status (e.g. `todo`, `in-progress`, `done`) |
| `--deadline`    | `-D`  | Task deadline (`YYYY-MM-DD`)                |
| `--sprint`      | `-S`  | Sprint ID                                   |
| `--json`        |       | Output as JSON                              |
| `--force`       | `-f`  | Skip confirmation prompts                   |

## TUI Keyboard Shortcuts

| Key     | Action                                      |
| ------- | ------------------------------------------- |
| `Tab`   | Switch between Board / Docs / Sprints views |
| `?`     | Toggle help overlay                         |
| `q`     | Quit                                        |
| `↑ ↓`   | Navigate items                              |
| `← →`   | Switch columns (Board view)                 |
| `Enter` | Open selected item                          |
| `a`     | Add new task / doc / sprint                 |
| `e`     | Edit selected item                          |
| `d`     | Delete selected item                        |
| `:`     | Open command input                          |
