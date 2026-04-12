#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
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
import {docAddCommand} from './commands/doc/add.js';
import {docListCommand} from './commands/doc/list.js';
import {docReadCommand} from './commands/doc/read.js';
import {docUpdateCommand} from './commands/doc/update.js';
import {docDeleteCommand} from './commands/doc/delete.js';

const cli = meow(
	`
	Usage
	  $ kanboard                    Launch interactive TUI
	  $ kanboard board              Jump to board view
	  $ kanboard docs               Jump to docs view

	Project Commands
	  $ kanboard init               Initialize a new project
	  $ kanboard status             Show task counts per column
	  $ kanboard config             View/update project settings

	Task Commands
	  $ kanboard task add           Create a new task
	  $ kanboard task list          List all tasks
	  $ kanboard task show <id>     Show task details
	  $ kanboard task update <id>   Update a task
	  $ kanboard task move <id> <status>  Move task to status
	  $ kanboard task delete <id>   Delete a task

	Doc Commands
	  $ kanboard doc add            Create a new doc
	  $ kanboard doc list           List all docs
	  $ kanboard doc read <path>    Read a doc
	  $ kanboard doc update <path>  Update a doc
	  $ kanboard doc delete <path>  Delete a doc

	Options
	  --name, -n         Name (for init, task add, doc add)
	  --description, -d  Description
	  --owner, -o        Task owner
	  --status, -s       Task status (backlog, todo, in_progress, review, done)
	  --requirements, -r Requirements (comma-separated)
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
					});
				case 'move':
					return taskMoveCommand({id: args[0], status: args[1]});
				case 'delete':
					return taskDeleteCommand({id: args[0], force: cli.flags.force});
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
	const initialView = command === 'docs' ? 'docs' : 'board';
	render(<App initialView={initialView} />);
}
