# kanboard

A terminal-native project management tool for developers. Manage tasks, sprints, and documentation without leaving your terminal — no account, no server, no subscription.

Data is stored in a single `.kanboard.json` file at your project root, making it version-control friendly and portable across machines.

## What's inside

| Path                              | Description                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| [`kanboard-cli/`](./kanboard-cli) | The CLI tool and interactive TUI — source code and build config |

## Installation

kanboard-cli is distributed as a private npm package via GitHub Releases. Node.js 16 or later is required.

1. Go to the [Releases](../../releases) page and download the latest `kanboard-cli-x.x.x.tgz` asset.
2. Install it globally:

```bash
npm install -g kanboard-cli-x.x.x.tgz
```

## Quick start

```bash
# Initialize a project in your repo root
kanboard-cli init --name "My Project"

# Open the interactive board
kanboard-cli

# Or use CLI commands directly
kanboard-cli task add --name "Fix login bug" --status todo
kanboard-cli task list
kanboard-cli status
```

See the [full CLI reference and TUI keyboard shortcuts](./kanboard-cli/readme.md) in `kanboard-cli/readme.md`.
