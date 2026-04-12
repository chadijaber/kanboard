import {Text, Box} from 'ink';
import React from 'react';
import {updateTask} from '../../utils/tasks.js';
import {TaskStatus} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface TaskUpdateOptions {
	id?: string;
	name?: string;
	description?: string;
	owner?: string;
	status?: string;
	requirements?: string[];
}

function parseStatus(status?: string): TaskStatus | undefined {
	if (!status) return undefined;
	const normalized = status.toLowerCase().replace(/-/g, '_');
	if (Object.values(TaskStatus).includes(normalized as TaskStatus)) {
		return normalized as TaskStatus;
	}
	return undefined;
}

export function taskUpdateCommand(options: TaskUpdateOptions): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Task ID is required.');
	}

	const status = parseStatus(options.status);
	if (options.status && !status) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Invalid status: ${options.status}. Valid values: backlog, todo, in_progress, review, done`,
		);
	}

	const hasUpdates =
		options.name !== undefined ||
		options.description !== undefined ||
		options.owner !== undefined ||
		status !== undefined ||
		options.requirements !== undefined;

	if (!hasUpdates) {
		return React.createElement(
			Text,
			{color: 'yellow'},
			'No updates provided. Use --name, --description, --owner, --status, or --requirements',
		);
	}

	try {
		const task = updateTask(options.id, {
			name: options.name,
			description: options.description,
			owner: options.owner,
			status,
			requirements: options.requirements,
		});

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(Text, {color: 'green'}, `Task updated: ${task.name}`),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(task.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
