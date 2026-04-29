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

Download the prebuilt binary for your platform from the [Releases](../../releases) page.

### Linux (x64)

```bash
curl -L https://github.com/chadijaber/kanboard/releases/latest/download/kanboard-linux-x64 -o kanboard
chmod +x kanboard
sudo mv kanboard /usr/local/bin/kanboard
```

### macOS (Apple Silicon)

```bash
curl -L https://github.com/chadijaber/kanboard/releases/latest/download/kanboard-macos-arm64 -o kanboard
chmod +x kanboard
sudo mv kanboard /usr/local/bin/kanboard
```

### macOS (Intel)

```bash
curl -L https://github.com/chadijaber/kanboard/releases/latest/download/kanboard-macos-x64 -o kanboard
chmod +x kanboard
sudo mv kanboard /usr/local/bin/kanboard
```

> **macOS note:** If macOS blocks the binary, run `xattr -d com.apple.quarantine /usr/local/bin/kanboard` once to clear the quarantine flag.

## Quick Start

```bash
# 1. Initialize a project in your repo root
kanboard init --name "My Project"

# 2. Open the interactive TUI
kanboard

# 3. Or use CLI commands directly
kanboard task add --name "Fix login bug" --status todo
kanboard task list
kanboard status
```

In the TUI, press `?` at any time to see all keyboard shortcuts.

## CLI Reference

### Project

| Command           | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `kanboard init`   | Initialize a new `.kanboard.json` in the current directory |
| `kanboard status` | Show task counts per board column                          |
| `kanboard config` | View or update project settings                            |

### Task

| Command                            | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `kanboard task add`                | Create a new task (`-n`, `-d`, `-o`, `-s`, `-D`, `-S`) |
| `kanboard task list`               | List tasks (filter with `--status`, `--owner`)         |
| `kanboard task show <id>`          | Show full task details                                 |
| `kanboard task update <id>`        | Update task fields                                     |
| `kanboard task move <id> <status>` | Move a task to a different column                      |
| `kanboard task delete <id>`        | Delete a task (`--force` to skip confirmation)         |

### Checklist

| Command                               | Description                |
| ------------------------------------- | -------------------------- |
| `kanboard task checklist <id> add`    | Add an item (`--text`)     |
| `kanboard task checklist <id> toggle` | Toggle an item (`--index`) |
| `kanboard task checklist <id> remove` | Remove an item (`--index`) |

### Sprint

| Command                         | Description                                |
| ------------------------------- | ------------------------------------------ |
| `kanboard sprint add`           | Create a sprint (`-n`, `--start`, `--end`) |
| `kanboard sprint list`          | List all sprints                           |
| `kanboard sprint show <id>`     | Show sprint details and progress           |
| `kanboard sprint update <id>`   | Update sprint fields                       |
| `kanboard sprint activate <id>` | Set the active sprint                      |
| `kanboard sprint delete <id>`   | Delete a sprint (tasks move to backlog)    |

### Sprint Milestones

| Command                                 | Description                    |
| --------------------------------------- | ------------------------------ |
| `kanboard sprint milestone add <id>`    | Add a milestone (`--text`)     |
| `kanboard sprint milestone toggle <id>` | Toggle a milestone (`--index`) |
| `kanboard sprint milestone remove <id>` | Remove a milestone (`--index`) |

### Docs

| Command                      | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `kanboard doc add`           | Create a doc (`--path`, `--title`, `--content`) |
| `kanboard doc list`          | List docs as a tree (`--flat` for a flat list)  |
| `kanboard doc read <path>`   | Render a doc in the terminal                    |
| `kanboard doc update <path>` | Update a doc's title or content                 |
| `kanboard doc delete <path>` | Delete a doc                                    |

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
