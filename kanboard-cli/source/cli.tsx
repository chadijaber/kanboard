#!/usr/bin/env node
import React from 'react';
import {render, Text} from 'ink';
import meow from 'meow';
import App from './app.js';
import {initCommand} from './commands/init.js';
import {statusCommand} from './commands/status.js';
import {configCommand} from './commands/config.js';
import {taskAddCommand} from './commands/task/add.js';
import {taskListCommand} from './commands/task/list.js';
import {taskShowCommand} from './commands/task/show.js';
import {taskUpdateCommand} from './commands/task/update.js';
import {taskMoveCommand} from './commands/task/move.js';
import {taskDeleteCommand} from './commands/task/delete.js';
import {
	taskChecklistAddCommand,
	taskChecklistToggleCommand,
	taskChecklistRemoveCommand,
} from './commands/task/checklist.js';
import {docAddCommand} from './commands/doc/add.js';
import {docListCommand} from './commands/doc/list.js';
import {docReadCommand} from './commands/doc/read.js';
import {docUpdateCommand} from './commands/doc/update.js';
import {docDeleteCommand} from './commands/doc/delete.js';
import {sprintAddCommand} from './commands/sprint/add.js';
import {sprintListCommand} from './commands/sprint/list.js';
import {sprintShowCommand} from './commands/sprint/show.js';
import {sprintUpdateCommand} from './commands/sprint/update.js';
import {sprintDeleteCommand} from './commands/sprint/delete.js';
import {sprintActivateCommand} from './commands/sprint/activate.js';
import {
	sprintMilestoneAddCommand,
	sprintMilestoneToggleCommand,
	sprintMilestoneRemoveCommand,
} from './commands/sprint/milestone.js';

const cli = meow(
	`
	Usage
	  $ kanboard-cli                    Launch interactive TUI
	  $ kanboard-cli board              Jump to board view
	  $ kanboard-cli docs               Jump to docs view
	  $ kanboard-cli sprints            Jump to sprints view

	Project Commands
	  $ kanboard-cli init               Initialize a new project
	  $ kanboard-cli status             Show task counts per column
	  $ kanboard-cli config             View/update project settings

	Task Commands
	  $ kanboard-cli task add           Create a new task
	  $ kanboard-cli task list          List all tasks
	  $ kanboard-cli task show <id>     Show task details
	  $ kanboard-cli task update <id>   Update a task (use --sprint to assign)
	  $ kanboard-cli task move <id> <status>  Move task to status
	  $ kanboard-cli task delete <id>   Delete a task

	Checklist Commands
	  $ kanboard-cli task checklist <id> add     Add a checklist item (--text)
	  $ kanboard-cli task checklist <id> toggle  Toggle a checklist item (--index)
	  $ kanboard-cli task checklist <id> remove  Remove a checklist item (--index)

	Sprint Commands
	  $ kanboard-cli sprint add         Create a new sprint
	  $ kanboard-cli sprint list        List all sprints
	  $ kanboard-cli sprint show <id>   Show sprint details + progress
	  $ kanboard-cli sprint update <id> Update a sprint
	  $ kanboard-cli sprint activate <id>  Set the active sprint
	  $ kanboard-cli sprint delete <id> Delete a sprint (tasks → backlog)

	Sprint Milestone Commands
	  $ kanboard-cli sprint milestone add <id>     (--text)
	  $ kanboard-cli sprint milestone toggle <id>  (--index)
	  $ kanboard-cli sprint milestone remove <id>  (--index)

	Doc Commands
	  $ kanboard-cli doc add            Create a new doc
	  $ kanboard-cli doc list           List all docs
	  $ kanboard-cli doc read <path>    Read a doc
	  $ kanboard-cli doc update <path>  Update a doc
	  $ kanboard-cli doc delete <path>  Delete a doc

	Options
	  --name, -n         Name (for init, task add, doc add, sprint add)
	  --description, -d  Description
	  --owner, -o        Task owner
	  --status, -s       Task or sprint status
	  --requirements, -r Requirements (comma-separated)
	  --deadline, -D     Task deadline (YYYY-MM-DD)
	  --sprint, -S       Sprint ID (for task add/update)
	  --start            Sprint start date (YYYY-MM-DD)
	  --end              Sprint end date (YYYY-MM-DD)
	  --text, -T         Checklist/milestone text
	  --index            Checklist/milestone index (0-based)
	  --github-url, -g   GitHub repository URL
	  --path, -p         Doc path
	  --title, -t        Doc title
	  --content, -c      Doc content
	  --json             Output as JSON
	  --flat             Flat list (for doc list)
	  --force, -f        Force action without confirmation
`,
	{
		importMeta: import.meta,
		flags: {
			name: {type: 'string', shortFlag: 'n'},
			description: {type: 'string', shortFlag: 'd'},
			owner: {type: 'string', shortFlag: 'o'},
			status: {type: 'string', shortFlag: 's'},
			requirements: {type: 'string', shortFlag: 'r'},
			deadline: {type: 'string', shortFlag: 'D'},
			sprint: {type: 'string', shortFlag: 'S'},
			start: {type: 'string'},
			end: {type: 'string'},
			text: {type: 'string', shortFlag: 'T'},
			index: {type: 'string'},
			githubUrl: {type: 'string', shortFlag: 'g'},
			path: {type: 'string', shortFlag: 'p'},
			title: {type: 'string', shortFlag: 't'},
			content: {type: 'string', shortFlag: 'c'},
			json: {type: 'boolean', default: false},
			flat: {type: 'boolean', default: false},
			force: {type: 'boolean', shortFlag: 'f', default: false},
		},
	},
);

const [command, subcommand, ...args] = cli.input;

function runCommand(): React.ReactNode | null {
	switch (command) {
		case 'init':
			return initCommand({
				name: cli.flags.name,
				description: cli.flags.description,
				githubUrl: cli.flags.githubUrl,
			});

		case 'status':
			return statusCommand({json: cli.flags.json});

		case 'config':
			return configCommand({
				name: cli.flags.name,
				description: cli.flags.description,
				githubUrl: cli.flags.githubUrl,
			});

		case 'task':
			switch (subcommand) {
				case 'add':
					return taskAddCommand({
						name: cli.flags.name,
						description: cli.flags.description,
						owner: cli.flags.owner,
						status: cli.flags.status,
						requirements: cli.flags.requirements?.split(',').map(r => r.trim()),
						deadline: cli.flags.deadline,
						sprint: cli.flags.sprint,
					});
				case 'list':
					return taskListCommand({
						status: cli.flags.status,
						owner: cli.flags.owner,
						json: cli.flags.json,
					});
				case 'show':
					return taskShowCommand({id: args[0]});
				case 'update':
					return taskUpdateCommand({
						id: args[0],
						name: cli.flags.name,
						description: cli.flags.description,
						owner: cli.flags.owner,
						status: cli.flags.status,
						requirements: cli.flags.requirements?.split(',').map(r => r.trim()),
						deadline: cli.flags.deadline,
						sprint: cli.flags.sprint,
					});
				case 'move':
					return taskMoveCommand({id: args[0], status: args[1]});
				case 'delete':
					return taskDeleteCommand({id: args[0], force: cli.flags.force});
				case 'checklist': {
					const [checklistAction, checklistTaskId] = args;
					const indexFlag =
						cli.flags.index !== undefined ? Number(cli.flags.index) : undefined;
					switch (checklistAction) {
						case 'add':
							return taskChecklistAddCommand({
								id: checklistTaskId,
								text: cli.flags.text,
							});
						case 'toggle':
							return taskChecklistToggleCommand({
								id: checklistTaskId,
								index: indexFlag,
							});
						case 'remove':
							return taskChecklistRemoveCommand({
								id: checklistTaskId,
								index: indexFlag,
							});
						default:
							return React.createElement(
								Text,
								{color: 'red'},
								'Unknown checklist action. Use: add, toggle, remove',
							);
					}
				}
				default:
					return null;
			}

		case 'sprint':
			switch (subcommand) {
				case 'add':
					return sprintAddCommand({
						name: cli.flags.name,
						description: cli.flags.description,
						start: cli.flags.start,
						end: cli.flags.end,
						status: cli.flags.status,
					});
				case 'list':
					return sprintListCommand({json: cli.flags.json});
				case 'show':
					return sprintShowCommand({id: args[0]});
				case 'update':
					return sprintUpdateCommand({
						id: args[0],
						name: cli.flags.name,
						description: cli.flags.description,
						start: cli.flags.start,
						end: cli.flags.end,
						status: cli.flags.status,
					});
				case 'delete':
					return sprintDeleteCommand({
						id: args[0],
						force: cli.flags.force,
					});
				case 'activate':
					return sprintActivateCommand({id: args[0]});
				case 'milestone': {
					const [milestoneAction, milestoneSprintId] = args;
					const milestoneIndex =
						cli.flags.index !== undefined ? Number(cli.flags.index) : undefined;
					switch (milestoneAction) {
						case 'add':
							return sprintMilestoneAddCommand({
								id: milestoneSprintId,
								text: cli.flags.text,
							});
						case 'toggle':
							return sprintMilestoneToggleCommand({
								id: milestoneSprintId,
								index: milestoneIndex,
							});
						case 'remove':
							return sprintMilestoneRemoveCommand({
								id: milestoneSprintId,
								index: milestoneIndex,
							});
						default:
							return React.createElement(
								Text,
								{color: 'red'},
								'Unknown milestone action. Use: add, toggle, remove',
							);
					}
				}
				default:
					return null;
			}

		case 'doc':
			switch (subcommand) {
				case 'add':
					return docAddCommand({
						path: cli.flags.path,
						title: cli.flags.title,
						content: cli.flags.content,
					});
				case 'list':
					return docListCommand({flat: cli.flags.flat, json: cli.flags.json});
				case 'read':
					return docReadCommand({path: args[0]});
				case 'update':
					return docUpdateCommand({
						path: args[0],
						title: cli.flags.title,
						content: cli.flags.content,
					});
				case 'delete':
					return docDeleteCommand({path: args[0], force: cli.flags.force});
				default:
					return null;
			}

		case 'board':
		case 'docs':
		case 'sprints':
		case undefined:
			return null; // Will launch TUI

		default:
			return null;
	}
}

const commandResult = runCommand();

if (commandResult !== null) {
	// Render command output
	render(commandResult);
} else {
	// Launch TUI
	const initialView =
		command === 'docs' ? 'docs' : command === 'sprints' ? 'sprints' : 'board';
	render(<App initialView={initialView} />);
}
